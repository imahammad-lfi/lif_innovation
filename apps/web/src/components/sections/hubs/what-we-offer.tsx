import { CmsImage } from "@/components/cms/cms-image";
import { Markdown } from "@/components/cms/markdown";
import { DeckHeader, DeckStage } from "@/components/primitives/deck";
import { ReadMore } from "@/components/primitives/read-more";
import type { Link, Media } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { BASIS } from "../common/feature-tiles";
import type { SectionProps } from "../types";

type OfferItem = {
  title?: string | null;
  description?: string | null;
  image?: Media | null;
  cta?: Link | null;
};
type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  body?: string | null;
  cards?: OfferItem[] | null;
};

/** Specialist services within a portfolio, rendered as unified photo tiles (portfolio accent from the page). */
export function WhatWeOffer({ data }: SectionProps<Data>) {
  const items = (data.cards ?? []).filter((c) => c.title || c.description);
  const n = items.length;
  const cols = n <= 2 ? 2 : n === 4 || n === 7 || n === 8 ? 4 : 3;
  return (
    <DeckStage id={data.anchorId}>
      <DeckHeader eyebrow={data.eyebrow} heading={data.heading} description={data.body} />
      <div className="mt-10 flex flex-wrap justify-center gap-5 xl:mt-12">
        {items.map((card, i) => (
          <div key={`${card.title}-${i}`} className={cn("min-w-0", BASIS[cols])}>
            <article className="card-surface group/tile flex h-full min-w-0 flex-col p-3">
              {card.image ? (
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl ring-1 ring-white/10">
                  <CmsImage
                    media={card.image}
                    alt={card.title || ""}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 420px"
                    className="object-cover transition-transform duration-700 ease-out group-hover/tile:scale-[1.06] motion-reduce:transition-none"
                  />
                  <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(7,11,22,0.65))]" />
                  <span aria-hidden className="absolute bottom-3 left-3 h-[3px] w-8 rounded-full bg-[var(--acc)] shadow-[0_0_12px_var(--acc)]" />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                {card.title ? (
                  <h3 className="font-heading text-[16.5px] font-semibold leading-[1.25] tracking-[-0.01em] text-white xl:text-[18px] 3xl:text-[18px]">{card.title}</h3>
                ) : null}
                <Markdown className="mt-3 flex flex-col gap-3 break-words font-sans text-[13.5px] leading-[1.65] text-white/65 3xl:text-[14px] [&_a]:font-semibold [&_a]:text-[var(--acc)] [&_a:hover]:underline [&_li]:marker:text-[var(--acc)] [&_strong]:font-semibold [&_strong]:text-white/90 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
                  {card.description}
                </Markdown>
                {card.cta?.href ? (
                  <div className="mt-auto pt-5">
                    <ReadMore href={card.cta.href} label={card.cta.label || "Read more"} newTab={card.cta.openInNewTab} />
                  </div>
                ) : null}
              </div>
            </article>
          </div>
        ))}
      </div>
    </DeckStage>
  );
}
