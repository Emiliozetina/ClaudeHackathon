"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEV_BUSINESS_HEADERS } from "@/lib/dev-actor";

type Action = "shortlisted" | "rejected" | "chosen";

export function ApplicantActions({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(status: Action) {
    if (status === "chosen" && !confirm("Choose this applicant? Everyone else will be declined.")) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", ...DEV_BUSINESS_HEADERS },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (res.ok) {
      router.refresh();
      return;
    }
    const body = await res.json().catch(() => null);
    setError(body?.error?.message ?? "Something went wrong");
  }

  const btn = "rounded border px-3 py-1 text-sm disabled:opacity-50";
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button disabled={busy} onClick={() => act("shortlisted")} className={btn}>Shortlist</button>
      <button disabled={busy} onClick={() => act("chosen")} className={btn}>Choose</button>
      <button disabled={busy} onClick={() => act("rejected")} className={btn}>Decline</button>
      {error && <span role="alert" className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
