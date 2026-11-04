"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Avatar, type AvatarTone } from "./Avatar";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

export type HeaderRole = "business" | "student" | "public";

type HeaderLink = { label: string; href: string };

/** Nav labels from Figma: Components → App header (4:100). */
const links: Record<HeaderRole, HeaderLink[]> = {
  business: [
    { label: "Dashboard", href: "/dashboard/business" },
    { label: "My tasks", href: "/dashboard/business/tasks" },
    { label: "Applicants", href: "/dashboard/business/applications" },
    { label: "Messages", href: "/messages" },
  ],
  student: [
    { label: "Find work", href: "/tasks" },
    { label: "Applications", href: "/dashboard/student/applications" },
    { label: "Messages", href: "/messages" },
    { label: "Portfolio", href: "/dashboard/student/profile" },
  ],
  public: [
    { label: "How it works", href: "/how-it-works" },
    { label: "For businesses", href: "/register/business" },
    { label: "For students", href: "/register/student" },
    { label: "About", href: "/about" },
  ],
};

const homeHref: Record<HeaderRole, string> = {
  business: "/dashboard/business",
  student: "/tasks",
  public: "/",
};

export type HeaderAccount = {
  name: string;
  /** Second line, e.g. "Business account" or the student's university. */
  subtitle: string;
  initials: string;
};

type AppHeaderProps =
  | { role: "public"; account?: undefined }
  | { role: "business" | "student"; account: HeaderAccount };

/** The link whose href is the longest prefix of the current path is active. */
function activeHref(pathname: string, items: HeaderLink[]) {
  return items
    .filter((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

/**
 * Figma: Design system → Components → App header (4:100).
 * 72px tall, 40px side padding, white with a bottom border/subtle line.
 */
function NavItems({ items, current }: { items: HeaderLink[]; current?: string }) {
  return items.map((item) => (
    <NavLink key={item.href} href={item.href} active={item.href === current}>
      {item.label}
    </NavLink>
  ));
}

/** Reads the URL, so it sits inside <Suspense> for dynamic routes. */
function ActiveNavItems({ items }: { items: HeaderLink[] }) {
  const pathname = usePathname();
  return <NavItems items={items} current={activeHref(pathname, items)} />;
}

export function AppHeader(props: AppHeaderProps) {
  const { role } = props;
  const items = links[role];
  const tone: AvatarTone = role === "business" ? "navy" : "teal";

  return (
    <header className="flex h-[72px] w-full items-center justify-between border-b border-border-subtle bg-surface-card px-4 md:px-[40px]">
      <div className="flex min-w-0 items-center gap-[40px]">
        <Link href={homeHref[role]} aria-label="NEXA home">
          <Logo />
        </Link>
        {/* Nav links are hidden on narrow screens; Figma only has the 1440px layout. */}
        <nav className="hidden items-center gap-[28px] lg:flex">
          <Suspense fallback={<NavItems items={items} />}>
            <ActiveNavItems items={items} />
          </Suspense>
        </nav>
      </div>

      <div className="flex items-center gap-[16px]">
        {role === "public" ? (
          <>
            <Button variant="ghost" href="/login">
              Sign in
            </Button>
            <Button href="/register">Get started</Button>
          </>
        ) : (
          <>
            {role === "business" && <Button href="/tasks/new">Post a task</Button>}
            <button type="button" className="shrink-0 rounded-pill" aria-label="Notifications">
              <Icon name="notifications" />
            </button>
            <div className="flex items-center gap-[10px]">
              <Avatar initials={props.account.initials} tone={tone} size={40} />
              <div className="hidden flex-col whitespace-nowrap md:flex">
                <span className="type-label text-text-primary">{props.account.name}</span>
                <span className="type-caption text-text-secondary">{props.account.subtitle}</span>
              </div>
              <Icon name="chevron-down-16" />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
