import { LocalTime } from "@/components/messaging/LocalTime";
import type { ThreadDetail } from "@/lib/messages";
import { cn } from "@/lib/cn";

/** Figma 12 · Messages → Thread bubbles: theirs on white cards, mine on teal. */
export function MessageList({ messages }: { messages: ThreadDetail["messages"] }) {
  if (messages.length === 0) {
    return <p className="type-body-sm py-[32px] text-center text-text-secondary">No messages yet. Say hello!</p>;
  }

  return (
    <ol className="flex flex-col gap-[16px]">
      {messages.map((m) => (
        <li key={m.id} className={cn("flex flex-col gap-[4px]", m.mine ? "items-end" : "items-start")}>
          <p
            className={cn(
              "type-body max-w-[93%] rounded-lg px-[17px] py-[13px] break-words whitespace-pre-wrap",
              m.mine
                ? "bg-teal-700 text-text-inverse"
                : "border border-border-subtle bg-surface-card text-text-primary",
            )}
          >
            {m.body}
          </p>
          <p className="type-caption text-text-muted">
            {m.mine ? "You" : m.senderName} · <LocalTime iso={m.sentAt} compact />
          </p>
        </li>
      ))}
    </ol>
  );
}
