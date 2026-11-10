"use client";

import { ArrowRight, CalendarDays, CalendarPlus, MapPin, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { useEffect, useRef, useState } from "react";

import { CmsImage } from "@/components/cms/cms-image";
import { EventCountdown } from "@/components/primitives/event-countdown";
import { SmartLink } from "@/components/primitives/smart-link";
import { promoMode, type ResolvedPromo } from "@/lib/events";
import { useFooterLift } from "@/lib/use-footer-lift";
import { cn } from "@/lib/utils";

type Phase = "off" | "open" | "pill";
// Dismissal lasts for the current visit only (sessionStorage): a returning visitor sees the pop-up again,
// so an event is never hidden for good by one click. Within a visit: closing the pop-up leaves the reminder
// pill (with the live countdown); closing the pill hides the promotion until the next visit.
const storageKey = (id: string) => `lf-promo-v2:${id}`;
const LEGACY_PREFIX = "lf-promo:";

function read(id: string): string | null {
  try {
    return window.sessionStorage.getItem(storageKey(id));
  } catch {
    return null;
  }
}
function write(id: string, v: "dismissed" | "closed") {
  try {
    window.sessionStorage.setItem(storageKey(id), v);
  } catch {
    /* private mode: fall back to in-memory state only */
  }
}
/** Earlier builds remembered dismissal permanently in localStorage; clear those flags once. */
function clearLegacy() {
  try {
    const ls = window.localStorage;
    for (let i = ls.length - 1; i >= 0; i -= 1) {
      const k = ls.key(i);
      if (k && k.startsWith(LEGACY_PREFIX)) ls.removeItem(k);
    }
  } catch {
    /* storage unavailable */
  }
}

function excluded(p: ResolvedPromo, pathname: string | null) {
  const list = (p.excludePaths || "").split(/[\s,]+/).filter(Boolean);
  const here = pathname || "/";
  return list.some((x) => here === x || here.startsWith(x.endsWith("/") ? x : `${x}/`));
}

type Active = { promo: ResolvedPromo; follow: boolean; key: string };

/**
 * Site-wide event pop-up (Strapi › Event › Pop-up).
 * Every screen size: an accessible pop-up after `delaySeconds` or once the visitor scrolls (a centred card on
 * tablets and desktops, a bottom sheet on phones), then a small reminder pill once it is closed.
 * It never interrupts an open menu, the "Let's connect" form or a focused field — it waits until the visitor is free.
 * The day after the event it switches to the follow-up message (reminder only, no interruption), then expires.
 * Dismissal is remembered per pop-up id for the current visit; nothing renders outside the window.
 */
export function EventPromoClient({ promos }: { promos: ResolvedPromo[] }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("off");
  const pillRef = useRef<HTMLDivElement>(null);
  // Rise above the footer bottom bar (copyright · legal · social) when it is on screen, like the back-to-top control.
  useFooterLift(pillRef, phase === "pill");
  const [active, setActive] = useState<Active | null>(null);

  useEffect(() => {
    let timer = 0;
    const cleanups: (() => void)[] = [];
    clearLegacy();
    const now = Date.now();
    const pick = promos
      .map((p) => ({ promo: p, mode: promoMode(p, now) }))
      .find((x) => x.mode !== "off" && !excluded(x.promo, pathname));
    const next: Active | null = pick
      ? { promo: pick.promo, follow: pick.mode === "followup", key: pick.mode === "followup" ? `${pick.promo.promoId}-followup` : pick.promo.promoId }
      : null;
    const set = (p: Phase) => {
      timer = window.setTimeout(() => {
        setActive(next);
        setPhase(p);
      }, 0);
    };
    if (!next) {
      set("off");
      return () => window.clearTimeout(timer);
    }
    const promo = next.promo;
    const state = read(next.key);
    // On the event's own page the details are already on screen: offer the countdown pill, not an interruption.
    const ownPage = (pathname || "/").replace(/\/+$/, "") === `/events/${promo.slug}`;
    if (state === "closed") set("off");
    else if (ownPage || state === "dismissed" || next.follow) set("pill");
    else {
      let done = false;
      let retry = 0;
      set("off");
      const open = () => {
        if (done || retry) return;
        // Never interrupt the visitor: wait while another dialog (menu drawer, "Let's connect" form) is open or a
        // form field has focus, then show the pop-up once they are free.
        if (document.querySelector('[role="dialog"][data-state="open"]') || document.activeElement?.matches("input, textarea, select, [contenteditable='true']")) {
          retry = window.setTimeout(() => {
            retry = 0;
            open();
          }, 1500);
          return;
        }
        done = true;
        setActive(next);
        setPhase("open");
      };
      const delay = window.setTimeout(open, Math.max(0, promo.delaySeconds ?? 4) * 1000);
      const onScroll = () => {
        if (window.scrollY > window.innerHeight * 0.6) open();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.clearTimeout(delay), () => window.clearTimeout(retry), () => window.removeEventListener("scroll", onScroll));
    }
    return () => {
      window.clearTimeout(timer);
      cleanups.forEach((f) => f());
    };
  }, [promos, pathname]);

  const dismiss = () => {
    if (active) write(active.key, "dismissed");
    setPhase("pill");
  };
  const closePill = () => {
    if (active) write(active.key, "closed");
    setPhase("off");
  };

  if (phase === "off" || !active) return null;

  const { promo, follow } = active;
  const title = (follow && promo.followUpTitle) || promo.title;
  const body = (follow && promo.followUpBody) || promo.body;
  const eyebrow = (follow && promo.followUpEyebrow) || promo.eyebrow;
  const primaryCta = follow ? promo.followUpCta : promo.primaryCta;
  const secondaryCta = follow ? { label: "See all events", href: "/events", openInNewTab: false } : promo.secondaryCta;
  const pillLabel = follow ? promo.followUpEyebrow || "Thank you for visiting us" : promo.pillLabel || promo.title;
  const calendarHref = !follow && promo.calendarStart ? `/api/calendar/${promo.slug}` : null;
  const highlight = promo.titleHighlight && title.includes(promo.titleHighlight) ? promo.titleHighlight : null;
  const [before, after] = highlight ? title.split(highlight) : [title, ""];
  const facts = follow
    ? []
    : [
        { icon: CalendarDays, text: promo.dateLabel, tone: "text-[#3D7BFF] bg-[#3D7BFF]/12 ring-[#3D7BFF]/30" },
        { icon: MapPin, text: promo.venueLabel, tone: "text-[#FFC21A] bg-[#FFC21A]/12 ring-[#FFC21A]/30" },
      ].filter((f) => f.text);
  const standRaw = follow ? null : promo.standLabel || null;
  const standIsStand = Boolean(standRaw && /^stand\s+/i.test(standRaw));
  const stand = standRaw ? standRaw.replace(/^stand\s+/i, "") : null;

  return (
    <>
      {phase === "pill" ? (
        <div
          ref={pillRef}
          data-event-promo="pill"
          className="fixed bottom-[calc(12px+var(--lift,0px))] left-3 right-[70px] z-[900] animate-in fade-in slide-in-from-bottom-2 duration-500 md:bottom-[calc(20px+var(--lift,0px))] md:left-5 md:right-auto"
        >
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0a1226]/90 py-2 pl-2 pr-1.5 md:gap-3 md:pr-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(61,123,255,0.15)] backdrop-blur-xl md:rounded-full md:pr-3">
            <button
              type="button"
              onClick={() => setPhase("open")}
              className="group flex min-w-0 flex-1 items-center gap-2.5 text-left outline-none md:gap-3"
              aria-haspopup="dialog"
            >
              {promo.badgeImage ? (
                <span className="relative size-9 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 md:size-10 md:rounded-full">
                  <CmsImage media={promo.badgeImage} alt="" fill sizes="40px" className="object-cover" />
                </span>
              ) : null}
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-heading text-[13.5px] font-semibold leading-[1.25] text-white">
                  <span className="md:hidden">{follow ? pillLabel : eyebrow || pillLabel}</span>
                  <span className="max-md:hidden">{pillLabel}</span>
                </span>
                <span className="truncate font-sans text-[11.5px] leading-[1.35] text-white/55">
                  <span className="md:hidden">
                    {follow ? (
                      promo.eventTitle
                    ) : (
                      <EventCountdown
                        schedule={promo.schedule}
                        variant="inline"
                        fallback={[promo.standLabel, promo.venueLabel?.split(",")[0]].filter(Boolean).join(" · ")}
                      />
                    )}
                  </span>
                  <span className="max-md:hidden">
                    {follow ? (
                      promo.eventTitle
                    ) : (
                      <>
                        <EventCountdown schedule={promo.schedule} variant="inline" fallback={promo.dateLabel} />
                        {promo.standLabel ? ` · ${promo.standLabel}` : null}
                      </>
                    )}
                  </span>
                </span>
              </span>
              <span className="ml-auto hidden shrink-0 items-center gap-1 rounded-full bg-brand-gradient px-2.5 py-1.5 font-heading text-[12px] font-semibold text-white transition-[filter] group-hover:brightness-110 max-md:inline-flex">
                {follow ? "Let\u2019s connect" : "Let\u2019s meet"}
              </span>
              <ArrowRight aria-hidden className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5 max-md:hidden" />
            </button>
            <button
              type="button"
              onClick={closePill}
              aria-label="Hide event reminder"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden className="size-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      <Dialog.Root open={phase === "open"} onOpenChange={(o) => (o ? setPhase("open") : dismiss())}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[1100] bg-[#03060f]/70 backdrop-blur-[6px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <Dialog.Content
            data-event-promo="dialog"
            className={cn(
              "fixed z-[1101] overflow-hidden border border-white/10 bg-[#070d1f] text-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] outline-none",
              "inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-3xl data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-6 data-[state=open]:fade-in-0",
              "md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[calc(100dvh-48px)] md:w-[min(940px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=open]:zoom-in-95",
            )}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_100%_0%,rgba(61,123,255,0.22),transparent_70%),radial-gradient(45%_40%_at_0%_100%,rgba(255,120,0,0.16),transparent_70%)]" />
            <div className="relative grid md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.25fr)]">
              {/* Visual + CEO quote */}
              <div className="relative hidden min-h-[560px] overflow-hidden md:block">
                {promo.image ? (
                  <CmsImage media={promo.image} alt={promo.quoteAuthor || ""} fill sizes="400px" className="object-cover object-[center_18%]" />
                ) : null}
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,13,31,0)_30%,rgba(7,13,31,0.72)_62%,#070d1f_96%)]" />
                <div aria-hidden className="absolute inset-y-0 right-0 w-16 bg-[linear-gradient(90deg,transparent,#070d1f)]" />
                {promo.quote ? (
                  <figure className="absolute inset-x-7 bottom-7">
                    <span aria-hidden className="font-heading text-[44px] font-bold leading-none text-[#FFC21A]">&ldquo;</span>
                    <blockquote className="-mt-3 font-heading text-[16.5px] font-medium leading-[1.45] text-white">{promo.quote}</blockquote>
                    <span aria-hidden className="mt-4 block h-[3px] w-20 rounded-full bg-[linear-gradient(90deg,#FFC21A,#FF7800,#3D7BFF)]" />
                    {promo.quoteAuthor ? (
                      <figcaption className="mt-3">
                        <span className="block font-heading text-[14.5px] font-semibold text-white">{promo.quoteAuthor}</span>
                        {promo.quoteRole ? <span className="block font-sans text-[12.5px] text-white/60">{promo.quoteRole}</span> : null}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : null}
              </div>

              {/* Message */}
              <div className="relative flex flex-col p-6 pt-5 max-md:pb-0 sm:p-8 md:p-10">
                <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-white/20 md:hidden" />
                <Dialog.Close
                  aria-label="Close"
                  className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/15 hover:text-white md:right-5 md:top-5"
                >
                  <X aria-hidden className="size-4" />
                </Dialog.Close>
                <div className="flex items-center gap-3 pr-12">
                  {promo.badgeImage ? (
                    <span className="relative h-[58px] w-[64px] shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 max-[380px]:h-[47px] max-[380px]:w-[52px]">
                      <CmsImage media={promo.badgeImage} alt={promo.badgeImage.alternativeText || ""} fill sizes="64px" className="object-cover" />
                    </span>
                  ) : null}
                  <div className="flex min-w-0 flex-col">
                    {promo.badgeLabel ? (
                      <span className="w-fit whitespace-nowrap rounded-full bg-[linear-gradient(90deg,#FFD66B,#F2B233)] px-2.5 py-[3px] font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-[#1b1203] max-[380px]:px-2 max-[380px]:tracking-[0.08em]">
                        {promo.badgeLabel}
                      </span>
                    ) : null}
                    {eyebrow ? (
                      <span className="mt-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand max-[380px]:tracking-[0.14em]">{eyebrow}</span>
                    ) : null}
                  </div>
                </div>
                <Dialog.Title className="mt-6 font-heading text-[28px] font-bold leading-[1.08] tracking-[-0.015em] text-white sm:text-[34px] md:text-[38px]">
                  {before}
                  {highlight ? (
                    <span className="bg-[linear-gradient(90deg,#FFC21A,#FF7800)] bg-clip-text text-transparent">{highlight}</span>
                  ) : null}
                  {after}
                </Dialog.Title>
                <Dialog.Description className="mt-4 font-sans text-[14.5px] leading-[1.65] text-white/70 md:text-[15px]">
                  {body}
                </Dialog.Description>
                {/* Phones: the CEO portrait and quote (the desktop photo column) as a compact card below the invitation. */}
                {promo.image || promo.quote ? (
                  <figure data-promo-portrait className="mt-5 flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 pr-4 md:hidden">
                    {promo.image ? (
                      <span className="relative aspect-[3/4] w-[clamp(78px,25vw,104px)] shrink-0 overflow-hidden rounded-xl shadow-[0_14px_30px_-14px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
                        <CmsImage media={promo.image} alt={promo.quoteAuthor || ""} fill sizes="104px" className="object-cover object-[center_20%]" />
                        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-[linear-gradient(90deg,#FFC21A,#FF7800,#3D7BFF)]" />
                      </span>
                    ) : null}
                    <div className="min-w-0">
                      {promo.quote ? (
                        <blockquote className="font-heading text-[14px] font-medium leading-[1.45] text-white/90">
                          <span aria-hidden className="text-[#FFC21A]">&ldquo;</span>
                          {promo.quote}
                          <span aria-hidden className="text-[#FFC21A]">&rdquo;</span>
                        </blockquote>
                      ) : null}
                      {promo.quoteAuthor ? (
                        <figcaption className={promo.quote ? "mt-2.5" : undefined}>
                          <span className="block font-heading text-[13.5px] font-semibold text-white">{promo.quoteAuthor}</span>
                          {promo.quoteRole ? <span className="block font-sans text-[12px] leading-[1.4] text-white/55">{promo.quoteRole}</span> : null}
                        </figcaption>
                      ) : null}
                    </div>
                  </figure>
                ) : null}
                {facts.length || stand ? (
                  <div className={cn("mt-6 grid gap-2.5", stand ? "grid-cols-[auto_minmax(0,1fr)]" : "")}>
                    {stand ? (
                      <div className="row-span-2 flex min-w-[118px] flex-col justify-center rounded-xl bg-[linear-gradient(140deg,#FF9A3D,#FF6A00_60%,#F05A00)] px-4 py-3 shadow-[0_12px_30px_-14px_rgba(255,120,0,0.8)] ring-1 ring-white/15">
                        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">Meet us at</span>
                        <span className="mt-0.5 font-heading text-[22px] font-bold leading-none tracking-[-0.01em] text-white">
                          {standIsStand ? `Stand ${stand}` : stand}
                        </span>
                      </div>
                    ) : null}
                    {facts.map(({ icon: Icon, text, tone }) => (
                      <div key={text} className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2">
                        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg ring-1", tone)}>
                          <Icon aria-hidden className="size-[15px]" />
                        </span>
                        <span className="font-sans text-[13px] font-medium leading-[1.35] text-white/85">{text}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {!follow ? <EventCountdown schedule={promo.schedule} className="mt-3" /> : null}
                {calendarHref ? (
                  <a
                    href={calendarHref}
                    download
                    className="mt-2 inline-flex h-10 items-center gap-2 self-start font-heading text-[13.5px] font-semibold text-white/75 transition-colors hover:text-[#FFC21A] md:hidden"
                  >
                    <CalendarPlus aria-hidden className="size-4" />
                    Add to calendar
                  </a>
                ) : null}
                {/* Phones: the actions stay pinned to the bottom of the sheet, so they are reachable without scrolling. */}
                <div
                  data-promo-actions
                  className={cn(
                    "sticky bottom-0 z-10 -mx-6 mt-4 grid gap-2.5 border-t border-white/[0.07] bg-[#070d1f]/95 px-6 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:-mx-8 sm:px-8",
                    primaryCta?.href && secondaryCta?.href ? "grid-cols-2" : "grid-cols-1",
                    "md:static md:mx-0 md:mt-auto md:flex md:flex-wrap md:items-center md:gap-3 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-8 md:backdrop-blur-none",
                  )}
                >
                  {primaryCta?.href ? (
                    <SmartLink
                      href={primaryCta.href}
                      onClick={dismiss}
                      className="hover-grow hover-swap group inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-gradient px-6 font-heading text-[14px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(255,120,0,0.8),inset_0_1px_0_rgba(255,255,255,0.22)] max-md:px-3 max-md:text-[13.5px]"
                    >
                      {primaryCta.label}
                      <ArrowRight aria-hidden className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 max-[380px]:hidden" />
                    </SmartLink>
                  ) : null}
                  {secondaryCta?.href ? (
                    <SmartLink
                      href={secondaryCta.href}
                      onClick={dismiss}
                      className="hover-grow hover-fill inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full px-5 font-heading text-[14px] font-semibold text-white ring-1 ring-white/20 hover:ring-transparent max-md:px-3 max-md:text-[13.5px]"
                    >
                      {secondaryCta.label}
                    </SmartLink>
                  ) : null}
                  {calendarHref ? (
                    <a
                      href={calendarHref}
                      download
                      className="inline-flex h-11 items-center gap-2 px-1 font-heading text-[13.5px] font-semibold text-white/75 transition-colors hover:text-[#FFC21A] max-md:hidden"
                    >
                      <CalendarPlus aria-hidden className="size-4" />
                      Add to calendar
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
