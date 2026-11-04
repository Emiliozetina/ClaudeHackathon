"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/brand/AuthCard";
import { Button, Errors, Field, TextArea, TextInput } from "@/components/forms/Field";

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
    <AuthCard
      eyebrow="Step 2 of 3 · Student"
      title="Build your student profile"
      subtitle="Use your university email ending in .ac.uk so we can verify you as a student."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="type-label text-teal-700 hover:text-teal-800">
            Sign in
          </Link>
          .
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Errors errors={errors} />
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
        <Field label="Full name" htmlFor="name">
          <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} required />
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
          <TextInput
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </Field>
        <Field
          label="What motivates you?"
          htmlFor="motivations"
          hint="Why are you looking for short-term work?"
        >
          <TextArea
            id="motivations"
            value={motivations}
            onChange={(e) => setMotivations(e.target.value)}
            required
          />
        </Field>
        <Field label="What are your goals?" htmlFor="goals" hint="What do you want to get out of NEXA?">
          <TextArea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            required
          />
        </Field>
        <Button type="submit" disabled={submitting} block>
          {submitting ? "Creating account…" : "Create student account"}
        </Button>
      </form>
    </AuthCard>
  );
}
