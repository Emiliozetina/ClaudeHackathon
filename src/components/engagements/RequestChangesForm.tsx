"use client";

import { useState } from "react";

import { requestChangesAction } from "@/app/engagements/actions";
import { ActionForm } from "@/components/engagements/ActionForm";
import { inputClass, primaryButton, secondaryButton } from "@/components/engagements/styles";

/** Business: "Request changes" button that opens a note and sends the work back. */
export function RequestChangesForm({ engagementId }: { engagementId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={secondaryButton}>
        Request changes
      </button>
    );
  }

  return (
    <ActionForm action={requestChangesAction} engagementId={engagementId} className="w-full space-y-2">
      <label htmlFor="changes-note" className="block text-sm font-medium">
        What needs changing?
      </label>
      <textarea id="changes-note" name="note" required rows={3} className={`${inputClass} w-full`} />
      <div className="flex gap-2">
        <button type="submit" className={primaryButton}>
          Send back to student
        </button>
        <button type="button" onClick={() => setOpen(false)} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </ActionForm>
  );
}
