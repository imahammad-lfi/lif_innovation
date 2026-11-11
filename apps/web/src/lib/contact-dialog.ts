import { byId } from "@/lib/dom";
/**
 * Site-wide "Let's connect" pop-up.
 *
 * A "Let's connect" link still takes the visitor where it points, and the form pops up on arrival:
 * - links to the contact page (header CTA, banners, event "Book a meeting") open the Contact page,
 *   then the pop-up; closing it leaves the visitor on the Contact page (or its form section when the
 *   link carries `#get-in-touch`);
 * - links to the on-page contact section (`#get-in-touch`, the docked "Let's connect" tab) scroll to
 *   the "Let's connect" section of the current page, then the pop-up; closing it leaves them there.
 * Plain "Contact us" navigation (menus, footer) just opens the contact page, without a pop-up.
 * Any client component can trigger it with `openContactDialog()`; links are picked up by the host
 * in `components/layout/contact-dialog.tsx`.
 */
export const CONTACT_DIALOG_EVENT = "lf:contact-dialog";
export const CONTACT_SECTION_ID = "get-in-touch";
export const CONTACT_PAGE = "/contact-us";

export type ContactDialogDetail = { interest?: string | null; atSection?: boolean };

export function openContactDialog(detail: ContactDialogDetail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ContactDialogDetail>(CONTACT_DIALOG_EVENT, { detail }));
}

const LETS_CONNECT = /^\s*let[\u2019'`]?s\s+connect\b/i;

export type ContactAction =
  | { kind: "none" }
  /** Scroll to the contact section of the current page, then open the pop-up. */
  | { kind: "section"; interest: string | null }
  /** Navigate to `href` (the contact page), then open the pop-up there. */
  | { kind: "page"; interest: string | null; href: string };

const NONE: ContactAction = { kind: "none" };

/** What a click on `el` should do with respect to the contact pop-up. */
export function contactAction(el: Element, here: Location): ContactAction {
  if (el.closest("[data-contact-ignore]")) return NONE;
  const hasSection = () => Boolean(byId(CONTACT_SECTION_ID));
  const explicit = el.getAttribute("data-contact-dialog");
  if (explicit !== null) {
    const interest = explicit || null;
    return hasSection() ? { kind: "section", interest } : { kind: "page", interest, href: CONTACT_PAGE };
  }
  if (!(el instanceof HTMLAnchorElement)) return NONE;
  if (el.target && el.target !== "_self") return NONE;
  if (el.hasAttribute("download")) return NONE;
  const raw = el.getAttribute("href");
  if (!raw) return NONE;
  let url: URL;
  try {
    url = new URL(raw, here.href);
  } catch {
    return NONE;
  }
  if (url.origin !== here.origin) return NONE;
  const sectionHash = url.hash === `#${CONTACT_SECTION_ID}`;
  const interest = url.searchParams.get("interest");
  const text = (el.textContent || el.getAttribute("aria-label") || "").trim();

  // Same-page link to the contact section.
  if (sectionHash && url.pathname === here.pathname) {
    return hasSection() ? { kind: "section", interest } : { kind: "page", interest, href: CONTACT_PAGE };
  }
  // Link to the contact page: only "Let's connect", campaign (?interest=) and section links pop up.
  const toContactPage = url.pathname === CONTACT_PAGE && (!url.hash || sectionHash);
  if (!toContactPage || !(sectionHash || interest || LETS_CONNECT.test(text))) return NONE;
  if (here.pathname === CONTACT_PAGE) return { kind: "section", interest };
  return { kind: "page", interest, href: `${url.pathname}${url.search}${url.hash}` };
}

/* Hand-over between the page the visitor clicked on and the contact page they arrive at. */
const PENDING_KEY = "lf:contact-pending";
const PENDING_TTL = 20_000;
type Pending = { path: string; interest: string | null; at: number };

export function setPendingContact(path: string, interest: string | null) {
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify({ path, interest, at: Date.now() } satisfies Pending));
  } catch {
    /* storage unavailable: the visitor still reaches the contact page and its inline form */
  }
}

/** Returns (and clears) a fresh pending request for `pathname`, if any. */
export function takePendingContact(pathname: string): Pending | null {
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Pending;
    if (Date.now() - p.at > PENDING_TTL) {
      window.sessionStorage.removeItem(PENDING_KEY);
      return null;
    }
    if (p.path !== pathname) return null;
    window.sessionStorage.removeItem(PENDING_KEY);
    return p;
  } catch {
    return null;
  }
}
