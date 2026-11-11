import { ArrowRight } from "lucide-react";
import { CmsImage } from "@/components/cms/cms-image";
import { SmartLink } from "@/components/primitives/smart-link";
import type { Media } from "@/lib/content/types";
import type { SectionProps } from "../types";
import { CareerStrip } from "../lazy"; // code-split (see sections/lazy.tsx)

type Data = {
  anchorId?: string | null;
  heading?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  backgroundImage?: Media | null;
  images?: Media[] | null;
};

export function CareerSlider({ data }: SectionProps<Data>) {
  return (
    <section id={data.anchorId || undefined} className="relative overflow-hidden bg-ink pt-40 pb-24 3xl:pt-48 3xl:pb-28 max-[768px]:pt-32 max-[768px]:pb-16">
      {data.backgroundImage ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="object-cover" priority /> : null}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/10 via-transparent to-ink/40" />
      <div className="relative">
        {data.heading ? <h1 className="mx-auto max-w-[900px] px-gutter-box text-center font-heading text-[34.5px] font-semibold leading-[1.15] text-white 3xl:max-w-[1080px] 3xl:text-[41.5px] max-[768px]:text-[24px]">{data.heading}</h1> : null}
        {data.ctaLabel ? (
          <div className="mt-8 flex justify-center">
            <SmartLink href={data.ctaHref} newTab className="btn-primary max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[13.5px]">
              <span>{data.ctaLabel}</span>
              <ArrowRight aria-hidden className="size-4" />
            </SmartLink>
          </div>
        ) : null}
        <div className="mt-16 max-[768px]:mt-10">
          <CareerStrip images={data.images} />
        </div>
      </div>
    </section>
  );
}
