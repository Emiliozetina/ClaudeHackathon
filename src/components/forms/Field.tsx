import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-[color:var(--color-ink)]">{label}</span>
      {children}
      {hint ? (
        <span className="text-xs text-[color:var(--color-ink-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}

const baseInput =
  "w-full rounded-xl border border-[color:var(--color-line)] bg-white px-3.5 py-2.5 text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-muted)] shadow-[0_1px_2px_rgba(13,27,42,0.04)] outline-none transition focus:border-[color:var(--color-brand)] focus:ring-2 focus:ring-[color:var(--color-brand)]/15";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseInput} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={`${baseInput} min-h-28 ${props.className ?? ""}`} />
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
  block?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const sizing =
    size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  const variants = {
    primary:
      "bg-[color:var(--color-brand)] text-white shadow-[0_1px_2px_rgba(13,27,42,0.08)] hover:bg-[color:var(--color-brand-hover)]",
    secondary:
      "bg-white text-[color:var(--color-ink)] border border-[color:var(--color-line)] hover:border-[color:var(--color-ink-muted)]",
    ghost:
      "bg-transparent text-[color:var(--color-ink)] hover:bg-black/5",
  }[variant];
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:opacity-60 ${sizing} ${variants} ${block ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function Errors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <ul className="rounded-xl border border-[color:var(--color-danger-soft)] bg-[color:var(--color-danger-soft)]/60 p-3 text-sm text-[color:var(--color-danger)]">
      {errors.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}
