import type * as React from "react";
import type { SectionProps } from "../types";
import { CmsImage } from "@/components/cms/cms-image";
import { Highlight } from "@/components/primitives/deck";
import { SmartLink } from "@/components/primitives/smart-link";
import type { Link, Media } from "@/lib/content/types";
import { accentVars } from "@/lib/accent";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { GlobeVideo } from "./globe-video";
import { HeroFade } from "./hero-fade";
import { Marquee } from "@/components/primitives/marquee";
type HeroChip = { label?: string | null; href?: string | null; accent?: string | null };
type HeroSlide = { eyebrow?: string | null; title?: string | null; description?: string | null; cta?: Link | null; chips?: HeroChip[] | null };
type Partner = { label?: string | null; image?: Media | null; colorImage?: Media | null; href?: string | null };
type Proof = { value?: string | null; label?: string | null; href?: string | null; logo?: Media | null };
type Data = {
  eyebrow?: string | null;
  primaryCta?: Link | null;
  backgroundVideo?: Media | null;
  videoPoster?: Media | null;
  videoStyle?: "globe" | "background" | null;
  slides?: HeroSlide[] | null;
  partners?: Partner[] | null;
  partnersLabel?: string | null;
  proofPoints?: Proof[] | null;
  /** Seconds each slide stays on screen (CMS: 4–15, default 4). */
  autoplaySeconds?: number | null;
};
export function HeroSlider({ data }: SectionProps<Data>) {
  const videoUrl = mediaUrl(data.backgroundVideo);
  const posterUrl = mediaUrl(data.videoPoster);
  const globe = data.videoStyle === "globe" && Boolean(videoUrl);
  // The poster frame (home LCP image) is preloaded by <GlobeVideo> itself — see the note there.
  const slides = data.slides ?? [];
  const seconds = Math.min(15, Math.max(4, Number(data.autoplaySeconds) || 4));
  const partners = data.partners ?? [];
  const proof = (data.proofPoints ?? []).filter((p) => p.label && (p.value || p.logo));
  // Height of the bottom strips, so the copy, dots and globe sit above them.
  const strips = proof.length && partners.length ? "both" : proof.length || partners.length ? "one" : "none";
  return (
    <section
      className={cn(
        "relative isolate h-[800px] overflow-hidden text-white 3xl:h-[920px] max-[768px]:h-[860px]",
        strips === "both" && "h-[860px] 3xl:h-[1000px] max-[768px]:h-[960px]",
        globe ? "hero-globe-stage" : "bg-ink",
      )}
      style={{ "--hero-strips": strips === "both" ? "128px" : "64px" } as React.CSSProperties}
      aria-label="Linkfields highlights"
    >
      {videoUrl && !globe ? (
        <video className="absolute inset-0 -z-20 size-full object-cover max-[768px]:object-[62%_center]" autoPlay loop muted playsInline preload="metadata" poster={posterUrl || undefined}>
          <source src={videoUrl} type={data.backgroundVideo?.mime || "video/webm"} />
        </video>
      ) : null}
      {globe && videoUrl ? (
        <div
          aria-hidden
          className="pointer-events-none absolute right-[5vw] top-[calc(72px+(100%-72px-var(--hero-strips,132px))/2)] -z-10 aspect-square w-[min(40vw,580px)] -translate-y-1/2 3xl:w-[680px] max-[1180px]:right-[3vw] max-[1180px]:w-[42vw] max-[768px]:left-1/2 max-[768px]:right-auto max-[768px]:top-[84px] max-[768px]:w-[min(58vw,240px)] max-[768px]:-translate-x-1/2 max-[768px]:translate-y-0"
        >
          <div className="globe-halo absolute inset-[-30%] rounded-full" />
          <GlobeVideo src={videoUrl} type={data.backgroundVideo?.mime} poster={posterUrl} />
        </div>
      ) : (
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/20 to-transparent max-[768px]:bg-gradient-to-t max-[768px]:from-black max-[768px]:via-black/45 max-[768px]:to-black/10" />
      )}
      <HeroFade dotsClassName={cn("absolute inset-x-0 z-20 gap-2.5 max-[768px]:bottom-6", strips === "both" ? "bottom-[140px] 3xl:bottom-[154px] max-[768px]:bottom-[150px]" : strips === "one" ? "bottom-[80px]" : "bottom-[64px]")} className="h-full" interval={seconds * 1000} ariaLabel="Home highlights">
        {slides.map((slide, index) => {
          const Heading = index === 0 ? "h1" : "h2";
          const eyebrow = slide.eyebrow || data.eyebrow;
          const chips = (slide.chips ?? []).filter((chip) => chip.label).slice(0, 6);
          return (
            <div
              key={`${slide.title}-${index}`}
              className={cn(
                "flex h-full items-center px-gutter pt-[72px] max-[768px]:items-start",
                strips === "both" ? "pb-[176px] max-[768px]:pb-[190px]" : "pb-[120px] max-[768px]:pb-24",
                globe ? "max-[768px]:pt-[calc(96px+min(58vw,240px))]" : "max-[768px]:pt-[260px]",
              )}
            >
              <div data-carousel-hold className={cn("w-full max-w-[650px] 3xl:max-w-[760px] max-[768px]:max-w-[440px]", globe && "max-w-[600px] max-[1180px]:max-w-[50vw] max-[768px]:max-w-[440px]")}>
                {eyebrow ? (
                  <p className="mb-5 flex items-center gap-3 text-balance font-sans text-[11.5px] font-semibold uppercase tracking-[0.24em] text-brand 3xl:text-[12.5px] max-[768px]:mb-4 max-[768px]:text-[11px]">
                    <span aria-hidden className="h-px w-8 bg-brand" />
                    {eyebrow}
                  </p>
                ) : null}
                <Heading className="font-heading text-[44px] font-semibold leading-[1.1] text-white 3xl:text-[52px] max-[1180px]:text-[38px] max-[768px]:text-[30px]"><Highlight text={slide.title} /></Heading>
                {slide.description ? <p className="mt-6 max-w-[55ch] text-pretty font-sans text-[17px] leading-[1.6] text-white/65 3xl:text-[19px] max-[768px]:mt-5 max-[768px]:text-[15.5px]">{slide.description}</p> : null}
                {/* Chips need the desktop copy width; below 1024px the CTA leads to the full section instead. */}
                {chips.length ? (
                  <ul aria-label={eyebrow || "Highlights"} className="mt-6 flex max-w-[600px] flex-wrap gap-2 max-lg:hidden">
                    {chips.map((chip) => {
                      const chipClass =
                        "group/chip inline-flex h-8 items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 font-sans text-[12.5px] font-medium text-white/80 backdrop-blur-sm transition-[transform,background-color,border-color,color,box-shadow] duration-300 3xl:h-9 3xl:text-[13.5px]";
                      const dot = <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[var(--acc)] shadow-[0_0_10px_var(--acc)] transition-transform duration-300 group-hover/chip:scale-125" />;
                      return (
                        <li key={chip.label} style={accentVars(chip.accent)}>
                          {chip.href ? (
                            <SmartLink
                              href={chip.href}
                              className={cn(chipClass, "hover:-translate-y-0.5 hover:scale-[1.03] hover:border-[var(--acc-line)] hover:bg-[var(--acc-soft)] hover:text-white hover:shadow-[0_8px_24px_-10px_var(--acc)] focus-visible:border-[var(--acc-line)] focus-visible:text-white")}
                            >
                              {dot}
                              {chip.label}
                            </SmartLink>
                          ) : (
                            <span className={chipClass}>
                              {dot}
                              {chip.label}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                <div className={cn("mt-8 flex flex-wrap items-center gap-3 max-[768px]:mt-7", chips.length > 0 && "lg:mt-7")}>
                  {data.primaryCta?.label ? (
                    <SmartLink href={data.primaryCta.href} newTab={data.primaryCta.openInNewTab} className="btn-primary group max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[14px]">
                      <span>{data.primaryCta.label}</span>
                      <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </SmartLink>
                  ) : null}
                  {slide.cta?.label ? (
                    <SmartLink
                      href={slide.cta.href}
                      newTab={slide.cta.openInNewTab}
                      className={cn(
                        data.primaryCta?.label
                          ? "btn-secondary group px-6 max-[768px]:h-11 max-[768px]:px-5 max-[768px]:text-[14px]"
                          : "btn-primary max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[14px]",
                      )}
                    >
                      <span>{slide.cta.label}</span>
                      <ArrowRight aria-hidden className="size-4" />
                    </SmartLink>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </HeroFade>
      {proof.length || partners.length ? (
        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/[0.08] bg-[#03060f]/45 backdrop-blur-md">
          {proof.length ? (
            <Marquee label="Credentials and recognition" duration={proof.length * 6} className="border-b border-white/[0.06]">
              {proof.map((p, i) => {
                const body = (
                  <>
                    {p.logo ? (
                      <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-white px-1 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.8)] max-[768px]:h-8 max-[768px]:min-w-8">
                        <CmsImage media={p.logo} alt="" width={p.logo.width ?? 96} height={p.logo.height ?? 96} className="h-7 w-auto max-w-[88px] object-contain max-[768px]:h-6" />
                      </span>
                    ) : null}
                    {p.value ? (
                      <span className="bg-[linear-gradient(90deg,#FFB21E,#FF7800)] bg-clip-text font-heading text-[22px] font-bold leading-none tracking-tight text-transparent 3xl:text-[26px] max-[768px]:text-[18px]">
                        {p.value}
                      </span>
                    ) : null}
                    <span className="whitespace-nowrap font-sans text-[12.5px] leading-[1.4] text-white/65 transition-colors group-hover/pf:text-white 3xl:text-[13.5px] max-[768px]:text-[12px]">
                      {p.label}
                    </span>
                  </>
                );
                const cls = "group/pf flex h-[62px] items-center gap-3 border-r border-white/[0.07] px-7 transition-transform duration-300 hover:scale-[1.03] 3xl:h-[70px] max-[768px]:h-[54px] max-[768px]:gap-2.5 max-[768px]:px-5";
                return p.href ? (
                  <SmartLink key={i} href={p.href} className={cls}>
                    {body}
                  </SmartLink>
                ) : (
                  <span key={i} className={cls}>
                    {body}
                  </span>
                );
              })}
            </Marquee>
          ) : null}
          {partners.length ? (
            <div className="flex items-center max-[768px]:flex-col max-[768px]:items-stretch max-[768px]:pt-3">
              <p className="flex shrink-0 items-center gap-2.5 pl-gutter pr-6 font-sans text-[11px] font-bold uppercase leading-[1.4] tracking-[0.22em] 3xl:text-[11.5px] max-[768px]:justify-center max-[768px]:px-gutter">
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand-gradient shadow-[0_0_10px_rgba(255,140,0,0.9)]" />
                <span className="bg-[linear-gradient(90deg,#FFC21A,#FF8C00_55%,#FF7800)] bg-clip-text text-transparent">{data.partnersLabel || "OEM & technology partners"}</span>
              </p>
              <Marquee label={data.partnersLabel || "OEM & technology partners"} duration={partners.length * 4.5} reverse className="min-w-0 flex-1">
                {partners.map((partner, i) => {
                  const w = partner.image?.width ?? 200;
                  const h = partner.image?.height ?? 80;
                  // Optical sizing: compact marks get more height than long wordmarks.
                  const sizeFor = (ratio: number) => (ratio < 1.6 ? "h-[34px]" : ratio < 3.2 ? "h-[22px]" : ratio < 4.6 ? "h-[19px]" : "h-[16px]");
                  const size = sizeFor(w / Math.max(h, 1));
                  const color = partner.colorImage;
                  const cw = color?.width ?? w;
                  const ch = color?.height ?? h;
                  // White mark on the dark strip; on hover/focus the chip turns light and the original-colour logo fades in.
                  const logo = (
                    <span className="relative flex h-[44px] items-center justify-center rounded-xl px-4 ring-1 ring-transparent transition-[background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pt:scale-[1.06] group-hover/pt:bg-white group-hover/pt:shadow-[0_10px_28px_-12px_rgba(255,140,0,0.7)] group-hover/pt:ring-white/70 group-focus-visible/pt:scale-[1.06] group-focus-visible/pt:bg-white group-focus-visible/pt:ring-white/70 motion-reduce:transform-none max-[768px]:h-[40px] max-[768px]:px-3">
                      <CmsImage
                        media={partner.image}
                        alt={partner.label || "Partner"}
                        width={w}
                        height={h}
                        className={cn(
                          "w-auto max-w-[124px] object-contain opacity-60 transition-opacity duration-300",
                          color ? "group-hover/pt:opacity-0 group-focus-visible/pt:opacity-0" : "group-hover/pt:opacity-100 group-hover/pt:invert",
                          size,
                        )}
                      />
                      {color ? (
                        <CmsImage
                          media={color}
                          alt=""
                          aria-hidden
                          width={cw}
                          height={ch}
                          className={cn(
                            "pointer-events-none absolute left-1/2 top-1/2 w-auto max-w-[124px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-0 transition-opacity duration-300 group-hover/pt:opacity-100 group-focus-visible/pt:opacity-100",
                            sizeFor(cw / Math.max(ch, 1)),
                          )}
                        />
                      ) : null}
                    </span>
                  );
                  const cls = "group/pt flex h-[58px] items-center px-3 outline-none 3xl:h-[64px] max-[768px]:h-[50px] max-[768px]:px-2";
                  return partner.href ? (
                    <SmartLink key={i} href={partner.href} newTab={Boolean(partner.href.startsWith("http"))} className={cls} aria-label={partner.label ? `${partner.label} services` : undefined}>
                      {logo}
                    </SmartLink>
                  ) : (
                    <span key={i} className={cls}>
                      {logo}
                    </span>
                  );
                })}
              </Marquee>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
