import type { ComponentProps, ReactNode } from "react";
import { Field, fieldClassName } from "./Input";
import { Icon } from "./Icon";

type SelectProps = Omit<ComponentProps<"select">, "className"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Figma: Design system → Components → Select (3:116). */
export function Select({ label, hint, error, id, className, children, ...selectProps }: SelectProps) {
  return (
    <Field label={label} hint={hint} error={error} id={id} className={className}>
      {({ id: fieldId, describedBy }) => (
        <div className={`relative ${fieldClassName(Boolean(error))}`}>
          <select
            {...selectProps}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="type-body min-w-0 flex-1 appearance-none bg-transparent text-text-primary outline-none"
          >
            {children}
          </select>
          <Icon name="chevron-down-20" className="pointer-events-none shrink-0" />
        </div>
      )}
    </Field>
  );
}
