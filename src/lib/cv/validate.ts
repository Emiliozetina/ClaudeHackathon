import {
  CV_MAX_BYTES,
  GOALS_MAX,
  MOTIVATION_MAX,
  type StudentDetails,
} from "@/lib/cv/types";

/** "%PDF-" at the start of the file. */
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d];

/** Returns an error message, or null if the upload is an acceptable PDF. */
export function validateCvUpload(
  file: { name: string; type: string; size: number },
  head: Uint8Array,
): string | null {
  if (file.size === 0) return "That file is empty.";
  if (file.size > CV_MAX_BYTES) return "Your CV must be 4 MB or smaller.";
  const looksLikePdfType =
    file.type === "application/pdf" || (file.type === "" && file.name.toLowerCase().endsWith(".pdf"));
  if (!looksLikePdfType) return "Please upload your CV as a PDF.";
  if (!PDF_MAGIC.every((byte, i) => head[i] === byte)) return "That file doesn’t look like a PDF.";
  return null;
}

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export interface ParsedDetails {
  value?: StudentDetails;
  /** Field name -> message. */
  errors: Record<string, string>;
}

/** Checks student details sent from the form before they are saved. */
export function parseStudentDetails(input: unknown): ParsedDetails {
  const errors: Record<string, string> = {};
  if (!input || typeof input !== "object") return { errors: { form: "Details are missing." } };
  const d = input as Record<string, unknown>;

  const text = (key: string, label: string, max: number, required: boolean) => {
    const raw = typeof d[key] === "string" ? (d[key] as string).trim() : "";
    if (required && raw.length === 0) errors[key] = `${label} is required.`;
    else if (raw.length > max) errors[key] = `${label} must be ${max} characters or fewer.`;
    return raw;
  };

  const name = text("name", "Full name", 100, true);
  const university = text("university", "University", 100, true);
  const fieldOfStudy = text("fieldOfStudy", "Field of study", 100, true);
  const yearOfStudy = text("yearOfStudy", "Year of study", 40, false);
  const availability = text("availability", "Weekly availability", 40, false);
  const motivations = text("motivations", "Motivation", MOTIVATION_MAX, false);
  const goals = text("goals", "Career goal", GOALS_MAX, false);

  let skills: string[] = [];
  if (!Array.isArray(d.skills) || d.skills.some((s) => typeof s !== "string")) {
    errors.skills = "Skills must be a list of text.";
  } else {
    skills = [...new Set((d.skills as string[]).map((s) => s.trim()).filter(Boolean))];
    if (skills.length > 30) errors.skills = "Add up to 30 skills.";
    else if (skills.some((s) => s.length > 40)) errors.skills = "Each skill must be 40 characters or fewer.";
  }

  const workHistory: StudentDetails["workHistory"] = [];
  if (!Array.isArray(d.workHistory)) {
    errors.workHistory = "Work history must be a list.";
  } else if (d.workHistory.length > 20) {
    errors.workHistory = "Add up to 20 roles.";
  } else {
    for (const raw of d.workHistory) {
      const w = (raw ?? {}) as Record<string, unknown>;
      const title = typeof w.title === "string" ? w.title.trim() : "";
      const organisation = typeof w.organisation === "string" ? w.organisation.trim() : "";
      const startDate = typeof w.startDate === "string" ? w.startDate : "";
      const endDate = typeof w.endDate === "string" && w.endDate !== "" ? w.endDate : undefined;
      if (!title || !organisation || title.length > 100 || organisation.length > 100) {
        errors.workHistory = "Each role needs a job title and an organisation (up to 100 characters).";
        break;
      }
      if (!MONTH.test(startDate) || (endDate !== undefined && !MONTH.test(endDate))) {
        errors.workHistory = "Role dates must be a month and year.";
        break;
      }
      if (endDate !== undefined && endDate < startDate) {
        errors.workHistory = "A role can’t end before it starts.";
        break;
      }
      workHistory.push({
        id: typeof w.id === "string" && w.id ? w.id : "",
        title,
        organisation,
        startDate,
        endDate,
      });
    }
  }

  if (Object.keys(errors).length > 0) return { errors };
  return {
    errors,
    value: {
      name,
      university,
      fieldOfStudy,
      yearOfStudy,
      availability,
      skills,
      workHistory,
      motivations,
      goals,
    },
  };
}
