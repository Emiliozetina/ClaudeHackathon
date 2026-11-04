import type { ReactNode } from "react";
import { Avatar, Icon, Logo } from "@/components/ui";

/**
 * Split-screen layout from the NEXA student sign-up frames: teal brand panel
 * on the left (560px), form on the right. The panel copy changes per step.
 */
export type CvPanel = "cv" | "details" | "experience";

interface PanelContent {
  headline: string;
  bullets: string[];
  privacyNote?: string;
  quote?: { text: string; name: string; meta: string; initials: string };
}

const PANELS: Record<CvPanel, PanelContent> = {
  cv: {
    headline: "Upload once. Claude does the typing.",
    bullets: [
      "Claude reads your CV and fills in your profile",
      "You check every field before it’s saved",
      "Only facts from your CV — nothing invented",
    ],
    privacyNote:
      "Your CV is only used to build your profile and draft applications you approve. It’s never shared without your OK.",
  },
  details: {
    headline: "Build real experience without leaving the North East.",
    bullets: [
      "Paid, short-term tasks with local businesses",
      "Every task earns a verified reference",
      "Work around your timetable",
    ],
    quote: {
      text: "“My first NEXA task turned into a reference that got me my graduate job in Newcastle.”",
      name: "Daniel Reed",
      meta: "BSc Computer Science · Newcastle University",
      initials: "DR",
    },
  },
  experience: {
    headline: "Show businesses what you’ve done — and where you’re heading.",
    bullets: [
      "Any experience counts: jobs, societies, volunteering",
      "Your goals help us suggest the right tasks",
      "Shown on your profile when you apply",
    ],
    quote: {
      text: "“Writing my goals down helped me pick tasks that actually moved my career forward.”",
      name: "Daniel Reed",
      meta: "BSc Computer Science · Newcastle University",
      initials: "DR",
    },
  },
};

export function CvShell({ panel, children }: { panel: CvPanel; children: ReactNode }) {
  const content = PANELS[panel];
  return (
    <div className="grid min-h-screen flex-1 grid-cols-1 lg:grid-cols-[560px_1fr]">
      <aside className="hidden flex-col justify-between bg-teal-800 p-14 lg:flex">
        <Logo theme="dark" className="self-start" />

        <div className="flex flex-col gap-6">
          <h2 className="type-h1 text-text-inverse">{content.headline}</h2>
          <ul className="flex flex-col gap-4">
            {content.bullets.map((bullet) => (
              <li key={bullet} className="type-body flex items-center gap-3 text-text-inverse">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-amber-500">
                  <Icon name="check-633806-14" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        {content.privacyNote && (
          <div className="flex items-center gap-3 rounded-lg bg-teal-700 p-5">
            <Icon name="lock-white-20" className="shrink-0" />
            <p className="type-body-sm text-text-inverse">{content.privacyNote}</p>
          </div>
        )}
        {content.quote && (
          <figure className="flex flex-col gap-5 rounded-lg bg-teal-700 p-7">
            <blockquote className="type-body-lg text-text-inverse">{content.quote.text}</blockquote>
            <figcaption className="flex items-center gap-3">
              <Avatar initials={content.quote.initials} tone="amber" size={40} />
              <span className="flex flex-col">
                <span className="type-label text-text-inverse">{content.quote.name}</span>
                <span className="type-caption text-text-inverse">{content.quote.meta}</span>
              </span>
            </figcaption>
          </figure>
        )}
      </aside>

      <main className="flex min-w-0 bg-surface-card">
        <div className="mx-auto my-auto flex w-full max-w-[568px] flex-col px-6 py-12">{children}</div>
      </main>
    </div>
  );
}
