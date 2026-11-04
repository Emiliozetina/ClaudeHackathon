import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "dark" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

/**
 * Figma: Design system → Components → Button (3:50).
 * Primary (teal) = main action per view. Dark (navy) = business emphasis.
 * Secondary = alternative. Ghost = tertiary/inline.
 */
const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-teal-700 text-text-inverse",
  dark: "bg-navy-900 text-text-inverse",
  secondary: "bg-surface-card text-navy-900 border border-border-default",
  ghost: "text-teal-700",
};

const sizeClass: Record<ButtonSize, string> = {
  md: "px-[18px] py-[11px]",
  lg: "px-[26px] py-[15px]",
};

const arrowIcon: Record<ButtonVariant, IconName> = {
  primary: "arrow-right-white",
  dark: "arrow-right-white",
  secondary: "arrow-right-navy",
  ghost: "arrow-right-teal",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  showArrow?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, keyof CommonProps> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, keyof CommonProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: Pick<CommonProps, "variant" | "size" | "className">) {
  return cn(
    "type-button inline-flex items-center justify-center gap-[8px] whitespace-nowrap rounded-md",
    "transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700",
    variantClass[variant],
    sizeClass[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  showArrow = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = buttonClassName({ variant, size, className });
  const content = (
    <>
      {children}
      {showArrow && <Icon name={arrowIcon[variant]} />}
    </>
  );

  if (rest.href !== undefined) {
    return (
      <Link {...(rest as Omit<ButtonAsLink, keyof CommonProps>)} className={classes}>
        {content}
      </Link>
    );
  }

  const { type, ...buttonProps } = rest as Omit<ButtonAsButton, keyof CommonProps>;
  return (
    <button {...buttonProps} type={type ?? "button"} className={classes}>
      {content}
    </button>
  );
}
