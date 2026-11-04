"use client";

import { useActionState } from "react";

import { sendMessageAction, type SendMessageState } from "@/app/messages/actions";
import { Icon } from "@/components/ui";

/** Figma 12 · Messages → composer: message field and a square teal send button. */
export function MessageForm({ threadId }: { threadId: string }) {
  const [state, formAction, pending] = useActionState<SendMessageState, FormData>(
    sendMessageAction.bind(null, threadId),
    {},
  );

  return (
    <form action={formAction} className="border-t border-border-subtle bg-surface-card px-[24px] py-[17px]">
      <div className="flex items-center gap-[12px]">
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
          className="type-body min-w-0 flex-1 rounded-md border border-border-default bg-surface-card px-[17px] py-[12px] text-text-primary outline-none placeholder:text-text-muted focus:border-teal-700 focus:shadow-[inset_0_0_0_1px_var(--color-teal-700)]"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label={pending ? "Sending" : "Send"}
          className="flex size-[44px] shrink-0 items-center justify-center rounded-md bg-teal-700 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Icon name="send-white-20" />
        </button>
      </div>
      {state.error && (
        <p role="alert" className="type-caption mt-[8px] text-status-error">
          {state.error}
        </p>
      )}
    </form>
  );
}
