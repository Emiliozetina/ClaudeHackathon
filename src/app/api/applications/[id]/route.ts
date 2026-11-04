import { forBusiness } from "@/lib/applications";
import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";
import { getActor } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PATCH /api/applications/:id  { status }
 *  - business (owner of the task): "shortlisted" | "rejected" | "chosen"
 *  - student (owner of the application): "withdrawn"
 *
 * Choosing an applicant marks the task "filled" and rejects everyone else.
 * Creating the engagement for the chosen student belongs to the Engagements
 * work (api/engagements) and should hook in at the marked point below.
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const actor = getActor(req);
  if (!actor) return fail(401, "Not signed in");

  const app = db.applications.find((a) => a.id === id);
  if (!app) return fail(404, "Application not found");
  const task = db.tasks.find((t) => t.id === app.taskId);
  if (!task) return fail(404, "Application not found");

  const body = await readJson(req);
  const status = body?.status;
  if (typeof status !== "string")
    return fail(400, "status is required");

  if (actor.role === "student") {
    if (app.studentId !== actor.profileId) return fail(404, "Application not found");
    if (status !== "withdrawn")
      return fail(403, "Students can only withdraw an application");
    if (app.status === "chosen")
      return fail(409, "A chosen application can't be withdrawn here");
    app.status = "withdrawn";
    return ok(app);
  }

  if (task.businessId !== actor.profileId)
    return fail(404, "Application not found");
  if (!["shortlisted", "rejected", "chosen"].includes(status))
    return fail(400, "status must be shortlisted, rejected or chosen");
  if (app.status === "withdrawn" || app.status === "chosen")
    return fail(409, `Application is already ${app.status}`);
  if (task.status !== "open")
    return fail(409, "This task is no longer open");

  if (status === "chosen") {
    app.status = "chosen";
    for (const other of db.applications) {
      if (
        other.taskId === task.id &&
        other.id !== app.id &&
        (other.status === "submitted" || other.status === "shortlisted")
      )
        other.status = "rejected";
    }
    task.status = "filled";
    // TODO(engagements): create the engagement for this task + student here.
  } else {
    app.status = status as "shortlisted" | "rejected";
  }
  return ok(forBusiness(app));
}
