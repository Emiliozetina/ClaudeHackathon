import Link from "next/link";
import { db } from "@/lib/db";
import { formatPay } from "@/lib/tasks";
import type { Task } from "@/types";

export function TaskCard({ task }: { task: Task }) {
  const business = db.businesses.find((b) => b.id === task.businessId);
  return (
    <li className="rounded-lg border border-black/10 p-4 dark:border-white/15">
      <Link href={`/tasks/${task.id}`} className="text-lg font-medium hover:underline">
        {task.title}
      </Link>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        {business?.name} · {task.remote ? "Remote" : task.location} ·{" "}
        {formatPay(task)}
      </p>
      <p className="mt-2 line-clamp-2 text-sm">{task.description}</p>
    </li>
  );
}
