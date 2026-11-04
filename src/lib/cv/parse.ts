import type { CvParseResult } from "@/lib/cv/types";

export interface CvFileInput {
  name: string;
  type: string;
  size: number;
  /** The raw PDF bytes (already validated by validateCvUpload). */
  bytes: Uint8Array;
}

/** Pretend "reading" time so the loading state can be seen and tested. */
const MOCK_DELAY_MS = 900;

/**
 * MOCK. This does NOT read the uploaded file and calls no AI: it returns the
 * sample CV from the NEXA Figma frame ("Amara Okafor") whatever you upload.
 * The result is flagged `mock: true` and the UI says so.
 *
 * TODO(claude-api): replace the body with the real call, keeping this
 * signature and the CvParseResult shape (src/lib/cv/types.ts):
 *   - send `file.bytes` to Claude as a PDF document block
 *   - ask for only what the CV states, a sourceQuote for each value, and
 *     status "not_found" (value null) instead of guessing
 *   - validate the reply against the shape, and handle refusals and errors
 *   - add the SDK, the API key env var and `.env.example` at that point
 */
export async function parseCv(file: CvFileInput): Promise<CvParseResult> {
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
