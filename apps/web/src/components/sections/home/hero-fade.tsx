"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";

import { cn } from "@/lib/utils";

type HeroFadeProps = {
  children: React.ReactNode;
  className?: string;
  dotsClassName?: string;
  /** Time each slide stays on screen, in milliseconds (the 1 s cross-fade is included). */
  interval?: number;
  ariaLabel?: string;
};

/** Elements marked with this attribute hold the autoplay while the pointer is over them (slide copy, controls). */
const HOLD = "[data-carousel-hold]";

/**
 * Cross-fading hero slider: 1 s fade, dots, swipe and a pause/play button.
 *
 * Timing is driven by a CSS progress animation on the active dot: when it finishes, the next slide shows.
 * Pausing (pointer over the slide copy or the controls, keyboard focus inside, or the pause button) freezes that
 * animation, so autoplay resumes from where it stopped instead of restarting the full interval. Hovering empty
 * hero space (the globe, the background) no longer stops the slides — previously a cursor resting anywhere on the
 * full-screen hero froze it. Reduced-motion users get no autoplay.
 */
export function HeroFade({ children, className, dotsClassName, interval = 4000, ariaLabel = "Carousel" }: HeroFadeProps) {
  const slides = React.Children.toArray(children);
  const count = slides.length;
  const [active, setActive] = React.useState(0);
  const [held, setHeld] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [stopped, setStopped] = React.useState(false);
  // Unknown until mounted: autoplay starts only once we know motion is allowed (no SSR/first-paint race).
  const [motionOk, setMotionOk] = React.useState(false);
  const pointerStart = React.useRef<number | null>(null);
  const root = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // The pause button also stops the hero's scrolling strips (credentials, partners).
  React.useEffect(() => {
    root.current?.closest("section")?.toggleAttribute("data-motion-paused", stopped);
  }, [stopped]);

  const go = React.useCallback((next: number) => setActive(((next % count) + count) % count), [count]);

  const autoplay = count > 1 && !stopped && motionOk;
  const paused = held || focused;

  if (!count) return null;

  return (
    <div
      ref={root}
      className={cn("relative", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      data-autoplay={autoplay ? (paused ? "paused" : "running") : "off"}
      onPointerOver={(event) => setHeld(Boolean((event.target as Element).closest?.(HOLD)))}
      onPointerLeave={() => setHeld(false)}
      onFocus={(event) => {
        // Only keyboard focus holds the slides; a mouse click on a dot should not freeze autoplay.
        if ((event.target as Element).matches?.(":focus-visible")) setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      onPointerDown={(event) => {
        pointerStart.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return;
        const delta = event.clientX - pointerStart.current;
        pointerStart.current = null;
        if (Math.abs(delta) > 50) go(active + (delta < 0 ? 1 : -1));
      }}
    >
      {slides.map((child, index) => {
        const isActive = index === active;
        return (
          <div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            aria-hidden={!isActive}
            inert={!isActive}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-[ease]",
              isActive ? "z-[1] opacity-100" : "pointer-events-none z-0 opacity-0",
            )}
          >
            {child}
          </div>
        );
      })}
      {count > 1 ? (
        <div data-carousel-hold className={cn("flex items-center justify-center", dotsClassName)}>
          <button
            type="button"
            onClick={() => setStopped((v) => !v)}
            aria-label={stopped ? "Play hero animation" : "Pause hero animation"}
            aria-pressed={stopped}
            className="mr-2 flex size-7 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white/80 backdrop-blur-sm transition-[transform,border-color,color] duration-300 hover:scale-110 hover:border-white/50 hover:text-white"
          >
            {stopped ? <Play aria-hidden className="size-3 fill-current" /> : <Pause aria-hidden className="size-3 fill-current" />}
          </button>
          {slides.map((_, index) => {
            const isActive = active === index;
            return (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => go(index)}
                className={cn("group/dot relative flex h-6 items-center justify-center transition-[width] duration-300", isActive ? "w-10" : "w-5")}
              >
                <span
                  className={cn(
                    "relative block h-1.5 overflow-hidden rounded-full transition-[width,background-color,transform] duration-300 group-hover/dot:scale-y-125",
                    isActive ? "w-8 bg-white/20" : "w-1.5 bg-white/35 group-hover/dot:bg-white/70",
                  )}
                >
                  {isActive ? (
                    autoplay ? (
                      <span
                        key={`progress-${active}`}
                        aria-hidden
                        className="hero-progress"
                        style={{ animationDuration: `${interval}ms`, animationPlayState: paused ? "paused" : "running" }}
                        onAnimationEnd={(event) => {
                          if (event.animationName === "hero-progress") go(active + 1);
                        }}
                      />
                    ) : (
                      <span aria-hidden className="absolute inset-0 rounded-full bg-brand-gradient" />
                    )
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
