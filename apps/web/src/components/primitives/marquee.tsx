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
};

/**
 * Continuous, CSS-only logo/text strip. The set is rendered three times so wide screens never show a gap;
 * copies 2 and 3 are hidden from assistive tech and removed from the Tab order (not `inert`, which would also
 * block hover and clicks on the copies that fill most of a wide screen). Hover or keyboard focus pauses it, the hero's
 * pause button pauses it (`[data-motion-paused]`), and reduced-motion users get a static, scrollable row.
 */
export function Marquee({ children, label, className, listClassName, duration = 40, reverse = false }: MarqueeProps) {
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
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {[0, 1, 2].map(list)}
      </div>
      <MarqueeFocusGuard />
    </div>
  );
}
