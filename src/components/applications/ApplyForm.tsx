"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApplyForm({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskId, note }),
    });
    setBusy(false);
    if (res.ok) {
      // The student applications list is still a stub (#17); go back to the task.
      router.push(`/tasks/${taskId}`);
      return;
    }
    const body = await res.json().catch(() => null);
    setError(body?.error?.message ?? "Something went wrong");
  }

  return (
    <form onSubmit={submit} className="mt-6 grid max-w-xl gap-3 text-sm">
      <label className="grid gap-1">
        Short note to the business (optional)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
          rows={5}
          className="rounded border px-2 py-1"
        />
      </label>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="w-fit rounded border px-4 py-2 font-medium">
        {busy ? "Sending…" : "Send application"}
      </button>
    </form>
  );
}
