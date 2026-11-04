import type { TaskStatus, ApplicationStatus } from "@/types";

type Status = TaskStatus | ApplicationStatus;

const TONE: Record<Status, string> = {
  draft: "bg-[color:var(--color-line)]/60 text-[color:var(--color-ink-muted)]",
  open: "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-hover)]",
  filled: "bg-[color:var(--color-amber-soft)] text-[#8a6500]",
  completed: "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-hover)]",
  cancelled: "bg-[color:var(--color-line)]/60 text-[color:var(--color-ink-muted)]",
  submitted: "bg-[color:var(--color-amber-soft)] text-[#8a6500]",
  shortlisted: "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-hover)]",
  chosen: "bg-[color:var(--color-brand)] text-white",
  rejected: "bg-[color:var(--color-line)]/60 text-[color:var(--color-ink-muted)]",
  withdrawn: "bg-[color:var(--color-line)]/60 text-[color:var(--color-ink-muted)]",
};

const LABEL: Partial<Record<Status, string>> = {
  open: "Open",
  draft: "Draft",
  filled: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  submitted: "Submitted",
  shortlisted: "Shortlisted",
  chosen: "Chosen",
  rejected: "Not chosen",
  withdrawn: "Withdrawn",
};

export function StatusChip({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TONE[status]}`}
    >
      {LABEL[status] ?? status}
    </span>
  );
}
