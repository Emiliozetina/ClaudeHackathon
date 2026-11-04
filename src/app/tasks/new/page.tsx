import { Suspense } from "react";

import { RoleGate } from "@/components/demo/RoleGate";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function NewTaskPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Post a short-term task</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        Work, period, requirements, preferred experience and pay.
      </p>
      <Suspense fallback={<p className="mt-6 text-sm">Loading…</p>}>
        <RoleGate role="business">
          <TaskForm />
        </RoleGate>
      </Suspense>
    </section>
  );
}
