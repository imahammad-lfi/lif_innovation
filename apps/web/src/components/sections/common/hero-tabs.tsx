"use client";
import { ArrowUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { AnchorLink } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { CONTACT_SECTION_ID, openContactDialog } from "@/lib/contact-dialog";
import { dockHeight, headerHeight } from "@/lib/landing";
import { byId } from "@/lib/dom";

const noopSubscribe = () => () => undefined;

/**
 * In-page section navigation.
 * - Floating glass pill bar at the bottom of the inner-page hero.
 * - Once the hero bar scrolls out of view it docks under the fixed header and stays visible while the
 *   reader scrolls up or down, so any section (Overview, How can we help, Our process, Benefits …) is one click away.
 * - Scroll-spy always marks one tab as current (aria-current) in both bars: the first section while the
 *   visitor is still in the hero, then whichever section is under the bar. Clicks smooth-scroll with the
 *   header + dock offset and honour prefers-reduced-motion.
 * - The docked bar also names the page (left), shows "02 / 05" and a back-to-top button (right, wide
 *   screens) and a thin reading-progress line, so the visitor always knows where they are.
 */
export function HeroTabs({ links, title }: { links: AnchorLink[]; title?: string | null }) {
  const heroBar = useRef<HTMLDivElement>(null);
  const dockScroller = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const lockUntil = useRef(0);
  const [docked, setDocked] = useState(false);
  const first = links[0]?.targetId ?? null;
  const [active, setActive] = useState<string | null>(first);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const spy = useCallback(() => {
    const bar = heroBar.current;
    const offset = headerHeight();
    const isDocked = bar ? bar.getBoundingClientRect().bottom < offset + dockHeight() + 2 : false;
    setDocked(isDocked);
    const doc = document.documentElement;
    const range = doc.scrollHeight - window.innerHeight;
    if (progress.current) progress.current.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0})`;
    if (Date.now() < lockUntil.current) return;
    // While the hero tab bar itself is on screen the visitor is at the start of the page: the first tab is current.
    if (!isDocked) {
      setActive(first);
      return;
    }
    const line = offset + dockHeight() + 32;
    let current: string | null = null;
    for (const l of links) {
      const el = byId(l.targetId);
      if (el && el.getBoundingClientRect().top <= line) current = l.targetId;
    }
    const scrollable = range > 200;
    const atBottom = scrollable && window.innerHeight + window.scrollY >= doc.scrollHeight - 4;
    if (atBottom && current) {
      const last = [...links].reverse().find((l) => byId(l.targetId));
      if (last) current = last.targetId;
    }
    // Between the hero and the first section (e.g. an intro strip) the first section is still the current one.
    setActive(current ?? first);
  }, [links, first]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(spy);
    };
    frame = requestAnimationFrame(spy);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [spy]);

  // Edge fades that only appear on the side(s) where more tabs are hidden (mobile overflow affordance).
  useEffect(() => {
    const els = [heroBar.current, dockScroller.current].filter((e): e is HTMLDivElement => !!e);
    const update = (el: HTMLElement) => {
      const l = el.scrollLeft > 2;
      const r = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
      el.dataset.fade = l && r ? "both" : l ? "left" : r ? "right" : "none";
    };
    const handlers = els.map((el) => {
      const h = () => update(el);
      el.addEventListener("scroll", h, { passive: true });
      update(el);
      return [el, h] as const;
    });
    const onResize = () => els.forEach(update);
    window.addEventListener("resize", onResize);
    return () => {
      handlers.forEach(([el, h]) => el.removeEventListener("scroll", h));
      window.removeEventListener("resize", onResize);
    };
  }, [mounted]);

  // Keep the active tab visible inside the horizontally scrollable docked bar (mobile).
  useEffect(() => {
    const scroller = dockScroller.current;
    if (!scroller || !active) return;
    const btn = scroller.querySelector<HTMLElement>(`[data-target="${CSS.escape(active)}"]`);
    if (!btn) return;
    const left = btn.offsetLeft - (scroller.clientWidth - btn.offsetWidth) / 2;
    scroller.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  const go = useCallback((id: string) => {
    const el = byId(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = () => el.getBoundingClientRect().top + window.scrollY - headerHeight() - dockHeight() + 1;
    lockUntil.current = Date.now() + (reduce ? 120 : 1100);
    setActive(id);
    window.scrollTo({ top: target(), behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
    const settle = () => {
      const drift = target() - window.scrollY;
      if (Math.abs(drift) > 3) window.scrollTo({ top: target(), behavior: "auto" });
    };
    if (reduce) requestAnimationFrame(settle);
    else {
      let done = false;
      const once = () => {
        if (done) return;
        done = true;
        window.removeEventListener("scrollend", once);
        settle();
      };
      window.addEventListener("scrollend", once);
      window.setTimeout(once, 1000);
    }
  }, []);

  const toTop = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lockUntil.current = Date.now() + (reduce ? 120 : 1100);
    setActive(first);
    history.replaceState(null, "", window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [first]);
  const index = Math.max(0, links.findIndex((l) => l.targetId === active));
  const pad = (n: number) => String(n).padStart(2, "0");

  const tab = (l: AnchorLink, variant: "hero" | "dock") => {
    const on = active === l.targetId;
    return (
      <button
        key={l.targetId + l.label}
        type="button"
        data-target={l.targetId}
        aria-current={on ? "location" : undefined}
        tabIndex={variant === "dock" && !docked ? -1 : undefined}
        onClick={() =>
          // "Let's connect" opens the contact pop-up; the visitor stays where they are on the page.
          l.targetId === CONTACT_SECTION_ID ? openContactDialog({ atSection: true }) : go(l.targetId)
        }
        className={cn(
          "relative shrink-0 cursor-pointer whitespace-nowrap rounded-full font-heading font-semibold uppercase transition-[background-color,color,transform,box-shadow] duration-200 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 motion-reduce:hover:scale-100",
          variant === "hero"
            ? "px-4 py-2 text-[11.5px] tracking-[0.1em] xl:px-5 xl:py-2.5 xl:text-[12.5px] 3xl:px-6 3xl:text-[13.5px]"
            : // Docked: compact so every tab and the full page name fit on one line at desktop widths.
              "px-3.5 py-[7px] text-[11px] tracking-[0.07em] xl:px-3 2xl:px-3.5 2xl:text-[11.5px] 3xl:px-5 3xl:text-[12.5px] 3xl:tracking-[0.08em]",
          on
            ? "bg-brand-gradient text-white shadow-[0_8px_22px_-10px_rgba(255,120,0,0.9),inset_0_1px_0_rgba(255,255,255,0.22)]"
            : "text-white/75 hover:bg-white/10 hover:text-white",
        )}
      >
        {l.label}
      </button>
    );
  };

  return (
    <>
      <nav aria-label="On this page" className="absolute inset-x-0 bottom-5 flex justify-center px-gutter xl:bottom-7">
        <div
          ref={heroBar}
          data-fade="none"
          className="tab-scroller flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-black/45 p-1.5 ring-1 ring-white/15 backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {links.map((l) => tab(l, "hero"))}
        </div>
      </nav>
      {mounted ? createPortal(
      <nav
        aria-label="On this page (pinned)"
        aria-hidden={!docked}
        className={cn(
          "fixed inset-x-0 top-[72px] z-[150] border-b border-white/[0.08] bg-[#07090f]/85 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl max-sm:top-[64px] 3xl:top-[84px]",
          // Animate in when docking; disappear at once when the hero bar is back, so two bars never show together.
          docked
            ? "visible translate-y-0 opacity-100 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            : "pointer-events-none invisible -translate-y-3 opacity-0 transition-none",
        )}
      >
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
        <div className="relative mx-auto flex h-[52px] max-w-[1920px] items-center max-sm:h-12 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-5 xl:px-gutter">
          {/* Page name: full name on one line, or two short lines on narrower desktops; hidden rather than cut off. */}
          <div className="@container hidden min-w-0 xl:block">
            <div className="hidden min-w-0 items-center gap-2.5 @min-[130px]:flex">
              <span aria-hidden className="h-4 w-[3px] shrink-0 rounded-full bg-[linear-gradient(180deg,#ffa033,#ff7800_55%,#ec5a06)]" />
              <span title={title ?? undefined} className="line-clamp-2 font-heading text-[13px] font-semibold leading-[1.25] text-white/90 @max-[200px]:text-[12px] 3xl:text-[14px]">{title}</span>
            </div>
          </div>
          <div
            ref={dockScroller}
            data-fade="none"
            className="tab-scroller relative min-w-0 flex-1 overflow-x-auto px-gutter [scrollbar-width:none] xl:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <div className="mx-auto flex w-max items-center gap-0.5 3xl:gap-1">{links.map((l) => tab(l, "dock"))}</div>
          </div>
          <div className="@container hidden min-w-0 xl:block">
            <div className="hidden items-center justify-end gap-3 @min-[110px]:flex">
              <span className="font-heading text-[11px] font-semibold uppercase tabular-nums tracking-[0.14em] text-white/45 3xl:text-[12px]">
                <span className="sr-only">Section </span>
                <span className="text-white">{pad(index + 1)}</span>
                <span aria-hidden> / </span>
                <span className="sr-only"> of </span>
                {pad(links.length)}
              </span>
              <button
                type="button"
                onClick={toTop}
                tabIndex={docked ? undefined : -1}
                aria-label="Back to top"
                className="grid size-8 cursor-pointer place-items-center rounded-full text-white/70 ring-1 ring-white/15 transition-[background-color,color,transform] duration-200 hover:scale-[1.08] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 motion-reduce:hover:scale-100"
              >
                <ArrowUp aria-hidden className="size-4" />
              </button>
            </div>
          </div>
        </div>
        {/* Reading progress through the page. */}
        <span
          ref={progress}
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-brand via-[#ffb36b] to-brand will-change-transform [transform:scaleX(0)]"
        />
      </nav>,
      document.body,
      ) : null}
    </>
  );
}
