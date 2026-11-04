import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

import {
  AVAILABILITY_OPTIONS,
  UNIVERSITIES,
  YEARS_OF_STUDY,
  type CvField,
  type CvParseResult,
  type CvWorkItem,
} from "@/lib/cv/types";

export interface CvFileInput {
  name: string;
  type: string;
  size: number;
  /** The raw PDF bytes (already validated by validateCvUpload). */
  bytes: Uint8Array;
}

/** A CV could not be read. `message` is safe to show to the student. */
export class CvParseError extends Error {
  constructor(
    message: string,
    /** HTTP status for the API route: 500 = not configured, 502 = Claude failed. */
    public status: 500 | 502 = 502,
  ) {
    super(message);
    this.name = "CvParseError";
  }
}

/**
 * Reads the student's CV with Claude. Every value comes with the CV line it was
 * read from; anything the CV doesn't state comes back "not_found" so the
 * student fills it in. Nothing is saved here.
 *
 * Without ANTHROPIC_API_KEY (or with CV_PARSE_MOCK=true) it returns the Figma
 * sample instead, flagged `mock: true` so the UI says so. In production a
 * missing key is an error rather than a silent sample.
 */
export async function parseCv(file: CvFileInput): Promise<CvParseResult> {
  if (process.env.CV_PARSE_MOCK === "true") return mockCv(file);
  if (!process.env.ANTHROPIC_API_KEY) {
    if (process.env.NODE_ENV !== "production") return mockCv(file);
    throw new CvParseError("Reading CVs isn’t set up on this server yet. You can fill your details in yourself.", 500);
  }

  let response;
  try {
    const client = new Anthropic();
    response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 8000,
      output_config: { effort: "low", format: zodOutputFormat(CvExtractionSchema) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: Buffer.from(file.bytes).toString("base64"),
              },
            },
            { type: "text", text: "Read this CV and fill in the fields." },
          ],
        },
      ],
    });
  } catch (error) {
    console.error("[cv] Claude request failed", error instanceof Anthropic.APIError ? error.status : error);
    throw new CvParseError("Claude couldn’t read your CV just now. Try again, or fill your details in yourself.");
  }

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    console.error("[cv] no usable output", response.stop_reason);
    throw new CvParseError("Claude couldn’t read this CV. Try another PDF, or fill your details in yourself.");
  }

  return toResult(file.name, response.parsed_output);
}

// --- Claude ---------------------------------------------------------------

const textField = z.object({ value: z.string().nullable(), sourceQuote: z.string().nullable() });

const CvExtractionSchema = z.object({
  name: textField,
  university: textField,
  fieldOfStudy: textField,
  yearOfStudy: textField,
  skills: z.object({ value: z.array(z.string()).nullable(), sourceQuote: z.string().nullable() }),
  workHistory: z.object({
    value: z
      .array(
        z.object({
          title: z.string(),
          organisation: z.string(),
          startDate: z.string(),
          endDate: z.string().nullable(),
        }),
      )
      .nullable(),
    sourceQuote: z.string().nullable(),
  }),
  motivations: textField,
  goals: textField,
  availability: textField,
});

type CvExtraction = z.infer<typeof CvExtractionSchema>;

const list = (options: readonly string[]) => options.map((o) => `"${o}"`).join(", ");

const SYSTEM = `You read a university student's CV and pull out the details for their profile on a platform that matches students with short-term paid work at North East England businesses.

Only use what the CV actually states. Never infer, guess or fill gaps from general knowledge. If the CV doesn't state something, set value to null and sourceQuote to null. A wrong value is worse than a missing one: the student will fill missing fields in themselves.

For every value you do give, sourceQuote must be a short passage copied exactly from the CV that the value comes from (under 120 characters). For skills, where the evidence is spread out, sourceQuote may instead briefly say where they came from, such as "skills section and role descriptions".

Fields:
- name: the student's full name.
- university: if it is one of ${list(UNIVERSITIES)}, use that exact name; otherwise write it as the CV does.
- fieldOfStudy: the degree and subject, e.g. "BA (Hons) Marketing".
- yearOfStudy: one of ${list(YEARS_OF_STUDY)}, only if the CV states the year or gives course dates that make it unambiguous. Otherwise null.
- skills: short skill names (e.g. "Canva", "Excel", "Customer service"), at most 12, taken from a skills section or clearly shown in roles.
- workHistory: jobs, volunteering and society roles, most recent first. startDate and endDate as "YYYY-MM"; if only a year is given use "YYYY-01". endDate is null if the role is current or no end is given. If there are no roles, value is null.
- motivations: why the student wants work experience, only if the CV has a personal statement or profile saying so.
- goals: career goals, only if the CV states them.
- availability: one of ${list(AVAILABILITY_OPTIONS)}, only if the CV states weekly availability. Otherwise null.`;

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

