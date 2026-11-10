import type { ImageCard, Media } from "@/lib/content/types";
import { CmsImage } from "@/components/cms/cms-image";
import type { SectionProps } from "../types";

type Logo = { icon?: Media | null };
type Group = { heading?: string | null; logos?: Logo[] | null };
type Data = { anchorId?: string | null; backgroundImage?: Media | null; groups?: Group[] | null; industriesHeading?: string | null; industries?: ImageCard[] | null };

/** Technology ecosystem and industry experience. */
export function LogoOffering({ data }: SectionProps<Data>) {
  return (
    <section id={data.anchorId || undefined} className="relative isolate overflow-hidden bg-[#070401] px-gutter py-24 text-white 3xl:py-[120px] max-[768px]:py-16">
      {data.backgroundImage ? <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-10 object-cover" /> : null}
      <div className="relative flex flex-col gap-12 max-[768px]:gap-8">
        {data.groups?.map((group, groupIndex) => (
          <div key={`${group.heading}-${groupIndex}`}>
            {group.heading ? <h2 className="font-sans text-[12px] font-semibold leading-[1.5] tracking-[0.12em] text-white/65 3xl:text-[13px] max-[768px]:text-[11px]">{group.heading}</h2> : null}
            <div className="mt-8 flex flex-wrap items-center gap-6 3xl:gap-8 max-[768px]:mt-6 max-[768px]:gap-4">
              {group.logos?.map((logo, index) => logo.icon ? (
                <div key={`${logo.icon.url}-${index}`} className="card-surface flex h-24 min-w-0 flex-1 basis-[140px] items-center justify-center rounded-2xl p-5 max-[768px]:h-20 max-[768px]:basis-[140px] max-[768px]:p-4">
                  <CmsImage media={logo.icon} alt="icons" width={170} height={64} className="max-h-12 w-auto max-w-[140px] object-contain opacity-85 max-[768px]:max-h-10 max-[768px]:max-w-[112px]" />
                </div>
              ) : null)}
            </div>
          </div>
        ))}
        {data.industries?.length ? (
          <div>
            {data.industriesHeading ? <h2 className="mb-12 font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:mb-8 max-[768px]:text-[24px]">{data.industriesHeading}</h2> : null}
            <div className="grid grid-cols-1 gap-6 min-[481px]:grid-cols-2 min-[1100px]:grid-cols-4 3xl:gap-8 max-[768px]:gap-4">
              {data.industries.map((industry, index) => (
                <article key={`${industry.title}-${index}`} className="group relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-white/10">
                  {industry.image ? <CmsImage media={industry.image} alt={industry.title || ""} fill sizes="(max-width: 480px) 100vw, (max-width: 1099px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" /> : null}
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-6 max-[768px]:p-5">
                    {industry.title ? <h3 className="font-heading text-[18px] font-semibold leading-[1.35] text-white 3xl:text-[20px] max-[768px]:text-[16px]">{industry.title}</h3> : null}
                    <div aria-hidden className="mt-3 h-0.5 w-8 rounded-full bg-brand-line transition-all duration-300 group-hover:w-12 motion-reduce:transition-none" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
