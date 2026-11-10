"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type PartnerTrackProps = {
  children: React.ReactNode;
  className?: string;
  /** Classes on the moving track (e.g. vertical padding). */
  trackClassName?: string;
  /** Delay between moves; react-slick uses `autoplaySpeed + 50`. */
  interval?: number;
  /** Duration of each move (react-slick `speed`). */
  speed?: number;
  ariaLabel?: string;
};

/**
 * Infinite partner logo track that mirrors the original react-slick configuration:
 * `centerMode` with 80px padding, 5 slides (3 below 1024px), `speed` and `autoplaySpeed` 4000ms with CSS `ease`,
 * so the strip glides almost continuously. Slide width is pure CSS, so the first paint matches the server render.
 */
export function PartnerTrack({ children, className, trackClassName, interval = 4050, speed = 4000, ariaLabel = "Carousel" }: PartnerTrackProps) {
  const items = React.Children.toArray(children);
  const count = items.length;
  const [index, setIndex] = React.useState(count);
  const [animate, setAnimate] = React.useState(true);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setAnimate(true);
      setIndex((current) => current + 1);
    }, interval);
    return () => window.clearInterval(timer);
  }, [count, interval, paused]);

  // After moving into the third copy, jump back by one full set without animation (seamless loop).
  const onTransitionEnd = React.useCallback(() => {
    if (index >= count * 2) {
      setAnimate(false);
      setIndex((current) => current - count);
    }
  }, [count, index]);

  React.useEffect(() => {
    if (animate) return;
    const frame = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setAnimate(true)));
    return () => window.cancelAnimationFrame(frame);
  }, [animate]);

  if (!count) return null;
  const copies = [0, 1, 2];

  return (
    <div
      className={cn("overflow-hidden px-[80px] [--n:5] max-[1023px]:[--n:3]", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={cn("flex items-center", trackClassName)}
        style={{
          transform: `translate3d(calc(-100% * ${index} / var(--n)), 0, 0)`,
          transition: animate ? `transform ${speed}ms ease` : "none",
        }}
        onTransitionEnd={onTransitionEnd}
      >
        {copies.map((copy) =>
          items.map((item, i) => (
            <div
              key={`${copy}-${i}`}
              className="min-w-0 shrink-0 grow-0 basis-[calc(100%/var(--n))]"
              aria-hidden={copy !== 1 || undefined}
            >
              {item}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
