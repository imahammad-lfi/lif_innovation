import { Eyebrow } from "@/components/primitives/eyebrow";
import type { Media } from "@/lib/content/types";
import type { SectionProps } from "../types";
import { LocationCarouselClient } from "../lazy"; // code-split (see sections/lazy.tsx)

type Slide = { image?: Media | null; label?: string | null };
type Data = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; description?: string | null; slides?: Slide[] | null };

export function LocationCarousel({ data }: SectionProps<Data>) {
  return (
    <section id={data.anchorId || undefined} className="bg-[#070401] px-gutter py-24 3xl:py-30 max-[768px]:py-16">
      <div className="grid grid-cols-2 items-center gap-12 3xl:gap-20 max-[768px]:grid-cols-1 max-[768px]:gap-8">
        <div className="min-w-0">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          {data.heading ? <h2 className="max-w-[640px] whitespace-pre-line font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:text-[24px]">{data.heading}</h2> : null}
          {data.description ? <p className="mt-4 max-w-[68ch] font-sans text-[17px] leading-[1.6] text-white/65 3xl:text-[19px] max-[768px]:text-[15.5px]">{data.description}</p> : null}
        </div>
        <div className="min-w-0"><LocationCarouselClient slides={data.slides} /></div>
      </div>
    </section>
  );
}
