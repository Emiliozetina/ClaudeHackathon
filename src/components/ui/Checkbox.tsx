import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type CheckboxProps = Omit<ComponentProps<"input">, "type" | "className"> & {
  label: ReactNode;
  className?: string;
};

/**
 * Figma: Design system → Components → Checkbox (3:132).
 * Box 20px, radius 6. Checked: teal-700 with a 14px check. Unchecked: card + 1.5px border.
 */
export function Checkbox({ label, className, ...inputProps }: CheckboxProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-[10px]", className)}>
      <input {...inputProps} type="checkbox" className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          "flex size-[20px] shrink-0 items-center justify-center rounded-sm border-[1.5px] border-border-default bg-surface-card",
          "peer-checked:border-teal-700 peer-checked:bg-teal-700 peer-checked:[&>img]:block",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-700",
        )}
      >
        <Icon name="check" className="hidden" />
      </span>
      <span className="type-body-sm text-text-primary">{label}</span>
    </label>
  );
}
