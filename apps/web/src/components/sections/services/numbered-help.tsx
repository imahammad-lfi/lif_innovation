import type { Media } from "@/lib/content/types";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { SectionProps } from "../types";

type Item = { description?: string | null };
type Data = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; backgroundImage?: Media | null; items?: Item[] | null };

/** "Assess - Map dependencies…" -> title "Assess" + text. Items without a short lead-in keep the whole text. */
function splitStep(text: string) {
  const m = text.match(/^(.{2,60}?)\s+[-–—]\s+([\s\S]+)$/);
  return m ? { title: m[1].trim(), text: m[2].trim() } : { title: null, text };
}

/**
 * "Our approach" process band (service pages): a compact numbered timeline instead of a tall full-colour block.
 * Desktop shows the steps in one row joined by a gradient rule; tablets two columns; phones a single column.
 * Editors write each step as "Title - description"; the lead-in becomes the step title.
 */
export function NumberedHelp({ data }: SectionProps<Data>) {
  const items = (data.items ?? []).filter((item) => item.description);
  const cols = items.length === 3 ? "xl:grid-cols-3" : items.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-2";
  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-[#0a1630] px-gutter py-16 3xl:py-20 max-[768px]:py-12">
      {data.backgroundImage ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-25" /> : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_90%_at_0%_0%,rgba(59,111,224,0.26),transparent_62%),radial-gradient(40%_70%_at_100%_100%,rgba(255,140,0,0.12),transparent_60%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12)_30%,rgba(255,255,255,0.12)_70%,transparent)]" />
      <div className="relative">
        <Eyebrow className="mb-2 mt-0 xl:mb-2 xl:mt-0">{data.eyebrow}</Eyebrow>
        {data.heading ? (
          <h2 className="max-w-[32ch] text-balance font-heading text-[27.5px] font-semibold leading-[1.2] tracking-[-0.015em] text-white 3xl:text-[27.5px] max-[768px]:text-[21.5px]">{data.heading}</h2>
        ) : null}
        {/* Desktop: one rule through the step markers (::before). */}
        <ol
          className={`relative mt-10 grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 ${cols} xl:before:pointer-events-none xl:before:absolute xl:before:left-[18px] xl:before:right-0 xl:before:top-[18px] xl:before:h-px xl:before:bg-[linear-gradient(90deg,rgba(255,140,0,0.7),rgba(255,255,255,0.14)_45%,rgba(59,111,224,0.6))] 3xl:mt-12 3xl:gap-x-10 max-[768px]:mt-8 max-[768px]:gap-y-6`}
        >
          {items.map((item, index) => {
            const step = splitStep(item.description || "");
            return (
              <li key={`${index}-${step.title ?? ""}`} className="group relative min-w-0 max-xl:pl-[52px]">
                <span aria-hidden className="relative z-10 inline-flex rounded-full bg-[linear-gradient(135deg,#FFB21E,#FF7800_50%,#3b6fe0)] p-px shadow-[0_0_18px_-6px_rgba(255,140,0,0.7)] transition-[box-shadow,transform] duration-300 group-hover:scale-105 group-hover:shadow-[0_0_22px_-4px_rgba(255,140,0,0.85)] motion-reduce:transform-none max-xl:absolute max-xl:left-0 max-xl:top-0">
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#0c1b3a] font-heading text-[12.5px] font-semibold tabular-nums text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>
                {step.title ? (
                  <h3 className="font-heading text-[14.5px] font-semibold leading-[1.35] text-white xl:mt-5 3xl:text-[16.5px] max-xl:pt-[7px]">
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </h3>
                ) : (
                  <span className="sr-only">Step {index + 1}</span>
                )}
                <p className={`max-w-[60ch] font-sans text-[13.5px] leading-[1.65] text-white/65 3xl:text-[14.5px] ${step.title ? "mt-2" : "xl:mt-5 max-xl:pt-[7px]"}`}>{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
