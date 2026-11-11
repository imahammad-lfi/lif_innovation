# Events and pop-ups: editor guide

This guide explains how to add an event to the website, promote it with a site-wide pop-up, and what happens automatically once the event is over. Everything is managed in the Strapi admin under **Content Manager › Event**. No developer is needed.

## What the website does automatically

| When | Events page (`/events`) | Pop-up and reminder | Contact form |
|---|---|---|---|
| Before the event | Listed under **Upcoming**, with a "Starts in N days" badge and a live "Doors open in" countdown | Pop-up opens on every visit after a short delay, with the same countdown; a small reminder pill ("Opens in 7d 20h 59m") stays in the corner after it is closed, and closing the pill hides the event until the next visit (mobile: a compact bottom banner, never a full-screen interruption). On the event's own page only the reminder pill shows, as the page already carries the details | Offers "Meet us at Africa Tech Festival 2026 (Stand I74)" as an area of interest |
| During the event | Still under **Upcoming**, marked **Happening now**; inside opening hours the countdown becomes "Open now · Day 1 of 3 · until 18:00 SAST", overnight it counts down to the next day's opening | Pop-up continues with the same live status | Unchanged |
| Day after the event ends | Moves to **Past events** | Pop-up stops; only the follow-up reminder ("Thank you, Cape Town") is shown | Offers "Follow-up from Africa Tech Festival 2026" |
| From 00:00 SAST on the second day after the event ends | Remains under **Past events** | Nothing is shown | Event option removed from the form |

Dates and times use South African time (SAST, UTC+2). The visitor's browser checks the dates every second, so the countdown and every switch happen on time even when pages are served from cache. The footer no longer carries an event card: events are promoted only by the pop-up, the reminder pill and the Events page, so the footer stays clean.

## Add a new upcoming event

1. Open **Content Manager › Event › Create new entry**.
2. Fill in at least **Title**, **Slug** (generated from the title), **Start date** and, for multi-day events, **End date**.
3. Recommended: **Category** (e.g. "Conference & exhibition"), **Format** (in person, online or hybrid), **Venue**, **City**, **Country**, **Role** (e.g. "Platinum Sponsor", "Exhibitor"), **Stand**, **Summary**, **Image** (16:9, at least 1600 px wide) and **Logo** (the event's logo).
4. Opening hours (for the live countdown), in SAST, 24-hour `HH:MM`: **Start time** (doors open each day, e.g. `09:00`), **End time** (doors close each day, e.g. `18:00`) and, if the last day closes earlier, **Last day end time** (e.g. `16:30`). **Time label** is the sentence shown on the event card, e.g. "Exhibition 09:00–18:00 SAST (until 16:30 on 19 November)". Without times, the countdown counts to midnight at the start of the first day and shows "Happening now" for the whole day.
5. Optional links: **Detail link** (an event page on our site), **Meeting CTA** (normally `/contact-us?interest=…` or `#get-in-touch`), **Organiser URL** (official event website).
6. After the event, add a short **Recap** so the card under Past events reads as a record of what we did.
7. Click **Publish**. The website refreshes within a few seconds.

## Promote an event with a pop-up

1. In the event entry, open the **Pop-up** component and switch **Enabled** on.
2. Give it a unique **Promo ID** (e.g. `atf-2026`). Visitors who close the pop-up will not see it again for that ID. Use a new ID if you want everyone to see a reworked pop-up.
3. Write the **Eyebrow**, **Title**, **Title highlight** (shown in brand orange), **Body**, and optionally a **Quote** with **Quote author** and **Quote role**.
4. Add an **Image** (portrait or square works best) and an optional **Badge image** (e.g. a sponsor badge) with a **Badge label**.
5. Set the **Primary CTA** (e.g. "Book a meeting") and, optionally, a **Secondary CTA** (e.g. "Plan your visit").
6. Leave **Date label**, **Venue label**, **Stand label** and the calendar fields empty to reuse the event's own details. Fill them only to override the wording.
7. Optional timing:
   - **Show from**: start showing the pop-up from this moment (default: as soon as it is published).
   - **Hide after**: stop earlier or later than the default (end of the day after the event).
   - **Delay seconds**: how long after page load the pop-up opens (default 4).
   - **Exclude paths**: one path per line where neither the pop-up nor the reminder pill appears. A path also covers the pages beneath it, so `/events` would cover every event page. Recommended: `/contact-us` only (as set for Africa Tech Festival 2026), so the pop-up never covers the contact form. You do not need to exclude the event's own page: it automatically shows only the reminder pill.
   - **How often visitors see it**: once per visit. "A visit" ends when the visitor closes the browser tab; the next visit shows the pop-up again until the event is over. Closing it is never permanent.
8. Follow-up (the day after the event): **Follow-up eyebrow**, **Follow-up title**, **Follow-up body** and **Follow-up CTA**, e.g. "Missed us at the stand? Let's connect."
9. Click **Publish**.

Only one pop-up is shown at a time. If several are live, the one whose event has the earliest start date wins.

## Checklist before publishing

- Dates are correct, and the end date is set for multi-day events.
- Opening hours match the organiser's published exhibition hours (Africa Tech Festival 2026: 09:00–18:00, closing 16:30 on 19 November, per the official FAQ).
- Images are licensed for our use and contain no unverified claims.
- Sponsor tiers, stand numbers and venue names match the organiser's official listing.
- The CTA links work (the **Add to calendar** button is generated automatically).

## Current events (seeded 9 November 2026)

| Event | Dates | Status | Pop-up |
|---|---|---|---|
| Africa Tech Festival 2026: Platinum Sponsor, Stand I74, CTICC Cape Town | 17–19 Nov 2026 | Upcoming | Enabled (`atf-2026`); follow-up on 20 Nov; off from 21 Nov |
| PitchXPO Conclave 2026 – Real Economy: supporting partner, global online | 28–29 Oct 2026 | Past | n/a |
| Odoo Experience 2026 (India): exhibitor, Booth E1 P6, Gandhinagar | 11–12 Sep 2026 | Past | n/a |

The short campaign link `/atf-2026` redirects to the event page and can be printed on stand material and QR codes.
