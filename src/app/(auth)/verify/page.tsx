"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard } from "@/components/brand/AuthCard";
import { Button, Errors } from "@/components/forms/Field";
import type { Role } from "@/types";

interface Me {
  role: Role;
  verifiedAt?: string;
}

export default function VerifyPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/auth/me");
      if (cancelled) return;
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setMe({
        role: data.data.user.role,
        verifiedAt: data.data.user.verifiedAt,
      });
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onVerify() {
    setErrors([]);
    setSubmitting(true);
    const res = await fetch("/api/auth/verify", { method: "POST" });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setErrors(data.error?.details ?? [data.error?.message ?? "Verification failed"]);
      return;
    }
    setDone(true);
  }

  if (loading) {
    return (
      <AuthCard title="Verify your account">
        <p className="text-sm text-[color:var(--color-ink-muted)]">Loading…</p>
      </AuthCard>
    );
  }

  const alreadyVerified = !!me?.verifiedAt || done;
  const dashboard = me?.role === "business" ? "/dashboard/business" : "/dashboard/student";

  return (
    <AuthCard
      eyebrow="Step 3 of 3"
      title="Verify your account"
      subtitle={
        me?.role === "student"
          ? "We check your university email ends in .ac.uk so businesses know you're a current student."
          : "We check your business is based in the North East of England so students know the work is local."
      }
    >
      {alreadyVerified ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-xl border border-[color:var(--color-brand-soft)] bg-[color:var(--color-brand-soft)]/60 p-4">
            <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[color:var(--color-brand)] text-white">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M4 10l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-[color:var(--color-ink)]">
                Your account is verified.
              </p>
              <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
                You&apos;re all set — head to your dashboard to{" "}
                {me?.role === "business" ? "post your first task" : "browse local work"}.
              </p>
            </div>
          </div>
          <Link
            href={dashboard}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(13,27,42,0.08)] transition hover:bg-[color:var(--color-brand-hover)]"
          >
            Go to your dashboard
            <span aria-hidden>→</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Errors errors={errors} />
          <Button type="button" onClick={onVerify} disabled={submitting}>
            {submitting ? "Checking…" : "Verify my account"}
          </Button>
          <p className="text-xs text-[color:var(--color-ink-muted)]">
            Verification runs against the email and location you registered with — no extra steps
            needed.
          </p>
        </div>
      )}
    </AuthCard>
  );
}
