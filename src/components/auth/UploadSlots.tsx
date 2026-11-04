import type { ComponentProps } from "react";
import { Avatar, Icon, buttonClassName } from "@/components/ui";
import { cn } from "@/lib/cn";

/** File-input props passed through (name, accept, multiple, onChange, required…). */
type FileInputProps = Omit<ComponentProps<"input">, "type" | "className" | "children">;

type LogoUploadRowProps = FileInputProps & {
  title: string;
  hint: string;
  /** Button text, "Upload" in Figma. */
  buttonLabel: string;
  /** Shown in the 56px avatar until an image is chosen. */
  initials: string;
  /** Object URL / URL of the chosen image, to preview it in place of the initials. */
  previewSrc?: string;
  className?: string;
};

/**
 * Figma: screen 03b → "Logo" row (520 × 56).
 * 56px navy avatar, label + caption, Secondary "Upload" button on the right.
 * The button is the <label> of a hidden file input, so it opens the picker.
 */
export function LogoUploadRow({
  title,
  hint,
  buttonLabel,
  initials,
  previewSrc,
  className,
  ...inputProps
}: LogoUploadRowProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {previewSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
        <img src={previewSrc} alt="" className="size-14 shrink-0 rounded-pill object-cover" />
      ) : (
        <Avatar initials={initials} tone="navy" size={56} />
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="type-label text-text-primary">{title}</span>
        <span className="type-caption text-text-secondary">{hint}</span>
      </span>
      <label className={cn(buttonClassName({ variant: "secondary" }), "cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-700")}>
        <input {...inputProps} type="file" className="sr-only" />
        {buttonLabel}
      </label>
    </div>
  );
}

type PhotoUploadBoxProps = FileInputProps & {
  title: string;
  hint: string;
  /** Button text, "Browse" in Figma. */
  buttonLabel: string;
  className?: string;
};

/**
 * Figma: screen 03b → "Workplace photos" (520 × 86).
 * Dashed border-default box on surface-page, 44px navy-50 image tile,
 * label + caption, Secondary "Browse" button on the right.
 */
export function PhotoUploadBox({
  title,
  hint,
  buttonLabel,
  className,
  ...inputProps
}: PhotoUploadBoxProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-[12px] border border-dashed border-border-default bg-surface-page p-5",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-md bg-navy-50"
      >
        <Icon name="image-0b2545-22" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-label text-text-primary">{title}</span>
        <span className="type-caption text-text-secondary">{hint}</span>
      </span>
      <label className={cn(buttonClassName({ variant: "secondary" }), "cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal-700")}>
        <input {...inputProps} type="file" className="sr-only" />
        {buttonLabel}
      </label>
    </div>
  );
}
