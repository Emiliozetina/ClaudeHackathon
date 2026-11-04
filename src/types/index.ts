/**
 * Domain types for the platform, following the flow in the README:
 * business signs up and posts a task -> student builds a profile, browses and
 * applies anonymously -> business reviews applicants and chooses one -> both
 * do the task, sign off, pay and review each other.
 */

export type Role = "business" | "student";

export type ID = string;

export interface User {
  id: ID;
  email: string;
  role: Role;
  /** scrypt-hashed password: `scrypt$<N>$<salt-hex>$<hash-hex>`. */
  passwordHash: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: ID;
  expiresAt: string;
}

/** A North East business. Verification checks the business is based here. */
export interface Business {
  id: ID;
  userId: ID;
  name: string;
  about: string;
  location: string;
  website?: string;
  northEastVerified: boolean;
}

/** A student. Verification is a university email check. */
export interface Student {
  id: ID;
  userId: ID;
  name: string;
  university: string;
  fieldOfStudy: string;
  /** e.g. "Year 3" (Figma student details). */
  yearOfStudy?: string;
  skills: string[];
  workHistory: WorkHistoryItem[];
  motivations: string;
  goals: string;
  availability?: string;
  cvUrl?: string;
  universityEmailVerified: boolean;
}

export interface WorkHistoryItem {
  id: ID;
  title: string;
  organisation: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export type TaskStatus = "draft" | "open" | "filled" | "completed" | "cancelled";

export type PaymentType = "fixed" | "hourly";

/** A short-term task posted by a business. */
export interface Task {
  id: ID;
  businessId: ID;
  title: string;
  /** Job contents: what the work actually is. */
  description: string;
  /** Period: how long the student is expected to help for. */
  startDate: string;
  endDate: string;
  estimatedHours?: number;
  /** Requirements the applicant must meet. */
  requirements: string[];
  /** Nice to have, not required. */
  preferredExperience: string[];
  payment: Payment;
  location: string;
  remote: boolean;
  status: TaskStatus;
  createdAt: string;
}

export interface Payment {
  type: PaymentType;
  amount: number;
  currency: "GBP";
  notes?: string;
}

export type ApplicationStatus =
  | "submitted"
  | "shortlisted"
  | "chosen"
  | "rejected"
  | "withdrawn";

/**
 * Applications reach the business anonymously: the student's identity stays
 * hidden until they are chosen, so the match is made on the profile alone.
 */
export interface Application {
  id: ID;
  taskId: ID;
  studentId: ID;
  note: string;
  status: ApplicationStatus;
  submittedAt: string;
}

/**
 * active -> submitted (student marks the task complete)
 *   -> paid (business pays and reviews) -> reviewed (student reviews back).
 * The business can send a submitted engagement back to active with
 * "request changes".
 */
export type EngagementStatus = "active" | "submitted" | "paid" | "reviewed";

export interface Milestone {
  id: ID;
  title: string;
  done: boolean;
}

/** The agreed piece of work once a student has been chosen. */
export interface Engagement {
  id: ID;
  taskId: ID;
  businessId: ID;
  studentId: ID;
  agreedStartDate: string;
  agreedEndDate: string;
  scope: string;
  status: EngagementStatus;
  milestones: Milestone[];
  hoursLogged: number;
  nextCheckIn?: string;
  /** When the student marked the task complete. */
  completedAt?: string;
  /** Set when the business sends the work back; cleared on the next submit. */
  changesRequested?: string;
  paidAt?: string;
}

export interface MessageThread {
  id: ID;
  engagementId: ID;
  participantIds: ID[];
  lastMessageAt: string;
}

export interface Message {
  id: ID;
  threadId: ID;
  senderId: ID;
  body: string;
  sentAt: string;
}

/**
 * Both sides rate each other once the work is paid. A business review of a
 * student can be shown on their portfolio as a verified reference.
 */
export interface Review {
  id: ID;
  engagementId: ID;
  authorId: ID;
  subjectId: ID;
  rating: 1 | 2 | 3 | 4 | 5;
  /** "What stood out" tags, e.g. Reliable, Creative. */
  tags: string[];
  comment: string;
  verifiedReference: boolean;
  createdAt: string;
}
