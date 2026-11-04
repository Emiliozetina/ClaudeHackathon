"use client";

import { useState } from "react";
import { Button, Errors, Field, TextArea, TextInput } from "@/components/forms/Field";
import type { Business } from "@/types";

export function BusinessProfileForm({ initial }: { initial: Business }) {
  const [name, setName] = useState(initial.name);
  const [about, setAbout] = useState(initial.about);
  const [location, setLocation] = useState(initial.location);
  const [website, setWebsite] = useState(initial.website ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setStatus("saving");
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, about, location, website: website || undefined }),
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
      <Field label="Company name" htmlFor="name">
        <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="About us" htmlFor="about" hint="Students see this when they browse your tasks.">
        <TextArea
          id="about"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          required
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location" htmlFor="location">
          <TextInput
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </Field>
        <Field label="Website (optional)" htmlFor="website">
          <TextInput
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
          />
        </Field>
      </div>
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
