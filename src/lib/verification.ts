import type { Business, User } from "@/types";

/**
 * Lightweight verification rules for the hackathon. Real checks (an emailed
 * link, documentary proof) are out of scope; these keep the verified state
 * meaningful in the demo flow.
 */
const NORTH_EAST_PLACES = [
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

/** Students verify with a UK university email address. */
export function isUniversityEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(".ac.uk");
}

/** Businesses verify by being based in the North East of England. */
export function isNorthEastLocation(location: string): boolean {
  const loc = location.trim().toLowerCase();
  return NORTH_EAST_PLACES.some((place) => loc.includes(place));
}

/** Why this user cannot be verified yet, or null when they can. */
export function verificationProblem(user: User, business?: Business): string | null {
  if (user.role === "student") {
    return isUniversityEmail(user.email)
      ? null
      : "Student email must end in .ac.uk to be verified.";
  }
  if (!business) return "Business profile not found.";
  return isNorthEastLocation(business.location)
    ? null
    : "Business location must be in the North East of England to be verified.";
}
