import type { Media } from "@/lib/content/types";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { ReadMore } from "@/components/primitives/read-more";
import type { SectionProps } from "../types";

type Tool = {
  title?: string | null;
  description?: string | null;
  actionLabel?: string | null;
  actionUrl?: string | null;
};
type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  backgroundImage?: Media | null;
  tools?: Tool[] | null;
};

export function BuildingTools({ data }: SectionProps<Data>) {
  const tools = data.tools ?? [];
  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-ink px-gutter py-24 text-white 3xl:py-[120px] max-[768px]:py-16">
      <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-ink/65" />
      <Eyebrow>{data.eyebrow}</Eyebrow>
      {data.heading ? <h2 className="font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:text-[24px]">{data.heading}</h2> : null}
      {tools.length ? (
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 3xl:gap-8 max-[768px]:mt-8 max-[768px]:gap-4">
          {tools.map((tool, index) => (
            <article key={`${tool.title ?? "tool"}-${index}`} className="card-surface flex min-w-0 flex-col rounded-2xl p-6 3xl:p-8 max-[768px]:p-5">
              <h3 className="flex items-center gap-4 font-heading text-[18px] font-semibold leading-[1.35] text-white 3xl:text-[20px] max-[768px]:text-[16px]">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/20 max-[768px]:size-10">{index + 1}.</span>
                {tool.title}
              </h3>
              <div className="my-5 h-px bg-white/[0.07] max-[768px]:my-4" />
              {tool.description ? <p className="max-w-[68ch] font-sans text-[15px] leading-[1.65] text-white/65 3xl:text-[16px] max-[768px]:text-[14.5px]">{tool.description}</p> : null}
              <div className="mt-auto pt-6"><ReadMore href={tool.actionUrl} label={tool.actionLabel} /></div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
