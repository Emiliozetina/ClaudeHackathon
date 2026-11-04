import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";

/**
 * POST /api/auth/verify
 *
 * Runs the role-specific check and flips `verifiedAt` plus the matching
 * profile flag:
 *  - students must have signed up with a `.ac.uk` email (university check)
 *  - businesses must be based in a listed North East location
 *
 * Real verification (clicking an emailed link, documentary proof) is out of
 * scope for the hackathon; this is deliberately lightweight so the demo flow
 * still exercises the state.
 */
const NORTH_EAST_LOCATIONS = [
  "newcastle upon tyne",
  "newcastle",
  "gateshead",
  "sunderland",
  "durham",
  "north tyneside",
  "south tyneside",
  "northumberland",
  "middlesbrough",
  "stockton-on-tees",
  "darlington",
  "hartlepool",
  "redcar",
];

export async function POST() {
  const user = await currentUser();
  if (!user) return fail(401, "Not signed in");

  if (user.role === "student") {
    if (!user.email.toLowerCase().endsWith(".ac.uk")) {
      return fail(400, "Student email must end in .ac.uk to be verified");
    }
    const student = db.students.find((s) => s.userId === user.id);
    if (!student) return fail(404, "Student profile not found");
    student.universityEmailVerified = true;
    user.verifiedAt = new Date().toISOString();
    return ok({ profile: student });
  }

  const business = db.businesses.find((b) => b.userId === user.id);
  if (!business) return fail(404, "Business profile not found");
  const loc = business.location.toLowerCase();
  const inNE = NORTH_EAST_LOCATIONS.some((l) => loc.includes(l));
  if (!inNE) {
    return fail(
      400,
      "Business location must be in the North East of England to be verified",
    );
  }
  business.northEastVerified = true;
  user.verifiedAt = new Date().toISOString();
  return ok({ profile: business });
}
