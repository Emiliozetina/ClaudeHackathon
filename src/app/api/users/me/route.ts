import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";
import { parseBusinessProfile, parseStudentProfile } from "@/lib/validation";

/** GET /api/users/me — current user's profile (business or student). */
export async function GET() {
  const user = await currentUser();
  if (!user) return fail(401, "Not signed in");

  const profile =
    user.role === "business"
      ? db.businesses.find((b) => b.userId === user.id)
      : db.students.find((s) => s.userId === user.id);
  if (!profile) return fail(404, "Profile not found");

  return ok({ role: user.role, profile });
}

/**
 * PATCH /api/users/me
 *
 * Updates the current user's role-specific profile. The verified flag can
 * only be flipped by `/api/auth/verify`, so if the profile has already been
 * verified we keep that status when a new location/email would no longer pass.
 */
export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Not signed in");
  const body = await readJson(req);
  if (!body) return fail(400, "Body must be a JSON object");

  if (user.role === "business") {
    const existing = db.businesses.find((b) => b.userId === user.id);
    if (!existing) return fail(404, "Business profile not found");
    const parsed = parseBusinessProfile(body);
    if (!parsed.value) return fail(400, "Invalid profile", parsed.errors);
    Object.assign(existing, parsed.value);
    return ok({ profile: existing });
  }

  const existing = db.students.find((s) => s.userId === user.id);
  if (!existing) return fail(404, "Student profile not found");
  const parsed = parseStudentProfile(body);
  if (!parsed.value) return fail(400, "Invalid profile", parsed.errors);
  Object.assign(existing, parsed.value);
  return ok({ profile: existing });
}
