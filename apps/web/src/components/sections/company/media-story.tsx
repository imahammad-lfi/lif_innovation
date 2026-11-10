import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { Media } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  image?: Media | null;
  reverse?: boolean | null;
  roundedImage?: boolean | null;
};

export function MediaStory({ data }: SectionProps<Data>) {
  const direction = data.reverse ? "min-[770px]:flex-row-reverse" : "min-[770px]:flex-row";
  return (
    <section id={data.anchorId || undefined} className="bg-[#070401] px-gutter py-24 3xl:py-30 max-[768px]:py-16">
      <div className={`flex w-full flex-col items-center gap-12 3xl:gap-20 max-[768px]:gap-8 ${direction}`}>
        <div className="min-w-0 w-full min-[770px]:flex-1">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          {data.heading ? <h2 className="max-w-[640px] whitespace-pre-line font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:text-[24px]">{data.heading}</h2> : null}
          {data.description ? <p className="mt-4 max-w-[68ch] whitespace-pre-line font-sans text-[17px] leading-[1.6] text-white/65 3xl:text-[19px] max-[768px]:text-[15.5px]">{data.description}</p> : null}
        </div>
        <div className={`relative aspect-[1.45] w-full min-w-0 min-[770px]:flex-1 ${data.roundedImage ? "overflow-hidden rounded-2xl ring-1 ring-white/10" : ""}`}>
          {data.image ? <CmsImage media={data.image} alt={data.heading ?? ""} fill sizes="(max-width: 769px) 100vw, 50vw" className={data.roundedImage ? "object-cover" : "object-contain"} /> : null}
        </div>
      </div>
    </section>
  );
}
