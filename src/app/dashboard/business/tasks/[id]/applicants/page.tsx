import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ApplicantActions } from "@/components/applications/ApplicantActions";
import { applicationsForTask, forBusiness } from "@/lib/applications";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

async function Applicants({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const user = await requireUser();
  const businessId = db.businesses.find((b) => b.userId === user.id)?.id;
  const task = db.tasks.find((t) => t.id === id && t.businessId === businessId);
  if (!task) notFound();

  const apps = applicationsForTask(task.id).map(forBusiness);
  return (
    <>
      <h2 className="mt-4 text-lg font-medium">{task.title}</h2>
      <p className="text-sm text-black/60 dark:text-white/60">
        Status: {task.status}. {apps.length} applicant{apps.length === 1 ? "" : "s"}.
      </p>
      <ul className="mt-6 grid gap-3">
        {apps.map((a) => (
          <li key={a.id} className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/15">
            <p className="font-medium">
              {a.student.name ?? "Anonymous applicant"}{" "}
              <span className="font-normal text-black/60 dark:text-white/60">({a.status})</span>
            </p>
            <p className="mt-1">{a.student.fieldOfStudy}, {a.student.university}</p>
            <p className="mt-1">Skills: {a.student.skills.join(", ") || "none listed"}</p>
            <p className="mt-1">Motivation: {a.student.motivations}</p>
            {a.note && <p className="mt-1">Note: {a.note}</p>}
            {task.status === "open" &&
              (a.status === "submitted" || a.status === "shortlisted") && (
                <ApplicantActions applicationId={a.id} />
              )}
          </li>
        ))}
      </ul>
      {apps.length === 0 && <p className="mt-6 text-sm">No applications yet.</p>}
    </>
  );
}

export default function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Review applicants</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        Anonymous profiles matched against your requirements.
      </p>
      <Suspense fallback={<p className="mt-4 text-sm">Loading…</p>}>
        <Applicants params={params} />
      </Suspense>
    </section>
  );
}
