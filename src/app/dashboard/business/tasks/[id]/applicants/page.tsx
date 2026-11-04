import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ApplicantActions } from "@/components/applications/ApplicantActions";
import { AppHeader, Avatar, Chip, Icon } from "@/components/ui";
import type { AvatarTone, ChipType } from "@/components/ui";
import { applicationsForTask, forBusiness, type ApplicationForBusiness } from "@/lib/applications";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { db } from "@/lib/db";

// Figma: Screens → "08 · Review applicants" (9:722).
// Names stay hidden until a student is chosen (see forBusiness), so others show as "Candidate A, B…".

type Search = Promise<{ a?: string; tab?: string }>;

const statusChip: Record<string, { label: string; type: ChipType }> = {
  submitted: { label: "New", type: "neutral" },
  shortlisted: { label: "Shortlisted", type: "success" },
  chosen: { label: "Chosen", type: "teal" },
  rejected: { label: "Declined", type: "error" },
  withdrawn: { label: "Withdrawn", type: "neutral" },
};
const tones: AvatarTone[] = ["teal", "amber", "navy"];

const has = (skills: string[], s: string) => skills.some((x) => x.toLowerCase() === s.toLowerCase());
const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const fmtMonth = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "now";

function displayName(a: ApplicationForBusiness, i: number) {
  return a.student.name ?? `Candidate ${String.fromCharCode(65 + i)}`;
}

