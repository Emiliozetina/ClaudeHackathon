import type { ReviewView } from "@/lib/reviews";

export function ReviewList({ reviews }: { reviews: ReviewView[] }) {
  if (reviews.length === 0) {
    return <p className="mt-2 text-sm text-black/60 dark:text-white/60">No reviews yet.</p>;
  }

  return (
    <ul className="mt-3 space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded border border-black/10 p-4 dark:border-white/10">
          <p className="text-sm font-medium">
            {review.authorName} &rarr; {review.subjectName}
          </p>
          <p className="mt-1 text-sm" aria-label={`Rated ${review.rating} out of 5`}>
            {"★".repeat(review.rating)}
            <span className="text-black/30 dark:text-white/30">{"★".repeat(5 - review.rating)}</span>
          </p>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">{review.comment}</p>
        </li>
      ))}
    </ul>
  );
}
