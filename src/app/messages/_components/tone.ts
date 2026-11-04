import type { AvatarTone } from "@/components/ui";

const tones: AvatarTone[] = ["navy", "amber", "teal"];

/** Stable avatar tone per name, so each conversation keeps its colour. */
export function toneFor(name: string): AvatarTone {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return tones[sum % tones.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}
