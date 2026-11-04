"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/brand/AuthCard";
import { Button, Errors, Field, TextArea, TextInput } from "@/components/forms/Field";

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
    <AuthCard
      eyebrow="Step 2 of 3 · Business"
      title="Tell us about your business"
      subtitle="We verify businesses are based in the North East of England so students know the work is local."
      footer={
        <>
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-hover)]"
          >
            Sign in
          </Link>
          .
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Errors errors={errors} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Work email" htmlFor="email">
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
        </div>
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
          hint="A short description students will see when they browse your tasks."
        >
          <TextArea
            id="about"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
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
              placeholder="https://"
            />
          </Field>
        </div>
        <Button type="submit" disabled={submitting} block>
          {submitting ? "Creating account…" : "Create business account"}
        </Button>
      </form>
    </AuthCard>
  );
}
