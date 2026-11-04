import Link from "next/link";

import { addMilestoneAction, logHoursAction, markCompleteAction } from "@/app/engagements/actions";
import { ActionForm } from "@/components/engagements/ActionForm";
import { formatDate, formatDateTime, formatPayment } from "@/components/engagements/format";
import { MilestoneToggle } from "@/components/engagements/MilestoneToggle";
import { inputClass, primaryButton, secondaryButton } from "@/components/engagements/styles";
import type { EngagementView } from "@/lib/engagements";

const label = "text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60";
const chip = "rounded-full border border-black/10 px-2 py-0.5 text-xs dark:border-white/10";

/**
 * Right-hand "task details" panel shown next to the conversation and on the
 * engagement page: pay, dates, next check-in, milestones, hours logged, and
 * the student's "Log hours" / "Mark task complete" actions.
 */
export function EngagementPanel({ engagement: e, viewerIsStudent }: { engagement: EngagementView; viewerIsStudent: boolean }) {
  const active = e.status === "active";
  const studentCanEdit = viewerIsStudent && active;

  return (
    <aside className="space-y-5 rounded border border-black/10 p-4 dark:border-white/10">
      <div>
        <p className={label}>Task details</p>
        <h2 className="mt-1 font-medium">{e.task.title}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className={chip}>{formatPayment(e.task.payment)}</span>
          <span className={chip}>
            {formatDate(e.agreedStartDate)} – {formatDate(e.agreedEndDate)}
          </span>
        </div>
      </div>

      {e.changesRequested && active && (
        <div role="status" className="rounded border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <p className="font-medium">Changes requested by {e.businessName}</p>
          <p className="mt-1 whitespace-pre-line">{e.changesRequested}</p>
        </div>
      )}

      {e.nextCheckIn && (
        <div className="rounded bg-black/5 p-3 text-sm dark:bg-white/5">
          <p className={label}>Next check-in</p>
          <p className="mt-1">{formatDateTime(e.nextCheckIn)}</p>
        </div>
      )}

      <div>
        <p className={label}>Milestones</p>
        {e.milestones.length === 0 ? (
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">No milestones yet.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {e.milestones.map((m) => (
              <li key={m.id}>
                {studentCanEdit ? (
                  <MilestoneToggle engagementId={e.id} milestone={m} />
                ) : (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={m.done} disabled readOnly className="h-4 w-4 accent-teal-700" />
                    <span className={m.done ? "line-through text-black/60 dark:text-white/60" : ""}>{m.title}</span>
                  </label>
                )}
              </li>
            ))}
          </ul>
        )}
        {active && (
          <ActionForm action={addMilestoneAction} engagementId={e.id} className="mt-2 flex flex-wrap gap-2">
            <input
              name="title"
              required
              maxLength={120}
              placeholder="Add a milestone"
              aria-label="New milestone"
              className={`${inputClass} min-w-0 flex-1`}
            />
            <button type="submit" className={secondaryButton}>
              Add
            </button>
          </ActionForm>
        )}
      </div>

      <HoursLogged logged={e.hoursLogged} expected={e.expectedHours} />

      {studentCanEdit && (
        <div className="space-y-3">
          <ActionForm action={logHoursAction} engagementId={e.id} className="flex flex-wrap items-center gap-2">
            <label htmlFor={`hours-${e.id}`} className="text-sm">
              Log hours
            </label>
            <input
              id={`hours-${e.id}`}
              name="hours"
              type="number"
              min="0.25"
              max="24"
              step="0.25"
              required
              className={`${inputClass} w-20`}
            />
            <button type="submit" className={secondaryButton}>
              Log
            </button>
          </ActionForm>
          <ActionForm action={markCompleteAction} engagementId={e.id}>
            <button type="submit" className={`${primaryButton} w-full`}>
              Mark task complete
            </button>
          </ActionForm>
        </div>
      )}

      <StatusLine engagement={e} viewerIsStudent={viewerIsStudent} />
    </aside>
  );
}

function HoursLogged({ logged, expected }: { logged: number; expected?: number }) {
  const percent = expected ? Math.min(100, Math.round((logged / expected) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className={label}>Hours logged</span>
        <span>{expected ? `${logged} of ${expected}` : `${logged} hrs`}</span>
      </div>
      {expected ? (
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={expected}
          aria-valuenow={logged}
          aria-label="Hours logged"
          className="mt-2 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"
        >
          <div className="h-full bg-teal-700" style={{ width: `${percent}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function StatusLine({ engagement: e, viewerIsStudent }: { engagement: EngagementView; viewerIsStudent: boolean }) {
  const completeHref = `/engagements/${e.id}/complete`;
  const muted = "text-sm text-black/60 dark:text-white/60";

  switch (e.status) {
    case "active":
      return viewerIsStudent ? null : <p className={muted}>{e.studentName} is working on this task.</p>;
    case "submitted":
      return viewerIsStudent ? (
        <p className={muted}>Waiting for {e.businessName} to check the work.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">{e.studentName} has marked the task complete.</p>
          <Link href={completeHref} className={`${primaryButton} inline-block`}>
            Check work &amp; pay
          </Link>
        </div>
      );
    case "paid":
      return (
        <p className={muted}>
          Payment released.{" "}
          {viewerIsStudent ? (
            <Link href={completeHref} className="underline">
              Review {e.businessName}
            </Link>
          ) : (
            <>Waiting for {e.studentName} to leave a review.</>
          )}
        </p>
      );
    case "reviewed":
      return (
        <p className={muted}>
          Complete. You&apos;ve both left reviews.{" "}
          <Link href={completeHref} className="underline">
            See reviews
          </Link>
        </p>
      );
  }
}
