import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Avatar, Button, Chip, Icon, type IconName } from "@/components/ui";
import { HeaderFor } from "@/app/students/[id]/student-header";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPay } from "@/lib/tasks";
import {
  currentStudent,
  durationLabel,
  formatDate,
  hasSkill,
  initials,
  skillMatch,
} from "../_shared/student";
import { ApplyPanel } from "./ApplyPanel";

const card = "rounded-lg border border-border-subtle bg-surface-card p-[32px]";

function SidePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[16px] rounded-lg border border-border-subtle bg-surface-card p-[28px] shadow-elevation-2">
      <h2 className="type-h3 text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="flex items-center gap-[12px] rounded-md bg-navy-50 px-[16px] py-[12px]">
      <Icon name={icon} className="shrink-0" />
      <div className="flex flex-col">
        <span className="type-caption text-text-secondary">{label}</span>
        <span className="type-label text-text-primary">{value}</span>
      </div>
    </div>
  );
}

function SkillRow({ skill, has }: { skill: string; has: boolean }) {
  return (
    <li className="flex items-center gap-[10px]">
      <span
        className={`flex size-[22px] shrink-0 items-center justify-center rounded-pill ${
          has ? "bg-status-success-bg" : "bg-border-subtle"
        }`}
      >
        <Icon name={has ? "check-16774a-12" : "x-5b6472-12"} label={has ? "On your profile" : "Not yet"} />
      </span>
      <span className="type-body min-w-0 flex-1 text-text-primary">{skill}</span>
      <span className={`type-caption ${has ? "text-status-success" : "text-text-secondary"}`}>
        {has ? "On your profile" : "Not yet"}
      </span>
    </li>
  );
}

function SkillBox({ chip, children }: { chip: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-start gap-[12px] rounded-md bg-navy-50 p-[20px]">
      {chip}
      <ul className="flex w-full flex-col gap-[12px]">{children}</ul>
    </div>
  );
}

