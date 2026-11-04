"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip, Icon, fieldClassName } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ClaudeTaskDraft } from "@/lib/task-builder";
import { DRAFT_STORAGE_KEY } from "./TaskForm";

// Figma: Screens → "07a · Post a task — describe it, Claude drafts it" (29:1403).

const EXAMPLES: Record<string, string> = {
  "Stock-take spreadsheet": "our stock list is a mess, need someone good with excel to build a proper stock-take spreadsheet, about 6 hrs a week for 2 weeks, £14 an hour",
  "Event photos": "need photos of our christmas market stall over one weekend, ideally can edit them too, budget £180",
  "Website copy": "our website words are old and boring, want someone to rewrite 5 pages, writing skills essential, £220 fixed",
};

const FIGMA_EXAMPLE =
  "need someone to sort our insta before xmas, few hrs a week, ideally can do videos too. new xmas menu launching. budget around £13 an hour";

const money = (n: number) => `£${n.toFixed(n % 1 ? 2 : 0)}`;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[8px] border-b border-border-subtle pb-[16px]">
      <p className="type-overline text-text-secondary">{label}</p>
      {children}
    </div>
  );
}

export function TaskBuilder() {
  const router = useRouter();
  const [text, setText] = useState(FIGMA_EXAMPLE);
  const [draft, setDraft] = useState<ClaudeTaskDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/tasks/draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description: text }),
    });
    setBusy(false);
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.data) {
      setError(body?.error?.message ?? "Something went wrong");
      return;
    }
    setDraft(body.data);
  }

  function review() {
    if (!draft) return;
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Storage can be unavailable (private mode); the form then opens with defaults.
    }
    router.push("/tasks/new");
  }

  const total = draft ? (draft.payType === "hourly" ? draft.amount * draft.weeks * draft.hoursPerWeek : draft.amount) : 0;

  return (
    <div className="flex flex-col items-start gap-[24px] lg:flex-row">
      <section className="flex w-full flex-col gap-[16px] rounded-lg border border-border-subtle bg-surface-card p-[24px] lg:w-[480px] lg:shrink-0">
        <h2 className="type-h4 text-text-primary">1 · Tell us what you need</h2>
        <div className={fieldClassName()}>
          <textarea
            aria-label="Describe what you need"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="type-body-lg w-full resize-none bg-transparent text-text-primary outline-none"
          />
        </div>
        <div className="flex flex-col gap-[8px]">
          <p className="type-caption text-text-secondary">Try one of these</p>
          <div className="flex flex-wrap gap-[8px]">
            {Object.entries(EXAMPLES).map(([label, example]) => (
              <button key={label} type="button" onClick={() => setText(example)}>
                <Chip type="neutral">{label}</Chip>
              </button>
            ))}
          </div>
        </div>
        <Button size="lg" showArrow onClick={run} disabled={busy || text.trim().length < 10} className="w-full">
          {busy ? "Drafting…" : "Draft my task with Claude"}
        </Button>
        <p className="type-caption flex items-center gap-[6px] text-text-secondary">
          <Icon name="help-5b6472-14" />
          Your “About us” is added automatically from your profile.
        </p>
        {error && <p role="alert" className="type-body-sm text-status-error">{error}</p>}
      </section>

      <section className={cn("flex w-full min-w-0 flex-1 flex-col gap-[16px] rounded-lg border border-border-subtle bg-surface-card p-[24px]", !draft && "opacity-60")}>
        <div className="flex items-center justify-between">
          <h2 className="type-h4 text-text-primary">2 · Claude’s draft</h2>
          {draft && (
            <Chip type="success">{draft.source === "claude" ? "Ready to review" : "Ready to review · offline draft"}</Chip>
          )}
        </div>

        {!draft ? (
          <p className="type-body-sm text-text-secondary">Describe the task and press “Draft my task with Claude”. Nothing is posted until you publish it.</p>
        ) : (
          <>
            <Row label="JOB TITLE"><p className="type-body text-text-primary">{draft.title}</p></Row>
            <Row label="JOB CONTENTS"><p className="type-body text-text-primary">{draft.contents}</p></Row>
            <Row label="PERIOD">
              <p className="type-body text-text-primary">
                {draft.weeks} week{draft.weeks === 1 ? "" : "s"} · about {draft.hoursPerWeek} hours a week
              </p>
            </Row>
            <Row label="REQUIREMENTS (MUST HAVE)">
              <div className="flex flex-wrap gap-[8px]">
                {draft.requirements.length ? draft.requirements.map((s) => <Chip key={s} type="required">{s}</Chip>) : <span className="type-body-sm text-text-secondary">None found</span>}
              </div>
            </Row>
            <Row label="PREFERRED EXPERIENCE (OPTIONAL)">
              <div className="flex flex-wrap gap-[8px]">
                {draft.preferred.length ? draft.preferred.map((s) => <Chip key={s} type="preferred">{s}</Chip>) : <span className="type-body-sm text-text-secondary">None</span>}
              </div>
            </Row>
            <Row label="PAY">
              <p className="type-body text-text-primary">
                {draft.payType === "hourly" ? `${money(draft.amount)}/hr · estimated ${money(total)} for the task` : `${money(draft.amount)} fixed`}
              </p>
              {draft.payNote && (
                <p className="type-caption flex items-start gap-[8px] rounded-md bg-amber-100 px-[14px] py-[10px] text-amber-900">
                  <Icon name="alert-633806-16" />
                  {draft.payNote}
                </p>
              )}
            </Row>
            {draft.unknowns.length > 0 && (
              <div className="flex flex-col gap-[10px] rounded-md bg-navy-50 p-[16px]">
                <p className="type-label flex items-center gap-[8px] text-text-primary">
                  <Icon name="help-0b2545-16" />
                  Claude couldn’t tell from your description
                </p>
                <ul className="type-body-sm list-disc pl-[20px] text-text-primary">
                  {draft.unknowns.map((u) => <li key={u}>{u}</li>)}
                </ul>
              </div>
            )}
            <div className="flex items-center justify-between pt-[16px]">
              <Button variant="ghost" onClick={run} disabled={busy}>Regenerate</Button>
              <Button size="lg" showArrow onClick={review}>Review &amp; edit full post</Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
