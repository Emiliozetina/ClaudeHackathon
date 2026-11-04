import { Suspense } from "react";
import { DemoUserSwitcher } from "@/components/engagements/DemoUserSwitcher";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { StudentPortfolio } from "@/app/students/[id]/StudentPortfolio";
import { HeaderFor } from "@/app/students/[id]/student-header";

// Figma: Screens → "14 · Student portfolio" (11:1389), for the signed-in student.
export default function MyPortfolioPage() {
  return (
    <Suspense fallback={null}>
      <MyPortfolio />
    </Suspense>
  );
}

async function MyPortfolio() {
  const user = await getCurrentUser();
  const student = store.students.find((s) => s.userId === user.id);
  return (
    <>
      <HeaderFor user={user} />
      {student ? (
        <StudentPortfolio student={student} isOwner />
      ) : (
        <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-[16px] px-[20px] pt-[40px] pb-[80px]">
          <h1 className="type-h2 text-text-primary">Portfolio</h1>
          <p className="type-body text-text-secondary">
            Portfolios belong to student accounts. Switch to a student to see theirs.
          </p>
          <DemoUserSwitcher />
        </main>
      )}
    </>
  );
}
