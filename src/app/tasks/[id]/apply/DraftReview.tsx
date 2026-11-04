"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Icon, fieldClassName } from "@/components/ui";
import { DEV_STUDENT_HEADERS } from "@/lib/dev-actor";

export type DraftParagraph = { text: string; source: string };

type DraftReviewProps = {
  taskId: string;
  paragraphs: DraftParagraph[];
  cvFileName?: string;
  weekly: { used: number; limit: number };
  alreadyApplied: boolean;
  /** Rendered between the draft card and the send panel's column (claim check). */
  claimCheck: React.ReactNode;
};

const panel = "rounded-lg border border-border-subtle bg-surface-card p-[28px]";

/**
 * Figma 10a → Draft + Send panel (29:1306). Sends via POST /api/applications
 * like ApplyForm: the personal message first, then the reviewed draft.
 */
export function DraftReview({
  taskId,
  paragraphs,
  cvFileName,
  weekly,
  alreadyApplied,
  claimCheck,
}: DraftReviewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(paragraphs.map((p) => p.text).join("\n\n"));
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const note = [message.trim(), draft.trim()].filter(Boolean).join("\n\n");
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json", ...DEV_STUDENT_HEADERS },
      body: JSON.stringify({ taskId, note }),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/dashboard/student/applications");
      return;
    }
    const body = await res.json().catch(() => null);
    setError(body?.error?.message ?? "Something went wrong");
  }

  const weeklyPct = Math.min(100, Math.round((weekly.used / weekly.limit) * 100));

  return (
    <div className="flex flex-col gap-[24px] lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-[24px]">
        <section className={`${panel} flex flex-col gap-[16px]`}>
          <div className="flex flex-wrap items-center justify-between gap-[8px]">
            <h2 className="type-h4 text-text-primary">Your draft</h2>
            <div className="flex items-center gap-[8px]">
              <span className="type-label-sm flex items-center gap-[6px] rounded-pill bg-navy-900 py-[5px] pl-[10px] pr-[12px] text-text-inverse">
                <Icon name="spark-f2a541-14" />
                Drafted from your profile
              </span>
              <Button variant="ghost" onClick={() => setEditing((v) => !v)}>
                {editing ? "Done" : "Edit"}
              </Button>
            </div>
          </div>

          {editing ? (
            <div className={fieldClassName()}>
              <textarea
                aria-label="Your draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={10}
                className="type-body w-full resize-y bg-transparent text-text-primary outline-none"
              />
            </div>
          ) : draft === paragraphs.map((p) => p.text).join("\n\n") ? (
            paragraphs.map((p, i) => (
              <div key={i}className="flex flex-col items-start gap-[8px]">
                <p className="type-body text-text-primary">{p.text}</p>
                <span className="type-caption flex items-center gap-[6px] rounded-pill bg-teal-50 px-[8px] py-[3px] text-teal-800">
                  <Icon name="quote-0a5f5e-12" />
                  Source: {p.source}
                </span>
              </div>
            ))
          ) : (
            <p className="type-body whitespace-pre-line text-text-primary">{draft}</p>
          )}
        </section>

        {claimCheck}
      </div>

      <form
        onSubmit={send}
        className={`${panel} flex w-full shrink-0 flex-col gap-[18px] shadow-elevation-2 lg:w-[440px]`}
      >
        <div className="flex flex-col gap-[16px]">
          <h2 className="type-h4 text-text-primary">Add a personal message</h2>
          <p className="type-body-sm text-text-secondary">
            A short note in your own words — this is what businesses read first.
          </p>
        </div>
        <div className={fieldClassName()}>
          <textarea
            aria-label="Personal message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Why this business, in a sentence or two."
            className="type-body min-h-[104px] w-full resize-y bg-transparent text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>

        {cvFileName && <Checkbox defaultChecked label={`Include my CV (${cvFileName})`} />}

        <div className="flex flex-col gap-[6px]">
          <div className="flex justify-between">
            <span className="type-caption text-text-secondary">Applications this week</span>
            <span className="type-label-sm text-text-primary">
              {weekly.used} of {weekly.limit}
            </span>
          </div>
          <div className="h-[6px] w-full overflow-hidden rounded-pill bg-border-subtle">
            <div className="h-full rounded-pill bg-teal-700" style={{ width: `${weeklyPct}%` }} />
          </div>
        </div>

        {error && (
          <p role="alert" className="type-body-sm text-status-error">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" showArrow disabled={busy || alreadyApplied} className="w-full">
          {alreadyApplied ? "Already applied" : busy ? "Sending…" : "Send application"}
        </Button>
        <div className="grid grid-cols-2 gap-[12px]">
          <Button variant="secondary" href={`/tasks/${taskId}`}>
            Save for later
          </Button>
          <Button variant="secondary" href="/tasks">
            Not interested
          </Button>
        </div>

        <p className="flex items-start gap-[8px] rounded-md bg-navy-50 p-[12px]">
          <Icon name="lock-5b6472-16" className="mt-[2px] shrink-0" />
          <span className="type-caption text-text-secondary">
            Nothing is sent until you check it and press send.
          </span>
        </p>
      </form>
    </div>
  );
}
