import Link from "next/link";
import { Suspense } from "react";

import { markPaidAction, signOffAction } from "@/app/engagements/actions";
import { DemoUserSwitcher } from "@/components/engagements/DemoUserSwitcher";
import { EngagementActionButton } from "@/components/engagements/EngagementActionButton";
import { formatDate, STATUS_LABELS } from "@/components/engagements/format";
import { loadEngagement } from "@/components/engagements/load";
import { NoAccess } from "@/components/engagements/NoAccess";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";
import type { EngagementView } from "@/lib/engagements";
import { canReview, listReviewsForEngagement } from "@/lib/reviews";
import type { EngagementStatus } from "@/types";

const STEPS: EngagementStatus[] = ["active", "signed_off", "paid", "reviewed"];

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
  const isBusiness = user.id === e.businessUserId;
  const reviews = listReviewsForEngagement(e.id);

  return (
    <div className="mt-6 space-y-8">
      <div>
        <Link href={`/engagements/${e.id}`} className="text-sm text-black/60 underline dark:text-white/60">
          Back to {e.task.title}
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-medium">Status</h2>
        <StatusTimeline engagement={e} />
        {isBusiness && (
          <div className="mt-4 flex gap-3">
            {e.status === "active" && (
              <EngagementActionButton engagementId={e.id} action={signOffAction}>
                Sign off work
              </EngagementActionButton>
            )}
            {e.status === "signed_off" && (
              <EngagementActionButton engagementId={e.id} action={markPaidAction}>
                Mark as paid
              </EngagementActionButton>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium">Reviews</h2>
        {canReview(e.id, user) && (
          <ReviewForm engagementId={e.id} subjectName={isBusiness ? e.studentName : e.businessName} />
        )}
        <ReviewList reviews={reviews} />
      </section>
    </div>
  );
}

function StatusTimeline({ engagement: e }: { engagement: EngagementView }) {
  const current = STEPS.indexOf(e.status);
  const dates: Partial<Record<EngagementStatus, string>> = {
    signed_off: e.signedOffAt,
    paid: e.paidAt,
  };

  return (
    <ol className="mt-3 space-y-2">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const date = dates[step];
        return (
          <li key={step} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden
              className={`inline-block h-3 w-3 rounded-full border border-black/30 dark:border-white/30 ${
                done ? "bg-black dark:bg-white" : ""
              }`}
            />
            <span className={done ? "font-medium" : "text-black/60 dark:text-white/60"}>
              {STATUS_LABELS[step]}
              {i === current && <span className="sr-only"> (current)</span>}
            </span>
            {date && <span className="text-black/60 dark:text-white/60">{formatDate(date)}</span>}
          </li>
        );
      })}
    </ol>
  );
}
