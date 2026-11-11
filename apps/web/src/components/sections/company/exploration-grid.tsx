import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { Media } from "@/lib/content/types";
import type { SectionProps } from "../types";

type ExplorationCard = { icon?: Media | null; description?: string | null };
type Data = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; cards?: ExplorationCard[] | null };

export function ExplorationGrid({ data }: SectionProps<Data>) {
  const cards = data.cards ?? [];
  return (
    <section id={data.anchorId || undefined} className="bg-ink px-gutter py-24 3xl:py-28 max-[768px]:py-16">
      <Eyebrow>{data.eyebrow}</Eyebrow>
      {data.heading ? <h2 className="max-w-[900px] font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{data.heading}</h2> : null}
      {cards.length ? (
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 3xl:gap-8 max-[768px]:mt-8 max-[768px]:gap-4">
          {cards.map((card, index) => (
            <article key={`${card.description ?? "exploration"}-${index}`} className="card-surface flex items-start gap-6 rounded-2xl p-6 3xl:p-8 max-[768px]:flex-col max-[768px]:gap-5 max-[768px]:p-5">
              {card.icon ? (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl icon-chip max-[768px]:size-10">
                  <CmsImage media={card.icon} alt="" width={24} height={24} className="size-6 object-contain max-[768px]:size-5" />
                </div>
              ) : null}
              {card.description ? <p className="max-w-[68ch] font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:text-[13.5px]">{card.description}</p> : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
