const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2025-09" -> "Sep 2025". Anything else is returned unchanged. */
export function formatMonth(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : value;
}

/** "Sep 2025 – now" */
export function formatRange(startDate: string, endDate?: string): string {
  return `${formatMonth(startDate)} – ${endDate ? formatMonth(endDate) : "now"}`;
}

/** 240 * 1024 -> "240 KB" */
export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
