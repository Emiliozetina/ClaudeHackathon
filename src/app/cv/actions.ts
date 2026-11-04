"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import type { SaveResult } from "@/lib/cv/types";
import { parseStudentDetails } from "@/lib/cv/validate";
import { DomainError } from "@/lib/errors";
import { newId, store } from "@/lib/store";

/**
 * Saves the student's confirmed details to their profile (in-memory store).
 * Called only when the student presses the final confirm button, so nothing
 * from the CV is saved before they have checked it.
 */
export async function saveStudentDetails(input: unknown): Promise<SaveResult> {
  let userId: string;
  try {
    const user = await getCurrentUser();
    if (user.role !== "student") return { ok: false, error: "Only students can save a student profile." };
    userId = user.id;
  } catch (error) {
    if (error instanceof DomainError) return { ok: false, error: error.message };
    throw error;
  }

  const student = store.students.find((s) => s.userId === userId);
  if (!student) return { ok: false, error: "Student profile not found." };

  const parsed = parseStudentDetails(input);
  if (!parsed.value) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: parsed.errors };
  }
  const v = parsed.value;

  student.name = v.name;
  student.university = v.university;
  student.fieldOfStudy = v.fieldOfStudy;
  student.yearOfStudy = v.yearOfStudy || undefined;
  student.availability = v.availability || undefined;
  student.skills = v.skills;
  student.workHistory = v.workHistory.map((w) => ({
    id: w.id || newId("wh"),
    title: w.title,
    organisation: w.organisation,
    startDate: w.startDate,
    endDate: w.endDate,
  }));
  student.motivations = v.motivations;
  student.goals = v.goals;

  revalidatePath("/dashboard/student/profile");
  return { ok: true };
}
