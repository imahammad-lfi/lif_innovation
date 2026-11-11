import type { CSSProperties } from "react";
import type { Accent } from "@/lib/content/types";

/** Accent palette used by Products & Accelerators (matches the Linkfields brand slide). */
export const ACCENTS: Record<Accent, string> = {
  orange: "#FF7800",
  blue: "#3D7BFF",
  purple: "#A06BFF",
  teal: "#1FC8A9",
  yellow: "#FFC21A",
};

export function accentHex(accent?: string | null): string {
  return ACCENTS[(accent as Accent) || "orange"] ?? ACCENTS.orange;
}

/** Exposes the accent as CSS variables: --acc (solid), --acc-soft (12%), --acc-line (35%). */
export function accentVars(accent?: string | null): CSSProperties {
  const hex = accentHex(accent);
  return {
    "--acc": hex,
    "--acc-soft": `color-mix(in srgb, ${hex} 12%, transparent)`,
    "--acc-line": `color-mix(in srgb, ${hex} 35%, transparent)`,
  } as CSSProperties;
}
