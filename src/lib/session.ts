import { DEMO_USER_COOKIE, demoAuthEnabled, resolveDemoUser } from "@/lib/auth";
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
 * falling back to DEFAULT_DEMO_USER_ID. The UI never sends the `x-dev-role` /
 * `x-dev-profile-id` headers; they only exist for curl testing and are
 * ignored whenever the cookie is set, so pages and API always agree.
 * In production this returns null (-> 401) unless DEMO_AUTH=true; see
 * demoAuthEnabled() in src/lib/auth.ts.
 *
 * When auth is merged, replace the body of this function with the real
 * session lookup and keep the signature; the task/application routes only
 * depend on `getActor`.
 */
export function getActor(req: Request): Actor | null {
  if (!demoAuthEnabled()) return null;
  const cookieUserId = readCookie(req, DEMO_USER_COOKIE);
  const role = req.headers.get("x-dev-role");
  const profileId = req.headers.get("x-dev-profile-id");
  if (!cookieUserId && (role === "business" || role === "student") && profileId) {
    return { role, profileId };
  }

  const user = resolveDemoUser(cookieUserId);
  if (!user) return null;
  const profile =
    user.role === "business"
      ? store.businesses.find((b) => b.userId === user.id)
      : store.students.find((s) => s.userId === user.id);
  return profile ? { role: user.role, profileId: profile.id } : null;
}
