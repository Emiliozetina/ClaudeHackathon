"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/types";

interface Tab {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}

const businessTabs: Tab[] = [
  {
    href: "/dashboard/business",
    label: "Dashboard",
    match: (p) => p === "/dashboard/business",
  },
  {
    href: "/dashboard/business/tasks",
    label: "My tasks",
    match: (p) => p.startsWith("/dashboard/business/tasks"),
  },
  {
    href: "/dashboard/business/applications",
    label: "Applicants",
    match: (p) => p.startsWith("/dashboard/business/applications"),
  },
  {
    href: "/messages",
    label: "Messages",
    match: (p) => p.startsWith("/messages"),
  },
];

const studentTabs: Tab[] = [
  {
    href: "/dashboard/student",
    label: "Dashboard",
    match: (p) => p === "/dashboard/student",
  },
  {
    href: "/tasks",
    label: "Find work",
    match: (p) => p === "/tasks" || p.startsWith("/tasks/"),
  },
  {
    href: "/dashboard/student/applications",
    label: "Applications",
    match: (p) => p.startsWith("/dashboard/student/applications"),
  },
  {
    href: "/messages",
    label: "Messages",
    match: (p) => p.startsWith("/messages"),
  },
];

export function DashboardTabs({ role }: { role: Role }) {
  const pathname = usePathname() ?? "";
  const tabs = role === "business" ? businessTabs : studentTabs;
  return (
    <nav className="hidden items-center gap-1 text-sm sm:flex">
      {tabs.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-lg px-3 py-1.5 transition ${
              active
                ? "bg-[color:var(--color-brand-soft)] font-medium text-[color:var(--color-brand-hover)]"
                : "text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
