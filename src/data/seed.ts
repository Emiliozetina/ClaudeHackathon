import type { Application, Business, Student, Task } from "@/types";

/**
 * Fake demo data only. No real people or contact details.
 * Replaced by the real database when it exists.
 */
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
