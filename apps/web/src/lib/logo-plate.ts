import type { Media } from "@/lib/content/types";

/**
 * Balanced product-logo plate files (tools/logo_plates.py): every product logo sits on the same transparent canvas shape
 * with its lower-case letters at the same share of the canvas height, so any white plate shows every product wordmark at
 * the same text size. Keep PLATE_ASPECT in sync with the tool.
 */
export const PLATE_ASPECT = 3.25;

/**
 * True for plate files. The seed (and editors) upload them as "<slug>-plate.png", which Strapi stores as
 * "/uploads/<slug>_plate_<hash>.png". Other logos (partner and platform logos) keep their own boxes.
 */
export function isPlateLogo(media?: Media | null): boolean {
  const file = media?.url?.split("?")[0].split("/").pop() ?? "";
  return /(^|[_-])plate([_-]|\.)/i.test(file);
}

/** Box classes for a plate file: the plate's own shape across the available width, capped by the plate height. */
export const PLATE_BOX = "relative block aspect-[3.25/1] w-full";
