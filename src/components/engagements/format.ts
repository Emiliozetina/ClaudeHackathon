import type { EngagementStatus, Payment } from "@/types";

export const STATUS_LABELS: Record<EngagementStatus, string> = {
  active: "In progress",
  submitted: "Awaiting check",
  paid: "Paid",
  reviewed: "Reviewed",
};

/** Formats a stored ISO date or date-time as e.g. "2 Nov 2026". */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Formats a stored ISO date-time as e.g. "Fri 6 Nov, 14:00". */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** "£450" for whole pounds, "£13.50" otherwise. */
export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Pay chip text, e.g. "£13.50/hr" or "£450 fixed". */
export function formatPayment(payment: Payment): string {
  const amount = formatGBP(payment.amount);
  return payment.type === "hourly" ? `${amount}/hr` : `${amount} fixed`;
}
