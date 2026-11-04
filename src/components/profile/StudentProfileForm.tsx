"use client";

import { useState } from "react";
import { Errors, Field, TextArea, TextInput } from "@/components/forms/Field";
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
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Errors errors={errors} />
      <Field label="Full name" htmlFor="name">
        <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
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
      <Field label="Skills" htmlFor="skills" hint="Comma-separated.">
        <TextInput id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
      </Field>
      <Field label="Motivations" htmlFor="motivations">
        <TextArea
          id="motivations"
          value={motivations}
          onChange={(e) => setMotivations(e.target.value)}
          required
        />
      </Field>
      <Field label="Goals" htmlFor="goals">
        <TextArea
          id="goals"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          required
        />
      </Field>
      <Field label="Availability (optional)" htmlFor="availability">
        <TextInput
          id="availability"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
      </Field>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Work history</span>
          <button
            type="button"
            onClick={addRow}
            className="rounded-md border border-black/10 px-3 py-1 text-xs dark:border-white/15"
          >
            Add role
          </button>
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">
            No roles yet — add your part-time jobs, volunteering or projects.
          </p>
        ) : null}
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-2 rounded-md border border-black/10 p-3 dark:border-white/15"
          >
            <div className="grid gap-2 sm:grid-cols-2">
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
              className="self-end text-xs text-red-600 underline dark:text-red-300"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {status === "saving" ? "Saving…" : "Save profile"}
        </button>
        {status === "saved" ? (
          <span className="text-sm text-green-700 dark:text-green-300">Saved.</span>
        ) : null}
      </div>
    </form>
  );
}
