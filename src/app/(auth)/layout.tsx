import Link from "next/link";
import type { ReactNode } from "react";
import { NexaLogo } from "@/components/brand/NexaLogo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-page)]">
      <header className="border-b border-[color:var(--color-line)] bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <NexaLogo />
          <Link
            href="/login"
            className="text-sm font-medium text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-hover)]"
          >
            Sign in
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 sm:py-14">
        {children}
      </main>
      <footer className="border-t border-[color:var(--color-line)] bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-5 text-xs text-[color:var(--color-ink-muted)]">
          © 2026 NEXA · Made in the North East
        </div>
      </footer>
    </div>
  );
}
