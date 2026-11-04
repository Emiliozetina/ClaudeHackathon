import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  hint?: ReactNode;
  tone?: "default" | "brand" | "amber";
}

export function KpiTile({ label, value, hint, tone = "default" }: Props) {
  const valueTone =
    tone === "brand"
      ? "text-[color:var(--color-brand-hover)]"
      : tone === "amber"
        ? "text-[color:var(--color-ink)]"
        : "text-[color:var(--color-ink)]";
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[color:var(--color-line)] bg-white p-4 shadow-[0_1px_2px_rgba(13,27,42,0.04)]">
      <span className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--color-ink-muted)]">
        {label}
      </span>
      <span className={`text-3xl font-semibold tracking-tight ${valueTone}`}>{value}</span>
      {hint ? (
        <span className="text-xs text-[color:var(--color-ink-muted)]">{hint}</span>
      ) : null}
    </div>
  );
}
