import { ArrowRight } from "lucide-react";
import { DeckHeader, DeckStage } from "@/components/primitives/deck";
import { SmartLink } from "@/components/primitives/smart-link";
import { accentVars } from "@/lib/accent";
import type { Accent } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import type { SectionProps } from "../types";

type Location = { name: string; role?: string | null; lat?: number | string | null; lng?: number | string | null; hq?: boolean | null; accent?: Accent | null };
type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  locations?: Location[] | null;
  strip?: string | null;
  variant?: "full" | "compact" | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

/** Equirectangular frame shared with /maps/world-dots.svg: x = lng + 180, y = 80 - lat (latitudes 80 to -60). */
const W = 360;
const H = 140;
const project = (lat: number, lng: number) => ({ x: lng + 180, y: 80 - lat });
const CYCLE: Accent[] = ["blue", "yellow", "teal", "purple", "orange"];

/** Dotted world map with the headquarters, delivery and market locations, linked by animated arcs. */
export function GlobalPresence({ data }: SectionProps<Data>) {
  const locs = (data.locations ?? [])
    .filter((l) => l?.name && l.lat != null && l.lng != null)
    .map((l, i) => {
      const lat = Number(l.lat);
      const lng = Number(l.lng);
      return { ...l, lat, lng, ...project(lat, lng), accent: (l.hq ? "orange" : l.accent || CYCLE[i % CYCLE.length]) as Accent };
    });
  const hq = locs.find((l) => l.hq) ?? locs[0];
  const strip = (data.strip ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const compact = data.variant === "compact";
  const cta = data.ctaUrl ? (
    <SmartLink href={data.ctaUrl} className="group/cta inline-flex items-center gap-2 font-heading text-[13.5px] font-semibold text-brand hover:text-[#ff9a3d]">
      {data.ctaLabel || "Find your regional contact"}
      <ArrowRight aria-hidden className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
    </SmartLink>
  ) : null;
  return (
    <DeckStage id={data.anchorId}>
      <DeckHeader eyebrow={data.eyebrow} heading={data.heading} description={data.description} aside={cta} />
      <div className={cn("mt-10 grid items-center gap-8 xl:mt-12 xl:gap-12", compact ? "lg:grid-cols-1" : "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)]")}>
        <div className="relative w-full min-w-0" style={{ aspectRatio: `${W} / ${H}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static decorative SVG */}
          <img src="/maps/world-dots.svg" alt="" aria-hidden className="absolute inset-0 size-full opacity-[0.32]" />
          <svg aria-hidden viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <defs>
              <linearGradient id="lf-arc" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#FF7800" />
                <stop offset="1" stopColor="#6E9BFF" />
              </linearGradient>
            </defs>
            {hq
              ? locs
                  .filter((l) => l !== hq)
                  .map((l) => {
                    const dx = l.x - hq.x;
                    const dy = l.y - hq.y;
                    const dist = Math.hypot(dx, dy);
                    const cx = (hq.x + l.x) / 2;
                    const cy = (hq.y + l.y) / 2 - dist * 0.32;
                    return (
                      <path
                        key={l.name}
                        d={`M ${hq.x} ${hq.y} Q ${cx} ${cy} ${l.x} ${l.y}`}
                        fill="none"
                        stroke="url(#lf-arc)"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                        strokeDasharray="3 5"
                        vectorEffect="non-scaling-stroke"
                        className="lf-arc opacity-70"
                      />
                    );
                  })
              : null}
          </svg>
          {locs.map((l) => {
            const below = locs.some((o) => o !== l && Math.abs(o.x - l.x) < 25 && Math.abs(o.y - l.y) < 15 && o.lat > l.lat);
            return (
              <div
                key={l.name}
                style={{ left: `${(l.x / W) * 100}%`, top: `${(l.y / H) * 100}%`, ...accentVars(l.accent) }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              >
                <span className="relative flex size-3.5 items-center justify-center xl:size-4">
                  <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[var(--acc)] opacity-50 motion-reduce:hidden" />
                  <span className={cn("relative rounded-full bg-[var(--acc)] shadow-[0_0_16px_var(--acc)]", l.hq ? "size-3.5 ring-2 ring-white/80 xl:size-4" : "size-2.5 xl:size-3")} />
                </span>
                <span
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0c111d]/90 px-2.5 py-1 font-sans text-[11px] font-semibold text-white ring-1 ring-[var(--acc-line)] backdrop-blur max-sm:hidden xl:text-[11px]",
                    below ? "top-[calc(100%+6px)]" : "bottom-[calc(100%+6px)]",
                  )}
                >
                  {l.name}
                </span>
              </div>
            );
          })}
        </div>
        {compact ? (
          <ul aria-label="Locations" className="flex min-w-0 flex-wrap justify-center gap-2.5">
            {locs.map((l) => (
              <li key={l.name} style={accentVars(l.accent)} className="flex items-center gap-2.5 rounded-full bg-white/[0.04] py-2 pl-3 pr-4 ring-1 ring-[var(--acc-line)]">
                <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-[var(--acc)] shadow-[0_0_10px_var(--acc)]" />
                <span className="font-heading text-[13.5px] font-semibold text-white">{l.name}</span>
                {l.role ? <span className="font-sans text-[12px] text-white/55">{l.role}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
        <ul className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {locs.map((l) => (
            <li key={l.name} style={accentVars(l.accent)} className="card-surface flex items-center gap-4 px-5 py-4">
              <span aria-hidden className="size-3 shrink-0 rounded-full bg-[var(--acc)] shadow-[0_0_12px_var(--acc)]" />
              <div className="min-w-0">
                <p className="font-heading text-[14.5px] font-semibold leading-[1.3] text-white xl:text-[14.5px]">
                  {l.name}
                  {l.hq ? <span className="ml-2 rounded-full bg-brand-gradient px-2 py-0.5 align-middle font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-[#0a0f1d]">HQ</span> : null}
                </p>
                {l.role ? <p className="mt-0.5 font-sans text-[12.5px] leading-[1.45] text-white/60">{l.role}</p> : null}
              </div>
            </li>
          ))}
        </ul>
        )}
      </div>
      {strip.length ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl bg-white/[0.03] px-6 py-4 ring-1 ring-white/[0.07]">
          {strip.map((s, i) => (
            <span key={s} className="flex items-center gap-6 font-sans text-[13.5px] font-medium text-white/80 xl:text-[14px]">
              {i ? <span aria-hidden className="size-1.5 rounded-full bg-brand/70" /> : null}
              {s}
            </span>
          ))}
        </div>
      ) : null}
    </DeckStage>
  );
}
