import { ArrowRight, ArrowUpRight } from "lucide-react";

import { CmsImage } from "@/components/cms/cms-image";
import { SmartLink } from "@/components/primitives/smart-link";
import { accentVars } from "@/lib/accent";
import type { Accent, Link, Media } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import type { SectionProps } from "../types";

export type IndustryCard = {
  title: string;
  description?: string | null;
  image?: Media | null;
  href?: string | null;
  /** One tag per line (commas are accepted too). */
  tags?: string | null;
  accent?: Accent | null;
};

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  items?: IndustryCard[] | null;
  cta?: Link | null;
};

/** Tag colours cycle by position exactly like the brand slide: blue, yellow, orange. */
const CYCLE: Accent[] = ["blue", "yellow", "orange"];

function splitTags(tags?: string | null) {
  return (tags ?? "")
    .split(/\r?\n|,/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function Card({ item, index }: { item: IndustryCard; index: number }) {
  const accent = item.accent || CYCLE[index % CYCLE.length];
  const tags = splitTags(item.tags);
  const body = (
    <>
      {/* colour wash that blooms on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[var(--acc)] opacity-0 blur-[90px] transition-opacity duration-500 group-hover:opacity-[0.22]"
      />
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--acc),transparent)] opacity-40 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative w-[34%] max-w-[176px] shrink-0 self-stretch overflow-hidden rounded-[14px] ring-1 ring-white/10 max-[480px]:w-[112px]">
        <CmsImage
          media={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 140px, 200px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(5,9,20,0.55))]" />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col py-3 pr-2 max-[480px]:py-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-[18px] font-semibold leading-[1.25] tracking-[-0.01em] text-white xl:text-[19px] 3xl:text-[21px]">
            {item.title}
          </h3>
          {item.href ? (
            <span
              aria-hidden
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/60 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-[var(--acc)] group-hover:text-[#0a0f1d] group-hover:ring-transparent"
            >
              <ArrowUpRight className="size-[15px]" />
            </span>
          ) : null}
        </div>
        {item.description ? (
          <p className="mt-2.5 font-sans text-[14px] leading-[1.65] text-white/65 max-[480px]:text-[13.5px] 3xl:text-[15px]">
            {item.description}
          </p>
        ) : null}
        {tags.length ? (
          <ul className="mt-auto flex flex-wrap gap-x-3.5 gap-y-1.5 pt-4 font-sans text-[12px] font-semibold leading-[1.35] text-[var(--acc)] 3xl:text-[12.5px]">
            {tags.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <span aria-hidden className="size-[5px] rounded-full bg-[var(--acc)] opacity-70" />
                {t}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );

  const cls = cn(
    "group relative isolate flex min-h-[248px] gap-4 overflow-hidden rounded-[20px] border border-white/[0.08] p-3 transition-[transform,border-color,box-shadow] duration-500 ease-out max-[480px]:min-h-[216px] max-[480px]:gap-3.5",
    "bg-[linear-gradient(160deg,rgba(24,34,58,0.9),rgba(12,18,32,0.92))] shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)]",
    "hover:-translate-y-1 hover:border-[var(--acc-line)] hover:shadow-[0_30px_70px_-35px_var(--acc)]",
    "basis-full md:basis-[calc((100%-20px)/2)] xl:basis-[calc((100%-40px)/3)] 3xl:basis-[calc((100%-72px)/4)]",
  );
  return item.href ? (
    <SmartLink href={item.href} style={accentVars(accent)} className={cls}>
      {body}
    </SmartLink>
  ) : (
    <div style={accentVars(accent)} className={cls}>
      {body}
    </div>
  );
}

export function IndustriesGrid({ data }: SectionProps<Data>) {
  const items = data.items?.filter((i) => i?.title) ?? [];
  return (
    <section
      id={data.anchorId || undefined}
      className="relative isolate w-full overflow-hidden bg-[#070b16] px-gutter py-16 xl:py-24 3xl:py-28"
    >
      {/* navy stage with brand glows, as on the slide */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_0%_0%,rgba(61,123,255,0.16),transparent_70%),radial-gradient(55%_60%_at_100%_100%,rgba(255,120,0,0.16),transparent_70%),linear-gradient(180deg,#0a1124,#070b16)]"
      />
      <div className="mx-auto max-w-[1760px]">
        {data.eyebrow ? (
          <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.32em] text-brand xl:text-[13px]">{data.eyebrow}</span>
        ) : null}
        {data.heading ? (
          <h2 className="mt-3 font-heading text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-white xl:text-[40px] 3xl:text-[48px]">
            {data.heading}
          </h2>
        ) : null}
        <div aria-hidden className="mt-4 flex gap-2">
          <span className="h-[4px] w-10 rounded-full bg-[#FFC21A]" />
          <span className="h-[4px] w-10 rounded-full bg-brand-line" />
          <span className="h-[4px] w-10 rounded-full bg-[#6E9BFF]" />
        </div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          {data.description ? (
            <p className="max-w-[72ch] font-sans text-[15px] leading-[1.7] text-white/70 xl:text-[17px] 3xl:text-[18px]">{data.description}</p>
          ) : null}
          {data.cta?.href ? (
            <SmartLink
              href={data.cta.href}
              newTab={data.cta.openInNewTab}
              className="group/cta inline-flex shrink-0 items-center gap-2 font-heading text-[14px] font-semibold text-brand transition-colors hover:text-[#ff9a3d]"
            >
              {data.cta.label || "Explore industries"}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
            </SmartLink>
          ) : null}
        </div>
        {items.length ? (
          <div className="mt-10 flex flex-wrap justify-center gap-5 xl:mt-12 3xl:gap-6">
            {items.map((item, i) => (
              <Card key={item.title} item={item} index={i} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
