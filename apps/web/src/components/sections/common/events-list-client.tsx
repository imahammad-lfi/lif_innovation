"use client";

import { ArrowRight, ArrowUpRight, CalendarDays, CalendarPlus, Clock, MapPin, Sparkles, Ticket } from "lucide-react";

import { CmsImage } from "@/components/cms/cms-image";
import { DeckHeader, DeckStage } from "@/components/primitives/deck";
import { EventCountdown } from "@/components/primitives/event-countdown";
import { SmartLink } from "@/components/primitives/smart-link";
import { accentVars } from "@/lib/accent";
import type { EventItem } from "@/lib/content/types";
import {
  FORMAT_LABEL,
  daysUntil,
  eventDateLabel,
  eventDateTile,
  eventPhase,
  eventPlace,
  eventStandLabel,
  scheduleOf,
  splitEvents,
} from "@/lib/events";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

export type EventsListData = {
  anchorId?: string | null;
  pastAnchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  pastEyebrow?: string | null;
  pastHeading?: string | null;
  pastDescription?: string | null;
  emptyTitle?: string | null;
  emptyText?: string | null;
  showPast?: boolean | null;
  pastLimit?: number | null;
};

const PRIMARY =
  "hover-grow group inline-flex h-11 items-center gap-2 rounded-full bg-brand-gradient px-6 font-heading text-[13.5px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(255,120,0,0.8),inset_0_1px_0_rgba(255,255,255,0.22)] hover:brightness-110";
const SECONDARY =
  "hover-grow group inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 font-heading text-[13.5px] font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/[0.08]";
const CHIP = "inline-flex items-center rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1 font-sans text-[11px] font-medium text-white/75";

function StatusChip({ ev, now }: { ev: EventItem; now: number }) {
  const phase = eventPhase(ev, now);
  if (phase === "live")
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-3 py-1.5 font-heading text-[11.5px] font-semibold text-white shadow-lg">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/80 motion-reduce:hidden" />
          <span className="relative inline-flex size-2 rounded-full bg-white" />
        </span>
        Happening now
      </span>
    );
  const d = daysUntil(ev, now);
  const label = d <= 1 ? "Starts tomorrow" : d <= 60 ? `Starts in ${d} days` : "Coming up";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-3 py-1.5 font-heading text-[11.5px] font-semibold text-white shadow-lg">
      <Clock aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}

function DateTile({ ev, className }: { ev: EventItem; className?: string }) {
  const t = eventDateTile(ev);
  return (
    <div
      className={cn(
        "flex min-w-[76px] flex-col items-center rounded-2xl border border-white/15 bg-[#070b16]/80 px-3 py-2.5 text-center backdrop-blur-md",
        className,
      )}
    >
      <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">{t.month}</span>
      <span className="font-heading text-[20px] font-bold leading-tight tracking-[-0.02em] text-white">{t.day}</span>
      <span className="font-sans text-[12px] text-white/55">{t.year}</span>
    </div>
  );
}

