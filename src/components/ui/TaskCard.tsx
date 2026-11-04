import Link from "next/link";
import { cn } from "@/lib/cn";
import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { Icon } from "./Icon";

type TaskCardProps = {
  href?: string;
  company: string;
  companyInitials: string;
  /** e.g. "Gateshead · Posted 2 days ago" */
  location: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  /** e.g. "£13.50/hr". Pay is always visible. */
  pay: string;
  /** e.g. "2 weeks · 10 hrs/week" */
  duration: string;
  /** e.g. "You meet 2 of 2 required" */
  match?: string;
  saved?: boolean;
  onToggleSave?: () => void;
  className?: string;
};

/**
 * Figma: Design system → Components → Task card (4:103).
 * Feed card. Required skills = solid chips, preferred = outlined. Pay always visible.
 */
export function TaskCard({
  href,
  company,
  companyInitials,
  location,
  title,
  description,
  requiredSkills,
  preferredSkills = [],
  pay,
  duration,
  match,
  onToggleSave,
  saved = false,
  className,
}: TaskCardProps) {
  return (
    <article
      className={cn(
        "relative flex flex-col items-start gap-[16px] rounded-lg border border-border-subtle bg-surface-card p-[24px] shadow-elevation-1",
        className,
      )}
    >
      <div className="flex w-full items-center gap-[12px]">
        <Avatar initials={companyInitials} tone="navy" size={40} />
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <p className="type-label text-text-primary">{company}</p>
          <p className="flex items-center gap-[4px]">
            <Icon name="map-pin" />
            <span className="type-caption text-text-secondary">{location}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save task"}
          className="relative z-10 rounded-pill border border-border-subtle p-[8px]"
        >
          <Icon name="bookmark" />
        </button>
      </div>

      <h3 className="type-h4 w-full text-text-primary">
        {href ? (
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>
      <p className="type-body-sm w-full text-text-secondary">{description}</p>

      <div className="flex w-full flex-wrap gap-[8px]">
        {requiredSkills.map((s) => (
          <Chip key={`r-${s}`} type="required">
            {s}
          </Chip>
        ))}
        {preferredSkills.map((s) => (
          <Chip key={`p-${s}`} type="preferred">
            {s}
          </Chip>
        ))}
      </div>

      <div className="h-px w-full bg-border-subtle" />

      <div className="flex w-full flex-wrap items-center gap-x-[16px] gap-y-[8px]">
        <Chip type="pay">{pay}</Chip>
        <span className="flex items-center gap-[6px]">
          <Icon name="clock" />
          <span className="type-body-sm text-text-secondary">{duration}</span>
        </span>
        {match && (
          <span className="flex items-center gap-[6px]">
            <Icon name="target" />
            <span className="type-label-sm text-teal-700">{match}</span>
          </span>
        )}
      </div>
    </article>
  );
}
