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
      <div className="rounded-lg border border-border-subtle bg-surface-card p-7 shadow-elevation-1 sm:p-9">
        {eyebrow ? <p className="type-overline text-teal-700">{eyebrow}</p> : null}
        <h1 className="type-h2 mt-2 text-text-primary">{title}</h1>
        {subtitle ? <p className="type-body mt-2 text-text-secondary">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
      {footer ? <p className="type-body-sm mt-5 text-center text-text-secondary">{footer}</p> : null}
    </div>
  );
}
