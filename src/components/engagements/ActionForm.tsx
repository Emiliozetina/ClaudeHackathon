"use client";

import { useActionState } from "react";

import type { ActionState } from "@/app/engagements/actions";

export type EngagementAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * A form bound to one engagement action. Posts the engagement id, disables its
 * fields while pending and shows the action's error inline.
 */
export function ActionForm({
  action,
  engagementId,
  className,
  children,
}: {
  action: EngagementAction;
  engagementId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className={className}>
      <input type="hidden" name="engagementId" value={engagementId} />
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      {state.error && <FormError message={state.error} />}
    </form>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-2 w-full text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}
