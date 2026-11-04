import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardTopBar } from "@/components/brand/DashboardTopBar";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export const instant = false;

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  let displayName = user.email;
  let subtitle: string | undefined;
  if (user.role === "business") {
    const biz = db.businesses.find((b) => b.userId === user.id);
    if (biz) {
      displayName = biz.name;
      subtitle = "Business account";
    }
  } else {
    const student = db.students.find((s) => s.userId === user.id);
    if (student) {
      displayName = student.name;
      subtitle = student.university;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-page)]">
      <DashboardTopBar
        role={user.role}
        displayName={displayName}
        initials={initialsFor(displayName)}
        subtitle={subtitle}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
