"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Errors, Field, TextArea, TextInput } from "@/components/forms/Field";

export default function RegisterStudentPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [skills, setSkills] = useState("");
  const [motivations, setMotivations] = useState("");
  const [goals, setGoals] = useState("");
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
        role: "student",
        email,
        password,
        profile: {
          name,
          university,
          fieldOfStudy,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          workHistory: [],
          motivations,
          goals,
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
        <h1 className="text-2xl font-semibold tracking-tight">Sign up as a student</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Use your university email (.ac.uk) so we can verify you as a student.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Errors errors={errors} />
        <Field label="University email" htmlFor="email" hint="Must end in .ac.uk">
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
        <Field label="Skills" htmlFor="skills" hint="Comma-separated, e.g. JavaScript, Excel">
          <TextInput
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </Field>
        <Field
          label="Motivations"
          htmlFor="motivations"
          hint="Why are you looking for work experience?"
        >
          <TextArea
            id="motivations"
            value={motivations}
            onChange={(e) => setMotivations(e.target.value)}
            required
          />
        </Field>
        <Field label="Goals" htmlFor="goals" hint="What do you want to get out of this?">
          <TextArea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            required
          />
        </Field>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {submitting ? "Creating…" : "Create student account"}
        </button>
      </form>
    </section>
  );
}
