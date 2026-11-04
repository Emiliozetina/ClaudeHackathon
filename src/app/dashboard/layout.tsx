import type { ReactNode } from "react";
import { SignOutButton } from "@/components/brand/SignOutButton";
import { AppHeader } from "@/components/ui";
import { displayName, requireUser } from "@/lib/auth";
import { store } from "@/lib/store";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export const instant = false;

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  const name = displayName(user.id) === "Unknown user" ? user.email : displayName(user.id);
  const subtitle =
    user.role === "business"
      ? "Business account"
      : (store.students.find((s) => s.userId === user.id)?.university ?? "Student");

  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <AppHeader
        role={user.role}
        account={{ name, subtitle, initials: initialsFor(name) }}
        actions={<SignOutButton />}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
