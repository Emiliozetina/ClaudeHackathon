import { LocalTime } from "@/components/messaging/LocalTime";
import type { ThreadDetail } from "@/lib/messages";

export function MessageList({ messages }: { messages: ThreadDetail["messages"] }) {
  if (messages.length === 0) {
    return <p className="text-sm text-black/60 dark:text-white/60">No messages yet. Say hello!</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {messages.map((m) => (
        <li key={m.id} className={m.mine ? "flex justify-end" : "flex justify-start"}>
          <div
            className={`max-w-[75%] rounded-lg border px-3 py-2 ${
              m.mine
                ? "border-black/20 bg-black/5 dark:border-white/20 dark:bg-white/10"
                : "border-black/10 dark:border-white/10"
            }`}
          >
            <p className="text-xs text-black/60 dark:text-white/60">
              <span className="font-medium">{m.mine ? "You" : m.senderName}</span> ·{" "}
              <LocalTime iso={m.sentAt} />
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm">{m.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
