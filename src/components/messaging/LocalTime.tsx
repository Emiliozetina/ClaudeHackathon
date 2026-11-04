"use client";

/**
 * Formats a stored ISO timestamp in the viewer's locale and time zone.
 * `compact` shows just the time for today and just the date otherwise.
 */
export function LocalTime({ iso, className, compact }: { iso: string; className?: string; compact?: boolean }) {
  const date = new Date(iso);
  let text: string;
  if (compact) {
    const today = date.toDateString() === new Date().toDateString();
    text = today
      ? date.toLocaleTimeString("en-GB", { timeStyle: "short" })
      : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } else {
    text = date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  }

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {text}
    </time>
  );
}
