import { Avatar, Icon, Logo, type AvatarTone } from "@/components/ui";
import { cn } from "@/lib/cn";

export type AuthBrandTone = "navy" | "teal";

/** Business screens (03, 03b, 05) use navy; student screens (04, 04b) use teal. */
const toneClass: Record<AuthBrandTone, { panel: string; card: string }> = {
  navy: { panel: "bg-navy-900", card: "bg-navy-700" },
  teal: { panel: "bg-teal-800", card: "bg-teal-700" },
};

export type AuthTestimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  avatarTone?: AvatarTone;
};

type AuthBrandPanelProps = {
  title: string;
  /** The three check lines under the title. */
  points: readonly string[];
  testimonial: AuthTestimonial;
  tone?: AuthBrandTone;
  className?: string;
};

/**
 * Figma: screens 03 / 03b / 04 / 04b / 05 → "Brand panel" (560 wide).
 * Logo at the top, title + check list centred in the free space, testimonial
 * card at the bottom; 56px padding all round.
 */
export function AuthBrandPanel({
  title,
  points,
  testimonial,
  tone = "navy",
  className,
}: AuthBrandPanelProps) {
  const colors = toneClass[tone];
  return (
    <aside
      className={cn(
        "flex min-h-full w-full flex-col justify-between gap-12 p-14 lg:w-[560px] lg:shrink-0",
        colors.panel,
        className,
      )}
    >
      <Logo theme="dark" className="self-start" />

      <div className="flex flex-col gap-6">
        <h2 className="type-h1 text-text-inverse">{title}</h2>
        <ul className="flex flex-col gap-6">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-px flex size-6 shrink-0 items-center justify-center rounded-pill bg-amber-500"
              >
                <Icon name="check-633806-14" />
              </span>
              <span className="type-body text-navy-100">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <figure className={cn("flex flex-col gap-5 rounded-[20px] p-7", colors.card)}>
        <blockquote className="type-body-lg text-text-inverse">
          “{testimonial.quote}”
        </blockquote>
        <figcaption className="flex items-center gap-3">
          <Avatar initials={testimonial.initials} tone={testimonial.avatarTone} size={40} />
          <span className="flex flex-col gap-0.5">
            <span className="type-label text-text-inverse">{testimonial.name}</span>
            <span className="type-caption text-navy-100">{testimonial.role}</span>
          </span>
        </figcaption>
      </figure>
    </aside>
  );
}
