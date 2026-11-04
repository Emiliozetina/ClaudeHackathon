import { redirect } from "next/navigation";
import { StudentProfileForm } from "@/components/profile/StudentProfileForm";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export default async function StudentProfileEditPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "student") redirect("/dashboard/business");

  const profile = db.students.find((s) => s.userId === user.id);
  if (!profile) redirect("/register/student");

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Name, university, field of study, work history, motivations and goals.
        </p>
        <p className="mt-2 text-xs text-black/60 dark:text-white/60">
          University email verified: {profile.universityEmailVerified ? "yes" : "no"}
        </p>
      </div>
      <StudentProfileForm initial={profile} />
    </section>
  );
}
