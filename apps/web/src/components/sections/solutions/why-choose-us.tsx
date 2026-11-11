import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { Media, Stat } from "@/lib/content/types";
import { CountUp } from "../common/count-up";
import type { SectionProps } from "../types";

type Data = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; stats?: Stat[] | null; backgroundImage?: Media | null };

export function WhyChooseUs({ data }: SectionProps<Data>) {
  return (
    <section
      id={data.anchorId || undefined}
      className="relative isolate overflow-hidden bg-ink px-gutter py-24 text-white 3xl:py-28 max-[768px]:py-16"
    >
      <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover object-left-top" />
      <div className="absolute inset-0 -z-10 bg-ink/40" />
      <Eyebrow>{data.eyebrow}</Eyebrow>
      {data.heading ? <h2 className="font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{data.heading}</h2> : null}
      <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-3 3xl:gap-8 max-[768px]:mt-8 max-[768px]:gap-4">
        {(data.stats ?? []).map((stat, index) => {
          const numeric = /^\d+(\.\d+)?$/.test(stat.value.trim());
          return (
            <article key={`${stat.label}-${index}`} className="min-w-0 border-t border-white/[0.07] pt-6 max-[768px]:pt-5">
              <p className="font-heading text-[48px] font-semibold leading-[1.05] tabular-nums text-white 3xl:text-[55px] max-[768px]:text-[34.5px]">
                {numeric ? <CountUp value={stat.value} suffix={stat.suffix ?? ""} duration={6000} /> : `${stat.value}${stat.suffix ?? ""}`}
              </p>
              <p className="mt-3 max-w-[24ch] font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:text-[13.5px]">{stat.label}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
