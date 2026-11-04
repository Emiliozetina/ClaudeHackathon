import { db } from "@/lib/db";
import type { Application, ID, Student, WorkHistoryItem } from "@/types";

/** What a business may see about an applicant before choosing them. */
export interface AnonymousStudentView {
  university: string;
  fieldOfStudy: string;
  skills: string[];
  workHistory: Pick<WorkHistoryItem, "title" | "startDate" | "endDate">[];
  motivations: string;
  goals: string;
}

/** Name is only revealed once the student has been chosen. */
export interface ApplicationForBusiness extends Application {
  student: AnonymousStudentView & { name?: string };
}

export function anonymise(student: Student): AnonymousStudentView {
  return {
    university: student.university,
    fieldOfStudy: student.fieldOfStudy,
    skills: student.skills,
    // Employer names are left out: they could identify the student.
    workHistory: student.workHistory.map((w) => ({
      title: w.title,
      startDate: w.startDate,
      endDate: w.endDate,
    })),
    motivations: student.motivations,
    goals: student.goals,
  };
}

/**
 * Shapes an application for the business that owns the task. The student's
 * identity (name, userId, id) stays hidden until the application is chosen.
 */
export function forBusiness(app: Application): ApplicationForBusiness {
  const student = db.students.find((s) => s.id === app.studentId);
  const chosen = app.status === "chosen";
  const view: AnonymousStudentView = student
    ? anonymise(student)
    : {
        university: "",
        fieldOfStudy: "",
        skills: [],
        workHistory: [],
        motivations: "",
        goals: "",
      };
  return {
    ...app,
    studentId: chosen ? app.studentId : "hidden",
    student: chosen && student ? { ...view, name: student.name } : view,
  };
}

export function applicationsForTask(taskId: ID): Application[] {
  return db.applications.filter((a) => a.taskId === taskId);
}
