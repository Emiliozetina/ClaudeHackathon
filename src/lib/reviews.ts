import { displayName } from "@/lib/auth";
import { getEngagementForUser, saveReview, type ReviewInput } from "@/lib/engagements";
import { badRequest } from "@/lib/errors";
import { store } from "@/lib/store";
import type { Review, User } from "@/types";

export interface ReviewView extends Review {
  authorName: string;
  subjectName: string;
}

/** Tags offered under "What stood out?", by who is being reviewed. */
export const STUDENT_REVIEW_TAGS = ["Reliable", "Creative", "Great communicator", "Fast learner", "Went above and beyond"];
export const BUSINESS_REVIEW_TAGS = ["Clear brief", "Quick feedback", "Friendly", "Paid on time", "Would work with again"];

function toView(review: Review): ReviewView {
  return {
    ...review,
    authorName: displayName(review.authorId),
    subjectName: displayName(review.subjectId),
  };
}

/**
 * Whether this user can still leave a review. The business reviews as part of
 * paying (payAndReview); the student reviews the business once paid.
 */
export function canReview(engagementId: string, user: User): boolean {
  const view = getEngagementForUser(engagementId, user);
  return (
    user.id === view.studentUserId &&
    view.status === "paid" &&
    !store.reviews.some((r) => r.engagementId === engagementId && r.authorId === user.id)
  );
}

/** Student reviews the business after being paid. */
export function createReview(engagementId: string, user: User, input: ReviewInput): ReviewView {
  const view = getEngagementForUser(engagementId, user);
  if (user.id !== view.studentUserId) {
    throw badRequest("Businesses review the student when they pay.");
  }
  if (view.status !== "paid") throw badRequest("You can review once you've been paid.");
  const engagement = store.engagements.find((e) => e.id === engagementId)!;
  return toView(saveReview(engagement, user, input));
}

export function listReviewsForEngagement(engagementId: string): ReviewView[] {
  return store.reviews.filter((r) => r.engagementId === engagementId).map(toView);
}

/** Reviews about a user; for students these act as references on their profile. */
export function listReviewsForSubject(subjectId: string): ReviewView[] {
  return store.reviews.filter((r) => r.subjectId === subjectId).map(toView);
}

/** Verified references shown on a student's portfolio. */
export function listVerifiedReferences(studentUserId: string): ReviewView[] {
  return listReviewsForSubject(studentUserId).filter((r) => r.verifiedReference);
}
