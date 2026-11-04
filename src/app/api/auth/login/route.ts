import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  createSession,
  verifyPassword,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";
import { parseLogin } from "@/lib/validation";

/** POST /api/auth/login — email + password, sets the session cookie. */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail(400, "Body must be a JSON object");

  const parsed = parseLogin(body);
  if (!parsed.value) return fail(400, "Invalid login", parsed.errors);

  const user = db.users.find((u) => u.email === parsed.value!.email);
  if (!user || !verifyPassword(parsed.value.password, user.passwordHash)) {
    return fail(401, "Email or password is incorrect");
  }

  const token = createSession(user.id);
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return ok({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      verifiedAt: user.verifiedAt,
    },
  });
}
