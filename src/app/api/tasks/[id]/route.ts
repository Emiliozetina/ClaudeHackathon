import { dayOf, todayUtc } from "@/lib/dates";
import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";
import { getActor } from "@/lib/session";
import { parseTaskInput, type TaskInput } from "@/lib/validation";
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
 * PATCH /api/tasks/:id. Owner edits a draft/open task, or changes its status
 * between draft, open and cancelled.
 *
 * Rules:
 *  - filled, completed and cancelled tasks are final (cancelled can't be reopened)
 *  - an open task with live applications can't go back to draft
 *  - a start date that is changed (or a draft being opened) can't be in the past
 *  - everything is validated first, so a rejected request changes nothing
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
  if (task.status === "cancelled")
    return fail(409, "A cancelled task can't be edited or reopened. Post a new task instead.");

  const body = await readJson(req);
  if (!body) return fail(400, "Body must be a JSON object");

  const { status, ...fields } = body;

  // 1. Validate everything before changing anything.
  let nextFields: TaskInput | undefined;
  if (Object.keys(fields).length > 0) {
    const startChanged =
      typeof fields.startDate === "string" && dayOf(fields.startDate) !== dayOf(task.startDate);
    // Re-validate the whole task with the edits merged in.
    const parsed = parseTaskInput({ ...task, ...fields }, { requireFutureStart: startChanged });
    if (!parsed.value) return fail(400, "Invalid task", parsed.errors);
    nextFields = parsed.value;
  }

  let nextStatus: TaskStatus | undefined;
  if (status !== undefined) {
    const allowed: TaskStatus[] = ["draft", "open", "cancelled"];
    if (!allowed.includes(status as TaskStatus))
      return fail(400, "status must be draft, open or cancelled");
    nextStatus = status as TaskStatus;

    const hasLiveApplications = db.applications.some(
      (a) =>
        a.taskId === task.id && (a.status === "submitted" || a.status === "shortlisted"),
    );
    if (nextStatus === "draft" && hasLiveApplications)
      return fail(
        409,
        "This task has applicants. Cancel it, or decline them first, instead of moving it back to draft.",
      );

    const startDate = nextFields?.startDate ?? task.startDate;
    if (nextStatus === "open" && task.status !== "open" && dayOf(startDate) < todayUtc())
      return fail(400, "Invalid task", ["startDate can't be in the past"]);
  }

  // 2. Apply.
  if (nextFields) Object.assign(task, nextFields);
  if (nextStatus !== undefined) {
    task.status = nextStatus;
    if (nextStatus === "cancelled") {
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
