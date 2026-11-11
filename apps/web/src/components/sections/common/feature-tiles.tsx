import { ArrowRight } from "lucide-react";
import { CmsImage } from "@/components/cms/cms-image";
import { Bullets, DeckHeader, DeckLabel, DeckStage, LogoPlate, LogoRow } from "@/components/primitives/deck";
import { ReadMore } from "@/components/primitives/read-more";
import { SmartLink } from "@/components/primitives/smart-link";
import { accentVars } from "@/lib/accent";
import type { Accent, Link, Media } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import type { SectionProps } from "../types";

export type FeatureTile = {
  number?: string | null;
  eyebrow?: string | null;
  title: string;
  tagline?: string | null;
  description?: string | null;
  /** One per line; "Title – detail" renders the detail muted. */
  bullets?: string | null;
  groupLabel?: string | null;
  links?: Link[] | null;
  footLabel?: string | null;
  footText?: string | null;
  accent?: Accent | null;
  icon?: Media | null;
  logo?: Media | null;
  href?: string | null;
  linkLabel?: string | null;
};

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  variant?: "default" | "portfolio" | "compact" | null;
  columns?: number | null;
  tone?: "navy" | "ink" | null;
  logosLabel?: string | null;
  logos?: Link[] | null;
  items?: FeatureTile[] | null;
  noteLabel?: string | null;
  note?: string | null;
  strip?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

/** Flex-basis per column count so that orphans on the last row stay centred. */
export const BASIS: Record<number, string> = {
  1: "basis-full",
  2: "basis-full md:basis-[calc((100%-20px)/2)]",
  3: "basis-full md:basis-[calc((100%-20px)/2)] lg:basis-[calc((100%-40px)/3)]",
  4: "basis-full md:basis-[calc((100%-20px)/2)] xl:basis-[calc((100%-60px)/4)]",
  5: "basis-full md:basis-[calc((100%-20px)/2)] lg:basis-[calc((100%-40px)/3)] min-[1280px]:basis-[calc((100%-80px)/5)]",
};

const CYCLE: Accent[] = ["orange", "blue", "purple", "teal", "yellow"];
const STRIP_COLOURS = ["text-[#FFC21A]", "text-brand", "text-[#6E9BFF]", "text-white"];

export function Tile({ item, variant, index, cycle }: { item: FeatureTile; variant: Data["variant"]; index: number; cycle?: boolean }) {
  const accent = item.accent || (cycle ? CYCLE[index % CYCLE.length] : null);
  const compact = variant === "compact";
  const portfolio = variant === "portfolio";
  return (
    <article
      style={accent ? accentVars(accent) : undefined}
      className={cn("card-surface group/tile flex h-full min-w-0 flex-col", compact ? "p-5 3xl:p-6" : "p-6 xl:p-7 3xl:p-8")}
    >
      {item.logo || item.icon || item.number || item.eyebrow ? (
        <div className={cn("flex min-w-0 items-center gap-3", compact ? "mb-4" : "mb-5")}>
          {item.logo ? (
            <LogoPlate media={item.logo} name={item.title} size="md" />
          ) : item.icon ? (
            <span className="icon-chip flex size-11 shrink-0 items-center justify-center rounded-xl">
              <CmsImage media={item.icon} alt="" width={24} height={24} className="size-6 object-contain" />
            </span>
          ) : item.number ? (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--acc)] font-heading text-[13.5px] font-bold text-[#0a0f1d] shadow-[0_10px_24px_-10px_var(--acc)]">
              {item.number}
            </span>
          ) : null}
          {item.eyebrow ? (
            <span className="min-w-0 font-sans text-[11px] font-semibold uppercase leading-[1.35] tracking-[0.2em] text-[var(--acc)] 3xl:text-[11.5px]">{item.eyebrow}</span>
          ) : null}
        </div>
      ) : null}
      <h3
        className={cn(
          "font-heading font-semibold leading-[1.25] tracking-[-0.01em] text-white",
          compact ? "text-[14.5px] 3xl:text-[16.5px]" : portfolio ? "text-[16.5px] 3xl:text-[18px]" : "text-[16.5px] xl:text-[18px] 3xl:text-[18px]",
        )}
      >
        {item.title}
      </h3>
      {item.tagline ? (
        <p className="mt-2 font-sans text-[11px] font-semibold uppercase leading-[1.45] tracking-[0.16em] text-[var(--acc)] 3xl:text-[11.5px]">{item.tagline}</p>
      ) : null}
      {item.description ? (
        <p className={cn("max-w-[86ch] font-sans leading-[1.65] text-white/65", compact ? "mt-2.5 text-[13px] 3xl:text-[13.5px]" : "mt-3 text-[13.5px] 3xl:text-[14px]")}>
          {item.description}
        </p>
      ) : null}
      <Bullets text={item.bullets} dense={compact} className={compact ? "mt-3.5" : "mt-5"} />
      {item.groupLabel || item.links?.length ? (
        <div className="mt-5 border-t border-white/[0.07] pt-4">
          {item.groupLabel ? (
            <span className="mb-2.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45 3xl:text-[11px]">{item.groupLabel}</span>
          ) : null}
          <LogoRow links={item.links} size="sm" />
        </div>
      ) : null}
      {item.footLabel || item.footText ? (
        <div className="mt-5 rounded-xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.06]">
          {item.footLabel ? (
            <span className="block font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--acc)] 3xl:text-[11px]">{item.footLabel}</span>
          ) : null}
          {item.footText ? <p className="mt-1 font-sans text-[12.5px] leading-[1.55] text-white/75 3xl:text-[13.5px]">{item.footText}</p> : null}
        </div>
      ) : null}
      {item.href ? (
        <div className="mt-auto pt-6">
          <ReadMore href={item.href} label={item.linkLabel || "Explore"} />
        </div>
      ) : null}
    </article>
  );
}

