import { eventsJsonLd, JsonLd } from "@/components/seo/json-ld";
import { contentClock, getEvents } from "@/lib/content";

import type { SectionProps } from "../types";
import type { EventsListData } from "./events-list-client";
import { EventsListClient } from "../lazy"; // code-split (see sections/lazy.tsx)

/** Upcoming and past events (Strapi › Event). The split is re-evaluated on the visitor's clock. */
export async function EventsList({ data }: SectionProps<EventsListData>) {
  const [events, serverNow] = await Promise.all([getEvents(), contentClock()]);
  return (
    <>
      {events.length ? <JsonLd data={eventsJsonLd(events)} /> : null}
      <EventsListClient data={data} events={events} serverNow={serverNow} />
    </>
  );
}
