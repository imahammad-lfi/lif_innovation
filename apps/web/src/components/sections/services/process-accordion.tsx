"use client";

import { ChevronDown } from "lucide-react";
import type { Media } from "@/lib/content/types";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { SectionProps } from "../types";

type Item = { title?: string | null; description?: string | null };
type Logo = { label?: string | null; image?: Media | null; href?: string | null };
type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  backgroundImage?: Media | null;
  backgroundStyle?: "image" | "dark" | null;
  image?: Media | null;
  imageVariant?: "standard" | "compact" | null;
  items?: Item[] | null;
  logos?: Logo[] | null;
};

/** Single-open process accordion with compact type and aligned controls. */
export function ProcessAccordion({ data }: Pick<SectionProps<Data>, "data">) {
  const hasArtwork = data.backgroundStyle !== "dark" && data.backgroundImage;
  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-ink px-gutter py-24 3xl:py-28 max-[768px]:py-16">
      {hasArtwork ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-10 object-cover" /> : null}
      <div className="relative">
        <div className="grid items-start gap-12 min-[1100px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] 3xl:gap-20 max-[768px]:gap-8">
          <div className="min-w-0">
            <Eyebrow className="mb-2 mt-0 xl:mb-2 xl:mt-0">{data.eyebrow}</Eyebrow>
            {data.heading ? <h2 className="max-w-[26ch] font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{data.heading}</h2> : null}
            {data.description ? <p className="mt-4 max-w-[68ch] font-sans text-[15.5px] leading-[1.6] text-white/65 3xl:text-[16.5px] max-[768px]:text-[14.5px]">{data.description}</p> : null}
          </div>
          <Accordion type="single" collapsible className="w-full min-w-0 border-t border-white/[0.07]">
            {data.items?.map((item, index) => (
              <AccordionItem key={`${item.title}-${index}`} value={`item-${index}`} className="border-b border-white/[0.07] last:border-b">
                <AccordionTrigger className="group items-center gap-5 rounded-none px-0 py-6 text-left hover:no-underline focus-visible:border-transparent focus-visible:ring-brand/40 [&_[data-slot=accordion-trigger-icon]]:hidden max-[768px]:py-5">
                  <span className="font-heading text-[16.5px] font-semibold leading-[1.35] text-white transition-colors group-hover:text-brand group-data-[state=open]:text-brand 3xl:text-[18px] max-[768px]:text-[14.5px]">{item.title}</span>
                  <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/10 transition-colors group-hover:bg-brand/10 group-data-[state=open]:bg-brand/10 group-data-[state=open]:text-brand">
                    <ChevronDown className="size-4 text-white/65 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="h-auto! max-w-[68ch] pb-6 pr-10 font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:pr-0 max-[768px]:text-[13.5px]">{item.description}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        {data.image ? (
          <div className={`relative mx-auto mt-12 w-full overflow-hidden rounded-2xl bg-white/[0.015] ring-1 ring-white/10 max-[768px]:mt-8 ${data.imageVariant === "compact" ? "aspect-[16/6] max-[768px]:aspect-[16/9]" : "aspect-[16/7] max-[768px]:aspect-[4/3]"}`}>
            <CmsImage media={data.image} alt="" fill sizes="100vw" className="object-contain p-4 max-[768px]:p-2" />
          </div>
        ) : null}
        {data.logos?.length ? (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 border-t border-white/[0.07] pt-8 3xl:gap-8 max-[768px]:mt-8 max-[768px]:gap-4">
            {data.logos.map((logo, index) => (
              <div key={`${logo.label}-${index}`} className="relative h-20 w-24 shrink-0 rounded-xl bg-white/[0.025] ring-1 ring-white/[0.07] max-[768px]:h-16 max-[768px]:w-20">
                {logo.href ? <a href={logo.href} aria-label={logo.label || undefined} className="hover-grow block size-full rounded-xl focus-visible:outline-2 focus-visible:outline-brand"><CmsImage media={logo.image} alt={logo.label || ""} fill sizes="96px" className="object-contain p-4" /></a> : logo.image ? <CmsImage media={logo.image} alt={logo.label || ""} fill sizes="96px" className="object-contain p-4" /> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
