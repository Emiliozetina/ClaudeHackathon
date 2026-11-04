import { Suspense } from "react";
import { connection } from "next/server";
import { TaskCard } from "@/components/tasks/TaskCard";
import { listOpenTasks } from "@/lib/tasks";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

async function TaskList({ searchParams }: { searchParams: SearchParams }) {
  await connection(); // tasks change at runtime, so don't prerender
  const sp = await searchParams;
  const tasks = listOpenTasks({
    q: first(sp.q),
    skill: first(sp.skill),
    location: first(sp.location),
    remote: first(sp.remote) === "on",
    minPay: Number(first(sp.minPay)) || undefined,
  });

  if (tasks.length === 0)
    return <p className="mt-6 text-sm">No tasks match those filters.</p>;
  return (
    <ul className="mt-6 grid gap-3">
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} />
      ))}
    </ul>
  );
}

export default function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Browse tasks</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        Filter short-term tasks by skill, pay and location.
      </p>

      <form className="mt-6 flex flex-wrap items-end gap-3 text-sm" action="/tasks">
        <input name="q" placeholder="Search" className="rounded border px-2 py-1" />
        <input name="skill" placeholder="Skill" className="rounded border px-2 py-1" />
        <input name="location" placeholder="Location" className="rounded border px-2 py-1" />
        <input name="minPay" type="number" min="0" placeholder="Min pay (£)" className="w-28 rounded border px-2 py-1" />
        <label className="flex items-center gap-1">
          <input name="remote" type="checkbox" /> Remote only
        </label>
        <button type="submit" className="rounded border px-3 py-1">Filter</button>
      </form>

      <Suspense fallback={<p className="mt-6 text-sm">Loading tasks…</p>}>
        <TaskList searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
