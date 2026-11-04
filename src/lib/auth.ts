// TEMP: replace with real auth from #1 (Auth / Profiles).
// Everything in area #3 gets the signed-in user only through getCurrentUser(),
// so swapping this file is the whole integration.

import { cookies } from "next/headers";

import { forbidden } from "@/lib/errors";
import { store } from "@/lib/store";
import type { User } from "@/types";

export const DEMO_USER_COOKIE = "demoUserId";

/**
 * Demo auth lets anyone act as any seed user (cookie, x-dev headers, or the
 * first user by default). It is always on in development; in production it
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
  return store.users.find((u) => u.id === id) ?? store.users[0];
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