/** Unified Linkfields tile grid (portfolios, why Linkfields, engagement models, what we deliver, IP, accelerators). */
export function FeatureTiles({ data }: SectionProps<Data>) {
  const items = (data.items ?? []).filter((i) => i?.title);
  const cols = Math.min(5, Math.max(1, data.columns || (items.length >= 5 ? 5 : items.length === 4 ? 4 : items.length === 2 ? 2 : 3)));
  const strip = (data.strip ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const cycle = data.variant === "portfolio";
  const logosAfter = data.variant === "portfolio";
  // A note written as a list ("a · b · c", or "a | b | c") renders as chips; editors may use either separator.
  const CHIP_SEPARATOR = / [·|] /;
  const chips = CHIP_SEPARATOR.test(data.note ?? "") ? (data.note ?? "").split(CHIP_SEPARATOR).map((c) => c.trim()).filter(Boolean) : null;
  return (
    <DeckStage id={data.anchorId} tone={data.tone}>
      <DeckHeader
        eyebrow={data.eyebrow}
        heading={data.heading}
        description={data.description}
        aside={
          data.ctaUrl ? (
            <SmartLink href={data.ctaUrl} className="group/cta inline-flex items-center gap-2 font-heading text-[13.5px] font-semibold text-brand transition-colors hover:text-[#ff9a3d]">
              {data.ctaLabel || "Learn more"}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
            </SmartLink>
          ) : null
        }
      />
      {data.logos?.length && !logosAfter ? (
        <div className="mt-10">
          <DeckLabel className="mb-4 text-white/50">{data.logosLabel}</DeckLabel>
          <LogoRow links={data.logos} size="lg" grid />
        </div>
      ) : null}
      {items.length ? (
        <div className={cn("flex flex-wrap justify-center gap-5", data.heading || (data.logos?.length && !logosAfter) ? "mt-10 xl:mt-12" : "")}>
          {items.map((item, i) => (
            <div key={`${item.title}-${i}`} className={cn("min-w-0", BASIS[cols])}>
              <Tile item={item} variant={data.variant} index={i} cycle={cycle} />
            </div>
          ))}
        </div>
      ) : null}
      {data.logos?.length && logosAfter ? (
        <div className="card-surface card-surface-flat mt-8 flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:gap-8 xl:p-6">
          <DeckLabel className="shrink-0 tracking-[0.22em]">{data.logosLabel}</DeckLabel>
          <div className="min-w-0 flex-1">
            <LogoRow links={data.logos} size="md" />
          </div>
        </div>
      ) : null}
      {data.note || data.noteLabel ? (
        <div className="card-surface mt-8 flex flex-col gap-2 p-5 md:flex-row md:items-center md:gap-6 xl:p-6">
          {data.noteLabel ? <DeckLabel className="shrink-0 tracking-[0.22em]">{data.noteLabel}</DeckLabel> : null}
          {chips ? (
            <ul className="flex flex-wrap gap-2">
              {chips.map((c) => {
                const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(c);
                const chip = "rounded-full bg-[var(--acc-soft)] px-3 py-1.5 font-sans text-[12px] font-semibold leading-[1.3] text-white/90 ring-1 ring-[var(--acc-line)] xl:text-[12.5px]";
                return (
                  <li key={c}>
                    {m ? (
                      <SmartLink href={m[2]} className={cn(chip, "inline-flex items-center gap-1.5 transition-colors hover:bg-[var(--acc)] hover:text-[#0a0f1d]")}>
                        {m[1]}
                        <ArrowRight aria-hidden className="size-3" />
                      </SmartLink>
                    ) : (
                      <span className={cn(chip, "inline-block")}>{c}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : data.note ? (
            <p className="font-sans text-[13.5px] leading-[1.6] text-white/75 xl:text-[14px]">{data.note}</p>
          ) : null}
        </div>
      ) : null}
      {strip.length ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl bg-white/[0.03] px-6 py-5 ring-1 ring-white/[0.07]">
          {strip.map((s, i) => (
            <span key={s} className="flex items-center gap-8">
              {i ? <span aria-hidden className="hidden h-5 w-px bg-white/15 sm:block" /> : null}
              <span className={cn("font-heading text-[14px] font-semibold xl:text-[15.5px]", STRIP_COLOURS[i % STRIP_COLOURS.length])}>{s}</span>
            </span>
          ))}
        </div>
      ) : null}
    </DeckStage>
  );
}
