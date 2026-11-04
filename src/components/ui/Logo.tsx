import Image from "next/image";
import { cn } from "@/lib/cn";

type LogoProps = {
  /** Use "dark" on navy surfaces (Figma usage note). */
  theme?: "light" | "dark";
  className?: string;
};

/** Figma: Design system → Components → Logo (3:15). */
export function Logo({ theme = "light", className }: LogoProps) {
  const isDark = theme === "dark";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[10px] rounded-[12px]",
        isDark && "bg-navy-900 px-[14px] py-[10px]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "relative size-[36px] shrink-0 overflow-hidden rounded-[10px]",
          isDark ? "bg-teal-700" : "bg-navy-900",
        )}
      >
        <span className="absolute left-[10.5px] top-[5px] font-heading text-[20px] font-bold leading-[1.3] text-text-inverse">
          N
        </span>
        <Image
          src="/icons/logo-dot.svg"
          width={8}
          height={8}
          alt=""
          unoptimized
          className="absolute left-[24px] top-[4px]"
        />
      </span>
      <span
        className={cn(
          "font-heading text-[20px] font-bold leading-[1.3] tracking-[2px]",
          isDark ? "text-text-inverse" : "text-text-primary",
        )}
      >
        NEXA
      </span>
    </span>
  );
}
