import { Suspense } from "react";

import { AutoRefresh } from "@/components/messaging/AutoRefresh";
import { toThreadListItems } from "@/components/messaging/toThreadListItems";
import { requireUser } from "@/lib/auth";
import { listThreadsForUser } from "@/lib/messages";

import { CurrentUserHeader } from "@/components/layout/CurrentUserHeader";
import { ThreadSidebar } from "./_components/ThreadSidebar";

/** Figma: 12 · Messages (11:1017), with no conversation open. */
export default function MessagesPage() {
  return (
    <>
      <CurrentUserHeader />
      <main className="mx-auto w-full max-w-[1240px] px-[20px] pt-[32px] pb-[40px]">
        <h1 className="sr-only">Messages</h1>
        <Suspense fallback={<p className="type-body-sm mt-[16px] text-text-secondary">Loading conversations…</p>}>
          <Inbox />
        </Suspense>
        <AutoRefresh />
      </main>
    </>
  );
}

async function Inbox() {
  const user = await requireUser();
  const threads = listThreadsForUser(user);

  return (
    <div className="mt-[16px] grid overflow-hidden rounded-lg border border-border-subtle bg-surface-card lg:h-[840px] lg:grid-cols-[320px_1fr]">
      <ThreadSidebar threads={toThreadListItems(threads)} />
      <div className="type-body-sm flex min-h-48 items-center justify-center bg-surface-page p-[24px] text-text-secondary">
        Select a conversation
      </div>
    </div>
  );
}
