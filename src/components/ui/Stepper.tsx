import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type StepperProps = {
  /** 1-based index of the current step. */
  current: number;
  steps?: string[];
  className?: string;
};

/**
 * Figma: Design system → Components → Stepper (4:200).
 * Done = teal-700 dot with check. Current = navy-900 dot. Upcoming = outlined dot, muted label.
 */
export function Stepper({ current, steps = ["Account", "Details", "Profile"], className }: StepperProps) {
  return (
    <ol className={cn("flex items-center gap-[12px]", className)}>
      {steps.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const isCurrent = step === current;
        return (
          <Fragment key={label}>
            {i > 0 && (
              <li
                aria-hidden
                className={cn(
                  "h-[2px] w-[48px] shrink-0 rounded-[1px]",
                  step <= current ? "bg-teal-700" : "bg-border-default",
                )}
              />
            )}
            <li
              aria-current={isCurrent ? "step" : undefined}
              className="flex shrink-0 items-center gap-[8px]"
            >
              <span
                className={cn(
                  "type-label-sm flex size-[28px] items-center justify-center rounded-pill",
                  done && "bg-teal-700",
                  isCurrent && "bg-navy-900 text-text-inverse",
                  !done && !isCurrent && "border-[1.5px] border-border-default bg-surface-card text-text-secondary",
                )}
              >
                {done ? <Icon name="check" label="Done" /> : step}
              </span>
              <span
                className={cn(
                  "type-label whitespace-nowrap",
                  step <= current ? "text-text-primary" : "text-text-muted",
                )}
              >
                {label}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
