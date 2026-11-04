import { Suspense } from "react";

import { AutoRefresh } from "@/components/messaging/AutoRefresh";
import { ThreadSidebar } from "@/components/messaging/ThreadSidebar";
import { toThreadListItems } from "@/components/messaging/toThreadListItems";
import { getCurrentUser } from "@/lib/auth";
import { listThreadsForUser } from "@/lib/messages";

export default function MessagesPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="sr-only">Messages</h1>
      <Suspense fallback={<p className="mt-6 text-sm text-black/60 dark:text-white/60">Loading conversations…</p>}>
        <Inbox />
      </Suspense>
      <AutoRefresh />
    </section>
  );
}

async function Inbox() {
  const user = await getCurrentUser();
  const threads = listThreadsForUser(user);

  return (
    <div className="mt-6 grid overflow-hidden rounded-2xl border border-black/10 lg:h-[680px] lg:grid-cols-[300px_1fr] dark:border-white/10">
      <ThreadSidebar threads={toThreadListItems(threads)} />
      <div className="flex min-h-48 items-center justify-center p-6 text-sm text-black/60 dark:text-white/60">
        Select a conversation
      </div>
    </div>
  );
}
