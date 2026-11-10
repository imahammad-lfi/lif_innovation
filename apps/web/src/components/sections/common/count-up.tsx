"use client";

import { useEffect, useRef, useState } from "react";

/** Counts from 0 to `value` once the number scrolls into view (like the original). Non-numeric values render as-is. */
export function CountUp({ value, suffix = "", duration = 2000 }: { value: string; suffix?: string; duration?: number }) {
  const target = Number.parseFloat(value);
  const numeric = Number.isFinite(target);
  const [current, setCurrent] = useState(numeric ? 0 : NaN);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!numeric || !ref.current) return;
    const el = ref.current;
    let raf = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // No animation: show the final number on the next frame.
      raf = requestAnimationFrame(() => setCurrent(target));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setCurrent(Math.round(target * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [numeric, target, duration]);

  return (
    <span ref={ref} aria-label={`${value}${suffix}`}>
      {numeric ? current : value}
      {suffix}
    </span>
  );
}
