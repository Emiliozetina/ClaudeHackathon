import Link from "next/link";
import { Suspense } from "react";
import { HeaderFor, initialsOf } from "@/app/students/[id]/student-header";
import { Avatar, Button, Chip, Icon, type AvatarTone, type ChipType } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { store } from "@/lib/store";
import { formatPay, listOpenTasks } from "@/lib/tasks";
import type { Application, ApplicationStatus, Business, Engagement, Task } from "@/types";

// Figma: Screens → "11 · My applications" (11:827).

type Tab = "active" | "completed" | "withdrawn";
const TABS: { key: Tab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "withdrawn", label: "Withdrawn" },
];

const TONES: AvatarTone[] = ["navy", "amber", "teal"];
const STEPS = ["Applied", "Viewed", "Shortlisted", "Chosen"];

/** How many progress steps are done for each status. "Viewed" has no status of its own yet. */
const STEPS_DONE: Record<ApplicationStatus, number> = {
  submitted: 1,
  shortlisted: 3,
  chosen: 4,
  rejected: 0,
  withdrawn: 0,
};

const STATUS_CHIP: Record<ApplicationStatus, { type: ChipType; label: string }> = {
  submitted: { type: "neutral", label: "Applied" },
  shortlisted: { type: "teal", label: "Shortlisted" },
  chosen: { type: "success", label: "Chosen" },
  rejected: { type: "error", label: "Not selected" },
  withdrawn: { type: "neutral", label: "Withdrawn" },
};

const dayMonth = (iso: string, weekday = false) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: weekday ? "short" : undefined,
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(iso));

type Row = {
  application: Application;
  task: Task;
  business?: Business;
  engagement?: Engagement;
};

function tabOf({ application, engagement }: Row): Tab {
  if (application.status === "withdrawn") return "withdrawn";
  if (engagement && (engagement.status === "paid" || engagement.status === "reviewed"))
    return "completed";
  return "active";
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentApplicationsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={null}>
      {searchParams.then((sp) => (
        <Applications tab={sp.tab} />
      ))}
    </Suspense>
  );
}

