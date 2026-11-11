import { getEvents } from "@/lib/content";
import { resolvePromo, type ResolvedPromo } from "@/lib/events";

import { EventPromoClient } from "./event-promo-client";

/**
 * Site-wide event pop-up. Every published Event with an enabled Pop-up is a candidate; the client picks the
 * first one whose window contains "now", so cached pages still expire the pop-up on time.
 */
export async function EventPromo() {
  const events = await getEvents();
  const promos = events.map(resolvePromo).filter((p): p is ResolvedPromo => Boolean(p));
  if (!promos.length) return null;
  return <EventPromoClient promos={promos} />;
}
