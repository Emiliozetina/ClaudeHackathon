/**
 * The upload icon for the empty CV drop zone. Figma has an icon/upload layer
 * (screen 04, node 7:402) but it was not exported with the other icons, so
 * this stays hand-drawn until it is. Every other CV icon uses the shared
 * <Icon> with the exact Figma files.
 */
type IconProps = { className?: string };

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function IconUpload({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
    </svg>
  );
}
