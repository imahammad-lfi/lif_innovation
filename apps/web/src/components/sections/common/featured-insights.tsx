import { ArrowRight } from "lucide-react";
import { CmsImage } from "@/components/cms/cms-image";
import { DeckHeader, DeckStage } from "@/components/primitives/deck";
import { ReadMore } from "@/components/primitives/read-more";
import { SmartLink } from "@/components/primitives/smart-link";
import type { InsightCard } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  items?: InsightCard[] | null;
};

/** The original shows the first three featured items. */
const MAX_CARDS = 3;

/** "Insights & Updates": three image cards (news / blog). Falls back to Global › insights. */
export function FeaturedInsights({ data, context }: SectionProps<Data>) {
  const items = (data.items?.length ? data.items : (context.global?.insights ?? [])).slice(0, MAX_CARDS);
  const heading = data.heading || context.global?.insightsHeading || "Insights & Updates";
  if (!items.length) return null;

  const ctaUrl = data.ctaUrl || "/company/blog";
  return (
    <DeckStage id={data.anchorId} tone="ink">
      <DeckHeader
        eyebrow={data.eyebrow || "Insights & news"}
        heading={heading}
        description={data.description}
        aside={
          <SmartLink href={ctaUrl} className="group/cta inline-flex items-center gap-2 font-heading text-[14px] font-semibold text-brand transition-colors hover:text-[#ff9a3d]">
            {data.ctaLabel || "All insights"}
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
          </SmartLink>
        }
      />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:mt-12 xl:gap-6">
        {items.map((card, i) => (
          <SmartLink
            key={card.href ?? card.title ?? i}
            href={card.href}
            newTab={card.openInNewTab}
            className="group hover-lift relative block h-[320px] overflow-hidden rounded-2xl ring-1 ring-white/10 sm:h-[360px] xl:h-[400px] 3xl:h-[460px]"
          >
            <CmsImage
              media={card.image}
              alt={card.label ?? ""}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_20%,rgba(10,10,10,0.92)_100%)]" />
            {card.label ? (
              <span className="absolute left-5 top-5 rounded-full bg-white/15 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-white ring-1 ring-white/25 backdrop-blur-md xl:left-6 xl:top-6">
                {card.label}
              </span>
            ) : null}
            <div className="absolute inset-x-5 bottom-5 flex flex-col xl:inset-x-6 xl:bottom-6">
              <p className="line-clamp-2 font-heading text-[16px] font-semibold leading-[1.35] text-white xl:text-[18px] 3xl:text-[20px]">{card.title}</p>
              <ReadMore className="mt-3 xl:mt-4" />
            </div>
          </SmartLink>
        ))}
      </div>
    </DeckStage>
  );
}
