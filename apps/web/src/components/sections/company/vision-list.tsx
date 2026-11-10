import { CmsImage } from "@/components/cms/cms-image";
import type { Media } from "@/lib/content/types";
import type { SectionProps } from "../types";

type VisionCard = { icon?: Media | null; title?: string | null; description?: string | null };
type Data = { anchorId?: string | null; items?: VisionCard[] | null };

export function VisionList({ data }: SectionProps<Data>) {
  const items = data.items ?? [];
  if (!items.length) return null;
  return (
    <section id={data.anchorId || undefined} className="bg-[#070401] px-gutter py-24 3xl:py-30 max-[768px]:py-16">
      <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {items.map((item, index) => (
          <article key={`${item.title ?? "vision"}-${index}`} className="grid grid-cols-[0.85fr_1.15fr] items-start gap-12 py-10 3xl:py-12 max-[768px]:grid-cols-1 max-[768px]:gap-5 max-[768px]:py-8">
            <div className="flex items-center gap-5">
              {item.icon ? (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl icon-chip max-[768px]:size-10">
                  <CmsImage media={item.icon} alt="" width={24} height={24} className="size-6 object-contain max-[768px]:size-5" />
                </div>
              ) : null}
              {item.title ? <h2 className="font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:text-[24px]">{item.title}</h2> : null}
            </div>
            {item.description ? <p className="max-w-[68ch] font-sans text-[17px] leading-[1.6] text-white/65 3xl:text-[19px] max-[768px]:text-[15.5px]">{item.description}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
