import type { Media } from "@/lib/content/types";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { SectionProps } from "../types";

type Card = { icon?: Media | null; title?: string | null; description?: string | null };
type Data = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; cards?: Card[] | null };

export function Superpowers({ data }: SectionProps<Data>) {
  return (
    <section id={data.anchorId || undefined} className="bg-black px-gutter py-24 3xl:py-28 max-[768px]:py-16">
      <Eyebrow className="mb-2 mt-0 xl:mb-2 xl:mt-0">{data.eyebrow}</Eyebrow>
      {data.heading ? <h2 className="max-w-[30ch] font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{data.heading}</h2> : null}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 3xl:gap-8 max-[768px]:mt-8 max-[768px]:gap-4">
        {data.cards?.map((card, index) => (
          <article key={`${card.title}-${index}`} className="card-surface flex min-w-0 items-start gap-5 rounded-2xl p-6 3xl:p-8 max-[768px]:gap-4 max-[768px]:p-5">
            {card.icon ? (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl icon-chip max-[768px]:size-10">
                <CmsImage media={card.icon} alt="" width={24} height={24} className="size-6 rounded-md object-contain brightness-150 max-[768px]:size-5" />
              </div>
            ) : null}
            <div className="min-w-0">
              {card.title ? <h3 className="font-heading text-[16.5px] font-semibold leading-[1.35] text-white 3xl:text-[18px] max-[768px]:text-[14.5px]">{card.title}</h3> : null}
              {card.description ? <p className="mt-3 max-w-[68ch] font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:text-[13.5px]">{card.description}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
