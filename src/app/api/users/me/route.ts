import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";
import { store } from "@/lib/store";
import { parseBusinessProfile, parseStudentProfile } from "@/lib/validation";

/** GET /api/users/me — the signed-in user's business or student profile. */
export async function GET() {
  const user = await currentUser();
  if (!user) return fail(401, "Not signed in");

  const profile =
    user.role === "business"
      ? store.businesses.find((b) => b.userId === user.id)
      : store.students.find((s) => s.userId === user.id);
  if (!profile) return fail(404, "Profile not found");

  return ok({ role: user.role, profile });
}

/**
 * PATCH /api/users/me — updates the signed-in user's profile. Verified flags
 * are only set by /api/auth/verify; a business that changes its location
 * loses North East verification and has to verify again.
 */
export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Not signed in");
  const body = await readJson(req);
  if (!body) return fail(400, "Body must be a JSON object");

  if (user.role === "business") {
    const existing = store.businesses.find((b) => b.userId === user.id);
    if (!existing) return fail(404, "Business profile not found");
    const parsed = parseBusinessProfile(body);
    if (!parsed.value) return fail(400, "Invalid profile", parsed.errors);
    const locationChanged = parsed.value.location.trim() !== existing.location.trim();
    Object.assign(existing, parsed.value);
    if (locationChanged) existing.northEastVerified = false;
    return ok({ profile: existing });
  }

  const existing = store.students.find((s) => s.userId === user.id);
  if (!existing) return fail(404, "Student profile not found");
  const parsed = parseStudentProfile(body);
  if (!parsed.value) return fail(400, "Invalid profile", parsed.errors);
  Object.assign(existing, parsed.value);
  return ok({ profile: existing });
}
