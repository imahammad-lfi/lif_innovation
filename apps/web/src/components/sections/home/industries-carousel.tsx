import type { SectionProps } from "../types";
import { CmsImage } from "@/components/cms/cms-image";
import { SmartLink } from "@/components/primitives/smart-link";
import { ReadMore } from "@/components/primitives/read-more";
import type { Link, Media } from "@/lib/content/types";
import { HomeCarousel } from "../lazy"; // code-split (see sections/lazy.tsx)

type IndustryCard = { title?: string | null; description?: string | null; image?: Media | null; cta?: Link | null };
type Data = { anchorId?: string | null; heading?: string | null; description?: string | null; items?: IndustryCard[] | null };

export function IndustriesCarousel({ data }: SectionProps<Data>) {
  return (
    <section id={data.anchorId || undefined} className="bg-black px-gutter py-24 text-white 3xl:py-[120px] max-[768px]:py-16">
      <div className="mb-12 max-[768px]:mb-8">
        {data.heading ? <h2 className="font-heading text-[32px] font-semibold leading-[1.2] 3xl:text-[40px] max-[768px]:text-[24px]">{data.heading}</h2> : null}
        {data.description ? <p className="mt-4 max-w-[68ch] font-sans text-[15px] leading-[1.65] text-white/65 3xl:text-[16px] max-[768px]:text-[14.5px]">{data.description}</p> : null}
      </div>
      <HomeCarousel autoPlay={2550} speed={1500} showArrows arrowsClassName="static mt-6 translate-y-0 justify-end gap-3 px-0" contentClassName="-ml-6 max-[768px]:-ml-4" itemClassName="basis-1/4 pl-6 max-[1100px]:basis-1/3 max-[840px]:basis-1/2 max-[600px]:basis-full max-[768px]:pl-4" ariaLabel="Industries">
        {(data.items ?? []).map((item, index) => (
          <SmartLink key={`${item.title}-${index}`} href={item.cta?.href} newTab={item.cta?.openInNewTab} className="card-surface group hover-lift relative block h-[440px] overflow-hidden rounded-2xl ring-1 ring-white/10 3xl:h-[500px] max-[768px]:h-[420px]">
            <CmsImage media={item.image} alt={item.title || "Industry"} fill sizes="(max-width: 600px) 90vw, (max-width: 1025px) 45vw, 25vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/5" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 max-[768px]:p-5">
              {item.title ? <h3 className="font-heading text-[18px] font-semibold leading-[1.35] text-white 3xl:text-[20px] max-[768px]:text-[16px]">{item.title}</h3> : null}
              {item.description ? <p className="font-sans text-[15px] leading-[1.65] text-white/65 3xl:text-[16px] max-[768px]:text-[14.5px]">{item.description}</p> : null}
              {item.cta?.label ? <ReadMore label={item.cta.label} /> : null}
            </div>
          </SmartLink>
        ))}
      </HomeCarousel>
    </section>
  );
}
