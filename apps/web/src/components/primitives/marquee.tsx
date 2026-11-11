import * as React from "react";

import { cn } from "@/lib/utils";
import { MarqueeFocusGuard } from "./marquee-focus-guard";

type MarqueeProps = {
  children: React.ReactNode;
  /** Accessible name of the strip (e.g. "Credentials"). */
  label: string;
  className?: string;
  listClassName?: string;
  /** Seconds for one full set to pass; scale with the number of items. */
  duration?: number;
  reverse?: boolean;
  /** Identical sets in the track (min 3). Full-bleed strips need more so a 5K / ultra-wide screen never shows a gap. */
  copies?: number;
};

/**
 * Continuous, CSS-only logo/text strip. The set is rendered `copies` times (default 3) so wide screens never show a
 * gap; every copy after the first is hidden from assistive tech and removed from the Tab order (not `inert`, which would also
 * block hover and clicks on the copies that fill most of a wide screen). Hover or keyboard focus pauses it, the hero's
 * pause button pauses it (`[data-motion-paused]`), and reduced-motion users get a static, scrollable row.
 */
export function Marquee({ children, label, className, listClassName, duration = 40, reverse = false, copies = 3 }: MarqueeProps) {
  const sets = Math.max(3, Math.round(copies));
  const items = React.Children.toArray(children);
  if (!items.length) return null;
  const list = (copy: number) => (
    <ul
      key={copy}
      aria-hidden={copy > 0 || undefined}
      data-marquee-copy={copy > 0 || undefined}
      className={cn("flex shrink-0 items-center", listClassName)}
    >
      {items.map((child, i) => (
        <li key={i} className="shrink-0">
          {child}
        </li>
      ))}
    </ul>
  );
  return (
    <div role="region" aria-label={label} className={cn("marquee relative overflow-hidden", className)}>
      <div
        className={cn("marquee-track flex w-max", reverse && "marquee-reverse")}
        style={{ "--marquee-duration": `${duration}s`, "--marquee-copies": sets } as React.CSSProperties}
      >
        {Array.from({ length: sets }, (_, copy) => list(copy))}
      </div>
      <MarqueeFocusGuard />
    </div>
  );
}
