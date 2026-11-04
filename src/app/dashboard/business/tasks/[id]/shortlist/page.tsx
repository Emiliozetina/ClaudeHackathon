import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BlindShortlist } from "@/components/applications/BlindShortlist";
import { RoleGate } from "@/components/demo/RoleGate";
import { AppHeader, Chip, Icon } from "@/components/ui";
import { applicationsForTask, forBusiness } from "@/lib/applications";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { rankApplicants } from "@/lib/shortlist";

// Figma: Screens → "08a · AI shortlist — blind review" (29:1534).

async function Shortlist({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const user = await requireUser();
  if (user.role !== "business") return <RoleGate role="business">{null}</RoleGate>;
  const businessId = db.businesses.find((b) => b.userId === user.id)?.id;
  const task = db.tasks.find((t) => t.id === id && t.businessId === businessId);
  if (!task) notFound();

  const apps = applicationsForTask(task.id)
    .filter((a) => a.status === "submitted")
    .map(forBusiness);
  const ranking = await rankApplicants(task, apps);
  const criteria = [
    ...task.requirements.map((skill) => ({ skill, required: true })),
    ...task.preferredExperience.map((skill) => ({ skill, required: false })),
  ];
  const byClaude = ranking.source === "claude";

  return (
    <>
      <div className="flex flex-col gap-[8px]">
        <div className="flex flex-wrap items-center gap-[12px]">
          <h1 className="type-h2 text-text-primary">
            {task.title} · {apps.length} applicant{apps.length === 1 ? "" : "s"}
          </h1>
          <span className="type-label-sm flex items-center gap-[6px] rounded-pill bg-navy-900 px-[10px] py-[5px] text-text-inverse">
            <Icon name="spark-f2a541-14" />
            {byClaude ? "Ranked by Claude" : "Ranked by skill match"}
          </span>
        </div>
        <p className="type-body text-text-secondary">
          {byClaude ? "Claude" : "We"} scored every applicant against the same criteria from your post. You make the final decision.
        </p>
      </div>

      <div className="flex items-center gap-[14px] rounded-lg border border-teal-700 bg-teal-50 px-[21px] py-[17px]">
        <span className="flex size-[40px] shrink-0 items-center justify-center rounded-[10px] bg-teal-700">
          <Icon name="eyeoff-white-20" />
        </span>
        <div className="flex flex-1 flex-col">
          <p className="type-label text-text-primary">Blind shortlist is on</p>
          <p className="type-body-sm text-text-primary">
            Names, photos, age, gender and university are hidden — from you{byClaude ? " and from Claude" : ""} — until you shortlist.
          </p>
        </div>
        <span aria-label="Blind shortlist on" className="flex h-[24px] w-[44px] items-center justify-end rounded-pill bg-teal-700 p-[3px]">
          <span className="size-[18px] rounded-pill bg-surface-card" />
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-[8px]">
        <span className="type-body-sm text-text-secondary">Criteria from your post:</span>
        {criteria.map((c) => (
          <Chip key={c.skill} type={c.required ? "required" : "preferred"}>{c.skill}</Chip>
        ))}
      </div>

      <BlindShortlist taskId={task.id} criteria={criteria} candidates={ranking.candidates} source={ranking.source} />
    </>
  );
}

export default function ShortlistPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <AppHeader role="business" account={{ name: "Tyne Brew Café", subtitle: "Business account", initials: "TB" }} />
      <main className="flex w-full flex-col gap-[28px] px-6 pb-[80px] pt-[40px] lg:px-[120px]">
        <Link href="/dashboard/business/tasks" className="type-label flex w-fit items-center gap-[6px] text-teal-700">
          <Icon name="arrow-left-0e7c7b-16" />
          Back to My tasks
        </Link>
        <Suspense fallback={<p className="type-body-sm text-text-secondary">Ranking applicants…</p>}>
          <Shortlist params={params} />
        </Suspense>
      </main>
    </>
  );
}
