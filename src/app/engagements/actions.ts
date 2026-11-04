"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  addMilestone,
  logHours,
  markComplete,
  payAndReview,
  requestChanges,
  toggleMilestone,
  type ReviewInput,
} from "@/lib/engagements";
import { DomainError } from "@/lib/errors";
import { store } from "@/lib/store";
import { createReview } from "@/lib/reviews";

/** Returned by every action below, for useActionState. */
export type ActionState = { error?: string; ok?: boolean };

function revalidateEngagement(id: string) {
  revalidatePath(`/engagements/${id}`);
  revalidatePath(`/engagements/${id}/complete`);
  revalidatePath("/dashboard/student/engagements");
  revalidatePath("/messages");
  const threadId = store.threads.find((t) => t.engagementId === id)?.id;
  if (threadId) revalidatePath(`/messages/${threadId}`);
}

/** Runs a mutation and turns domain errors into { error } for the form. */
async function run(formData: FormData, mutate: (id: string) => Promise<unknown>): Promise<ActionState> {
  const id = String(formData.get("engagementId") ?? "");
  try {
    await mutate(id);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }
  revalidateEngagement(id);
  return { ok: true };
}

/** Reads rating, tags (repeated "tags" fields), comment and verifiedReference ("on"). */
function readReview(formData: FormData): ReviewInput {
  return {
    rating: Number(formData.get("rating")),
    tags: formData.getAll("tags").map(String),
    comment: String(formData.get("comment") ?? ""),
    verifiedReference: formData.get("verifiedReference") === "on",
  };
}

// Student, while the work is in progress.

export async function logHoursAction(_prev: ActionState, formData: FormData) {
  return run(formData, async (id) => logHours(id, await getCurrentUser(), Number(formData.get("hours"))));
}

export async function toggleMilestoneAction(_prev: ActionState, formData: FormData) {
  return run(formData, async (id) =>
    toggleMilestone(id, await getCurrentUser(), String(formData.get("milestoneId") ?? "")),
  );
}

export async function addMilestoneAction(_prev: ActionState, formData: FormData) {
  return run(formData, async (id) => addMilestone(id, await getCurrentUser(), String(formData.get("title") ?? "")));
}

export async function markCompleteAction(_prev: ActionState, formData: FormData) {
  return run(formData, async (id) => markComplete(id, await getCurrentUser()));
}

// Business, once the student has marked the task complete.

export async function requestChangesAction(_prev: ActionState, formData: FormData) {
  return run(formData, async (id) => requestChanges(id, await getCurrentUser(), String(formData.get("note") ?? "")));
}

export async function payAndReviewAction(_prev: ActionState, formData: FormData) {
  return run(formData, async (id) => payAndReview(id, await getCurrentUser(), readReview(formData)));
}

// Student, once paid.

export async function createReviewAction(_prev: ActionState, formData: FormData) {
  return run(formData, async (id) => createReview(id, await getCurrentUser(), readReview(formData)));
}
