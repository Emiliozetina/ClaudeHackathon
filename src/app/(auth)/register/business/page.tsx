"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Errors, Field, TextArea, TextInput } from "@/components/forms/Field";

export default function RegisterBusinessPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "business",
        email,
        password,
        profile: {
          name,
          about,
          location,
          website: website || undefined,
        },
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setErrors(data.error?.details ?? [data.error?.message ?? "Registration failed"]);
      return;
    }
    router.push("/verify");
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign up as a business</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Company name, about us, and North East base verification.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Errors errors={errors} />
        <Field label="Email" htmlFor="email">
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 8 characters.">
          <TextInput
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Field label="Company name" htmlFor="name">
          <TextInput
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field
          label="About us"
          htmlFor="about"
          hint="A short description of what your business does."
        >
          <TextArea
            id="about"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            required
          />
        </Field>
        <Field label="Location" htmlFor="location" hint="e.g. Newcastle upon Tyne">
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
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {submitting ? "Creating…" : "Create business account"}
        </button>
      </form>
    </section>
  );
}
