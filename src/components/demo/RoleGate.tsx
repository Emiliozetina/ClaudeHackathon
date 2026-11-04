// TEMP (demo auth): until #1 ships real login, pages meant for one role tell
// the visitor to switch user in the demo bar instead of failing with 403/404.

import type { ReactNode } from "react";
import { connection } from "next/server";

import { displayName, getCurrentUser } from "@/lib/auth";
import type { Role } from "@/types";

export async function RoleGate({ role, children }: { role: Role; children: ReactNode }) {
  await connection();
  const user = await getCurrentUser();
  if (user.role === role) return <>{children}</>;

  return (
    <p
      role="status"
      className="mt-6 rounded border border-border-default bg-surface-card p-4 text-sm text-text-secondary"
    >
      This page is for {role} accounts. You&apos;re acting as {displayName(user.id)} ({user.role}).
      Pick a {role} in the demo bar at the top of the page.
    </p>
  );
}
