import { displayName } from "@/lib/auth";
import { getEngagementForUser } from "@/lib/engagements";
import { badRequest } from "@/lib/errors";
import { newId, store } from "@/lib/store";
import type { Review, User } from "@/types";

export interface ReviewView extends Review {
  authorName: string;
  subjectName: string;
}

const REVIEWABLE = new Set(["signed_off", "paid"]);

function toView(review: Review): ReviewView {
  return {
    ...review,
    authorName: displayName(review.authorId),
    subjectName: displayName(review.subjectId),
  };
}

/** Whether this user can still leave a review on this engagement. */
export function canReview(engagementId: string, user: User): boolean {
  const view = getEngagementForUser(engagementId, user);
  return (
    REVIEWABLE.has(view.status) &&
    !store.reviews.some((r) => r.engagementId === engagementId && r.authorId === user.id)
  );
}

/**
 * Leave a review once the work is signed off. The subject is always the other
 * side. When both sides have reviewed, the engagement moves to "reviewed".
 */
export function createReview(
  engagementId: string,
  user: User,
  rating: number,
  comment: string,
): ReviewView {
  const view = getEngagementForUser(engagementId, user);
  if (!REVIEWABLE.has(view.status)) throw badRequest("Reviews open once the work is signed off.");
  if (store.reviews.some((r) => r.engagementId === engagementId && r.authorId === user.id)) {
    throw badRequest("You have already reviewed this engagement.");
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw badRequest("Rating must be 1 to 5.");
  const text = comment.trim();
  if (!text) throw badRequest("Please add a short comment.");

  const subjectId = user.id === view.businessUserId ? view.studentUserId : view.businessUserId;
  const review: Review = {
    id: newId("r"),
    engagementId,
    authorId: user.id,
    subjectId,
    rating: rating as Review["rating"],
    comment: text,
    createdAt: new Date().toISOString(),
  };
  store.reviews.push(review);

  const authors = new Set(store.reviews.filter((r) => r.engagementId === engagementId).map((r) => r.authorId));
  if (authors.has(view.businessUserId) && authors.has(view.studentUserId)) {
    store.engagements.find((e) => e.id === engagementId)!.status = "reviewed";
  }

  return toView(review);
}

export function listReviewsForEngagement(engagementId: string): ReviewView[] {
  return store.reviews.filter((r) => r.engagementId === engagementId).map(toView);
}

/** Reviews about a user; for students these act as references on their profile. */
export function listReviewsForSubject(subjectId: string): ReviewView[] {
  return store.reviews.filter((r) => r.subjectId === subjectId).map(toView);
}
