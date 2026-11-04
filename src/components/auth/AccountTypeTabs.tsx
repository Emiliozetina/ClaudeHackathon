"use client";

import { cn } from "@/lib/cn";
import { MaskIcon } from "./MaskIcon";
import type { AuthRole } from "./RoleCard";

const tabIcon: Record<AuthRole, string> = {
  business: "store-0b2545-18",
  student: "grad-5b6472-18",
};

export type AccountTypeOption = { value: AuthRole; label: string };

type AccountTypeTabsProps = {
  /** Radio group name, so the choice is submitted with the form. */
  name: string;
  options: readonly AccountTypeOption[];
  /** Accessible name for the group, e.g. "Account type". */
  legend: string;
  /** Controlled value. Pair with onChange. */
  value?: AuthRole;
  /** Uncontrolled initial value. */
  defaultValue?: AuthRole;
  onChange?: (value: AuthRole) => void;
  className?: string;
};

/**
 * Figma: screen 05 → "Account type" (520 × 48).
 * Segmented switch: navy-50 track, 4px inset; the active segment is a white
 * pill with elevation-1 and navy icon, the other is text-secondary.
 * Built on radio inputs, so arrow keys move between the two options.
 */
export function AccountTypeTabs({
  name,
  options,
  legend,
  value,
  defaultValue,
  onChange,
  className,
}: AccountTypeTabsProps) {
  return (
    <fieldset className={cn("flex gap-1 rounded-[12px] bg-navy-50 p-1", className)}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "group type-label flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[9px] text-text-secondary",
            "has-[:checked]:bg-surface-card has-[:checked]:text-text-primary has-[:checked]:shadow-elevation-1",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-700",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            className="sr-only"
            {...(value !== undefined
              ? { checked: value === option.value }
              : { defaultChecked: defaultValue === option.value })}
            onChange={() => onChange?.(option.value)}
          />
          <MaskIcon
            src={tabIcon[option.value]}
            size={18}
            className="bg-text-secondary group-has-[:checked]:bg-navy-900"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
