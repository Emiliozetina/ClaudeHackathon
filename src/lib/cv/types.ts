import type { WorkHistoryItem } from "@/types";

/** Largest CV we accept. Vercel's request body limit is 4.5 MB. */
export const CV_MAX_BYTES = 4 * 1024 * 1024;

export type CvFieldStatus = "found" | "not_found";

/**
 * One value read from the CV. `not_found` means the CV doesn't say: value and
 * sourceQuote are null and the student fills it in themselves (never guessed).
 */
export interface CvField<T> {
  status: CvFieldStatus;
  value: T | null;
  /** The CV text the value came from, shown next to it ("From CV: ..."). */
  sourceQuote: string | null;
  /** "quote" = an exact line from the CV, "section" = a description of where it came from. */
  sourceKind: "quote" | "section";
}

/** A role read from the CV. Dates are "YYYY-MM"; no endDate means "now". */
export interface CvWorkItem {
  title: string;
  organisation: string;
  startDate: string;
  endDate?: string;
}

export interface CvParseResult {
  fileName: string;
  /**
   * True while `parseCv` is the local mock (no AI is called and the uploaded
   * file is NOT read). The UI shows a notice whenever this is true.
   */
  mock: boolean;
  fields: {
    name: CvField<string>;
    university: CvField<string>;
    fieldOfStudy: CvField<string>;
    yearOfStudy: CvField<string>;
    skills: CvField<string[]>;
    workHistory: CvField<CvWorkItem[]>;
    motivations: CvField<string>;
    goals: CvField<string>;
    availability: CvField<string>;
  };
}

/** The editable student details. Mirrors the Student type (src/types). */
export interface StudentDetails {
  name: string;
  university: string;
  fieldOfStudy: string;
  yearOfStudy: string;
  availability: string;
  skills: string[];
  workHistory: Array<Pick<WorkHistoryItem, "title" | "organisation" | "startDate" | "endDate"> & { id: string }>;
  motivations: string;
  goals: string;
}

export type SaveResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const MOTIVATION_MAX = 500;
export const GOALS_MAX = 200;

export const UNIVERSITIES = [
  "Newcastle University",
  "Northumbria University",
  "Durham University",
  "Sunderland University",
  "Teesside University",
] as const;

export const YEARS_OF_STUDY = ["Year 1", "Year 2", "Year 3", "Year 4", "Postgraduate"] as const;

export const AVAILABILITY_OPTIONS = [
  "Under 5 hrs/week",
  "5–10 hrs/week",
  "10–15 hrs/week",
  "15–20 hrs/week",
  "20+ hrs/week",
] as const;
