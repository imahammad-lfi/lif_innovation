import type { Media } from "@/lib/content/types";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { SectionProps } from "../types";

type Card = { icon?: Media | null; title?: string | null; description?: string | null };
type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  backgroundImage?: Media | null;
  backgroundStyle?: "image" | "dark" | null;
  cards?: Card[] | null;
};

/** Service capabilities over the original artwork or a plain dark ground. */
export function FlowCards({ data }: SectionProps<Data>) {
  const imageGround = data.backgroundStyle !== "dark";
  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-ink px-gutter py-24 3xl:py-28 max-[768px]:py-16">
      {imageGround && data.backgroundImage ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-10 object-cover" /> : null}
      <div className="relative">
        <Eyebrow className="mb-2 mt-0 xl:mb-2 xl:mt-0">{data.eyebrow}</Eyebrow>
        {data.heading ? <h2 className="max-w-[26ch] font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{data.heading}</h2> : null}
        {data.description ? <p className="mt-4 max-w-[68ch] font-sans text-[15.5px] leading-[1.6] text-white/65 3xl:text-[16.5px] max-[768px]:text-[14.5px]">{data.description}</p> : null}
        <div className="mt-12 grid grid-cols-1 gap-6 min-[769px]:grid-cols-2 min-[1200px]:grid-cols-3 3xl:gap-8 max-[768px]:mt-8 max-[768px]:gap-4">
          {data.cards?.map((card, index) => {
            const listItems = card.description?.startsWith("• ") ? card.description.split("\n").map((item) => item.replace(/^•\s*/, "")).filter(Boolean) : [];
            return (
              <article key={`${card.title}-${index}`} className="card-surface flex min-w-0 flex-col items-start rounded-2xl bg-black/35 p-6 3xl:p-8 max-[768px]:p-5">
                {card.icon ? (
                  <div className="mb-5 flex size-11 shrink-0 items-center justify-center rounded-xl icon-chip max-[768px]:size-10">
                    <CmsImage media={card.icon} alt="" width={24} height={24} className="size-6 rounded-md object-contain max-[768px]:size-5" />
                  </div>
                ) : null}
                {card.title ? <h3 className="font-heading text-[16.5px] font-semibold leading-[1.35] text-white 3xl:text-[18px] max-[768px]:text-[14.5px]">{card.title}</h3> : null}
                {listItems.length ? (
                  <ul className="mt-3 space-y-2 pl-4 font-sans text-[14px] leading-[1.65] text-white/65 marker:text-brand/80 3xl:text-[14.5px] max-[768px]:text-[13.5px]">
                    {listItems.map((item, itemIndex) => <li className="list-disc" key={`${item}-${itemIndex}`}>{item}</li>)}
                  </ul>
                ) : card.description ? <p className="mt-3 max-w-[68ch] font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:text-[13.5px]">{card.description}</p> : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
