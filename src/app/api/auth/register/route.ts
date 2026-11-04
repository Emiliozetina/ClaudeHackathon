import { hashPassword, publicUser, signIn } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";
import { newId, store } from "@/lib/store";
import { parseRegister } from "@/lib/validation";
import type { User } from "@/types";

/**
 * POST /api/auth/register  { email, password, role, profile }
 *
 * Creates the user and their business or student profile, then signs them in.
 * Accounts start unverified; /api/auth/verify runs the role's check.
 */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail(400, "Body must be a JSON object");

  const parsed = parseRegister(body);
  if (!parsed.value) return fail(400, "Invalid registration", parsed.errors);

  const { email, password, role, profile } = parsed.value;
  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    return fail(409, "An account with that email already exists");
  }

  const user: User = {
    id: newId("user"),
    email,
    role,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);

  if (role === "business") {
    store.businesses.push({
      id: newId("biz"),
      userId: user.id,
      name: profile.name,
      about: profile.about,
      location: profile.location,
      website: profile.website,
      northEastVerified: false,
    });
  } else {
    store.students.push({
      id: newId("stu"),
      userId: user.id,
      name: profile.name,
      university: profile.university,
      fieldOfStudy: profile.fieldOfStudy,
      skills: profile.skills,
      workHistory: profile.workHistory,
      motivations: profile.motivations,
      goals: profile.goals,
      availability: profile.availability,
      cvUrl: profile.cvUrl,
      universityEmailVerified: false,
    });
  }

  await signIn(user.id);
  return ok({ user: publicUser(user) }, 201);
}
