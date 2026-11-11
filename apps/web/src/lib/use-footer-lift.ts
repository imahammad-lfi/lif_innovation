"use client";

import { type RefObject, useEffect } from "react";

/**
 * Keeps a fixed, bottom-anchored element (event reminder pill, floating controls) above the footer's bottom bar
 * (copyright · legal links · social icons) while that bar is on screen, so nothing is covered.
 * Sets `--lift` (px) on the element; use it in the position, e.g. `bottom-[calc(12px+var(--lift,0px))]`.
 */
export function useFooterLift(ref: RefObject<HTMLElement | null>, active = true) {
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const bar = document.querySelector("[data-footer-bar]");
      const lift = bar ? Math.max(0, window.innerHeight - bar.getBoundingClientRect().top) : 0;
      el.style.setProperty("--lift", `${Math.round(lift)}px`);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, active]);
}
