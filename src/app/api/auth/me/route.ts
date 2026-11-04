import { currentUser, publicUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { store } from "@/lib/store";

/** GET /api/auth/me — the signed-in user and their profile, or 401. */
export async function GET() {
  const user = await currentUser();
  if (!user) return fail(401, "Not signed in");

  const profile =
    user.role === "business"
      ? store.businesses.find((b) => b.userId === user.id)
      : store.students.find((s) => s.userId === user.id);

  return ok({ user: publicUser(user), profile });
}