/** Figma 10 · Task detail & apply (10:887). */
async function TaskDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  // Open tasks are visible signed out too.
  const user = await currentUser();
  const found = db.tasks.find((t) => t.id === id);
  // Open tasks are public; the owner can also see their drafts and filled tasks.
  const isOwner =
    !!found && !!user && db.businesses.find((b) => b.id === found.businessId)?.userId === user.id;
  const task = found && (found.status === "open" || isOwner) ? found : undefined;
  if (!task) notFound();
  const business = db.businesses.find((b) => b.id === task.businessId);
  const businessName = business?.name ?? "the business";
  const student = await currentStudent();
  const myApplication = student
    ? db.applications.find(
        (a) => a.taskId === task.id && a.studentId === student.id && a.status !== "withdrawn",
      )
    : undefined;
  const match = skillMatch(student, task);

  const hired = db.engagements.filter((e) => e.businessId === task.businessId).length;
  const applications = db.applications.filter((a) => a.taskId === task.id && a.status !== "withdrawn");

  const matchTitle = match.meetsAllRequired
    ? "Strong match"
    : match.required > 0
      ? "Partial match"
      : "Not a match yet";
  const matchDetail =
    `You meet ${match.required} of ${match.requiredTotal} required` +
    (match.preferredTotal > 0
      ? ` and ${match.preferred} of ${match.preferredTotal} preferred skills.`
      : " skills.");

  const businessMeta = [
    business?.northEastVerified ? "North East verified" : null,
    `${hired} student${hired === 1 ? "" : "s"} hired`,
    business?.location,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-[32px] lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-[24px]">
        {/* Task header */}
        <section className={`${card} flex flex-col gap-[20px]`}>
          <div className="flex items-center gap-[16px]">
            <Avatar initials={initials(businessName)} tone="navy" size={56} />
            <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
              <p className="type-label text-text-primary">{businessName}</p>
              <p className="type-caption text-text-secondary">{businessMeta}</p>
            </div>
            <div className="flex gap-[8px]">
              <button
                type="button"
                aria-label="Save task"
                className="flex size-[40px] items-center justify-center rounded-pill border border-border-subtle"
              >
                <Icon name="bookmark-5b6472-18" />
              </button>
              <button
                type="button"
                aria-label="Share task"
                className="flex size-[40px] items-center justify-center rounded-pill border border-border-subtle"
              >
                <Icon name="share-5b6472-18" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-[12px]">
            <h1 className="type-h1 text-text-primary">{task.title}</h1>
            {task.status !== "open" && <Chip type="neutral">{task.status}</Chip>}
          </div>

          <div className="flex flex-wrap gap-[12px]">
            <Fact
              icon="map-pin-0b2545-20"
              label="Location"
              value={task.remote ? `${task.location} · Remote` : task.location}
            />
            <Fact icon="calendar-0b2545-20" label="Starts" value={formatDate(task.startDate)} />
            <Fact icon="clock-0b2545-20" label="Duration" value={durationLabel(task)} />
          </div>
          <div className="flex w-fit flex-col rounded-md bg-amber-100 px-[16px] py-[12px]">
            <span className="type-caption text-amber-900">Pay</span>
            <span className="type-label text-amber-900">
              {formatPay(task)}
              {task.payment.notes ? ` · ${task.payment.notes}` : ""}
            </span>
          </div>
          <p className="type-caption text-text-secondary">
            {formatDate(task.startDate)} to {formatDate(task.endDate)}
            {task.estimatedHours ? `, about ${task.estimatedHours} hours in total` : ""}
          </p>
        </section>

        {/* About the task */}
        <section className={`${card} flex flex-col gap-[16px]`}>
          <h2 className="type-h4 text-text-primary">About the task</h2>
          <p className="type-body whitespace-pre-line text-text-primary">{task.description}</p>
        </section>

        {/* Experience */}
        <section className={`${card} flex flex-col gap-[16px]`}>
          <h2 className="type-h4 text-text-primary">Experience</h2>
          <div className="flex flex-col gap-[24px] md:flex-row md:items-start">
            <SkillBox chip={<Chip type="required">Required</Chip>}>
              {task.requirements.map((r) => (
                <SkillRow key={r} skill={r} has={hasSkill(student, r)} />
              ))}
            </SkillBox>
            {task.preferredExperience.length > 0 && (
              <SkillBox chip={<Chip type="preferred">Preferred</Chip>}>
                {task.preferredExperience.map((r) => (
                  <SkillRow key={r} skill={r} has={hasSkill(student, r)} />
                ))}
              </SkillBox>
            )}
          </div>
        </section>

        {/* About the company */}
        {business && (
          <section className={`${card} flex flex-col gap-[16px]`}>
            <div className="flex items-center gap-[14px]">
              <Avatar initials={initials(business.name)} tone="navy" size={40} />
              <div className="flex flex-col gap-[2px]">
                <h2 className="type-h4 text-text-primary">About {business.name}</h2>
                <p className="type-caption text-text-secondary">{business.location}</p>
              </div>
            </div>
            <p className="type-body text-text-primary">{business.about}</p>
            <div className="flex flex-wrap gap-[16px]">
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-[6px]"
                >
                  <Icon name="globe-5b6472-16" />
                  <span className="type-body-sm text-text-secondary">
                    {business.website.replace(/^https?:\/\//, "")}
                  </span>
                </a>
              )}
              <span className="flex items-center gap-[6px]">
                <Icon name="users-5b6472-16" />
                <span className="type-body-sm text-text-secondary">
                  {hired} student{hired === 1 ? "" : "s"} hired on NEXA
                </span>
              </span>
            </div>
          </section>
        )}
      </div>

      <div className="w-full shrink-0 lg:sticky lg:top-[24px] lg:w-[440px]">
        {isOwner ? (
          <SidePanel title="Your task">
            <p className="type-body-sm text-text-secondary">
              {applications.length} application{applications.length === 1 ? "" : "s"} so far.
            </p>
            <Button href={`/dashboard/business/tasks/${task.id}/applicants`} size="lg" showArrow className="w-full">
              Review applicants
            </Button>
          </SidePanel>
        ) : myApplication ? (
          <SidePanel title="You applied">
            <p role="status" className="type-body-sm text-text-secondary">
              You applied to this task. Status: <Chip type="teal">{myApplication.status}</Chip>
            </p>
            <Button href="/dashboard/student/applications" variant="secondary" className="w-full">
              View my applications
            </Button>
          </SidePanel>
        ) : user?.role === "student" && task.status === "open" ? (
          <ApplyPanel
            taskId={task.id}
            businessName={businessName}
            student={
              student
                ? {
                    name: student.name,
                    initials: initials(student.name),
                    cvFileName: student.cvUrl?.split("/").pop(),
                  }
                : undefined
            }
            match={{ title: matchTitle, detail: matchDetail }}
            startLabel={formatDate(task.startDate, false)}
            appliedCount={applications.length}
            alreadyApplied={false}
          />
        ) : null}
      </div>
    </div>
  );
}

async function Header() {
  return <HeaderFor user={await currentUser()} />;
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <Suspense fallback={<div className="h-[72px] border-b border-border-subtle bg-surface-card" />}>
        <Header />
      </Suspense>
      <main className="mx-auto flex w-full max-w-[1232px] flex-col gap-[32px] px-4 pb-[64px] pt-[40px]">
        <Link href="/tasks" className="type-label flex w-fit items-center gap-[6px] text-teal-700">
          <Icon name="arrow-left-0e7c7b-16" />
          Back to results
        </Link>
        <Suspense fallback={<p className="type-body text-text-secondary">Loading…</p>}>
          <TaskDetail params={params} />
        </Suspense>
      </main>
    </>
  );
}
