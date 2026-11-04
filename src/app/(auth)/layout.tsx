import type { ReactNode } from "react";
import { AppHeader } from "@/components/ui";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <AppHeader role="public" />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 sm:py-14">
        {children}
      </main>
      <footer className="border-t border-border-subtle bg-surface-card">
        <div className="type-caption mx-auto w-full max-w-6xl px-6 py-5 text-text-secondary">
          © 2026 NEXA · Made in the North East
        </div>
      </footer>
    </div>
  );
}
