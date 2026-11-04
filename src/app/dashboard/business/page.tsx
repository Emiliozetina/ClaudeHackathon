import { redirect } from "next/navigation";
import { BusinessProfileForm } from "@/components/profile/BusinessProfileForm";
import { Chip } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { store } from "@/lib/store";

export const instant = false;

export default async function BusinessDashboardPage() {
  const user = await requireUser();
  if (user.role !== "business") redirect("/dashboard/student");

  const profile = store.businesses.find((x) => x.userId === user.id);
  if (!profile) redirect("/register/business");

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="type-h3 text-text-primary">Your business profile</h1>
          {profile.northEastVerified ? (
            <Chip type="teal">North East verified</Chip>
          ) : (
            <Chip type="neutral">Not yet verified</Chip>
          )}
        </div>
        <p className="type-body-sm text-text-secondary">
          Company name and about us — this is what students see when they browse your tasks.
        </p>
      </div>
      <div className="rounded-lg border border-border-subtle bg-surface-card p-6 shadow-elevation-1 sm:p-8">
        <BusinessProfileForm initial={profile} />
      </div>
    </section>
  );
}
