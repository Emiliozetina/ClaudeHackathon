import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Application, Task } from "@/types";

export const instant = false;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatPayment(task: Task): string {
  const sign = task.payment.currency === "GBP" ? "£" : "";
  const amount = task.payment.amount.toLocaleString("en-GB");
  return task.payment.type === "hourly" ? `${sign}${amount}/hr` : `${sign}${amount} fixed`;
}

function withinDays(iso: string, days: number): boolean {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  const diff = t - Date.now();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function applicantsFor(taskId: string, apps: Application[]): Application[] {
  return apps.filter((a) => a.taskId === taskId);
}

export default async function BusinessDashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "business") redirect("/dashboard/student");

  const profile = db.businesses.find((b) => b.userId === user.id);
  if (!profile) redirect("/register/business");

  const tasks = db.tasks.filter((t) => t.businessId === profile.id);
  const taskIds = new Set(tasks.map((t) => t.id));
  const applications = db.applications.filter((a) => taskIds.has(a.taskId));

  const openTasks = tasks.filter((t) => t.status === "open");
  const inProgress = tasks.filter((t) => t.status === "filled");
  const newApplicants = applications.filter(
    (a) => a.status === "submitted" && withinDays(a.submittedAt, 7),
  );
  const closingThisWeek = openTasks.filter((t) => withinDays(t.endDate, 7));
  const dueThisWeek = tasks
    .filter((t) => t.status === "filled" || t.status === "open")
    .filter((t) => withinDays(t.endDate, 14))
    .sort((a, b) => Date.parse(a.endDate) - Date.parse(b.endDate))
    .slice(0, 4);

  const recentApplicants = applications
    .slice()
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))
    .slice(0, 3);

  const studentName = (id: string) => db.students.find((s) => s.id === id)?.name ?? "Applicant";
  const taskTitle = (id: string) => db.tasks.find((t) => t.id === id)?.title ?? "—";

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-ink)]">
            Good day, {profile.name}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
            {today} · Here&apos;s what&apos;s happening with your tasks.
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[color:var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(13,27,42,0.08)] transition hover:bg-[color:var(--color-brand-hover)]"
        >
          Post a new task <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Open tasks"
          value={openTasks.length}
          hint={
            closingThisWeek.length > 0
              ? `${closingThisWeek.length} closing this week`
              : "Nothing closing soon"
          }
        />
        <KpiTile
          label="New applicants"
          value={newApplicants.length}
          hint={
            newApplicants.length > 0
              ? "In the last 7 days"
              : "Quiet week — tweak a post?"
          }
          tone="brand"
        />
        <KpiTile
          label="In progress"
          value={inProgress.length}
          hint={
            dueThisWeek.length > 0
              ? `Next due ${formatDate(dueThisWeek[0].endDate)}`
              : "No work in flight"
          }
        />
        <KpiTile
          label="Verification"
          value={profile.northEastVerified ? "Verified" : "Pending"}
          hint={profile.northEastVerified ? "North East verified" : "Complete on /verify"}
          tone={profile.northEastVerified ? "brand" : "amber"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <DashboardCard
            title="Your tasks"
            action={
              <Link
                href="/dashboard/business/tasks"
                className="text-sm font-medium text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-hover)]"
              >
                View all →
              </Link>
            }
            padded={false}
          >
            {tasks.length === 0 ? (
              <EmptyRow
                title="No tasks yet"
                body="Post your first short-term task to see it appear here."
                ctaHref="/tasks/new"
                ctaLabel="Post a task"
              />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-[0.06em] text-[color:var(--color-ink-muted)]">
                    <th className="px-5 py-2.5 font-medium">Task</th>
                    <th className="px-2 py-2.5 font-medium">Status</th>
                    <th className="px-2 py-2.5 font-medium">Applicants</th>
                    <th className="px-2 py-2.5 font-medium">Pay</th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => {
                    const apps = applicantsFor(t.id, applications);
                    const newest = apps.filter(
                      (a) => a.status === "submitted" && withinDays(a.submittedAt, 7),
                    ).length;
                    return (
                      <tr key={t.id} className="border-t border-[color:var(--color-line)]">
                        <td className="px-5 py-3">
                          <div className="font-medium text-[color:var(--color-ink)]">
                            {t.title}
                          </div>
                          <div className="mt-0.5 text-xs text-[color:var(--color-ink-muted)]">
                            Due {formatDate(t.endDate)}
                            {t.remote ? " · Remote" : ` · ${t.location}`}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <StatusChip status={t.status} />
                        </td>
                        <td className="px-2 py-3 text-[color:var(--color-ink)]">
                          {apps.length === 0 ? (
                            <span className="text-[color:var(--color-ink-muted)]">—</span>
                          ) : newest > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-brand)]" />
                              {apps.length} · {newest} new
                            </span>
                          ) : (
                            apps.length
                          )}
                        </td>
                        <td className="px-2 py-3 text-[color:var(--color-ink)]">
                          {formatPayment(t)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href={`/dashboard/business/tasks/${t.id}/applicants`}
                            className="text-sm font-medium text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-hover)]"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </DashboardCard>

          <DashboardCard title="Your business profile">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[color:var(--color-ink)]">{profile.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[color:var(--color-ink-muted)]">
                  {profile.about}
                </p>
                <p className="mt-2 text-xs text-[color:var(--color-ink-muted)]">
                  {profile.location}
                  {profile.website ? ` · ${profile.website}` : ""}
                </p>
              </div>
              <Link
                href="/dashboard/business/profile"
                className="inline-flex items-center gap-1 rounded-xl border border-[color:var(--color-line)] bg-white px-3 py-1.5 text-sm font-medium text-[color:var(--color-ink)] hover:border-[color:var(--color-ink-muted)]"
              >
                Edit
              </Link>
            </div>
          </DashboardCard>
        </div>

        <aside className="flex flex-col gap-4">
          <DashboardCard
            title="Recent applicants"
            action={
              <Link
                href="/dashboard/business/applications"
                className="text-sm font-medium text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-hover)]"
              >
                See all →
              </Link>
            }
          >
            {recentApplicants.length === 0 ? (
              <p className="py-4 text-sm text-[color:var(--color-ink-muted)]">
                No applicants yet. Share your task link to get started.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {recentApplicants.map((a) => (
                  <li key={a.id} className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[color:var(--color-brand-soft)] text-xs font-semibold text-[color:var(--color-brand-hover)]">
                      {studentName(a.studentId)
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[color:var(--color-ink)]">
                        {studentName(a.studentId)}
                      </p>
                      <p className="truncate text-xs text-[color:var(--color-ink-muted)]">
                        {taskTitle(a.taskId)}
                      </p>
                    </div>
                    <StatusChip status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>

          <DashboardCard title="This fortnight">
            {dueThisWeek.length === 0 ? (
              <p className="py-2 text-sm text-[color:var(--color-ink-muted)]">
                Nothing due in the next 14 days.
              </p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {dueThisWeek.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 text-sm">
                    <span className="inline-flex min-w-11 items-center justify-center rounded-md bg-[color:var(--color-brand-tint)] px-2 py-0.5 text-xs font-medium text-[color:var(--color-brand-hover)]">
                      {formatDate(t.endDate)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[color:var(--color-ink)]">
                      {t.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </aside>
      </div>
    </section>
  );
}

function EmptyRow({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
      <p className="text-base font-medium text-[color:var(--color-ink)]">{title}</p>
      <p className="max-w-sm text-sm text-[color:var(--color-ink-muted)]">{body}</p>
      <Link
        href={ctaHref}
        className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-[color:var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[color:var(--color-brand-hover)]"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
