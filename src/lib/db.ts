import {
  seedApplications,
  seedBusinesses,
  seedStudents,
  seedTasks,
} from "@/data/seed";
import type { Application, Business, Student, Task } from "@/types";

/**
 * In-memory store for tasks and applications. Data resets whenever the server
 * restarts. It is kept on `globalThis` so Next.js dev hot reloads don't wipe
 * it. Swap this module for a real database later; the routes only use the
 * exports below.
 */
interface Db {
  businesses: Business[];
  students: Student[];
  tasks: Task[];
  applications: Application[];
}

const g = globalThis as unknown as { __hackathonDb?: Db };

export const db: Db = (g.__hackathonDb ??= {
  businesses: structuredClone(seedBusinesses),
  students: structuredClone(seedStudents),
  tasks: structuredClone(seedTasks),
  applications: structuredClone(seedApplications),
});

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
