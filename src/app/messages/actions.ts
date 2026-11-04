"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { DomainError } from "@/lib/errors";
import { sendMessage } from "@/lib/messages";

export interface SendMessageState {
  error?: string;
  /** The text the user typed, kept on error so it isn't lost. */
  body?: string;
}

export async function sendMessageAction(
  threadId: string,
  _prev: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const body = String(formData.get("body") ?? "");
  try {
    const user = await getCurrentUser();
    sendMessage(threadId, user, body);
  } catch (err) {
    if (err instanceof DomainError) return { error: err.message, body };
    throw err;
  }
  revalidatePath(`/messages/${threadId}`);
  revalidatePath("/messages");
  return {};
}
