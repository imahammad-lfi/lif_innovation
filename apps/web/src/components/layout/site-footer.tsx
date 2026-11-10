import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown, Mail, MapPin, Navigation } from "lucide-react";
import { CmsImage } from "@/components/cms/cms-image";
import { cn } from "@/lib/utils";
import { accentVars } from "@/lib/accent";
import { SmartLink } from "@/components/primitives/smart-link";
import { getGlobal } from "@/lib/content";
import type { Badge } from "@/lib/content/types";
import { directionsUrl, officeLines, officeSlug } from "@/lib/offices";

import { CopyrightYear } from "./copyright-year";
import { SocialIcon } from "./social-icon";

const LABEL = "font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45";

/**
 * Site footer, compact enterprise layout (all content from Strapi › Global):
 * 1. Brand block (logo, positioning line, enquiry contact card) beside five link columns
 *    (phones: the columns collapse into accordions).
 * 2. Our offices: six addresses with Directions links (Global › Offices; no phone numbers).
 * 3. Trust strip: ISO certifications, Recognitions, Memberships & registrations on uniform white plates.
 * 4. Bottom bar: copyright · legal links · social marks, aligned on one line from tablet width.
 * Events are promoted by the site pop-up and the Events page, not here.
 */
export async function SiteFooter() {
  const global = await getGlobal();
  if (!global) return null;
  const columns = global.footerColumns ?? [];
  const linkColumns = columns.filter((c) => !c.badges?.length);
  const badgeColumns = columns.filter((c) => c.badges?.length);
  const socials = global.footerSocials ?? [];
  const offices = (global.offices ?? []).filter((o) => o?.country && o.address);
  const emails = [
    { label: "Sales enquiries", address: global.salesEmail },
    { label: "General enquiries", address: global.contactEmail ?? "info@linkfields.com" },
  ].filter((e): e is { label: string; address: string } => Boolean(e.address));

  return (
    <footer className="relative overflow-hidden bg-ink-900 font-sans">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,120,0,0.6),transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/4 size-[520px] rounded-full bg-brand/[0.06] blur-[140px]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/maps/world-dots.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-24 top-6 hidden w-[880px] max-w-none opacity-[0.08] [mask-image:radial-gradient(closest-side,#000_55%,transparent)] lg:block"
      />

      <div className="relative px-gutter pb-7 pt-11 xl:pt-12 3xl:pt-16">
        <div className="grid gap-9 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,4fr)] xl:gap-12 3xl:gap-16">
          {/* Brand block */}
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between xl:flex-col xl:justify-start">
            <div className="flex flex-col gap-4">
              <Link href="/" aria-label="Linkfields – home" className="hover-grow relative block h-[32px] w-[142px] origin-left 3xl:h-[38px] 3xl:w-[168px]">
                {global.logo ? (
                  <CmsImage media={global.logo} alt="Linkfields – exploring innovation" fill sizes="168px" className="object-contain object-left" />
                ) : (
                  <span className="font-heading text-2xl font-semibold text-white">linkfields</span>
                )}
              </Link>
              {global.footerTagline ? (
                <p className="max-w-[330px] text-[13px] leading-[1.6] text-white/60 3xl:text-[14px]">{global.footerTagline}</p>
              ) : null}
              {!offices.length && global.footerLocations ? (
                <p className="flex max-w-[330px] items-start gap-2 text-[12.5px] leading-[1.6] text-white/50">
                  <MapPin aria-hidden className="mt-[3px] size-3.5 shrink-0 text-brand" />
                  <span>{global.footerLocations}</span>
                </p>
              ) : null}
            </div>
            {emails.length ? (
              <div className="w-full max-w-[330px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm md:w-[300px] xl:w-full">
                {emails.map((e, i) => (
                  <a
                    key={e.address}
                    href={`mailto:${e.address}`}
                    className={cn(
                      "group relative flex items-center gap-3 px-3.5 py-2.5 transition-colors duration-200 hover:bg-white/[0.05]",
                      "before:absolute before:inset-y-2 before:left-0 before:w-[2px] before:origin-center before:scale-y-0 before:rounded-full before:bg-brand-line before:transition-transform before:duration-300 hover:before:scale-y-100",
                      i > 0 && "border-t border-white/[0.07]",
                    )}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[linear-gradient(135deg,rgba(255,160,51,0.24),rgba(236,90,6,0.12))] text-brand ring-1 ring-brand/25 transition-[scale,color,box-shadow,background-color] duration-300 group-hover:scale-110 group-hover:bg-brand-gradient group-hover:text-white group-hover:shadow-[0_8px_18px_-6px_rgba(255,120,0,0.85)] group-hover:ring-transparent">
                      <Mail className="size-[15px]" aria-hidden />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5 leading-[1.25]">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.13em] text-white/60">{e.label}</span>
                      <span className="truncate text-[13.5px] text-white/85 transition-colors group-hover:text-white">{e.address}</span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="ml-auto size-4 shrink-0 text-white/25 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                    />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* Link columns: grid from tablet up */}
          <div className="hidden grid-cols-3 gap-x-6 gap-y-8 md:grid xl:grid-cols-5 xl:gap-x-7 3xl:gap-x-10">
            {linkColumns.map((col) => (
              <nav key={col.title} aria-label={col.title} className="group/col flex min-w-0 flex-col">
                <span className="font-heading text-[13px] font-semibold leading-[1.3] text-white 3xl:text-[14px]">{col.title}</span>
                <span aria-hidden className="mt-2 h-[2px] w-6 rounded-full bg-brand-line transition-[width] duration-500 ease-out group-hover/col:w-12" />
                <ul className="mt-4 flex flex-col gap-2">
                  {col.links?.map((l) => (
                    <li key={l.href ?? l.label} className="flex">
                      <SmartLink
                        href={l.href}
                        newTab={l.openInNewTab}
                        className="group inline-flex origin-left items-center text-[13px] leading-[1.4] text-white/60 transition-[color,scale] duration-300 hover:scale-[1.03] hover:text-white focus-visible:text-white 3xl:text-[14px]"
                      >
                        <span aria-hidden className="h-[2px] w-0 rounded-full bg-brand-line shadow-[0_0_8px_rgba(255,140,0,0.8)] transition-all duration-300 group-hover:mr-2 group-hover:w-3.5 group-focus-visible:mr-2 group-focus-visible:w-3.5" />
                        {l.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Link columns: accordions on phones */}
          <div className="divide-y divide-white/[0.07] border-y border-white/[0.07] md:hidden">
            {linkColumns.map((col) => (
              <details key={col.title} className="group/acc">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 font-heading text-[14px] font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {col.title}
                  <ChevronDown aria-hidden className="size-4 text-white/50 transition-transform duration-300 group-open/acc:rotate-180 group-open/acc:text-brand" />
                </summary>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 pb-4">
                  {col.links?.map((l) => (
                    <li key={l.href ?? l.label} className="flex">
                      <SmartLink href={l.href} newTab={l.openInNewTab} className="link-underline text-[13px] leading-[1.4] text-white/65 hover:text-white">
                        {l.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        {/* Our offices */}
        {offices.length ? (
          <div className="mt-8 border-t border-white/[0.08] pt-6 xl:mt-9">
            <div className="mb-3.5 flex items-center justify-between gap-4">
              <span className={LABEL}>Our offices</span>
              <SmartLink
                href="/contact-us#our-offices"
                className="hover-grow link-underline group inline-flex items-center gap-1.5 pb-0.5 font-heading text-[12px] font-semibold text-brand"
              >
                View on map
                <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </SmartLink>
            </div>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-5 md:grid-cols-3 xl:grid-cols-6 xl:gap-x-6">
              {offices.map((o) => (
                <li
                  key={officeSlug(o)}
                  style={accentVars(o.accent)}
                  className="group/office -m-2.5 flex min-w-0 flex-col rounded-xl p-2.5 transition-[background-color,box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:bg-white/[0.035] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09),0_16px_32px_-20px_rgba(0,0,0,0.9)]"
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[var(--acc)] shadow-[0_0_8px_var(--acc)] transition-transform duration-300 group-hover/office:scale-[1.6]" />
                    <span className="truncate font-heading text-[13px] font-semibold text-white transition-colors duration-300 group-hover/office:text-[var(--acc)]">{o.country}</span>
                    {o.isHeadquarters ? (
                      <span className="shrink-0 rounded-full bg-brand-gradient px-1.5 py-px text-[11px] font-bold uppercase tracking-[0.12em] text-white">HQ</span>
                    ) : null}
                  </span>
                  {/* One flowing line keeps each address to about three short lines in the six-column row. */}
                  <address className="mt-1.5 text-[12px] not-italic leading-[1.5] text-white/50 transition-colors duration-300 group-hover/office:text-white/70">{officeLines(o).join(", ")}</address>
                  <a
                    href={directionsUrl(o)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Directions to Linkfields ${o.country} (opens Google Maps)`}
                    className="hover-grow link-underline mt-2 inline-flex w-fit origin-left items-center gap-1 pb-0.5 text-[11.5px] font-semibold text-[var(--acc)]"
                  >
                    <Navigation aria-hidden className="size-3" />
                    Directions
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Trust strip: ISO certifications, recognitions, memberships */}
        {badgeColumns.length ? (
          <div className="mt-7 border-t border-white/[0.08] pt-6">
            <div className="flex min-w-0 flex-wrap items-start gap-x-8 gap-y-6 xl:gap-x-10 3xl:gap-x-14">
              {badgeColumns.map((col) => (
                <div key={col.title} className="flex flex-col gap-2.5 xl:not-first:border-l xl:not-first:border-white/[0.08] xl:not-first:pl-10 3xl:not-first:pl-14">
                  <span className={LABEL}>{col.title}</span>
                  <div className="flex flex-wrap gap-2">
                    {col.badges?.map((b, i) => (
                      <BadgePlate key={i} badge={b} fallbackAlt={col.title} breakWide={(col.badges?.length ?? 0) > 3} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom bar: copyright · legal · social */}
      <div data-footer-bar className="relative border-t border-white/[0.08] bg-ink-950 px-gutter py-4">
        <div className="flex flex-col items-center gap-3.5 md:flex-row md:justify-between">
          <span className="order-3 text-center text-[12px] text-white/45 md:order-1 md:text-left">
            © Copyright <CopyrightYear /> {global.copyright ?? "Linkfields. All Rights Reserved"}
          </span>
          <div className="order-1 flex flex-col items-center gap-3.5 sm:flex-row sm:gap-5 md:order-2">
            {global.legalLinks?.length ? (
              <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
                {global.legalLinks.map((l) => (
                  <SmartLink key={l.href ?? l.label} href={l.href} className="link-underline pb-0.5 text-[12px] text-white/50 hover:text-white">
                    {l.label}
                  </SmartLink>
                ))}
              </nav>
            ) : null}
            {global.legalLinks?.length && socials.length ? <span aria-hidden className="hidden h-4 w-px bg-white/15 sm:block" /> : null}
            {socials.length ? (
              <ul aria-label="Follow Linkfields" className="flex items-center gap-2">
                {socials.map((s) => {
                  const label = s.label ?? s.platform;
                  return (
                    <li key={s.platform + (s.href ?? "")}>
                      <SmartLink
                        href={s.href}
                        newTab
                        aria-label={`Linkfields on ${label}`}
                        title={label ?? undefined}
                        className="grid size-8 place-items-center rounded-full bg-white/[0.05] text-white/65 ring-1 ring-white/10 transition-[translate,scale,background-color,color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:scale-110 hover:bg-brand-gradient hover:text-white hover:shadow-[0_0_0_3px_rgba(255,140,0,0.18),0_10px_22px_-8px_rgba(255,120,0,0.95)] hover:ring-transparent focus-visible:scale-110 motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
                      >
                        <SocialIcon platform={s.platform} media={s.icon} label={label ?? ""} />
                      </SmartLink>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Uniform badge tile: every badge sits on the same 52px white plate in a 76px column (wide marks such as
 * NASSCOM or the FT ranking take a double column), so spacing is identical across all groups. "#35"-style
 * ranks in captions are highlighted.
 */
function BadgePlate({ badge: b, fallbackAlt, breakWide = false }: { badge: Badge; fallbackAlt: string; breakWide?: boolean }) {
  const w = b.width ?? 120;
  const h = b.height ?? 111;
  const ratio = w / Math.max(h, 1);
  const wide = ratio > 1.6;
  // Optical sizing: tall seals get more height, long wordmarks less, so they read at a similar weight.
  const dh = ratio < 0.8 ? 44 : wide ? (ratio > 3 ? 26 : 35) : 38;
  const plate = (
    <span className="flex h-[52px] w-full max-w-[156px] items-center justify-center overflow-hidden rounded-xl bg-white px-2 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] transition-[scale,box-shadow,translate] duration-300 group-hover/bp:-translate-y-1 group-hover/bp:scale-[1.05] group-hover/bp:shadow-[0_0_0_2px_rgba(255,140,0,0.6),0_16px_30px_-12px_rgba(255,120,0,0.55)]">
      <CmsImage
        media={b.image}
        alt={b.alt || fallbackAlt}
        width={w}
        height={h}
        className="max-w-full object-contain"
        style={{ height: dh, width: "auto" }}
        sizes={`${Math.round(ratio * dh)}px`}
      />
    </span>
  );
  const rank = b.caption?.match(/^(#\d+)(.*)$/);
  const caption = b.caption ? (
    <span className="line-clamp-2 w-full max-w-[156px] text-center text-[11px] leading-[1.35] text-white/55 transition-colors group-hover/bp:text-white/80">
      {rank ? (
        <>
          <span className="font-heading font-bold text-brand">{rank[1]}</span>
          {rank[2]}
        </>
      ) : (
        b.caption
      )}
    </span>
  ) : null;
  const inner = (
    <>
      {plate}
      {caption}
    </>
  );
  // On phones a wide mark in a long group takes its own row so the square badges stay together.
  const tile = cn(
    "group/bp flex flex-col items-center gap-1.5",
    wide ? "w-[156px]" : "w-[76px]",
    wide && breakWide && "max-sm:w-full max-sm:items-start",
  );
  return b.href ? (
    <SmartLink href={b.href} className={tile}>
      {inner}
    </SmartLink>
  ) : (
    <span className={tile}>{inner}</span>
  );
}
