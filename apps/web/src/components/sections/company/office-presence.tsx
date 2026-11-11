import { ArrowRight } from "lucide-react";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { SmartLink } from "@/components/primitives/smart-link";
import type { Media } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Office = { icon?: Media | null; country?: string | null; address?: string | null; phone?: string | null; directionsLabel?: string | null; directionsHref?: string | null };
type Data = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; mapImage?: Media | null; offices?: Office[] | null };

export function OfficePresence({ data }: SectionProps<Data>) {
  const offices = data.offices ?? [];
  return (
    <section id={data.anchorId || undefined} className="bg-ink px-gutter py-24 3xl:py-28 max-[768px]:py-16">
      <Eyebrow>{data.eyebrow}</Eyebrow>
      {data.heading ? <h2 className="max-w-[900px] font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{data.heading}</h2> : null}
      {data.mapImage ? (
        <div className="relative my-12 aspect-[2.12] w-full overflow-hidden rounded-2xl max-[768px]:my-8">
          <CmsImage media={data.mapImage} alt="Global offices map" fill sizes="100vw" className="object-contain" />
        </div>
      ) : null}
      {offices.length ? (
        <div className="grid grid-cols-3 gap-6 3xl:gap-8 max-[1025px]:grid-cols-2 max-[639px]:grid-cols-1 max-[768px]:gap-4">
          {offices.map((office, index) => (
            <SmartLink key={`${office.country ?? "office"}-${index}`} href={office.directionsHref} newTab className="card-surface hover-lift group flex h-full flex-col rounded-2xl p-6 3xl:p-8 max-[768px]:p-5">
              <div className="flex items-center gap-4">
                {office.icon ? (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 max-[768px]:size-10">
                    <CmsImage media={office.icon} alt="" width={24} height={24} className="size-6 object-contain max-[768px]:size-5" />
                  </div>
                ) : null}
                {office.country ? <h3 className="font-heading text-[16.5px] font-semibold leading-[1.35] text-white 3xl:text-[18px] max-[768px]:text-[14.5px]">{office.country}</h3> : null}
              </div>
              <div className="mt-5 flex-1">
                {office.address ? <p className="max-w-[68ch] whitespace-pre-line font-sans text-[12.5px] leading-[1.5] text-white/65 3xl:text-[13.5px] max-[768px]:text-[12px]">{office.address}</p> : null}
                {office.phone ? <p className="mt-4 whitespace-pre-line font-sans text-[12.5px] leading-[1.5] text-white/65 3xl:text-[13.5px] max-[768px]:text-[12px]">{office.phone}</p> : null}
              </div>
              {office.directionsLabel ? <span className="btn-secondary mt-6 self-start group-hover:border-brand/40 max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[13.5px]"><span>{office.directionsLabel}</span><ArrowRight aria-hidden className="size-4" /></span> : null}
            </SmartLink>
          ))}
        </div>
      ) : null}
    </section>
  );
}
