"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { contactAction } from "@/lib/contact-dialog";
import { cancelLanding, landingOffset, landOn } from "@/lib/landing";
import { byId } from "@/lib/dom";

const idFromHash = (hash: string) => {
  try {
    return decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return hash.replace(/^#/, "");
  }
};

/**
 * Lands every "#section" link at the start of its section, just below the header and docked tabs:
 * direct visits (/page#section), menu, footer and content links to another page, and same-page links.
 * In-page tab clicks and the contact pop-up are handled by their own components.
 */
export function HashLanding() {
  const pathname = usePathname();

  // Native jumps (and the browser's own find-in-page) use the same offset via scroll-padding-top.
  useEffect(() => {
    const set = () => document.documentElement.style.setProperty("--landing-offset", `${landingOffset()}px`);
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, [pathname]);

  // Direct visits and every route change that carries a #hash (link clicks, router.push, back/forward).
  useEffect(() => {
    const id = idFromHash(window.location.hash);
    if (!id) return;
    let cancel: (() => void) | null = null;
    let raf = 0;
    const started = Date.now();
    const wait = () => {
      if (byId(id)) cancel = landOn(id);
      else if (Date.now() - started < 8000) raf = window.requestAnimationFrame(wait);
    };
    wait();
    return () => {
      window.cancelAnimationFrame(raf);
      cancel?.();
    };
  }, [pathname]);

  // Hash-only changes on the same page (address-bar edits, back/forward between sections):
  // the route does not change, so land here. A change to a URL without a hash just stops any landing.
  useEffect(() => {
    let raf = 0;
    const onHash = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        if (window.location.pathname !== pathname) return; // a route change: the effect above handles it
        const id = idFromHash(window.location.hash);
        if (id && byId(id)) landOn(id);
        else cancelLanding();
      });
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, [pathname]);

  useEffect(() => {
    let cancel: (() => void) | null = null;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.hash.length < 2) {
        // A link to the page already shown (footer logo on Home, "Explore Services" on /services): the router keeps
        // the scroll position, so take the visitor back to the top instead of appearing to do nothing.
        const raw = a.getAttribute("href") ?? "";
        if (raw.startsWith("#") || url.pathname !== window.location.pathname || url.search !== window.location.search) return;
        if (contactAction(a, window.location).kind !== "none") return; // the contact pop-up handles these
        e.preventDefault();
        cancel?.();
        if (window.location.hash) window.history.pushState(null, "", `${url.pathname}${url.search}`);
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        return;
      }
      if (contactAction(a, window.location).kind !== "none") return; // the contact pop-up handles these
      const id = idFromHash(url.hash);
      if (url.pathname === window.location.pathname) {
        if (!byId(id)) return;
        e.preventDefault(); // stop the router's own jump; we scroll with the right offset
        cancel?.();
        if (url.hash !== window.location.hash) window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
        cancel = landOn(id, { smooth: true });
        return;
      }
      // Another page: the router navigates and the route-change effect above lands on the section.
    };
    // Capture phase: runs before the router's link handler, so same-page jumps are ours alone.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      cancel?.();
    };
  }, []);

  return null;
}
