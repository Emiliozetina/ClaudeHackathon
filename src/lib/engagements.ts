import { displayName } from "@/lib/auth";
import { badRequest, forbidden, notFound } from "@/lib/errors";
import { newId, store } from "@/lib/store";
import type { Engagement, Message, Review, Task, User } from "@/types";

/** UK statutory holiday pay accrual for irregular hours. */
export const HOLIDAY_PAY_RATE = 0.1207;
/** NEXA's fee, charged to the business on top of what the student earns. */
export const PLATFORM_FEE_RATE = 0.2;

export interface PaymentSummary {
  /** "20 hrs × £13.50" or "Fixed price". */
  basis: string;
  studentPay: number;
  holidayPay: number;
  platformFee: number;
  /** What the student receives: pay + holiday pay. */
  studentReceives: number;
  /** What the business pays: student pay + holiday pay + fee. */
  businessPays: number;
}

/** An engagement plus the bits every screen needs alongside it. */
export interface EngagementView extends Engagement {
  task: Task;
  businessUserId: string;
  studentUserId: string;
  businessName: string;
  studentName: string;
  threadId?: string;
  /** Hours the task was scoped for, for the "hours logged" bar. */
  expectedHours?: number;
  payment: PaymentSummary;
}

const pennies = (n: number) => Math.round(n * 100) / 100;

export function paymentSummary(engagement: Engagement, task: Task): PaymentSummary {
  const hourly = task.payment.type === "hourly";
  const hours = engagement.hoursLogged || task.estimatedHours || 0;
  const studentPay = pennies(hourly ? hours * task.payment.amount : task.payment.amount);
  const holidayPay = pennies(studentPay * HOLIDAY_PAY_RATE);
  const platformFee = pennies(studentPay * PLATFORM_FEE_RATE);
  return {
    basis: hourly ? `${hours} hrs × £${task.payment.amount.toFixed(2)}` : "Fixed price",
    studentPay,
    holidayPay,
    platformFee,
    studentReceives: pennies(studentPay + holidayPay),
    businessPays: pennies(studentPay + holidayPay + platformFee),
  };
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
    expectedHours: task.estimatedHours,
    payment: paymentSummary(engagement, task),
  };
}

function isParticipant(view: EngagementView, user: User): boolean {
  return user.id === view.businessUserId || user.id === view.studentUserId;
}

