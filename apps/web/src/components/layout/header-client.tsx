"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CmsImage } from "@/components/cms/cms-image";
import { AccentIcon, LinkIcon } from "@/components/primitives/accent-icon";
import { SmartLink } from "@/components/primitives/smart-link";
import { accentVars } from "@/lib/accent";
import { MobileDrawer } from "./mobile-drawer";
import type { Link as LinkT, Media, NavGroup, NavItem } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type Props = { logo: Media | null; navigation: NavGroup[]; cta: LinkT };

function Logo({ logo, className }: { logo: Media | null; className?: string }) {
  return (
    <Link href="/" aria-label="Linkfields – home" className={cn("hover-grow relative block shrink-0", className)}>
      {logo ? (
        <CmsImage media={logo} alt="Linkfields – exploring innovation" fill priority sizes="181px" className="object-contain object-left" />
      ) : (
        <span className="font-heading text-2xl text-white">linkfields</span>
      )}
    </Link>
  );
}

export function HeaderClient({ logo, navigation, cta }: Props) {
  const pathname = usePathname();
  // The open menu remembers the path it was opened on, so navigating closes it without an effect.
  const [menu, setMenu] = useState<{ label: string; path: string } | null>(null);
  const open = menu && menu.path === pathname ? menu.label : null;
  const setOpen = useCallback((label: string | null) => setMenu(label ? { label, path: pathname } : null), [pathname]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  }, [setOpen]);

  // close the mega menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const activeGroup = navigation.find((g) => g.label === open && g.items?.length);

  return (
    <header className="fixed inset-x-0 top-0 z-[200]">
      {activeGroup ? (
        <div
          aria-hidden
          className="fixed inset-x-0 bottom-0 top-[72px] -z-30 bg-black/50 backdrop-blur-[3px] animate-in fade-in duration-300 max-lg:hidden 3xl:top-[84px]"
          onMouseEnter={scheduleClose}
          onClick={() => setOpen(null)}
        />
      ) : null}
      <div
        className={cn(
          "relative border-b border-white/[0.07] bg-black/65 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300",
          activeGroup && "bg-[#0b0b0b]/95",
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-[1920px] animate-fade-up items-center justify-between gap-6 px-gutter [animation-duration:0.5s] [animation-fill-mode:backwards] max-sm:h-[64px] 3xl:h-[84px]">
          <Logo logo={logo} className="h-[34px] w-[134px] max-[1025px]:h-[28px] max-[1025px]:w-[110px] 3xl:h-[40px] 3xl:w-[159px]" />

          {/* Desktop navigation */}
          <nav aria-label="Main" className="max-lg:hidden">
            <ul className="flex items-center gap-[34px] font-heading text-[14px] font-medium text-white/80 max-[1180px]:gap-[22px] max-[1025px]:gap-[14px] max-[1025px]:text-[13px] 3xl:gap-[44px] 3xl:text-[15px]">
              {navigation.map((group) => {
                const hasMenu = Boolean(group.items?.length);
                const isOpen = open === group.label;
                const active = pathname === group.href || (group.href && group.href !== "/" && pathname.startsWith(group.href + "/"));
                if (!hasMenu) {
                  return (
                    <li key={group.label}>
                      <SmartLink
                        href={group.href || "#"}
                        className={cn(
                          "hover-grow relative inline-flex py-[10px] transition-colors hover:text-white after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[2px] after:origin-center after:scale-x-0 after:rounded-full after:bg-brand-line after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100",
                          active && "text-white after:scale-x-100",
                        )}
                      >
                        {group.label}
                      </SmartLink>
                    </li>
                  );
                }
                return (
                  <li key={group.label} onMouseEnter={() => (cancelClose(), setOpen(group.label))} onMouseLeave={scheduleClose}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      onClick={() => setOpen(isOpen ? null : group.label)}
                      className={cn(
                        "hover-grow relative flex cursor-pointer items-center gap-[6px] rounded-md py-[10px] outline-none transition-colors hover:text-white focus-visible:text-white after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[2px] after:origin-center after:scale-x-0 after:rounded-full after:bg-brand-line after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100",
                        (isOpen || active) && "text-white",
                        (isOpen || active) && "after:scale-x-100",
                      )}
                    >
                      {group.label}
                      <ChevronDown
                        aria-hidden
                        className={cn("size-[14px] stroke-[2] opacity-60 transition-transform duration-300", isOpen && "rotate-180 text-brand opacity-100")}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <SmartLink
            href={cta.href || "/contact-us"}
            className="hover-grow hover-swap group inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-brand-gradient px-5 font-heading text-[14px] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(255,120,0,0.75),inset_0_1px_0_rgba(255,255,255,0.22)] lg:max-[1025px]:h-9 lg:max-[1025px]:px-4 lg:max-[1025px]:text-[13px] max-lg:ml-auto max-sm:hidden 3xl:h-11 3xl:px-6 3xl:text-[15px]"
          >
            {cta.label || "Let's connect"}
            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 lg:max-[1025px]:hidden" />
          </SmartLink>

          {/* Mobile and tablet drawer (below 1024 px) */}
          <MobileDrawer navigation={navigation} cta={cta} />
        </div>

        {/* Desktop mega menu. Any link click closes it: route changes close it anyway, but a same-page section
            link (e.g. BFSI › Banking while on /industries/bfsi) keeps the path, so it would stay open over the page. */}
        {activeGroup ? (
          <div
            className="contents"
            onClickCapture={(e) => {
              if ((e.target as HTMLElement).closest("a[href]")) {
                cancelClose();
                setOpen(null);
              }
            }}
          >
            <MegaMenu group={activeGroup} onEnter={cancelClose} onLeave={scheduleClose} />
          </div>
        ) : null}
      </div>
    </header>
  );
}

/*
 * Mega-menu tile model (shared by every menu): navy acc-tile surface, accent hairline on top, soft accent
 * glow in the corner, accent-tinted icon chip, Plus Jakarta title, Inter description and links that take
 * the item accent on hover. Only the content differs by menu (sub-links, logo plates or photo + chips).
 */
const TILE = "acc-tile group/tile relative flex flex-col overflow-hidden rounded-2xl bg-[#0b1020]";
const TILE_TITLE =
  "font-heading text-[15px] font-semibold leading-[1.3] text-white transition-colors 3xl:text-[16px]";
const TILE_DESC = "font-sans text-[13px] leading-[1.55] text-white/55 3xl:text-[13.5px]";
const SUB_LABEL = "font-sans text-[11px] font-semibold uppercase leading-[1.3] tracking-[0.14em] text-[var(--acc)] 3xl:text-[11px]";

function TileDecor({ bar = true }: { bar?: boolean }) {
  return (
    <>
      {bar ? <span aria-hidden className="absolute inset-x-0 top-0 z-[1] h-[2px] bg-[linear-gradient(90deg,var(--acc),transparent_80%)]" /> : null}
      <span
        aria-hidden
        className="absolute -right-12 -top-14 -z-10 size-[150px] rounded-full bg-[var(--acc)] opacity-[0.12] blur-[50px] transition-opacity duration-500 group-hover/tile:opacity-[0.26]"
      />
    </>
  );
}

function MenuLinks({ links }: { links: NonNullable<NavGroup["items"]>[number]["links"] }) {
  if (!links?.length) return null;
  return (
    <ul className="flex flex-col gap-[9px] font-sans text-[13.5px] leading-[1.35] text-white/65 3xl:text-[14.5px]">
      {links.map((l) => (
        <li key={l.href ?? l.label}>
          <SmartLink
            href={l.href}
            newTab={l.openInNewTab}
            className="group/ln hover-grow inline-flex origin-left items-center gap-2.5 transition-colors hover:text-[var(--acc)]"
          >
            <LinkIcon media={l.icon} />
            {l.label}
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}

/** Compact chips for a tile's secondary group (Linkfields IP, engagement models), laid out side by side. */
function MenuChips({ links, column = false }: { links: NonNullable<NavGroup["items"]>[number]["links"]; column?: boolean }) {
  if (!links?.length) return null;
  return (
    <ul className={column ? "flex flex-col items-start gap-1.5" : "flex flex-wrap gap-1.5"}>
      {links.map((l) => (
        <li key={l.href ?? l.label}>
          <SmartLink
            href={l.href}
            newTab={l.openInNewTab}
            className="group/ln hover-grow inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--acc-soft)] py-[5px] pl-2.5 pr-3 font-sans text-[12.5px] font-medium leading-[1.3] text-white/80 ring-1 ring-[var(--acc-line)] hover:text-white hover:ring-[var(--acc)] 3xl:text-[13px]"
          >
            <LinkIcon media={l.icon} className="size-[13px]" />
            {l.label}
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}

/** Services, Solutions and Company tiles. Link-less tiles are one large click target with an "Explore" cue. */
/**
 * `split` (wide tiles): services on the left, the IP / engagement-model chips in a column beside them.
 * `stack`: chips sit under the services list.
 */
function MenuTile({ item, layout = "stack", className }: { item: NavItem; layout?: "stack" | "split"; className?: string }) {
  const hasLinks = Boolean(item.links?.length || item.groupLinks?.length);
  const href = item.href || item.ctaHref;
  const head = (
    <div className="flex items-start gap-3">
      <AccentIcon media={item.icon} className="group-hover/tile:bg-[color-mix(in_srgb,var(--acc)_22%,transparent)]" />
      {hasLinks ? (
        <SmartLink
          href={href}
          newTab={item.openInNewTab}
          className={cn("hover-grow mt-[7px] origin-left hover:text-[var(--acc)]", TILE_TITLE)}
        >
          {item.label}
        </SmartLink>
      ) : (
        <span className={cn("mt-[7px] group-hover/tile:text-[var(--acc)]", TILE_TITLE)}>{item.label}</span>
      )}
    </div>
  );
  const body = (
    <>
      <TileDecor />
      {head}
      {item.description ? <p className={cn("mt-3", TILE_DESC)}>{item.description}</p> : null}
      {layout === "split" && item.links?.length && item.groupLinks?.length ? (
        <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-6">
          <MenuLinks links={item.links} />
          <div className="flex min-w-0 flex-col gap-2.5 border-l border-white/[0.07] pl-6">
            {item.groupLabel ? <span className={SUB_LABEL}>{item.groupLabel}</span> : null}
            <MenuChips links={item.groupLinks} column />
          </div>
        </div>
      ) : (
        <>
          {item.links?.length ? (
            <div className="mt-4">
              <MenuLinks links={item.links} />
            </div>
          ) : null}
          {item.groupLinks?.length ? (
            <div className="mt-4 flex flex-col gap-2.5 border-t border-white/[0.07] pt-3.5">
              {item.groupLabel ? <span className={SUB_LABEL}>{item.groupLabel}</span> : null}
              <MenuChips links={item.groupLinks} />
            </div>
          ) : null}
        </>
      )}
      {!hasLinks ? (
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-heading text-[12.5px] font-semibold text-[var(--acc)] 3xl:text-[13px]">
          {item.ctaLabel || "Explore"}
          <ArrowRight aria-hidden className="size-3.5 transition-transform duration-300 group-hover/tile:translate-x-0.5" />
        </span>
      ) : item.ctaLabel ? (
        <SmartLink
          href={item.ctaHref || item.href}
          className="hover-grow group/cta mt-auto inline-flex w-fit origin-left items-center gap-2 pt-4 font-heading text-[13px] font-semibold text-[var(--acc)]"
        >
          {item.ctaLabel}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
        </SmartLink>
      ) : null}
    </>
  );
  if (!hasLinks && href) {
    return (
      <SmartLink href={href} newTab={item.openInNewTab} style={accentVars(item.accent)} className={cn(TILE, "p-5 outline-none 3xl:p-6", className)}>
        {body}
      </SmartLink>
    );
  }
  return (
    <div style={accentVars(item.accent)} className={cn(TILE, "p-5 3xl:p-6", className)}>
      {body}
    </div>
  );
}

/** Groups items by their `section` (keeping first-seen order) for sectioned menus such as Products & Accelerators. */
function bySection(items: NavItem[]) {
  const out: { name: string; description?: string | null; items: NavItem[] }[] = [];
  for (const it of items) {
    const name = it.section || "";
    let sec = out.find((s) => s.name === name);
    if (!sec) out.push((sec = { name, description: it.sectionDescription, items: [] }));
    sec.items.push(it);
  }
  return out;
}

const SECTION_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4 max-[1024px]:grid-cols-2",
  5: "grid-cols-5 max-[1024px]:grid-cols-3",
};

/** Products & Accelerators tile: same surface, with an optional eyebrow and white logo plates for proprietary products. */
function SectionTile({ item }: { item: NavItem }) {
  return (
    <div style={accentVars(item.accent)} className={cn(TILE, "p-4 3xl:p-5")}>
      <TileDecor />
      {item.eyebrow ? <span className={SUB_LABEL}>{item.eyebrow}</span> : null}
      <SmartLink
        href={item.href || item.ctaHref}
        newTab={item.openInNewTab}
        className={cn("hover-grow origin-left hover:text-[var(--acc)]", item.eyebrow && "mt-2", TILE_TITLE)}
      >
        {item.label}
      </SmartLink>
      {item.description ? <p className={cn("mt-1.5", TILE_DESC)}>{item.description}</p> : null}
      {item.links?.length ? (
        <ul className="mt-3 flex flex-col gap-2.5 border-t border-white/[0.07] pt-3">
          {item.links.map((l) => (
            <li key={l.href ?? l.label}>
              <SmartLink href={l.href} newTab={l.openInNewTab} className="group/pl hover-grow flex origin-left flex-col">
                {l.logo ? (
                  <span className="flex h-[34px] w-[118px] items-center justify-center rounded-lg bg-white px-2.5 shadow-[0_6px_18px_-10px_rgba(0,0,0,0.9)] ring-1 ring-black/5 transition-shadow duration-300 group-hover/pl:shadow-[0_8px_22px_-8px_var(--acc),0_0_0_2px_var(--acc-line)] 3xl:h-[38px] 3xl:w-[128px]">
                    <span className="relative block h-[22px] w-full 3xl:h-[24px]">
                      <CmsImage media={l.logo} alt={l.label || ""} fill sizes="124px" className="object-contain" />
                    </span>
                  </span>
                ) : (
                  <span className="font-heading text-[13.5px] font-semibold leading-[1.3] text-white/85 transition-colors group-hover/pl:text-[var(--acc)] 3xl:text-[14px]">
                    {l.label}
                  </span>
                )}
                {l.description ? (
                  <span className={cn("font-sans text-[12px] leading-[1.4] text-white/45 transition-colors group-hover/pl:text-white/70", l.logo ? "mt-1.5" : "mt-0.5")}>
                    {l.description}
                  </span>
                ) : null}
              </SmartLink>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SectionedItems({ items }: { items: NavItem[] }) {
  return (
    <div className="flex flex-col gap-6 3xl:gap-8">
      {bySection(items).map((sec) => (
        <div key={sec.name || "items"}>
          {sec.name ? (
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 3xl:mb-4">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-brand 3xl:text-[12px]">{sec.name}</span>
              {sec.description ? <span className="font-sans text-[12.5px] text-white/45 3xl:text-[13px]">{sec.description}</span> : null}
            </div>
          ) : null}
          <div className={cn("grid gap-3 3xl:gap-4", SECTION_COLS[Math.min(sec.items.length, 5)])}>
            {sec.items.map((item) => (
              <SectionTile key={item.label} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Industries: same tile surface with a photo header, positioning line and sub-industry chips. */
function ImageCardItems({ items }: { items: NavItem[] }) {
  return (
    <div className="grid content-start grid-cols-4 gap-3 max-[1100px]:grid-cols-3 max-[860px]:grid-cols-2 3xl:gap-4">
      {items.map((item) => (
        <div key={item.label} style={accentVars(item.accent)} className={TILE}>
          <TileDecor bar={false} />
          <SmartLink href={item.href} newTab={item.openInNewTab} className="relative block aspect-[16/8.5] overflow-hidden">
            {item.image ? (
              <CmsImage
                media={item.image}
                alt=""
                fill
                sizes="(max-width: 1100px) 33vw, 300px"
                className="object-cover object-[center_32%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:scale-[1.07]"
              />
            ) : null}
            <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,32,0)_25%,rgba(11,16,32,0.55)_62%,#0b1020_100%)]" />
            <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,var(--acc),transparent_80%)]" />
            <span className={cn("absolute inset-x-3.5 bottom-2 flex items-center justify-between gap-2 3xl:inset-x-4", TILE_TITLE)}>
              {item.label}
              <ArrowRight aria-hidden className="size-4 shrink-0 text-[var(--acc)] opacity-0 transition-all duration-300 group-hover/tile:translate-x-0.5 group-hover/tile:opacity-100" />
            </span>
          </SmartLink>
          <div className="flex flex-1 flex-col gap-2.5 px-3.5 pb-3.5 pt-1 3xl:px-4 3xl:pb-4">
            {item.description ? <p className={TILE_DESC}>{item.description}</p> : null}
            {item.links?.length ? (
              <ul className="mt-auto flex flex-wrap gap-1.5">
                {item.links.map((l) => (
                  <li key={l.href ?? l.label}>
                    <SmartLink
                      href={l.href}
                      newTab={l.openInNewTab}
                      className="hover-grow inline-flex rounded-full bg-[var(--acc-soft)] px-2.5 py-[3px] font-sans text-[11.5px] font-medium leading-[1.4] text-white/80 ring-1 ring-[var(--acc-line)] transition-colors hover:bg-[var(--acc)] hover:text-[#0b1020]"
                    >
                      {l.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function MegaMenu({ group, onEnter, onLeave }: { group: NavGroup; onEnter: () => void; onLeave: () => void }) {
  const count = group.items?.length ?? 0;
  const sectioned = Boolean(group.items?.some((i) => i.section));
  const imageCards = !sectioned && Boolean(group.items?.some((i) => i.image));
  const servicesGrid = !sectioned && !imageCards && count === 5 && Boolean(group.items?.some((i) => i.groupLinks?.length));
  return (
    <div
      role="region"
      aria-label={`${group.label} menu`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute inset-x-0 top-full border-b border-white/[0.07] bg-[#070a14]/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-300 max-lg:hidden"
    >
      <div className="mx-auto grid max-h-[calc(100vh-72px)] max-w-[1920px] grid-cols-[250px_1fr] gap-10 overflow-y-auto px-gutter py-8 [scrollbar-width:none] max-[1280px]:grid-cols-1 3xl:max-h-[calc(100vh-84px)] 3xl:grid-cols-[300px_1fr] 3xl:gap-14 3xl:py-10">
        <div className="flex flex-col gap-4 max-[1280px]:flex-row max-[1280px]:items-center max-[1280px]:justify-between max-[1280px]:border-b max-[1280px]:border-white/[0.07] max-[1280px]:pb-4">
          <span className="font-heading text-[22px] font-semibold leading-[1.2] tracking-[-0.01em] text-white max-[1280px]:text-[17px] 3xl:text-[26px]">{group.label}</span>
          <span aria-hidden className="h-[2px] w-10 rounded-full bg-brand-line max-[1280px]:hidden" />
          {group.description ? (
            <p className="font-sans text-[13.5px] leading-[1.6] text-white/60 max-[1280px]:hidden 3xl:text-[14.5px]">{group.description}</p>
          ) : null}
          {group.coverImage ? (
            <div className="relative mt-2 aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-white/10 max-[1280px]:hidden">
              <CmsImage media={group.coverImage} alt={group.label} fill sizes="300px" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,20,0)_45%,rgba(7,10,20,0.6)_100%)]" />
            </div>
          ) : null}
          {group.href ? (
            <SmartLink href={group.href} className="hover-grow group mt-1 inline-flex w-fit origin-left items-center gap-2 font-heading text-[13.5px] font-semibold text-brand">
              Explore {group.label.toLowerCase()}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </SmartLink>
          ) : null}
        </div>
        {sectioned ? (
          <SectionedItems items={group.items ?? []} />
        ) : imageCards ? (
          <ImageCardItems items={group.items ?? []} />
        ) : (
          servicesGrid ? (
            // Five portfolios: three tiles, then two wide tiles that fill the row (services beside their IP chips).
            // The second row sizes each tile to its content first, then shares the spare width, so long service
            // names and chips stay on one line wherever the screen allows.
            <div className="flex flex-col gap-3 3xl:gap-4">
              <div className="grid grid-cols-3 gap-3 3xl:gap-4">
                {group.items?.slice(0, 3).map((item) => <MenuTile key={item.label} item={item} />)}
              </div>
              <div className="grid grid-cols-[auto_auto] gap-3 3xl:gap-4">
                {group.items?.slice(3).map((item) => <MenuTile key={item.label} item={item} layout="split" className="min-w-0" />)}
              </div>
            </div>
          ) : (
            <div className={cn("grid content-start gap-3 3xl:gap-4", count === 4 ? "grid-cols-4 max-[1280px]:grid-cols-2" : "grid-cols-3")}>
              {group.items?.map((item) => <MenuTile key={item.label} item={item} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}
