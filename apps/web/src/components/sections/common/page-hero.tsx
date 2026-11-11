import type { CSSProperties } from "react";
import { CmsImage } from "@/components/cms/cms-image";
import type { AnchorLink, Media } from "@/lib/content/types";
import type { SectionProps } from "../types";
import { HeroTabs } from "./hero-tabs";

type Data = {
  title: string;
  subtitle?: string | null;
  /** Optional product logo for dark backgrounds, shown in place of the visible title. */
  logo?: Media | null;
  backgroundImage?: Media | null;
  anchorLinks?: AnchorLink[] | null;
};

/**
 * Logo widths that give every logo the same visual weight whatever its shape: a fixed area per breakpoint, so a
 * compact mark (FinSight, about 2:1) is drawn taller and a long wordmark (AI Governance, about 9:1) wider.
 */
const LOGO_AREA = { base: 6800, sm: 10000, xl: 14000, x3: 17500 };
function logoVars(logo: Media): CSSProperties {
  const ratio = logo.width && logo.height ? logo.width / logo.height : 4;
  const w = (area: number) => `${Math.round(Math.sqrt(area * ratio))}px`;
  return {
    "--lw": w(LOGO_AREA.base),
    "--lw-sm": w(LOGO_AREA.sm),
    "--lw-xl": w(LOGO_AREA.xl),
    "--lw-3xl": w(LOGO_AREA.x3),
  } as CSSProperties;
}

/** Inner-page hero: full-width image with a cinematic gradient, centred title/subtitle and a floating anchor-tab bar. */
export function PageHero({ data, context }: SectionProps<Data>) {
  // Page-specific, because Next.js keeps recently visited pages alive (hidden) and aria-labelledby must not
  // resolve to another page's heading.
  const heroId = `hero-${(context.page.path || "page").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}-${context.index}`;
  const tabs = data.anchorLinks?.length ? data.anchorLinks : null;
  const logo = data.logo?.url ? data.logo : null;
  return (
    <section
      className="relative isolate flex h-[380px] w-full flex-col overflow-hidden bg-ink sm:h-[420px] lg:h-[460px] xl:h-[500px] 3xl:h-[580px]"
      aria-labelledby={heroId}
    >
      <CmsImage
        media={data.backgroundImage}
        // Decorative backdrop behind the headline (WCAG F39/H67): an empty alt, so a library image reused across pages
        // never announces another page's description. The first hero is the page's LCP image, fetched at high priority.
        alt=""
        fill
        priority={context.index === 0}
        fetchPriority={context.index === 0 ? "high" : undefined}
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.85)_100%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_100%)]" />
      <div className="flex flex-1 flex-col items-center justify-center px-gutter pt-[72px] text-center 3xl:pt-[84px]">
        <span aria-hidden className="mb-5 h-[3px] w-12 animate-fade-up rounded-full bg-brand-line 3xl:mb-6 3xl:w-14" />
        {logo ? (
          // The logo replaces the visible title; the title text stays in the h1 for screen readers, search engines and
          // the tab bar, and the image itself is decorative (empty alt) so the name is not announced twice.
          <h1 id={heroId} className="flex animate-fade-up justify-center" style={logoVars(logo)}>
            <span className="sr-only">{data.title}</span>
            <CmsImage
              media={logo}
              alt=""
              aria-hidden
              priority={context.index === 0}
              quality={90}
              sizes="(min-width: 1920px) 400px, (min-width: 1280px) 360px, 300px"
              className="block h-auto w-[var(--lw)] max-w-[min(84vw,560px)] drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] sm:w-[var(--lw-sm)] xl:w-[var(--lw-xl)] 3xl:w-[var(--lw-3xl)]"
            />
          </h1>
        ) : (
          <h1
            id={heroId}
            className="max-w-[22ch] animate-fade-up font-heading text-[24px] font-semibold leading-[1.15] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-[27.5px] xl:text-[34.5px] 3xl:text-[41.5px]"
          >
            {data.title}
          </h1>
        )}
        {data.subtitle ? (
          <p className={`${logo ? "mt-5 xl:mt-6" : "mt-4 xl:mt-5"} max-w-[60ch] animate-fade-up font-sans text-[14px] leading-[1.6] text-white/80 [animation-delay:120ms] xl:text-[15.5px] 3xl:text-[16.5px]`}>
            {data.subtitle}
          </p>
        ) : null}
        {tabs ? <div className="h-14 shrink-0 xl:h-16" aria-hidden /> : null}
      </div>
      {tabs ? <HeroTabs links={tabs} title={data.title} /> : null}
    </section>
  );
}
