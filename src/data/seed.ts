/**
 * Fake demo data only. No real people or contact details.
 * Replaced by the real database when it exists.
 */

import { scryptSync } from "crypto";

import type {
  Application,
  Business,
  Engagement,
  Message,
  MessageThread,
  Review,
  Session,
  Student,
  Task,
  User,
} from "@/types";

// Tasks / Applications (#2): open tasks students can apply to.
export const seedBusinesses: Business[] = [
  {
    id: "biz_1",
    userId: "user_biz_1",
    name: "Tyneside Print Co",
    about: "A small print shop in Newcastle taking on more online orders.",
    location: "Newcastle upon Tyne",
    northEastVerified: true,
  },
  {
    id: "biz_2",
    userId: "user_biz_2",
    name: "Wear Valley Bakery",
    about: "Family bakery in Durham with a growing wholesale side.",
    location: "Durham",
    northEastVerified: true,
  },
];

export const seedStudents: Student[] = [
  {
    id: "stu_1",
    userId: "user_stu_1",
    name: "Demo Student One",
    university: "Northumbria University",
    fieldOfStudy: "Computer Science",
    skills: ["JavaScript", "Excel"],
    workHistory: [
      {
        id: "wh_1",
        title: "Retail assistant",
        organisation: "Example Shop",
        startDate: "2025-06-01",
        endDate: "2025-09-01",
      },
    ],
    motivations: "I want practical experience with a local business.",
    goals: "Work in the North East after graduating.",
    universityEmailVerified: true,
  },
  {
    id: "stu_2",
    userId: "user_stu_2",
    name: "Demo Student Two",
    university: "Durham University",
    fieldOfStudy: "Business Management",
    skills: ["Excel", "Social media"],
    workHistory: [],
    motivations: "Looking to build a first portfolio.",
    goals: "Start in marketing or operations.",
    universityEmailVerified: true,
  },
];

export const seedTasks: Task[] = [
  {
    id: "task_1",
    businessId: "biz_1",
    title: "Tidy up our order spreadsheet",
    description:
      "Clean and restructure our Excel order tracker so we can filter by customer and due date.",
    startDate: "2026-12-01",
    endDate: "2026-12-14",
    estimatedHours: 12,
    requirements: ["Has used Excel (filters, formulas)"],
    preferredExperience: ["Experience with small business admin"],
    payment: { type: "fixed", amount: 180, currency: "GBP" },
    location: "Newcastle upon Tyne",
    remote: true,
    status: "open",
    createdAt: "2026-11-01T09:00:00.000Z",
  },
  {
    id: "task_2",
    businessId: "biz_2",
    title: "Update our wholesale web page",
    description:
      "Refresh the wholesale page on our website with new products and prices.",
    startDate: "2026-12-05",
    endDate: "2026-12-20",
    estimatedHours: 10,
    requirements: ["Comfortable with JavaScript and basic HTML"],
    preferredExperience: ["Has edited a small business website before"],
    payment: { type: "hourly", amount: 12, currency: "GBP" },
    location: "Durham",
    remote: false,
    status: "open",
    createdAt: "2026-11-02T09:00:00.000Z",
  },
];

export const seedApplications: Application[] = [];

/**
 * Every demo account signs in with the password "password". The salt is fixed
 * so the hash is stable across restarts. Demo data only: never reuse this for
 * real accounts.
 */
export const DEMO_PASSWORD = "password";
const DEMO_SALT = Buffer.from("00112233445566778899aabbccddeeff", "hex");
const DEMO_PASSWORD_HASH = `scrypt$16384$${DEMO_SALT.toString("hex")}$${scryptSync(DEMO_PASSWORD, DEMO_SALT, 64, { N: 16384 }).toString("hex")}`;

