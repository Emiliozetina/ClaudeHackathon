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
  // Exported from the Screens page (name-colour-size).
  "bulb-633806-18": 18,
  "chev-6b7280-20": 20,
  "users-5b6472-16": 16,
  "chevron-down-16": 16,
  "chevron-down-20": 20,
  clock: 16,
  "map-pin": 14,
  notifications: 42,
  target: 16,
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
