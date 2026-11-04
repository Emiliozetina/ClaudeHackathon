"use client";

import { useState } from "react";
import { Chip, Icon } from "@/components/ui";

const MAX_SKILLS = 30;

/** Skill chips plus the dashed "+ Add skill" pill from the NEXA student details frame. */
export function SkillsEditor({
  skills,
  onChange,
  error,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
  error?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const skill = draft.trim();
    const exists = skills.some((s) => s.toLowerCase() === skill.toLowerCase());
    if (skill && !exists && skills.length < MAX_SKILLS) onChange([...skills, skill]);
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="type-label text-text-primary" id="cv-skills-label">
        Skills
      </p>
      <ul aria-labelledby="cv-skills-label" className="flex flex-wrap items-center gap-2">
        {skills.map((skill) => (
          <li key={skill}>
            <Chip type="teal" className="gap-1.5">
              {skill}
              <button
                type="button"
                aria-label={`Remove ${skill}`}
                onClick={() => onChange(skills.filter((s) => s !== skill))}
                className="-mr-1 rounded-pill p-0.5 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <Icon name="x-0b2545-12" />
              </button>
            </Chip>
          </li>
        ))}
        <li>
          {adding ? (
            <input
              autoFocus
              value={draft}
              maxLength={40}
              aria-label="New skill"
              placeholder="e.g. Excel"
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commit}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commit();
                } else if (event.key === "Escape") {
                  setDraft("");
                  setAdding(false);
                }
              }}
              className="type-label-sm w-36 rounded-pill border border-teal-700 bg-surface-card px-2.5 py-1.5 text-text-primary outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="type-label-sm inline-flex items-center gap-1 rounded-pill border border-dashed border-border-default px-2.5 py-1.5 text-text-secondary hover:border-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              <Icon name="plus-5b6472-14" />
              Add skill
            </button>
          )}
        </li>
      </ul>
      {error && (
        <p role="alert" className="type-caption text-status-error">
          {error}
        </p>
      )}
    </div>
  );
}
