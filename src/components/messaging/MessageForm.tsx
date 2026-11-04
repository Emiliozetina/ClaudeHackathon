"use client";

import { useActionState } from "react";

import { sendMessageAction, type SendMessageState } from "@/app/messages/actions";

export function MessageForm({ threadId }: { threadId: string }) {
  const [state, formAction, pending] = useActionState<SendMessageState, FormData>(
    sendMessageAction.bind(null, threadId),
    {},
  );

  return (
    <form action={formAction} className="border-t border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <label htmlFor="message-body" className="sr-only">
          Message
        </label>
        <input
          id="message-body"
          name="body"
          type="text"
          required
          maxLength={2000}
          autoComplete="off"
          defaultValue={state.body}
          placeholder="Write a message…"
          className="min-w-0 flex-1 rounded-full border border-black/10 bg-transparent px-4 py-2 text-sm dark:border-white/10"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
