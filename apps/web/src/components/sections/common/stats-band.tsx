import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { Media, Stat } from "@/lib/content/types";
import type { SectionProps } from "../types";
import { CountUp } from "./count-up";

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  stats?: Stat[] | null;
  backgroundImage?: Media | null;
};

/** "WHY US – Persistently Innovative": heading + copy and animated counters in glass cards on a dark photo. */
export function StatsBand({ data }: SectionProps<Data>) {
  return (
    <section
      id={data.anchorId || undefined}
      className="relative isolate flex w-full flex-col gap-12 overflow-hidden bg-ink px-gutter py-16 xl:gap-14 xl:py-24 3xl:py-28"
    >
      <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0.75))]" />
      <div className="flex flex-col">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <div className="mt-2 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between xl:gap-16">
          {data.heading ? (
            <h2 className="font-heading text-[21.5px] font-semibold leading-[1.2] text-white xl:max-w-[40%] xl:text-[27.5px] 3xl:text-[34.5px]">
              {data.heading}
            </h2>
          ) : null}
          {data.description ? (
            <p className="max-w-[68ch] font-sans text-[14px] leading-[1.7] text-white/70 xl:max-w-[52%] xl:text-[14.5px] 3xl:text-[16.5px]">
              {data.description}
            </p>
          ) : null}
        </div>
      </div>
      {data.stats?.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">
          {data.stats.map((s, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition-colors duration-300 hover:border-brand/40 sm:p-6 3xl:p-8"
            >
              <span aria-hidden className="absolute left-5 top-0 h-[3px] w-10 rounded-b-full bg-brand-line sm:left-6 3xl:left-8" />
              <p className="bg-gradient-to-br from-white to-white/60 bg-clip-text font-heading text-[27.5px] font-semibold leading-[1.05] text-transparent sm:text-[40px] xl:text-[48px] 3xl:text-[55px]">
                <CountUp value={s.value} suffix={s.suffix ?? ""} />
              </p>
              <p className="mt-2 font-sans text-[12.5px] leading-[1.45] text-white/70 sm:text-[13.5px] xl:mt-3 xl:text-[14px] 3xl:text-[14.5px]">{s.label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
