import {
  DEMO_USER_COOKIE,
  SESSION_COOKIE,
  demoAuthEnabled,
  profileIdFor,
  resolveUser,
} from "@/lib/auth";
import type { ID, Role } from "@/types";

/** Who is making the request. */
export interface Actor {
  role: Role;
  /** Business.id for businesses, Student.id for students. */
  profileId: ID;
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/**
 * Resolves the caller for the task/application API routes with the same rules
 * as currentUser() in src/lib/auth.ts:
 * 1. the session cookie set by /api/auth/login or /api/auth/register;
 * 2. with demo auth on and no cookie at all, the `x-dev-role` /
 *    `x-dev-profile-id` headers (curl testing);
 * 3. with demo auth on, the demo user (`demoUserId` cookie or the default).
 * Returns null (-> 401) when nobody is signed in.
 */
export function getActor(req: Request): Actor | null {
  const sessionToken = readCookie(req, SESSION_COOKIE);
  const demoUserId = readCookie(req, DEMO_USER_COOKIE);

  if (demoAuthEnabled() && !sessionToken && !demoUserId) {
    const role = req.headers.get("x-dev-role");
    const profileId = req.headers.get("x-dev-profile-id");
    if ((role === "business" || role === "student") && profileId) return { role, profileId };
  }

  const user = resolveUser(sessionToken, demoUserId);
  if (!user) return null;
  const profileId = profileIdFor(user);
  return profileId ? { role: user.role, profileId } : null;
}
