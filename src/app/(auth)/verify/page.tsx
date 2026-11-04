"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard } from "@/components/brand/AuthCard";
import { Button, Errors } from "@/components/forms/Field";
import { Button as LinkButton, Icon } from "@/components/ui";
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
        <p className="type-body text-text-secondary">Loading…</p>
      </AuthCard>
    );
  }

  const alreadyVerified = !!me?.verifiedAt || done;
  // Students land on the task feed (Figma 09); there is no student dashboard screen.
  const dashboard = me?.role === "business" ? "/dashboard/business" : "/tasks";

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
          <div className="flex items-start gap-3 rounded-md border border-teal-100 bg-teal-50 p-4">
            <span className="mt-0.5 inline-flex size-6 flex-none items-center justify-center rounded-pill bg-teal-700">
              <Icon name="check" />
            </span>
            <div>
              <p className="type-label text-text-primary">Your account is verified.</p>
              <p className="type-body-sm mt-1 text-text-secondary">
                You&apos;re all set — head to your dashboard to{" "}
                {me?.role === "business" ? "post your first task" : "browse local work"}.
              </p>
            </div>
          </div>
          <LinkButton href={dashboard} showArrow>
            Go to your dashboard
          </LinkButton>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Errors errors={errors} />
          <Button type="button" onClick={onVerify} disabled={submitting}>
            {submitting ? "Checking…" : "Verify my account"}
          </Button>
          <p className="type-caption text-text-secondary">
            Verification runs against the email and location you registered with — no extra steps
            needed.
          </p>
        </div>
      )}
    </AuthCard>
  );
}
