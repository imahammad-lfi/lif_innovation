/**
 * Id lookups that ignore pages Next.js keeps alive in the background.
 *
 * Next.js 16 preserves recently visited routes in a hidden React <Activity> (display: none) so Back/Forward is
 * instant. Their DOM stays in the document, so ids shared by many pages (`get-in-touch`, `overview`, `hero-0` …)
 * can exist twice and `document.getElementById` may return the hidden copy (rect = 0 → wrong landing, wrong
 * scroll-spy, pop-up anchored to an invisible section). `byId` returns the copy that is actually rendered.
 */
export function byId(id: string | null | undefined): HTMLElement | null {
  if (!id || typeof document === "undefined") return null;
  const first = document.getElementById(id);
  if (!first || first.getClientRects().length) return first;
  const all = document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`);
  for (const el of all) if (el.getClientRects().length) return el;
  return null;
}

/** First rendered element matching a selector (same reasoning as `byId`). */
export function visibleQuery<T extends Element = HTMLElement>(selector: string): T | null {
  if (typeof document === "undefined") return null;
  for (const el of document.querySelectorAll<T>(selector)) if (el.getClientRects().length) return el;
  return null;
}
