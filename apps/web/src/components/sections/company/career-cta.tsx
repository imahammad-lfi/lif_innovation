import { ArrowRight } from "lucide-react";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { SmartLink } from "@/components/primitives/smart-link";
import type { Link, Media } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Data = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; description?: string | null; cta?: Link | null; ctaIcon?: Media | null; backgroundImage?: Media | null };

export function CareerCta({ data }: SectionProps<Data>) {
  return (
    <section id={data.anchorId || undefined} className="relative overflow-hidden bg-ink text-center">
      {data.backgroundImage ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="object-cover" /> : null}
      <div aria-hidden className="absolute inset-0 bg-ink/30" />
      <div className="relative flex flex-col items-center px-gutter py-24 3xl:py-30 max-[768px]:py-16">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        {data.heading ? <h2 className="max-w-[760px] whitespace-pre-line font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:max-w-[940px] 3xl:text-[40px] max-[768px]:text-[24px]">{data.heading}</h2> : null}
        {data.description ? <p className="mt-4 max-w-[68ch] font-sans text-[17px] leading-[1.6] text-white/65 3xl:text-[19px] max-[768px]:text-[15.5px]">{data.description}</p> : null}
        {data.cta?.label ? (
          <SmartLink href={data.cta.href} newTab={data.cta.openInNewTab} className="btn-primary mt-8 max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[14px]">
            <span>{data.cta.label}</span>
            {data.ctaIcon ? <CmsImage media={data.ctaIcon} alt="" width={16} height={16} className="size-4 object-contain" /> : <span aria-hidden className="inline-flex size-4 items-center justify-center rounded-sm border border-current text-[12px] font-bold leading-none">in</span>}
            <ArrowRight aria-hidden className="size-4" />
          </SmartLink>
        ) : null}
      </div>
    </section>
  );
}
