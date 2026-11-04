"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Role } from "@/types";

interface Props {
  role: Role;
  displayName: string;
  initials: string;
  subtitle?: string;
}

export function AccountMenu({ role, displayName, initials, subtitle }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const profileHref =
    role === "business" ? "/dashboard/business/profile" : "/dashboard/student/profile";

  async function signOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-[color:var(--color-line)] bg-white px-2.5 py-1.5 transition hover:border-[color:var(--color-ink-muted)]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
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
        <svg viewBox="0 0 20 20" className="hidden h-4 w-4 text-[color:var(--color-ink-muted)] sm:block" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-10 w-56 overflow-hidden rounded-xl border border-[color:var(--color-line)] bg-white py-1 shadow-[0_10px_32px_rgba(13,27,42,0.12)]"
        >
          <Link
            href={profileHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--color-ink)] hover:bg-[color:var(--color-brand-tint)]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-[color:var(--color-ink-muted)]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="10" cy="7" r="3" />
              <path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
            </svg>
            Edit profile
          </Link>
          <Link
            href="/verify"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--color-ink)] hover:bg-[color:var(--color-brand-tint)]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-[color:var(--color-ink-muted)]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 2l6 3v5c0 4-3 7-6 8-3-1-6-4-6-8V5l6-3z" strokeLinejoin="round" />
              <path d="M7 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Verification
          </Link>
          <div className="my-1 h-px bg-[color:var(--color-line)]" />
          <button
            type="button"
            onClick={signOut}
            disabled={busy}
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[color:var(--color-ink)] hover:bg-[color:var(--color-brand-tint)] disabled:opacity-60"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-[color:var(--color-ink-muted)]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3h3a1 1 0 011 1v12a1 1 0 01-1 1h-3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 10h8M13 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
