"use client";

import { useState } from "react";
import { Button, Checkbox, Icon, Input } from "@/components/ui";
import { formatRange } from "@/lib/cv/format";
import type { StudentDetails } from "@/lib/cv/types";


type Role = StudentDetails["workHistory"][number];
type Draft = { title: string; organisation: string; startDate: string; endDate: string };

const emptyDraft: Draft = { title: "", organisation: "", startDate: "", endDate: "" };

/**
 * Work history list from the NEXA "Experience & goals" frame: role rows with
 * edit/delete, a dashed "Add work experience" button and the "no experience
 * yet" checkbox. The inline add/edit form isn't in Figma, so it reuses the
 * shared Input and Button.
 */
export function WorkHistoryEditor({
  roles,
  onChange,
  noExperience,
  onNoExperienceChange,
  error,
}: {
  roles: Role[];
  onChange: (roles: Role[]) => void;
  noExperience: boolean;
  onNoExperienceChange: (value: boolean) => void;
  error?: string;
}) {
  /** id of the role being edited, "new" for a new one, null when the form is closed. */
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [draftError, setDraftError] = useState<string | null>(null);

  function open(role?: Role) {
    setDraft(
      role
        ? { title: role.title, organisation: role.organisation, startDate: role.startDate, endDate: role.endDate ?? "" }
        : emptyDraft,
    );
    setDraftError(null);
    setEditing(role ? role.id : "new");
    onNoExperienceChange(false);
  }

  function save() {
    const title = draft.title.trim();
    const organisation = draft.organisation.trim();
    if (!title || !organisation) return setDraftError("Add a job title and an organisation.");
    if (!/^\d{4}-\d{2}$/.test(draft.startDate)) return setDraftError("Add when you started (month and year).");
    if (draft.endDate && !/^\d{4}-\d{2}$/.test(draft.endDate)) return setDraftError("End date must be a month and year.");
    if (draft.endDate && draft.endDate < draft.startDate) return setDraftError("A role can’t end before it starts.");

    const next: Role = {
      id: editing && editing !== "new" ? editing : crypto.randomUUID(),
      title,
      organisation,
      startDate: draft.startDate,
      endDate: draft.endDate || undefined,
    };
    onChange(editing === "new" ? [...roles, next] : roles.map((r) => (r.id === next.id ? next : r)));
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <p className="type-label text-text-primary">Work history</p>
        <p className="type-caption text-text-secondary">{roles.length} added</p>
      </div>

      <ul className="flex flex-col gap-3">
        {roles.map((role) =>
          editing === role.id ? null : (
            <li
              key={role.id}
              className="flex items-center gap-3.5 rounded-md border border-border-default bg-surface-card p-3.5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-teal-50">
                <Icon name="briefcase-0b2545-18" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="type-label truncate text-text-primary">{role.title}</p>
                <p className="type-caption truncate text-text-secondary">
                  {role.organisation} · {formatRange(role.startDate, role.endDate)}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Edit ${role.title}`}
                onClick={() => open(role)}
                className="rounded-sm p-1.5 text-text-secondary hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <Icon name="edit-5b6472-18" />
              </button>
              <button
                type="button"
                aria-label={`Remove ${role.title}`}
                onClick={() => onChange(roles.filter((r) => r.id !== role.id))}
                className="rounded-sm p-1.5 text-text-secondary hover:text-status-error focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <Icon name="trash-5b6472-18" />
              </button>
            </li>
          ),
        )}
      </ul>

      {editing ? (
        <div className="flex flex-col gap-3.5 rounded-md border border-teal-700 bg-surface-card p-4">
          <Input
            label="Job title"
            value={draft.title}
            maxLength={100}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <Input
            label="Organisation"
            value={draft.organisation}
            maxLength={100}
            onChange={(e) => setDraft({ ...draft, organisation: e.target.value })}
          />
          <div className="flex gap-4">
            <Input
              label="Started"
              type="month"
              value={draft.startDate}
              placeholder="YYYY-MM"
              onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
            />
            <Input
              label="Ended"
              type="month"
              value={draft.endDate}
              placeholder="YYYY-MM"
              hint="Leave empty if it’s ongoing"
              onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
            />
          </div>
          {draftError && (
            <p role="alert" className="type-caption text-status-error">
              {draftError}
            </p>
          )}
          <div className="flex gap-3">
            <Button onClick={save}>Save role</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => open()}
          className="type-label inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-teal-700 px-4 py-3.5 text-teal-700 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700"
        >
          <Icon name="plus-0e7c7b-18" />
          Add work experience
        </button>
      )}

      <Checkbox
        label="I don’t have work experience yet — that’s OK, you can still apply"
        checked={noExperience}
        disabled={roles.length > 0}
        onChange={(e) => onNoExperienceChange(e.target.checked)}
      />

      {error && (
        <p role="alert" className="type-caption text-status-error">
          {error}
        </p>
      )}
    </div>
  );
}
