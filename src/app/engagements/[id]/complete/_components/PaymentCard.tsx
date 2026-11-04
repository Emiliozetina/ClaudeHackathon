import { formatGBP } from "@/components/engagements/format";
import { Avatar, Icon } from "@/components/ui";
import { HOLIDAY_PAY_RATE, PLATFORM_FEE_RATE, type PaymentSummary } from "@/lib/engagements";
import { cn } from "@/lib/cn";

const percent = (rate: number) => `${Math.round(rate * 10000) / 100}%`;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

/** Figma 13 · Payment summary card: who is paid, line items, total and a note. */
export function PaymentCard({
  payment,
  viewerIsStudent,
  title = "Payment summary",
  partyName,
  partyDetail,
}: {
  payment: PaymentSummary;
  viewerIsStudent: boolean;
  title?: string;
  partyName: string;
  partyDetail: string;
}) {
  return (
    <section className="flex flex-col gap-[14px] rounded-lg border border-border-subtle bg-surface-card p-[28px]">
      <h2 className="type-h4 text-text-primary">{title}</h2>
      <div className="flex items-center gap-[12px] border-b border-border-subtle pb-[14px]">
        <Avatar initials={initials(partyName)} tone={viewerIsStudent ? "navy" : "teal"} size={40} />
        <div className="flex min-w-0 flex-col gap-[2px]">
          <p className="type-label truncate text-text-primary">{partyName}</p>
          <p className="type-caption truncate text-text-secondary">{partyDetail}</p>
        </div>
      </div>
      <dl className="flex flex-col gap-[14px]">
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
        <p className="type-caption flex items-center gap-[10px] rounded-md bg-surface-page px-[12px] py-[12px] text-text-secondary">
          <Icon name="lock-5b6472-16" className="shrink-0" />
          The student receives {formatGBP(payment.studentReceives)}. The NEXA fee is charged to you, not them.
        </p>
      )}
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-[16px]",
        strong && "border-t border-border-subtle pt-[14px]",
      )}
    >
      <dt className={strong ? "type-label text-text-primary" : "type-body-sm text-text-secondary"}>{label}</dt>
      <dd className={strong ? "type-h4 text-text-primary" : "type-body-sm text-text-primary"}>{formatGBP(value)}</dd>
    </div>
  );
}
