import { Suspense } from "react";
import Link from "next/link";

import { DemoUserSwitcher } from "@/components/engagements/DemoUserSwitcher";
import { AutoRefresh } from "@/components/messaging/AutoRefresh";
import { LocalTime } from "@/components/messaging/LocalTime";
import { getCurrentUser } from "@/lib/auth";
import { listThreadsForUser } from "@/lib/messages";

export default function MessagesPage() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <Suspense fallback={null}>
        <DemoUserSwitcher />
      </Suspense>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Messages</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">Your conversations with businesses and students.</p>
      <Suspense fallback={<p className="mt-6 text-sm text-black/60 dark:text-white/60">Loading conversations…</p>}>
        <ThreadList />
      </Suspense>
      <AutoRefresh />
    </section>
  );
}

async function ThreadList() {
  const user = await getCurrentUser();
  const threads = listThreadsForUser(user);

  if (threads.length === 0) {
    return (
      <p className="mt-6 rounded border border-black/10 px-4 py-6 text-sm text-black/60 dark:border-white/10 dark:text-white/60">
        No conversations yet. A conversation starts when an engagement is agreed.
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-black/10 rounded border border-black/10 dark:divide-white/10 dark:border-white/10">
      {threads.map((t) => (
        <li key={t.id}>
          <Link href={`/messages/${t.id}`} className="block px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium">{t.otherPartyName}</span>
              {t.lastMessage && (
                <LocalTime iso={t.lastMessage.sentAt} className="shrink-0 text-xs text-black/60 dark:text-white/60" />
              )}
            </div>
            <p className="text-sm text-black/60 dark:text-white/60">{t.taskTitle}</p>
            <p className="mt-1 truncate text-sm">{t.lastMessage ? t.lastMessage.body : "No messages yet."}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
