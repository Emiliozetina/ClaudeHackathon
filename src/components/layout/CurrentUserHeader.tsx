import { Suspense } from "react";

import { AppHeader, type HeaderAccount } from "@/components/ui";
import { displayName, getCurrentUser } from "@/lib/auth";
import { DomainError } from "@/lib/errors";
import { store } from "@/lib/store";
import type { User } from "@/types";

/** First letters of the first two words, as in Figma: "Tyne Brew Café" -> "TB", "Amy Carter" -> "AC". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

/** Header account block for a user: their name, plus university or "Business account". */
export function headerAccountFor(user: User): HeaderAccount {
  const name = displayName(user.id);
  const subtitle =
    user.role === "business"
      ? "Business account"
      : (store.students.find((s) => s.userId === user.id)?.university ?? "Student");
  return { name, subtitle, initials: initialsOf(name) };
}

/** App header for a known user. */
export function HeaderForUser({ user }: { user: User }) {
  return <AppHeader role={user.role} account={headerAccountFor(user)} />;
}

async function CurrentUserHeaderInner() {
  let user: User;
  try {
    user = await getCurrentUser();
  } catch (err) {
    // Demo auth is off (production without DEMO_AUTH): show the public header.
    if (err instanceof DomainError) return <AppHeader role="public" />;
    throw err;
  }
  return <HeaderForUser user={user} />;
}

/**
 * App header for the current (demo) user. Reads the demo cookie, so it streams
 * in behind a header-sized placeholder.
 */
export function CurrentUserHeader() {
  return (
    <Suspense fallback={<div className="h-[72px] border-b border-border-subtle bg-surface-card" />}>
      <CurrentUserHeaderInner />
    </Suspense>
  );
}
