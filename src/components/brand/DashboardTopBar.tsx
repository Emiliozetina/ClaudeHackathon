import Link from "next/link";
import { NexaLogo } from "@/components/brand/NexaLogo";
import { SignOutButton } from "@/components/brand/SignOutButton";
import type { Role } from "@/types";

interface Props {
  role: Role;
  displayName: string;
  initials: string;
  subtitle?: string;
}

export function DashboardTopBar({ role, displayName, initials, subtitle }: Props) {
  return (
    <header className="border-b border-[color:var(--color-line)] bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-3.5">
        <div className="flex items-center gap-6">
          <NexaLogo />
          <nav className="hidden items-center gap-5 text-sm text-[color:var(--color-ink-muted)] sm:flex">
            {role === "business" ? (
              <>
                <span className="font-medium text-[color:var(--color-ink)]">Profile</span>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard/student"
                  className="hover:text-[color:var(--color-ink)]"
                >
                  Dashboard
                </Link>
                <span className="font-medium text-[color:var(--color-ink)]">Profile</span>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <SignOutButton />
          <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-line)] bg-white px-2.5 py-1.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-brand-soft)] text-xs font-semibold text-[color:var(--color-brand-hover)]">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-[color:var(--color-ink)]">
                {displayName}
              </span>
              {subtitle ? (
                <span className="block text-[11px] text-[color:var(--color-ink-muted)]">
                  {subtitle}
                </span>
              ) : null}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
