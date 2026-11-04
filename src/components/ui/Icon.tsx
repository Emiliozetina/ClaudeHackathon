import Image from "next/image";

/** Icons exported from the Figma file into /public/icons, at their Figma sizes. */
const icons = {
  "arrow-right-white": 18,
  "arrow-right-navy": 18,
  "arrow-right-teal": 18,
  "award-teal-24": 24,
  bookmark: 18,
  check: 14,
  "check-amber-16": 16,
  "logo-dot": 8,
  "map-pin-teal-24": 24,
  "zap-amber-16": 16,
  "zap-teal-24": 24,
  "chevron-down-16": 16,
  "chevron-down-20": 20,
  clock: 16,
  "map-pin": 14,
  notifications: 42,
  target: 16,
  // Screens 09–14 (exact Figma cuts, named <icon>-<hex color>-<size>).
  "alert-8a5300-12": 12,
  "arrow-left-0e7c7b-16": 16,
  "award-633806-16": 16,
  "bell-f2a541-20": 20,
  "bookmark-5b6472-18": 18,
  "briefcase-0b2545-18": 18,
  "calendar-0b2545-20": 20,
  "check-16774a-12": 12,
  "check-16774a-26": 26,
  "check-white-12": 12,
  "chev-d-111827-16": 16,
  "chev-d-5b6472-16": 16,
  "clip-5b6472-18": 18,
  "clock-0b2545-20": 20,
  "clock-5b6472-14": 14,
  "flag-5b6472-16": 16,
  "globe-5b6472-16": 16,
  "grad-5b6472-16": 16,
  "image-0b2545-18": 18,
  "link-5b6472-16": 16,
  "lock-5b6472-16": 16,
  "map-pin-0b2545-20": 20,
  "map-pin-5b6472-16": 16,
  "map-pin-5b6472-20": 20,
  "map-pin-f2a541-20": 20,
  "more-5b6472-20": 20,
  "party-633806-26": 26,
  "quote-0a5f5e-12": 12,
  "refresh-0e7c7b-20": 20,
  "search-5b6472-20": 20,
  "search-6b7280-16": 16,
  "send-white-20": 20,
  "share-5b6472-18": 18,
  "shield-0e7c7b-22": 22,
  "shield-16774a-14": 14,
  "shield-5b6472-16": 16,
  "sliders-111827-18": 18,
  "spark-f2a541-14": 14,
  "star-f2a541-14": 14,
  "star-f2a541-32": 32,
  "target-0e7c7b-20": 20,
  "target-0e7c7b-24": 24,
  "user-white-20": 20,
  "users-5b6472-16": 16,
  "users-f2a541-22": 22,
  "x-5b6472-12": 12,
} as const;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  className?: string;
  /** Accessible label. Omit for decorative icons. */
  label?: string;
};

export function Icon({ name, className, label }: IconProps) {
  const size = icons[name];
  return (
    <Image
      src={`/icons/${name}.svg`}
      width={size}
      height={size}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      className={className}
      unoptimized
    />
  );
}
