import type { Media } from "@/lib/content/types";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { SectionProps } from "../types";

type Item = { description?: string | null };
type Data = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; backgroundImage?: Media | null; items?: Item[] | null };

export function NumberedHelp({ data }: SectionProps<Data>) {
  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-[#102f5e] px-gutter py-24 3xl:py-[120px] max-[768px]:py-16">
      {data.backgroundImage ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-10 object-cover" /> : null}
      <div className="relative">
        <Eyebrow className="mb-2 mt-0 xl:mb-2 xl:mt-0">{data.eyebrow}</Eyebrow>
        {data.heading ? <h2 className="max-w-[28ch] font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:text-[24px]">{data.heading}</h2> : null}
        <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2 3xl:gap-x-16 3xl:gap-y-8 max-[768px]:mt-8 max-[768px]:gap-4">
          {data.items?.map((item, index) => (
            <article key={`${item.description}-${index}`} className="flex min-w-0 items-start gap-6 border-t border-white/[0.07] pt-6 max-[768px]:gap-5 max-[768px]:pt-5">
              <span aria-hidden className="min-w-[64px] shrink-0 border-l-2 border-brand pl-4 font-heading text-[56px] font-semibold leading-[1.05] tabular-nums text-white/80 3xl:min-w-[72px] 3xl:text-[64px] max-[768px]:min-w-[48px] max-[768px]:pl-3 max-[768px]:text-[40px]">{index + 1}</span>
              <p className="max-w-[68ch] pt-1 font-sans text-[15px] leading-[1.65] text-white/65 3xl:text-[16px] max-[768px]:pt-0 max-[768px]:text-[14.5px]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
