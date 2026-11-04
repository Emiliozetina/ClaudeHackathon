import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Avatar, Button, Chip, Icon, StatCard } from "@/components/ui";
import type { ChipType } from "@/components/ui";
import { CurrentUserHeader } from "@/components/layout/CurrentUserHeader";
import { requireUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { formatPay } from "@/lib/tasks";
import type { ApplicationStatus } from "@/types";
import { formatDate, initials, skillMatch, whereLabel } from "../../tasks/_shared/student";

const card = "rounded-lg border border-border-subtle bg-surface-card";

const statusChip: Record<ApplicationStatus, { label: string; type: ChipType }> = {
  submitted: { label: "New", type: "neutral" },
  shortlisted: { label: "Shortlisted", type: "success" },
  chosen: { label: "Chosen", type: "teal" },
  rejected: { label: "Declined", type: "error" },
  withdrawn: { label: "Withdrawn", type: "neutral" },
};

/** Student dashboard, styled to match Figma "06 · Business dashboard". */
async function StudentDashboard() {
  await connection(); // reads the live store and the clock, so don't prerender
  const user = await requireUser();
  if (user.role !== "student") redirect("/dashboard/business");

  const profile = store.students.find((s) => s.userId === user.id);
  if (!profile) redirect("/register/student");

  const applications = store.applications.filter((a) => a.studentId === profile.id);
  const count = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status).length;
  const submitted = count("submitted");
  const shortlisted = count("shortlisted");
  const chosen = count("chosen");

  const businessName = (businessId: string) =>
    store.businesses.find((b) => b.id === businessId)?.name ?? "Business";

  const appliedTaskIds = new Set(applications.map((a) => a.taskId));
  const recommended = store.tasks
    .filter((t) => t.status === "open" && !appliedTaskIds.has(t.id))
    .map((t) => ({ t, m: skillMatch(profile, t) }))
    .sort(
      (a, b) =>
        b.m.required * 10 + b.m.preferred - (a.m.required * 10 + a.m.preferred) ||
        Date.parse(b.t.createdAt) - Date.parse(a.t.createdAt),
    )
    .slice(0, 4);

  const recentApplications = applications
    .slice()
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))
    .slice(0, 4);

  const activeWork = store.engagements.filter(
    (e) => e.studentId === profile.id && (e.status === "active" || e.status === "submitted"),
  ).length;

  const firstName = profile.name.split(" ")[0] ?? profile.name;
  const stats = [
    {
      label: "Open applications",
      value: String(submitted),
      delta: submitted === 0 ? "Nothing waiting on a reply" : "Awaiting a decision",
    },
    {
      label: "Shortlisted",
      value: String(shortlisted),
      delta: shortlisted > 0 ? "A business is interested" : "Keep applying",
    },
    {
      label: "Chosen",
      value: String(chosen),
      delta: chosen > 0 ? "Work in progress" : "Not chosen yet",
    },
    {
      label: "Profile",
      value: profile.universityEmailVerified ? "Verified" : "Pending",
      delta: profile.universityEmailVerified ? "University email verified" : "Verify your university email",
    },
  ];

  return (
    <main className="flex w-full flex-col gap-[32px] px-6 pb-[80px] pt-[40px] lg:px-[120px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-[6px]">
          <h1 className="type-h2 text-text-primary">Hey, {firstName}</h1>
          <p className="type-body text-text-secondary">
            {profile.university} · {profile.fieldOfStudy}
          </p>
        </div>
        <Button href="/tasks" size="lg" showArrow>
          Find work
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} />
        ))}
      </div>

      <div className="flex flex-col items-start gap-[24px] lg:flex-row">
        {/* Recommended */}
        <section className={`${card} w-full min-w-0 flex-1 overflow-hidden`}>
          <div className="flex items-center justify-between px-[24px] py-[20px]">
            <h2 className="type-h4 text-text-primary">Recommended for you</h2>
            <Button href="/tasks" variant="ghost" showArrow>
              Browse all
            </Button>
          </div>
          {recommended.length === 0 ? (
            <p className="type-body-sm border-t border-border-subtle px-[24px] py-[32px] text-center text-text-secondary">
              No new open tasks right now. Check back soon.
            </p>
          ) : (
            <ul>
              {recommended.map(({ t, m }) => (
                <li
                  key={t.id}
                  className="relative flex flex-col gap-[8px] border-t border-border-subtle px-[24px] py-[16px]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-[12px]">
                    <div className="flex min-w-0 flex-col gap-[2px]">
                      <Link
                        href={`/tasks/${t.id}`}
                        className="type-label text-text-primary after:absolute after:inset-0 after:content-['']"
                      >
                        {t.title}
                      </Link>
                      <span className="type-caption text-text-secondary">
                        {businessName(t.businessId)} · {whereLabel(t)}
                      </span>
                    </div>
                    <Chip type="pay">{formatPay(t)}</Chip>
                  </div>
                  <p className="type-body-sm line-clamp-2 text-text-secondary">{t.description}</p>
                  {m.requiredTotal > 0 && (
                    <span className="flex items-center gap-[6px]">
                      <Icon name="target" />
                      <span className="type-label-sm text-teal-700">
                        You meet {m.required} of {m.requiredTotal} required
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Side column */}
        <aside className="flex w-full shrink-0 flex-col gap-[24px] lg:w-[400px]">
          <section className={`${card} flex flex-col gap-[16px] p-[24px]`}>
            <div className="flex items-center justify-between">
              <h2 className="type-h4 text-text-primary">Your applications</h2>
              <Button href="/dashboard/student/applications" variant="ghost">
                See all
              </Button>
            </div>
            {recentApplications.length === 0 ? (
              <p className="type-body-sm text-text-secondary">
                You haven’t applied to anything yet.{" "}
                <Link href="/tasks" className="type-label text-teal-700">
                  Find work
                </Link>
              </p>
            ) : (
              <ul className="flex flex-col gap-[16px]">
                {recentApplications.map((a) => {
                  const task = store.tasks.find((t) => t.id === a.taskId);
                  const chip = statusChip[a.status];
                  return (
                    <li key={a.id} className="flex items-center gap-[12px]">
                      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        <span className="type-label truncate text-text-primary">
                          {task?.title ?? "Task removed"}
                        </span>
                        <span className="type-caption truncate text-text-secondary">
                          {task ? businessName(task.businessId) : "—"} · {formatDate(a.submittedAt, false)}
                        </span>
                      </div>
                      <Chip type={chip.type}>{chip.label}</Chip>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className={`${card} flex flex-col gap-[16px] p-[24px]`}>
            <h2 className="type-h4 text-text-primary">Your profile</h2>
            <div className="flex items-center gap-[12px]">
              <Avatar initials={initials(profile.name)} tone="teal" size={40} />
              <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                <span className="type-label truncate text-text-primary">{profile.name}</span>
                <span className="type-caption truncate text-text-secondary">
                  {profile.skills.slice(0, 3).join(", ") || "Add skills to help matching"}
                </span>
              </div>
            </div>
            <Button href="/dashboard/student/profile/edit" variant="secondary">
              Edit profile
            </Button>
          </section>

          {activeWork > 0 && (
            <section className={`${card} flex items-center justify-between gap-[12px] p-[24px]`}>
              <div className="flex flex-col gap-[2px]">
                <h2 className="type-h4 text-text-primary">Your work</h2>
                <p className="type-body-sm text-text-secondary">
                  {activeWork} {activeWork === 1 ? "engagement" : "engagements"} in progress
                </p>
              </div>
              <Button href="/dashboard/student/engagements" variant="ghost" showArrow>
                Open
              </Button>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

export default function StudentDashboardPage() {
  return (
    <>
      <CurrentUserHeader />
      <Suspense
        fallback={
          <main className="flex w-full flex-col gap-[32px] px-6 pb-[80px] pt-[40px] lg:px-[120px]">
            <div className="h-[72px] w-full max-w-[420px] rounded-lg bg-navy-50" />
            <div className="h-[400px] w-full rounded-lg bg-navy-50" />
          </main>
        }
      >
        <StudentDashboard />
      </Suspense>
    </>
  );
}
