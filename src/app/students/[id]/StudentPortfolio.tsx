import { Avatar, Button, Chip, Icon, StatCard, type AvatarTone } from "@/components/ui";
import { displayName } from "@/lib/auth";
import { paymentSummary } from "@/lib/engagements";
import { listReviewsForSubject } from "@/lib/reviews";
import { store } from "@/lib/store";
import type { Engagement, Review, Student, Task, WorkHistoryItem } from "@/types";
import { CopyLinkField, DownloadPdfButton } from "./share-actions";
import { initialsOf } from "./student-header";

// Figma: Screens → "14 · Student portfolio" (11:1389).

const TONES: AvatarTone[] = ["navy", "teal", "amber"];

const monthYear = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  );

const pounds = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

function weeksBetween(start: string, end: string) {
  const days = (Date.parse(end) - Date.parse(start)) / 86_400_000;
  const weeks = Math.max(1, Math.round(days / 7));
  return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
}

function period(item: WorkHistoryItem) {
  return `${monthYear(item.startDate)} – ${item.endDate ? monthYear(item.endDate) : "now"}`;
}

type CompletedTask = { engagement: Engagement; task: Task; reference?: Review };

/** Everything the portfolio shows, worked out from the store. */
function loadPortfolio(student: Student) {
  const reviews = listReviewsForSubject(student.userId);
  const completed: CompletedTask[] = store.engagements
    .filter((e) => e.studentId === student.id && (e.status === "paid" || e.status === "reviewed"))
    .flatMap((engagement) => {
      const task = store.tasks.find((t) => t.id === engagement.taskId);
      if (!task) return [];
      const reference = reviews.find(
        (r) => r.engagementId === engagement.id && r.verifiedReference,
      );
      return [{ engagement, task, reference }];
    })
    .sort((a, b) => b.engagement.agreedStartDate.localeCompare(a.engagement.agreedStartDate));

  const verified = completed.filter((c) => c.reference);
  const ratings = reviews.map((r) => r.rating);
  const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : undefined;
  const earned = completed.reduce(
    (sum, c) => sum + paymentSummary(c.engagement, c.task).studentReceives,
    0,
  );
  const firstPaid = completed.at(-1)?.engagement.paidAt ?? completed.at(-1)?.engagement.agreedEndDate;

  // Skills proven = task requirements across completed tasks.
  const skillCounts = new Map<string, number>();
  for (const c of completed)
    for (const skill of c.task.requirements) skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1);
  const skills = [...skillCounts].sort((a, b) => b[1] - a[1]).slice(0, 4);

  const businesses = [...new Set(completed.map((c) => c.engagement.businessId))]
    .map((id) => store.businesses.find((b) => b.id === id))
    .filter((b) => b !== undefined);

  return { completed, verified, reviews, average, earned, firstPaid, skills, businesses };
}

function joinPlaces(places: string[]) {
  if (places.length <= 1) return places.join("");
  return `${places.slice(0, -1).join(", ")} and ${places.at(-1)}`;
}

