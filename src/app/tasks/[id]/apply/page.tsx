import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Avatar, Icon } from "@/components/ui";
import { RoleGate } from "@/components/demo/RoleGate";
import { HeaderFor } from "@/app/students/[id]/student-header";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPay } from "@/lib/tasks";
import type { Student, Task } from "@/types";
import {
  currentStudent,
  durationLabel,
  hasSkill,
  initials,
  skillMatch,
  withinDays,
} from "../../_shared/student";
import { DraftReview, type DraftParagraph } from "./DraftReview";

/** Shown as "N of 5" in the send panel. Display only; the API has no weekly cap. */
const WEEKLY_APPLICATION_LIMIT = 5;

/**
 * Builds the draft from the student's profile, one paragraph per source.
 * TODO: replace with the Claude drafting call when it exists; the page only
 * needs `{ text, source }[]`.
 */
function draftFromProfile(student: Student, task: Task, businessName: string): DraftParagraph[] {
  const paragraphs: DraftParagraph[] = [
    {
      text: `I’m studying ${student.fieldOfStudy} at ${student.university}, and I’d love to help ${businessName} with “${task.title}”.`,
      source: "Education",
    },
  ];
  for (const job of student.workHistory.slice(0, 2)) {
    paragraphs.push({
      text: job.description
        ? `As ${job.title} at ${job.organisation}, ${job.description.charAt(0).toLowerCase()}${job.description.slice(1)}`
        : `Working as ${job.title} at ${job.organisation} gave me hands-on experience I can bring to this task.`,
      source: `${job.organisation} role`,
    });
  }
  const skills = [...task.requirements, ...task.preferredExperience].filter((s) => hasSkill(student, s));
  if (skills.length > 0) {
    paragraphs.push({
      text: `I already use ${skills.join(", ")}, which this task asks for.`,
      source: "Skills section",
    });
  }
  return paragraphs;
}

function ClaimRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <li className="flex items-center gap-[10px]">
      <span
        className={`flex size-[22px] shrink-0 items-center justify-center rounded-pill ${
          ok ? "bg-status-success-bg" : "bg-status-warning-bg"
        }`}
      >
        <Icon name={ok ? "check-16774a-12" : "alert-8a5300-12"} />
      </span>
      <span className="flex min-w-0 flex-col gap-[2px]">
        <span className="type-label text-text-primary">{label}</span>
        <span className="type-caption text-text-secondary">{detail}</span>
      </span>
    </li>
  );
}

/** Figma 10a · Application drafted — review & send (29:1257). */
async function ReviewApplication({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const task = db.tasks.find((t) => t.id === id && t.status === "open");
  if (!task) notFound();
  const business = db.businesses.find((b) => b.id === task.businessId);
  const businessName = business?.name ?? "the business";
  const student = await currentStudent();
  if (!student) {
    return (
      <p className="type-body text-text-secondary">Complete your student profile before applying.</p>
    );
  }

  const match = skillMatch(student, task);
  const mine = db.applications.filter((a) => a.studentId === student.id);
  const alreadyApplied = mine.some((a) => a.taskId === task.id && a.status !== "withdrawn");
  const usedThisWeek = mine.filter((a) => withinDays(a.submittedAt, 7)).length;

  const claims = [
    ...task.requirements.map((s) => ({ kind: "Required", skill: s })),
    ...task.preferredExperience.map((s) => ({ kind: "Preferred", skill: s })),
  ];

  return (
    <>
      <div className="flex flex-col gap-[12px] rounded-lg bg-navy-900 px-[20px] py-[16px] md:flex-row md:items-center md:gap-[14px]">
        <span className="flex size-[40px] shrink-0 items-center justify-center rounded-md bg-navy-700">
          <Icon name="bell-f2a541-20" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <p className="type-label text-text-inverse">An application was drafted from your profile</p>
          <p className="type-caption text-navy-100">
            {task.title} · {businessName} · you meet {match.required} of {match.requiredTotal}{" "}
            requirements
          </p>
        </div>
        <p className="type-label-sm text-amber-500">Nothing is sent until you press Send</p>
      </div>

      <div className="flex items-center gap-[16px]">
        <Avatar initials={initials(businessName)} tone="navy" size={56} />
        <div className="flex min-w-0 flex-col gap-[4px]">
          <h1 className="type-h2 text-text-primary">Review your application</h1>
          <p className="type-body text-text-secondary">
            {task.title} · {businessName} · {formatPay(task)} · {durationLabel(task).split(" · ")[0]}
          </p>
        </div>
      </div>

      <DraftReview
        taskId={task.id}
        paragraphs={draftFromProfile(student, task, businessName)}
        cvFileName={student.cvUrl?.split("/").pop()}
        weekly={{ used: usedThisWeek, limit: WEEKLY_APPLICATION_LIMIT }}
        alreadyApplied={alreadyApplied}
        claimCheck={
          <section className="flex flex-col gap-[14px] rounded-lg border border-border-subtle bg-surface-card p-[28px]">
            <h2 className="type-h4 text-text-primary">How your draft matches the task</h2>
            <ul className="flex flex-col gap-[14px]">
              {claims.map(({ kind, skill }) => {
                const ok = hasSkill(student, skill);
                return (
                  <ClaimRow
                    key={`${kind}-${skill}`}
                    ok={ok}
                    label={`${kind} · ${skill}`}
                    detail={
                      ok
                        ? "On your profile — skills section"
                        : "Not on your profile, so the draft leaves it out. If you can do it, add it yourself."
                    }
                  />
                );
              })}
            </ul>
          </section>
        }
      />
    </>
  );
}

async function Header() {
  return <HeaderFor user={await getCurrentUser()} />;
}

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <Suspense fallback={<div className="h-[72px] border-b border-border-subtle bg-surface-card" />}>
        <Header />
      </Suspense>
      <main className="mx-auto flex w-full max-w-[1232px] flex-col gap-[24px] px-4 pb-[64px] pt-[32px]">
        <Suspense fallback={<p className="type-body text-text-secondary">Loading…</p>}>
          <RoleGate role="student">
            <ReviewApplication params={params} />
          </RoleGate>
        </Suspense>
      </main>
    </>
  );
}
