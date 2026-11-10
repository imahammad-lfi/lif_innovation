"use client";
import * as React from "react";
/**
 * Keeps the duplicate marquee sets out of the keyboard order. The copies stay hit-testable (unlike `inert`),
 * so hover effects and click-through work on every visible logo while the strip scrolls.
 */
export function MarqueeFocusGuard() {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    const root = ref.current?.parentElement;
    root
      ?.querySelectorAll<HTMLElement>("[data-marquee-copy] a, [data-marquee-copy] button, [data-marquee-copy] [tabindex]")
      .forEach((el) => el.setAttribute("tabindex", "-1"));
  }, []);
  return <span ref={ref} hidden />;
}
