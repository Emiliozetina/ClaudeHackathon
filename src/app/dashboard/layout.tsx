import type { ReactNode } from "react";

/**
 * Dashboard pages render their own app header and page width (Figma screens are
 * full-bleed at 1440px), so this layout only passes children through.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-1 flex-col">{children}</div>;
}
