import { AppHeader } from "@/components/ui";
import { displayName, getCurrentUser } from "@/lib/auth";
import { DomainError } from "@/lib/errors";
import type { User } from "@/types";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

/** App header for the signed-in (demo) user; falls back to the public header. */
export async function AccountHeader() {
  let user: User;
  try {
    user = await getCurrentUser();
  } catch (err) {
    if (err instanceof DomainError) return <AppHeader role="public" />;
    throw err;
  }
  const name = displayName(user.id);
  return (
    <AppHeader
      role={user.role}
      account={{
        name,
        subtitle: user.role === "business" ? "Business account" : "Student",
        initials: initials(name),
      }}
    />
  );
}
