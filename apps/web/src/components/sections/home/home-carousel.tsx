"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type HomeCarouselProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Classes for the clipping viewport (e.g. side padding that keeps neighbouring slides visible). */
  viewportClassName?: string;
  itemClassName?: string;
  dotsClassName?: string;
  arrowsClassName?: string;
  loop?: boolean;
  /** React-slick's effective delay is autoplaySpeed + 50ms. */
  autoPlay?: number;
  /** React-slick's CSS transition duration. */
  speed?: number;
  mode?: "slide" | "fade";
  showDots?: boolean;
  showArrows?: boolean;
  dotsVariant?: "dot" | "dash";
  ariaLabel?: string;
};

/**
 * Home-only react-slick parity carousel.
 *
 * The original uses slick's clone track for the services/industries strips and
 * an opacity fade for awards. A measured CSS transform preserves slick's
 * `ease` duration; three repeated sets make the loop reset imperceptible.
 */
export function HomeCarousel({
  children,
  className,
  contentClassName,
  viewportClassName,
  itemClassName,
  dotsClassName,
  arrowsClassName,
  loop = true,
  autoPlay = 0,
  speed = 500,
  mode = "slide",
  showDots = false,
  showArrows = false,
  dotsVariant = "dot",
  ariaLabel = "Carousel",
}: HomeCarouselProps) {
  const slides = React.Children.toArray(children);
  const count = slides.length;
  const firstSlideRef = React.useRef<HTMLDivElement>(null);
  const pointerStart = React.useRef<number | null>(null);
  const moving = React.useRef(false);
  const [slideWidth, setSlideWidth] = React.useState(0);
  const [trackIndex, setTrackIndex] = React.useState(loop ? count : 0);
  const [active, setActive] = React.useState(0);
  const [animate, setAnimate] = React.useState(false);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (mode !== "slide" || !firstSlideRef.current) return;
    const updateWidth = () => {
      const width = firstSlideRef.current?.getBoundingClientRect().width ?? 0;
      if (!width) return;
      setAnimate(false);
      setSlideWidth(width);
      setTrackIndex(loop ? count : 0);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setAnimate(true)));
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(firstSlideRef.current);
    return () => observer.disconnect();
  }, [count, loop, mode]);

  const moveTrack = React.useCallback((direction: 1 | -1) => {
    if (mode !== "slide" || count < 2 || moving.current) return;
    moving.current = true;
    setAnimate(true);
    setTrackIndex((current) => current + direction);
    setActive((current) => (current + direction + count) % count);
  }, [count, mode]);

  const moveFade = React.useCallback((direction: 1 | -1) => {
    if (mode !== "fade" || count < 2 || moving.current) return;
    moving.current = true;
    setActive((current) => (current + direction + count) % count);
    window.setTimeout(() => { moving.current = false; }, speed);
  }, [count, mode, speed]);

  const move = React.useCallback((direction: 1 | -1) => {
    if (mode === "fade") moveFade(direction);
    else moveTrack(direction);
  }, [mode, moveFade, moveTrack]);

  React.useEffect(() => {
    if (!autoPlay || count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => move(1), autoPlay);
    return () => window.clearInterval(timer);
  }, [autoPlay, count, move, paused]);

  const select = React.useCallback((index: number) => {
    if (moving.current || index === active) return;
    if (mode === "fade") {
      moving.current = true;
      setActive(index);
      window.setTimeout(() => { moving.current = false; }, speed);
      return;
    }
    moving.current = true;
    setAnimate(true);
    setTrackIndex(count + index);
    setActive(index);
  }, [active, count, mode, speed]);

  const onTransitionEnd = React.useCallback((event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "transform") return;
    moving.current = false;
    if (!loop) return;
    setTrackIndex((current) => {
      if (current >= count * 2) {
        setAnimate(false);
        return current - count;
      }
      if (current < count) {
        setAnimate(false);
        return current + count;
      }
      return current;
    });
  }, [count, loop]);

  React.useEffect(() => {
    if (animate) return;
    const frame = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setAnimate(true)));
    return () => window.cancelAnimationFrame(frame);
  }, [animate]);

  if (!count) return null;
  const items = mode === "slide" && loop
    ? [0, 1, 2].flatMap((copy) => slides.map((slide, index) => ({ copy, slide, index })))
    : slides.map((slide, index) => ({ copy: 0, slide, index }));

  return (
    <div
      className={cn("relative", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={(event) => { pointerStart.current = event.clientX; }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return;
        const delta = event.clientX - pointerStart.current;
        pointerStart.current = null;
        if (Math.abs(delta) > 50) move(delta < 0 ? 1 : -1);
      }}
    >
      {mode === "fade" ? (
        <div className="relative">
          <div className="invisible" aria-hidden="true">{slides[active]}</div>
          {slides.map((slide, index) => {
            const isActive = index === active;
            return (
              <div
                key={index}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                aria-hidden={!isActive}
                inert={!isActive}
                className={cn("absolute inset-0 transition-opacity ease-[ease]", isActive ? "z-[1] opacity-100" : "pointer-events-none z-0 opacity-0")}
                style={{ transitionDuration: `${speed}ms` }}
              >
                {slide}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={cn("overflow-hidden", viewportClassName)}>
          <div
            className={cn("flex touch-pan-y", contentClassName)}
            style={{ transform: `translate3d(${-trackIndex * slideWidth}px, 0, 0)`, transition: animate && slideWidth ? `transform ${speed}ms ease` : "none" }}
            onTransitionEnd={onTransitionEnd}
          >
            {items.map(({ copy, slide, index }, itemIndex) => (
              <div
                key={`${copy}-${index}`}
                ref={itemIndex === 0 ? firstSlideRef : undefined}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                aria-hidden={copy !== 1 || undefined}
                className={cn("min-w-0 shrink-0 grow-0", itemClassName)}
              >
                {slide}
              </div>
            ))}
          </div>
        </div>
      )}
      {showArrows && count > 1 ? (
        <div className={cn("pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-gutter", arrowsClassName)}>
          <button type="button" aria-label="Previous slide" onClick={() => move(-1)} className="hover-grow hover-fill pointer-events-auto grid size-11 place-items-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md">
            <ArrowLeft className="size-4" strokeWidth={2} />
          </button>
          <button type="button" aria-label="Next slide" onClick={() => move(1)} className="hover-grow hover-fill pointer-events-auto grid size-11 place-items-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md">
            <ArrowRight className="size-4" strokeWidth={2} />
          </button>
        </div>
      ) : null}
      {showDots && count > 1 ? (
        <div className={cn("flex justify-center gap-[6px]", dotsClassName)}>
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={active === index ? "true" : undefined}
              onClick={() => select(index)}
              className={cn("hover-grow relative h-6 w-7 rounded-full before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2 before:rounded-full before:transition-colors", dotsVariant === "dash" ? "before:h-[3px]" : "before:mx-auto before:size-2", active === index ? "before:bg-brand" : "before:bg-white/30 hover:before:bg-white/65")}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
