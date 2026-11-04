import { Suspense } from "react";
import { ApplyForm } from "@/components/applications/ApplyForm";

async function ApplyFormLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplyForm taskId={id} />;
}

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Apply</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        Your profile plus a short note. Sent anonymously to the business.
      </p>
      <Suspense fallback={<p className="mt-6 text-sm">Loading…</p>}>
        <ApplyFormLoader params={params} />
      </Suspense>
    </section>
  );
}