/** Posts an automatic note into the engagement's conversation. */
function postToThread(engagementId: string, senderId: string, body: string) {
  const thread = store.threads.find((t) => t.engagementId === engagementId);
  if (!thread) return;
  const message: Message = { id: newId("m"), threadId: thread.id, senderId, body, sentAt: new Date().toISOString() };
  store.messages.push(message);
  thread.lastMessageAt = message.sentAt;
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
    milestones: [],
    hoursLogged: 0,
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

/** The stored record (not the view copy), after checking the user's side. */
function getAs(side: "business" | "student", id: string, user: User): Engagement {
  const view = getEngagementForUser(id, user);
  const expected = side === "business" ? view.businessUserId : view.studentUserId;
  if (user.id !== expected) throw forbidden(`Only the ${side} can do this.`);
  return store.engagements.find((e) => e.id === id)!;
}

function requireActive(engagement: Engagement) {
  if (engagement.status !== "active") throw badRequest("This engagement is no longer in progress.");
}

/** Student: add hours worked. */
export function logHours(id: string, user: User, hours: number): EngagementView {
  const engagement = getAs("student", id, user);
  requireActive(engagement);
  if (!Number.isFinite(hours) || hours <= 0 || hours > 24) throw badRequest("Log between 0 and 24 hours at a time.");
  engagement.hoursLogged = pennies(engagement.hoursLogged + hours);
  return toView(engagement);
}

/** Either side: add a milestone while the work is in progress. */
export function addMilestone(id: string, user: User, title: string): EngagementView {
  getEngagementForUser(id, user);
  const engagement = store.engagements.find((e) => e.id === id)!;
  requireActive(engagement);
  const text = title.trim();
  if (!text) throw badRequest("Milestone needs a title.");
  if (text.length > 120) throw badRequest("Milestone title must be under 120 characters.");
  engagement.milestones.push({ id: newId("ms"), title: text, done: false });
  return toView(engagement);
}

/** Student: tick or untick a milestone. */
export function toggleMilestone(id: string, user: User, milestoneId: string): EngagementView {
  const engagement = getAs("student", id, user);
  requireActive(engagement);
  const milestone = engagement.milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw notFound("Milestone");
  milestone.done = !milestone.done;
  return toView(engagement);
}

/** Student: hand the work over for the business to check. active -> submitted. */
export function markComplete(id: string, user: User): EngagementView {
  const engagement = getAs("student", id, user);
  requireActive(engagement);
  engagement.status = "submitted";
  engagement.completedAt = new Date().toISOString();
  engagement.changesRequested = undefined;
  postToThread(id, user.id, "I've marked the task complete. Please check the work when you can.");
  return toView(engagement);
}

/** Business: send the work back with a note. submitted -> active. */
export function requestChanges(id: string, user: User, note: string): EngagementView {
  const engagement = getAs("business", id, user);
  if (engagement.status !== "submitted") throw badRequest("Changes can only be requested on submitted work.");
  const text = note.trim();
  if (!text) throw badRequest("Say what needs changing.");
  engagement.status = "active";
  engagement.changesRequested = text;
  engagement.completedAt = undefined;
  postToThread(id, user.id, `Changes requested: ${text}`);
  return toView(engagement);
}

export interface ReviewInput {
  rating: number;
  tags: string[];
  comment: string;
  /** Business only: show this review on the student's portfolio. */
  verifiedReference?: boolean;
}

export const MAX_REVIEW_TAGS = 5;

/**
 * Validates and stores a review. Shared by payAndReview (business) and
 * createReview in src/lib/reviews.ts (student). Moves the engagement to
 * "reviewed" once both sides have reviewed.
 */
export function saveReview(engagement: Engagement, author: User, input: ReviewInput): Review {
  if (store.reviews.some((r) => r.engagementId === engagement.id && r.authorId === author.id)) {
    throw badRequest("You have already reviewed this engagement.");
  }
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) throw badRequest("Rating must be 1 to 5.");
  const comment = input.comment.trim();
  if (!comment) throw badRequest("Please add a written review.");
  const tags = [...new Set(input.tags.map((t) => t.trim()).filter(Boolean))];
  if (tags.length > MAX_REVIEW_TAGS) throw badRequest(`Pick up to ${MAX_REVIEW_TAGS} tags.`);

  const businessUserId = userIdForBusiness(engagement.businessId);
  const studentUserId = userIdForStudent(engagement.studentId);
  const byBusiness = author.id === businessUserId;
  const review: Review = {
    id: newId("r"),
    engagementId: engagement.id,
    authorId: author.id,
    subjectId: byBusiness ? studentUserId : businessUserId,
    rating: input.rating as Review["rating"],
    tags,
    comment,
    verifiedReference: byBusiness && Boolean(input.verifiedReference),
    createdAt: new Date().toISOString(),
  };
  store.reviews.push(review);

  const authors = new Set(store.reviews.filter((r) => r.engagementId === engagement.id).map((r) => r.authorId));
  if (authors.has(businessUserId) && authors.has(studentUserId)) engagement.status = "reviewed";
  return review;
}

/** Business: release payment and review the student in one step. submitted -> paid. */
export function payAndReview(id: string, user: User, input: ReviewInput): EngagementView {
  const engagement = getAs("business", id, user);
  if (engagement.status !== "submitted") throw badRequest("The student hasn't marked this task complete yet.");
  // Validate and store the review first so a bad review doesn't leave it half paid.
  saveReview(engagement, user, input);
  engagement.paidAt = new Date().toISOString();
  if (engagement.status === "submitted") engagement.status = "paid";
  const task = store.tasks.find((t) => t.id === engagement.taskId);
  if (task) task.status = "completed";
  return toView(engagement);
}
