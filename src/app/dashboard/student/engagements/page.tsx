import Link from "next/link";
import { Suspense } from "react";

import { formatDate } from "@/components/engagements/format";
import { StatusBadge } from "@/components/engagements/StatusBadge";
import { requireUser } from "@/lib/auth";
import { listEngagementsForUser } from "@/lib/engagements";

export default function StudentEngagementsPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Your work</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">Tasks you were chosen for, in progress and completed.</p>
      <Suspense fallback={<p className="mt-6 text-sm text-black/60 dark:text-white/60">Loading your work...</p>}>
        <EngagementList />
      </Suspense>
    </section>
  );
}

async function EngagementList() {
  const user = await requireUser();
  const engagements = listEngagementsForUser(user);

  if (engagements.length === 0) {
    return <p className="mt-6 text-sm text-black/60 dark:text-white/60">No engagements yet.</p>;
  }

  return (
    <ul className="mt-6 space-y-3">
      {engagements.map((e) => {
        const otherParty = user.id === e.businessUserId ? e.studentName : e.businessName;
        return (
          <li key={e.id}>
            <Link
              href={`/engagements/${e.id}`}
              className="block rounded border border-black/10 p-4 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{e.task.title}</h2>
                  <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                    With {otherParty} &middot; {formatDate(e.agreedStartDate)} to {formatDate(e.agreedEndDate)}
                  </p>
                </div>
                <StatusBadge status={e.status} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
