import { SignOutButton } from "@/components/brand/SignOutButton";
import { AppHeader } from "@/components/ui";
import { store } from "@/lib/store";
import type { User } from "@/types";

/** "Amara Okafor" -> "AO". */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** App header for the signed-in user, or the public header when signed out. */
export function HeaderFor({ user }: { user: User | null }) {
  if (!user) return <AppHeader role="public" />;
  if (user.role === "business") {
    const business = store.businesses.find((b) => b.userId === user.id);
    const name = business?.name ?? "Business";
    return (
      <AppHeader
        role="business"
        account={{ name, subtitle: "Business account", initials: initialsOf(name) }}
        actions={<SignOutButton />}
      />
    );
  }
  const student = store.students.find((s) => s.userId === user.id);
  const name = student?.name ?? "Student";
  return (
    <AppHeader
      role="student"
      account={{ name, subtitle: student?.university ?? "", initials: initialsOf(name) }}
      actions={<SignOutButton />}
    />
  );
}
