import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";
import { getActor } from "@/lib/session";
import { parseTaskInput } from "@/lib/validation";
import type { TaskStatus } from "@/types";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/tasks/:id. Non-open tasks are only visible to their owner. */
export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  const task = db.tasks.find((t) => t.id === id);
  if (!task) return fail(404, "Task not found");

  if (task.status !== "open") {
    const actor = getActor(req);
    const isOwner =
      actor?.role === "business" && actor.profileId === task.businessId;
    if (!isOwner) return fail(404, "Task not found");
  }
  return ok(task);
}

/**
 * PATCH /api/tasks/:id. Owner edits an open/draft task, or changes its status
 * between draft, open and cancelled.
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const actor = getActor(req);
  if (!actor) return fail(401, "Not signed in");

  const task = db.tasks.find((t) => t.id === id);
  if (!task || actor.role !== "business" || actor.profileId !== task.businessId)
    return fail(404, "Task not found");
  if (task.status === "filled" || task.status === "completed")
    return fail(409, `A ${task.status} task can no longer be edited`);

  const body = await readJson(req);
  if (!body) return fail(400, "Body must be a JSON object");

  const { status, ...fields } = body;
  if (Object.keys(fields).length > 0) {
    // Re-validate the whole task with the edits merged in.
    const parsed = parseTaskInput({ ...task, ...fields });
    if (!parsed.value) return fail(400, "Invalid task", parsed.errors);
    Object.assign(task, parsed.value);
  }

  if (status !== undefined) {
    const allowed: TaskStatus[] = ["draft", "open", "cancelled"];
    if (!allowed.includes(status as TaskStatus))
      return fail(400, "status must be draft, open or cancelled");
    task.status = status as TaskStatus;
    if (task.status === "cancelled") {
      for (const a of db.applications) {
        if (
          a.taskId === task.id &&
          (a.status === "submitted" || a.status === "shortlisted")
        )
          a.status = "rejected";
      }
    }
  }
  return ok(task);
}
