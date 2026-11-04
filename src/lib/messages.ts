import { displayName } from "@/lib/auth";
import { badRequest, forbidden, notFound } from "@/lib/errors";
import { newId, store } from "@/lib/store";
import type { Message, MessageThread, User } from "@/types";

export interface ThreadSummary extends MessageThread {
  otherPartyName: string;
  taskTitle: string;
  lastMessage?: Message;
}

export interface ThreadDetail extends ThreadSummary {
  messages: (Message & { senderName: string; mine: boolean })[];
}

const MAX_MESSAGE_LENGTH = 2000;

function getThread(threadId: string, user: User): MessageThread {
  const thread = store.threads.find((t) => t.id === threadId);
  if (!thread) throw notFound("Conversation");
  if (!thread.participantIds.includes(user.id)) throw forbidden("You are not part of this conversation.");
  return thread;
}

function messagesIn(threadId: string): Message[] {
  return store.messages
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}

function summarise(thread: MessageThread, user: User): ThreadSummary {
  const otherId = thread.participantIds.find((id) => id !== user.id) ?? user.id;
  const engagement = store.engagements.find((e) => e.id === thread.engagementId);
  const task = store.tasks.find((t) => t.id === engagement?.taskId);
  return {
    ...thread,
    otherPartyName: displayName(otherId),
    taskTitle: task?.title ?? "Engagement",
    lastMessage: messagesIn(thread.id).at(-1),
  };
}

export function listThreadsForUser(user: User): ThreadSummary[] {
  return store.threads
    .filter((t) => t.participantIds.includes(user.id))
    .map((t) => summarise(t, user))
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

export function getThreadForUser(threadId: string, user: User): ThreadDetail {
  const thread = getThread(threadId, user);
  return {
    ...summarise(thread, user),
    messages: messagesIn(thread.id).map((m) => ({
      ...m,
      senderName: displayName(m.senderId),
      mine: m.senderId === user.id,
    })),
  };
}

export function sendMessage(threadId: string, user: User, body: string): Message {
  const thread = getThread(threadId, user);
  const text = body.trim();
  if (!text) throw badRequest("Message cannot be empty.");
  if (text.length > MAX_MESSAGE_LENGTH) throw badRequest(`Message must be under ${MAX_MESSAGE_LENGTH} characters.`);

  const message: Message = {
    id: newId("m"),
    threadId: thread.id,
    senderId: user.id,
    body: text,
    sentAt: new Date().toISOString(),
  };
  store.messages.push(message);
  thread.lastMessageAt = message.sentAt;
  return message;
}
