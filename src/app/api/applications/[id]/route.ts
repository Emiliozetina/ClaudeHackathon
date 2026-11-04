import { forBusiness } from "@/lib/applications";
import { db } from "@/lib/db";
import { createEngagementFromApplication } from "@/lib/engagements";
import { DomainError } from "@/lib/errors";
import { fail, ok, readJson } from "@/lib/http";
import { getActor } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

const DOMAIN_STATUS = { bad_request: 400, unauthorized: 401, forbidden: 403, not_found: 404 } as const;

/**
 * PATCH /api/applications/:id  { status }
 *  - business (owner of the task): "shortlisted" | "rejected" | "chosen"
 *  - student (owner of the application): "withdrawn"
 *
 * Choosing an applicant marks the task "filled", rejects everyone else and
 * opens the engagement (src/lib/engagements.ts).
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
    // Chooses the applicant, declines the others, fills the task and opens
    // the engagement with its message thread, all validated in one place.
    const businessUserId = db.businesses.find((b) => b.id === task.businessId)?.userId;
    const user = db.users.find((u) => u.id === businessUserId);
    try {
      createEngagementFromApplication(app.id, user);
    } catch (error) {
      if (error instanceof DomainError) return fail(DOMAIN_STATUS[error.code], error.message);
      throw error;
    }
  } else {
    app.status = status as "shortlisted" | "rejected";
  }
  return ok(forBusiness(app));
}
