"use client";

import { useState } from "react";
import { Button, Errors, Field, TextArea, TextInput } from "@/components/forms/Field";
import type { Student, WorkHistoryItem } from "@/types";

interface Row {
  id: string;
  title: string;
  organisation: string;
  startDate: string;
  endDate: string;
  description: string;
}

function toRow(item: WorkHistoryItem): Row {
  return {
    id: item.id,
    title: item.title,
    organisation: item.organisation,
    startDate: item.startDate,
    endDate: item.endDate ?? "",
    description: item.description ?? "",
  };
}

export function StudentProfileForm({ initial }: { initial: Student }) {
  const [name, setName] = useState(initial.name);
  const [university, setUniversity] = useState(initial.university);
  const [fieldOfStudy, setFieldOfStudy] = useState(initial.fieldOfStudy);
  const [skills, setSkills] = useState(initial.skills.join(", "));
  const [motivations, setMotivations] = useState(initial.motivations);
  const [goals, setGoals] = useState(initial.goals);
  const [availability, setAvailability] = useState(initial.availability ?? "");
  const [rows, setRows] = useState<Row[]>(initial.workHistory.map(toRow));
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((xs) => xs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function addRow() {
    setRows((xs) => [
      ...xs,
      {
        id: `wh_new_${xs.length}_${Date.now()}`,
        title: "",
        organisation: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  }
  function removeRow(id: string) {
    setRows((xs) => xs.filter((r) => r.id !== id));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setStatus("saving");
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        university,
        fieldOfStudy,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        motivations,
        goals,
        availability: availability || undefined,
        workHistory: rows.map((r) => ({
          id: r.id,
          title: r.title,
          organisation: r.organisation,
          startDate: r.startDate,
          endDate: r.endDate || undefined,
          description: r.description || undefined,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("idle");
      setErrors(data.error?.details ?? [data.error?.message ?? "Save failed"]);
      return;
    }
    setStatus("saved");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Errors errors={errors} />

      <section className="flex flex-col gap-4">
        <h2 className="type-overline text-text-secondary">
          About you
        </h2>
        <Field label="Full name" htmlFor="name">
          <TextInput
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="University" htmlFor="university">
            <TextInput
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              required
            />
          </Field>
          <Field label="Field of study" htmlFor="fieldOfStudy">
            <TextInput
              id="fieldOfStudy"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              required
            />
          </Field>
        </div>
        <Field label="Skills" htmlFor="skills" hint="Comma-separated, e.g. Canva, Instagram, Copywriting">
          <TextInput id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </Field>
        <Field label="Availability (optional)" htmlFor="availability" hint="e.g. 10 hours a week, evenings">
          <TextInput
            id="availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="type-overline text-text-secondary">
          Motivations & goals
        </h2>
        <Field label="What motivates you?" htmlFor="motivations">
          <TextArea
            id="motivations"
            value={motivations}
            onChange={(e) => setMotivations(e.target.value)}
            required
          />
        </Field>
        <Field label="What are your goals?" htmlFor="goals">
          <TextArea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            required
          />
        </Field>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="type-overline text-text-secondary">
            Work history
          </h2>
          <Button type="button" variant="secondary" onClick={addRow}>
            Add role
          </Button>
        </div>
        {rows.length === 0 ? (
          <p className="type-body-sm rounded-md border border-dashed border-border-default bg-teal-50 px-4 py-6 text-center text-text-secondary">
            No roles yet — add your part-time jobs, volunteering or projects.
          </p>
        ) : null}
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 rounded-md border border-border-subtle bg-teal-50 p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title" htmlFor={`title-${r.id}`}>
                <TextInput
                  id={`title-${r.id}`}
                  value={r.title}
                  onChange={(e) => updateRow(r.id, { title: e.target.value })}
                />
              </Field>
              <Field label="Organisation" htmlFor={`org-${r.id}`}>
                <TextInput
                  id={`org-${r.id}`}
                  value={r.organisation}
                  onChange={(e) => updateRow(r.id, { organisation: e.target.value })}
                />
              </Field>
              <Field label="Start" htmlFor={`start-${r.id}`}>
                <TextInput
                  id={`start-${r.id}`}
                  type="date"
                  value={r.startDate}
                  onChange={(e) => updateRow(r.id, { startDate: e.target.value })}
                />
              </Field>
              <Field label="End (optional)" htmlFor={`end-${r.id}`}>
                <TextInput
                  id={`end-${r.id}`}
                  type="date"
                  value={r.endDate}
                  onChange={(e) => updateRow(r.id, { endDate: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Description (optional)" htmlFor={`desc-${r.id}`}>
              <TextArea
                id={`desc-${r.id}`}
                value={r.description}
                onChange={(e) => updateRow(r.id, { description: e.target.value })}
              />
            </Field>
            <button
              type="button"
              onClick={() => removeRow(r.id)}
              className="type-label-sm self-end text-status-error hover:underline"
            >
              Remove role
            </button>
          </div>
        ))}
      </section>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save profile"}
        </Button>
        {status === "saved" ? (
          <span className="type-label inline-flex items-center gap-1 text-teal-800" role="status">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M4 10l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
