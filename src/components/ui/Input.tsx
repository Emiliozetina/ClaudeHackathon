import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Shared field styles. Figma: Input (3:113) and Select (3:116).
 * Default/Filled: 1px border/default. Focus: 2px teal-700. Error: 1px status/error.
 * The 2px focus border is drawn as 1px border + 1px inset shadow so the field
 * does not change size when focused.
 */
export function fieldClassName(error?: boolean) {
  return cn(
    "flex w-full items-center gap-[8px] overflow-hidden rounded-md border bg-surface-card px-[14px] py-[12px]",
    error
      ? "border-status-error"
      : "border-border-default focus-within:border-teal-700 focus-within:shadow-[inset_0_0_0_1px_var(--color-teal-700)]",
  );
}

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  /** Error message. Shows the error state when set. */
  error?: ReactNode;
  id?: string;
  className?: string;
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
};

/** Label + control + hint/error, laid out as in Figma (6px gaps). */
export function Field({ label, hint, error, id, className, children }: FieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const messageId = `${fieldId}-message`;
  const message = error ?? hint;
  return (
    <div className={cn("flex w-full flex-col items-start gap-[6px]", className)}>
      <label htmlFor={fieldId} className="type-label text-text-primary">
        {label}
      </label>
      {children({ id: fieldId, describedBy: message ? messageId : undefined })}
      {message && (
        <p
          id={messageId}
          className={cn("type-caption", error ? "text-status-error" : "text-text-secondary")}
        >
          {message}
        </p>
      )}
    </div>
  );
}

type InputProps = Omit<ComponentProps<"input">, "className"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
};

export function Input({ label, hint, error, id, className, ...inputProps }: InputProps) {
  return (
    <Field label={label} hint={hint} error={error} id={id} className={className}>
      {({ id: fieldId, describedBy }) => (
        <div className={fieldClassName(Boolean(error))}>
          <input
            {...inputProps}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="type-body min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
      )}
    </Field>
  );
}
