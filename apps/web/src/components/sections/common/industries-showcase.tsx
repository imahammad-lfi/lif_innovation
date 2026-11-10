import { ArrowUpRight } from "lucide-react";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { SmartLink } from "@/components/primitives/smart-link";
import type { ImageCard, Media } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  items?: ImageCard[] | null;
  backgroundImage?: Media | null;
};

function Tile({ item }: { item: ImageCard }) {
  const inner = (
    <>
      <CmsImage
        media={item.image}
        alt={item.title ?? ""}
        fill
        sizes="(max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
      />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_30%,rgba(0,0,0,0.85)_100%)]" />
      {item.href ? (
        <span
          aria-hidden
          className="absolute right-3 top-3 flex size-8 translate-y-1 items-center justify-center rounded-full bg-white/15 text-white opacity-0 ring-1 ring-white/25 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:bg-brand-gradient group-hover:opacity-100 group-hover:ring-brand"
        >
          <ArrowUpRight className="size-4" />
        </span>
      ) : null}
      <div className="absolute inset-x-4 bottom-4 xl:inset-x-5 xl:bottom-5">
        <h3 className="font-heading text-[15px] font-semibold leading-[1.3] text-white sm:text-[17px] xl:text-[18px] 3xl:text-[20px]">{item.title}</h3>
        <div className="mt-2 h-[3px] w-8 rounded-full bg-brand-line transition-[width] duration-500 group-hover:w-14" />
      </div>
    </>
  );
  const cls = "group relative block h-[150px] overflow-hidden rounded-2xl ring-1 ring-white/10 sm:h-[180px] xl:h-[200px] 3xl:h-[240px]";
  return item.href ? (
    <SmartLink href={item.href} className={`${cls} hover-lift`}>
      {inner}
    </SmartLink>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** "OUR EXPERTISE – Constantly Innovating": industry photo tiles on a dark background. */
export function IndustriesShowcase({ data }: SectionProps<Data>) {
  return (
    <section
      id={data.anchorId || undefined}
      className="relative isolate flex w-full flex-col overflow-hidden bg-ink px-gutter py-16 xl:py-24 3xl:py-28"
    >
      <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/60" />
      <Eyebrow>{data.eyebrow}</Eyebrow>
      {data.heading ? (
        <h2 className="mt-2 font-heading text-[24px] font-semibold leading-[1.2] text-white xl:text-[32px] 3xl:text-[40px]">{data.heading}</h2>
      ) : null}
      {data.description ? (
        <p className="mt-4 max-w-[68ch] font-sans text-[15px] leading-[1.7] text-white/70 xl:text-[16px] 3xl:text-[18px]">{data.description}</p>
      ) : null}
      {data.items?.length ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:mt-12 xl:gap-5">
          {data.items.map((item, i) => (
            <Tile key={item.title ?? i} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
