import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChipType =
  | "required"
  | "preferred"
  | "pay"
  | "neutral"
  | "teal"
  | "success"
  | "warning"
  | "error";

/**
 * Figma: Design system → Components → Chip (3:69).
 * Required = solid navy, Preferred = outlined navy, Pay = amber.
 * Status chips for application states.
 */
const typeClass: Record<ChipType, string> = {
  required: "bg-navy-900 text-text-inverse",
  preferred: "border border-navy-900 text-navy-900",
  pay: "bg-amber-100 text-amber-900",
  neutral: "bg-navy-50 text-text-secondary",
  teal: "bg-teal-50 text-teal-800",
  success: "bg-status-success-bg text-status-success",
  warning: "bg-status-warning-bg text-status-warning",
  error: "bg-status-error-bg text-status-error",
};

type ChipProps = {
  type?: ChipType;
  className?: string;
  children: ReactNode;
};

export function Chip({ type = "required", className, children }: ChipProps) {
  return (
    <span
      className={cn(
        "type-label-sm inline-flex items-center whitespace-nowrap rounded-pill px-[10px] py-[5px]",
        typeClass[type],
        className,
      )}
    >
      {children}
    </span>
  );
}
