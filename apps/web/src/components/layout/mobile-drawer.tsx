"use client";

import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CmsImage } from "@/components/cms/cms-image";
import { AccentIcon, LinkIcon } from "@/components/primitives/accent-icon";
import { SmartLink } from "@/components/primitives/smart-link";
import { accentHex, accentVars } from "@/lib/accent";
import { cn } from "@/lib/utils";
import type { Link as LinkT, Media, NavGroup } from "@/lib/content/types";

type Cta = Pick<LinkT, "label" | "href">;

/**
 * What a modal drawer needs from the rest of the page while it is open: no page scrolling and the page hidden from
 * assistive technology. Radix's modal mode does this by injecting a scroll-lock style sheet and setting
 * `pointer-events: none` on <body>; each of those forces a style recalculation of the entire page (≈150 ms on the
 * home page even on a fast phone, several hundred ms on mid-range Android). An inline `overflow: hidden` on <html>
 * and `aria-hidden` on the page's top-level elements cost well under 1 ms. Clicks on the page are blocked by the
 * drawer's own full-screen overlay.
 */
function usePageLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
    const gap = window.innerWidth - html.clientWidth; // classic scrollbar (desktop browser in a narrow window)
    html.style.overflow = "hidden";
    if (gap > 0) html.style.paddingRight = `${gap}px`;
    const hidden = Array.from(document.body.children).filter(
      (el) => !el.hasAttribute("aria-hidden") && !el.matches("script,style,link,template,[aria-live]") && !el.querySelector("[data-lf-drawer]"),
    );
    hidden.forEach((el) => el.setAttribute("aria-hidden", "true"));
    return () => {
      html.style.overflow = prev.overflow;
      html.style.paddingRight = prev.paddingRight;
      hidden.forEach((el) => el.removeAttribute("aria-hidden"));
    };
  }, [open]);
}

/**
 * Mobile and tablet navigation (below 1024 px): drawer from the right (full width on phones, a 440 px side panel
 * from 640 px) with three collapsible levels
 * (group › item › sub-link) and the orange "Let's connect" pill pinned to the bottom.
 * Radix Dialog in non-modal mode (focus loop, Escape, focus return to the trigger) + `usePageLock` above.
 */
