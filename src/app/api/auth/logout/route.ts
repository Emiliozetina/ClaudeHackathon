import { signOut } from "@/lib/auth";
import { ok } from "@/lib/http";

/** POST /api/auth/logout — ends the session and clears the cookie. */
export async function POST() {
  await signOut();
  return ok({ ok: true });
}
