"use client";

import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip, Field, Icon, Input, Select, TaskCard, fieldClassName } from "@/components/ui";
import { cn } from "@/lib/cn";

// Figma: Screens → "07 · Post a task" (9:464). Defaults are the Claude draft shown in Figma
// until "07a · Describe it" passes a real draft in.

const HOLIDAY_PAY_RATE = 0.1207;
const NEXA_FEE_RATE = 0.2;
const DESCRIPTION_MAX = 1000;

type PayType = "hourly" | "fixed";
type LocationType = "on-site" | "hybrid" | "remote";

export type TaskDraft = {
  title: string;
  workType: string;
  description: string;
  requirements: string[];
  preferred: string[];
  startDate: string; // yyyy-mm-dd
  weeks: number;
  hoursPerWeek: number;
  payType: PayType;
  amount: number;
  locationType: LocationType;
  address: string;
};

const FIGMA_DRAFT: TaskDraft = {
  title: "Social media assistant",
  workType: "Marketing & social media",
  description:
    "We’re a small independent café in Gateshead heading into our busiest season. We need help planning, shooting and scheduling a month of Instagram and TikTok posts — including our new Christmas menu.",
  requirements: ["Canva", "Instagram"],
  preferred: ["Copywriting", "Video editing"],
  startDate: "2026-11-17",
  weeks: 2,
  hoursPerWeek: 10,
  payType: "hourly",
  amount: 13.5,
  locationType: "hybrid",
  address: "Tyne Brew Café, 14 High Street, Gateshead NE8 2AU",
};

const workTypes = ["Marketing & social media", "Photography & video", "Admin & data", "Design", "Writing", "Other"];

const money = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function Section({ step, title, subtitle, children }: { step: number; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[20px] rounded-lg border border-border-subtle bg-surface-card p-[33px]">
      <div className="flex items-center gap-[12px]">
        <span className="type-label-sm flex size-[28px] shrink-0 items-center justify-center rounded-pill bg-navy-900 text-text-inverse">
          {step}
        </span>
        <div className="flex flex-col">
          <h2 className="type-h4 text-text-primary">{title}</h2>
          <p className="type-body-sm text-text-secondary">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex w-full gap-[4px] rounded-md bg-navy-50 p-[4px]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "type-label h-[40px] flex-1 rounded-[8px]",
            value === o.value ? "bg-surface-card text-text-primary shadow-elevation-1" : "text-text-secondary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SkillInput({ label, hint, skills, onChange, tone }: { label: string; hint: string; skills: string[]; onChange: (s: string[]) => void; tone: "required" | "preferred" }) {
  const [draft, setDraft] = useState("");
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && draft.trim()) {
      e.preventDefault();
      if (!skills.includes(draft.trim())) onChange([...skills, draft.trim()]);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && skills.length) {
      onChange(skills.slice(0, -1));
    }
  }
  return (
    <Field label={label}>
      {({ id, describedBy }) => (
        <>
          <div className={cn(fieldClassName(), "flex-wrap px-[13px] py-[11px]")}>
            {skills.map((s) => (
              <Chip key={s} type={tone} className="gap-[6px]">
                {s}
                <button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(skills.filter((x) => x !== s))}>
                  <Icon name={tone === "required" ? "x-white-12" : "x-0b2545-12"} />
                </button>
              </Chip>
            ))}
            <input
              id={id}
              aria-describedby={describedBy}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type a skill and press Enter"
              className="type-body-sm min-w-[160px] flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <p className="type-caption flex items-center gap-[6px] text-text-secondary">
            <Icon name="info-5b6472-14" />
            {hint}
          </p>
        </>
      )}
    </Field>
  );
}

