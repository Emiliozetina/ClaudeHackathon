import { SignOutButton } from "@/components/brand/SignOutButton";
import { AppHeader } from "@/components/ui";
import { displayName } from "@/lib/auth";
import { store } from "@/lib/store";
import type { User } from "@/types";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

/** The App header for the signed-in user, with their name and a Sign out action. */
export function AccountHeader({ user }: { user: User }) {
  const known = displayName(user.id);
  const name = known === "Unknown user" ? user.email : known;
  const subtitle =
    user.role === "business"
      ? "Business account"
      : (store.students.find((s) => s.userId === user.id)?.university ?? "Student");

  return (
    <AppHeader
      role={user.role}
      account={{ name, subtitle, initials: initialsFor(name) }}
      actions={<SignOutButton />}
    />
  );
}
