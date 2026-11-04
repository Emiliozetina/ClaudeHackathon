import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  createSession,
  hashPassword,
} from "@/lib/auth";
import { db, newId } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";
import { parseRegister } from "@/lib/validation";
import type { Business, Student, User } from "@/types";

/**
 * POST /api/auth/register
 *
 * Creates a user plus the matching business or student profile in one call,
 * then signs the new account in by setting the session cookie. The caller
 * decides the flow with `role`, and sends a `profile` object shaped for that
 * role (see `parseRegister`).
 */
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail(400, "Body must be a JSON object");

  const parsed = parseRegister(body);
  if (!parsed.value) return fail(400, "Invalid registration", parsed.errors);

  const { email, password, role, profile } = parsed.value;
  if (db.users.some((u) => u.email === email)) {
    return fail(409, "An account with that email already exists");
  }

  const now = new Date().toISOString();
  const user: User = {
    id: newId("user"),
    email,
    role,
    passwordHash: hashPassword(password),
    createdAt: now,
  };
  db.users.push(user);

  if (role === "business") {
    const business: Business = {
      id: newId("biz"),
      userId: user.id,
      name: profile.name,
      about: profile.about,
      location: profile.location,
      website: profile.website,
      northEastVerified: false,
    };
    db.businesses.push(business);
  } else {
    const student: Student = {
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
    };
    db.students.push(student);
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

  return ok({ user: publicUser(user) }, 201);
}

function publicUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    verifiedAt: u.verifiedAt,
    createdAt: u.createdAt,
  };
}
