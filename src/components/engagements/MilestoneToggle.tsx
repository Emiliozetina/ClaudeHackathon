"use client";

import { useActionState } from "react";

import { toggleMilestoneAction } from "@/app/engagements/actions";
import { FormError } from "@/components/engagements/ActionForm";
import type { Milestone } from "@/types";

/** Student's milestone checkbox: ticking it saves straight away. */
export function MilestoneToggle({ engagementId, milestone }: { engagementId: string; milestone: Milestone }) {
  const [state, formAction, pending] = useActionState(toggleMilestoneAction, {});

  return (
    <form action={formAction}>
      <input type="hidden" name="engagementId" value={engagementId} />
      <input type="hidden" name="milestoneId" value={milestone.id} />
      <label className={`flex items-center gap-2 text-sm ${pending ? "opacity-50" : ""}`}>
        <input
          type="checkbox"
          checked={milestone.done}
          disabled={pending}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="h-4 w-4 accent-teal-700"
        />
        <span className={milestone.done ? "line-through text-black/60 dark:text-white/60" : ""}>
          {milestone.title}
        </span>
      </label>
      {state.error && <FormError message={state.error} />}
    </form>
  );
}
