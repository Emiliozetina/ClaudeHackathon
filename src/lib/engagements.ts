import { displayName } from "@/lib/auth";
import { badRequest, forbidden, notFound } from "@/lib/errors";
import { newId, store } from "@/lib/store";
import type { Engagement, Task, User } from "@/types";

/** An engagement plus the bits every screen needs alongside it. */
export interface EngagementView extends Engagement {
  task: Task;
  businessUserId: string;
  studentUserId: string;
  businessName: string;
  studentName: string;
  threadId?: string;
}

function userIdForBusiness(businessId: string): string {
  const business = store.businesses.find((b) => b.id === businessId);
  if (!business) throw notFound("Business");
  return business.userId;
}

function userIdForStudent(studentId: string): string {
  const student = store.students.find((s) => s.id === studentId);
  if (!student) throw notFound("Student");
  return student.userId;
}

function toView(engagement: Engagement): EngagementView {
  const task = store.tasks.find((t) => t.id === engagement.taskId);
  if (!task) throw notFound("Task");
  const businessUserId = userIdForBusiness(engagement.businessId);
  const studentUserId = userIdForStudent(engagement.studentId);
  return {
    ...engagement,
    task,
    businessUserId,
    studentUserId,
    businessName: displayName(businessUserId),
    studentName: displayName(studentUserId),
    threadId: store.threads.find((t) => t.engagementId === engagement.id)?.id,
  };
}

function isParticipant(view: EngagementView, user: User): boolean {
  return user.id === view.businessUserId || user.id === view.studentUserId;
}

/**
 * Integration point for #2: call this when a business chooses an applicant.
 * Marks the application chosen, fills the task, and opens the engagement with
 * its message thread.
 */
export function createEngagementFromApplication(applicationId: string, user?: User): EngagementView {
  const application = store.applications.find((a) => a.id === applicationId);
  if (!application) throw notFound("Application");
  const task = store.tasks.find((t) => t.id === application.taskId);
  if (!task) throw notFound("Task");
  if (user && user.id !== userIdForBusiness(task.businessId)) {
    throw forbidden("Only the business that posted the task can choose an applicant.");
  }
  if (store.engagements.some((e) => e.taskId === task.id)) {
    throw badRequest("This task already has an engagement.");
  }

  application.status = "chosen";
  task.status = "filled";

  const engagement: Engagement = {
    id: newId("e"),
    taskId: task.id,
    businessId: task.businessId,
    studentId: application.studentId,
    agreedStartDate: task.startDate,
    agreedEndDate: task.endDate,
    scope: task.description,
    status: "active",
  };
  store.engagements.push(engagement);

  store.threads.push({
    id: newId("th"),
    engagementId: engagement.id,
    participantIds: [userIdForBusiness(task.businessId), userIdForStudent(application.studentId)],
    lastMessageAt: new Date().toISOString(),
  });

  return toView(engagement);
}

export function listEngagementsForUser(user: User): EngagementView[] {
  return store.engagements
    .map(toView)
    .filter((view) => isParticipant(view, user))
    .sort((a, b) => b.agreedStartDate.localeCompare(a.agreedStartDate));
}

export function getEngagementForUser(id: string, user: User): EngagementView {
  const engagement = store.engagements.find((e) => e.id === id);
  if (!engagement) throw notFound("Engagement");
  const view = toView(engagement);
  if (!isParticipant(view, user)) throw forbidden();
  return view;
}

function getForBusiness(id: string, user: User) {
  const view = getEngagementForUser(id, user);
  if (user.id !== view.businessUserId) {
    throw forbidden("Only the business can do this.");
  }
  // Mutate the stored record, not the view copy.
  return store.engagements.find((e) => e.id === id)!;
}

/** Business confirms the work is done: active -> signed_off. */
export function signOff(id: string, user: User): EngagementView {
  const engagement = getForBusiness(id, user);
  if (engagement.status !== "active") throw badRequest("Only active engagements can be signed off.");
  engagement.status = "signed_off";
  engagement.signedOffAt = new Date().toISOString();
  return toView(engagement);
}

/** Business records that the student has been paid: signed_off -> paid. */
export function markPaid(id: string, user: User): EngagementView {
  const engagement = getForBusiness(id, user);
  if (engagement.status !== "signed_off") throw badRequest("Sign off the work before marking it paid.");
  engagement.status = "paid";
  engagement.paidAt = new Date().toISOString();
  return toView(engagement);
}
