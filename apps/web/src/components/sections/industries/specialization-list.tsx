"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { Media } from "@/lib/content/types";
import { CmsImage } from "@/components/cms/cms-image";
import { cn } from "@/lib/utils";
import type { SectionProps } from "../types";

type Specialization = {
  title?: string | null;
  description?: string | null;
  image?: Media | null;
};
type Data = {
  anchorId?: string | null;
  heading?: string | null;
  backgroundImage?: Media | null;
  items?: Specialization[] | null;
};

export function SpecializationList({ data }: Pick<SectionProps<Data>, "data">) {
  const items = data.items?.filter((item) => item.title || item.description || item.image) ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const tabPrefix = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  if (!items.length) return null;

  const safeIndex = Math.min(activeIndex, items.length - 1);
  const active = items[safeIndex];
  const select = (index: number, focus = false) => {
    const nextIndex = (index + items.length) % items.length;
    setActiveIndex(nextIndex);
    if (focus) {
      requestAnimationFrame(() => {
        tabRefs.current[nextIndex]?.focus();
        tabRefs.current[nextIndex]?.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    }
  };

  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-ink px-gutter py-24 3xl:py-[120px] max-[768px]:py-16">
      <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-ink/35" />
      {data.heading ? <h2 className="font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:text-[24px]">{data.heading}</h2> : null}
      <div id={`${tabPrefix}-panel-${safeIndex}`} role="tabpanel" aria-labelledby={`${tabPrefix}-tab-${safeIndex}`} className="group relative mt-12 flex min-h-[420px] flex-col justify-end overflow-hidden rounded-2xl bg-ink ring-1 ring-white/10 3xl:min-h-[500px] max-[768px]:mt-8 max-[768px]:min-h-[380px]">
        <CmsImage
          media={active?.image}
          alt={active?.title || ""}
          fill
          sizes="(max-width: 768px) 100vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/10 max-[768px]:bg-gradient-to-t max-[768px]:from-black/95 max-[768px]:via-black/55 max-[768px]:to-black/20" aria-hidden />
        <div className="relative z-10 max-w-[600px] p-10 3xl:max-w-[680px] 3xl:p-12 max-[768px]:p-6">
          {active?.title ? <h3 className="font-heading text-[18px] font-semibold leading-[1.35] text-white 3xl:text-[20px] max-[768px]:text-[16px]">{active.title}</h3> : null}
          {active?.description ? <p className="mt-4 max-w-[68ch] font-sans text-[15px] leading-[1.65] text-white/65 3xl:text-[16px] max-[768px]:text-[14.5px]">{active.description}</p> : null}
        </div>
      </div>
      <div className="mt-6 flex items-start justify-between gap-6 max-[1025px]:flex-col max-[768px]:gap-5">
        <div role="tablist" aria-label={data.heading || "Specializations"} className="flex min-w-0 flex-1 flex-wrap gap-3 max-[768px]:gap-2">
          {items.map((item, index) => {
            const isActive = index === safeIndex;
            return (
              <button
                key={`${item.title ?? "specialization"}-${index}`}
                ref={(element) => { tabRefs.current[index] = element; }}
                id={`${tabPrefix}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tabPrefix}-panel-${index}`}
                tabIndex={0}
                onClick={() => select(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    select(index + 1, true);
                  } else if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    select(index - 1, true);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    select(0, true);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    select(items.length - 1, true);
                  }
                }}
                className={cn(
                  "hover-grow flex max-w-full items-center gap-2 rounded-full px-5 py-3 text-left font-heading text-[13px] font-semibold leading-[1.5] outline-offset-4 transition-colors focus-visible:outline-brand 3xl:text-[14px] max-[768px]:px-4 max-[768px]:text-[12.5px]",
                  isActive ? "bg-brand-gradient text-white shadow-[0_8px_22px_-10px_rgba(255,120,0,0.9)]" : "bg-white/[0.04] text-white/70 ring-1 ring-white/10 hover:text-white",
                )}
              >
                <span className={isActive ? "text-white/75" : "text-brand"}>{String(index + 1).padStart(2, "0")}</span>
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 gap-3">
          <button type="button" aria-label="Previous specialization" onClick={() => select(safeIndex - 1)} className="btn-secondary px-4 max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[14px]">
            <ArrowLeft aria-hidden className="size-4" />
          </button>
          <button type="button" aria-label="Next specialization" onClick={() => select(safeIndex + 1)} className="btn-secondary px-4 max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[14px]">
            <ArrowRight aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
