import { applicationsForTask, forBusiness } from "@/lib/applications";
import { db, newId } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";
import { getActor } from "@/lib/session";
import type { Application } from "@/types";

/**
 * GET /api/applications
 *  - student: their own applications (no query needed)
 *  - business: ?taskId=<their task>. Applicants are anonymised until chosen.
 */
export async function GET(req: Request) {
  const actor = getActor(req);
  if (!actor) return fail(401, "Not signed in");

  if (actor.role === "student") {
    return ok(db.applications.filter((a) => a.studentId === actor.profileId));
  }

  const taskId = new URL(req.url).searchParams.get("taskId");
  if (!taskId) return fail(400, "taskId is required");
  const task = db.tasks.find((t) => t.id === taskId);
  if (!task || task.businessId !== actor.profileId)
    return fail(404, "Task not found");

  return ok(applicationsForTask(taskId).map(forBusiness));
}

/** POST /api/applications: a student applies to an open task. */
export async function POST(req: Request) {
  const actor = getActor(req);
  if (!actor) return fail(401, "Not signed in");
  if (actor.role !== "student")
    return fail(403, "Only students can apply to tasks");
  if (!db.students.some((s) => s.id === actor.profileId))
    return fail(403, "Complete your student profile before applying");

  const body = await readJson(req);
  if (!body) return fail(400, "Body must be a JSON object");

  const taskId = typeof body.taskId === "string" ? body.taskId : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (note.length > 1000)
    return fail(400, "note must be 1000 characters or fewer");

  const task = db.tasks.find((t) => t.id === taskId);
  if (!task || task.status !== "open") return fail(404, "Task not found");

  const existing = db.applications.find(
    (a) =>
      a.taskId === taskId &&
      a.studentId === actor.profileId &&
      a.status !== "withdrawn",
  );
  if (existing) return fail(409, "You have already applied to this task");

  const application: Application = {
    id: newId("app"),
    taskId,
    studentId: actor.profileId,
    note,
    status: "submitted",
    anonymous: true,
    submittedAt: new Date().toISOString(),
  };
  db.applications.push(application);
  return ok(application, 201);
}
