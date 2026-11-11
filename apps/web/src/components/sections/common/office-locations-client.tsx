"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, MapPin, Navigation } from "lucide-react";

import type { Office } from "@/lib/content/types";
import { accentVars } from "@/lib/accent";
import { directionsUrl, mapEmbedUrl, mapSearchUrl, officeLines, officeSlug } from "@/lib/offices";
import { cn } from "@/lib/utils";

/** Remembers (on this device) that the visitor chose to load Google Maps. */
const MAPS_KEY = "lf-maps-consent";
const MAPS_EVENT = "lf-maps-consent";
const subscribeConsent = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener(MAPS_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(MAPS_EVENT, cb);
  };
};
const readConsent = () => {
  try {
    return window.localStorage.getItem(MAPS_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Office cards (select one to move the map) beside a dark-styled Google map. No phone numbers by design.
 *
 * Privacy: Google Maps sets its own cookies, so the map is click-to-load. Until the visitor chooses "Show map"
 * Google is never contacted; the choice is remembered on this device, after which the map loads as the section
 * approaches the viewport. "Open in Google Maps" and the Directions links work without loading the embed.
 */
export function OfficeLocationsClient({ offices, showMap = true }: { offices: Office[]; showMap?: boolean }) {
  const [active, setActive] = useState(() => Math.max(0, offices.findIndex((o) => o.isHeadquarters)));
  const [near, setNear] = useState(false);
  const remembered = useSyncExternalStore(subscribeConsent, readConsent, () => false);
  const [chosen, setChosen] = useState(false);
  const mapOn = (remembered || chosen) && near;
  const allowMap = () => {
    setChosen(true);
    setNear(true);
    try {
      window.localStorage.setItem(MAPS_KEY, "1");
      window.dispatchEvent(new Event(MAPS_EVENT));
    } catch {
      /* private mode: the choice simply lasts for this page view */
    }
  };
  const root = useRef<HTMLDivElement>(null);
  const mapBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMap || !root.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(root.current);
    return () => io.disconnect();
  }, [showMap]);

  const select = (i: number) => {
    setActive(i);
    // Phones: the map sits above the list, so bring it into view after choosing an office.
    if (showMap && window.matchMedia("(max-width: 1023px)").matches && mapBox.current) {
      const r = mapBox.current.getBoundingClientRect();
      if (r.top < 120 || r.bottom > window.innerHeight) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: window.scrollY + r.top - 140, behavior: reduce ? "auto" : "smooth" });
      }
    }
  };

  const current = offices[active] ?? offices[0];
  if (!current) return null;

  return (
    <div ref={root} className={cn("mt-10 grid gap-6 xl:mt-12 xl:gap-8", showMap && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]")}>
      {showMap ? (
        <div ref={mapBox} className="lg:order-2">
          <div
            style={accentVars(current.accent)}
            className="relative overflow-hidden rounded-2xl bg-[#0b1020] ring-1 ring-white/10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] lg:sticky lg:top-[150px]"
          >
            <div className="relative aspect-[4/3] min-h-[300px] w-full sm:aspect-[16/10] lg:aspect-auto lg:h-[460px] 3xl:h-[520px]">
              {mapOn ? (
                <iframe
                  key={officeSlug(current)}
                  title={`Map: Linkfields ${current.country}`}
                  src={mapEmbedUrl(current)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="absolute inset-0 size-full border-0 [filter:invert(92%)_hue-rotate(180deg)_saturate(0.65)_brightness(0.92)_contrast(0.92)]"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[radial-gradient(60%_60%_at_50%_45%,rgba(255,120,0,0.12),transparent_70%)] p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative placeholder */}
                  <img src="/maps/world-dots.svg" alt="" aria-hidden className="pointer-events-none absolute w-[85%] opacity-20" />
                  <div className="relative flex max-w-[380px] flex-col items-center text-center">
                    <span aria-hidden className="grid size-11 place-items-center rounded-full bg-brand-gradient text-white shadow-[0_10px_30px_-10px_rgba(255,120,0,0.7)]">
                      <MapPin className="size-5" />
                    </span>
                    <p className="mt-4 font-heading text-[15.5px] font-semibold text-white">Linkfields {current.country}</p>
                    <p className="mt-2 font-sans text-[12.5px] leading-[1.6] text-white/70">
                      The interactive map is provided by Google Maps. Loading it shares your IP address with Google, which may set its own cookies.
                    </p>
                    <button type="button" onClick={allowMap} className="btn-primary mt-5 h-11 px-6 text-[13.5px]">
                      Show map
                    </button>
                    <p className="mt-3 font-sans text-[12px] text-white/55">We&rsquo;ll remember this choice on this device.</p>
                  </div>
                </div>
              )}
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,var(--acc),transparent_80%)]" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/[0.08] bg-[#0b1020]/95 px-4 py-3 backdrop-blur sm:px-5">
              <p className="flex min-w-0 items-center gap-2 font-heading text-[13.5px] font-semibold text-white">
                <MapPin aria-hidden className="size-4 shrink-0 text-[var(--acc)]" />
                <span className="truncate">
                  Linkfields {current.country}
                  {current.role ? <span className="font-sans font-normal text-white/55"> · {current.role}</span> : null}
                </span>
              </p>
              <a
                href={mapSearchUrl(current)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-grow inline-flex items-center gap-1.5 font-heading text-[12.5px] font-semibold text-[var(--acc)]"
              >
                Open in Google Maps
                <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <ul className="grid content-start gap-3 sm:grid-cols-2 lg:order-1">
        {offices.map((o, i) => {
          const on = i === active;
          return (
            <li
              key={officeSlug(o)}
              id={`office-${officeSlug(o)}`}
              style={accentVars(o.accent)}
              className={cn(
                "acc-tile group/tile relative flex flex-col overflow-hidden rounded-2xl bg-[#0b1020] transition-[box-shadow,transform] duration-300",
                on && "shadow-[0_0_0_1.5px_var(--acc),0_18px_40px_-22px_var(--acc)]",
              )}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,var(--acc),transparent_80%)]" />
              <button
                type="button"
                onClick={() => select(i)}
                aria-pressed={showMap ? on : undefined}
                disabled={!showMap}
                className="flex flex-1 cursor-pointer flex-col items-start gap-2 px-4 pb-2 pt-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--acc)] disabled:cursor-default sm:px-5 sm:pt-5"
              >
                <span className="flex w-full items-center gap-2">
                  <span aria-hidden className="size-2 shrink-0 rounded-full bg-[var(--acc)] shadow-[0_0_10px_var(--acc)]" />
                  <span className="font-heading text-[14.5px] font-semibold leading-[1.3] text-white 3xl:text-[14.5px]">{o.country}</span>
                  {o.isHeadquarters ? (
                    <span className="ml-auto rounded-full bg-brand-gradient px-2 py-0.5 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-white">HQ</span>
                  ) : null}
                </span>
                {o.role ? <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--acc)]">{o.role}</span> : null}
                <address className="font-sans text-[12.5px] not-italic leading-[1.55] text-white/65 3xl:text-[13.5px]">
                  {officeLines(o).map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
              </button>
              <a
                href={directionsUrl(o)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Directions to Linkfields ${o.country} (opens Google Maps)`}
                className="hover-grow mx-4 mb-4 mt-1 inline-flex w-fit origin-left items-center gap-1.5 font-heading text-[12px] font-semibold text-[var(--acc)] sm:mx-5 sm:mb-5"
              >
                <Navigation aria-hidden className="size-3.5" />
                Directions
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
