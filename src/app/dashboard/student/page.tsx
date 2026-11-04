import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Task } from "@/types";

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

function matchStrength(task: Task, skills: string[]): { met: number; total: number } {
  const lower = new Set(skills.map((s) => s.toLowerCase()));
  const required = task.requirements ?? [];
  const met = required.filter((r) =>
    Array.from(lower).some((s) => r.toLowerCase().includes(s)),
  ).length;
  return { met, total: required.length };
}

export default async function StudentDashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/dashboard/business");

  const profile = db.students.find((s) => s.userId === user.id);
  if (!profile) redirect("/register/student");

  const applications = db.applications.filter((a) => a.studentId === profile.id);
  const submittedCount = applications.filter((a) => a.status === "submitted").length;
  const shortlistedCount = applications.filter((a) => a.status === "shortlisted").length;
  const chosenCount = applications.filter((a) => a.status === "chosen").length;

  const appliedTaskIds = new Set(applications.map((a) => a.taskId));
  const openTasks = db.tasks
    .filter((t) => t.status === "open" && !appliedTaskIds.has(t.id))
    .slice()
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const recommended = openTasks
    .map((t) => ({ t, m: matchStrength(t, profile.skills) }))
    .sort((a, b) => b.m.met - a.m.met)
    .slice(0, 4)
    .map((x) => x.t);

  const recentApplications = applications
    .slice()
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))
    .slice(0, 4);

  const taskTitle = (id: string) => db.tasks.find((t) => t.id === id)?.title ?? "—";
  const businessName = (taskId: string) => {
    const task = db.tasks.find((t) => t.id === taskId);
    if (!task) return "";
    return db.businesses.find((b) => b.id === task.businessId)?.name ?? "";
  };

  const firstName = profile.name.split(" ")[0] ?? profile.name;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-ink)]">
            Hey, {firstName}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
            {profile.university} · {profile.fieldOfStudy}
          </p>
        </div>
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[color:var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(13,27,42,0.08)] transition hover:bg-[color:var(--color-brand-hover)]"
        >
          Find work <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Open applications"
          value={submittedCount}
          hint={
            submittedCount === 0
              ? "Nothing waiting on a reply"
              : submittedCount === 1
                ? "Awaiting a decision"
                : "Awaiting decisions"
          }
        />
        <KpiTile
          label="Shortlisted"
          value={shortlistedCount}
          hint={shortlistedCount > 0 ? "A business is interested" : "Keep applying"}
          tone="brand"
        />
        <KpiTile
          label="Chosen"
          value={chosenCount}
          hint={chosenCount > 0 ? "Work in progress" : "Not chosen yet"}
          tone={chosenCount > 0 ? "brand" : "default"}
        />
        <KpiTile
          label="Profile"
          value={profile.universityEmailVerified ? "Verified" : "Pending"}
          hint={profile.universityEmailVerified ? "University email verified" : "Finish on /verify"}
          tone={profile.universityEmailVerified ? "brand" : "amber"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <DashboardCard
            title="Recommended for you"
            action={
              <Link
                href="/tasks"
                className="text-sm font-medium text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-hover)]"
              >
                Browse all →
              </Link>
            }
          >
            {recommended.length === 0 ? (
              <p className="py-6 text-center text-sm text-[color:var(--color-ink-muted)]">
                No new open tasks right now — check back soon.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {recommended.map((t) => {
                  const { met, total } = matchStrength(t, profile.skills);
                  const businessLabel =
                    db.businesses.find((b) => b.id === t.businessId)?.name ?? "Business";
                  return (
                    <li
                      key={t.id}
                      className="rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-brand-tint)]/40 p-4 transition hover:border-[color:var(--color-brand)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/tasks/${t.id}`}
                            className="text-sm font-semibold text-[color:var(--color-ink)] hover:text-[color:var(--color-brand-hover)]"
                          >
                            {t.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-[color:var(--color-ink-muted)]">
                            {businessLabel} · {t.remote ? "Remote" : t.location} · Posted{" "}
                            {formatDate(t.createdAt)}
                          </p>
                        </div>
                        <span className="rounded-md bg-[color:var(--color-amber-soft)] px-2 py-0.5 text-xs font-medium text-[#8a6500]">
                          {formatPayment(t)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-[color:var(--color-ink)]">
                        {t.description}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                        {total > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-brand-soft)] px-2 py-0.5 text-[color:var(--color-brand-hover)]">
                            <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M4 10l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            You meet {met} of {total} required
                          </span>
                        ) : null}
                        <span className="text-[color:var(--color-ink-muted)]">
                          Ends {formatDate(t.endDate)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </DashboardCard>
        </div>

        <aside className="flex flex-col gap-4">
          <DashboardCard
            title="Your applications"
            action={
              <Link
                href="/dashboard/student/applications"
                className="text-sm font-medium text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-hover)]"
              >
                See all →
              </Link>
            }
          >
            {recentApplications.length === 0 ? (
              <p className="py-4 text-sm text-[color:var(--color-ink-muted)]">
                You haven&apos;t applied to anything yet.{" "}
                <Link
                  href="/tasks"
                  className="font-medium text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-hover)]"
                >
                  Find work →
                </Link>
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {recentApplications.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[color:var(--color-ink)]">
                        {taskTitle(a.taskId)}
                      </p>
                      <p className="truncate text-xs text-[color:var(--color-ink-muted)]">
                        {businessName(a.taskId)} · {formatDate(a.submittedAt)}
                      </p>
                    </div>
                    <StatusChip status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>

          <DashboardCard title="Your profile">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[color:var(--color-brand-soft)] text-sm font-semibold text-[color:var(--color-brand-hover)]">
                {profile.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[color:var(--color-ink)]">
                  {profile.name}
                </p>
                <p className="truncate text-xs text-[color:var(--color-ink-muted)]">
                  {profile.skills.slice(0, 3).join(", ") || "Add skills to help matching"}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/student/profile"
              className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-[color:var(--color-line)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--color-ink)] hover:border-[color:var(--color-ink-muted)]"
            >
              Edit profile
            </Link>
          </DashboardCard>
        </aside>
      </div>
    </section>
  );
}
