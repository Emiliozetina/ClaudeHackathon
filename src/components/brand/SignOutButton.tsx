"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function onClick() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <Button variant="ghost" onClick={onClick} disabled={busy}>
      {busy ? "Signing out…" : "Sign out"}
    </Button>
  );
}