export function TaskForm({ initial = FIGMA_DRAFT, businessName = "Tyne Brew Café", about }: { initial?: TaskDraft; businessName?: string; about?: string }) {
  const router = useRouter();
  const [t, setT] = useState<TaskDraft>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof TaskDraft>(k: K, v: TaskDraft[K]) => setT((p) => ({ ...p, [k]: v }));

  const pay = useMemo(() => {
    const totalHours = t.weeks * t.hoursPerWeek;
    const base = t.payType === "hourly" ? t.amount * totalHours : t.amount;
    const holiday = Math.round(base * HOLIDAY_PAY_RATE * 100) / 100;
    const fee = Math.round(base * NEXA_FEE_RATE * 100) / 100;
    return { base, holiday, fee, total: Math.round((base + holiday + fee) * 100) / 100 };
  }, [t]);

  const checklist = [
    { label: "Clear title and description", done: t.title.trim().length > 3 && t.description.trim().length > 20 },
    { label: "Required vs preferred skills", done: t.requirements.length > 0 },
    { label: "Fair pay shown up front", done: t.amount > 0 },
    { label: "Dates and hours", done: Boolean(t.startDate) && t.weeks > 0 && t.hoursPerWeek > 0 },
    { label: "Add a photo of your workplace", done: false },
  ];

  async function submit(publish: boolean) {
    const payload = {
      title: t.title,
      description: t.description,
      startDate: t.startDate,
      endDate: addDays(t.startDate, t.weeks * 7 - 1),
      estimatedHours: t.weeks * t.hoursPerWeek,
      requirements: t.requirements,
      preferredExperience: t.preferred,
      payment: { type: t.payType, amount: t.amount },
      location: t.address,
      remote: t.locationType === "remote",
      ...(publish ? {} : { status: "draft" }),
    };
    setBusy(true);
    setErrors([]);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (res.ok) {
      // The business task list is still a stub (#17); the applicants page is
      // the owner's real view of a new task.
      const body = await res.json().catch(() => null);
      const taskId: unknown = body?.data?.id;
      router.push(typeof taskId === "string" ? `/dashboard/business/tasks/${taskId}/applicants` : "/tasks");
      return;
    }
    const body = await res.json().catch(() => null);
    setErrors(body?.error?.details ?? [body?.error?.message ?? "Something went wrong"]);
  }

  const durationLabel = `${t.weeks} week${t.weeks === 1 ? "" : "s"} · ${t.hoursPerWeek} hrs/week`;

  return (
    <div className="flex flex-col items-start gap-[24px] lg:flex-row">
      <form
        className="flex w-full min-w-0 flex-col gap-[24px] lg:w-[756px] lg:shrink-0"
        onSubmit={(e) => {
          e.preventDefault();
          submit(true);
        }}
      >
        <div className="flex items-center gap-[12px] rounded-lg bg-navy-900 px-[18px] py-[14px]">
          <Icon name="spark-f2a541-20" />
          <div className="flex flex-col gap-[2px]">
            <p className="type-label text-text-inverse">Drafted by Claude from your description</p>
            <p className="type-caption text-navy-100">Check every field before publishing — you can change anything.</p>
          </div>
        </div>

        <Section step={1} title="The work" subtitle="What do you need help with?">
          <div className="flex flex-col gap-[10px] rounded-md bg-navy-50 p-[16px]">
            <div className="flex items-center gap-[10px]">
              <Icon name="store-0b2545-18" />
              <p className="type-label flex-1 text-text-primary">About {businessName}</p>
              <Button href="/dashboard/business" variant="ghost">
                Edit
              </Button>
            </div>
            <p className="type-body-sm text-text-secondary">
              {about ??
                "Tyne Brew Café is an independent coffee shop and bakery on Gateshead High Street, run by a team of six since 2019. We roast locally, bake every morning and host community events — and we love fresh ideas from local students."}
            </p>
            <p className="type-caption text-text-secondary">Added from your business profile — shown on every task you post.</p>
          </div>
          <Input label="Task title" value={t.title} onChange={(e) => set("title", e.target.value)} required />
          <Select label="Type of work" value={t.workType} onChange={(e) => set("workType", e.target.value)}>
            {workTypes.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </Select>
          <Field label="Description">
            {({ id }) => (
              <>
                <div className={fieldClassName()}>
                  <textarea
                    id={id}
                    rows={4}
                    maxLength={DESCRIPTION_MAX}
                    value={t.description}
                    onChange={(e) => set("description", e.target.value)}
                    className="type-body w-full resize-none bg-transparent text-text-primary outline-none"
                    required
                  />
                </div>
                <p className="type-caption w-full text-right text-text-secondary">
                  {t.description.length} / {DESCRIPTION_MAX.toLocaleString("en-GB")}
                </p>
              </>
            )}
          </Field>
        </Section>

        <Section step={2} title="Experience" subtitle="Separate what’s essential from what’s nice to have.">
          <SkillInput
            label="Requirements (must have)"
            hint="e.g. “Must have used Excel” or “Confident with JavaScript”"
            skills={t.requirements}
            onChange={(s) => set("requirements", s)}
            tone="required"
          />
          <SkillInput
            label="Preferred experience (optional)"
            hint="Students can still apply without preferred skills."
            skills={t.preferred}
            onChange={(s) => set("preferred", s)}
            tone="preferred"
          />
        </Section>

        <Section step={3} title="Timing & pay" subtitle="Pay is always shown up front to students.">
          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-3">
            <Input label="Start date" type="date" value={t.startDate} onChange={(e) => set("startDate", e.target.value)} required />
            <Select label="Duration" value={String(t.weeks)} onChange={(e) => set("weeks", Number(e.target.value))}>
              {[1, 2, 3, 4, 6, 8].map((w) => (
                <option key={w} value={w}>
                  {w} week{w === 1 ? "" : "s"}
                </option>
              ))}
            </Select>
            <Input label="Hours per week" type="number" min={1} value={t.hoursPerWeek} onChange={(e) => set("hoursPerWeek", Number(e.target.value))} />
          </div>
          <div className="flex flex-col gap-[6px]">
            <p className="type-label text-text-primary">Pay type</p>
            <Segmented
              label="Pay type"
              value={t.payType}
              onChange={(v) => set("payType", v)}
              options={[
                { value: "hourly", label: "Hourly rate" },
                { value: "fixed", label: "Fixed price" },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
            <Input
              label={t.payType === "hourly" ? "Hourly rate (£)" : "Fixed price (£)"}
              type="number"
              min={0}
              step="0.01"
              value={t.amount}
              onChange={(e) => set("amount", Number(e.target.value))}
              hint={
                <span className="flex items-start gap-[4px] text-status-success">
                  ✓ Above the National Minimum Wage and Real Living Wage
                </span>
              }
              required
            />
            <Input
              label="Estimated total"
              value={money(pay.total)}
              readOnly
              hint={`${money(pay.base)} pay + ${money(pay.holiday)} holiday pay + ${money(pay.fee)} NEXA fee (20%)`}
            />
          </div>
        </Section>

        <Section step={4} title="Location" subtitle="Where will the student work?">
          <Segmented
            label="Location type"
            value={t.locationType}
            onChange={(v) => set("locationType", v)}
            options={[
              { value: "on-site", label: "On-site" },
              { value: "hybrid", label: "Hybrid" },
              { value: "remote", label: "Remote" },
            ]}
          />
          <Input label="Address" value={t.address} onChange={(e) => set("address", e.target.value)} required />
        </Section>

        {errors.length > 0 && (
          <ul role="alert" className="type-body-sm list-disc rounded-md bg-status-error-bg py-[12px] pl-[32px] pr-[16px] text-status-error">
            {errors.map((er) => (
              <li key={er}>{er}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-[12px] py-[26px]">
          <Button variant="ghost" size="lg" onClick={() => submit(false)} disabled={busy}>
            Save draft
          </Button>
          <span className="flex-1" />
          <Button variant="secondary" size="lg" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Preview
          </Button>
          <Button type="submit" size="lg" showArrow disabled={busy}>
            {busy ? "Publishing…" : "Publish task"}
          </Button>
        </div>
      </form>

      <aside className="flex w-full flex-col gap-[24px] lg:sticky lg:top-[24px] lg:w-[420px]">
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <p className="type-overline text-text-secondary">LIVE PREVIEW</p>
            <Chip type="neutral">How students see it</Chip>
          </div>
          <TaskCard
            company={businessName}
            companyInitials="TB"
            location="Gateshead · Posted 2 days ago"
            title={t.title || "Task title"}
            description="Help a busy independent café plan, shoot and schedule a month of Instagram and TikTok content."
            requiredSkills={t.requirements}
            preferredSkills={t.preferred}
            pay={t.payType === "hourly" ? `${money(t.amount)}/hr` : `${money(t.amount)} fixed`}
            duration={durationLabel}
            match="Match shown to students"
          />
        </div>
        <div className="flex flex-col gap-[14px] rounded-lg border border-border-subtle bg-surface-card p-[25px]">
          <div className="flex items-center justify-between">
            <h2 className="type-h4 text-text-primary">Ready to publish?</h2>
            <Chip type="success">
              {checklist.filter((c) => c.done).length} of {checklist.length}
            </Chip>
          </div>
          <ul className="flex flex-col gap-[14px]">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-[10px]">
                <span
                  className={cn(
                    "flex size-[20px] shrink-0 items-center justify-center rounded-pill",
                    c.done ? "bg-status-success" : "border-[1.5px] border-border-default bg-surface-card",
                  )}
                >
                  {c.done && <Icon name="check-white-12" />}
                </span>
                <span className={cn("type-body-sm", c.done ? "text-text-primary" : "text-text-secondary")}>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
