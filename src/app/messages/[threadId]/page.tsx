import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DemoUserSwitcher } from "@/components/engagements/DemoUserSwitcher";
import { AutoRefresh } from "@/components/messaging/AutoRefresh";
import { MessageForm } from "@/components/messaging/MessageForm";
import { MessageList } from "@/components/messaging/MessageList";
import { getCurrentUser } from "@/lib/auth";
import { DomainError } from "@/lib/errors";
import { getThreadForUser, type ThreadDetail } from "@/lib/messages";

export default function MessageThreadPage({ params }: PageProps<"/messages/[threadId]">) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <Suspense fallback={null}>
        <DemoUserSwitcher />
      </Suspense>
      <p className="mt-6 text-sm">
        <Link href="/messages" className="text-black/60 hover:underline dark:text-white/60">
          ← All messages
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Conversation</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">In-app messages for an engagement.</p>
      <Suspense fallback={<p className="mt-6 text-sm text-black/60 dark:text-white/60">Loading conversation…</p>}>
        {params.then(({ threadId }) => (
          <Thread threadId={threadId} />
        ))}
      </Suspense>
    </section>
  );
}

async function Thread({ threadId }: { threadId: string }) {
  const user = await getCurrentUser();

  let thread: ThreadDetail;
  try {
    thread = getThreadForUser(threadId, user);
  } catch (err) {
    if (err instanceof DomainError && err.code === "not_found") notFound();
    if (err instanceof DomainError && err.code === "forbidden") {
      return (
        <p className="mt-6 rounded border border-black/10 px-4 py-6 text-sm text-black/60 dark:border-white/10 dark:text-white/60">
          You don&apos;t have access to this conversation.
        </p>
      );
    }
    throw err;
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <header className="rounded border border-black/10 px-4 py-3 dark:border-white/10">
        <p className="font-medium">{thread.otherPartyName}</p>
        <p className="text-sm text-black/60 dark:text-white/60">
          {thread.taskTitle} ·{" "}
          <Link href={`/engagements/${thread.engagementId}`} className="underline">
            View engagement
          </Link>
        </p>
      </header>
      <MessageList messages={thread.messages} />
      <MessageForm threadId={thread.id} />
      <AutoRefresh />
    </div>
  );
}