export function StudentPortfolio({ student, isOwner }: { student: Student; isOwner: boolean }) {
  const data = loadPortfolio(student);
  const initials = initialsOf(student.name);
  const raters = new Set(data.reviews.map((r) => r.authorId)).size;
  const topRated = data.average !== undefined && data.average >= 4.8;
  const maxSkill = data.skills[0]?.[1] ?? 1;
  const places = [...new Set(data.businesses.map((b) => b.location))];

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-[32px] px-[20px] pt-[40px] pb-[80px]">
      {/* Profile header */}
      <section className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
        <div className="flex h-[120px] items-center justify-end bg-teal-800 px-[32px]">
          {topRated && (
            <span className="type-label-sm flex items-center gap-[6px] rounded-pill bg-amber-500 px-[12px] py-[6px] text-amber-900">
              <Icon name="award-633806-16" />
              Top rated on NEXA
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-end gap-[24px] px-[32px] pb-[28px]">
          <span
            aria-hidden
            className="type-h2 flex size-[112px] shrink-0 items-center justify-center rounded-pill bg-teal-100 text-teal-800"
          >
            {initials}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <h1 className="type-h2 text-text-primary">{student.name}</h1>
            <p className="type-body-sm flex flex-wrap items-center gap-[6px] text-text-secondary">
              <Icon name="grad-5b6472-16" />
              {student.fieldOfStudy} · {student.university}
            </p>
          </div>
          {isOwner && (
            <div className="flex items-center gap-[12px]">
              <Button variant="secondary" href="/dashboard/student/profile">
                Edit profile
              </Button>
              <Button href="#share">Share portfolio</Button>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-[24px] lg:grid-cols-4">
        <StatCard
          label="Tasks completed"
          value={String(data.completed.length)}
          delta={data.completed.length ? "All signed off" : undefined}
        />
        <StatCard
          label="Average rating"
          value={data.average !== undefined ? `${data.average.toFixed(1)} ★` : "–"}
          delta={raters ? `From ${raters} ${raters === 1 ? "business" : "businesses"}` : undefined}
        />
        <StatCard
          label="Earned on NEXA"
          value={pounds(data.earned)}
          delta={data.firstPaid ? `Since ${monthYear(data.firstPaid)}` : undefined}
        />
        <StatCard
          label="Verified references"
          value={String(data.verified.length)}
          delta={data.verified.length ? "Shown to employers" : undefined}
        />
      </section>

      {/* About & history */}
      <section className="grid gap-[24px] lg:grid-cols-2">
        <div className="flex flex-col gap-[14px] rounded-lg border border-border-subtle bg-surface-card p-[28px]">
          <h2 className="type-h4 text-text-primary">Motivation &amp; goals</h2>
          <p className="type-body text-text-primary">{student.motivations}</p>
          {student.goals && (
            <div className="flex items-center gap-[10px] rounded-md bg-teal-50 px-[14px] py-[12px]">
              <Icon name="target-0e7c7b-20" />
              <div className="flex flex-col gap-[2px]">
                <p className="type-overline text-teal-800">CAREER GOAL</p>
                <p className="type-label text-teal-800">{student.goals}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[16px] rounded-lg border border-border-subtle bg-surface-card p-[28px]">
          <div className="flex items-center justify-between">
            <h2 className="type-h4 text-text-primary">Work history</h2>
            {isOwner && (
              <Button variant="ghost" href="/dashboard/student/profile">
                Edit
              </Button>
            )}
          </div>
          {student.workHistory.length === 0 && (
            <p className="type-body-sm text-text-secondary">No work history added yet.</p>
          )}
          {student.workHistory.map((item) => (
            <div key={item.id} className="flex gap-[12px]">
              <span className="flex size-[36px] shrink-0 items-center justify-center rounded-sm bg-navy-50">
                <Icon name="briefcase-0b2545-18" />
              </span>
              <div className="flex min-w-0 flex-col gap-[2px]">
                <p className="type-label text-text-primary">{item.title}</p>
                <p className="type-caption text-text-secondary">
                  {item.organisation} · {period(item)}
                </p>
                {item.description && (
                  <p className="type-body-sm text-text-secondary">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid items-start gap-[24px] lg:grid-cols-[776fr_400fr]">
        {/* Verified experience */}
        <div className="flex flex-col gap-[16px]">
          <div className="flex items-center justify-between">
            <h2 className="type-h3 text-text-primary">Verified experience</h2>
            {data.verified.length > 0 && (
              <Chip type="success">{data.verified.length} verified</Chip>
            )}
          </div>
          {data.verified.length === 0 && (
            <p className="type-body-sm rounded-lg border border-border-subtle bg-surface-card p-[24px] text-text-secondary">
              References appear here once a business signs off a task and leaves a review.
            </p>
          )}
          {data.verified.map(({ engagement, task, reference }, i) => {
            const businessName = displayName(
              store.businesses.find((b) => b.id === engagement.businessId)?.userId ?? "",
            );
            return (
              <article
                key={engagement.id}
                className="flex flex-col gap-[16px] rounded-lg border border-border-subtle bg-surface-card p-[24px]"
              >
                <div className="flex items-start gap-[14px]">
                  <Avatar
                    initials={initialsOf(businessName)}
                    tone={TONES[i % TONES.length]}
                    size={40}
                    className="mt-[2px]"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                    <h3 className="type-h4 text-text-primary">{task.title}</h3>
                    <p className="type-caption text-text-secondary">
                      {businessName} · {task.location} · {monthYear(engagement.agreedStartDate)} ·{" "}
                      {weeksBetween(engagement.agreedStartDate, engagement.agreedEndDate)}
                    </p>
                  </div>
                  <span className="type-label-sm flex items-center gap-[6px] rounded-pill bg-status-success-bg px-[10px] py-[5px] text-status-success">
                    <Icon name="shield-16774a-14" />
                    Verified
                  </span>
                </div>
                {reference && (
                  <blockquote className="flex flex-col gap-[8px] border-l-[3px] border-teal-700 bg-surface-page px-[20px] py-[14px]">
                    <p className="type-body text-text-primary">“{reference.comment}”</p>
                    <footer className="flex items-center gap-[4px]">
                      <span className="flex gap-[4px]" aria-label={`${reference.rating} out of 5 stars`}>
                        {Array.from({ length: reference.rating }, (_, s) => (
                          <Icon key={s} name="star-f2a541-14" />
                        ))}
                      </span>
                      <span className="type-caption ml-[4px] text-text-secondary">{businessName}</span>
                    </footer>
                  </blockquote>
                )}
                {task.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-[8px]">
                    {task.requirements.map((skill) => (
                      <Chip key={skill} type="teal">
                        {skill}
                      </Chip>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-[24px]">
          {isOwner && (
            <div
              id="share"
              className="flex scroll-mt-[24px] flex-col gap-[14px] rounded-lg border border-border-subtle bg-surface-card p-[28px]"
            >
              <h2 className="type-h4 text-text-primary">Share your portfolio</h2>
              <p className="type-body-sm text-text-secondary">
                Add it to your CV, LinkedIn or graduate job applications.
              </p>
              <CopyLinkField path={`/students/${student.id}`} />
              <DownloadPdfButton />
            </div>
          )}

          {data.skills.length > 0 && (
            <div className="flex flex-col gap-[14px] rounded-lg border border-border-subtle bg-surface-card p-[28px]">
              <h2 className="type-h4 text-text-primary">Skills proven on NEXA</h2>
              {data.skills.map(([skill, count]) => (
                <div key={skill} className="flex flex-col gap-[6px]">
                  <div className="flex items-center justify-between">
                    <span className="type-label text-text-primary">{skill}</span>
                    <span className="type-caption text-text-secondary">
                      {count} {count === 1 ? "task" : "tasks"}
                    </span>
                  </div>
                  <div className="h-[8px] rounded-pill bg-teal-50">
                    <div
                      className="h-full rounded-pill bg-teal-700"
                      style={{ width: `${(count / maxSkill) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isOwner && data.businesses.length > 0 && (
            <div className="flex flex-col items-start gap-[10px] rounded-lg bg-navy-900 p-[24px]">
              <span className="flex size-[40px] items-center justify-center rounded-md bg-navy-700">
                <Icon name="map-pin-f2a541-20" />
              </span>
              <h2 className="type-h4 text-text-inverse">
                You’ve worked with {data.businesses.length} North East{" "}
                {data.businesses.length === 1 ? "business" : "businesses"}
              </h2>
              <p className="type-body-sm text-navy-100">
                {joinPlaces(places)}. Keep building your local network.
              </p>
              <Button href="/tasks" showArrow className="mt-[2px]">
                Find your next task
              </Button>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
