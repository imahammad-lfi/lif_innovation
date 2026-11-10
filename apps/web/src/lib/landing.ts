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

/** Space kept between the chrome and the section's content when landing. */
const LAND_BREATH = 24;
/** Lowest the heading may sit under the chrome when the page moves up to keep a card row off-screen whole. */
const LAND_MAX_GAP = 150;
/** Card-like blocks inside a section that should never be left half visible at the bottom of the screen. */
const LAND_CARDS = "[data-land-card], .card-surface, .acc-tile";

const docRect = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, visible: r.width > 0 && r.height > 0 };
};

/**
 * Scroll position for landing on a section (tabs, menu/footer #links, contact pop-up). Fits the section to the
 * screen instead of using a fixed offset:
 * 1. the section's empty top padding is skipped, so its heading sits LAND_BREATH px below the chrome;
 * 2. if a card row is then cut by the bottom of the screen, the page moves down just far enough to show it in
 *    full while the section heading stays below the chrome; if that is not possible, it moves up a little (the
 *    heading at most LAND_MAX_GAP px under the chrome) so the row starts whole below the fold.
 * Computed in document coordinates only, so repeated calls (the landing re-checks while late layout settles)
 * return the same value wherever the page is currently scrolled.
 */
export function sectionScrollTop(el: Element) {
  const chrome = landingOffset();
  const sec = docRect(el);
  const pad = el instanceof HTMLElement ? parseFloat(getComputedStyle(el).paddingTop) || 0 : 0;
  let top = sec.top - chrome + 1 + Math.max(0, pad - LAND_BREATH);

  const view = window.innerHeight;
  if (view - chrome > 240) {
    const heading = el.querySelector("h2, h3");
    const headTop = heading ? docRect(heading).top : sec.top + pad;
    // Down: furthest the page may move while the heading stays fully visible (4 px under the chrome).
    const maxTop = Math.max(top, headTop - chrome - 4);
    // Up: the heading may sit lower, at most LAND_MAX_GAP px under the chrome (above it the previous section shows).
    const minTop = Math.min(top, headTop - chrome - LAND_MAX_GAP);
    const fold = top + view;
    let down = top;
    let rowTop = Infinity;
    for (const card of el.querySelectorAll(LAND_CARDS)) {
      if (card.parentElement?.closest(LAND_CARDS)) continue; // nested card: its outer card decides
      const r = docRect(card);
      if (!r.visible || r.top < headTop || r.top >= fold || r.bottom <= fold) continue;
      down = Math.max(down, r.bottom - view + 4);
      rowTop = Math.min(rowTop, r.top);
    }
    if (down > top) {
      if (down <= maxTop) top = down; // the cut row fits once the page moves down a little: show it in full
      else if (rowTop - view - 4 >= minTop) top = rowTop - view - 4; // else start that row below the fold
    }
  }
  return Math.max(0, Math.round(top));
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
