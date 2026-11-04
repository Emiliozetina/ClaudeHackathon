import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Avatar } from "./Avatar";
import { Chip, type ChipType } from "./Chip";

type ApplicantRowProps = {
  name: string;
  initials: string;
  /** e.g. "Northumbria University · BA Marketing, Year 3" */
  university: string;
  /** e.g. "3/3 required · 1/2 preferred" */
  match: string;
  /** e.g. "4.9 ★ · 3 tasks" */
  rating?: string;
  status: { label: string; type?: ChipType };
  /** Usually a secondary "View profile" button. */
  action?: ReactNode;
  className?: string;
};

/** Figma: Design system → Components → Applicant row (4:203). */
export function ApplicantRow({
  name,
  initials,
  university,
  match,
  rating,
  status,
  action,
  className,
}: ApplicantRowProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-[16px] border-b border-border-subtle bg-surface-card px-[20px] py-[16px]",
        className,
      )}
    >
      <Avatar initials={initials} tone="teal" size={40} />
      <div className="flex min-w-0 flex-1 flex-col gap-[2px] overflow-hidden">
        <p className="type-label text-text-primary">{name}</p>
        <p className="type-caption text-text-secondary">{university}</p>
      </div>
      <Chip type="teal">{match}</Chip>
      {rating && <p className="type-body-sm whitespace-nowrap text-text-secondary">{rating}</p>}
      <Chip type={status.type ?? "neutral"}>{status.label}</Chip>
      {action}
    </div>
  );
}
