import { AccountHeader } from "@/components/auth/AccountHeader";
import { AppHeader } from "@/components/ui";
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
  return user ? <AccountHeader user={user} /> : <AppHeader role="public" />;
}
