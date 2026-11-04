import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { store } from "@/lib/store";
import { verificationProblem } from "@/lib/verification";

/**
 * POST /api/auth/verify — runs the role's check (src/lib/verification.ts) and
 * sets `verifiedAt` plus the matching profile flag.
 */
export async function POST() {
  const user = await currentUser();
  if (!user) return fail(401, "Not signed in");

  if (user.role === "student") {
    const student = store.students.find((s) => s.userId === user.id);
    if (!student) return fail(404, "Student profile not found");
    const problem = verificationProblem(user);
    if (problem) return fail(400, problem);
    student.universityEmailVerified = true;
    user.verifiedAt = new Date().toISOString();
    return ok({ profile: student });
  }

  const business = store.businesses.find((b) => b.userId === user.id);
  if (!business) return fail(404, "Business profile not found");
  const problem = verificationProblem(user, business);
  if (problem) return fail(400, problem);
  business.northEastVerified = true;
  user.verifiedAt = new Date().toISOString();
  return ok({ profile: business });
}