function field<T>(value: T | null, sourceQuote: string | null, sourceKind: "quote" | "section" = "quote"): CvField<T> {
  const empty = value === null || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0);
  // A value with no evidence from the CV counts as not found.
  if (empty || !sourceQuote?.trim()) return { status: "not_found", value: null, sourceQuote: null, sourceKind: "quote" };
  return { status: "found", value, sourceQuote: sourceQuote.trim(), sourceKind };
}

function text(f: { value: string | null; sourceQuote: string | null }): CvField<string> {
  return field(f.value?.trim() || null, f.sourceQuote);
}

function toResult(fileName: string, x: CvExtraction): CvParseResult {
  const roles: CvWorkItem[] = (x.workHistory.value ?? [])
    .filter((r) => r.title.trim() && r.organisation.trim())
    .map((r) => ({
      title: r.title.trim(),
      organisation: r.organisation.trim(),
      // A malformed date is left blank for the student rather than guessed.
      startDate: MONTH.test(r.startDate) ? r.startDate : "",
      ...(r.endDate && MONTH.test(r.endDate) ? { endDate: r.endDate } : {}),
    }));
  const skills = [...new Set((x.skills.value ?? []).map((s) => s.trim()).filter(Boolean))].slice(0, 12);
  const skillsQuote = x.skills.sourceQuote;

  return {
    fileName,
    mock: false,
    fields: {
      name: text(x.name),
      university: text(x.university),
      fieldOfStudy: text(x.fieldOfStudy),
      yearOfStudy: text(x.yearOfStudy),
      skills: field(skills, skillsQuote, skillsQuote && /section|description/i.test(skillsQuote) ? "section" : "quote"),
      workHistory: field(roles, x.workHistory.sourceQuote),
      motivations: text(x.motivations),
      goals: text(x.goals),
      availability: text(x.availability),
    },
  };
}

// --- Mock (no API key in development, or CV_PARSE_MOCK=true) --------------

/** Pretend "reading" time so the loading state can be seen and tested. */
const MOCK_DELAY_MS = 900;

/**
 * Does NOT read the uploaded file: returns the sample CV from the NEXA Figma
 * frame ("Amara Okafor") whatever you upload, flagged `mock: true`.
 */
async function mockCv(file: CvFileInput): Promise<CvParseResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const quote = <T,>(value: T, sourceQuote: string, sourceKind: "quote" | "section" = "quote") => ({
    status: "found" as const,
    value,
    sourceQuote,
    sourceKind,
  });
  const notFound = <T,>() => ({
    status: "not_found" as const,
    value: null as T | null,
    sourceQuote: null,
    sourceKind: "quote" as const,
  });

  const degreeLine = "Northumbria University, BA (Hons) Marketing, 2024–2027";
  return {
    fileName: file.name,
    mock: true,
    fields: {
      name: quote("Amara Okafor", "Amara Okafor"),
      university: quote("Northumbria University", degreeLine),
      fieldOfStudy: quote("BA (Hons) Marketing", degreeLine),
      yearOfStudy: quote("Year 3", degreeLine),
      skills: quote(
        ["Canva", "Instagram", "Copywriting", "Customer service"],
        "skills section and role descriptions",
        "section",
      ),
      workHistory: quote(
        [
          {
            title: "Social media lead (volunteer)",
            organisation: "Northumbria Marketing Society",
            startDate: "2025-09",
          },
          { title: "Barista (part-time)", organisation: "Pret A Manger, Newcastle", startDate: "2024-06" },
        ],
        "Social Media Lead, Northumbria Marketing Society” · “Barista, Pret A Manger",
      ),
      motivations: notFound(),
      goals: notFound(),
      availability: notFound(),
    },
  };
}
