import Link from "next/link";
import { PublicTopBar } from "@/components/brand/PublicTopBar";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-page)]">
      <PublicTopBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-ink)] sm:text-5xl">
          Real work. Right here.
        </h1>
        <p className="mt-4 max-w-2xl text-[color:var(--color-ink-muted)]">
          Overloaded North East businesses post a short-term task instead of hiring full-time.
          Students apply directly and build the experience that keeps them here.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[color:var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(13,27,42,0.08)] transition hover:bg-[color:var(--color-brand-hover)]"
          >
            Get started <span aria-hidden>→</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-line)] bg-white px-4 py-2.5 text-sm font-medium text-[color:var(--color-ink)] hover:border-[color:var(--color-ink-muted)]"
          >
            Sign in
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
          >
            How it works
          </Link>
        </div>
      </main>
    </div>
  );
}
