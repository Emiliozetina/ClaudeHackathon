import { notFound } from "next/navigation";
import { Suspense } from "react";
import { currentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { StudentPortfolio } from "./StudentPortfolio";
import { HeaderFor } from "./student-header";

// Figma: Screens → "14 · Student portfolio" (11:1389). Public portfolio of one student.
export default function StudentPortfolioPage({ params }: PageProps<"/students/[id]">) {
  return (
    <Suspense fallback={null}>
      {params.then(({ id }) => (
        <Portfolio id={id} />
      ))}
    </Suspense>
  );
}

async function Portfolio({ id }: { id: string }) {
  const user = await currentUser();
  const student = store.students.find((s) => s.id === id);
  if (!student) notFound();
  return (
    <>
      <HeaderFor user={user} />
      <StudentPortfolio student={student} isOwner={student.userId === user?.id} />
    </>
  );
}
