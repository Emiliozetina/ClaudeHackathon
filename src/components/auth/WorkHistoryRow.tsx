"use client";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

type WorkHistoryRowProps = {
  title: string;
  /** e.g. "Pret A Manger, Newcastle · Jun 2024 – now". */
  detail: string;
  /** Accessible names for the icon buttons, e.g. "Edit Barista · part-time". */
  editLabel: string;
  deleteLabel: string;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Teal-50 icon tile instead of navy-50 (Figma shows the first row this way). */
  highlighted?: boolean;
  className?: string;
};

/**
 * Figma: screen 04b → "Work history" row (520 × 69).
 * Card with 1px border-default, radius 12; 36px briefcase tile, label + caption,
 * 18px edit and delete icon buttons on the right.
 */
export function WorkHistoryRow({
  title,
  detail,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  highlighted = false,
  className,
}: WorkHistoryRowProps) {
  const iconButton =
    "flex size-[26px] items-center justify-center rounded-sm hover:bg-navy-50 focus-visible:outline-2 focus-visible:outline-teal-700";
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[12px] border border-border-default bg-surface-card py-[14px] pl-[14px] pr-[10px]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          highlighted ? "bg-teal-50" : "bg-navy-50",
        )}
      >
        <Icon name="briefcase-0b2545-18" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-label truncate text-text-primary">{title}</span>
        <span className="type-caption truncate text-text-secondary">{detail}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <button type="button" aria-label={editLabel} onClick={onEdit} className={iconButton}>
          <Icon name="edit-5b6472-18" />
        </button>
        <button type="button" aria-label={deleteLabel} onClick={onDelete} className={iconButton}>
          <Icon name="trash-5b6472-18" />
        </button>
      </span>
    </div>
  );
}
