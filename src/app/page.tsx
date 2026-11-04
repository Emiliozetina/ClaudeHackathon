import Link from "next/link";
import { AppHeader, Avatar, Button, Chip, Icon, Logo, TaskCard } from "@/components/ui";
import type { IconName } from "@/components/ui";

// Figma: Screens → "01 · Landing" (6:45).
// Prototype links: every sign-up CTA opens "02 · Sign up — choose role" (/register),
// "Sign in" opens "05 · Sign in", "Create student profile" opens "04a" (/register/student).

const trustPoints = ["Free to post · pay when work is done", "Fair pay, always shown", "Verified students"];

const businessSteps = [
  "Sign up and verify your North East business",
  "Post a task — work, experience and pay",
  "Review applicants and choose a student",
  "Sign off the work, pay and leave a review",
];

const studentSteps = [
  "Sign up with your university email",
  "Build your profile — skills, CV, availability",
  "Browse local tasks and apply directly",
  "Complete the work and earn a verified reference",
];

const reasons: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "zap-teal-24",
    title: "Help when you’re overloaded",
    body: "Get a capable pair of hands for a busy fortnight — no recruitment process, no long-term contract.",
  },
  {
    icon: "award-teal-24",
    title: "Experience that counts",
    body: "Every completed task becomes a verified reference on the student’s NEXA portfolio.",
  },
  {
    icon: "map-pin-teal-24",
    title: "Keep talent in the North East",
    body: "Students build careers with local businesses, so there’s less reason to move away after graduating.",
  },
];

const footerLinks = [
  { label: "About", href: "/about" },
  // Same targets as the public App header (not wired in the prototype).
  { label: "For businesses", href: "/register/business" },
  { label: "For students", href: "/register/student" },
];

function SectionHeading({ overline, title }: { overline: string; title: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-[12px] text-center">
      <p className="type-overline text-teal-700">{overline}</p>
      <h2 className="type-h2 text-text-primary">{title}</h2>
    </div>
  );
}

