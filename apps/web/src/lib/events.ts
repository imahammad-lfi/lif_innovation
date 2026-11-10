import type { EventItem, EventPromo, Link } from "@/lib/content/types";

/**
 * Event dates are calendar days. Day boundaries are evaluated in South African Standard Time (UTC+2),
 * where Linkfields is headquartered, so "the day after the event" means the next SAST calendar day.
 */
const OFFSET = "+02:00";
const DAY = 86_400_000;

const isoDay = (d: string) => d.slice(0, 10);
export const dayStart = (d: string) => Date.parse(`${isoDay(d)}T00:00:00${OFFSET}`);
export const dayEnd = (d: string) => Date.parse(`${isoDay(d)}T23:59:59.999${OFFSET}`);
export const lastDay = (e: Pick<EventItem, "startDate" | "endDate">) => e.endDate || e.startDate;
export const eventStart = (e: Pick<EventItem, "startDate">) => dayStart(e.startDate);
export const eventEnd = (e: Pick<EventItem, "startDate" | "endDate">) => dayEnd(lastDay(e));

function addDays(d: string, n: number) {
  const t = new Date(`${isoDay(d)}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}

export type EventPhase = "upcoming" | "live" | "past";
export function eventPhase(e: EventItem, now: number): EventPhase {
  if (now < eventStart(e)) return "upcoming";
  if (now <= eventEnd(e)) return "live";
  return "past";
}

/** Upcoming (incl. happening now) soonest first; past most recent first. */
export function splitEvents(list: EventItem[], now: number) {
  const upcoming = list.filter((e) => eventEnd(e) >= now).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = list.filter((e) => eventEnd(e) < now).sort((a, b) => b.startDate.localeCompare(a.startDate));
  return { upcoming, past };
}

/** Whole days until the event starts (0 = starts today or already running). */
export function daysUntil(e: EventItem, now: number) {
  return Math.max(0, Math.ceil((eventStart(e) - now) / DAY));
}

const fmt = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(new Date(`${isoDay(d)}T12:00:00Z`));

/** "17–19 November 2026", "30 October – 1 November 2026" or "17 November 2026" (an editor-set label wins). */
export function eventDateLabel(e: EventItem) {
  if (e.dateLabel) return e.dateLabel;
  const a = isoDay(e.startDate);
  const b = isoDay(lastDay(e));
  if (a === b) return fmt(a, { day: "numeric", month: "long", year: "numeric" });
  const sameYear = a.slice(0, 4) === b.slice(0, 4);
  const sameMonth = sameYear && a.slice(5, 7) === b.slice(5, 7);
  if (sameMonth) return `${fmt(a, { day: "numeric" })}–${fmt(b, { day: "numeric", month: "long", year: "numeric" })}`;
  return `${fmt(a, sameYear ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" })} – ${fmt(b, {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Short calendar tile parts, e.g. { day: "17–19", month: "Nov", year: "2026" }. */
export function eventDateTile(e: EventItem) {
  const a = isoDay(e.startDate);
  const b = isoDay(lastDay(e));
  const day = a === b ? fmt(a, { day: "numeric" }) : a.slice(0, 7) === b.slice(0, 7) ? `${fmt(a, { day: "numeric" })}–${fmt(b, { day: "numeric" })}` : fmt(a, { day: "numeric" });
  return { day, month: MONTHS[Number(a.slice(5, 7)) - 1], year: a.slice(0, 4) };
}

export function eventPlace(e: EventItem) {
  return [e.venue, e.city, e.country].filter(Boolean).join(", ");
}

export function eventStandLabel(e: Pick<EventItem, "stand">) {
  const s = e.stand?.trim();
  if (!s) return null;
  return /^(stand|booth|hall)\b/i.test(s) ? s : `Stand ${s}`;
}

export const FORMAT_LABEL: Record<string, string> = { "in-person": "In person", online: "Online", hybrid: "Hybrid" };

/** A pop-up with every gap filled from its event, plus the timestamps that drive it. */
export type ResolvedPromo = EventPromo & {
  promoId: string;
  slug: string;
  title: string;
  eventTitle: string;
  eventEndAt: number;
  showFromAt: number | null;
  hideAfterAt: number;
  /** Event dates and daily hours, for the live countdown. */
  schedule: EventSchedule;
};

const hasHref = (l?: Link | null): l is Link => Boolean(l?.href);

export function resolvePromo(e: EventItem): ResolvedPromo | null {
  const p = e.popup;
  if (!p?.enabled) return null;
  const end = lastDay(e);
  return {
    ...p,
    promoId: p.promoId || e.slug,
    slug: e.slug,
    title: p.title || e.title,
    eventTitle: e.title,
    dateLabel: p.dateLabel || eventDateLabel(e),
    venueLabel: p.venueLabel || eventPlace(e) || null,
    standLabel: p.standLabel || eventStandLabel(e),
    calendarStart: p.calendarStart || e.startDate,
    calendarEnd: p.calendarEnd || end,
    calendarLocation: p.calendarLocation || eventPlace(e) || null,
    calendarTitle: p.calendarTitle || e.title,
    primaryCta: hasHref(p.primaryCta) ? p.primaryCta : e.meetingCta,
    secondaryCta: hasHref(p.secondaryCta) ? p.secondaryCta : e.detailLink,
    followUpCta: hasHref(p.followUpCta) ? p.followUpCta : e.meetingCta,
    eventEndAt: eventEnd(e),
    schedule: scheduleOf(e),
    showFromAt: p.showFrom ? Date.parse(p.showFrom) : null,
    // Default expiry: the end of the day after the event finishes.
    hideAfterAt: p.hideAfter ? Date.parse(p.hideAfter) : dayEnd(addDays(end, 1)),
  };
}

/** live = before/during the event; followup = the day after (only when follow-up copy exists). */
export function promoMode(p: ResolvedPromo, now: number): "off" | "live" | "followup" {
  if (p.showFromAt && now < p.showFromAt) return "off";
  if (now > p.hideAfterAt) return "off";
  if (now > p.eventEndAt) return p.followUpTitle ? "followup" : "off";
  return "live";
}

/** End of the day after the event: the pop-up's default expiry and the last day the form offers a follow-up option. */
export const followUpEnd = (e: Pick<EventItem, "startDate" | "endDate">) => dayEnd(addDays(lastDay(e), 1));

/** Contact-form option value for an event, also used for ?interest=<slug> preselection. */
export const eventInterestValue = (e: Pick<EventItem, "title">) => `Event: ${e.title}`;

/* ------------------------------------------------------------------------------------------------
 * Daily hours and the live countdown.
 * Times are "HH:MM" in SAST (UTC+2), like the event dates. Without times a day runs 00:00–23:59,
 * so the countdown targets the start of the first day and "open" means "happening today".
 * ---------------------------------------------------------------------------------------------- */
export type EventSchedule = Pick<EventItem, "startDate" | "endDate" | "startTime" | "endTime" | "lastDayEndTime">;
export const scheduleOf = (e: EventSchedule): EventSchedule => ({
  startDate: e.startDate,
  endDate: e.endDate ?? null,
  startTime: e.startTime ?? null,
  endTime: e.endTime ?? null,
  lastDayEndTime: e.lastDayEndTime ?? null,
});

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const at = (day: string, time: string | null | undefined, fallback: string) =>
  Date.parse(`${isoDay(day)}T${time && HHMM.test(time) ? time : fallback}:00${OFFSET}`);

export type EventSession = { day: number; opens: number; closes: number };

/** One session per event day, with that day's opening and closing instants. */
export function eventSessions(e: EventSchedule): EventSession[] {
  const last = lastDay(e);
  const out: EventSession[] = [];
  for (let d = isoDay(e.startDate), i = 1; d <= isoDay(last) && i <= 60; d = addDays(d, 1), i++) {
    const isLast = d === isoDay(last);
    const close = isLast ? e.lastDayEndTime || e.endTime : e.endTime;
    out.push({ day: i, opens: at(d, e.startTime, "00:00"), closes: close && HHMM.test(close) ? at(d, close, "23:59") : dayEnd(d) });
  }
  return out;
}

export type Countdown =
  /** Before the first day opens. */
  | { kind: "before"; target: number; timed: boolean }
  /** During the event, outside opening hours (e.g. overnight): counting down to the next day. */
  | { kind: "between"; target: number; day: number; days: number }
  /** Open right now. */
  | { kind: "open"; day: number; days: number; closes: number; timed: boolean }
  | { kind: "over" };

export function countdownState(e: EventSchedule, now: number): Countdown {
  const sessions = eventSessions(e);
  if (!sessions.length) return { kind: "over" };
  const timed = Boolean(e.startTime && HHMM.test(e.startTime));
  const days = sessions.length;
  if (now < sessions[0].opens) return { kind: "before", target: sessions[0].opens, timed };
  for (const s of sessions) {
    if (now < s.opens) return { kind: "between", target: s.opens, day: s.day, days };
    if (now <= s.closes) return { kind: "open", day: s.day, days, closes: s.closes, timed };
  }
  return { kind: "over" };
}

/** Whole days, hours, minutes and seconds until `target`. */
export function splitDuration(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(t / 86_400), hours: Math.floor((t % 86_400) / 3600), minutes: Math.floor((t % 3600) / 60), seconds: t % 60 };
}

/** "18:00" style clock label for an instant, in SAST. */
export function sastTime(ms: number) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Johannesburg" }).format(ms);
}

/** "Tue 17 Nov" style day label for an instant, in SAST. */
export function sastDay(ms: number) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Johannesburg" }).format(ms);
}
