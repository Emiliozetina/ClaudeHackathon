function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm";
  return (
    <span
      aria-hidden
      className={`${dims} inline-flex shrink-0 items-center justify-center rounded-full bg-teal-700/10 font-semibold text-teal-800 dark:bg-teal-400/15 dark:text-teal-200`}
    >
      {initials(name)}
    </span>
  );
}
