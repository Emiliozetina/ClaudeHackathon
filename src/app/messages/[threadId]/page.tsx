import { Suspense } from "react";
import { notFound } from "next/navigation";

import { EngagementPanel } from "@/components/engagements/EngagementPanel";
import { AutoRefresh } from "@/components/messaging/AutoRefresh";
import { Avatar } from "@/components/messaging/Avatar";
import { MessageForm } from "@/components/messaging/MessageForm";
import { MessageList } from "@/components/messaging/MessageList";
import { ThreadSidebar } from "@/components/messaging/ThreadSidebar";
import { toThreadListItems } from "@/components/messaging/toThreadListItems";
import { getCurrentUser } from "@/lib/auth";
import { getEngagementForUser, type EngagementView } from "@/lib/engagements";
import { DomainError } from "@/lib/errors";
import { getThreadForUser, listThreadsForUser, type ThreadDetail } from "@/lib/messages";
import type { EngagementStatus } from "@/types";

const STATUS_LABELS: Record<EngagementStatus, string> = {
  active: "In progress",
  submitted: "Awaiting check",
  paid: "Paid",
  reviewed: "Reviewed",
};

export default function MessageThreadPage({ params }: PageProps<"/messages/[threadId]">) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="sr-only">Conversation</h1>
      <Suspense fallback={<p className="mt-6 text-sm text-black/60 dark:text-white/60">Loading conversation…</p>}>
        {params.then(({ threadId }) => (
          <Conversation threadId={threadId} />
        ))}
      </Suspense>
    </section>
  );
}

async function Conversation({ threadId }: { threadId: string }) {
  const user = await getCurrentUser();
  const threads = toThreadListItems(listThreadsForUser(user));

  let thread: ThreadDetail;
  try {
    thread = getThreadForUser(threadId, user);
  } catch (err) {
    if (err instanceof DomainError && err.code === "not_found") notFound();
    if (err instanceof DomainError && err.code === "forbidden") {
      return (
        <div className="mt-6 grid overflow-hidden rounded-2xl border border-black/10 lg:h-[680px] lg:grid-cols-[300px_1fr] dark:border-white/10">
          <ThreadSidebar threads={threads} />
          <p className="flex min-h-48 items-center justify-center p-6 text-sm text-black/60 dark:text-white/60">
            You don&apos;t have access to this conversation.
          </p>
        </div>
      );
    }
    throw err;
  }

  let engagement: EngagementView | undefined;
  try {
    engagement = getEngagementForUser(thread.engagementId, user);
  } catch (err) {
    if (!(err instanceof DomainError)) throw err;
  }

  return (
    <div
      className={`mt-6 grid overflow-hidden rounded-2xl border border-black/10 lg:h-[680px] dark:border-white/10 ${
        engagement ? "lg:grid-cols-[300px_1fr_320px]" : "lg:grid-cols-[300px_1fr]"
      }`}
    >
      <ThreadSidebar threads={threads} selectedId={thread.id} />

      <div className="flex min-h-0 flex-col">
        <header className="flex items-center gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10">
          <Avatar name={thread.otherPartyName} />
          <div className="min-w-0">
            <h2 className="truncate font-semibold">{thread.otherPartyName}</h2>
            <span className="mt-0.5 inline-block rounded-full bg-black/5 px-2.5 py-0.5 text-xs text-black/70 dark:bg-white/10 dark:text-white/70">
              {thread.taskTitle}
              {engagement && ` · ${STATUS_LABELS[engagement.status]}`}
            </span>
          </div>
        </header>
        {/* column-reverse keeps the scroll position pinned to the newest message */}
        <div className="flex max-h-[60vh] min-h-48 flex-1 flex-col-reverse overflow-y-auto p-4 lg:max-h-none">
          <MessageList messages={thread.messages} />
        </div>
        <MessageForm threadId={thread.id} />
      </div>

      {engagement && (
        <div className="min-h-0 overflow-y-auto border-t border-black/10 p-4 lg:border-t-0 lg:border-l dark:border-white/10">
          <EngagementPanel engagement={engagement} viewerIsStudent={user.id === engagement.studentUserId} />
        </div>
      )}
      <AutoRefresh />
    </div>
  );
}
