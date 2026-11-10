import { CmsImage } from "@/components/cms/cms-image";
import { Markdown } from "@/components/cms/markdown";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { ReadMore } from "@/components/primitives/read-more";
import { SmartLink } from "@/components/primitives/smart-link";
import type { IconCard, Media } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  cards?: IconCard[] | null;
  backgroundImage?: Media | null;
  linkedCards?: boolean | null;
};

export function HowCanWeHelp({ data }: SectionProps<Data>) {
  const cards = data.cards ?? [];
  const linkedCards = Boolean(data.linkedCards);
  const columns = linkedCards && cards.length > 3
    ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    : linkedCards && cards.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3";

  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-ink px-gutter py-24 3xl:py-[120px] max-[768px]:py-16">
      <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-ink/80" />
      <div className="max-w-[1040px]">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        {data.heading ? <h2 className="font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:text-[24px]">{data.heading}</h2> : null}
        <Markdown className="mt-4 max-w-[68ch] font-sans text-[17px] leading-[1.6] text-white/65 3xl:text-[19px] max-[768px]:text-[15.5px]">{data.description}</Markdown>
      </div>
      {cards.length ? (
        <div className={`mt-12 grid grid-cols-1 gap-6 3xl:gap-8 max-[768px]:mt-8 max-[768px]:gap-4 ${columns}`}>
          {cards.map((card, index) => {
            const content = (
              <>
                {card.icon ? (
                  <div className="mb-6 flex size-11 shrink-0 items-center justify-center rounded-xl icon-chip max-[768px]:mb-5 max-[768px]:size-10">
                    <CmsImage media={card.icon} alt="" width={24} height={24} className="size-6 object-contain max-[768px]:size-5" />
                  </div>
                ) : null}
                {card.title ? <h3 className="font-heading text-[18px] font-semibold leading-[1.35] text-white 3xl:text-[20px] max-[768px]:text-[16px]">{card.title}</h3> : null}
                {card.description ? <p className="mt-3 max-w-[68ch] font-sans text-[15px] leading-[1.65] text-white/65 3xl:text-[16px] max-[768px]:text-[14.5px]">{card.description}</p> : null}
                {card.linkLabel ? <div className="mt-auto pt-6"><ReadMore label={card.linkLabel} /></div> : null}
              </>
            );
            const classes = `group card-surface flex min-w-0 flex-col rounded-2xl p-6 3xl:p-8 max-[768px]:p-5 ${card.href ? "hover-lift focus-visible:outline-brand focus-visible:outline-offset-4" : ""}`;
            return card.href
              ? <SmartLink key={`${card.title}-${index}`} href={card.href} className={classes}>{content}</SmartLink>
              : <article key={`${card.title}-${index}`} className={classes}>{content}</article>;
          })}
        </div>
      ) : null}
    </section>
  );
}
