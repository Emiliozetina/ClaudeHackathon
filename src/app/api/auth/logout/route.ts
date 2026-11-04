import { cookies } from "next/headers";
import { SESSION_COOKIE, destroySession } from "@/lib/auth";
import { ok } from "@/lib/http";

/** POST /api/auth/logout — clears the session cookie. */
export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) destroySession(token);
  store.delete(SESSION_COOKIE);
  return ok({ ok: true });
}
