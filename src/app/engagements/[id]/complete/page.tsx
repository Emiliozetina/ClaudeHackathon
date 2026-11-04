import Link from "next/link";
import { Suspense } from "react";

import { createReviewAction, payAndReviewAction } from "@/app/engagements/actions";
import { formatDate, formatGBP, STATUS_LABELS } from "@/components/engagements/format";
import { loadEngagement } from "@/components/engagements/load";
import { NoAccess } from "@/components/engagements/NoAccess";
import { ReviewList } from "@/components/reviews/ReviewList";
import { buttonClassName, Chip, Icon } from "@/components/ui";
import type { EngagementView } from "@/lib/engagements";
import { BUSINESS_REVIEW_TAGS, canReview, listReviewsForEngagement, STUDENT_REVIEW_TAGS } from "@/lib/reviews";
import type { User } from "@/types";

import { CurrentUserHeader } from "@/components/layout/CurrentUserHeader";
import { PaymentCard } from "./_components/PaymentCard";
import { RequestChanges } from "./_components/RequestChanges";
import { ReviewCard } from "./_components/ReviewCard";

const card = "rounded-lg border border-border-subtle bg-surface-card p-[28px]";
const muted = "type-body-sm text-text-secondary";

/** Figma: 13 · Sign off, pay & review (11:1198). */
export default function CompleteEngagementPage({ params }: PageProps<"/engagements/[id]/complete">) {
  return (
    <>
      <CurrentUserHeader />
      <main className="mx-auto w-full max-w-[1240px] px-[20px] pt-[40px] pb-[80px]">
        <h1 className="sr-only">Sign off, pay and review</h1>
        <Suspense fallback={<p className={`mt-[24px] ${muted}`}>Loading engagement...</p>}>
          {params.then(({ id }) => (
            <CompleteEngagement id={id} />
          ))}
        </Suspense>
      </main>
    </>
  );
}

async function CompleteEngagement({ id }: { id: string }) {
  const result = await loadEngagement(id);
  if ("forbidden" in result) return <NoAccess />;
  const { user, engagement: e } = result;
  const viewerIsStudent = user.id === e.studentUserId;

  return (
    <div className="mt-[24px] flex flex-col gap-[32px]">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <Link href={`/engagements/${e.id}`} className="type-label flex items-center gap-[6px] text-teal-700">
          <Icon name="arrow-left-0e7c7b-16" />
          Back to task
        </Link>
        <Chip type="neutral">{STATUS_LABELS[e.status]}</Chip>
      </div>

      {e.status === "active" && <InProgress engagement={e} />}
      {e.status === "submitted" &&
        (viewerIsStudent ? <StudentWaiting engagement={e} /> : <BusinessCheck engagement={e} />)}
      {(e.status === "paid" || e.status === "reviewed") && (
        <Released engagement={e} user={user} viewerIsStudent={viewerIsStudent} />
      )}
    </div>
  );
}

/** Check-mark tile + heading + subtitle, as at the top of Figma 13. */
function PageTitle({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[16px]">
      <span className="flex size-[52px] shrink-0 items-center justify-center rounded-md bg-status-success-bg">
        <Icon name="check-16774a-26" />
      </span>
      <div className="flex flex-col gap-[4px]">
        <h2 className="type-h2 text-text-primary">{title}</h2>
        <p className="type-body text-text-secondary">{subtitle}</p>
      </div>
    </div>
  );
}

function dates(e: EngagementView) {
  return `${e.task.title} · ${formatDate(e.agreedStartDate)} – ${formatDate(e.agreedEndDate)}`;
}

function InProgress({ engagement: e }: { engagement: EngagementView }) {
  return (
    <div className={card}>
      <h2 className="type-h4 text-text-primary">This task is still in progress</h2>
      <p className={`mt-[8px] ${muted}`}>
        Payment and reviews open once {e.studentName} marks the task complete.{" "}
        <Link href={`/engagements/${e.id}`} className="type-label text-teal-700 underline">
          Go to the engagement
        </Link>
        .
      </p>
    </div>
  );
}

function StudentWaiting({ engagement: e }: { engagement: EngagementView }) {
  return (
    <div className="flex flex-col gap-[32px]">
      <PageTitle
        title={`Waiting for ${e.businessName} to check your work`}
        subtitle={
          <>
            {e.completedAt ? `You marked it complete on ${formatDate(e.completedAt)}. ` : ""}
            You&apos;ll be paid when they approve it.
          </>
        }
      />
      <div className="max-w-[420px]">
        <PaymentCard
          payment={e.payment}
          viewerIsStudent
          title="What you'll receive"
          partyName={e.businessName}
          partyDetail={dates(e)}
        />
      </div>
    </div>
  );
}

