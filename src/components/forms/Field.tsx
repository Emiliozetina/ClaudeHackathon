import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

import { buttonClassName, fieldClassName, type ButtonVariant } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Form primitives for the auth and profile forms, built on the Figma field and
 * button styles in src/components/ui (Input 3:113, Button 3:50). These take a
 * plain control as children, so a label can wrap inputs, textareas and
 * comma-separated lists alike.
 */

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div className="flex w-full flex-col items-start gap-[6px]">
      <label htmlFor={htmlFor} className="type-label text-text-primary">
        {label}
      </label>
      {children}
      {hint ? <p className="type-caption text-text-secondary">{hint}</p> : null}
    </div>
  );
}

const controlClass =
  "type-body min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-muted";

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn(fieldClassName(), className)}>
      <input {...props} className={controlClass} />
    </div>
  );
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={cn(fieldClassName(), "items-start", className)}>
      <textarea {...props} className={cn(controlClass, "min-h-28 resize-y")} />
    </div>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  block?: boolean;
}

/** A form <button> with the Figma Button styles. Use ui/Button for links. */
export function Button({
  variant = "primary",
  size = "md",
  block,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={buttonClassName({ variant, size, className: cn(block && "w-full", className) })}
    >
      {children}
    </button>
  );
}

/** Form-level errors, styled with the Figma status/error tokens. */
export function Errors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <ul role="alert" className="type-body-sm flex flex-col gap-1 rounded-md bg-status-error-bg p-3 text-status-error">
      {errors.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}
