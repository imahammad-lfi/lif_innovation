import type { SectionProps } from "../types";
import { CmsImage } from "@/components/cms/cms-image";
import { SmartLink } from "@/components/primitives/smart-link";
import type { Link, Media } from "@/lib/content/types";
import { ArrowRight } from "lucide-react";

type Data = { anchorId?: string | null; backgroundImage?: Media | null; heading?: string | null; cta?: Link | null };

export function CareersBanner({ data }: SectionProps<Data>) {
  return (
    <section id={data.anchorId || undefined} className="relative isolate flex flex-col items-center justify-center overflow-hidden bg-black px-gutter py-24 text-center text-white 3xl:py-[120px] max-[768px]:py-16">
      {data.backgroundImage ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" /> : null}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/30" />
      {data.heading ? <h2 className="max-w-[700px] font-heading text-[32px] font-semibold leading-[1.2] 3xl:text-[40px] max-[768px]:text-[24px]">{data.heading}</h2> : null}
      {data.cta?.label ? <SmartLink href={data.cta.href} newTab={data.cta.openInNewTab} className="btn-primary mt-8 max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[14px]"><span>{data.cta.label}</span><ArrowRight aria-hidden className="size-4" /></SmartLink> : null}
    </section>
  );
}
