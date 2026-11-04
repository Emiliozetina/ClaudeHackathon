"use client";

import { useState } from "react";
import Link from "next/link";

import { LocalTime } from "@/components/messaging/LocalTime";
import type { ThreadListItem } from "@/components/messaging/ThreadSidebar";
import { Avatar, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

import { initials, toneFor } from "./tone";

/** Figma 12 · Messages → Conversations: heading, client-side search, thread list. */
export function ThreadSidebar({ threads, selectedId }: { threads: ThreadListItem[]; selectedId?: string }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = q
    ? threads.filter((t) => t.otherPartyName.toLowerCase().includes(q) || t.taskTitle.toLowerCase().includes(q))
    : threads;

  return (
    <nav
      aria-label="Conversations"
      className="flex min-h-0 flex-col border-b border-border-subtle lg:border-r lg:border-b-0"
    >
      <div className="flex flex-col gap-[12px] px-[20px] pt-[20px] pb-[8px]">
        <h2 className="type-h4 text-text-primary">Messages</h2>
        <label htmlFor="thread-search" className="sr-only">
          Search conversations
        </label>
        <div className="flex items-center gap-[8px] rounded-md bg-surface-page px-[12px] py-[10px] focus-within:shadow-[inset_0_0_0_1px_var(--color-teal-700)]">
          <Icon name="search-6b7280-16" />
          <input
            id="thread-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages"
            className="type-body-sm min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
      </div>

      {threads.length === 0 ? (
        <p className="type-body-sm px-[20px] py-[12px] text-text-secondary">
          No conversations yet. A conversation starts when an engagement is agreed.
        </p>
      ) : visible.length === 0 ? (
        <p className="type-body-sm px-[20px] py-[12px] text-text-secondary">No conversations match “{query}”.</p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-[8px] overflow-y-auto pb-[8px]">
          {visible.map((t) => {
            const selected = t.id === selectedId;
            return (
              <li key={t.id}>
                <Link
                  href={`/messages/${t.id}`}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-[12px] border-l-[3px] py-[14px] pr-[20px] pl-[17px]",
                    selected ? "border-teal-700 bg-teal-50" : "border-transparent hover:bg-surface-page",
                  )}
                >
                  <Avatar initials={initials(t.otherPartyName)} tone={toneFor(t.otherPartyName)} size={40} />
                  <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                    <div className="flex items-baseline justify-between gap-[8px]">
                      <span className="type-label truncate text-text-primary">{t.otherPartyName}</span>
                      {t.lastMessageAt && (
                        <LocalTime iso={t.lastMessageAt} compact className="type-caption shrink-0 text-text-muted" />
                      )}
                    </div>
                    <p className="type-body-sm truncate text-text-secondary">{t.lastMessageBody ?? t.taskTitle}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
