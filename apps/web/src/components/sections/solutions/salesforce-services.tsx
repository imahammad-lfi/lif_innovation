"use client";

import { useId, useState } from "react";
import { CmsImage } from "@/components/cms/cms-image";
import { Markdown } from "@/components/cms/markdown";
import type { IconCard, Media } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Tab = { label?: string | null; title?: string | null; description?: string | null; cards?: IconCard[] | null };
type Data = { anchorId?: string | null; heading?: string | null; tabs?: Tab[] | null; backgroundImage?: Media | null };

export function SalesforceServices({ data }: Pick<SectionProps<Data>, "data">) {
  const tabs = data.tabs ?? [];
  const [active, setActive] = useState(0);
  const current = tabs[active] ?? tabs[0];
  const baseId = useId();

  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-ink px-gutter py-24 3xl:py-28 max-[768px]:py-16">
      <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-ink/80" />
      {data.heading ? <h2 className="font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{data.heading}</h2> : null}
      <div role="tablist" aria-label={data.heading || "Services"} className="mt-8 flex flex-wrap gap-3 pb-2 max-[768px]:mt-6 max-[768px]:gap-2">
        {tabs.map((tab, index) => (
          <button
            key={`${tab.label}-${index}`}
            id={`${baseId}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls={`${baseId}-panel-${index}`}
            onClick={() => setActive(index)}
            className={`hover-grow rounded-full px-5 py-3 font-heading text-[12.5px] font-semibold leading-[1.5] outline-offset-4 transition-colors focus-visible:outline-brand 3xl:text-[13.5px] max-[768px]:px-4 max-[768px]:text-[12px] ${active === index ? "bg-brand-gradient text-white shadow-[0_8px_22px_-10px_rgba(255,120,0,0.9)]" : "bg-white/[0.04] text-white/70 ring-1 ring-white/10 hover:text-white"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <article id={`${baseId}-panel-${active}`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active}`} className="mt-10 border-t border-white/[0.07] pt-10 max-[768px]:mt-6 max-[768px]:pt-8">
        {current?.title ? <h3 className="font-heading text-[16.5px] font-semibold leading-[1.35] text-white 3xl:text-[18px] max-[768px]:text-[14.5px]">{current.title}</h3> : null}
        <Markdown className="mt-4 max-w-[68ch] font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:text-[13.5px]">{current?.description}</Markdown>
        {current?.cards?.length ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 3xl:gap-8 max-[768px]:gap-4">
            {current.cards.map((card, index) => (
              <article key={`${card.title}-${index}`} className="card-surface hover-lift flex items-center gap-4 rounded-2xl p-6 3xl:p-8 max-[768px]:p-5">
                {card.icon ? (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl icon-chip max-[768px]:size-10">
                    <CmsImage media={card.icon} alt="" width={24} height={24} className="size-6 object-contain max-[768px]:size-5" />
                  </div>
                ) : null}
                <p className="font-heading text-[16.5px] font-semibold leading-[1.35] text-white 3xl:text-[18px] max-[768px]:text-[14.5px]">{card.title}</p>
              </article>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
