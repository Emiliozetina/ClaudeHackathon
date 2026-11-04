import { db } from "@/lib/db";
import type { Task } from "@/types";

export interface TaskFilters {
  q?: string;
  skill?: string;
  location?: string;
  remote?: boolean;
  minPay?: number;
}

/** Open tasks matching the filters, newest first. Shared by the API and pages. */
export function listOpenTasks(filters: TaskFilters = {}): Task[] {
  const q = filters.q?.toLowerCase();
  const skill = filters.skill?.toLowerCase();
  const location = filters.location?.toLowerCase();

  let tasks = db.tasks.filter((t) => t.status === "open");
  if (q)
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    );
  if (skill)
    tasks = tasks.filter((t) =>
      [...t.requirements, ...t.preferredExperience].some((r) =>
        r.toLowerCase().includes(skill),
      ),
    );
  if (location)
    tasks = tasks.filter((t) => t.location.toLowerCase().includes(location));
  if (filters.remote) tasks = tasks.filter((t) => t.remote);
  if (filters.minPay && filters.minPay > 0)
    tasks = tasks.filter((t) => t.payment.amount >= filters.minPay!);

  return [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function formatPay(t: Task): string {
  const { type, amount } = t.payment;
  return type === "hourly" ? `£${amount}/hour` : `£${amount} fixed`;
}
