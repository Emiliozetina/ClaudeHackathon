import Link from "next/link";
import { Suspense } from "react";

import { EngagementPanel } from "@/components/engagements/EngagementPanel";
import { formatDate } from "@/components/engagements/format";
import { loadEngagement } from "@/components/engagements/load";
import { NoAccess } from "@/components/engagements/NoAccess";
import { StatusBadge } from "@/components/engagements/StatusBadge";

export default function EngagementPage({ params }: PageProps<"/engagements/[id]">) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Do the task together</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">Agreed dates and scope, check-ins and shared files.</p>
      <Suspense fallback={<p className="mt-6 text-sm text-black/60 dark:text-white/60">Loading engagement...</p>}>
        {params.then(({ id }) => (
          <EngagementDetails id={id} />
        ))}
      </Suspense>
    </section>
  );
}

async function EngagementDetails({ id }: { id: string }) {
  const result = await loadEngagement(id);
  if ("forbidden" in result) return <NoAccess />;
  const { user, engagement: e } = result;
  const viewerIsStudent = user.id === e.studentUserId;

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[1fr_20rem]">
      <article className="rounded border border-black/10 p-6 dark:border-white/10">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-medium">{e.task.title}</h2>
          <StatusBadge status={e.status} />
        </div>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-black/60 dark:text-white/60">{viewerIsStudent ? "Business" : "Student"}</dt>
            <dd className="mt-1">{viewerIsStudent ? e.businessName : e.studentName}</dd>
          </div>
          <div>
            <dt className="text-black/60 dark:text-white/60">Agreed dates</dt>
            <dd className="mt-1">
              {formatDate(e.agreedStartDate)} to {formatDate(e.agreedEndDate)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-black/60 dark:text-white/60">Scope</dt>
            <dd className="mt-1 whitespace-pre-line">{e.scope}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {e.threadId && (
            <Link href={`/messages/${e.threadId}`} className="rounded border border-black/20 px-3 py-1.5 dark:border-white/20">
              Open conversation
            </Link>
          )}
          <Link
            href={`/engagements/${e.id}/complete`}
            className="rounded border border-black/20 px-3 py-1.5 dark:border-white/20"
          >
            Payment and reviews
          </Link>
        </div>
      </article>
      <EngagementPanel engagement={e} viewerIsStudent={viewerIsStudent} />
    </div>
  );
}
