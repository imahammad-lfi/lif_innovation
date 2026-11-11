import { CmsImage } from "@/components/cms/cms-image";
import { Markdown } from "@/components/cms/markdown";
import { Eyebrow } from "@/components/primitives/eyebrow";
import type { IconCard, Media, TextItem } from "@/lib/content/types";
import type { SectionProps } from "../types";
import { AccordionList } from "../lazy"; // code-split (see sections/lazy.tsx)

type AccordionItem = { title?: string | null; description?: string | null };
type SplitData = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; description?: string | null; items?: AccordionItem[] | null; backgroundImage?: Media | null };
type StackData = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; items?: AccordionItem[] | null; backgroundImage?: Media | null; variant?: "full" | "grid" | "static-grid" | null };
type GridData = { anchorId?: string | null; eyebrow?: string | null; heading?: string | null; description?: string | null; cards?: IconCard[] | null; variant?: "dark" | "transparent" | "intro" | "offer-rows" | null; backgroundImage?: Media | null };
type NumberedData = { anchorId?: string | null; heading?: string | null; items?: TextItem[] | null };

const sectionClass = "relative isolate overflow-hidden bg-ink px-gutter py-24 3xl:py-28 max-[768px]:py-16";
const titleClass = "font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]";
const cardTitleClass = "font-heading text-[16.5px] font-semibold leading-[1.35] text-white 3xl:text-[18px] max-[768px]:text-[14.5px]";
const bodyClass = "max-w-[68ch] font-sans text-[14px] leading-[1.65] text-white/65 3xl:text-[14.5px] max-[768px]:text-[13.5px]";

export function SplitAccordion({ data }: SectionProps<SplitData>) {
  return (
    <section id={data.anchorId || undefined} className={sectionClass}>
      <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-ink/80" />
      <div className="flex flex-col justify-between gap-12 xl:flex-row max-[768px]:gap-8">
        <div className="min-w-0 xl:w-[42%]">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          {data.heading ? <h2 className={titleClass}>{data.heading}</h2> : null}
          <Markdown className={`mt-4 ${bodyClass}`}>{data.description}</Markdown>
        </div>
        <AccordionList items={data.items} />
      </div>
    </section>
  );
}

