"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Checkbox, Icon, fieldClassName } from "@/components/ui";

type ApplyPanelProps = {
  taskId: string;
  businessName: string;
  student?: { name: string; initials: string; cvFileName?: string };
  match: { title: string; detail: string };
  /** e.g. "Mon 17 Nov". */
  startLabel: string;
  appliedCount: number;
  alreadyApplied: boolean;
};

/**
 * Figma 10 → Apply panel (10:1021). Sends the application the same way as
 * ApplyForm: POST /api/applications as the demo user, then back to the task.
 */
export function ApplyPanel({
  taskId,
  businessName,
  student,
  match,
  startLabel,
  appliedCount,
  alreadyApplied,
}: ApplyPanelProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [canStart, setCanStart] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fullNote = [note.trim(), canStart ? `I can start on ${startLabel}.` : ""]
      .filter(Boolean)
      .join("\n\n");
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskId, note: fullNote }),
    });
    setBusy(false);
    if (res.ok) {
      // Same as ApplyForm: back to the task, which shows the application status.
      router.push(`/tasks/${taskId}`);
      router.refresh();
      return;
    }
    const body = await res.json().catch(() => null);
    setError(body?.error?.message ?? "Something went wrong");
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-[20px] rounded-lg border border-border-subtle bg-surface-card p-[28px] shadow-elevation-2"
    >
      <h2 className="type-h3 text-text-primary">Apply for this task</h2>

      <div className="flex items-center gap-[12px] rounded-md bg-teal-50 p-[16px]">
        <Icon name="target-0e7c7b-24" className="shrink-0" />
        <div className="flex flex-col gap-[2px]">
          <p className="type-label text-teal-800">{match.title}</p>
          <p className="type-body-sm text-teal-800">{match.detail}</p>
        </div>
      </div>

      {student && (
        <div className="flex items-center gap-[12px]">
          <Avatar initials={student.initials} size={40} />
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <p className="type-label text-text-primary">{student.name}</p>
            <p className="type-caption text-text-secondary">Your profile will be shared</p>
          </div>
          <Button variant="ghost" href={`/tasks/${taskId}/apply`}>
            Preview
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-[6px]">
        <label htmlFor="apply-note" className="type-label text-text-primary">
          Short note to {businessName}
        </label>
        <div className={fieldClassName()}>
          <textarea
            id="apply-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={900}
            rows={4}
            placeholder="Why this task, and when you're free."
            aria-describedby="apply-note-hint"
            className="type-body min-h-[112px] w-full resize-y bg-transparent text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
        <p id="apply-note-hint" className="type-caption text-text-secondary">
          Tip: say why you’re interested and when you’re free.
        </p>
      </div>

      {student?.cvFileName && (
        <Checkbox defaultChecked label={`Include my CV (${student.cvFileName})`} />
      )}
      <Checkbox
        checked={canStart}
        onChange={(e) => setCanStart(e.target.checked)}
        label={`I can start on ${startLabel}`}
      />

      {error && (
        <p role="alert" className="type-body-sm text-status-error">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" showArrow disabled={busy || alreadyApplied} className="w-full">
        {alreadyApplied ? "Already applied" : busy ? "Sending…" : "Send application"}
      </Button>

      <p className="flex items-center justify-center gap-[6px]">
        <Icon name="clock-5b6472-14" />
        <span className="type-caption text-text-secondary">
          {appliedCount} applied so far
        </span>
      </p>

      <p className="flex items-start gap-[8px] rounded-md bg-navy-50 px-[12px] py-[12px]">
        <Icon name="shield-5b6472-16" className="mt-[2px] shrink-0" />
        <span className="type-caption text-text-secondary">
          Payment is held securely by NEXA and released when the work is signed off.
        </span>
      </p>
    </form>
  );
}
