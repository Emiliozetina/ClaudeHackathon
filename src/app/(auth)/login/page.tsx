"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/brand/AuthCard";
import { Button, Errors, Field, TextInput } from "@/components/forms/Field";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setErrors(data.error?.details ?? [data.error?.message ?? "Login failed"]);
      return;
    }
    const role = data.data?.user?.role;
    router.push(role === "business" ? "/dashboard/business" : "/dashboard/student");
    router.refresh();
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Businesses and students sign in with the email they registered with."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="type-label text-teal-700 hover:text-teal-800">
            Create one
          </Link>
          .
        </>
      }
    >
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
        <Field label="Password" htmlFor="password">
          <TextInput
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Button type="submit" disabled={submitting} block>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
