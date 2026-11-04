import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-6 py-8">
      {/* TODO: sidebar — switches between the business and student views */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
