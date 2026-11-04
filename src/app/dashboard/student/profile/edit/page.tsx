import { redirect } from "next/navigation";
import { StudentProfileForm } from "@/components/profile/StudentProfileForm";
import { AccountHeader } from "@/components/auth/AccountHeader";
import { Chip } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { store } from "@/lib/store";

export const instant = false;

export default async function StudentProfileEditPage() {
  const user = await requireUser();
  if (user.role !== "student") redirect("/dashboard/business/profile");

  const profile = store.students.find((x) => x.userId === user.id);
  if (!profile) redirect("/register/student");

  return (
    <>
      <AccountHeader user={user} />
      <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="type-h3 text-text-primary">Your profile</h1>
          {profile.universityEmailVerified ? (
            <Chip type="teal">University email verified</Chip>
          ) : (
            <Chip type="neutral">Not yet verified</Chip>
          )}
        </div>
        <p className="type-body-sm text-text-secondary">
          Name, university, field of study, work history, motivations and goals — this is what businesses see on your applications.
        </p>
      </div>
      <div className="rounded-lg border border-border-subtle bg-surface-card p-6 shadow-elevation-1 sm:p-8">
        <StudentProfileForm initial={profile} />
      </div>
      </section>
    </>
  );
}
