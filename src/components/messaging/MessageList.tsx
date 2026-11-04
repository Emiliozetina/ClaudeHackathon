import { LocalTime } from "@/components/messaging/LocalTime";
import type { ThreadDetail } from "@/lib/messages";

export function MessageList({ messages }: { messages: ThreadDetail["messages"] }) {
  if (messages.length === 0) {
    return <p className="py-8 text-center text-sm text-black/60 dark:text-white/60">No messages yet. Say hello!</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {messages.map((m) => (
        <li key={m.id} className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
          <p
            className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm ${
              m.mine ? "rounded-br-sm bg-teal-700 text-white" : "rounded-bl-sm bg-black/5 dark:bg-white/10"
            }`}
          >
            {m.body}
          </p>
          <p className="mt-1 text-xs text-black/60 dark:text-white/60">
            {m.mine ? "You" : m.senderName} · <LocalTime iso={m.sentAt} compact />
          </p>
        </li>
      ))}
    </ol>
  );
}
