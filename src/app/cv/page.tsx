import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CvImportFlow } from "@/components/cv/CvImportFlow";
import { getCurrentUser } from "@/lib/auth";
import type { StudentDetails } from "@/lib/cv/types";
import { DomainError } from "@/lib/errors";
import { store } from "@/lib/store";

export const metadata: Metadata = { title: "Start with your CV · NEXA" };

function Notice({ title, children }: { title: string; children: string }) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3 px-6 py-12">
      <h1 className="type-h3 text-text-primary">{title}</h1>
      <p className="type-body text-text-secondary">{children}</p>
      <Link href="/" className="type-label text-teal-700 underline">
        Back to home
      </Link>
    </section>
  );
}

async function CvPage() {
  let user;
  try {
    user = await getCurrentUser(); // reads the demo cookie, so this is request-time
  } catch (error) {
    if (error instanceof DomainError) return <Notice title="Sign in required">Please sign in to continue.</Notice>;
    throw error;
  }

  const student = user.role === "student" ? store.students.find((s) => s.userId === user.id) : undefined;
  if (!student) {
    return <Notice title="This page is for students">Switch to a student account to import a CV.</Notice>;
  }

  const profile: StudentDetails = {
    name: student.name,
    university: student.university,
    fieldOfStudy: student.fieldOfStudy,
    yearOfStudy: student.yearOfStudy ?? "",
    availability: student.availability ?? "",
    skills: [...student.skills],
    workHistory: student.workHistory.map((w) => ({
      id: w.id,
      title: w.title,
      organisation: w.organisation,
      startDate: w.startDate.slice(0, 7),
      endDate: w.endDate ? w.endDate.slice(0, 7) : undefined,
    })),
    motivations: student.motivations,
    goals: student.goals,
  };

  return <CvImportFlow profile={profile} email={user.email} emailVerified={student.universityEmailVerified} />;
}

export default function Page() {
  return (
    <Suspense fallback={<p className="type-body p-6 text-text-secondary">Loading…</p>}>
      <CvPage />
    </Suspense>
  );
}
