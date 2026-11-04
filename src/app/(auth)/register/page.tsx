import Link from "next/link";

export default function RegisterPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Choose whether you are a North East business or a student.
        </p>
      </div>
      <div className="grid gap-3">
        <Link
          href="/register/business"
          className="rounded-md border border-black/10 p-4 transition hover:border-black/30 dark:border-white/15 dark:hover:border-white/40"
        >
          <div className="font-medium">I&apos;m a business</div>
          <div className="text-sm text-black/60 dark:text-white/60">
            Post short-term tasks and review applicants.
          </div>
        </Link>
        <Link
          href="/register/student"
          className="rounded-md border border-black/10 p-4 transition hover:border-black/30 dark:border-white/15 dark:hover:border-white/40"
        >
          <div className="font-medium">I&apos;m a student</div>
          <div className="text-sm text-black/60 dark:text-white/60">
            Build a profile and apply to tasks from local businesses.
          </div>
        </Link>
      </div>
      <p className="text-sm text-black/60 dark:text-white/60">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
        .
      </p>
    </section>
  );
}
