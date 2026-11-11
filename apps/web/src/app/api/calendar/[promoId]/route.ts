import { getEvents } from "@/lib/content";
import { env } from "@/lib/env";
import { eventEnd, eventPlace, eventStandLabel, lastDay, resolvePromo } from "@/lib/events";
import { eventIcs } from "@/lib/ics";

/**
 * GET /api/calendar/<event slug or pop-up id> → all-day .ics invitation for an upcoming event (Strapi › Event).
 * Past events return 404 so stale "Add to calendar" links fail cleanly.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/calendar/[promoId]">) {
  const { promoId: id } = await ctx.params;
  const events = await getEvents();
  const ev = events.find((e) => e.slug === id || e.popup?.promoId === id);
  if (!ev || eventEnd(ev) < Date.now()) return new Response("Not found", { status: 404 });

  const promo = resolvePromo(ev);
  const stand = eventStandLabel(ev);
  const href = ev.detailLink?.href || "/events";
  const url = href.startsWith("/") ? `${env.siteUrl}${href}` : href;
  const title =
    promo?.calendarTitle && promo.calendarTitle !== ev.title
      ? promo.calendarTitle
      : `Meet Linkfields at ${ev.title}${stand ? ` (${stand})` : ""}`;
  const ics = eventIcs({
    uid: promo?.promoId || ev.slug,
    title,
    start: promo?.calendarStart || ev.startDate,
    end: promo?.calendarEnd || lastDay(ev),
    location: promo?.calendarLocation || eventPlace(ev) || null,
    description: [ev.summary, [stand, ev.timeLabel].filter(Boolean).join(" · "), url].filter(Boolean).join("\n\n"),
    url,
  });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${ev.slug}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
