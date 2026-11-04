import type { ID, Role } from "@/types";

/** Who is making the request. */
export interface Actor {
  role: Role;
  /** Business.id for businesses, Student.id for students. */
  profileId: ID;
}

/**
 * TEMPORARY placeholder until the real auth (api/auth, owned by the Auth /
 * Profiles work) lands. In development the caller identifies itself with the
 * `x-dev-role` and `x-dev-profile-id` headers. It always returns null in
 * production, so nothing here can be used to bypass real login.
 *
 * When auth is merged, replace the body of this function with the real
 * session lookup and keep the signature; the task/application routes only
 * depend on `getActor`.
 */
export function getActor(req: Request): Actor | null {
  if (process.env.NODE_ENV === "production") return null;

  const role = req.headers.get("x-dev-role");
  const profileId = req.headers.get("x-dev-profile-id");
  if ((role === "business" || role === "student") && profileId) {
    return { role, profileId };
  }
  return null;
}
