import type { SectionProps } from "../types";
import { CmsImage } from "@/components/cms/cms-image";
import { SmartLink } from "@/components/primitives/smart-link";
import type { Link, Media } from "@/lib/content/types";
import { ArrowRight } from "lucide-react";
import { HomeCarousel } from "../lazy"; // code-split (see sections/lazy.tsx)

type AwardCard = { title?: string | null; description?: string | null; image?: Media | null; cta?: Link | null };
type Data = { anchorId?: string | null; backgroundImage?: Media | null; cards?: AwardCard[] | null };

export function AwardsCarousel({ data }: SectionProps<Data>) {
  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-black px-gutter py-24 text-white 3xl:py-28 max-[768px]:py-16">
      {data.backgroundImage ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" /> : null}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/35" />
      <HomeCarousel mode="fade" autoPlay={3050} speed={1000} showDots dotsVariant="dash" dotsClassName="mt-8" ariaLabel="Awards and recognition">
        {(data.cards ?? []).map((card, index) => (
          <article key={`${card.title}-${index}`} className="card-surface flex min-h-[350px] items-center justify-between gap-12 rounded-2xl p-10 3xl:p-12 max-[768px]:min-h-[580px] max-[768px]:flex-col max-[768px]:justify-center max-[768px]:gap-8 max-[768px]:p-5 max-[768px]:text-center">
            <div className="w-[58%] max-[768px]:w-full">
              {card.title ? <h2 className="font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{card.title}</h2> : null}
              {card.description ? <p className="mt-4 max-w-[68ch] font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:text-[13.5px]">{card.description}</p> : null}
              {card.cta?.label ? <SmartLink href={card.cta.href} newTab={card.cta.openInNewTab} className="btn-secondary mt-8 max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[13.5px]"><span>{card.cta.label}</span><ArrowRight aria-hidden className="size-4" /></SmartLink> : null}
            </div>
            <div className="flex w-[34%] items-center justify-center max-[768px]:w-full">
              <CmsImage media={card.image} alt={card.title || "Award"} width={300} height={260} className="max-h-[250px] w-auto max-w-full object-contain max-[768px]:max-h-[180px]" />
            </div>
          </article>
        ))}
      </HomeCarousel>
    </section>
  );
}
