// Auth for the whole app. Every other area reads the signed-in user only
// through this file (currentUser / getCurrentUser / requireUser) and
// src/lib/session.ts (getActor for the task/application API routes).

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { unauthorized } from "@/lib/errors";
import { store } from "@/lib/store";
import type { ID, User } from "@/types";

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

/**
 * scrypt hashes are stored as `scrypt$<N>$<salt-hex>$<hash-hex>` so the cost
 * can change later without breaking existing passwords.
 */
const SCRYPT_N = 16384;
const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_N });
  return `scrypt$${SCRYPT_N}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;
  const N = Number(parts[1]);
  const salt = Buffer.from(parts[2], "hex");
  const expected = Buffer.from(parts[3], "hex");
  if (!Number.isInteger(N) || expected.length === 0) return false;
  const actual = scryptSync(password, salt, expected.length, { N });
  return timingSafeEqual(actual, expected);
}

// ---------------------------------------------------------------------------
// Sessions (kept in the shared store, so they reset with it)
// ---------------------------------------------------------------------------

export const SESSION_COOKIE = "nexa_sid";
const SESSION_TTL_S = 60 * 60 * 24 * 7;

export function createSession(userId: ID): string {
  const token = `sess_${randomBytes(24).toString("hex")}`;
  store.sessions.push({
    token,
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_S * 1000).toISOString(),
  });
  return token;
}

export function destroySession(token: string): void {
  const i = store.sessions.findIndex((s) => s.token === token);
  if (i >= 0) store.sessions.splice(i, 1);
}

export function lookupSession(token: string | undefined | null): User | null {
  if (!token) return null;
  const session = store.sessions.find((s) => s.token === token);
  if (!session) return null;
  if (Date.parse(session.expiresAt) < Date.now()) {
    destroySession(token);
    return null;
  }
  return store.users.find((u) => u.id === session.userId) ?? null;
}

/** Starts a session and sets the cookie. Route handlers and server actions only. */
export async function signIn(userId: ID): Promise<void> {
  const jar = await cookies();
  jar.set({
    name: SESSION_COOKIE,
    value: createSession(userId),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
  // A real sign-in replaces whoever the demo switcher was acting as.
  jar.delete(DEMO_USER_COOKIE);
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) destroySession(token);
  jar.delete(SESSION_COOKIE);
}

// ---------------------------------------------------------------------------
// Demo auth
// ---------------------------------------------------------------------------

export const DEMO_USER_COOKIE = "demoUserId";

/**
 * Demo auth lets anyone act as any seed user without a password (the
 * `demoUserId` cookie set by the "acting as" switcher, or the first seed user
 * by default). A real session always wins over it. It is always on in
 * development; in production it only runs when DEMO_AUTH=true. Set that ONLY
 * on the demo deployment, and never put real user data in it.
 */
export function demoAuthEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.DEMO_AUTH === "true";
}

function demoUser(demoUserId: string | undefined): User | null {
  if (!demoAuthEnabled()) return null;
  return store.users.find((u) => u.id === demoUserId) ?? store.users[0] ?? null;
}

// ---------------------------------------------------------------------------
// Who is signed in
// ---------------------------------------------------------------------------

/** The session user, else the demo user (when demo auth is on), else null. */
export function resolveUser(
  sessionToken: string | undefined,
  demoUserId: string | undefined,
): User | null {
  return lookupSession(sessionToken) ?? demoUser(demoUserId);
}

/** The signed-in user, or null. Server components, actions and route handlers. */
export async function currentUser(): Promise<User | null> {
  // Session expiry reads the clock, so this always runs at request time.
  await connection();
  const jar = await cookies();
  return resolveUser(jar.get(SESSION_COOKIE)?.value, jar.get(DEMO_USER_COOKIE)?.value);
}

/** The signed-in user, or a 401 DomainError. Route handlers and server actions. */
export async function getCurrentUser(): Promise<User> {
  const user = await currentUser();
  if (!user) throw unauthorized();
  return user;
}

/** The signed-in user, or a redirect to /login. Pages and layouts. */
export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

/** Business.id for businesses, Student.id for students. */
export function profileIdFor(user: User): ID | null {
  if (user.role === "business") {
    return store.businesses.find((b) => b.userId === user.id)?.id ?? null;
  }
  return store.students.find((s) => s.userId === user.id)?.id ?? null;
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

/** User fields that are safe to send to the browser (never the password hash). */
export function publicUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    verifiedAt: u.verifiedAt,
    createdAt: u.createdAt,
  };
}
