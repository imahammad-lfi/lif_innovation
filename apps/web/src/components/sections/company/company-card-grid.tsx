import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { IconCard, Media } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Variant = "values" | "work";
type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  cards?: IconCard[] | null;
  backgroundImage?: Media | null;
  variant?: Variant | null;
};

/** The company values and approach grids share one compact card language. */
export function CompanyCardGrid({ data }: SectionProps<Data>) {
  const cards = data.cards ?? [];
  const isWork = data.variant === "work";
  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-ink px-gutter py-24 3xl:py-28 max-[768px]:py-16">
      {data.backgroundImage ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" /> : null}
      {data.backgroundImage ? <div aria-hidden className="absolute inset-0 -z-10 bg-ink/75" /> : null}
      <div className={isWork ? "grid items-start gap-12 min-[1200px]:grid-cols-[0.9fr_1.1fr] 3xl:gap-20 max-[768px]:gap-8" : ""}>
        <div>
          <Eyebrow>{data.eyebrow}</Eyebrow>
          {data.heading ? <h2 className="max-w-[900px] font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{data.heading}</h2> : null}
          {data.description ? <p className="mt-4 max-w-[68ch] font-sans text-[15.5px] leading-[1.6] text-white/65 3xl:text-[16.5px] max-[768px]:text-[14.5px]">{data.description}</p> : null}
        </div>
        {cards.length ? (
          <div className={`grid gap-6 3xl:gap-8 max-[768px]:gap-4 ${isWork ? "grid-cols-2" : "mt-12 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 max-[768px]:mt-8"}`}>
            {cards.map((card, index) => (
              <article key={`${card.title ?? "card"}-${index}`} className="card-surface flex h-full flex-col rounded-2xl p-6 3xl:p-8 max-[768px]:p-5">
                {card.icon ? (
                  <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl icon-chip max-[768px]:size-10">
                    <CmsImage media={card.icon} alt="" width={isWork ? 24 : 48} height={isWork ? 24 : 48} className={`size-6 object-contain max-[768px]:size-5 ${isWork ? "" : "scale-[2]"}`} />
                  </div>
                ) : null}
                <div className={card.icon ? "mt-6 max-[768px]:mt-5" : ""}>
                  {card.title ? <h3 className="font-heading text-[16.5px] font-semibold leading-[1.35] text-white 3xl:text-[18px] max-[768px]:text-[14.5px]">{card.title}</h3> : null}
                  {card.description ? <p className="mt-3 max-w-[68ch] font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:text-[13.5px]">{card.description}</p> : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