export function MobileDrawer({ navigation, cta }: { navigation: NavGroup[]; cta: Cta }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);
  usePageLock(open);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} modal={false}>
      <Dialog.Trigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Open menu"
          className="hover-grow hidden size-11 items-center justify-center rounded-full bg-white/[0.06] text-white ring-1 ring-white/10 max-lg:flex"
        >
          <Menu aria-hidden className="size-5" strokeWidth={1.75} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content
          data-lf-drawer=""
          aria-modal="true"
          aria-describedby={undefined}
          // Non-modal Radix only refocuses the trigger if nothing "outside" was touched; in WebKit the opening tap's
          // own late click counts as outside. Always hand focus back to the menu button, as a modal dialog does.
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            triggerRef.current?.focus({ preventScroll: true });
          }}
          // Full-screen layer (dim backdrop + panel), so there is no "outside" to click through to. Its own fade keeps
          // it mounted until the panel has finished sliding out (the animation must change a value: WebKit fires no
          // animationend for a no-op animation, which would leave the closed layer covering the page).
          className="group/drawer fixed inset-0 z-[300] flex justify-end overflow-hidden bg-black/55 outline-none duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        >
          <div aria-hidden onClick={close} className="absolute inset-0 touch-none" />
          <div
            className={cn(
              "relative flex h-full w-full flex-col gap-0 bg-[#0b0b0b] bg-clip-padding px-5 pb-6 pt-4 text-sm text-mist ease-in-out sm:max-w-[440px] sm:border-l sm:border-white/[0.08] sm:shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.7)]",
              "duration-300 group-data-[state=open]/drawer:animate-in group-data-[state=open]/drawer:slide-in-from-right-full",
              "group-data-[state=closed]/drawer:animate-out group-data-[state=closed]/drawer:slide-out-to-right-full",
            )}
          >
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <div className="flex h-12 shrink-0 items-center justify-between">
              <SmartLink href="/" onClick={close} aria-label="Linkfields home" className="hover-grow -m-2 flex p-2">
                <Image src="/icons/lfi-mobile-icon.svg" alt="Linkfields" width={26} height={26} priority />
              </SmartLink>
              <Dialog.Close
                className="hover-grow flex size-11 items-center justify-center rounded-full bg-white/[0.06] text-white ring-1 ring-white/10"
                aria-label="Close menu"
              >
                <X aria-hidden className="size-5" strokeWidth={1.75} />
              </Dialog.Close>
            </div>
            <nav aria-label="Mobile" className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none]">
              <Collapsible
                items={navigation.map((group) => ({
                  key: group.label,
                  label: group.label,
                  href: group.href,
                  children: group.items?.length ? (
                    <Collapsible
                      level={1}
                      items={group.items.map((item) => ({
                        key: item.label,
                        label: item.label,
                        href: item.href || item.ctaHref,
                        newTab: item.openInNewTab,
                        icon: item.icon,
                        image: item.image,
                        section: item.section,
                        accent: item.accent,
                        eyebrow: item.eyebrow,
                        children:
                          item.links?.length || item.groupLinks?.length ? (
                            <div className="mb-2 ml-[26px] mt-1 flex flex-col border-l border-[var(--acc-line)] pl-4">
                              <SubLinks links={item.links} onNavigate={close} />
                              {item.groupLinks?.length ? (
                                <div className={cn("flex flex-col", item.links?.length && "mt-3")}>
                                  {item.groupLabel ? (
                                    <span className="mb-1 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--acc)]">
                                      {item.groupLabel}
                                    </span>
                                  ) : null}
                                  <SubLinks links={item.groupLinks} onNavigate={close} />
                                </div>
                              ) : null}
                            </div>
                          ) : null,
                      }))}
                      onNavigate={close}
                    />
                  ) : null,
                }))}
                onNavigate={close}
              />
            </nav>
            <SmartLink
              href={cta.href || "/contact-us"}
              onClick={close}
              className="hover-grow hover-swap mx-auto mt-4 flex h-12 w-full max-w-[350px] shrink-0 items-center justify-center gap-2 rounded-full bg-brand-gradient font-heading text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(255,120,0,0.8),inset_0_1px_0_rgba(255,255,255,0.22)]"
            >
              {cta.label || "Let's connect"}
              <ArrowRight aria-hidden className="size-4" />
            </SmartLink>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SubLinks({ links, onNavigate }: { links?: LinkT[] | null; onNavigate: () => void }) {
  if (!links?.length) return null;
  return (
    <>
      {links.map((l) => (
        <SmartLink
          key={l.href ?? l.label}
          href={l.href}
          newTab={l.openInNewTab}
          onClick={onNavigate}
          className="group/sl flex flex-col py-3 font-sans text-[13.5px] leading-[1.4] text-white/60 transition-colors hover:text-[var(--acc)]"
        >
          {l.icon ? (
            <span className="flex items-center gap-2.5">
              <LinkIcon media={l.icon} className="group-hover/sl:opacity-100" />
              {l.label}
            </span>
          ) : l.logo ? (
            <span className="flex h-[26px] w-[100px] items-center justify-center rounded-md bg-white px-2 ring-1 ring-black/5">
              <span className="relative block h-[15px] w-full">
                <CmsImage media={l.logo} alt={l.label || ""} fill sizes="100px" className="object-contain" />
              </span>
            </span>
          ) : (
            l.label
          )}
          {l.description ? <span className="mt-0.5 text-[12px] leading-[1.4] text-white/40 group-hover/sl:text-white/55">{l.description}</span> : null}
        </SmartLink>
      ))}
    </>
  );
}

type Item = {
  key: string;
  label: string;
  href?: string | null;
  newTab?: boolean | null;
  icon?: Media | null;
  /** Small photo thumbnail (Industries). */
  image?: Media | null;
  /** Level-1 items sharing a section get a heading row before the first one. */
  section?: string | null;
  accent?: string | null;
  eyebrow?: string | null;
  children: ReactNode;
};

