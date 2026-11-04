"use client";

import { useState } from "react";
import { Errors, Field, TextArea, TextInput } from "@/components/forms/Field";
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
      <Field label="About us" htmlFor="about">
        <TextArea
          id="about"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          required
        />
      </Field>
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
        />
      </Field>
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
