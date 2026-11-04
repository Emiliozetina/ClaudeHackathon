import { redirect } from "next/navigation";
import { BusinessProfileForm } from "@/components/profile/BusinessProfileForm";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const instant = false;

export default async function BusinessDashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "business") redirect("/dashboard/student");

  const profile = db.businesses.find((b) => b.userId === user.id);
  if (!profile) redirect("/register/business");

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your business profile</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Company name and about us — this is what students see when they browse your tasks.
        </p>
        <p className="mt-2 text-xs text-black/60 dark:text-white/60">
          North East verified: {profile.northEastVerified ? "yes" : "no"}
        </p>
      </div>
      <BusinessProfileForm initial={profile} />
    </section>
  );
}
