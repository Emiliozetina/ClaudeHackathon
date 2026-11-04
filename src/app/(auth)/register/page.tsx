import Link from "next/link";
import { Icon, Stepper } from "@/components/ui";

const BusinessIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 20V9l8-5 8 5v11" strokeLinejoin="round" />
    <path d="M9 20v-6h6v6" strokeLinejoin="round" />
  </svg>
);

const StudentIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 10l9-5 9 5-9 5-9-5z" strokeLinejoin="round" />
    <path d="M7 12v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4" strokeLinejoin="round" />
  </svg>
);

interface RoleCardProps {
  href: string;
  title: string;
  description: string;
  bullets: string[];
  icon: React.ReactNode;
}

function RoleCard({ href, title, description, bullets, icon }: RoleCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface-card p-6 shadow-elevation-1 transition hover:border-teal-700"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-teal-100 text-teal-800">
        {icon}
      </span>
      <div>
        <h2 className="type-h4 text-text-primary">{title}</h2>
        <p className="type-body mt-1.5 text-text-secondary">{description}</p>
      </div>
      <ul className="type-body flex flex-col gap-2 text-text-primary">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <svg
              viewBox="0 0 20 20"
              className="mt-0.5 h-4 w-4 flex-none text-teal-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M4 10l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {b}
          </li>
        ))}
      </ul>
      <span className="type-button mt-auto inline-flex items-center gap-1.5 text-teal-700">
        Continue as {title.toLowerCase().includes("business") ? "a business" : "a student"}
        <Icon name="arrow-right-teal" />
      </span>
    </Link>
  );
}

export default function RegisterPage() {
  return (
    <section className="flex flex-col items-center gap-10">
      <div className="text-center">
        <Stepper current={1} className="justify-center" />
        <h1 className="type-h1 mt-6 text-text-primary">How will you use NEXA?</h1>
        <p className="type-body mx-auto mt-3 max-w-xl text-text-secondary">
          Choose the account that fits you. You can&apos;t switch later, but you can create a
          second one under a different email.
        </p>
      </div>
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        <RoleCard
          href="/register/business"
          title="I'm a business"
          description="Get short-term help when you're overloaded — without hiring full-time."
          bullets={[
            "Post tasks with clear pay",
            "Review applicants in one place",
            "Pay securely on sign-off",
          ]}
          icon={<BusinessIcon />}
        />
        <RoleCard
          href="/register/student"
          title="I'm a student or recent graduate"
          description="Find paid, local work that builds real experience — open to students and graduates up to 12 months after finishing."
          bullets={[
            "Apply in a couple of clicks",
            "Earn verified references",
            "Grow a North East network",
          ]}
          icon={<StudentIcon />}
        />
      </div>
      <p className="type-body-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/login"
          className="type-label text-teal-700 hover:text-teal-800"
        >
          Sign in
        </Link>
        .
      </p>
      <p className="type-caption text-text-secondary">
        By continuing you agree to NEXA&apos;s Terms and Privacy Policy.
      </p>
    </section>
  );
}
