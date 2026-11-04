// TEMP: replace with real auth from #1 (Auth / Profiles).
// Everything in area #3 gets the signed-in user only through getCurrentUser(),
// so swapping this file is the whole integration.

import { cookies } from "next/headers";

import { store } from "@/lib/store";
import type { User } from "@/types";

export const DEMO_USER_COOKIE = "demoUserId";

export async function getCurrentUser(): Promise<User> {
  const id = (await cookies()).get(DEMO_USER_COOKIE)?.value;
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
