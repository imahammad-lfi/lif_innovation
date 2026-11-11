"use client";

import { useEffect, useRef, useState } from "react";

type Props = { src: string; type?: string | null; poster?: string | null; label?: string | null };

/**
 * Square, full-globe hero video. The source is a 1:1 render of the globe on a navy field, so it is shown with
 * object-contain inside a circular mask (never cropped).
 *
 * Loading: the poster frame is the first paint (and the page's LCP image — the hero preloads it at high priority).
 * The video itself (~2.6 MB) is attached only after the page has loaded and the browser is idle, so it never competes
 * with the page's CSS, JavaScript and fonts on a slow connection. Visitors who prefer reduced motion keep the poster
 * frame and never download the video.
 */
export function GlobeVideo({ src, type, poster, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [attached, setAttached] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let idle = 0;
    let timer = 0;
    const attach = () => {
      if (!cancelled && !query.matches) setAttached(true);
    };
    const schedule = () => {
      // Older Safari has no requestIdleCallback.
      const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
      if (ric) idle = ric(attach, { timeout: 2500 });
      else timer = window.setTimeout(attach, 400);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    const onMotionChange = () => {
      if (!query.matches) setAttached(true);
    };
    query.addEventListener("change", onMotionChange);
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idle) window.cancelIdleCallback?.(idle);
      if (timer) window.clearTimeout(timer);
      query.removeEventListener("change", onMotionChange);
    };
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || !attached) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    video.load();
    const sync = () => {
      if (query.matches) video.pause();
      else void video.play().catch(() => undefined);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [attached]);

  return (
    <>
      {/* High-priority preload of the poster (the home page's LCP image). Rendered by this client component on purpose:
          a preload declared in a server component (ReactDOM.preload or a hoisted <link>) becomes a Flight "hint" that
          the browser also applies when another page merely prefetches the home route, so every page would download the
          72 KB poster. Client-rendered, it is emitted into <head> only when the home page itself is server-rendered. */}
      {poster ? <link rel="preload" as="image" href={poster} fetchPriority="high" /> : null}
      <video
      ref={ref}
      className="globe-mask relative size-full object-contain"
      autoPlay={attached}
      loop
      muted
      playsInline
      preload={attached ? "auto" : "none"}
      poster={poster || undefined}
      aria-label={label || undefined}
      role={label ? "img" : undefined}
    >
      {attached ? <source src={src} type={type || "video/mp4"} /> : null}
      </video>
    </>
  );
}
