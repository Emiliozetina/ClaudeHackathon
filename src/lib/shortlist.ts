import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { ApplicationForBusiness } from "@/lib/applications";
import type { Task } from "@/types";

// Figma "08a · AI shortlist — blind review": score every applicant against the same
// criteria from the post, with a reason. Personal details (name, university) are never
// sent. Uses Claude when ANTHROPIC_API_KEY is set, otherwise skill matching.

export type Criterion = { skill: string; required: boolean };
export type RankedCandidate = {
  applicationId: string;
  label: string; // "Candidate A"
  matched: string[]; // criteria skills met
  tier: "Strong" | "Good" | "Partial";
  summary: string; // "2/2 required, 1/2 preferred"
  reason: string;
  note: string;
};
export type Ranking = { source: "claude" | "rules"; candidates: RankedCandidate[] };

const ScoreSchema = z.object({
  candidates: z.array(
    z.object({
      id: z.string(),
      matched: z.array(z.string()),
      reason: z.string(),
    }),
  ),
});

const SYSTEM = `You help a small business shortlist students for a short task. Applicants are anonymous.
For each applicant decide which of the given criteria their profile shows evidence for, and write one short
reason (under 20 words) quoting that evidence. Only use what the profile says; do not infer age, gender,
background or anything personal. Never reject anyone - the business makes the decision.`;

function blindProfile(a: ApplicationForBusiness) {
  return {
    skills: a.student.skills,
    workHistory: a.student.workHistory.map((w) => w.title),
    motivation: a.student.motivations,
    note: a.note,
  };
}

/** True when the profile text mentions the criterion skill. Shared with screen 08. */
export function mentions(a: ApplicationForBusiness, skill: string) {
  const hay = [a.student.skills.join(" "), a.student.workHistory.map((w) => w.title).join(" "), a.student.motivations, a.note]
    .join(" ")
    .toLowerCase();
  return skill
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3)
    .some((w) => hay.includes(w));
}

function finish(criteria: Criterion[], apps: ApplicationForBusiness[], scores: Map<string, { matched: string[]; reason: string }>): RankedCandidate[] {
  const req = criteria.filter((c) => c.required);
  const pref = criteria.filter((c) => !c.required);
  const rows = apps.map((a) => {
    const s = scores.get(a.id) ?? { matched: [], reason: "" };
    const r = req.filter((c) => s.matched.includes(c.skill)).length;
    const p = pref.filter((c) => s.matched.includes(c.skill)).length;
    const tier: RankedCandidate["tier"] = r === req.length && p > 0 ? "Strong" : r === req.length ? "Good" : "Partial";
    return {
      applicationId: a.id,
      label: "",
      matched: s.matched,
      tier,
      summary: `${r}/${req.length} required${pref.length ? `, ${p}/${pref.length} preferred` : ""}`,
      reason: s.reason,
      note: a.note,
      sort: r * 10 + p,
    };
  });
  rows.sort((x, y) => y.sort - x.sort);
  return rows.map((row, i) => ({
    applicationId: row.applicationId,
    label: `Candidate ${String.fromCharCode(65 + i)}`,
    matched: row.matched,
    tier: row.tier,
    summary: row.summary,
    reason: row.reason,
    note: row.note,
  }));
}

function ruleScores(criteria: Criterion[], apps: ApplicationForBusiness[]) {
  return new Map(
    apps.map((a) => {
      const matched = criteria.filter((c) => mentions(a, c.skill)).map((c) => c.skill);
      const evidence = [...a.student.workHistory.map((w) => w.title), ...a.student.skills].slice(0, 3).join("; ");
      return [a.id, { matched, reason: evidence ? `Profile mentions ${evidence}.` : "Profile has little detail yet." }];
    }),
  );
}

export async function rankApplicants(task: Task, apps: ApplicationForBusiness[]): Promise<Ranking> {
  const criteria: Criterion[] = [
    ...task.requirements.map((skill) => ({ skill, required: true })),
    ...task.preferredExperience.map((skill) => ({ skill, required: false })),
  ];
  if (!apps.length) return { source: "rules", candidates: [] };
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const response = await client.messages.parse({
        model: "claude-opus-5-5",
        max_tokens: 8000,
        output_config: { effort: "low", format: zodOutputFormat(ScoreSchema) },
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: JSON.stringify({
              criteria: criteria.map((c) => c.skill),
              applicants: apps.map((a) => ({ id: a.id, ...blindProfile(a) })),
            }),
          },
        ],
      });
      if (response.stop_reason !== "refusal" && response.parsed_output) {
        const valid = new Set(criteria.map((c) => c.skill));
        const scores = new Map(
          response.parsed_output.candidates.map((c) => [c.id, { matched: c.matched.filter((m) => valid.has(m)), reason: c.reason }]),
        );
        return { source: "claude", candidates: finish(criteria, apps, scores) };
      }
    } catch (error) {
      console.error("[shortlist] Claude ranking failed, using rules", error instanceof Anthropic.APIError ? error.status : error);
    }
  }
  return { source: "rules", candidates: finish(criteria, apps, ruleScores(criteria, apps)) };
}
