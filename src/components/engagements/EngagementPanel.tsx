import Link from "next/link";

import { addMilestoneAction, logHoursAction, markCompleteAction } from "@/app/engagements/actions";
import { ActionForm } from "@/components/engagements/ActionForm";
import { formatDate, formatDateTime, formatPayment } from "@/components/engagements/format";
import { MilestoneToggle } from "@/components/engagements/MilestoneToggle";
import { inputClass, primaryButton, secondaryButton } from "@/components/engagements/styles";
import { Chip, Icon } from "@/components/ui";
import type { EngagementView } from "@/lib/engagements";

// Figma "12 · Messages" task-details column. The parent column draws the border and padding.
const label = "type-overline text-text-secondary";

/**
 * Right-hand "task details" panel shown next to the conversation and on the
 * engagement page: pay, dates, next check-in, milestones, hours logged, and
 * the student's "Log hours" / "Mark task complete" actions.
 */
export function EngagementPanel({ engagement: e, viewerIsStudent }: { engagement: EngagementView; viewerIsStudent: boolean }) {
  const active = e.status === "active";
  const studentCanEdit = viewerIsStudent && active;

  return (
    <aside className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[8px]">
        <p className={label}>TASK DETAILS</p>
        <h2 className="type-h4 text-text-primary">{e.task.title}</h2>
        <div className="flex flex-wrap gap-[8px]">
          <Chip type="pay">{formatPayment(e.task.payment)}</Chip>
          <Chip type="neutral">
            {formatDate(e.agreedStartDate)} – {formatDate(e.agreedEndDate)}
          </Chip>
        </div>
      </div>

      {e.changesRequested && active && (
        <div role="status" className="type-body-sm rounded-md bg-status-warning-bg p-[12px] text-status-warning">
          <p className="type-label">Changes requested by {e.businessName}</p>
          <p className="mt-1 whitespace-pre-line">{e.changesRequested}</p>
        </div>
      )}

      {e.nextCheckIn && (
        <div className="flex items-center gap-[12px] rounded-md bg-navy-50 p-[14px]">
          <Icon name="calendar-0b2545-20" />
          <div className="flex flex-col">
            <p className="type-caption text-text-secondary">Next check-in</p>
            <p className="type-label text-text-primary">{formatDateTime(e.nextCheckIn)}</p>
          </div>
        </div>
      )}

      <div className="h-px bg-border-subtle" />

      <div>
        <p className={label}>MILESTONES</p>
        {e.milestones.length === 0 ? (
          <p className="mt-2 type-body-sm text-text-secondary">No milestones yet.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {e.milestones.map((m) => (
              <li key={m.id}>
                {studentCanEdit ? (
                  <MilestoneToggle engagementId={e.id} milestone={m} />
                ) : (
                  <label className="type-body-sm flex items-center gap-2 text-text-primary">
                    <input type="checkbox" checked={m.done} disabled readOnly className="h-4 w-4 accent-teal-700" />
                    <span className={m.done ? "line-through text-text-secondary" : ""}>{m.title}</span>
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
            <label htmlFor={`hours-${e.id}`} className="type-body-sm text-text-primary">
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
      <div className="type-body-sm flex justify-between text-text-primary">
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
          className="mt-2 h-[6px] overflow-hidden rounded-pill bg-navy-100"
        >
          <div className="h-full bg-teal-700" style={{ width: `${percent}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function StatusLine({ engagement: e, viewerIsStudent }: { engagement: EngagementView; viewerIsStudent: boolean }) {
  const completeHref = `/engagements/${e.id}/complete`;
  const muted = "type-body-sm text-text-secondary";

  switch (e.status) {
    case "active":
      return viewerIsStudent ? null : <p className={muted}>{e.studentName} is working on this task.</p>;
    case "submitted":
      return viewerIsStudent ? (
        <p className={muted}>Waiting for {e.businessName} to check the work.</p>
      ) : (
        <div className="space-y-2">
          <p className="type-label text-text-primary">{e.studentName} has marked the task complete.</p>
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
            <Link href={completeHref} className="text-teal-700 underline">
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
          <Link href={completeHref} className="text-teal-700 underline">
            See reviews
          </Link>
        </p>
      );
  }
}
