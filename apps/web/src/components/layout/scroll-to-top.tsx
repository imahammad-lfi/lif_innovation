"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

const R = 23;
const C = 2 * Math.PI * R;

/**
 * Back-to-top control: appears after 300px of scrolling, bottom-right. A brand-gradient core with an arrow sits
 * inside a dark glass ring whose orange → amber arc shows how far down the page the visitor is. Subtle grow on
 * hover (site-wide hover language); the arrow nudges upwards. Smooth-scrolls to the top (instant with reduced motion).
 * On phones it sits 12px from the corner, clear of the event reminder bar (which stops 70px from the right), and it
 * rises above the footer bottom bar when that bar scrolls into view.
 */
export function ScrollToTop() {
  const [visible, setVisible] = React.useState(false);
  const arc = React.useRef<SVGCircleElement>(null);
  const btn = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setVisible(window.scrollY > 300);
      if (arc.current) arc.current.style.strokeDashoffset = String(C * (1 - p));
      // Rise above the footer's bottom bar (copyright · legal · social) while it is on screen, so nothing is covered.
      const bar = document.querySelector("[data-footer-bar]");
      const lift = bar ? Math.max(0, window.innerHeight - bar.getBoundingClientRect().top) : 0;
      btn.current?.style.setProperty("--lift", `${Math.round(lift)}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      ref={btn}
      type="button"
      aria-label="Scroll to top"
      data-scroll-top
      onClick={toTop}
      tabIndex={visible ? undefined : -1}
      aria-hidden={!visible}
      className={cn(
        "group fixed bottom-[calc(12px+var(--lift,0px))] right-3 z-[1000] grid size-[50px] cursor-pointer place-items-center rounded-full bg-[#0a0f1d]/80 shadow-[0_14px_34px_-14px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-md outline-none",
        "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-brand/70 md:bottom-[calc(24px+var(--lift,0px))] md:right-6 md:size-[54px]",
        visible ? "translate-y-0 opacity-100 hover:scale-[1.08] motion-reduce:hover:scale-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <svg aria-hidden viewBox="0 0 50 50" className="absolute inset-0 size-full -rotate-90">
        <defs>
          <linearGradient id="lf-top-arc" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#FFC21A" />
            <stop offset="0.55" stopColor="#FF7800" />
            <stop offset="1" stopColor="#EC5A06" />
          </linearGradient>
        </defs>
        <circle cx="25" cy="25" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <circle
          ref={arc}
          cx="25"
          cy="25"
          r={R}
          fill="none"
          stroke="url(#lf-top-arc)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
        />
      </svg>
      <span className="hover-swap relative grid size-[38px] place-items-center rounded-full bg-brand-gradient text-white shadow-[0_8px_20px_-8px_rgba(255,120,0,0.95),inset_0_1px_0_rgba(255,255,255,0.3)] md:size-[41px]">
        <span className="grid place-items-center">
          <ArrowUp aria-hidden strokeWidth={2.4} className="size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-y-0" />
        </span>
      </span>
    </button>
  );
}
