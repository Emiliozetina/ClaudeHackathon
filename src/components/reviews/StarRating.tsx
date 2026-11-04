"use client";

import { useState } from "react";

export const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

/** Five clickable stars that post their value as a hidden "rating" field. */
export function StarRating({ name = "rating" }: { name?: string }) {
  const [rating, setRating] = useState(0);

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={rating || ""} />
      <div role="radiogroup" aria-label="Overall rating" className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}, ${RATING_LABELS[n]}`}
            onClick={() => setRating(n)}
            className={`px-0.5 text-2xl leading-none ${
              n <= rating ? "text-amber-500" : "text-black/20 dark:text-white/20"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-sm text-black/60 dark:text-white/60">
        {rating ? RATING_LABELS[rating] : "Pick a rating"}
      </span>
    </div>
  );
}
