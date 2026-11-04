import type { ReactNode } from "react";

interface Props {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}

export function DashboardCard({ title, action, children, padded = true }: Props) {
  return (
    <section className="rounded-2xl border border-[color:var(--color-line)] bg-white shadow-[0_1px_2px_rgba(13,27,42,0.04)]">
      <header className="flex items-center justify-between gap-3 border-b border-[color:var(--color-line)] px-5 py-3.5">
        <h2 className="text-base font-semibold text-[color:var(--color-ink)]">{title}</h2>
        {action}
      </header>
      <div className={padded ? "px-5 py-4" : ""}>{children}</div>
    </section>
  );
}
