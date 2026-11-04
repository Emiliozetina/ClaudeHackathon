"use client";

import { useActionState } from "react";

import type { ActionState } from "@/app/engagements/actions";
import { FormError } from "@/components/engagements/ActionForm";
import { inputClass, primaryButton } from "@/components/engagements/styles";
import { StarRating } from "@/components/reviews/StarRating";

/**
 * Review card: stars, "What stood out?" tag chips and a written review.
 * The business variant (payAndReviewAction) adds the verified reference
 * checkbox; `children` renders between the fields and the submit button
 * (e.g. the payment summary).
 */
export function ReviewForm({
  action,
  engagementId,
  subjectName,
  tags,
  withReference = false,
  submitLabel = "Submit review",
  children,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  engagementId: string;
  subjectName: string;
  tags: string[];
  withReference?: boolean;
  submitLabel?: string;
  children?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="engagementId" value={engagementId} />
      <fieldset disabled={pending} className="space-y-4 rounded border border-black/10 p-4 dark:border-white/10">
        <legend className="px-1 font-medium">Review {subjectName}</legend>

        <div>
          <p className="text-sm font-medium">Overall rating</p>
          <div className="mt-1">
            <StarRating />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">What stood out?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label key={tag} className="cursor-pointer">
                <input type="checkbox" name="tags" value={tag} className="peer sr-only" />
                <span className="inline-block rounded-full border border-black/20 px-3 py-1 text-sm peer-checked:border-teal-700 peer-checked:bg-teal-700 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-teal-700 dark:border-white/20">
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor={`comment-${engagementId}`} className="text-sm font-medium">
            Written review
          </label>
          <textarea
            id={`comment-${engagementId}`}
            name="comment"
            required
            rows={4}
            className={`${inputClass} mt-1 w-full`}
          />
        </div>

        {withReference && (
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="verifiedReference"
              defaultChecked
              className="mt-0.5 h-4 w-4 accent-teal-700"
            />
            <span>
              Add as verified reference on {subjectName}&apos;s portfolio
              <span className="block text-black/60 dark:text-white/60">
                Your business name and review will appear on their NEXA profile.
              </span>
            </span>
          </label>
        )}
      </fieldset>

      {children}

      {state.error && <FormError message={state.error} />}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}
