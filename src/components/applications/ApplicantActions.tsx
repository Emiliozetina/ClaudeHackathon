"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@/components/ui";

type Action = "shortlisted" | "rejected" | "chosen";

// Figma: "08 · Review applicants" detail panel actions (Message / Decline / Choose).
export function ApplicantActions({
  applicationId,
  label = "this applicant",
  canShortlist = false,
}: {
  applicationId: string;
  label?: string;
  canShortlist?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(status: Action) {
    if (status === "chosen" && !confirm("Choose this applicant? Everyone else will be declined.")) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (res.ok) {
      const body = await res.json().catch(() => null);
      const engagementId: unknown = body?.data?.engagementId;
      if (status === "chosen" && typeof engagementId === "string") {
        router.push(`/engagements/${engagementId}`);
        return;
      }
      router.refresh();
      return;
    }
    const body = await res.json().catch(() => null);
    setError(body?.error?.message ?? "Something went wrong");
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 gap-[12px]">
        {canShortlist ? (
          <Button variant="secondary" disabled={busy} onClick={() => act("shortlisted")}>
            Shortlist
          </Button>
        ) : (
          <Button variant="secondary" href="/messages">
            Message
          </Button>
        )}
        <Button variant="secondary" disabled={busy} onClick={() => act("rejected")}>
          Decline
        </Button>
      </div>
      <Button size="lg" showArrow disabled={busy} onClick={() => act("chosen")} className="w-full">
        Choose {label} for this task
      </Button>
      <p className="type-caption flex items-start gap-[6px] text-text-secondary">
        <Icon name="info-5b6472-14" />
        Other applicants will be notified kindly and returned to browsing.
      </p>
      {error && (
        <p role="alert" className="type-body-sm text-status-error">
          {error}
        </p>
      )}
    </div>
  );
}
