import { cn } from "@/lib/cn";

/**
 * Paints an icon from /public/icons in the current background colour, so one
 * Figma cut can follow a selected/unselected state (e.g. bg-text-inverse when
 * selected, bg-navy-900 otherwise). The shape comes from the SVG file; its own
 * stroke colour is ignored.
 */
export function MaskIcon({
  src,
  size,
  className,
}: {
  /** File name in /public/icons, without ".svg". */
  src: string;
  size: number;
  className?: string;
}) {
  const url = `url(/icons/${src}.svg)`;
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0", className)}
      style={{
        width: size,
        height: size,
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
