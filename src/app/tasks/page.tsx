import { Suspense } from "react";
import { connection } from "next/server";
import { AppHeader, Button, Checkbox, Icon, TaskCard } from "@/components/ui";
import { db } from "@/lib/db";
import { formatPay, listOpenTasks } from "@/lib/tasks";
import {
  currentStudent,
  durationLabel,
  headerAccount,
  initials,
  postedLabel,
  skillMatch,
  whereLabel,
} from "./_shared/student";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

const PAGE_SIZE = 10;
const MAX_PAY_FILTER = 25;

/** Figma 09 · Find work — task feed (10:568). */
async function TaskFeed({ searchParams }: { searchParams: SearchParams }) {
  await connection(); // tasks change at runtime, so don't prerender
  const sp = await searchParams;
  const student = await currentStudent();

  const q = first(sp.q) ?? "";
  const location = first(sp.location) ?? "";
  const minPay = Number(first(sp.minPay)) || 0;
  const onlyMatching = first(sp.match) === "on";
  const remote = first(sp.remote) === "on";
  const onsite = first(sp.onsite) === "on";
  const sort = first(sp.sort) === "newest" ? "newest" : "match";
  const limit = Math.max(PAGE_SIZE, Number(first(sp.limit)) || PAGE_SIZE);

  let tasks = listOpenTasks({
    q: q || undefined,
    skill: first(sp.skill),
    location: location || undefined,
    // Both or neither ticked means "anywhere".
    remote: remote && !onsite,
    minPay: minPay || undefined,
  });
  if (onsite && !remote) tasks = tasks.filter((t) => !t.remote);
  if (onlyMatching) tasks = tasks.filter((t) => skillMatch(student, t).meetsAllRequired);
  if (sort === "match") {
    // listOpenTasks is newest first; a stable sort keeps that order within a score.
    const score = (t: (typeof tasks)[number]) => {
      const m = skillMatch(student, t);
      return m.required * 10 + m.preferred;
    };
    tasks = [...tasks].sort((a, b) => score(b) - score(a));
  }

  const appliedTaskIds = new Set(
    db.applications
      .filter((a) => a.studentId === student?.id && a.status !== "withdrawn")
      .map((a) => a.taskId),
  );
  const drafts = listOpenTasks().filter(
    (t) => !appliedTaskIds.has(t.id) && skillMatch(student, t).meetsAllRequired,
  );

  const moreParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const value = first(v);
    if (value !== undefined && k !== "limit") moreParams.set(k, value);
  }
  moreParams.set("limit", String(limit + PAGE_SIZE));

  return (
    <form action="/tasks" className="flex flex-col gap-[32px]">
      {/* Search bar */}
      <div className="flex flex-col gap-[8px] rounded-lg border border-border-subtle bg-surface-card p-[9px] shadow-elevation-1 md:flex-row md:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-[10px] px-[14px] py-[10px]">
          <Icon name="search-5b6472-20" />
          <span className="sr-only">Search tasks</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Social media, photography, data entry…"
            className="type-body min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-secondary"
          />
        </label>
        <span aria-hidden className="hidden h-[32px] w-px bg-border-subtle md:block" />
        <label className="flex items-center gap-[10px] px-[14px] py-[10px] md:w-[372px]">
          <Icon name="map-pin-5b6472-20" />
          <span className="sr-only">Location</span>
          <input
            name="location"
            defaultValue={location}
            placeholder="Anywhere in the North East"
            className="type-body min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-primary"
          />
          <Icon name="chev-d-111827-16" />
        </label>
        <Button type="submit" size="lg">
          Search
        </Button>
      </div>

      {/* Profile nudge */}
      {drafts.length > 0 && (
        <div className="flex flex-col gap-[12px] rounded-lg bg-teal-50 px-[20px] py-[16px] md:flex-row md:items-center md:gap-[16px]">
          <span className="flex size-[40px] shrink-0 items-center justify-center rounded-md bg-teal-700">
            <Icon name="user-white-20" />
          </span>
          <p className="type-label flex-1 text-teal-800">
            Drafts from your profile are ready for {drafts.length} matching task
            {drafts.length === 1 ? "" : "s"}
          </p>
          <p className="type-body-sm text-teal-800">Review and send — nothing goes without your OK</p>
          <Button variant="secondary" href={`/tasks/${drafts[0]!.id}/apply`}>
            Review drafts
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-[32px] lg:flex-row lg:items-start">
        {/* Filters */}
        <aside className="flex w-full shrink-0 flex-col gap-[24px] rounded-lg border border-border-subtle bg-surface-card p-[24px] lg:w-[300px]">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-[8px]">
              <Icon name="sliders-111827-18" />
              <span className="type-h4 text-text-primary">Filters</span>
            </h2>
            <Button variant="ghost" href="/tasks">
              Clear
            </Button>
          </div>

          <div className="rounded-md bg-navy-50 p-[14px]">
            <Checkbox
              name="match"
              value="on"
              defaultChecked={onlyMatching}
              label="Only tasks I meet the required skills for"
            />
          </div>

          <fieldset className="flex flex-col gap-[12px]">
            <legend className="type-overline mb-[12px] text-text-secondary">MINIMUM PAY</legend>
            <input
              type="range"
              name="minPay"
              min={0}
              max={MAX_PAY_FILTER}
              step={0.5}
              defaultValue={minPay}
              aria-label="Minimum pay per hour"
              className="h-[6px] w-full cursor-pointer accent-teal-700"
            />
            <div className="flex justify-between">
              <span className="type-label-sm text-teal-700">
                {minPay ? `£${minPay.toFixed(2)}/hr` : "Any pay"}
              </span>
              <span className="type-caption text-text-secondary">£{MAX_PAY_FILTER}/hr+</span>
            </div>
          </fieldset>

          <div className="h-px bg-border-subtle" />

          <fieldset className="flex flex-col gap-[12px]">
            <legend className="type-overline mb-[12px] text-text-secondary">WHERE</legend>
            <Checkbox name="onsite" value="on" defaultChecked={onsite} label="On-site" />
            <Checkbox name="remote" value="on" defaultChecked={remote} label="Remote" />
          </fieldset>

          <div className="h-px bg-border-subtle" />

          <Button type="submit" variant="secondary">
            Apply filters
          </Button>
        </aside>

        {/* Results */}
        <section className="flex min-w-0 flex-1 flex-col gap-[16px]">
          <div className="flex flex-wrap items-center justify-between gap-[8px]">
            <p className="flex items-baseline gap-[6px]">
              <span className="type-label text-text-primary">
                {tasks.length} task{tasks.length === 1 ? "" : "s"}
              </span>
              <span className="type-body-sm text-text-secondary">match your skills and filters</span>
            </p>
            <label className="flex items-center gap-[6px]">
              <span className="type-body-sm text-text-secondary">Sort by</span>
              <span className="relative flex items-center">
                <select
                  name="sort"
                  defaultValue={sort}
                  className="type-label appearance-none bg-transparent pr-[22px] text-text-primary outline-none"
                >
                  <option value="match">Best match</option>
                  <option value="newest">Newest</option>
                </select>
                <Icon name="chev-d-111827-16" className="pointer-events-none absolute right-0" />
              </span>
            </label>
          </div>

          {tasks.length === 0 ? (
            <p className="type-body rounded-lg border border-border-subtle bg-surface-card p-[24px] text-text-secondary">
              No tasks match those filters.
            </p>
          ) : (
            tasks.slice(0, limit).map((t) => {
              const business = db.businesses.find((b) => b.id === t.businessId);
              const match = skillMatch(student, t);
              return (
                <TaskCard
                  key={t.id}
                  href={`/tasks/${t.id}`}
                  company={business?.name ?? "Local business"}
                  companyInitials={initials(business?.name ?? "?")}
                  location={`${whereLabel(t)} · ${postedLabel(t.createdAt)}`}
                  title={t.title}
                  description={t.description}
                  requiredSkills={t.requirements}
                  preferredSkills={t.preferredExperience}
                  pay={formatPay(t)}
                  duration={durationLabel(t)}
                  match={
                    student && match.requiredTotal > 0
                      ? `You meet ${match.required} of ${match.requiredTotal} required`
                      : undefined
                  }
                />
              );
            })
          )}

          {tasks.length > limit && (
            <Button variant="secondary" href={`/tasks?${moreParams}`} className="self-center">
              Load more tasks
            </Button>
          )}
        </section>
      </div>
    </form>
  );
}

async function Header() {
  return <AppHeader role="student" account={headerAccount(await currentStudent())} />;
}

export default function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <Suspense fallback={<div className="h-[72px] border-b border-border-subtle bg-surface-card" />}>
        <Header />
      </Suspense>
      <main className="mx-auto flex w-full max-w-[1232px] flex-col gap-[32px] px-4 pb-[64px] pt-[40px]">
        <div className="flex flex-col gap-[6px]">
          <h1 className="type-h2 text-text-primary">Find work near you</h1>
          <p className="type-body text-text-secondary">
            Short-term, paid tasks from North East businesses — matched to your skills.
          </p>
        </div>
        <Suspense fallback={<p className="type-body text-text-secondary">Loading tasks…</p>}>
          <TaskFeed searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