function StepList({ steps, tone }: { steps: string[]; tone: "navy" | "teal" }) {
  return (
    <ol className="flex w-full flex-col gap-[24px]">
      {steps.map((step, i) => (
        <li key={step} className="flex w-full items-center gap-[16px]">
          <span
            className={`type-label flex size-[36px] shrink-0 items-center justify-center rounded-pill text-text-inverse ${
              tone === "navy" ? "bg-navy-900" : "bg-teal-700"
            }`}
          >
            {i + 1}
          </span>
          <span className="type-body flex-1 text-text-primary">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-full w-full flex-col bg-surface-page">
      <AppHeader role="public" />

      <main className="flex w-full flex-col">
        {/* Hero */}
        <section className="flex w-full flex-col items-center gap-[64px] overflow-hidden bg-navy-900 px-6 py-[96px] lg:flex-row lg:px-[120px]">
          <div className="relative z-10 flex min-w-0 flex-1 flex-col items-start gap-[28px]">
            <p className="flex items-center gap-[8px] rounded-pill bg-navy-700 px-[12px] py-[6px]">
              <Icon name="logo-dot" />
              <span className="type-label-sm text-navy-100">Built for the North East</span>
            </p>
            <h1 className="font-heading text-[64px] font-extrabold leading-[1.1] tracking-[-1.5px] text-text-inverse">
              Real work.
              <br />
              Right here.
            </h1>
            <p className="type-body-lg text-navy-100">
              When your small business gets overloaded, post a short-term task instead of hiring
              full-time. Students apply directly, gain paid experience, and build their careers
              without leaving the North East.
            </p>
            {/* In Figma these two rows are slightly wider than the 536px column;
                on desktop they stay on one line and run into the empty gap. */}
            <div className="flex flex-wrap items-start gap-[16px] lg:flex-nowrap">
              <Button href="/register?role=business" size="lg" showArrow>
                I&apos;m a business — post a task
              </Button>
              <Button href="/register?role=student" size="lg" variant="secondary">
                I&apos;m a student — find work
              </Button>
            </div>
            <ul className="flex flex-wrap items-center gap-x-[24px] gap-y-[8px] lg:flex-nowrap lg:whitespace-nowrap">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-[6px]">
                  <Icon name="check-amber-16" />
                  <span className="type-body-sm text-navy-100">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hero visual: example task card, applicant toast and Claude badge */}
          <div aria-hidden className="relative hidden h-[460px] w-[600px] shrink-0 lg:block">
            <TaskCard
              className="absolute left-0 top-[44px] w-[580px]"
              company="Tyne Brew Café"
              companyInitials="TB"
              location="Gateshead · Posted 2 days ago"
              title="Social media assistant"
              description="Help a busy independent café plan, shoot and schedule a month of Instagram and TikTok content."
              requiredSkills={["Canva", "Instagram"]}
              preferredSkills={["Copywriting", "Video editing"]}
              pay="£13.50/hr"
              duration="2 weeks · 10 hrs/week"
              match="You meet 2 of 2 required"
            />
            <div className="absolute left-[300px] top-[387px] flex w-max items-center gap-[12px] rounded-[14px] bg-surface-card px-[16px] py-[14px] shadow-elevation-2">
              <Avatar initials="AO" tone="teal" size={40} />
              <div className="flex flex-col gap-[2px] whitespace-nowrap">
                <p className="type-label text-text-primary">New applicant</p>
                <p className="type-caption text-text-secondary">Amara meets 2 of 2 required skills</p>
              </div>
            </div>
            <p className="absolute left-[410px] top-0 flex w-max items-center gap-[8px] whitespace-nowrap rounded-pill bg-amber-500 px-[12px] py-[8px]">
              <Icon name="zap-amber-16" />
              <span className="type-label-sm text-amber-900">Claude drafts your task for you</span>
            </p>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="flex w-full flex-col gap-[48px] bg-surface-card px-6 py-[96px] lg:px-[120px]"
        >
          <SectionHeading overline="HOW IT WORKS" title="Two sides, one simple flow" />
          <div className="flex w-full flex-col gap-[32px] md:flex-row">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-[24px] rounded-[20px] bg-navy-50 p-[40px]">
              <Chip type="required">For businesses</Chip>
              <StepList steps={businessSteps} tone="navy" />
              <Button href="/register?role=business" variant="dark" showArrow>
                Post your first task
              </Button>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start gap-[24px] rounded-[20px] bg-teal-50 p-[40px]">
              <Chip type="teal">For students</Chip>
              <StepList steps={studentSteps} tone="teal" />
              <Button href="/register/student" showArrow>
                Create student profile
              </Button>
            </div>
          </div>
        </section>

        {/* Why NEXA */}
        <section className="flex w-full flex-col gap-[48px] px-6 py-[96px] lg:px-[120px]">
          <SectionHeading overline="WHY NEXA" title="Good for local business. Good for local talent." />
          <div className="flex w-full flex-col items-start gap-[24px] md:flex-row">
            {reasons.map((reason) => (
              <article
                key={reason.title}
                className="flex min-w-0 flex-1 flex-col items-start gap-[16px] rounded-[20px] border border-border-subtle bg-surface-card p-[32px] shadow-elevation-1"
              >
                <span className="flex size-[48px] items-center justify-center rounded-[12px] bg-teal-50">
                  <Icon name={reason.icon} />
                </span>
                <h3 className="type-h4 text-text-primary">{reason.title}</h3>
                <p className="type-body text-text-secondary">{reason.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section className="w-full px-6 pb-[96px] lg:px-[120px]">
          <div className="flex w-full flex-col items-start gap-[32px] rounded-[24px] bg-teal-700 px-[64px] py-[56px] md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
              <h2 className="type-h2 text-text-inverse">Ready to get started?</h2>
              <p className="type-body-lg text-teal-50">
                Join local businesses and students already working together on NEXA.
              </p>
            </div>
            <Button href="/register?role=business" size="lg" variant="dark">
              Post a task
            </Button>
            <Button href="/register?role=student" size="lg" variant="secondary">
              Find work
            </Button>
          </div>
        </section>
      </main>

      <footer className="flex w-full flex-col items-start gap-6 bg-navy-900 px-6 py-[48px] md:flex-row md:items-center md:justify-between lg:px-[120px]">
        <Logo theme="dark" />
        <nav className="flex flex-wrap gap-[32px]">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="type-body-sm text-navy-100 hover:text-text-inverse">
              {link.label}
            </Link>
          ))}
          {/* No Privacy or Contact page exists yet. */}
          <span className="type-body-sm text-navy-100">Privacy</span>
          <span className="type-body-sm text-navy-100">Contact</span>
        </nav>
        <p className="type-body-sm text-navy-100">© 2026 NEXA · Made in the North East</p>
      </footer>
    </div>
  );
}
