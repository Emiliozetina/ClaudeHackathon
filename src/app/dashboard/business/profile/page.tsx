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
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-ink)]">
            Your business profile
          </h1>
          {profile.northEastVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-brand-soft)] px-2.5 py-0.5 text-xs font-medium text-[color:var(--color-brand-hover)]">
              <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M4 10l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              North East verified
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-[color:var(--color-line)] bg-white px-2.5 py-0.5 text-xs text-[color:var(--color-ink-muted)]">
              Not yet verified
            </span>
          )}
        </div>
        <p className="text-sm text-[color:var(--color-ink-muted)]">
          Company name and about us — this is what students see when they browse your tasks.
        </p>
      </div>
      <div className="rounded-2xl border border-[color:var(--color-line)] bg-white p-6 shadow-[0_1px_2px_rgba(13,27,42,0.04)] sm:p-8">
        <BusinessProfileForm initial={profile} />
      </div>
    </section>
  );
}
