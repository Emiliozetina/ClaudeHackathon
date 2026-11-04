import { DEMO_USER_COOKIE } from "@/lib/auth";
import { store } from "@/lib/store";
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
 * TEMPORARY placeholder until the real auth (api/auth, owned by the Auth /
 * Profiles work) lands. Uses the same demo user as getCurrentUser() in
 * src/lib/auth.ts: the `demoUserId` cookie set by the "acting as" switcher,
 * falling back to the first seed user. The `x-dev-role` and
 * `x-dev-profile-id` headers still work for curl testing when no cookie is set.
 *
 * When auth is merged, replace the body of this function with the real
 * session lookup and keep the signature; the task/application routes only
 * depend on `getActor`.
 */
export function getActor(req: Request): Actor | null {
  const cookieUserId = readCookie(req, DEMO_USER_COOKIE);
  const role = req.headers.get("x-dev-role");
  const profileId = req.headers.get("x-dev-profile-id");
  if (!cookieUserId && (role === "business" || role === "student") && profileId) {
    return { role, profileId };
  }

  const user = store.users.find((u) => u.id === cookieUserId) ?? store.users[0];
  if (!user) return null;
  const profile =
    user.role === "business"
      ? store.businesses.find((b) => b.userId === user.id)
      : store.students.find((s) => s.userId === user.id);
  return profile ? { role: user.role, profileId: profile.id } : null;
}