const primaryButtonClass = buttonClassName({ variant: "primary" });
const secondaryButtonClass = buttonClassName({ variant: "secondary" });

function BusinessCheck({ engagement: e }: { engagement: EngagementView }) {
  const delivered = e.milestones.filter((m) => m.done);

  return (
    <div className="flex flex-col gap-[32px]">
      <PageTitle
        title={`${e.studentName} has marked the task complete`}
        subtitle="Check the work, release payment and leave a review. Both of you review each other."
      />

      <div className="grid grid-cols-1 items-start gap-[24px] lg:grid-cols-[minmax(0,756px)_minmax(0,420px)]">
        <div className="flex flex-col gap-[24px]">
          <section className={card}>
            <h2 className="type-h4 text-text-primary">What was delivered</h2>
            {delivered.length === 0 ? (
              <p className={`mt-[20px] ${muted}`}>No milestones were ticked off.</p>
            ) : (
              <ul className="mt-[20px] flex flex-col gap-[20px]">
                {delivered.map((m) => (
                  <li key={m.id} className="flex items-center gap-[12px]">
                    <span className="flex size-[22px] shrink-0 items-center justify-center rounded-pill bg-status-success-bg">
                      <Icon name="check-16774a-12" />
                    </span>
                    <span className="type-body text-text-primary">{m.title}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className={`mt-[20px] ${muted}`}>
              {e.hoursLogged} hrs logged
              {e.completedAt ? ` · marked complete ${formatDate(e.completedAt)}` : ""}
            </p>
          </section>

          <ReviewCard
            action={payAndReviewAction}
            engagementId={e.id}
            subjectName={e.studentName}
            tags={STUDENT_REVIEW_TAGS}
            withReference
            submitLabel={`Pay ${formatGBP(e.payment.businessPays)} & submit review`}
            secondaryAction={<RequestChanges engagementId={e.id} />}
          />
        </div>

        <aside className="flex flex-col gap-[24px]">
          <PaymentCard
            payment={e.payment}
            viewerIsStudent={false}
            partyName={e.studentName}
            partyDetail={dates(e)}
          />
          {/* Figma 13: "Work with … again?" rehire card. */}
          <section className="flex flex-col gap-[14px] rounded-lg bg-navy-900 p-[24px]">
            <span className="flex size-[40px] items-center justify-center rounded-[10px] bg-navy-700">
              <Icon name="users-f2a541-22" />
            </span>
            <h2 className="type-h4 text-text-inverse">Work with {e.studentName.split(" ")[0]} again?</h2>
            <p className="type-body-sm text-navy-100">
              Invite them straight to your next task or save them to your local talent pool.
            </p>
            <Link href="/tasks/new/describe" className={`${primaryButtonClass} w-full`}>
              Invite to a new task
            </Link>
            <Link href="/dashboard/business/talent-pool" className={`${secondaryButtonClass} w-full`}>
              Save to talent pool
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Released({
  engagement: e,
  user,
  viewerIsStudent,
}: {
  engagement: EngagementView;
  user: User;
  viewerIsStudent: boolean;
}) {
  const reviews = listReviewsForEngagement(e.id);
  const amount = viewerIsStudent ? e.payment.studentReceives : e.payment.businessPays;

  return (
    <div className="flex max-w-[756px] flex-col gap-[24px]">
      <PageTitle
        title="Payment released"
        subtitle={
          <>
            {viewerIsStudent ? `You received ${formatGBP(amount)}` : `You paid ${formatGBP(amount)}`}
            {e.paidAt ? ` on ${formatDate(e.paidAt)}` : ""}.
          </>
        }
      />

      <section className="flex flex-col gap-[16px]">
        <h2 className="type-h4 text-text-primary">Reviews</h2>
        {canReview(e.id, user) && (
          <ReviewCard
            action={createReviewAction}
            engagementId={e.id}
            subjectName={e.businessName}
            tags={BUSINESS_REVIEW_TAGS}
          />
        )}
        {!viewerIsStudent && e.status === "paid" && (
          <p className={muted}>Waiting for {e.studentName} to review you.</p>
        )}
        <ReviewList reviews={reviews} />
      </section>
    </div>
  );
}
