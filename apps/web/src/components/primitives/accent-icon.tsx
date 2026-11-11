import type { CSSProperties } from "react";
import type { Media } from "@/lib/content/types";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Menu / tile icon chip. The CMS icon (a same-origin SVG or transparent PNG) is used as a CSS mask and
 * painted with the surrounding accent (`--acc` from accentVars()), so every menu shares one icon style
 * and each item carries its portfolio colour instead of a hard-coded orange.
 */
export function AccentIcon({ media, size = "md", className }: { media?: Media | null; size?: "sm" | "md"; className?: string }) {
  const url = mediaUrl(media);
  if (!url) return null;
  const mask = `url("${url}")`;
  const style = {
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as CSSProperties;
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center bg-[var(--acc-soft)] ring-1 ring-[var(--acc-line)] transition-[background-color,box-shadow] duration-300",
        size === "md" ? "size-9 rounded-xl" : "size-8 rounded-lg",
        className,
      )}
    >
      <span style={style} className={cn("block bg-[var(--acc)]", size === "md" ? "size-[19px]" : "size-4")} />
    </span>
  );
}

/** Bare accent-painted icon (no chip) for sub-link lists; dims to 70% and brightens with the link on hover. */
export function LinkIcon({ media, className }: { media?: Media | null; className?: string }) {
  const url = mediaUrl(media);
  if (!url) return null;
  const mask = `url("${url}")`;
  return (
    <span
      aria-hidden
      style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" } as CSSProperties}
      className={cn("block size-[15px] shrink-0 bg-[var(--acc)] opacity-70 transition-opacity duration-200 group-hover/ln:opacity-100", className)}
    />
  );
}
