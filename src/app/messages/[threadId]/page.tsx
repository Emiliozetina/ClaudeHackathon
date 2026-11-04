import { Suspense } from "react";
import { notFound } from "next/navigation";

import { EngagementPanel } from "@/components/engagements/EngagementPanel";
import { AutoRefresh } from "@/components/messaging/AutoRefresh";
import { toThreadListItems } from "@/components/messaging/toThreadListItems";
import { Avatar, Chip } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { getEngagementForUser, type EngagementView } from "@/lib/engagements";
import { DomainError } from "@/lib/errors";
import { getThreadForUser, listThreadsForUser, type ThreadDetail } from "@/lib/messages";
import type { EngagementStatus } from "@/types";

import { CurrentUserHeader } from "@/components/layout/CurrentUserHeader";
import { MessageForm } from "../_components/MessageForm";
import { MessageList } from "../_components/MessageList";
import { ThreadSidebar } from "../_components/ThreadSidebar";
import { initials, toneFor } from "../_components/tone";

const STATUS_LABELS: Record<EngagementStatus, string> = {
  active: "In progress",
  submitted: "Awaiting check",
  paid: "Paid",
  reviewed: "Reviewed",
};

const inboxClass = "mt-[16px] grid overflow-hidden rounded-lg border border-border-subtle bg-surface-card lg:h-[840px]";

/** Figma: 12 · Messages (11:1017) — conversations, open thread and task context in one panel. */
export default function MessageThreadPage({ params }: PageProps<"/messages/[threadId]">) {
  return (
    <>
      <CurrentUserHeader />
      <main className="mx-auto w-full max-w-[1240px] px-[20px] pt-[32px] pb-[40px]">
        <h1 className="sr-only">Conversation</h1>
        <Suspense fallback={<p className="type-body-sm mt-[16px] text-text-secondary">Loading conversation…</p>}>
          {params.then(({ threadId }) => (
            <Conversation threadId={threadId} />
          ))}
        </Suspense>
      </main>
    </>
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
        <div className={cn(inboxClass, "lg:grid-cols-[320px_1fr]")}>
          <ThreadSidebar threads={threads} />
          <p className="type-body-sm flex min-h-48 items-center justify-center bg-surface-page p-[24px] text-text-secondary">
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
    <div className={cn(inboxClass, engagement ? "lg:grid-cols-[320px_1fr_320px]" : "lg:grid-cols-[320px_1fr]")}>
      <ThreadSidebar threads={threads} selectedId={thread.id} />

      <div className="flex min-h-0 flex-col">
        <header className="flex min-h-[73px] flex-wrap items-center gap-[12px] border-b border-border-subtle px-[24px] py-[16px]">
          <Avatar initials={initials(thread.otherPartyName)} tone={toneFor(thread.otherPartyName)} size={40} />
          <h2 className="type-label min-w-0 flex-1 truncate text-text-primary">{thread.otherPartyName}</h2>
          <Chip type="teal" className="max-w-full truncate">
            {thread.taskTitle}
            {engagement && ` · ${STATUS_LABELS[engagement.status]}`}
          </Chip>
        </header>
        {/* column-reverse keeps the scroll position pinned to the newest message */}
        <div className="flex max-h-[60vh] min-h-48 flex-1 flex-col-reverse overflow-y-auto bg-surface-page p-[24px] lg:max-h-none">
          <MessageList messages={thread.messages} />
        </div>
        <MessageForm threadId={thread.id} />
      </div>

      {engagement && (
        <div className="min-h-0 overflow-y-auto border-t border-border-subtle p-[24px] lg:border-t-0 lg:border-l">
          <EngagementPanel engagement={engagement} viewerIsStudent={user.id === engagement.studentUserId} />
        </div>
      )}
      <AutoRefresh />
    </div>
  );
}
