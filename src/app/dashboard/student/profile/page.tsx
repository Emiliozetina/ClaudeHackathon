import { Suspense } from "react";
import { Button, Chip } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatRange } from "@/lib/cv/format";
import { DomainError } from "@/lib/errors";
import { store } from "@/lib/store";

async function ProfileSummary() {
  let userId: string | undefined;
  try {
    userId = (await getCurrentUser()).id;
  } catch (error) {
    if (!(error instanceof DomainError)) throw error;
  }
  const student = store.students.find((s) => s.userId === userId);
  if (!student) {
    return <p className="type-body text-text-secondary">Switch to a student account to see a student profile.</p>;
  }

  const rows: Array<[string, string]> = [
    ["Name", student.name],
    ["University", student.university],
    ["Field of study", [student.fieldOfStudy, student.yearOfStudy].filter(Boolean).join(", ")],
    ["Weekly availability", student.availability || "Not added yet"],
    ["Motivation", student.motivations || "Not added yet"],
    ["Career goal", student.goals || "Not added yet"],
  ];

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-border-subtle bg-surface-card p-6 shadow-elevation-1">
      <dl className="grid gap-4 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="type-label text-text-secondary">{label}</dt>
            <dd className="type-body text-text-primary">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-2">
        <h2 className="type-label text-text-secondary">Skills</h2>
        {student.skills.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {student.skills.map((skill) => (
              <li key={skill}>
                <Chip type="teal">{skill}</Chip>
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-body text-text-primary">Not added yet</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="type-label text-text-secondary">Work history</h2>
        {student.workHistory.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {student.workHistory.map((role) => (
              <li key={role.id} className="type-body text-text-primary">
                {role.title} · {role.organisation}{" "}
                <span className="type-caption text-text-secondary">{formatRange(role.startDate, role.endDate)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-body text-text-primary">Not added yet</p>
        )}
      </div>
    </div>
  );
}

export default function StudentProfileEditPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="type-h2 text-text-primary">Your profile</h1>
          <p className="type-body text-text-secondary">Skills, CV, availability, motivations and goals.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/dashboard/student/profile/edit" variant="secondary">
            Edit profile
          </Button>
          <Button href="/cv" showArrow>
            Import from your CV
          </Button>
        </div>
      </div>
      <Suspense fallback={<p className="type-body text-text-secondary">Loading your profile…</p>}>
        <ProfileSummary />
      </Suspense>
    </section>
  );
}
