import { CmsImage } from "@/components/cms/cms-image";
import { Markdown } from "@/components/cms/markdown";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { IconCard, Media } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  secondaryEyebrow?: string | null;
  secondaryHeading?: string | null;
  secondaryDescription?: string | null;
  image?: Media | null;
  cards?: IconCard[] | null;
  backgroundImage?: Media | null;
  layout?: "grid" | "grid-compact" | "stack" | null;
};

const bodyClass = "max-w-[68ch] font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:text-[13.5px]";
const cardTitleClass = "font-heading text-[16.5px] font-semibold leading-[1.35] text-white 3xl:text-[18px] max-[768px]:text-[14.5px]";

export function TechnologyDetails({ data }: SectionProps<Data>) {
  const cards = data.cards ?? [];
  const grid = data.layout !== "stack";
  const compactGrid = data.layout === "grid-compact";

  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-ink px-gutter py-24 text-white 3xl:py-28 max-[768px]:py-16">
      <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover object-left-top" />
      <div className="absolute inset-0 -z-10 bg-ink/55" />
      <div className="grid grid-cols-1 items-start gap-12 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] 3xl:gap-16 max-[768px]:gap-8">
        <div className="min-w-0">
          {data.image ? (
            <div className="relative mb-6 h-16 w-52 max-w-full max-[768px]:h-12 max-[768px]:w-44">
              <CmsImage media={data.image} alt="" fill sizes="208px" className="object-contain object-left" />
            </div>
          ) : null}
          <Eyebrow>{data.eyebrow}</Eyebrow>
          {data.heading ? <h2 className="font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{data.heading}</h2> : null}
          <Markdown className={`mt-4 ${bodyClass}`}>{data.description}</Markdown>
          {data.secondaryEyebrow ? <Eyebrow className="mt-8">{data.secondaryEyebrow}</Eyebrow> : null}
          {data.secondaryHeading ? <h3 className={`mt-6 ${cardTitleClass}`}>{data.secondaryHeading}</h3> : null}
          <Markdown className={`mt-3 ${bodyClass}`}>{data.secondaryDescription}</Markdown>
        </div>
        {cards.length ? (
          <div className={`grid min-w-0 grid-cols-1 gap-6 3xl:gap-8 max-[768px]:gap-4 ${grid ? "md:grid-cols-2" : ""}`}>
            {cards.map((card, index) => (
              <article key={`${card.title}-${index}`} className="card-surface hover-lift rounded-2xl p-6 3xl:p-8 max-[768px]:p-5">
                <div className={grid ? "" : "flex items-start gap-5 max-[768px]:flex-col max-[768px]:gap-4"}>
                  {grid ? (
                    <div className="flex items-center gap-4">
                      {card.icon ? <IconChip media={card.icon} /> : null}
                      {card.title ? <h3 className={cardTitleClass}>{card.title}</h3> : null}
                    </div>
                  ) : card.icon ? <IconChip media={card.icon} /> : null}
                  <div className="min-w-0">
                    {!grid && card.title ? <h3 className={cardTitleClass}>{card.title}</h3> : null}
                    {compactGrid ? <div className="mt-5 h-px w-full bg-white/[0.07]" /> : null}
                    {card.description ? <p className={`mt-4 ${bodyClass}`}>{card.description}</p> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function IconChip({ media }: { media: Media }) {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl icon-chip max-[768px]:size-10">
      <CmsImage media={media} alt="" width={24} height={24} className="size-6 object-contain max-[768px]:size-5" />
    </div>
  );
}
