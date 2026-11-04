import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { CvField, CvParseResult } from "@/lib/cv/types";
import { Icon } from "@/components/ui";

interface Row {
  key: string;
  label: string;
  field: Pick<CvField<unknown>, "status" | "sourceQuote" | "sourceKind">;
  /** Shown after the label when found. */
  summary: string;
  /** Shown under the label when not found. */
  missingHint: string;
}

function buildRows({ fields }: CvParseResult): Row[] {
  const study = [fields.fieldOfStudy.value, fields.yearOfStudy.value].filter(Boolean).join(", ");
  const roles = fields.workHistory.value?.length ?? 0;
  // One row for both: it's "found" if either was read from the CV.
  const motivationFound = fields.motivations.status === "found" || fields.goals.status === "found";
  const motivationSource = fields.motivations.status === "found" ? fields.motivations : fields.goals;
  return [
    {
      key: "fieldOfStudy",
      label: "Field of study",
      field: fields.fieldOfStudy,
      summary: study,
      missingHint: "You’ll add this on the next step",
    },
    {
      key: "workHistory",
      label: "Work history",
      field: fields.workHistory,
      summary: `${roles} ${roles === 1 ? "role" : "roles"}`,
      missingHint: "You’ll add your experience on the next step",
    },
    {
      key: "skills",
      label: "Skills",
      field: fields.skills,
      summary: (fields.skills.value ?? []).join(", "),
      missingHint: "You’ll add your skills on the next step",
    },
    {
      key: "motivation",
      label: "Motivation & career goal",
      field: { ...motivationSource, status: motivationFound ? "found" : "not_found" },
      summary: [fields.motivations.value, fields.goals.value].filter(Boolean).join(" · "),
      missingHint: "You’ll add these in your own words on the next step",
    },
    {
      key: "availability",
      label: "Weekly availability",
      field: fields.availability,
      summary: fields.availability.value ?? "",
      missingHint: "Please add it — Claude won’t guess",
    },
  ];
}

function Source({ field }: { field: Row["field"] }) {
  if (!field.sourceQuote) return null;
  return (
    <p className="type-caption text-text-secondary">
      From CV: {field.sourceKind === "quote" ? `“${field.sourceQuote}”` : field.sourceQuote}
    </p>
  );
}

/** "Here's what Claude found": each value next to the CV line it came from. */
export function CvFindings({ result }: { result: CvParseResult }): ReactNode {
  return (
    <section
      aria-labelledby="cv-findings-title"
      className="flex flex-col gap-[14px] rounded-lg border-2 border-teal-700 bg-surface-card p-[22px]"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 id="cv-findings-title" className="type-h4 text-text-primary">
          Here’s what Claude found
        </h3>
        <span className="type-label-sm inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill bg-navy-900 px-2.5 py-1.5 text-text-inverse">
          <Icon name="spark-f2a541-14" />
          Read by Claude
        </span>
      </div>

      {result.mock && (
        <p role="note" className="type-caption rounded-md bg-status-warning-bg p-3 text-status-warning">
          Demo mode: Claude isn’t connected yet, so this is a sample result and your file wasn’t read.
        </p>
      )}

      <ul className="flex flex-col gap-3.5">
        {buildRows(result).map((row) => {
          const found = row.field.status === "found";
          return (
            <li key={row.key} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-[8.5px] flex size-[22px] shrink-0 items-center justify-center rounded-pill",
                  found ? "bg-status-success-bg" : "bg-status-warning-bg",
                )}
              >
                <Icon name={found ? "check-16774a-12" : "alert-8a5300-12"} />
              </span>
              <div className="flex min-w-0 flex-col">
                <p className="type-label text-text-primary">
                  {row.label} · {found ? row.summary : "not found"}
                </p>
                {found ? (
                  <Source field={row.field} />
                ) : (
                  <p className="type-caption text-text-secondary">{row.missingHint}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