async function Applications({ tab: tabParam }: { tab?: string | string[] }) {
  const user = await getCurrentUser();
  const student = store.students.find((s) => s.userId === user.id);
  const tab: Tab = TABS.some((t) => t.key === tabParam) ? (tabParam as Tab) : "active";

  const rows: Row[] = student
    ? store.applications
        .filter((a) => a.studentId === student.id)
        .flatMap((application) => {
          const task = store.tasks.find((t) => t.id === application.taskId);
          if (!task) return [];
          return [
            {
              application,
              task,
              business: store.businesses.find((b) => b.id === task.businessId),
              engagement: store.engagements.find(
                (e) => e.taskId === task.id && e.studentId === application.studentId,
              ),
            },
          ];
        })
        .sort((a, b) => b.application.submittedAt.localeCompare(a.application.submittedAt))
    : [];

  const counts = { active: 0, completed: 0, withdrawn: 0 };
  for (const row of rows) counts[tabOf(row)]++;
  const visible = rows.filter((row) => tabOf(row) === tab);

  // Banner for the newest chosen application whose work has not been signed off yet.
  const chosen = rows.find(
    (r) => r.application.status === "chosen" && (!r.engagement || r.engagement.status === "active"),
  );

  return (
    <>
      <HeaderFor user={user} />
      <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-[32px] px-[20px] pt-[40px] pb-[80px]">
        <div className="flex flex-col gap-[6px]">
          <h1 className="type-h2 text-text-primary">My applications</h1>
          <p className="type-body text-text-secondary">
            Track where each application is — you’ll always hear back.
          </p>
        </div>

        {!student ? (
          <div className="flex flex-col gap-[12px] rounded-lg border border-border-subtle bg-surface-card p-[24px]">
            <p className="type-body text-text-secondary">
              Applications belong to student accounts. Pick a student in the demo bar at the top of the page.
            </p>
          </div>
        ) : (
          <>
            {chosen && <ChosenBanner row={chosen} />}

            <nav className="flex gap-[32px] border-b border-border-subtle" aria-label="Application status">
              {TABS.map((t) => (
                <Link
                  key={t.key}
                  href={t.key === "active" ? "?" : `?tab=${t.key}`}
                  aria-current={t.key === tab ? "page" : undefined}
                  className={cn(
                    "type-label -mb-px border-b-2 pb-[12px]",
                    t.key === tab
                      ? "border-teal-700 text-teal-700"
                      : "border-transparent text-text-secondary hover:text-text-primary",
                  )}
                >
                  {t.label} ({counts[t.key]})
                </Link>
              ))}
            </nav>

            <ul className="flex flex-col gap-[16px]">
              {visible.length === 0 && (
                <li className="type-body-sm rounded-lg border border-border-subtle bg-surface-card p-[24px] text-text-secondary">
                  Nothing here yet.{" "}
                  <Link href="/tasks" className="type-label text-teal-700">
                    Find work
                  </Link>
                </li>
              )}
              {visible.map((row, i) => (
                <ApplicationCard key={row.application.id} row={row} tone={TONES[i % TONES.length]} />
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}

function ChosenBanner({ row }: { row: Row }) {
  const { task, business, engagement } = row;
  const thread = engagement && store.threads.find((t) => t.engagementId === engagement.id);
  const starts = engagement?.agreedStartDate ?? task.startDate;
  return (
    <section className="flex flex-wrap items-center gap-[20px] rounded-lg bg-navy-900 p-[24px]">
      <span className="flex size-[52px] shrink-0 items-center justify-center rounded-md bg-amber-500">
        <Icon name="party-633806-26" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <p className="type-h4 text-text-inverse">
          Good news — {business?.name ?? "the business"} chose you!
        </p>
        <p className="type-body-sm text-navy-100">
          {task.title} · starts {dayMonth(starts, true)} · {formatPay(task)}.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-[20px]">
        <Button
          variant="secondary"
          size="lg"
          href={engagement ? `/engagements/${engagement.id}` : `/tasks/${task.id}`}
        >
          View details
        </Button>
        <Button size="lg" showArrow href={thread ? `/messages/${thread.id}` : "/messages"}>
          Confirm &amp; message
        </Button>
      </div>
    </section>
  );
}

function ApplicationCard({ row, tone }: { row: Row; tone: AvatarTone }) {
  const { application, task, business } = row;
  const chip = STATUS_CHIP[application.status];
  const businessName = business?.name ?? "Business";

  return (
    <li className="flex flex-col gap-[20px] rounded-lg border border-border-subtle bg-surface-card p-[24px]">
      <div className="flex items-center gap-[16px]">
        <Avatar initials={initialsOf(businessName)} tone={tone} size={40} />
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <Link href={`/tasks/${task.id}`} className="type-label text-text-primary hover:underline">
            {task.title}
          </Link>
          <p className="type-caption text-text-secondary">
            {businessName} · {formatPay(task)} · Applied {dayMonth(application.submittedAt)}
          </p>
        </div>
        <Chip type={chip.type}>{chip.label}</Chip>
        <Link
          href={`/tasks/${task.id}`}
          aria-label={`Open ${task.title}`}
          className="rounded-pill p-[2px]"
        >
          <Icon name="more-5b6472-20" />
        </Link>
      </div>

      {application.status === "rejected" ? (
        <NotChosen businessName={businessName} task={task} />
      ) : (
        <Progress done={STEPS_DONE[application.status]} />
      )}
    </li>
  );
}

function Progress({ done }: { done: number }) {
  // Figma: a fully chosen application uses success green; in-progress ones use teal.
  const fill = done === STEPS.length ? "bg-status-success" : "bg-teal-700";
  return (
    <ol className="flex items-center gap-[8px]" aria-label="Application progress">
      {STEPS.map((step, i) => {
        const isDone = i < done;
        return (
          <li key={step} className={cn("flex items-center gap-[8px]", i > 0 && "flex-1")}>
            {i > 0 && (
              <span
                aria-hidden
                className={cn("h-[2px] flex-1 rounded-pill", isDone ? fill : "bg-border-subtle")}
              />
            )}
            <span
              className={cn(
                "flex size-[22px] shrink-0 items-center justify-center rounded-pill",
                isDone ? fill : "border-[1.5px] border-border-default bg-surface-card",
              )}
            >
              {isDone && <Icon name="check-white-12" />}
            </span>
            <span
              className={cn(
                "type-label-sm whitespace-nowrap",
                isDone ? "text-text-primary" : "text-text-muted",
              )}
            >
              {step}
              <span className="sr-only">{isDone ? " (done)" : " (not yet)"}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function NotChosen({ businessName, task }: { businessName: string; task: Task }) {
  const skill = task.requirements[0];
  const similar = listOpenTasks(skill ? { skill } : {}).filter((t) => t.id !== task.id).length;
  return (
    <div className="flex flex-wrap items-center gap-[12px] rounded-md bg-surface-page p-[16px]">
      <Icon name="refresh-0e7c7b-20" />
      <p className="type-body-sm min-w-0 flex-1 text-text-secondary">
        {businessName} chose another student this time. Thanks for applying — here{" "}
        {similar === 1 ? "is 1 similar task" : `are ${similar} similar tasks`}.
      </p>
      <Button
        variant="secondary"
        showArrow
        href={skill ? `/tasks?skill=${encodeURIComponent(skill)}` : "/tasks"}
      >
        Browse similar tasks
      </Button>
    </div>
  );
}
