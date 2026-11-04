import type { ReviewView } from "@/lib/reviews";

export function ReviewList({ reviews }: { reviews: ReviewView[] }) {
  if (reviews.length === 0) {
    return <p className="mt-2 text-sm text-black/60 dark:text-white/60">No reviews yet.</p>;
  }

  return (
    <ul className="mt-3 space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded border border-black/10 p-4 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {review.authorName} &rarr; {review.subjectName}
            </p>
            {review.verifiedReference && (
              <span className="rounded-full bg-teal-700 px-2 py-0.5 text-xs font-medium text-white">
                Verified reference
              </span>
            )}
          </div>
          <p className="mt-1 text-amber-500" aria-label={`Rated ${review.rating} out of 5`}>
            {"★".repeat(review.rating)}
            <span className="text-black/20 dark:text-white/20">{"★".repeat(5 - review.rating)}</span>
          </p>
          {review.tags.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="What stood out">
              {review.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-black/10 px-2 py-0.5 text-xs dark:border-white/10"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">{review.comment}</p>
        </li>
      ))}
    </ul>
  );
}
