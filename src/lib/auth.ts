// TEMP: replace with real auth from #1 (Auth / Profiles).
// Everything in area #3 gets the signed-in user only through getCurrentUser(),
// so swapping this file is the whole integration.

import { cookies } from "next/headers";

import { forbidden } from "@/lib/errors";
import { store } from "@/lib/store";
import type { User } from "@/types";

export const DEMO_USER_COOKIE = "demoUserId";

/**
 * Who you are before touching the switcher. Amy (student) has engagements,
 * threads and reviews in the seed, so every demo screen has data on first load.
 */
export const DEFAULT_DEMO_USER_ID = "u-stu-1";

/** The demo user for a cookie value, falling back to the default user. */
export function resolveDemoUser(cookieUserId: string | undefined): User | undefined {
  return (
    store.users.find((u) => u.id === cookieUserId) ??
    store.users.find((u) => u.id === DEFAULT_DEMO_USER_ID) ??
    store.users[0]
  );
}

/**
 * Demo auth lets anyone act as any seed user (the `demoUserId` cookie set by
 * the global switcher, or DEFAULT_DEMO_USER_ID). It is always on in development; in production it
 * only runs when DEMO_AUTH=true. Set that ONLY on the demo deployment, and
 * never put real user data in it.
 */
export function demoAuthEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.DEMO_AUTH === "true";
}

export async function getCurrentUser(): Promise<User> {
  // Read the cookie first so the call always counts as request-time (dynamic).
  const id = (await cookies()).get(DEMO_USER_COOKIE)?.value;
  if (!demoAuthEnabled()) throw forbidden("Sign in required.");
  const user = resolveDemoUser(id);
  if (!user) throw forbidden("No demo users in the store.");
  return user;
}

/** Display name for a user: the business name or the student name. */
export function displayName(userId: string): string {
  return (
    store.businesses.find((b) => b.userId === userId)?.name ??
    store.students.find((s) => s.userId === userId)?.name ??
    "Unknown user"
  );
}

export function listDemoUsers() {
  return store.users.map((u) => ({ id: u.id, role: u.role, name: displayName(u.id) }));
}
