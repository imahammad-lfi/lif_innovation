import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { IconCard, Media } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Data = {
  eyebrow?: string | null;
  cards?: IconCard[] | null;
  backgroundImage?: Media | null;
  centerImage?: Media | null;
};

export function ProcessGrid({ data }: SectionProps<Data>) {
  const cards = data.cards ?? [];
  const ordered = cards.length > 4
    ? [...cards.slice(0, 4), { title: "", icon: data.centerImage, description: "" } as IconCard, ...cards.slice(4)]
    : cards;

  return (
    <section className="relative isolate overflow-hidden bg-ink px-gutter py-24 text-white 3xl:py-[120px] max-[768px]:py-16">
      <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-ink/80" />
      <div className="mb-12 max-[768px]:mb-8">
        <Eyebrow>{data.eyebrow}</Eyebrow>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 3xl:gap-8 max-[768px]:gap-4">
        {ordered.map((card, index) => card.title ? (
          <article key={`${card.title}-${index}`} className="card-surface hover-lift h-full rounded-2xl p-6 3xl:p-8 max-[768px]:p-5">
            <div className="flex items-center gap-4">
              {card.icon ? (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl icon-chip max-[768px]:size-10">
                  <CmsImage media={card.icon} alt="" width={24} height={24} className="size-6 object-contain max-[768px]:size-5" />
                </div>
              ) : null}
              <h3 className="font-heading text-[18px] font-semibold leading-[1.35] text-white 3xl:text-[20px] max-[768px]:text-[16px]">{card.title}</h3>
            </div>
            <div className="my-5 h-px w-full bg-white/[0.07] max-[768px]:my-4" />
            <p className="max-w-[68ch] font-sans text-[15px] leading-[1.65] text-white/65 3xl:text-[16px] max-[768px]:text-[14.5px]">{card.description}</p>
          </article>
        ) : (
          <div key={`center-${index}`} className="w-full max-w-[220px] justify-self-center self-center py-6 max-[768px]:max-w-[180px]">
            <CmsImage media={card.icon} alt="" width={282} height={127} className="h-auto w-full object-contain" />
          </div>
        ))}
      </div>
    </section>
  );
}
