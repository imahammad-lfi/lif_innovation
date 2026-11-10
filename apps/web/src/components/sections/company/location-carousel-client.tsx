"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { CmsImage } from "@/components/cms/cms-image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { Media } from "@/lib/content/types";

type Slide = { image?: Media | null; label?: string | null };

export function LocationCarouselClient({ slides }: { slides?: Slide[] | null }) {
  const items = (slides ?? []).filter((slide) => slide.image?.url);
  if (!items.length) return null;
  return (
    <Carousel opts={{ loop: items.length > 1 }} className="w-full">
      <CarouselContent className="ml-0">
        {items.map((slide, index) => (
          <CarouselItem key={`${slide.label ?? "location"}-${index}`} className="basis-full pl-0">
            <article className="card-surface overflow-hidden rounded-2xl p-3">
              <div className="group relative aspect-[1.6] w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
                <CmsImage media={slide.image} alt={slide.label ?? ""} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" />
              </div>
              <div className="flex items-center justify-between gap-4 px-3 pt-5 pb-2 max-[768px]:px-2">
                {slide.label ? <h3 className="font-heading text-[18px] font-semibold leading-[1.35] text-white 3xl:text-[20px] max-[768px]:text-[16px]">{slide.label}</h3> : null}
                {items.length > 1 ? (
                  <div className="flex shrink-0 gap-2">
                    <CarouselPrevious aria-label="Previous location" className="hover-grow static size-10 translate-x-0 translate-y-0 rounded-full border-white/10 bg-white/[0.04] text-white hover:border-brand/40 hover:bg-brand/10 hover:text-brand disabled:opacity-40" variant="ghost">
                      <ChevronLeft className="size-4" />
                    </CarouselPrevious>
                    <CarouselNext aria-label="Next location" className="hover-grow static size-10 translate-x-0 translate-y-0 rounded-full border-white/10 bg-white/[0.04] text-white hover:border-brand/40 hover:bg-brand/10 hover:text-brand disabled:opacity-40" variant="ghost">
                      <ChevronRight className="size-4" />
                    </CarouselNext>
                  </div>
                ) : null}
              </div>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
