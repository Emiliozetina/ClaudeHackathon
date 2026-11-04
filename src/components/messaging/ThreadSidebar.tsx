"use client";

import { useState } from "react";
import Link from "next/link";

import { Avatar } from "@/components/messaging/Avatar";
import { LocalTime } from "@/components/messaging/LocalTime";

export interface ThreadListItem {
  id: string;
  otherPartyName: string;
  taskTitle: string;
  lastMessageBody?: string;
  lastMessageAt?: string;
}

/** Left column: heading, client-side search, and the thread list. */
export function ThreadSidebar({ threads, selectedId }: { threads: ThreadListItem[]; selectedId?: string }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = q
    ? threads.filter((t) => t.otherPartyName.toLowerCase().includes(q) || t.taskTitle.toLowerCase().includes(q))
    : threads;

  return (
    <nav aria-label="Conversations" className="flex min-h-0 flex-col border-b border-black/10 lg:border-r lg:border-b-0 dark:border-white/10">
      <div className="p-4">
        <h2 className="text-lg font-semibold tracking-tight">Messages</h2>
        <label htmlFor="thread-search" className="sr-only">
          Search conversations
        </label>
        <input
          id="thread-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="mt-3 w-full rounded-full border border-black/10 bg-transparent px-4 py-2 text-sm dark:border-white/10"
        />
      </div>

      {threads.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-black/60 dark:text-white/60">
          No conversations yet. A conversation starts when an engagement is agreed.
        </p>
      ) : visible.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-black/60 dark:text-white/60">No conversations match “{query}”.</p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto pb-2">
          {visible.map((t) => {
            const selected = t.id === selectedId;
            return (
              <li key={t.id}>
                <Link
                  href={`/messages/${t.id}`}
                  aria-current={selected ? "page" : undefined}
                  className={`flex gap-3 px-4 py-3 ${
                    selected ? "bg-teal-700/10 dark:bg-teal-400/10" : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Avatar name={t.otherPartyName} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium">{t.otherPartyName}</span>
                      {t.lastMessageAt && (
                        <LocalTime
                          iso={t.lastMessageAt}
                          compact
                          className="shrink-0 text-xs text-black/60 dark:text-white/60"
                        />
                      )}
                    </div>
                    <p className="truncate text-sm text-black/60 dark:text-white/60">
                      {t.lastMessageBody ?? t.taskTitle}
                    </p>
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
