"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEV_BUSINESS_HEADERS } from "@/lib/dev-actor";

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

export function TaskForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const hours = Number(f.get("estimatedHours"));
    const payload = {
      title: f.get("title"),
      description: f.get("description"),
      startDate: f.get("startDate"),
      endDate: f.get("endDate"),
      estimatedHours: hours > 0 ? hours : undefined,
      requirements: lines(String(f.get("requirements") ?? "")),
      preferredExperience: lines(String(f.get("preferredExperience") ?? "")),
      payment: {
        type: f.get("paymentType"),
        amount: Number(f.get("amount")),
        notes: String(f.get("paymentNotes") ?? "") || undefined,
      },
      location: f.get("location"),
      remote: f.get("remote") === "on",
    };

    setBusy(true);
    setErrors([]);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json", ...DEV_BUSINESS_HEADERS },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/dashboard/business/tasks");
      return;
    }
    const body = await res.json().catch(() => null);
    setErrors(body?.error?.details ?? [body?.error?.message ?? "Something went wrong"]);
  }

  const input = "rounded border px-2 py-1";
  return (
    <form onSubmit={submit} className="mt-6 grid max-w-xl gap-4 text-sm">
      <label className="grid gap-1">Title
        <input name="title" required className={input} />
      </label>
      <label className="grid gap-1">Job contents
        <textarea name="description" required rows={5} className={input} />
      </label>
      <div className="flex gap-3">
        <label className="grid flex-1 gap-1">Start date
          <input name="startDate" type="date" required className={input} />
        </label>
        <label className="grid flex-1 gap-1">End date
          <input name="endDate" type="date" required className={input} />
        </label>
        <label className="grid flex-1 gap-1">Est. hours
          <input name="estimatedHours" type="number" min="1" className={input} />
        </label>
      </div>
      <label className="grid gap-1">Requirements (one per line)
        <textarea name="requirements" required rows={3} className={input} />
      </label>
      <label className="grid gap-1">Preferred experience (optional, one per line)
        <textarea name="preferredExperience" rows={3} className={input} />
      </label>
      <div className="flex gap-3">
        <label className="grid flex-1 gap-1">Payment type
          <select name="paymentType" className={input}>
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
          </select>
        </label>
        <label className="grid flex-1 gap-1">Amount (£)
          <input name="amount" type="number" min="1" step="0.01" required className={input} />
        </label>
      </div>
      <label className="grid gap-1">Payment notes (optional)
        <input name="paymentNotes" className={input} />
      </label>
      <label className="grid gap-1">Location
        <input name="location" required className={input} />
      </label>
      <label className="flex items-center gap-2">
        <input name="remote" type="checkbox" /> Can be done remotely
      </label>

      {errors.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-red-600">
          {errors.map((er) => <li key={er}>{er}</li>)}
        </ul>
      )}
      <button type="submit" disabled={busy} className="w-fit rounded border px-4 py-2 font-medium">
        {busy ? "Posting…" : "Post task"}
      </button>
    </form>
  );
}