/** Single-open collapsible list (accordion behaviour). */
function Collapsible({ items, level = 0, onNavigate }: { items: Item[]; level?: 0 | 1; onNavigate: () => void }) {
  const [active, setActive] = useState<string | null>(null);
  // Panels are rendered the first time they open (and kept afterwards so closing still animates). Mounting every
  // group, item and sub-link up front made opening the drawer a long main-thread task on mid-range phones.
  const [opened, setOpened] = useState<ReadonlySet<string>>(() => new Set());
  const baseId = useId();
  const top = level === 0;
  const labelClass = top
    ? "font-heading text-[17px] font-semibold leading-[1.3] text-white"
    : "font-heading text-[14.5px] font-medium leading-[1.35] text-white/85";

  return (
    <div className={cn("flex flex-col", !top && "mb-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1.5")}>
      {items.map((it, idx) => {
        const isOpen = active === it.key;
        const sectionStart = !top && it.section && it.section !== items[idx - 1]?.section;
        const panelId = `${baseId}-${it.key.replace(/\W+/g, "-")}`;
        const toggle = () => {
          if (!isOpen && !opened.has(it.key)) setOpened((prev) => new Set(prev).add(it.key));
          setActive(isOpen ? null : it.key);
        };
        const mounted = isOpen || opened.has(it.key);
        const label = (
          <span className="flex items-center gap-2.5">
            {it.icon ? <AccentIcon media={it.icon} size="sm" className="size-[28px]" /> : null}
            {it.image ? (
              <span className="relative size-[30px] shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                <CmsImage media={it.image} alt="" fill sizes="30px" className="object-cover object-[center_30%]" />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: accentHex(it.accent) }} />
              </span>
            ) : it.accent && !it.icon ? (
              <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: accentHex(it.accent) }} />
            ) : null}
            {it.label}
          </span>
        );
        return (
          <div key={it.key} style={top ? undefined : accentVars(it.accent)} className={top ? "border-b border-white/[0.07]" : "rounded-xl"}>
            {sectionStart ? (
              <div className={cn("px-2.5 pb-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-brand", idx === 0 ? "pt-2" : "mt-2 border-t border-white/[0.06] pt-4")}>
                {it.section}
              </div>
            ) : null}
            {top && it.children ? (
              <button
                type="button"
                onClick={toggle}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className={cn(labelClass, "transition-colors", isOpen && "text-brand")}>{label}</span>
                <span
                  aria-hidden
                  className={cn("flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] transition-colors", isOpen && "bg-brand/15 text-brand")}
                >
                  <ChevronDown className={cn("size-[18px] transition-transform duration-300", isOpen && "rotate-180")} />
                </span>
              </button>
            ) : (
            <div className={cn("flex items-center justify-between gap-4", top ? "py-4" : "px-2.5 py-3")}>
              {it.href ? (
                <SmartLink
                  href={it.href}
                  newTab={it.newTab}
                  onClick={onNavigate}
                  className={cn(labelClass, "flex-1 transition-colors hover:text-brand", top ? "-my-4 py-4" : "-my-3 py-3", isOpen && "text-brand")}
                >
                  {label}
                </SmartLink>
              ) : it.children ? (
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className={cn(labelClass, "flex-1 text-left", top ? "-my-4 py-4" : "-my-3 py-3", isOpen && "text-brand")}
                >
                  {label}
                </button>
              ) : (
                <span className={labelClass}>{label}</span>
              )}
              {it.children ? (
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${it.label}`}
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full transition-colors",
                    top ? "size-8 bg-white/[0.06]" : "-my-1.5 -mr-1.5 size-10",
                    isOpen && "bg-brand/15 text-brand",
                  )}
                >
                  <ChevronDown
                    aria-hidden
                    className={cn("transition-transform duration-300", top ? "size-[18px]" : "size-4 opacity-70", isOpen && "rotate-180 opacity-100")}
                  />
                </button>
              ) : null}
            </div>
            )}
            {it.children ? (
              <div
                id={panelId}
                className={cn("grid transition-[grid-template-rows] duration-300 ease-in-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
              >
                <div className="min-h-0 overflow-hidden" inert={!isOpen}>
                  {mounted && top && it.href ? (
                    <SmartLink
                      href={it.href}
                      onClick={onNavigate}
                      className="mb-2 flex items-center justify-between rounded-xl border border-brand/25 bg-brand/[0.07] px-3.5 py-3 font-heading text-[14px] font-semibold text-brand"
                    >
                      Explore {it.label}
                      <ArrowRight aria-hidden className="size-4" />
                    </SmartLink>
                  ) : null}
                  {mounted ? it.children : null}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
