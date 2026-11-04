import Link from "next/link";

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
      className="group relative flex flex-col gap-4 rounded-2xl border border-[color:var(--color-line)] bg-white p-6 shadow-[0_1px_2px_rgba(13,27,42,0.04)] transition hover:border-[color:var(--color-brand)] hover:shadow-[0_8px_24px_rgba(15,122,107,0.08)]"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-hover)]">
        {icon}
      </span>
      <div>
        <h2 className="text-lg font-semibold text-[color:var(--color-ink)]">{title}</h2>
        <p className="mt-1.5 text-sm text-[color:var(--color-ink-muted)]">{description}</p>
      </div>
      <ul className="flex flex-col gap-2 text-sm text-[color:var(--color-ink)]">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <svg
              viewBox="0 0 20 20"
              className="mt-0.5 h-4 w-4 flex-none text-[color:var(--color-brand)]"
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
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--color-brand)]">
        Continue as {title.toLowerCase().includes("business") ? "a business" : "a student"}
        <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

export default function RegisterPage() {
  return (
    <section className="flex flex-col items-center gap-10">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-brand)]">
          Step 1 of 3
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--color-ink)] sm:text-4xl">
          How will you use NEXA?
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[color:var(--color-ink-muted)]">
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
      <p className="text-sm text-[color:var(--color-ink-muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-hover)]"
        >
          Sign in
        </Link>
        .
      </p>
      <p className="text-xs text-[color:var(--color-ink-muted)]">
        By continuing you agree to NEXA&apos;s Terms and Privacy Policy.
      </p>
    </section>
  );
}
