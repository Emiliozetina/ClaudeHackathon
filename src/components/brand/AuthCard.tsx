import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ eyebrow, title, subtitle, children, footer }: Props) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-[color:var(--color-line)] bg-white p-7 shadow-[0_1px_2px_rgba(13,27,42,0.04)] sm:p-9">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brand)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-ink)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">{subtitle}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
      {footer ? (
        <p className="mt-5 text-center text-sm text-[color:var(--color-ink-muted)]">
          {footer}
        </p>
      ) : null}
    </div>
  );
}
