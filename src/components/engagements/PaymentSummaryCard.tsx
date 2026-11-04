import { formatGBP } from "@/components/engagements/format";
import { HOLIDAY_PAY_RATE, PLATFORM_FEE_RATE, type PaymentSummary } from "@/lib/engagements";

const percent = (rate: number) => `${Math.round(rate * 10000) / 100}%`;

/** What the business pays and the student receives, line by line. */
export function PaymentSummaryCard({
  payment,
  viewerIsStudent,
  title = "Payment summary",
}: {
  payment: PaymentSummary;
  viewerIsStudent: boolean;
  title?: string;
}) {
  return (
    <section className="rounded border border-black/10 p-4 dark:border-white/10">
      <h3 className="font-medium">{title}</h3>
      <dl className="mt-3 space-y-1 text-sm">
        <Row label={`Student pay · ${payment.basis}`} value={payment.studentPay} />
        <Row label={`Holiday pay (${percent(HOLIDAY_PAY_RATE)})`} value={payment.holidayPay} />
        {viewerIsStudent ? (
          <Row label="You receive" value={payment.studentReceives} strong />
        ) : (
          <>
            <Row label={`NEXA fee (${percent(PLATFORM_FEE_RATE)} of pay)`} value={payment.platformFee} />
            <Row label="Total you pay" value={payment.businessPays} strong />
          </>
        )}
      </dl>
      {!viewerIsStudent && (
        <p className="mt-3 text-xs text-black/60 dark:text-white/60">
          The student receives {formatGBP(payment.studentReceives)}. The NEXA fee is charged to you, not them.
        </p>
      )}
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div
      className={`flex justify-between gap-4 ${
        strong ? "border-t border-black/10 pt-2 font-semibold dark:border-white/10" : ""
      }`}
    >
      <dt className={strong ? "" : "text-black/60 dark:text-white/60"}>{label}</dt>
      <dd>{formatGBP(value)}</dd>
    </div>
  );
}
