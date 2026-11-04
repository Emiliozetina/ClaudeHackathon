import { STATUS_LABELS } from "@/components/engagements/format";
import type { EngagementStatus } from "@/types";

export function StatusBadge({ status }: { status: EngagementStatus }) {
  return (
    <span className="inline-block rounded-full border border-black/10 px-2 py-0.5 text-xs font-medium dark:border-white/10">
      {STATUS_LABELS[status]}
    </span>
  );
}
