import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Student, Task } from "@/types";

/** The student profile of the current (demo) user, if they are a student. */
export async function currentStudent(): Promise<Student | undefined> {
  const user = await getCurrentUser();
  return db.students.find((s) => s.userId === user.id);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

const norm = (s: string) => s.trim().toLowerCase();

/** True when the student lists this skill on their profile. */
export function hasSkill(student: Student | undefined, skill: string): boolean {
  return Boolean(student?.skills.some((s) => norm(s) === norm(skill)));
}

export function skillMatch(student: Student | undefined, task: Task) {
  const required = task.requirements.filter((r) => hasSkill(student, r)).length;
  const preferred = task.preferredExperience.filter((r) => hasSkill(student, r)).length;
  return {
    required,
    requiredTotal: task.requirements.length,
    preferred,
    preferredTotal: task.preferredExperience.length,
    meetsAllRequired: required === task.requirements.length,
  };
}

/** e.g. "2 weeks · 10 hrs/week", from the task dates and estimated hours. */
export function durationLabel(task: Task): string {
  const days =
    Math.round((Date.parse(task.endDate) - Date.parse(task.startDate)) / 86_400_000) + 1;
  const length =
    days >= 14 ? `${Math.round(days / 7)} weeks` : days >= 7 ? "1 week" : `${days} day${days === 1 ? "" : "s"}`;
  if (!task.estimatedHours) return length;
  const weeks = Math.max(1, Math.round(days / 7));
  const perWeek = Math.round(task.estimatedHours / weeks);
  return days >= 7 ? `${length} · ${perWeek} hrs/week` : `${length} · ${task.estimatedHours} hrs`;
}

/** e.g. "Mon 17 Nov 2026". */
export function formatDate(iso: string, withYear = true): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).replace(",", "");
}

/** e.g. "Posted 2 days ago". */
export function postedLabel(iso: string): string {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "Posted today";
  return `Posted ${days} day${days === 1 ? "" : "s"} ago`;
}

export function whereLabel(task: Task): string {
  return task.remote ? `${task.location} · Remote` : `${task.location} · On-site`;
}

/** True when the ISO timestamp is within the last `days` days. */
export function withinDays(iso: string, days: number): boolean {
  return Date.parse(iso) >= Date.now() - days * 86_400_000;
}
