import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

/**
 * GET /api/auth/me — current user plus their role-specific profile, or 401
 * when no session is active.
 */
export async function GET() {
  const user = await currentUser();
  if (!user) return fail(401, "Not signed in");

  const profile =
    user.role === "business"
      ? db.businesses.find((b) => b.userId === user.id)
      : db.students.find((s) => s.userId === user.id);

  return ok({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      verifiedAt: user.verifiedAt,
    },
    profile,
  });
}
