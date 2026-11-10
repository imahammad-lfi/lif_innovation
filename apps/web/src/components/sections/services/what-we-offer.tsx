import type { Media } from "@/lib/content/types";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { SectionProps } from "../types";

type Card = { icon?: Media | null; title?: string | null; description?: string | null };
type Item = { description?: string | null };
type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  items?: Item[] | null;
  cards?: Card[] | null;
  cardLayout?: "two" | "three" | null;
};

/** Service offering with an editorial introduction and a consistent capability grid. */
export function WhatWeOffer({ data }: SectionProps<Data>) {
  const hasDetailedCards = Boolean(data.cards?.some((card) => card.description));
  return (
    <section id={data.anchorId || undefined} className="bg-black px-gutter py-24 3xl:py-[120px] max-[768px]:py-16">
      <div className="grid items-start gap-12 min-[1200px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.8fr)] 3xl:gap-16 max-[768px]:gap-8">
        <div className="min-w-0">
          <Eyebrow className="mb-2 mt-0 xl:mb-2 xl:mt-0">{data.eyebrow}</Eyebrow>
          {data.heading ? <h2 className="max-w-[26ch] font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:text-[24px]">{data.heading}</h2> : null}
          {data.description ? <p className="mt-4 max-w-[68ch] font-sans text-[17px] leading-[1.6] text-white/65 3xl:text-[19px] max-[768px]:text-[15.5px]">{data.description}</p> : null}
          {data.items?.length ? (
            <ul className="mt-6 list-disc space-y-4 pl-5 font-sans text-[15px] leading-[1.65] text-white/65 marker:text-brand/80 3xl:text-[16px] max-[768px]:text-[14.5px]">
              {data.items.map((item, index) => <li key={`${item.description}-${index}`}>{item.description}</li>)}
            </ul>
          ) : null}
        </div>
        <div className={`grid min-w-0 gap-6 3xl:gap-8 max-[768px]:gap-4 ${hasDetailedCards ? "grid-cols-1 min-[576px]:grid-cols-2" : "grid-cols-2 min-[576px]:grid-cols-3"} ${data.cardLayout === "two" ? "min-[1024px]:grid-cols-2" : "min-[1024px]:grid-cols-3"}`}>
          {data.cards?.map((card, index) => (
            <article key={`${card.title}-${index}`} className="card-surface flex min-w-0 flex-col items-start rounded-2xl p-6 3xl:p-8 max-[768px]:p-5">
              {card.icon ? (
                <div className="mb-5 flex size-11 shrink-0 items-center justify-center rounded-xl icon-chip max-[768px]:size-10">
                  <CmsImage media={card.icon} alt="" width={24} height={24} className="size-6 rounded-md object-contain max-[768px]:size-5" />
                </div>
              ) : null}
              {card.title ? <h3 className="font-heading text-[18px] font-semibold leading-[1.35] text-white 3xl:text-[20px] max-[768px]:text-[16px]">{card.title}</h3> : null}
              {card.description ? <p className="mt-3 max-w-[68ch] font-sans text-[15px] leading-[1.65] text-white/65 3xl:text-[16px] max-[768px]:text-[14.5px]">{card.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
