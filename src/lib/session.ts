import { SESSION_COOKIE, lookupSession, profileIdFor } from "@/lib/auth";
import type { ID, Role } from "@/types";

/** Who is making the request. */
export interface Actor {
  role: Role;
  /** Business.id for businesses, Student.id for students. */
  profileId: ID;
}

/**
 * Resolves the caller.
 *
 * Order of lookup:
 * 1. Session cookie set by `/api/auth/login` (the real path once the UI is in).
 * 2. In development only, the `x-dev-role` / `x-dev-profile-id` headers used by
 *    the task and application work before auth existed. This fallback keeps
 *    those forms working while the UI switches over, and is a no-op in prod.
 */
export function getActor(req: Request): Actor | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const token = readCookie(cookieHeader, SESSION_COOKIE);
  const user = lookupSession(token);
  if (user) {
    const profileId = profileIdFor(user);
    if (profileId) return { role: user.role, profileId };
  }

  if (process.env.NODE_ENV !== "production") {
    const role = req.headers.get("x-dev-role");
    const profileId = req.headers.get("x-dev-profile-id");
    if ((role === "business" || role === "student") && profileId) {
      return { role, profileId };
    }
  }
  return null;
}

function readCookie(header: string, name: string): string | null {
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
