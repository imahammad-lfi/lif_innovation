import type { SectionProps } from "../types";
import { CmsImage } from "@/components/cms/cms-image";
import { DeckHeader, DeckStage } from "@/components/primitives/deck";
import { ReadMore } from "@/components/primitives/read-more";
import { accentVars } from "@/lib/accent";
import type { Link, Media } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { BASIS } from "../common/feature-tiles";

type SolutionCard = { title?: string | null; image?: Media | null; description?: string | null; cta?: Link | null };
type Data = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; description?: string | null; backgroundImage?: Media | null; cards?: SolutionCard[] | null };

/** Enterprise platform solutions (SAP, Odoo, Dynamics 365, Salesforce, iPaaS, RPA) as unified tiles in the platforms accent. */
export function SolutionsGrid({ data }: SectionProps<Data>) {
  const cards = data.cards ?? [];
  return (
    <div style={accentVars("blue")} className="contents">
      <DeckStage id={data.anchorId} tone="ink">
        <DeckHeader eyebrow={data.eyebrow || "OEM platforms we deliver"} heading={data.heading} description={data.description} />
        <div className="mt-10 flex flex-wrap justify-center gap-5 xl:mt-12">
          {cards.map((card, index) => (
            <div key={`${card.title}-${index}`} className={cn("min-w-0", BASIS[3])}>
              <article className="card-surface group/tile flex h-full flex-col p-6 xl:p-7">
                <div className="flex h-[84px] items-center justify-center rounded-xl bg-white px-6 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.9)] ring-1 ring-black/5 transition-shadow duration-300 group-hover/tile:shadow-[0_16px_36px_-16px_var(--acc),0_0_0_2px_var(--acc-line)]">
                  <CmsImage
                    media={card.image}
                    alt={card.title || "Solution"}
                    width={220}
                    height={90}
                    className="h-auto max-h-[46px] w-auto max-w-[170px] object-contain transition-transform duration-300 group-hover/tile:scale-105 motion-reduce:transform-none"
                  />
                </div>
                {card.title ? <h3 className="mt-5 font-heading text-[18px] font-semibold leading-[1.3] text-white xl:text-[19px]">{card.title}</h3> : null}
                {card.description ? <p className="mt-2.5 flex-1 font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[15px]">{card.description}</p> : null}
                <div className="mt-auto pt-5">
                  <ReadMore href={card.cta?.href} label={card.cta?.label} newTab={card.cta?.openInNewTab} />
                </div>
              </article>
            </div>
          ))}
        </div>
      </DeckStage>
    </div>
  );
}
