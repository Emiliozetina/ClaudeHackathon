import type { ThreadListItem } from "@/components/messaging/ThreadSidebar";
import type { ThreadSummary } from "@/lib/messages";

/** Slims thread summaries down to what the client-side sidebar needs. */
export function toThreadListItems(threads: ThreadSummary[]): ThreadListItem[] {
  return threads.map((t) => ({
    id: t.id,
    otherPartyName: t.otherPartyName,
    taskTitle: t.taskTitle,
    lastMessageBody: t.lastMessage?.body,
    lastMessageAt: t.lastMessage?.sentAt,
  }));
}
