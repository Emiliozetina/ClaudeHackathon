import type { ReactNode } from "react";
import { Icon } from "@/components/ui";

/** Navy "pre-filled from your CV" notice from the student details frames. */
export function AiBanner({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="note" className="flex items-start gap-3 rounded-lg bg-navy-900 px-5 py-4 text-text-inverse">
      <Icon name="spark-f2a541-20" className="mt-0.5 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="type-label">{title}</p>
        <p className="type-caption">{children}</p>
      </div>
    </div>
  );
}
