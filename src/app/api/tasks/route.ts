import { db, newId } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";
import { getActor } from "@/lib/session";
import { listOpenTasks } from "@/lib/tasks";
import { parseTaskInput } from "@/lib/validation";
import type { Task, TaskStatus } from "@/types";

/**
 * GET /api/tasks?q=&skill=&location=&remote=&minPay=&businessId=&status=
 * Public list of open tasks. Drafts/other statuses are only returned to the
 * business that owns them (via businessId + matching actor).
 */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const businessId = p.get("businessId");
  const status = p.get("status") as TaskStatus | null;

  const actor = getActor(req);
  const isOwnerView =
    !!businessId && actor?.role === "business" && actor.profileId === businessId;

  if (isOwnerView) {
    // The owner sees all of their own tasks, including drafts.
    const own = db.tasks
      .filter((t) => t.businessId === businessId)
      .filter((t) => !status || t.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(own);
  }

  return ok(
    listOpenTasks({
      q: p.get("q") ?? undefined,
      skill: p.get("skill") ?? undefined,
      location: p.get("location") ?? undefined,
      remote: p.get("remote") === "true",
      minPay: Number(p.get("minPay")) || undefined,
    }),
  );
}

/** POST /api/tasks: a business posts a task (as draft or open). */
export async function POST(req: Request) {
  const actor = getActor(req);
  if (!actor) return fail(401, "Not signed in");
  if (actor.role !== "business")
    return fail(403, "Only businesses can post tasks");
  if (!db.businesses.some((b) => b.id === actor.profileId))
    return fail(403, "Business profile not found");

  const body = await readJson(req);
  if (!body) return fail(400, "Body must be a JSON object");

  const parsed = parseTaskInput(body);
  if (!parsed.value) return fail(400, "Invalid task", parsed.errors);

  const status: TaskStatus = body.status === "draft" ? "draft" : "open";
  const task: Task = {
    ...parsed.value,
    id: newId("task"),
    businessId: actor.profileId,
    status,
    createdAt: new Date().toISOString(),
  };
  db.tasks.push(task);
  return ok(task, 201);
}
