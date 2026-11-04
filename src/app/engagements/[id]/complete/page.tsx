import Link from "next/link";
import { Suspense } from "react";

import { createReviewAction, payAndReviewAction } from "@/app/engagements/actions";
import { DemoUserSwitcher } from "@/components/engagements/DemoUserSwitcher";
import { formatDate, formatGBP } from "@/components/engagements/format";
import { loadEngagement } from "@/components/engagements/load";
import { NoAccess } from "@/components/engagements/NoAccess";
import { PaymentSummaryCard } from "@/components/engagements/PaymentSummaryCard";
import { RequestChangesForm } from "@/components/engagements/RequestChangesForm";
import { StatusBadge } from "@/components/engagements/StatusBadge";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";
import type { EngagementView } from "@/lib/engagements";
import { BUSINESS_REVIEW_TAGS, canReview, listReviewsForEngagement, STUDENT_REVIEW_TAGS } from "@/lib/reviews";
import type { User } from "@/types";

const muted = "text-sm text-black/60 dark:text-white/60";
const card = "rounded border border-black/10 p-4 dark:border-white/10";

export default function CompleteEngagementPage({ params }: PageProps<"/engagements/[id]/complete">) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <Suspense fallback={null}>
        <DemoUserSwitcher />
      </Suspense>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Sign off, pay and review</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">Confirm the work, record payment, and rate each other.</p>
      <Suspense fallback={<p className="mt-6 text-sm text-black/60 dark:text-white/60">Loading engagement...</p>}>
        {params.then(({ id }) => (
          <CompleteEngagement id={id} />
        ))}
      </Suspense>
    </section>
  );
}

async function CompleteEngagement({ id }: { id: string }) {
  const result = await loadEngagement(id);
  if ("forbidden" in result) return <NoAccess />;
  const { user, engagement: e } = result;
  const viewerIsStudent = user.id === e.studentUserId;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/engagements/${e.id}`} className="text-sm text-black/60 underline dark:text-white/60">
          Back to {e.task.title}
        </Link>
        <StatusBadge status={e.status} />
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

function InProgress({ engagement: e }: { engagement: EngagementView }) {
  return (
    <div className={card}>
      <h2 className="text-lg font-medium">This task is still in progress</h2>
      <p className={`mt-1 ${muted}`}>
        Payment and reviews open once {e.studentName} marks the task complete.{" "}
        <Link href={`/engagements/${e.id}`} className="underline">
          Go to the engagement
        </Link>
        .
      </p>
    </div>
  );
}

function StudentWaiting({ engagement: e }: { engagement: EngagementView }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Waiting for {e.businessName} to check your work</h2>
        <p className={`mt-1 ${muted}`}>
          {e.completedAt ? `You marked it complete on ${formatDate(e.completedAt)}. ` : ""}
          You&apos;ll be paid when they approve it.
        </p>
      </div>
      <PaymentSummaryCard payment={e.payment} viewerIsStudent title="What you'll receive" />
    </div>
  );
}

function BusinessCheck({ engagement: e }: { engagement: EngagementView }) {
  const delivered = e.milestones.filter((m) => m.done);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{e.studentName} has marked the task complete</h2>
        <p className={`mt-1 ${muted}`}>
          Check the work, release payment and leave a review. Both of you review each other.
        </p>
      </div>

      <section className={card}>
        <h3 className="font-medium">What was delivered</h3>
        {delivered.length === 0 ? (
          <p className={`mt-2 ${muted}`}>No milestones were ticked off.</p>
        ) : (
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            {delivered.map((m) => (
              <li key={m.id}>{m.title}</li>
            ))}
          </ul>
        )}
        <p className={`mt-3 ${muted}`}>
          {e.hoursLogged} hrs logged
          {e.completedAt ? ` · marked complete ${formatDate(e.completedAt)}` : ""}
        </p>
      </section>

      <ReviewForm
        action={payAndReviewAction}
        engagementId={e.id}
        subjectName={e.studentName}
        tags={STUDENT_REVIEW_TAGS}
        withReference
        submitLabel={`Pay ${formatGBP(e.payment.businessPays)} & submit review`}
      >
        <PaymentSummaryCard payment={e.payment} viewerIsStudent={false} />
      </ReviewForm>

      <div>
        <p className={`mb-2 ${muted}`}>Not quite right?</p>
        <RequestChangesForm engagementId={e.id} />
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
    <div className="space-y-6">
      <section className={card}>
        <h2 className="text-lg font-medium">Payment released</h2>
        <p className={`mt-1 ${muted}`}>
          {viewerIsStudent ? `You received ${formatGBP(amount)}` : `You paid ${formatGBP(amount)}`}
          {e.paidAt ? ` on ${formatDate(e.paidAt)}` : ""}.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">Reviews</h2>
        {canReview(e.id, user) && (
          <div className="mt-3">
            <ReviewForm
              action={createReviewAction}
              engagementId={e.id}
              subjectName={e.businessName}
              tags={BUSINESS_REVIEW_TAGS}
            />
          </div>
        )}
        {!viewerIsStudent && e.status === "paid" && (
          <p className={`mt-2 ${muted}`}>Waiting for {e.studentName} to review you.</p>
        )}
        <ReviewList reviews={reviews} />
      </section>
    </div>
  );
}
