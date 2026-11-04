import { handle, readJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getEngagementForUser } from "@/lib/engagements";
import { badRequest } from "@/lib/errors";
import { createReview, listReviewsForEngagement, listReviewsForSubject } from "@/lib/reviews";

export async function GET(request: Request) {
  return handle(async () => {
    const { searchParams } = new URL(request.url);
    const engagementId = searchParams.get("engagementId");
    const subjectId = searchParams.get("subjectId");
    if (engagementId) {
      // Only participants may see an engagement's reviews.
      getEngagementForUser(engagementId, await getCurrentUser());
      return listReviewsForEngagement(engagementId);
    }
    if (subjectId) return listReviewsForSubject(subjectId);
    throw badRequest("Pass engagementId or subjectId.");
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    const { engagementId, rating, comment } = await readJson(request);
    if (typeof engagementId !== "string" || !engagementId) throw badRequest("engagementId is required.");
    if (typeof rating !== "number") throw badRequest("rating must be a number.");
    if (typeof comment !== "string") throw badRequest("comment must be a string.");
    const review = createReview(engagementId, await getCurrentUser(), rating, comment);
    return Response.json(review, { status: 201 });
  });
}
