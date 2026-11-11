"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useId, useState } from "react";

type Item = { title?: string | null; description?: string | null };
type Props = { items?: Item[] | null; fullWidth?: boolean; variant?: "split" | "grid" };

export function AccordionList({ items, fullWidth = false, variant = "split" }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  const grid = variant === "grid";

  return (
    <div className={grid
      ? "mt-12 grid w-full grid-cols-1 items-start gap-6 md:grid-cols-2 3xl:gap-8 max-[768px]:mt-8 max-[768px]:gap-4"
      : fullWidth ? "w-full" : "w-full xl:max-w-[48%]"}>
      {(items ?? []).map((item, index) => {
        const expanded = open === index;
        const contentId = `${id}-${index}`;
        const rowClasses = grid
          ? `card-surface rounded-2xl px-6 3xl:px-8 max-[768px]:px-5 ${expanded ? "border-brand/35" : ""}`
          : "border-b border-white/[0.07] first:border-t";
        const Icon = fullWidth ? Plus : ChevronDown;

        return (
          <div key={`${item.title}-${index}`} className={rowClasses}>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={() => setOpen(expanded ? null : index)}
              className="hover-grow group flex w-full origin-left items-center justify-between gap-5 py-6 text-left outline-offset-4 focus-visible:outline-brand max-[768px]:py-5"
            >
              <span className="font-heading text-[16.5px] font-semibold leading-[1.35] text-white transition-colors group-hover:text-brand 3xl:text-[18px] max-[768px]:text-[14.5px]">{item.title}</span>
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${expanded ? "bg-brand/15 text-brand" : "bg-white/[0.04] text-white/65 group-hover:text-brand"}`}>
                <Icon aria-hidden className={`size-4 transition-transform duration-300 motion-reduce:transition-none ${expanded ? (fullWidth ? "rotate-45" : "rotate-180") : ""}`} />
              </span>
            </button>
            <div id={contentId} className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="max-w-[68ch] whitespace-pre-line pb-6 pr-4 font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:pb-5 max-[768px]:pr-0 max-[768px]:text-[13.5px]">{item.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
