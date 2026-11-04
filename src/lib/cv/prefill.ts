import type { CvParseResult, StudentDetails } from "@/lib/cv/types";

export interface InitialDetails {
  values: StudentDetails;
  /** Labels of "student details" fields the CV didn't cover (for the notice). */
  notFound: string[];
  /** Roles read from the CV (for the work-history notice). */
  roles: number;
}

/**
 * Details the student sees first: the value read from the CV when there is
 * one, otherwise whatever is already on their profile. A field the CV didn't
 * cover is never guessed. Pass `result = null` for "fill it in yourself".
 */
export function buildInitialDetails(profile: StudentDetails, result: CvParseResult | null): InitialDetails {
  if (!result) return { values: structuredClone(profile), notFound: [], roles: 0 };

  const f = result.fields;
  const pick = (found: string | null, current: string) => (found !== null && found.trim() !== "" ? found : current);

  const cvRoles = f.workHistory.value ?? [];
  const values: StudentDetails = {
    name: pick(f.name.value, profile.name),
    university: pick(f.university.value, profile.university),
    fieldOfStudy: pick(f.fieldOfStudy.value, profile.fieldOfStudy),
    yearOfStudy: pick(f.yearOfStudy.value, profile.yearOfStudy),
    availability: pick(f.availability.value, profile.availability),
    skills: f.skills.value && f.skills.value.length > 0 ? [...f.skills.value] : [...profile.skills],
    workHistory:
      cvRoles.length > 0
        ? cvRoles.map((role) => ({ ...role, id: crypto.randomUUID() }))
        : structuredClone(profile.workHistory),
    motivations: pick(f.motivations.value, profile.motivations),
    goals: pick(f.goals.value, profile.goals),
  };

  const labelled: Array<[string, { status: string }]> = [
    ["Name", f.name],
    ["University", f.university],
    ["Field of study", f.fieldOfStudy],
    ["Year of study", f.yearOfStudy],
    ["Availability", f.availability],
    ["Skills", f.skills],
  ];
  const notFound = labelled.filter(([, field]) => field.status === "not_found").map(([label]) => label);

  return { values, notFound, roles: cvRoles.length };
}

/** "Availability" / "Availability and Skills" / "Name, Availability and Skills" */
export function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}
