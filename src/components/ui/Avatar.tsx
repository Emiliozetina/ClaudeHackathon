import { cn } from "@/lib/cn";

export type AvatarTone = "teal" | "navy" | "amber";
export type AvatarSize = 32 | 40 | 56;

/** Figma: Design system → Components → Avatar (3:90). */
const toneClass: Record<AvatarTone, string> = {
  teal: "bg-teal-100 text-teal-800",
  navy: "bg-navy-100 text-navy-900",
  amber: "bg-amber-100 text-amber-900",
};

const sizeClass: Record<AvatarSize, string> = {
  32: "size-[32px] type-label-sm",
  40: "size-[40px] type-label-sm",
  // 56px uses Inter SemiBold 18 / 1.4 in Figma.
  56: "size-[56px] font-sans text-[18px] font-semibold leading-[1.4]",
};

type AvatarProps = {
  initials: string;
  tone?: AvatarTone;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({ initials, tone = "teal", size = 32, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-pill whitespace-nowrap",
        toneClass[tone],
        sizeClass[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
