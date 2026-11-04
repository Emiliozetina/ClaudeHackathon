"use client";

import { useState } from "react";

import { requestChangesAction } from "@/app/engagements/actions";
import { ActionForm } from "@/components/engagements/ActionForm";
import { Button } from "@/components/ui";

/** Business: "Request changes" opens a note and sends the work back (same fields as RequestChangesForm). */
export function RequestChanges({ engagementId }: { engagementId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" size="lg" onClick={() => setOpen(true)}>
        Request changes
      </Button>
    );
  }

  return (
    <ActionForm
      action={requestChangesAction}
      engagementId={engagementId}
      className="flex w-full flex-col gap-[8px] rounded-lg border border-border-subtle bg-surface-card p-[20px]"
    >
      <label htmlFor="changes-note" className="type-label text-text-primary">
        What needs changing?
      </label>
      <textarea
        id="changes-note"
        name="note"
        required
        rows={3}
        className="type-body w-full rounded-md border border-border-default bg-surface-card px-[14px] py-[12px] text-text-primary outline-none focus:border-teal-700"
      />
      <div className="flex gap-[8px]">
        <Button type="submit">Send back to student</Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </ActionForm>
  );
}
