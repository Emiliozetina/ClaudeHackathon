"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Criterion, RankedCandidate } from "@/lib/shortlist";

// Figma: "08a · AI shortlist — blind review" candidate list + shortlist panel.

const tierChip = { Strong: "success", Good: "teal", Partial: "warning" } as const;

export function BlindShortlist({
  taskId,
  criteria,
  candidates,
  source,
}: {
  taskId: string;
  criteria: Criterion[];
  candidates: RankedCandidate[];
  source: "claude" | "rules";
}) {
  const router = useRouter();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const who = source === "claude" ? "Claude" : "the ranking";

  const toggle = (id: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  async function reveal() {
    setBusy(true);
    setError(null);
    for (const id of picked) {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "shortlisted" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.message ?? "Could not shortlist everyone. Please try again.");
        setBusy(false);
        return;
      }
    }
    router.push(`/dashboard/business/tasks/${taskId}/applicants?tab=shortlisted`);
  }

  return (
    <div className="flex flex-col items-start gap-[24px] lg:flex-row">
      <ul className="flex w-full min-w-0 flex-1 flex-col gap-[16px]">
        {candidates.length === 0 && <li className="type-body-sm text-text-secondary">No applicants yet.</li>}
        {candidates
          .filter((c) => !hidden.has(c.applicationId))
          .map((c) => {
            const on = picked.has(c.applicationId);
            return (
              <li
                key={c.applicationId}
                className={cn("flex flex-col gap-[16px] rounded-lg bg-surface-card p-[24px]", on ? "border border-teal-700" : "border border-border-subtle")}
              >
                <div className="flex items-start gap-[14px]">
                  <span className="flex size-[44px] items-center justify-center rounded-pill bg-navy-50">
                    <Icon name="user-5b6472-22" />
                  </span>
                  <div className="flex flex-1 flex-col">
                    <p className="type-h4 text-text-primary">{c.label}</p>
                    <p className="type-caption text-text-secondary">Details hidden until shortlisted</p>
                  </div>
                  <Chip type={tierChip[c.tier]}>{c.tier} · {c.summary}</Chip>
                </div>
                <div className="flex flex-wrap gap-x-[16px] gap-y-[6px]">
                  {criteria.map((cr) => {
                    const ok = c.matched.includes(cr.skill);
                    return (
                      <span key={cr.skill} className={cn("type-body-sm flex items-center gap-[6px]", ok ? "text-text-primary" : "text-text-secondary")}>
                        <span className={cn("flex size-[16px] items-center justify-center rounded-pill", ok ? "bg-status-success-bg" : "bg-navy-50")}>
                          <Icon name={ok ? "check-16774a-10" : "x-5b6472-10"} />
                        </span>
                        {cr.skill}
                      </span>
                    );
                  })}
                </div>
                <p className="type-body-sm flex items-start gap-[8px] text-text-primary">
                  <Icon name="spark-0e7c7b-16" />
                  Why: {c.reason}
                </p>
                {c.note && (
                  <p className="type-body-sm flex items-start gap-[8px] rounded-md bg-navy-50 px-[14px] py-[12px] text-text-secondary">
                    <Icon name="msg-5b6472-16" />“{c.note}”
                  </p>
                )}
                <div className="flex items-center gap-[12px] pt-[8px]">
                  <Button variant={on ? "primary" : "secondary"} onClick={() => toggle(c.applicationId)} aria-pressed={on}>
                    {on ? "✓ Shortlisted" : "Shortlist"}
                  </Button>
                  <Button variant="ghost" onClick={() => setHidden((h) => new Set(h).add(c.applicationId))}>
                    Not this time
                  </Button>
                  <span className="flex-1" />
                  {/* Reporting flow not designed yet; shown as in Figma. */}
                  <span className="type-caption flex items-center gap-[6px] text-text-secondary">
                    <Icon name="flag-5b6472-14" />
                    Ranking looks wrong?
                  </span>
                </div>
              </li>
            );
          })}
      </ul>

      <aside className="flex w-full flex-col gap-[20px] lg:w-[400px] lg:shrink-0">
        <section className="flex flex-col gap-[14px] rounded-lg border border-border-subtle bg-surface-card p-[24px]">
          <h2 className="type-h4 text-text-primary">How the ranking works</h2>
          {[
            ["eyeoff-0b2545-18", `Personal details removed before ${who === "Claude" ? "Claude reads" : "scoring"} anything`],
            ["scale-0b2545-18", "Same criteria applied to every applicant"],
            ["spark-0b2545-18", "A reason shown for every score"],
            ["user-0b2545-18", `You make the final decision — ${who === "Claude" ? "Claude" : "it"} never rejects anyone`],
          ].map(([icon, text]) => (
            <p key={text} className="type-body-sm flex items-center gap-[12px] text-text-primary">
              <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[10px] bg-navy-50">
                <Icon name={icon as "scale-0b2545-18"} />
              </span>
              {text}
            </p>
          ))}
        </section>
        <section className="flex flex-col gap-[8px] rounded-lg bg-amber-100 p-[24px] text-amber-900">
          <p className="type-label flex items-center gap-[8px]"><Icon name="alert-8a5300-18" />Where {who === "Claude" ? "Claude" : "the ranking"} can get it wrong</p>
          <ul className="type-body-sm flex flex-col gap-[6px]">
            <li>• It can’t verify claims — check CVs and references</li>
            <li>• It may miss skills described in unusual words</li>
            <li>• Short or unusual CVs can score lower than deserved</li>
          </ul>
        </section>
        <section className="flex flex-col gap-[12px] rounded-lg bg-navy-900 p-[24px]">
          <h2 className="type-h4 text-text-inverse">{picked.size} shortlisted</h2>
          <p className="type-body-sm text-navy-100">Reveal names and profiles to make your final choice. Other applicants will be told kindly and shown similar tasks.</p>
          <Button size="lg" showArrow onClick={reveal} disabled={busy || picked.size === 0} className="w-full">
            {busy ? "Revealing…" : `Reveal shortlisted (${picked.size})`}
          </Button>
          {error && <p role="alert" className="type-body-sm text-status-error-bg">{error}</p>}
        </section>
      </aside>
    </div>
  );
}
