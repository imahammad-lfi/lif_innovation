import type { SectionProps } from "../types";
import { CmsImage } from "@/components/cms/cms-image";
import { SmartLink } from "@/components/primitives/smart-link";
import type { Link, Media } from "@/lib/content/types";
import { ArrowRight } from "lucide-react";
import { HomeCarousel } from "../lazy"; // code-split (see sections/lazy.tsx)

type ServiceCard = { title?: string | null; image?: Media | null; href?: string | null };
type Data = { anchorId?: string | null; heading?: string | null; description?: string | null; backgroundImage?: Media | null; cta?: Link | null; cards?: ServiceCard[] | null };

export function ServicesShowcase({ data }: SectionProps<Data>) {
  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-ink px-gutter py-24 text-white 3xl:py-28 max-[768px]:py-16">
      {data.backgroundImage ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-30" /> : null}
      <div aria-hidden className="absolute inset-0 -z-10 bg-ink/80" />
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center max-[768px]:gap-8">
        <div className="min-w-0 flex-1 lg:max-w-[330px] 3xl:max-w-[400px]">
          {data.heading ? <h2 className="font-heading text-[27.5px] font-semibold leading-[1.2] 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{data.heading}</h2> : null}
          {data.description ? <p className="mt-4 max-w-[68ch] font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:text-[13.5px]">{data.description}</p> : null}
          {data.cta?.label ? <SmartLink href={data.cta.href} newTab={data.cta.openInNewTab} className="btn-secondary mt-8 max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[13.5px]"><span>{data.cta.label}</span><ArrowRight className="size-4" aria-hidden /></SmartLink> : null}
        </div>
        <HomeCarousel autoPlay={2050} speed={1500} className="min-w-0 flex-1 lg:w-[65%]" contentClassName="-ml-6 max-[768px]:-ml-4" itemClassName="basis-[34%] pl-6 max-[1280px]:basis-1/2 max-[768px]:pl-4 max-[600px]:basis-[88%]" ariaLabel="Services">
          {(data.cards ?? []).map((card, index) => (
            <SmartLink key={`${card.title}-${index}`} href={card.href} className="card-surface group hover-lift relative block h-[360px] overflow-hidden rounded-2xl bg-coal ring-1 ring-white/10 3xl:h-[420px] max-[768px]:h-[340px]">
              <CmsImage media={card.image} alt={card.title || "Service"} fill sizes="(max-width: 600px) 80vw, (max-width: 1025px) 45vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
              {card.title ? <h3 className="absolute inset-x-6 bottom-6 font-heading text-[16.5px] font-semibold leading-[1.35] text-white 3xl:text-[18px] max-[768px]:inset-x-5 max-[768px]:bottom-5 max-[768px]:text-[14.5px]">{card.title}</h3> : null}
            </SmartLink>
          ))}
        </HomeCarousel>
      </div>
    </section>
  );
}
