"use client";

import { useActionState, useId, type ReactNode } from "react";

import type { ActionState } from "@/app/engagements/actions";
import { FormError } from "@/components/engagements/ActionForm";
import { StarRating } from "@/components/reviews/StarRating";
import { Button, Checkbox, Icon } from "@/components/ui";

/**
 * Figma 13 · Review card. Posts the same fields as the shared ReviewForm
 * (engagementId, rating, tags, comment, verifiedReference). The submit button
 * sits in the footer row, outside the card, next to `secondaryAction`.
 */
export function ReviewCard({
  action,
  engagementId,
  subjectName,
  tags,
  withReference = false,
  submitLabel = "Submit review",
  secondaryAction,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  engagementId: string;
  subjectName: string;
  tags: string[];
  withReference?: boolean;
  submitLabel?: string;
  secondaryAction?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formId = useId();

  return (
    <div className="flex flex-col gap-[24px]">
      <form id={formId} action={formAction}>
        <input type="hidden" name="engagementId" value={engagementId} />
        <fieldset
          disabled={pending}
          className="flex flex-col gap-[20px] rounded-lg border border-border-subtle bg-surface-card p-[28px]"
        >
          <legend className="sr-only">Review {subjectName}</legend>
          <h2 aria-hidden className="type-h4 text-text-primary">
            Review {subjectName}
          </h2>

          <div className="flex flex-col gap-[8px]">
            <p className="type-label text-text-primary">Overall rating</p>
            <StarRating />
          </div>

          <div className="flex flex-col gap-[8px]">
            <p className="type-label text-text-primary">What stood out?</p>
            <div className="flex flex-wrap gap-[8px]">
              {tags.map((tag) => (
                <label key={tag} className="cursor-pointer">
                  <input type="checkbox" name="tags" value={tag} className="peer sr-only" />
                  <span className="type-label-sm inline-flex items-center rounded-pill bg-navy-50 px-[10px] py-[5px] text-text-secondary peer-checked:bg-teal-50 peer-checked:text-teal-800 peer-focus-visible:outline-2 peer-focus-visible:outline-teal-700">
                    {tag}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label htmlFor={`comment-${engagementId}`} className="type-label text-text-primary">
              Written review
            </label>
            <textarea
              id={`comment-${engagementId}`}
              name="comment"
              required
              rows={3}
              className="type-body w-full rounded-md border border-border-default bg-surface-card px-[15px] py-[13px] text-text-primary outline-none focus:border-teal-700 focus:shadow-[inset_0_0_0_1px_var(--color-teal-700)]"
            />
          </div>

          {withReference && (
            <div className="flex items-center gap-[12px] rounded-md bg-teal-50 px-[16px] py-[16px]">
              <Icon name="shield-0e7c7b-22" className="shrink-0" />
              <div className="flex flex-col gap-[4px]">
                <Checkbox
                  name="verifiedReference"
                  defaultChecked
                  label={`Add as a verified reference on ${subjectName}’s portfolio`}
                />
                <p className="type-caption text-teal-800">
                  Your business name and review will appear on their NEXA profile.
                </p>
              </div>
            </div>
          )}
        </fieldset>
      </form>

      {state.error && <FormError message={state.error} />}

      <div className="flex flex-wrap items-start justify-end gap-[12px]">
        {secondaryAction}
        <Button type="submit" form={formId} size="lg" showArrow disabled={pending}>
          {pending ? "Submitting..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