function UpcomingCard({ ev, now }: { ev: EventItem; now: number }) {
  const stand = eventStandLabel(ev);
  const place = eventPlace(ev);
  const meet = ev.meetingCta?.href ? ev.meetingCta : { label: "Book a meeting", href: `/contact-us?interest=${ev.slug}#get-in-touch` };
  return (
    <article className="card-surface grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-[22px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]" style={accentVars("orange")}>
      <div className="relative aspect-[16/10] min-h-[240px] lg:aspect-auto">
        {ev.image ? (
          <CmsImage media={ev.image} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f1b3d,#1b2a5c)]" />
        )}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,22,0.15),rgba(7,11,22,0.75))]" />
        <div className="absolute left-4 top-4 xl:left-6 xl:top-6">
          <StatusChip ev={ev} now={now} />
        </div>
        {ev.logo ? (
          <div className="absolute right-4 top-4 flex h-14 w-[120px] items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-lg xl:right-6 xl:top-6">
            <div className="relative size-full">
              <CmsImage media={ev.logo} fill sizes="120px" className="object-contain" />
            </div>
          </div>
        ) : null}
        <DateTile ev={ev} className="absolute bottom-4 left-4 xl:bottom-6 xl:left-6" />
      </div>
      <div className="flex flex-col gap-5 p-6 xl:p-9">
        <div className="flex flex-wrap gap-2">
          {ev.category ? <span className={CHIP}>{ev.category}</span> : null}
          {ev.format ? <span className={CHIP}>{FORMAT_LABEL[ev.format] ?? ev.format}</span> : null}
          {ev.role ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#FFC21A]/40 bg-[#FFC21A]/10 px-2.5 py-1 font-sans text-[11px] font-semibold text-[#FFC21A]">
              <Sparkles aria-hidden className="size-3" />
              {ev.role}
            </span>
          ) : null}
        </div>
        <h3 className="font-heading text-[21.5px] font-semibold leading-[1.15] tracking-[-0.02em] text-white xl:text-[24px]">{ev.title}</h3>
        <ul className="grid gap-2.5 font-sans text-[13.5px] text-white/80">
          <li className="flex items-start gap-3">
            <CalendarDays aria-hidden className="mt-0.5 size-[18px] shrink-0 text-[#3D7BFF]" />
            <span>
              {eventDateLabel(ev)}
              {ev.timeLabel ? <span className="text-white/55"> · {ev.timeLabel}</span> : null}
            </span>
          </li>
          {place ? (
            <li className="flex items-start gap-3">
              <MapPin aria-hidden className="mt-0.5 size-[18px] shrink-0 text-[#FFC21A]" />
              <span>{place}</span>
            </li>
          ) : null}
          {stand ? (
            <li className="flex items-start gap-3">
              <Ticket aria-hidden className="mt-0.5 size-[18px] shrink-0 text-brand" />
              <span className="font-semibold text-white">{stand}</span>
            </li>
          ) : null}
        </ul>
        {ev.summary ? <p className="font-sans text-[14px] leading-[1.7] text-white/70">{ev.summary}</p> : null}
        <EventCountdown schedule={scheduleOf(ev)} className="max-w-[460px]" />
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
          <SmartLink href={meet.href!} className={PRIMARY}>
            {meet.label || "Book a meeting"}
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </SmartLink>
          {ev.detailLink?.href ? (
            <SmartLink href={ev.detailLink.href} newTab={ev.detailLink.openInNewTab} className={SECONDARY}>
              {ev.detailLink.label || "Event details"}
            </SmartLink>
          ) : null}
          <a href={`/api/calendar/${ev.slug}`} className={SECONDARY} download>
            <CalendarPlus aria-hidden className="size-4" />
            Add to calendar
          </a>
        </div>
        {ev.organiserUrl ? (
          <a
            href={ev.organiserUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1 font-sans text-[12.5px] text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Official event website
            <ArrowUpRight aria-hidden className="size-3.5" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

function PastCard({ ev }: { ev: EventItem }) {
  const place = eventPlace(ev);
  const link = ev.detailLink?.href ? ev.detailLink : null;
  return (
    <article className="card-surface group/past flex h-full flex-col overflow-hidden rounded-[20px]" style={accentVars("blue")}>
      <div className="relative aspect-[16/9] overflow-hidden">
        {ev.image ? (
          <CmsImage
            media={ev.image}
            fill
            sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw"
            className="object-cover saturate-[0.85] transition-transform duration-500 group-hover/past:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f1b3d,#1b2a5c)]" />
        )}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,22,0.05),rgba(7,11,22,0.7))]" />
        <span className="absolute left-4 top-4 rounded-full bg-[#070b16]/80 px-2.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur">
          Past event
        </span>
        <DateTile ev={ev} className="absolute bottom-3 left-3 min-w-[64px] px-2.5 py-1.5 [&>span:nth-child(2)]:text-[16.5px]" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="font-sans text-[12px] font-medium text-white/55">
          {[ev.category, place || (ev.format ? FORMAT_LABEL[ev.format] : null)].filter(Boolean).join(" · ")}
        </p>
        <h3 className="font-heading text-[18px] font-semibold leading-snug tracking-[-0.01em] text-white">{ev.title}</h3>
        {ev.role ? <p className="font-sans text-[12.5px] font-semibold text-[#FFC21A]">{ev.role}</p> : null}
        <p className="font-sans text-[13.5px] leading-[1.65] text-white/70">{ev.recap || ev.summary}</p>
        {link ? (
          <SmartLink
            href={link.href!}
            newTab={link.openInNewTab}
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-2 font-heading text-[13px] font-semibold text-white transition-colors hover:text-brand"
          >
            {link.label || "Read more"}
            {link.openInNewTab ? <ArrowUpRight aria-hidden className="size-4" /> : <ArrowRight aria-hidden className="size-4" />}
          </SmartLink>
        ) : null}
      </div>
    </article>
  );
}

export function EventsListClient({ data, events, serverNow }: { data: EventsListData; events: EventItem[]; serverNow: number }) {
  const now = useNow(serverNow);
  const { upcoming, past } = splitEvents(events, now);
  const pastList = past.slice(0, data.pastLimit || 9);
  return (
    <>
      <DeckStage id={data.anchorId || "upcoming-events"} tone="navy">
        <DeckHeader eyebrow={data.eyebrow} heading={data.heading} description={data.description} />
        <div className="mt-10 grid gap-8 xl:mt-14">
          {upcoming.length ? (
            upcoming.map((ev) => <UpcomingCard key={ev.slug} ev={ev} now={now} />)
          ) : (
            <div className="card-surface flex flex-col items-start gap-4 rounded-[22px] p-8 xl:flex-row xl:items-center xl:justify-between xl:p-10">
              <div className="max-w-[60ch]">
                <h3 className="font-heading text-[20px] font-semibold text-white">{data.emptyTitle || "New events will be announced soon"}</h3>
                {data.emptyText ? <p className="mt-2 font-sans text-[14px] leading-[1.7] text-white/70">{data.emptyText}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <SmartLink href="/contact-us#get-in-touch" className={PRIMARY}>
                  Let&rsquo;s connect
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </SmartLink>
                <SmartLink href="https://www.linkedin.com/company/linkfieldsinnovations" newTab className={SECONDARY}>
                  Follow us on LinkedIn
                  <ArrowUpRight aria-hidden className="size-4" />
                </SmartLink>
              </div>
            </div>
          )}
        </div>
      </DeckStage>
      {data.showPast !== false && pastList.length ? (
        <DeckStage id={data.pastAnchorId || "past-events"} tone="ink">
          <DeckHeader eyebrow={data.pastEyebrow} heading={data.pastHeading} description={data.pastDescription} />
          <div className={cn("mt-10 grid gap-6 md:grid-cols-2 xl:mt-14", pastList.length > 2 ? "xl:grid-cols-3" : "max-w-[1180px]")}>
            {pastList.map((ev) => (
              <PastCard key={ev.slug} ev={ev} />
            ))}
          </div>
        </DeckStage>
      ) : null}
    </>
  );
}