async function Applicants({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await connection();
  const { id } = await params;
  const { a: selectedId, tab = "all" } = await searchParams;
  // TODO(auth): getCurrentUser is the shared demo stub until #1 lands.
  const user = await getCurrentUser();
  const businessId = db.businesses.find((b) => b.userId === user.id)?.id;
  const task = db.tasks.find((t) => t.id === id && t.businessId === businessId);
  if (!task) notFound();

  const score = (a: ApplicationForBusiness) =>
    task.requirements.filter((r) => has(a.student.skills, r)).length * 10 +
    task.preferredExperience.filter((r) => has(a.student.skills, r)).length;
  const all = applicationsForTask(task.id).map(forBusiness).sort((x, y) => score(y) - score(x));
  const counts = {
    all: all.length,
    new: all.filter((a) => a.status === "submitted").length,
    shortlisted: all.filter((a) => a.status === "shortlisted" || a.status === "chosen").length,
    declined: all.filter((a) => a.status === "rejected").length,
  };
  const visible = all.filter((a) =>
    tab === "new" ? a.status === "submitted" : tab === "shortlisted" ? a.status === "shortlisted" || a.status === "chosen" : tab === "declined" ? a.status === "rejected" : true,
  );
  const selected = all.find((a) => a.id === selectedId) ?? visible[0];
  const selIndex = selected ? all.indexOf(selected) : -1;
  const matchLabel = (a: ApplicationForBusiness) => {
    const r = task.requirements.filter((s) => has(a.student.skills, s)).length;
    const p = task.preferredExperience.filter((s) => has(a.student.skills, s)).length;
    return {
      text: `${r}/${task.requirements.length} required${task.preferredExperience.length ? ` · ${p}/${task.preferredExperience.length} preferred` : ""}`,
      full: r === task.requirements.length,
    };
  };
  const pay = task.payment.type === "hourly" ? `£${task.payment.amount.toFixed(2)}/hr` : `£${task.payment.amount} fixed`;
  const base = `/dashboard/business/tasks/${task.id}/applicants`;
  const tabs = [
    { key: "all", label: `All (${counts.all})` },
    { key: "new", label: `New (${counts.new})` },
    { key: "shortlisted", label: `Shortlisted (${counts.shortlisted})` },
    { key: "declined", label: `Declined (${counts.declined})` },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-[10px]">
          <h1 className="type-h2 text-text-primary">{task.title}</h1>
          <div className="type-body-sm flex flex-wrap items-center gap-x-[16px] gap-y-[6px] text-text-secondary">
            <Chip type={task.status === "open" ? "success" : "neutral"}>{task.status === "open" ? "Open" : task.status}</Chip>
            <span className="flex items-center gap-[6px]"><Icon name="users-5b6472-16" />{all.length} applicant{all.length === 1 ? "" : "s"}</span>
            <span className="flex items-center gap-[6px]"><Icon name="calendar-5b6472-16" />Starts {new Date(task.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
            <span className="flex items-center gap-[6px]"><Icon name="clock-5b6472-16" />{task.estimatedHours ? `${task.estimatedHours} hrs` : "Flexible"} · {pay}</span>
          </div>
        </div>
      </div>

      <nav className="flex gap-[32px] border-b border-border-subtle">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`${base}?tab=${t.key}`}
            className={cn("type-label pb-[12px]", tab === t.key ? "border-b-2 border-teal-700 text-teal-700" : "text-text-secondary")}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col items-start gap-[24px] lg:flex-row">
        <section className="w-full min-w-0 flex-1 overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
          <div className="flex items-center justify-between border-b border-border-subtle px-[17px] py-[13px]">
            <p className="type-body-sm text-text-secondary">Sorted by best match</p>
            <label className="flex h-[40px] items-center gap-[8px] rounded-md border border-border-default px-[12px]">
              <Icon name="search-6b7280-16" />
              <input placeholder="Search applicants" className="type-body-sm w-[120px] bg-transparent outline-none placeholder:text-text-muted" />
            </label>
          </div>
          {visible.length === 0 && <p className="type-body-sm p-[24px] text-text-secondary">No applicants here yet.</p>}
          <ul>
            {visible.map((a) => {
              const i = all.indexOf(a);
              const m = matchLabel(a);
              const st = statusChip[a.status] ?? statusChip.submitted;
              return (
                <li key={a.id}>
                  <Link
                    href={`${base}?tab=${tab}&a=${a.id}`}
                    className={cn("flex items-center gap-[16px] border-b border-border-subtle px-[16px] py-[16px]", a.id === selected?.id ? "bg-teal-50" : "hover:bg-navy-50")}
                  >
                    <Avatar initials={a.student.name ? initials(a.student.name) : String.fromCharCode(65 + i)} tone={tones[i % 3]} size={40} />
                    <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                      <span className="type-label text-text-primary">{displayName(a, i)}</span>
                      <span className="type-caption truncate text-text-secondary">{a.student.university} · {a.student.fieldOfStudy}</span>
                    </div>
                    <Chip type={m.full ? "teal" : "warning"}>{m.text}</Chip>
                    <Chip type={st.type}>{st.label}</Chip>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {selected && (
          <aside className="flex w-full flex-col gap-[20px] rounded-lg border border-teal-700 bg-surface-card p-[29px] lg:w-[440px] lg:shrink-0">
            <div className="flex items-start gap-[12px] rounded-md bg-navy-900 px-[18px] py-[16px]">
              <Icon name="spark-f2a541-20" />
              <div className="flex flex-col gap-[4px]">
                <p className="type-label text-text-inverse">
                  {selected.student.name ? "Chosen · details revealed" : "Details hidden until chosen"}
                </p>
                <p className="type-caption text-navy-100">Ranked by match: meets {matchLabel(selected).text}.</p>
              </div>
            </div>

            <div className="flex items-center gap-[16px]">
              <Avatar initials={selected.student.name ? initials(selected.student.name) : String.fromCharCode(65 + selIndex)} tone={tones[selIndex % 3]} size={56} />
              <div className="flex flex-col gap-[2px]">
                <p className="type-h3 text-text-primary">{displayName(selected, selIndex)}</p>
                <p className="type-caption text-text-secondary">{selected.student.university} · {selected.student.fieldOfStudy}</p>
              </div>
            </div>

            <div className="h-px bg-border-subtle" />
            <div className="flex flex-col gap-[12px]">
              <p className="type-overline text-text-secondary">SKILLS MATCH</p>
              {[...task.requirements.map((s) => ({ s, req: true })), ...task.preferredExperience.map((s) => ({ s, req: false }))].map(({ s, req }) => {
                const ok = has(selected.student.skills, s);
                return (
                  <div key={`${req}-${s}`} className="flex items-center gap-[10px]">
                    <span className={cn("flex size-[20px] items-center justify-center rounded-pill", ok ? "bg-status-success-bg" : "bg-status-error-bg")}>
                      <Icon name={ok ? "check-16774a-12" : "x-c2362f-12"} />
                    </span>
                    <span className="type-body-sm flex-1 text-text-primary">{s}</span>
                    <Chip type={req ? "required" : "preferred"}>{req ? "Required" : "Preferred"}</Chip>
                  </div>
                );
              })}
            </div>

            {selected.note && (
              <>
                <div className="h-px bg-border-subtle" />
                <div className="flex flex-col gap-[8px]">
                  <p className="type-overline text-text-secondary">NOTE FROM APPLICANT</p>
                  <p className="type-body-sm text-text-primary">“{selected.note}”</p>
                </div>
              </>
            )}

            {selected.student.workHistory.length > 0 && (
              <>
                <div className="h-px bg-border-subtle" />
                <div className="flex flex-col gap-[12px]">
                  <p className="type-overline text-text-secondary">WORK HISTORY</p>
                  {selected.student.workHistory.map((w) => (
                    <div key={`${w.title}-${w.startDate}`} className="flex items-center gap-[12px]">
                      <span className="flex size-[36px] items-center justify-center rounded-[10px] bg-navy-50">
                        <Icon name="briefcase-0b2545-18" />
                      </span>
                      <div className="flex flex-col">
                        <span className="type-label text-text-primary">{w.title}</span>
                        <span className="type-caption text-text-secondary">{fmtMonth(w.startDate)} – {fmtMonth(w.endDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {(selected.student.motivations || selected.student.goals) && (
              <>
                <div className="h-px bg-border-subtle" />
                <div className="flex flex-col gap-[8px]">
                  <p className="type-overline text-text-secondary">MOTIVATION & GOALS</p>
                  {selected.student.motivations && <p className="type-body-sm text-text-primary">{selected.student.motivations}</p>}
                  {selected.student.goals && (
                    <p className="type-label-sm flex items-start gap-[6px] text-teal-700">
                      <Icon name="target-0e7c7b-16" />
                      Goal: {selected.student.goals}
                    </p>
                  )}
                </div>
              </>
            )}

            {task.status === "open" && (selected.status === "submitted" || selected.status === "shortlisted") && (
              <ApplicantActions
                applicationId={selected.id}
                label={selected.student.name ?? displayName(selected, selIndex)}
                canShortlist={selected.status === "submitted"}
              />
            )}
          </aside>
        )}
      </div>
    </>
  );
}

export default function ApplicantsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  return (
    <>
      <AppHeader role="business" account={{ name: "Tyne Brew Café", subtitle: "Business account", initials: "TB" }} />
      <main className="flex w-full flex-col gap-[32px] px-6 pb-[80px] pt-[40px] lg:px-[120px]">
        <Link href="/dashboard/business/tasks" className="type-label flex w-fit items-center gap-[6px] text-teal-700">
          <Icon name="arrow-left-0e7c7b-16" />
          Back to My tasks
        </Link>
        <Suspense fallback={<p className="type-body-sm text-text-secondary">Loading…</p>}>
          <Applicants params={params} searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
