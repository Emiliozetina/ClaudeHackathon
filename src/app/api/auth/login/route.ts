import { publicUser, signIn, verifyPassword } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";
import { store } from "@/lib/store";
import { parseLogin } from "@/lib/validation";

/** POST /api/auth/login  { email, password } — sets the session cookie. */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail(400, "Body must be a JSON object");

  const parsed = parseLogin(body);
  if (!parsed.value) return fail(400, "Invalid login", parsed.errors);
  const { email, password } = parsed.value;

  const user = store.users.find((u) => u.email.toLowerCase() === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return fail(401, "Email or password is incorrect");
  }

  await signIn(user.id);
  return ok({ user: publicUser(user) });
}
