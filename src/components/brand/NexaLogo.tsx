import Link from "next/link";

interface Props {
  href?: string;
  withWordmark?: boolean;
  tone?: "default" | "light";
}

export function NexaLogo({ href = "/", withWordmark = true, tone = "default" }: Props) {
  const textClass = tone === "light" ? "text-white" : "text-[color:var(--color-ink)]";
  const mark = (
    <span className="flex items-center gap-2">
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[color:var(--color-navy)] text-white shadow-sm">
        <span className="text-[15px] font-bold tracking-tight">N</span>
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[color:var(--color-brand)]" />
      </span>
      {withWordmark ? (
        <span className={`text-[15px] font-semibold tracking-tight ${textClass}`}>NEXA</span>
      ) : null}
    </span>
  );
  if (!href) return mark;
  return (
    <Link href={href} className="inline-flex items-center">
      {mark}
    </Link>
  );
}
