import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db, newId } from "@/lib/db";
import type { User } from "@/types";

/**
 * Password hashing with scrypt. Each hash is stored as
 * `scrypt$<N>$<salt-hex>$<hash-hex>` so the cost parameter can change later
 * without breaking existing passwords. Good enough for the hackathon; swap for
 * argon2 / bcrypt once a real database is in.
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
  const actual = scryptSync(password, salt, expected.length, { N });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** The session cookie name is also read by middleware/UI. */
export const SESSION_COOKIE = "nes_sid";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export function createSession(userId: string): string {
  const token = `sess_${randomBytes(24).toString("hex")}`;
  db.sessions.push({
    token,
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  });
  return token;
}

export function destroySession(token: string): void {
  const i = db.sessions.findIndex((s) => s.token === token);
  if (i >= 0) db.sessions.splice(i, 1);
}

export function lookupSession(token: string | undefined | null): User | null {
  if (!token) return null;
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return null;
  if (Date.parse(session.expiresAt) < Date.now()) {
    destroySession(token);
    return null;
  }
  return db.users.find((u) => u.id === session.userId) ?? null;
}

/** Reads the current user from the request cookies (server components / route handlers). */
export async function currentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return lookupSession(token);
}

/** A User + their business/student profile id, resolved together. */
export interface CurrentContext {
  user: User;
  profileId: string;
}

export function profileIdFor(user: User): string | null {
  if (user.role === "business") {
    return db.businesses.find((b) => b.userId === user.id)?.id ?? null;
  }
  return db.students.find((s) => s.userId === user.id)?.id ?? null;
}

export { newId };
