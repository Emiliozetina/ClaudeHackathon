/**
 * Fake demo data. Every person and business here is made up; never put real
 * people's personal data in this file.
 */

import type {
  Application,
  Business,
  Engagement,
  Message,
  MessageThread,
  Review,
  Student,
  Task,
  User,
} from "@/types";

export interface SeedData {
  users: User[];
  businesses: Business[];
  students: Student[];
  tasks: Task[];
  applications: Application[];
  engagements: Engagement[];
  threads: MessageThread[];
  messages: Message[];
  reviews: Review[];
}

export function createSeed(): SeedData {
  return {
    users: [
      { id: "u-biz-1", email: "hello@tynebrew.example", role: "business", verifiedAt: "2026-10-01T09:00:00Z", createdAt: "2026-10-01T09:00:00Z" },
      { id: "u-biz-2", email: "team@quaysidestudio.example", role: "business", verifiedAt: "2026-10-03T09:00:00Z", createdAt: "2026-10-03T09:00:00Z" },
      { id: "u-stu-1", email: "amy.carter@uni.example.ac.uk", role: "student", verifiedAt: "2026-10-05T09:00:00Z", createdAt: "2026-10-05T09:00:00Z" },
      { id: "u-stu-2", email: "sam.okafor@uni.example.ac.uk", role: "student", verifiedAt: "2026-10-06T09:00:00Z", createdAt: "2026-10-06T09:00:00Z" },
    ],
    businesses: [
      { id: "b-1", userId: "u-biz-1", name: "Tyne Brew Coffee", about: "Independent coffee roaster with two cafés in Newcastle.", location: "Newcastle upon Tyne", northEastVerified: true },
      { id: "b-2", userId: "u-biz-2", name: "Quayside Studio", about: "Small design studio working with local charities.", location: "Gateshead", northEastVerified: true },
    ],
    students: [
      {
        id: "s-1",
        userId: "u-stu-1",
        name: "Amy Carter",
        university: "Northumbria University",
        fieldOfStudy: "Computer Science",
        skills: ["JavaScript", "React", "Excel"],
        workHistory: [{ id: "w-1", title: "Barista", organisation: "Campus café", startDate: "2025-09-01" }],
        motivations: "I want real projects on my CV before I graduate.",
        goals: "Front-end developer role in the North East.",
        universityEmailVerified: true,
      },
      {
        id: "s-2",
        userId: "u-stu-2",
        name: "Sam Okafor",
        university: "Newcastle University",
        fieldOfStudy: "Marketing",
        skills: ["Social media", "Canva", "Copywriting"],
        workHistory: [],
        motivations: "Build a portfolio with local brands.",
        goals: "Start my own marketing consultancy.",
        universityEmailVerified: true,
      },
    ],
    tasks: [
      {
        id: "t-1",
        businessId: "b-1",
        title: "Build an online pre-order page",
        description: "A simple page where customers can pre-order coffee for pick-up.",
        startDate: "2026-11-02",
        endDate: "2026-11-20",
        estimatedHours: 30,
        requirements: ["JavaScript"],
        preferredExperience: ["React"],
        payment: { type: "fixed", amount: 450, currency: "GBP" },
        location: "Newcastle upon Tyne",
        remote: true,
        status: "filled",
        createdAt: "2026-10-20T10:00:00Z",
      },
      {
        id: "t-2",
        businessId: "b-2",
        title: "Social media plan for a charity campaign",
        description: "Plan and draft a month of posts for a winter coat appeal.",
        startDate: "2026-10-12",
        endDate: "2026-10-30",
        estimatedHours: 20,
        requirements: ["Copywriting"],
        preferredExperience: ["Canva"],
        payment: { type: "hourly", amount: 13, currency: "GBP" },
        location: "Gateshead",
        remote: false,
        status: "filled",
        createdAt: "2026-10-05T10:00:00Z",
      },
    ],
    applications: [
      { id: "a-1", taskId: "t-1", studentId: "s-1", note: "I've built two React sites for societies.", status: "chosen", anonymous: false, submittedAt: "2026-10-22T12:00:00Z" },
      { id: "a-2", taskId: "t-2", studentId: "s-2", note: "I run my society's Instagram.", status: "chosen", anonymous: false, submittedAt: "2026-10-07T12:00:00Z" },
    ],
    engagements: [
      { id: "e-1", taskId: "t-1", businessId: "b-1", studentId: "s-1", agreedStartDate: "2026-11-02", agreedEndDate: "2026-11-20", scope: "Pre-order page with menu, time slot picker and email confirmation.", status: "active" },
      { id: "e-2", taskId: "t-2", businessId: "b-2", studentId: "s-2", agreedStartDate: "2026-10-12", agreedEndDate: "2026-10-30", scope: "30 drafted posts and a posting calendar.", status: "signed_off", signedOffAt: "2026-10-31T16:00:00Z" },
    ],
    threads: [
      { id: "th-1", engagementId: "e-1", participantIds: ["u-biz-1", "u-stu-1"], lastMessageAt: "2026-11-03T09:15:00Z" },
      { id: "th-2", engagementId: "e-2", participantIds: ["u-biz-2", "u-stu-2"], lastMessageAt: "2026-10-31T16:05:00Z" },
    ],
    messages: [
      { id: "m-1", threadId: "th-1", senderId: "u-biz-1", body: "Welcome aboard, Amy! Our menu is in the shared folder.", sentAt: "2026-11-02T09:00:00Z" },
      { id: "m-2", threadId: "th-1", senderId: "u-stu-1", body: "Thanks! I'll have a first draft of the page by Thursday.", sentAt: "2026-11-03T09:15:00Z" },
      { id: "m-3", threadId: "th-2", senderId: "u-stu-2", body: "All 30 posts and the calendar are uploaded.", sentAt: "2026-10-31T15:30:00Z" },
      { id: "m-4", threadId: "th-2", senderId: "u-biz-2", body: "Brilliant work, signing off now.", sentAt: "2026-10-31T16:05:00Z" },
    ],
    reviews: [
      { id: "r-1", engagementId: "e-2", authorId: "u-stu-2", subjectId: "u-biz-2", rating: 5, comment: "Clear brief and quick feedback.", createdAt: "2026-10-31T17:00:00Z" },
    ],
  };
}
