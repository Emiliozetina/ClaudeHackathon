import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string;
  /** e.g. "+1 this week" */
  delta?: string;
  className?: string;
};

/** Figma: Design system → Components → Stat card (4:146). */
export function StatCard({ label, value, delta, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-start gap-[8px] rounded-lg border border-border-subtle bg-surface-card p-[20px]",
        className,
      )}
    >
      <p className="type-body-sm text-text-secondary">{label}</p>
      <p className="font-heading text-[31px] font-bold leading-[1.2] tracking-[-0.5px] text-text-primary">
        {value}
      </p>
      {delta && <p className="type-caption text-status-success">{delta}</p>}
    </div>
  );
}
