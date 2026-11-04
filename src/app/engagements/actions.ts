"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { markPaid, signOff } from "@/lib/engagements";
import { DomainError } from "@/lib/errors";
import { createReview } from "@/lib/reviews";

export type ReviewFormState = { error?: string; ok?: boolean };

function revalidateEngagement(id: string) {
  revalidatePath(`/engagements/${id}`);
  revalidatePath(`/engagements/${id}/complete`);
  revalidatePath("/dashboard/student/engagements");
}

/** Runs a mutation, swallowing domain errors (e.g. a double submit) so the page re-renders instead of crashing. */
async function runEngagementAction(formData: FormData, mutate: (id: string) => Promise<void>) {
  const id = String(formData.get("engagementId") ?? "");
  try {
    await mutate(id);
  } catch (error) {
    if (!(error instanceof DomainError)) throw error;
  }
  revalidateEngagement(id);
}

export async function signOffAction(formData: FormData) {
  await runEngagementAction(formData, async (id) => {
    signOff(id, await getCurrentUser());
  });
}

export async function markPaidAction(formData: FormData) {
  await runEngagementAction(formData, async (id) => {
    markPaid(id, await getCurrentUser());
  });
}

export async function createReviewAction(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const id = String(formData.get("engagementId") ?? "");
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "");
  try {
    createReview(id, await getCurrentUser(), rating, comment);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }
  revalidateEngagement(id);
  return { ok: true };
}
