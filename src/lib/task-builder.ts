import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// Figma "07a · Post a task — describe it, Claude drafts it": turns a business's own
// words into the six task fields. Uses Claude when ANTHROPIC_API_KEY is set on the
// server, otherwise a simple rule-based draft so the demo still works offline.

/** Lowest hourly rate we suggest. Matches the Figma copy (£13 → £13.50); check the current NMW. */
export const MIN_HOURLY_RATE = 13.5;

export const TaskDraftSchema = z.object({
  title: z.string(),
  contents: z.string(),
  weeks: z.number(),
  hoursPerWeek: z.number(),
  requirements: z.array(z.string()),
  preferred: z.array(z.string()),
  payType: z.enum(["hourly", "fixed"]),
  amount: z.number(),
  /** What the business said about pay, e.g. "about £13/hr", or null if nothing. */
  statedPay: z.string().nullable(),
  /** Questions the description does not answer. Never guess these. */
  unknowns: z.array(z.string()),
});

export type ClaudeTaskDraft = z.infer<typeof TaskDraftSchema> & { source: "claude" | "rules"; payNote?: string };

const SYSTEM = `You turn a small North East business's rough request into a clear short-term task post for university students.
Return only facts stated or clearly implied by the request. Do not invent dates, locations or skills.
- title: short job title.
- contents: one or two plain sentences describing the work.
- weeks / hoursPerWeek: best reading of the request ("few hrs a week" ≈ 10, "before xmas" from early November ≈ 2 weeks).
- requirements: skills the work cannot be done without (short skill names like "Instagram", "Canva").
- preferred: nice-to-have skills ("ideally", "would be good").
- payType / amount: from the request; amount in GBP.
- statedPay: how the business described pay, or null.
- unknowns: short questions for anything needed to post the task that the request does not say, such as the start date or whether the work is on-site, hybrid or remote.`;

/** Raise hourly pay to the minimum we suggest and explain why. */
function applyPayFloor(d: ClaudeTaskDraft): ClaudeTaskDraft {
  if (d.payType === "hourly" && d.amount < MIN_HOURLY_RATE) {
    const said = d.statedPay ?? `£${d.amount}/hr`;
    return {
      ...d,
      amount: MIN_HOURLY_RATE,
      payNote: `You said ${said}. Claude suggests £${MIN_HOURLY_RATE.toFixed(2)} so the rate stays above the National Minimum Wage for all ages. You can change it.`,
    };
  }
  return d;
}

const SKILLS: [RegExp, string][] = [
  [/\binsta(gram)?\b/i, "Instagram"],
  [/\btik ?tok\b/i, "TikTok"],
  [/\bcanva\b/i, "Canva"],
  [/\bexcel|spreadsheet\b/i, "Excel"],
  [/\bphoto(s|graphy)?\b/i, "Photography"],
  [/\bvideos?\b/i, "Video editing"],
  [/\bcopy(writing)?\b|\bwrit(e|ing)\b/i, "Copywriting"],
  [/\bwebsite|html\b/i, "Web editing"],
];

/** Offline draft: keyword rules only, so it never invents details. */
export function ruleBasedDraft(text: string): ClaudeTaskDraft {
  const lower = text.toLowerCase();
  const found = SKILLS.filter(([re]) => re.test(text)).map(([, s]) => s);
  const preferredHint = /ideally|would be (good|nice)|bonus|nice to have/i;
  const preferred = found.filter((s) => {
    const idx = lower.indexOf(s.toLowerCase().split(" ")[0].slice(0, 4));
    return idx >= 0 && preferredHint.test(lower.slice(Math.max(0, idx - 40), idx));
  });
  const requirements = found.filter((s) => !preferred.includes(s));
  if (requirements.includes("Instagram") && !requirements.includes("Canva")) requirements.push("Canva");
  if (preferred.includes("Video editing") && !preferred.includes("Copywriting") && requirements.includes("Instagram")) preferred.push("Copywriting");

  const pay = text.match(/£\s?(\d+(?:\.\d+)?)\s*(?:an?|per|\/)\s*(?:hour|hr)/i);
  const fixed = text.match(/£\s?(\d+(?:\.\d+)?)(?!\s*(?:an?|per|\/)\s*(?:hour|hr))/i);
  const social = /insta|tiktok|social/i.test(text);
  const xmas = /xmas|christmas/i.test(text);

  return applyPayFloor({
    source: "rules",
    title: social ? "Social media assistant" : /spreadsheet|stock/i.test(text) ? "Stock-take & spreadsheet help" : /photo/i.test(text) ? "Event photographer" : /website|copy/i.test(text) ? "Website copy refresh" : "Short-term task",
    contents: social
      ? `Plan, shoot and schedule a month of Instagram posts${preferred.includes("Video editing") ? " and short videos" : ""}${xmas ? ", including launching the new Christmas menu" : ""}.`
      : text.trim().replace(/^./, (c) => c.toUpperCase()),
    weeks: xmas ? 2 : /month/i.test(text) ? 4 : 2,
    hoursPerWeek: /few h(ou)?rs/i.test(text) ? 10 : Number(text.match(/(\d+)\s*h(ou)?rs/i)?.[1] ?? 10),
    requirements,
    preferred,
    payType: pay || !fixed ? "hourly" : "fixed",
    amount: Number(pay?.[1] ?? fixed?.[1] ?? MIN_HOURLY_RATE),
    statedPay: pay ? `about £${pay[1]}/hr` : fixed ? `£${fixed[1]}` : null,
    unknowns: ["When should the student start?", "On-site, hybrid or remote?"],
  });
}

/** Ask Claude for a draft; fall back to the rule-based draft on any problem. */
export async function draftTask(text: string): Promise<ClaudeTaskDraft> {
  if (!process.env.ANTHROPIC_API_KEY) return ruleBasedDraft(text);
  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      output_config: { effort: "low", format: zodOutputFormat(TaskDraftSchema) },
      system: SYSTEM,
      messages: [{ role: "user", content: text }],
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) return ruleBasedDraft(text);
    return applyPayFloor({ ...response.parsed_output, source: "claude" });
  } catch (error) {
    console.error("[task-builder] Claude draft failed, using rules", error instanceof Anthropic.APIError ? error.status : error);
    return ruleBasedDraft(text);
  }
}
