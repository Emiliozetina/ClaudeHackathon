import type { ReactNode } from "react";

// Each dashboard page renders its own App header and page layout (Figma screens 06, 09, 11, 14).
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-1 flex-col">{children}</div>;
}
