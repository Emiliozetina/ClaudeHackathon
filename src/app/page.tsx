import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Short-term tasks. Real experience. North East.
      </h1>
      <p className="mt-4 max-w-2xl text-black/70 dark:text-white/70">
        Overloaded businesses post a short-term task instead of hiring
        full-time. Students apply directly and build the experience that keeps
        them here.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/tasks" className="underline underline-offset-4">
          Browse tasks
        </Link>
        <Link href="/tasks/new" className="underline underline-offset-4">
          Post a task
        </Link>
        <Link href="/how-it-works" className="underline underline-offset-4">
          How it works
        </Link>
      </div>
    </main>
  );
}
