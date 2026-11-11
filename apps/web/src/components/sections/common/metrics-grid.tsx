import { CmsImage } from "@/components/cms/cms-image";
import { DeckBars, DeckLabel, DeckStage, Highlight } from "@/components/primitives/deck";
import { accentVars } from "@/lib/accent";
import type { Accent, Media } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import type { SectionProps } from "../types";
import type { FeatureTile } from "./feature-tiles";

export type Metric = {
  label?: string | null;
  prefix?: string | null;
  value: string;
  title?: string | null;
  description?: string | null;
  accent?: Accent | null;
};

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  bullets?: string | null;
  metricsLabel?: string | null;
  metricsHeading?: string | null;
  metrics?: Metric[] | null;
  footnote?: string | null;
  bannerLabel?: string | null;
  bannerTitle?: string | null;
  bannerText?: string | null;
  stepsLabel?: string | null;
  steps?: FeatureTile[] | null;
  image?: Media | null;
};

const CYCLE: Accent[] = ["yellow", "orange", "blue", "purple", "teal"];
const DOTS = ["bg-[#FFC21A]", "bg-[#6E9BFF]", "bg-brand", "bg-[#1FC8A9]"];

/** Client value: headline promise on the left, outcome metrics, a secure-by-design banner and value steps on the right. */
export function MetricsGrid({ data }: SectionProps<Data>) {
  const metrics = (data.metrics ?? []).filter((m) => m?.value);
  const steps = (data.steps ?? []).filter((s) => s?.title);
  const bullets = (data.bullets ?? "")
    .split(/\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <DeckStage id={data.anchorId}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.6fr)] xl:gap-16">
        <div className="relative flex min-w-0 flex-col">
          <DeckLabel>{data.eyebrow}</DeckLabel>
          {data.heading ? (
            <h2 className="mt-3 whitespace-pre-line font-heading text-[27.5px] font-semibold leading-[1.12] tracking-[-0.02em] text-white xl:text-[40px] 3xl:text-[46px]">
              <Highlight text={data.heading} />
            </h2>
          ) : null}
          <DeckBars className="mt-5" />
          {data.description ? (
            <p className="mt-6 max-w-[46ch] font-sans text-[14px] leading-[1.75] text-white/70 xl:text-[14.5px]">{data.description}</p>
          ) : null}
          {bullets.length ? (
            <ul className="mt-6 space-y-2.5">
              {bullets.map((b, i) => (
                <li key={b} className="flex items-center gap-3 font-heading text-[12.5px] font-bold uppercase tracking-[0.06em] text-white/90 xl:text-[13.5px]">
                  <span aria-hidden className={cn("size-3 shrink-0 rounded-full", DOTS[i % DOTS.length])} />
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
          {data.image ? (
            <div aria-hidden className="pointer-events-none relative mt-10 hidden aspect-square w-full max-w-[360px] lg:block">
              <CmsImage media={data.image} alt="" fill sizes="360px" className="object-contain opacity-90 [mask-image:radial-gradient(circle_at_50%_50%,#000_58%,transparent_72%)]" />
            </div>
          ) : null}
        </div>
        <div className="min-w-0">
          <DeckLabel>{data.metricsLabel}</DeckLabel>
          {data.metricsHeading ? (
            <h3 className="mt-2 font-heading text-[20px] font-semibold leading-[1.25] text-white xl:text-[24px]">{data.metricsHeading}</h3>
          ) : null}
          {metrics.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {metrics.map((m, i) => (
                <div key={`${m.label}-${i}`} style={accentVars(m.accent || CYCLE[i % CYCLE.length])} className="card-surface flex min-w-0 flex-col p-5 xl:p-6">
                  {m.label ? (
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--acc)] xl:text-[11px]">{m.label}</span>
                  ) : null}
                  <div className="mt-3 flex min-w-0 items-center gap-5">
                    <div className="flex min-w-[118px] shrink-0 items-baseline gap-1.5 xl:min-w-[140px]">
                      {m.prefix ? <span className="font-heading text-[13.5px] font-semibold text-[var(--acc)]">{m.prefix}</span> : null}
                      <span className="font-heading text-[27.5px] font-bold leading-none tracking-[-0.02em] text-[var(--acc)] xl:text-[34.5px]">{m.value}</span>
                    </div>
                    <div className="min-w-0">
                      {m.title ? <p className="font-heading text-[14px] font-semibold leading-[1.3] text-white xl:text-[14.5px]">{m.title}</p> : null}
                      {m.description ? <p className="mt-1 font-sans text-[12.5px] leading-[1.5] text-white/60 xl:text-[13px]">{m.description}</p> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {data.footnote ? <p className="mt-3 font-sans text-[12px] leading-[1.55] text-white/45 xl:text-[12px]">{data.footnote}</p> : null}
          {data.bannerTitle || data.bannerText ? (
            <div style={accentVars("orange")} className="card-surface mt-4 flex flex-col gap-2 p-5 md:flex-row md:items-center md:gap-6 xl:p-6">
              {data.bannerLabel ? <span className="shrink-0 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-brand xl:text-[11px]">{data.bannerLabel}</span> : null}
              <p className="font-sans text-[13.5px] leading-[1.55] text-white/70 xl:text-[14px]">
                {data.bannerTitle ? <b className="font-heading font-semibold text-white">{data.bannerTitle} </b> : null}
                {data.bannerText}
              </p>
            </div>
          ) : null}
          {steps.length ? (
            <div className="mt-10">
              <DeckLabel className="text-white/80">{data.stepsLabel}</DeckLabel>
              <ol className="mt-4 grid gap-4 md:grid-cols-3">
                {steps.map((s, i) => (
                  <li key={s.title} style={accentVars(s.accent || (["orange", "blue", "yellow"] as Accent[])[i % 3])} className="card-surface flex min-w-0 flex-col p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--acc)] font-heading text-[13.5px] font-bold text-[#0a0f1d]">{s.number || i + 1}</span>
                      <span className="font-heading text-[14.5px] font-semibold text-white xl:text-[15.5px]">{s.title}</span>
                    </div>
                    {s.description ? <p className="mt-3 font-sans text-[13px] leading-[1.55] text-white/65">{s.description}</p> : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </DeckStage>
  );
}