export function AccordionStack({ data }: SectionProps<StackData>) {
  const variant = data.variant || "full";
  if (variant === "grid") {
    return (
      <section id={data.anchorId || undefined} className={sectionClass}>
        <Eyebrow>{data.eyebrow}</Eyebrow>
        {data.heading ? <h2 className={`max-w-[1040px] ${titleClass}`}>{data.heading}</h2> : null}
        <AccordionList items={data.items} variant="grid" />
      </section>
    );
  }
  if (variant === "static-grid") {
    return (
      <section id={data.anchorId || undefined} className={sectionClass}>
        <Eyebrow>{data.eyebrow}</Eyebrow>
        {data.heading?.trim() ? <h2 className={`max-w-[1040px] ${titleClass}`}>{data.heading}</h2> : null}
        <div className="mt-8 border-t border-brand/40 max-[768px]:mt-6">
          {(data.items ?? []).map((item, index) => (
            <article key={`${item.title}-${index}`} className="grid grid-cols-1 gap-4 border-b border-white/[0.07] py-8 last:border-b-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12 3xl:py-10 max-[768px]:py-6">
              <h3 className={cardTitleClass}>{item.title}</h3>
              <p className={`whitespace-pre-line ${bodyClass}`}>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }
  const titled = Boolean(data.eyebrow || data.heading);
  return (
    <section id={data.anchorId || undefined} className={sectionClass}>
      <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-40" />
      {titled ? (
        <div className="mb-12 max-[768px]:mb-8">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          {data.heading ? <h2 className={`max-w-[1040px] ${titleClass}`}>{data.heading}</h2> : null}
        </div>
      ) : null}
      <AccordionList items={data.items} fullWidth />
    </section>
  );
}

export function CardGrid({ data }: SectionProps<GridData>) {
  const cards = data.cards ?? [];
  if (data.variant === "intro") {
    const mission = cards[0];
    return (
      <section id={data.anchorId || undefined} className={sectionClass}>
        <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-ink/65" />
        <Eyebrow>{data.eyebrow}</Eyebrow>
        {data.heading ? <h2 className={titleClass}>{data.heading}</h2> : null}
        {mission ? (
          <div className="mt-12 grid grid-cols-1 gap-4 border-t border-white/[0.07] pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12 max-[768px]:mt-8 max-[768px]:pt-6">
            <h3 className={cardTitleClass}>{mission.title}</h3>
            <p className={bodyClass}>{mission.description}</p>
          </div>
        ) : null}
      </section>
    );
  }
  if (data.variant === "offer-rows") {
    return (
      <section id={data.anchorId || undefined} className={sectionClass}>
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <div className="grid grid-cols-1 items-start gap-4 border-b border-brand/40 pb-8 md:grid-cols-2 md:gap-12 max-[768px]:pb-6">
          <h2 className={titleClass}>{data.heading}</h2>
          <Markdown className={bodyClass}>{data.description}</Markdown>
        </div>
        {cards.map((card, index) => (
          <article key={`${card.title}-${index}`} className="grid grid-cols-1 gap-4 border-b border-white/[0.07] py-8 last:border-b-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12 3xl:py-10 max-[768px]:py-6">
            <h3 className={cardTitleClass}>{card.title}</h3>
            <p className={bodyClass}>{card.description}</p>
          </article>
        ))}
      </section>
    );
  }
  const transparent = data.variant === "transparent";
  const n = cards.length;
  // Dark grids balance their rows by card count: 2 side by side, 4 in one row, 5 as 3 + 2 (wider bottom pair).
  const darkCols = n === 2 ? "md:grid-cols-2" : n === 4 ? "md:grid-cols-2 xl:grid-cols-4" : n === 5 ? "md:grid-cols-2 xl:grid-cols-6" : "md:grid-cols-2 xl:grid-cols-3";
  const spanFor = (index: number) => (n !== 5 || transparent ? "" : index < 3 ? "xl:col-span-2" : index === 4 ? "md:col-span-2 xl:col-span-3" : "xl:col-span-3");
  return (
    <section id={data.anchorId || undefined} className={sectionClass}>
      {!transparent ? (
        <>
          <CmsImage media={data.backgroundImage} alt="" fill sizes="100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-ink/80" />
        </>
      ) : null}
      <div className={transparent ? "grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] max-[768px]:gap-8" : ""}>
        <div className="max-w-[1040px]">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          {data.heading ? <h2 className={titleClass}>{data.heading}</h2> : null}
          <Markdown className={`mt-4 ${bodyClass}`}>{data.description}</Markdown>
        </div>
        {cards.length ? (
          <div className={`grid grid-cols-1 gap-6 3xl:gap-8 max-[768px]:gap-4 ${transparent ? "md:grid-cols-2" : `mt-12 ${darkCols} max-[768px]:mt-8`}`}>
            {cards.map((card, index) => (
              <article key={`${card.title}-${index}`} className={`card-surface hover-lift rounded-2xl p-6 3xl:p-8 max-[768px]:p-5 ${spanFor(index)}`}>
                {card.icon ? (
                  <div className="mb-6 flex size-11 items-center justify-center rounded-xl icon-chip max-[768px]:mb-5 max-[768px]:size-10">
                    <CmsImage media={card.icon} alt="" width={24} height={24} className="size-6 object-contain max-[768px]:size-5" />
                  </div>
                ) : null}
                {card.title ? <h3 className={cardTitleClass}>{card.title}</h3> : null}
                {card.description ? <p className={`mt-3 ${bodyClass}`}>{card.description}</p> : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function NumberedList({ data }: SectionProps<NumberedData>) {
  return (
    <section id={data.anchorId || undefined} className={sectionClass}>
      <h2 className={titleClass}>{data.heading}</h2>
      <ol className="mt-12 grid grid-cols-1 gap-x-6 md:grid-cols-2 3xl:gap-x-8 max-[768px]:mt-8">
        {(data.items ?? []).map((item, index) => (
          <li key={`${item.title}-${index}`} className="flex items-start gap-4 border-t border-white/[0.07] py-6 max-[768px]:py-5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 font-heading text-[12.5px] font-semibold leading-[1.5] text-brand ring-1 ring-brand/20">{index + 1}</span>
            <span className={`pt-0.5 ${bodyClass}`}>{item.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
