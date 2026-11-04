import Link from "next/link";
import { AppHeader, Icon } from "@/components/ui";
import { TaskForm } from "@/components/tasks/TaskForm";

// Figma: Screens → "07 · Post a task" (9:464).
export default function NewTaskPage() {
  return (
    <>
      <AppHeader role="business" account={{ name: "Tyne Brew Café", subtitle: "Business account", initials: "TB" }} />
      <main className="flex w-full flex-col gap-[32px] px-6 pb-[80px] pt-[40px] lg:px-[120px]">
        <nav aria-label="Breadcrumb" className="type-body-sm flex items-center gap-[8px]">
          <Link href="/dashboard/business/tasks" className="text-text-secondary hover:text-text-primary">
            My tasks
          </Link>
          <Icon name="chev-6b7280-14" />
          <span className="text-text-primary">New task</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-[6px]">
            <h1 className="type-h2 text-text-primary">Post a short-term task</h1>
            <p className="type-body text-text-secondary">
              Be clear about the work, the skills you need and the pay — it gets you better applicants, faster.
            </p>
          </div>
          <p className="type-caption text-text-secondary">Draft saved 2 min ago</p>
        </div>
        <TaskForm />
      </main>
    </>
  );
}
