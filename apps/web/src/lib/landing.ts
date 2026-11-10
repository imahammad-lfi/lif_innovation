import { byId, visibleQuery } from "@/lib/dom";
/**
 * Section landing: put the start of a section just below the fixed chrome.
 *
 * The chrome is the fixed header (64 / 72 / 84 px by breakpoint) plus, on pages with an
 * "On this page" tab bar, the docked tab bar (49 / 53 px) that appears once the hero is scrolled past.
 * Used by in-page tabs, cross-page #hash links (menus, footer, content) and the contact pop-up.
 */
export const DOCK_H = 53;
export const DOCK_H_SM = 49;

export function headerHeight() {
  const header = document.querySelector("header");
  const bar = header?.firstElementChild;
  const h = bar instanceof HTMLElement ? bar.getBoundingClientRect().height : 0;
  if (h > 40 && h < 120) return h;
  const w = window.innerWidth;
  return w < 640 ? 64 : w >= 1561 ? 84 : 72;
}

export const dockHeight = () => (window.innerWidth < 640 ? DOCK_H_SM : DOCK_H);

/** Pages with an in-page tab bar dock it under the header as soon as a section below the hero is shown. */
// Rendered tabs only: a hidden background page (Next.js Activity) may still hold its own tab bars.
export const pageHasTabs = () =>
  Boolean(visibleQuery('nav[aria-label="On this page"]') || visibleQuery('nav[aria-label="On this page (pinned)"]'));

export const landingOffset = () => headerHeight() + (pageHasTabs() ? dockHeight() : 0);

/** Scroll position that puts `el`'s top edge flush with the bottom of the chrome. */
export function sectionScrollTop(el: Element) {
  return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - landingOffset() + 1));
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const USER_INPUT = ["wheel", "touchstart", "keydown", "mousedown"] as const;

/**
 * The landing currently holding a section in place. A landing on another section replaces it;
 * a landing on the same section (e.g. a route change to /page#id seen by two components) joins it.
 */
type Active = { id: string; cancel: () => void; join: (fn?: () => void) => void };
let active: Active | null = null;

/** Stop any landing in progress (e.g. the visitor changed the #hash or navigated). */
export function cancelLanding() {
  active?.cancel();
}

type LandOptions = {
  /** Smooth-scroll (in-page clicks). Cross-page arrivals jump instantly. Reduced motion always jumps. */
  smooth?: boolean;
  /** Called once the first scroll has finished (the section is in place). */
  onArrive?: () => void;
  /** Keep the section in place while late content (images, fonts, client sections) settles, ms. */
  settleMs?: number;
};

/**
 * Land on the element with `id`, then hold it in place for `settleMs` while the layout settles,
 * unless the visitor takes over (wheel, touch, key or mouse input), which stops the correction at once.
 * Returns a cancel function. Only one landing runs at a time, so an older one never drags the page
 * back to its section.
 */
export function landOn(id: string, { smooth = false, onArrive, settleMs = 2500 }: LandOptions = {}) {
  if (active && active.id === id) {
    active.join(onArrive);
    return active.cancel;
  }
  cancelLanding();
  const timers: number[] = [];
  let cancelled = false;
  let arrived = false;
  const arriveFns: (() => void)[] = onArrive ? [onArrive] : [];
  const off = () => USER_INPUT.forEach((ev) => window.removeEventListener(ev, cancel, true));
  const release = () => {
    if (active === me) active = null;
  };
  function cancel() {
    if (cancelled) return;
    cancelled = true;
    release();
    timers.forEach((t) => window.clearTimeout(t));
    window.removeEventListener("scrollend", firstStop);
    off();
  }
  const arrive = () => {
    if (arrived) return;
    arrived = true;
    arriveFns.splice(0).forEach((fn) => fn());
  };
  const join = (fn?: () => void) => {
    if (!fn) return;
    if (arrived) fn();
    else arriveFns.push(fn);
  };
  const me: Active = { id, cancel, join };
  active = me;
  const el = byId(id);
  if (!el) {
    release();
    arrive();
    return cancel;
  }
  const smoothNow = smooth && !reducedMotion();
  const jump = (behavior: ScrollBehavior) => {
    const target = byId(id);
    if (target) window.scrollTo({ top: sectionScrollTop(target), behavior });
  };
  const started = Date.now();
  const check = () => {
    if (cancelled) return;
    const target = byId(id);
    if (!target) return cancel();
    if (Math.abs(sectionScrollTop(target) - window.scrollY) > 3) jump("instant");
    arrive();
    if (Date.now() - started < settleMs) timers.push(window.setTimeout(check, 180));
    else {
      off();
      release();
    }
  };
  function firstStop() {
    window.removeEventListener("scrollend", firstStop);
    if (!cancelled) check();
  }
  // Listen for visitor input only after this tick, so the click that triggered the landing does not cancel it.
  timers.push(window.setTimeout(() => !cancelled && USER_INPUT.forEach((ev) => window.addEventListener(ev, cancel, { capture: true, passive: true })), 0));
  jump(smoothNow ? "smooth" : "instant");
  if (smoothNow && Math.abs(sectionScrollTop(el) - window.scrollY) > 2) {
    window.addEventListener("scrollend", firstStop);
    timers.push(window.setTimeout(firstStop, 1100));
  } else {
    timers.push(window.setTimeout(check, 60));
  }
  return cancel;
}
