"use client";

import { useActionState } from "react";

import { sendMessageAction, type SendMessageState } from "@/app/messages/actions";

export function MessageForm({ threadId }: { threadId: string }) {
  const [state, formAction, pending] = useActionState<SendMessageState, FormData>(
    sendMessageAction.bind(null, threadId),
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label htmlFor="message-body" className="sr-only">
        Message
      </label>
      <textarea
        id="message-body"
        name="body"
        rows={3}
        required
        maxLength={2000}
        defaultValue={state.body}
        placeholder="Write a message…"
        className="w-full rounded border border-black/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-black/20 px-4 py-1.5 text-sm font-medium disabled:opacity-50 dark:border-white/20"
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
