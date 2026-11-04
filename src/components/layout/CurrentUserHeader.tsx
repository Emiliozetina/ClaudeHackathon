import { Suspense } from "react";

import { AccountHeader } from "@/components/auth/AccountHeader";
import { AppHeader } from "@/components/ui";
import { currentUser } from "@/lib/auth";

async function CurrentUserHeaderInner() {
  const user = await currentUser();
  return user ? <AccountHeader user={user} /> : <AppHeader role="public" />;
}

/**
 * App header for whoever is signed in (session or demo user), or the public
 * header when nobody is. Reads cookies, so it streams in behind a
 * header-sized placeholder.
 */
export function CurrentUserHeader() {
  return (
    <Suspense fallback={<div className="h-[72px] border-b border-border-subtle bg-surface-card" />}>
      <CurrentUserHeaderInner />
    </Suspense>
  );
}
