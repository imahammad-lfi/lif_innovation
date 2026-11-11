"use client";

import * as React from "react";

import { CmsImage } from "@/components/cms/cms-image";
import type { Media, Stat } from "@/lib/content/types";

import type { SectionProps } from "../types";

type Data = { anchorId?: string | null; backgroundImage?: Media | null; heading?: string | null; description?: string | null; stats?: Stat[] | null };

function useCounts(stats: Stat[]) {
  const ref = React.useRef<HTMLElement>(null);
  const [counts, setCounts] = React.useState(() => stats.map(() => 0));

  React.useEffect(() => {
    const node = ref.current;
    if (!node || !stats.length) return;
    let frame = 0;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const startedAt = performance.now();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tick = (now: number) => {
        const progress = reducedMotion ? 1 : Math.min((now - startedAt) / 1350, 1);
        setCounts(stats.map((stat) => Math.round(Number.parseFloat(stat.value || "0") * progress)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) start(); }, { threshold: 0.3 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [stats]);

  return { ref, counts };
}

export function Journey({ data }: Pick<SectionProps<Data>, "data">) {
  const stats = data.stats ?? [];
  const { ref, counts } = useCounts(stats);

  return (
    <section ref={ref} id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-black px-gutter py-24 text-white 3xl:py-28 max-[768px]:py-16">
      {data.backgroundImage ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover object-center" /> : null}
      <div className="relative grid grid-cols-2 items-center gap-20 max-[1025px]:gap-12 max-[768px]:grid-cols-1 max-[768px]:gap-8">
        <div>
          {data.heading ? <h2 className="mb-4 max-w-[440px] font-heading text-[27.5px] font-semibold leading-[1.2] 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{data.heading}</h2> : null}
          {data.description ? <p className="max-w-[68ch] font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:text-[13.5px]">{data.description}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8">
          {stats.map((stat, index) => (
            <div key={`${stat.label}-${index}`} className="border-t border-white/[0.1] pt-5">
              <p className="font-heading text-[48px] font-semibold leading-[1.05] text-white 3xl:text-[55px] max-[768px]:text-[34.5px]">{counts[index] ?? 0}{stat.suffix}</p>
              {stat.label ? <p className="mt-3 font-sans text-[12.5px] leading-[1.5] text-white/65 3xl:text-[13.5px] max-[768px]:text-[12px]">{stat.label}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
