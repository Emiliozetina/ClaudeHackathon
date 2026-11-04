import { Suspense } from "react";
import { RoleGate } from "@/components/demo/RoleGate";
import { AppHeader, Icon } from "@/components/ui";
import { TaskBuilder } from "@/components/tasks/TaskBuilder";

// Figma: Screens → "07a · Post a task — describe it, Claude drafts it" (29:1403).
export default function DescribeTaskPage() {
  return (
    <>
      <AppHeader role="business" account={{ name: "Tyne Brew Café", subtitle: "Business account", initials: "TB" }} />
      <main className="flex w-full flex-col gap-[28px] px-6 pb-[80px] pt-[40px] lg:px-[120px]">
        <div className="flex flex-col gap-[6px]">
          <div className="flex flex-wrap items-center gap-[12px]">
            <h1 className="type-h2 text-text-primary">Post a short-term task</h1>
            <span className="type-label-sm flex items-center gap-[6px] rounded-pill bg-navy-900 px-[10px] py-[5px] text-text-inverse">
              <Icon name="spark-f2a541-14" />
              Claude task builder
            </span>
          </div>
          <p className="type-body text-text-secondary">
            Describe what you need in your own words. Claude turns it into a clear task post — you check and edit
            everything before it goes live.
          </p>
        </div>
        <Suspense fallback={<p className="type-body-sm text-text-secondary">Loading…</p>}>
          <RoleGate role="business">
            <TaskBuilder />
          </RoleGate>
        </Suspense>
      </main>
    </>
  );
}
