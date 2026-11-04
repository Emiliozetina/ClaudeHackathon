import Link from "next/link";
import { AccountMenu } from "@/components/brand/AccountMenu";
import { DashboardTabs } from "@/components/brand/DashboardTabs";
import { NexaLogo } from "@/components/brand/NexaLogo";
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
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <div className="flex items-center gap-7">
          <NexaLogo />
          <DashboardTabs role={role} />
        </div>
        <div className="flex items-center gap-3">
          {role === "business" ? (
            <Link
              href="/tasks/new"
              className="hidden items-center gap-1.5 rounded-xl bg-[color:var(--color-brand)] px-3.5 py-2 text-sm font-medium text-white shadow-[0_1px_2px_rgba(13,27,42,0.08)] transition hover:bg-[color:var(--color-brand-hover)] sm:inline-flex"
            >
              Post a task
            </Link>
          ) : null}
          <AccountMenu
            role={role}
            displayName={displayName}
            initials={initials}
            subtitle={subtitle}
          />
        </div>
      </div>
    </header>
  );
}
