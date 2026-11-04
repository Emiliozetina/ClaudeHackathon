import type { EngagementStatus, Payment } from "@/types";

export const STATUS_LABELS: Record<EngagementStatus, string> = {
  active: "In progress",
  signed_off: "Signed off",
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

export function formatPayment(payment: Payment): string {
  const amount = new Intl.NumberFormat("en-GB", { style: "currency", currency: payment.currency }).format(
    payment.amount,
  );
  return payment.type === "hourly" ? `${amount} per hour` : `${amount} fixed`;
}