// Engagements / Messaging / Reviews (#3): work already under way. createSeed()
// combines everything into the single store in src/lib/store.ts.
export interface SeedData {
  users: User[];
  sessions: Session[];
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
      // Users for the #2 seed profiles above. The first one is the default demo user.
      { id: "user_biz_1", email: "orders@tynesideprint.example", role: "business", passwordHash: DEMO_PASSWORD_HASH, verifiedAt: "2026-10-01T09:00:00Z", createdAt: "2026-10-01T09:00:00Z" },
      { id: "user_biz_2", email: "hello@wearvalleybakery.example", role: "business", passwordHash: DEMO_PASSWORD_HASH, verifiedAt: "2026-10-01T09:00:00Z", createdAt: "2026-10-01T09:00:00Z" },
      { id: "user_stu_1", email: "student.one@uni.example.ac.uk", role: "student", passwordHash: DEMO_PASSWORD_HASH, verifiedAt: "2026-10-01T09:00:00Z", createdAt: "2026-10-01T09:00:00Z" },
      { id: "user_stu_2", email: "student.two@uni.example.ac.uk", role: "student", passwordHash: DEMO_PASSWORD_HASH, verifiedAt: "2026-10-01T09:00:00Z", createdAt: "2026-10-01T09:00:00Z" },
      { id: "u-biz-1", email: "hello@tynebrew.example", role: "business", passwordHash: DEMO_PASSWORD_HASH, verifiedAt: "2026-10-01T09:00:00Z", createdAt: "2026-10-01T09:00:00Z" },
      { id: "u-biz-2", email: "team@quaysidestudio.example", role: "business", passwordHash: DEMO_PASSWORD_HASH, verifiedAt: "2026-10-03T09:00:00Z", createdAt: "2026-10-03T09:00:00Z" },
      { id: "u-stu-1", email: "amy.carter@uni.example.ac.uk", role: "student", passwordHash: DEMO_PASSWORD_HASH, verifiedAt: "2026-10-05T09:00:00Z", createdAt: "2026-10-05T09:00:00Z" },
      { id: "u-stu-2", email: "sam.okafor@uni.example.ac.uk", role: "student", passwordHash: DEMO_PASSWORD_HASH, verifiedAt: "2026-10-06T09:00:00Z", createdAt: "2026-10-06T09:00:00Z" },
    ],
    sessions: [],
    businesses: [
      ...structuredClone(seedBusinesses),
      { id: "b-1", userId: "u-biz-1", name: "Tyne Brew Coffee", about: "Independent coffee roaster with two cafés in Newcastle.", location: "Newcastle upon Tyne", northEastVerified: true },
      { id: "b-2", userId: "u-biz-2", name: "Quayside Studio", about: "Small design studio working with local charities.", location: "Gateshead", northEastVerified: true },
    ],
    students: [
      ...structuredClone(seedStudents),
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
      ...structuredClone(seedTasks),
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
      {
        id: "t-3",
        businessId: "b-2",
        title: "Photograph our autumn exhibition",
        description: "Photos and a short video of a community art exhibition.",
        startDate: "2026-09-15",
        endDate: "2026-09-26",
        estimatedHours: 12,
        requirements: ["Photography"],
        preferredExperience: ["Video editing"],
        payment: { type: "fixed", amount: 220, currency: "GBP" },
        location: "Gateshead",
        remote: false,
        status: "completed",
        createdAt: "2026-09-01T10:00:00Z",
      },
    ],
    applications: [
      ...structuredClone(seedApplications),
      { id: "a-1", taskId: "t-1", studentId: "s-1", note: "I've built two React sites for societies.", status: "chosen", anonymous: false, submittedAt: "2026-10-22T12:00:00Z" },
      { id: "a-2", taskId: "t-2", studentId: "s-2", note: "I run my society's Instagram.", status: "chosen", anonymous: false, submittedAt: "2026-10-07T12:00:00Z" },
      { id: "a-3", taskId: "t-3", studentId: "s-1", note: "I shoot events for my course.", status: "chosen", anonymous: false, submittedAt: "2026-09-05T12:00:00Z" },
    ],
    engagements: [
      {
        id: "e-1", taskId: "t-1", businessId: "b-1", studentId: "s-1",
        agreedStartDate: "2026-11-02", agreedEndDate: "2026-11-20",
        scope: "Pre-order page with menu, time slot picker and email confirmation.",
        status: "active",
        milestones: [
          { id: "ms-1", title: "Page design agreed", done: true },
          { id: "ms-2", title: "Menu and time slots built", done: false },
          { id: "ms-3", title: "Email confirmation working", done: false },
          { id: "ms-4", title: "Handover guide", done: false },
        ],
        hoursLogged: 8,
        nextCheckIn: "2026-11-06T14:00:00Z",
      },
      {
        id: "e-2", taskId: "t-2", businessId: "b-2", studentId: "s-2",
        agreedStartDate: "2026-10-12", agreedEndDate: "2026-10-30",
        scope: "30 drafted posts and a posting calendar.",
        status: "submitted",
        milestones: [
          { id: "ms-5", title: "4-week content calendar", done: true },
          { id: "ms-6", title: "30 drafted posts", done: true },
          { id: "ms-7", title: "Handover guide (PDF)", done: true },
        ],
        hoursLogged: 20,
        completedAt: "2026-10-31T15:30:00Z",
      },
      {
        id: "e-3", taskId: "t-3", businessId: "b-2", studentId: "s-1",
        agreedStartDate: "2026-09-15", agreedEndDate: "2026-09-26",
        scope: "Photos and a short video for the autumn exhibition.",
        status: "reviewed",
        milestones: [
          { id: "ms-8", title: "Exhibition photos", done: true },
          { id: "ms-9", title: "60-second video", done: true },
        ],
        hoursLogged: 12,
        completedAt: "2026-09-26T16:00:00Z",
        paidAt: "2026-09-27T10:00:00Z",
      },
    ],
    threads: [
      { id: "th-1", engagementId: "e-1", participantIds: ["u-biz-1", "u-stu-1"], lastMessageAt: "2026-11-03T09:15:00Z" },
      { id: "th-2", engagementId: "e-2", participantIds: ["u-biz-2", "u-stu-2"], lastMessageAt: "2026-10-31T15:30:00Z" },
      { id: "th-3", engagementId: "e-3", participantIds: ["u-biz-2", "u-stu-1"], lastMessageAt: "2026-09-27T10:05:00Z" },
    ],
    messages: [
      { id: "m-1", threadId: "th-1", senderId: "u-biz-1", body: "Welcome aboard, Amy! Our menu is in the shared folder.", sentAt: "2026-11-02T09:00:00Z" },
      { id: "m-2", threadId: "th-1", senderId: "u-stu-1", body: "Thanks! I'll have a first draft of the page by Thursday.", sentAt: "2026-11-03T09:15:00Z" },
      { id: "m-3", threadId: "th-2", senderId: "u-stu-2", body: "All 30 posts, the calendar and the handover guide are uploaded.", sentAt: "2026-10-31T15:30:00Z" },
      { id: "m-4", threadId: "th-3", senderId: "u-biz-2", body: "The exhibition photos are perfect, paying now. Thank you!", sentAt: "2026-09-27T10:05:00Z" },
    ],
    reviews: [
      { id: "r-1", engagementId: "e-3", authorId: "u-biz-2", subjectId: "u-stu-1", rating: 5, tags: ["Reliable", "Creative"], comment: "Amy captured the exhibition beautifully and delivered a day early.", verifiedReference: true, createdAt: "2026-09-27T10:00:00Z" },
      { id: "r-2", engagementId: "e-3", authorId: "u-stu-1", subjectId: "u-biz-2", rating: 5, tags: ["Clear brief"], comment: "Clear brief and quick feedback.", verifiedReference: false, createdAt: "2026-09-27T12:00:00Z" },
    ],
  };
}
