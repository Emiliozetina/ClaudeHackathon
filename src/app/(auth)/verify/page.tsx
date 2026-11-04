"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Errors } from "@/components/forms/Field";
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
    return <section>Loading…</section>;
  }

  const alreadyVerified = !!me?.verifiedAt || done;
  const dashboard = me?.role === "business" ? "/dashboard/business" : "/dashboard/student";

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Verify your account</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          {me?.role === "student"
            ? "We check your university email ends in .ac.uk."
            : "We check your business is based in the North East of England."}
        </p>
      </div>
      {alreadyVerified ? (
        <div className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-800 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-200">
          Your account is verified.{" "}
          <Link href={dashboard} className="underline">
            Go to your dashboard
          </Link>
          .
        </div>
      ) : (
        <>
          <Errors errors={errors} />
          <button
            type="button"
            onClick={onVerify}
            disabled={submitting}
            className="w-max rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {submitting ? "Checking…" : "Verify my account"}
          </button>
        </>
      )}
    </section>
  );
}
