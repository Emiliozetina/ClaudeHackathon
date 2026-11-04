"use client";

import { useActionState } from "react";

import { createReviewAction, type ReviewFormState } from "@/app/engagements/actions";

export function ReviewForm({ engagementId, subjectName }: { engagementId: string; subjectName: string }) {
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(createReviewAction, {});

  return (
    <form action={formAction} className="mt-3 space-y-3 rounded border border-black/10 p-4 dark:border-white/10">
      <input type="hidden" name="engagementId" value={engagementId} />
      <div>
        <label htmlFor="rating" className="block text-sm font-medium">
          Rating for {subjectName}
        </label>
        <select
          id="rating"
          name="rating"
          defaultValue="5"
          className="mt-1 rounded border border-black/20 bg-transparent px-2 py-1 text-sm dark:border-white/20"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium">
          Comment
        </label>
        <textarea
          id="comment"
          name="comment"
          required
          rows={3}
          className="mt-1 w-full rounded border border-black/20 bg-transparent px-2 py-1 text-sm dark:border-white/20"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
