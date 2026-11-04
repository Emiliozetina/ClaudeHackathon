import type { ComponentProps } from "react";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { MaskIcon } from "./MaskIcon";

export type AuthRole = "business" | "student";

const roleIcon: Record<AuthRole, string> = {
  business: "store-white-28",
  student: "grad-0b2545-28",
};

type RoleCardProps = Omit<ComponentProps<"input">, "type" | "className" | "value"> & {
  value: AuthRole;
  title: string;
  description: string;
  /** The three check lines at the bottom of the card. */
  points: readonly string[];
  className?: string;
};

/**
 * Figma: screen 02 → "Role options" card (440 wide).
 * A radio input styled as a card, so it works inside a plain <form> (pass
 * `name`) or controlled (`checked` + `onChange`). Selected: teal-50 fill,
 * 2px teal border, elevation-2, teal icon tile and a check badge.
 */
export function RoleCard({
  value,
  title,
  description,
  points,
  className,
  ...inputProps
}: RoleCardProps) {
  return (
    <label
      className={cn(
        "group relative flex cursor-pointer flex-col gap-5 rounded-[20px] border border-border-default bg-surface-card p-8",
        "has-[:checked]:border-2 has-[:checked]:border-teal-700 has-[:checked]:bg-teal-50 has-[:checked]:shadow-elevation-2",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-700",
        className,
      )}
    >
      <input {...inputProps} type="radio" value={value} className="sr-only" />

      <span className="flex items-start justify-between">
        <span
          aria-hidden
          className="flex size-14 items-center justify-center rounded-[14px] bg-navy-50 group-has-[:checked]:bg-teal-700"
        >
          <MaskIcon
            src={roleIcon[value]}
            size={28}
            className="bg-navy-900 group-has-[:checked]:bg-text-inverse"
          />
        </span>
        {/* Selection badge: empty ring when unselected, teal check when selected. */}
        <span
          aria-hidden
          className={cn(
            "mt-4 flex size-6 items-center justify-center rounded-pill",
            "border-[1.5px] border-border-default bg-surface-card",
            "group-has-[:checked]:border-0 group-has-[:checked]:bg-teal-700",
          )}
        >
          <Icon name="check-white-14" className="hidden group-has-[:checked]:block" />
        </span>
      </span>

      <span className="type-h3 text-text-primary">{title}</span>
      <span className="type-body text-text-secondary">{description}</span>

      <ul className="flex flex-col gap-2.5">
        {points.map((point) => (
          <li key={point} className="flex items-center gap-2.5">
            <Icon name="check-0e7c7b-16" />
            <span className="type-body-sm text-text-primary">{point}</span>
          </li>
        ))}
      </ul>
    </label>
  );
}

type RoleContinueButtonProps = {
  /** e.g. "Continue as a business". */
  label: string;
  className?: string;
} & (
  | { href: string }
  | {
      href?: undefined;
      type?: "button" | "submit";
      disabled?: boolean;
      onClick?: ComponentProps<"button">["onClick"];
    }
);

/**
 * Figma: screen 02 → primary LG button under the cards (440 × 48, arrow).
 * Pass `href` to render a link, otherwise it is a <button> (e.g. type="submit").
 */
export function RoleContinueButton({ label, className, ...rest }: RoleContinueButtonProps) {
  const classes = cn("w-full max-w-[440px]", className);
  if (rest.href !== undefined) {
    return (
      <Button href={rest.href} size="lg" showArrow className={classes}>
        {label}
      </Button>
    );
  }
  return (
    <Button {...rest} size="lg" showArrow className={classes}>
      {label}
    </Button>
  );
}
