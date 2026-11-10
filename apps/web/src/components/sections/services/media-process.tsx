import type { Media } from "@/lib/content/types";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { SectionProps } from "../types";

type Point = { description?: string | null };
type Partner = { label?: string | null; image?: Media | null; href?: string | null };
type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  points?: Point[] | null;
  image?: Media | null;
  partnersHeading?: string | null;
  partners?: Partner[] | null;
  variant?: "standard" | "compact" | null;
};

/** Narrative and original process illustration, with optional delivery partners. */
export function MediaProcess({ data }: SectionProps<Data>) {
  const compact = data.variant === "compact";
  return (
    <section id={data.anchorId || undefined} className={`px-gutter py-24 3xl:py-[120px] max-[768px]:py-16 ${compact ? "bg-ink-900" : "bg-[#070401]"}`}>
      <div className="grid w-full items-center gap-12 min-[900px]:grid-cols-2 3xl:gap-16 max-[768px]:gap-8">
        <div className="min-w-0">
          <Eyebrow className="mb-2 mt-0 xl:mb-2 xl:mt-0">{data.eyebrow}</Eyebrow>
          {data.heading ? <h2 className="max-w-[26ch] font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:text-[24px]">{data.heading}</h2> : null}
          {data.description ? <p className="mt-4 max-w-[68ch] font-sans text-[17px] leading-[1.6] text-white/65 3xl:text-[19px] max-[768px]:text-[15.5px]">{data.description}</p> : null}
          {data.points?.length ? (
            <ul className="mt-5 list-disc space-y-2 pl-5 font-sans text-[15px] leading-[1.65] text-white/65 marker:text-brand/80 3xl:text-[16px] max-[768px]:text-[14.5px]">
              {data.points.map((point, index) => <li key={`${point.description}-${index}`}>{point.description}</li>)}
            </ul>
          ) : null}
        </div>
        {data.image ? (
          <div className={`relative w-full overflow-hidden rounded-2xl bg-white/[0.015] ring-1 ring-white/10 ${compact ? "aspect-[16/10]" : "aspect-[8/5]"}`}>
            <CmsImage media={data.image} alt="" fill sizes="(max-width: 899px) 100vw, 50vw" className="object-contain p-4 3xl:p-6 max-[768px]:p-2" />
          </div>
        ) : null}
      </div>
      {data.partners?.length ? (
        <div className="mt-12 w-full border-t border-white/[0.07] pt-8 3xl:mt-16 max-[768px]:mt-8">
          {data.partnersHeading ? <p className="text-center font-sans text-[13px] font-medium leading-[1.5] text-white/65 3xl:text-[14px] max-[768px]:text-[12.5px]">{data.partnersHeading}</p> : null}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 3xl:gap-8 max-[768px]:gap-4">
            {data.partners.map((partner, index) => (
              <a key={`${partner.href}-${index}`} href={partner.href || undefined} target="_blank" rel="noopener noreferrer" aria-label={partner.label || partner.image?.alternativeText || undefined} className="hover-grow relative flex h-20 w-40 items-center justify-center rounded-xl bg-white/[0.025] ring-1 ring-white/[0.07] transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-brand max-[768px]:h-16 max-[768px]:w-36">
                {partner.image ? <CmsImage media={partner.image} alt={partner.label || "icons"} fill sizes="160px" className="object-contain p-4 opacity-80 transition-opacity hover:opacity-100" /> : null}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
