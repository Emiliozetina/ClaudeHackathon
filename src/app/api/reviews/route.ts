import { handle, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getEngagementForUser } from "@/lib/engagements";
import { badRequest } from "@/lib/errors";
import {
  createReview,
  listReviewsForEngagement,
  listReviewsForSubject,
  listVerifiedReferences,
} from "@/lib/reviews";

export async function GET(request: Request) {
  return handle(async () => {
    const { searchParams } = new URL(request.url);
    const engagementId = searchParams.get("engagementId");
    const subjectId = searchParams.get("subjectId");
    const referencesFor = searchParams.get("referencesFor");
    if (engagementId) {
      // Only participants may see an engagement's reviews.
      getEngagementForUser(engagementId, await getCurrentUser());
      return listReviewsForEngagement(engagementId);
    }
    if (subjectId) return listReviewsForSubject(subjectId);
    if (referencesFor) return listVerifiedReferences(referencesFor);
    throw badRequest("Pass engagementId, subjectId or referencesFor.");
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const { engagementId, rating, tags = [], comment } = await readJson(request);
    if (typeof engagementId !== "string" || !engagementId) throw badRequest("engagementId is required.");
    if (typeof rating !== "number") throw badRequest("rating must be a number.");
    if (!Array.isArray(tags) || !tags.every((t) => typeof t === "string")) {
      throw badRequest("tags must be an array of strings.");
    }
    if (typeof comment !== "string") throw badRequest("comment must be a string.");
    const review = createReview(engagementId, await getCurrentUser(), { rating, tags, comment });
    return Response.json(review, { status: 201 });
  });
}
