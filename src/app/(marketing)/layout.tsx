import type { ReactNode } from "react";
import { PublicTopBar } from "@/components/brand/PublicTopBar";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-page)]">
      <PublicTopBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
