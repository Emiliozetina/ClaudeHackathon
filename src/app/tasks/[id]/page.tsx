import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { formatPay } from "@/lib/tasks";

async function TaskDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const task = db.tasks.find((t) => t.id === id && t.status === "open");
  if (!task) notFound();
  const business = db.businesses.find((b) => b.id === task.businessId);

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        {business?.name} · {task.remote ? "Remote" : task.location}
      </p>

      <dl className="mt-6 grid gap-5 text-sm">
        <div>
          <dt className="font-medium">Job contents</dt>
          <dd className="mt-1">{task.description}</dd>
        </div>
        <div>
          <dt className="font-medium">Period</dt>
          <dd className="mt-1">
            {task.startDate} to {task.endDate}
            {task.estimatedHours ? `, about ${task.estimatedHours} hours` : ""}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Requirements</dt>
          <dd className="mt-1">
            <ul className="list-disc pl-5">
              {task.requirements.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </dd>
        </div>
        {task.preferredExperience.length > 0 && (
          <div>
            <dt className="font-medium">Preferred experience</dt>
            <dd className="mt-1">
              <ul className="list-disc pl-5">
                {task.preferredExperience.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </dd>
          </div>
        )}
        <div>
          <dt className="font-medium">Payment</dt>
          <dd className="mt-1">
            {formatPay(task)}
            {task.payment.notes ? `. ${task.payment.notes}` : ""}
          </dd>
        </div>
      </dl>

      <Link
        href={`/tasks/${task.id}/apply`}
        className="mt-8 inline-block rounded border px-4 py-2 text-sm font-medium"
      >
        Apply
      </Link>
    </>
  );
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <Suspense fallback={<p className="text-sm">Loading…</p>}>
        <TaskDetail params={params} />
      </Suspense>
    </section>
  );
}
