"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";

import { DeckBars } from "@/components/primitives/deck";
import type { FormEvent } from "@/components/sections/common/contact-form-client";
import {
  CONTACT_DIALOG_EVENT,
  CONTACT_SECTION_ID,
  contactAction,
  setPendingContact,
  takePendingContact,
  type ContactDialogDetail,
} from "@/lib/contact-dialog";
import type { Option } from "@/lib/content/types";
import { landOn } from "@/lib/landing";
import { byId } from "@/lib/dom";

/** Same-shape placeholder shown for the moment it takes to fetch the form the first time the pop-up opens. */
function FormSkeleton() {
  return (
    <div aria-hidden className="flex min-h-[560px] flex-col gap-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <span className="h-3 w-28 animate-pulse rounded bg-white/[0.07]" />
          <span className="h-11 w-full animate-pulse rounded-xl bg-white/[0.045] ring-1 ring-white/[0.06]" />
        </div>
      ))}
      <span className="h-24 w-full animate-pulse rounded-xl bg-white/[0.045] ring-1 ring-white/[0.06]" />
      <span className="mt-2 h-12 w-44 animate-pulse rounded-full bg-brand/25" />
    </div>
  );
}

/**
 * The form (with the phone-number metadata) is not part of every page's start-up JavaScript: it is fetched when a
 * visitor first points at, focuses or touches a contact link (see the prefetch effect below), or at the latest when
 * the pop-up opens. Pages with an on-page form load the same chunk through their contact section.
 */
const ContactFormClient = dynamic(
  () => import("@/components/sections/common/contact-form-client").then((m) => m.ContactFormClient),
  { ssr: false, loading: () => <FormSkeleton /> },
);
const CONTACT_LINKS = 'a[href*="contact-us"], a[href*="#get-in-touch"], [data-contact-trigger]';

type Props = {
  heading: string;
  subheading: string;
  nextStepsTitle: string;
  nextSteps: string[];
  options: Option[];
  events: FormEvent[];
  serverNow: number;
  submitLabel: string;
  successMessage: string;
  salesEmail?: string;
};

/**
 * "Let's connect" pop-up. The link still takes the visitor where it points (the Contact page, or the
 * contact section of the current page) and the form pops up on arrival. Closing it leaves the visitor
 * on that page or section; focus returns there without moving the page.
 */
export function ContactDialog({ heading, subheading, nextStepsTitle, nextSteps, options, events, serverNow, submitLabel, successMessage, salesEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [interest, setInterest] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const returnTo = useRef<string | null>(null);
  const cancelLanding = useRef<(() => void) | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Warm the form chunk on the first sign of intent so the pop-up opens with the form, not the skeleton.
  useEffect(() => {
    const warm = (e: Event) => {
      if (!(e.target instanceof Element) || !e.target.closest(CONTACT_LINKS)) return;
      void import("@/components/sections/common/contact-form-client");
      for (const t of ["pointerover", "focusin", "touchstart"]) document.removeEventListener(t, warm, true);
    };
    for (const t of ["pointerover", "focusin", "touchstart"]) document.addEventListener(t, warm, { capture: true, passive: true });
    return () => {
      for (const t of ["pointerover", "focusin", "touchstart"]) document.removeEventListener(t, warm, true);
    };
  }, []);

  const show = useCallback((want: string | null) => {
    setInterest(want);
    setRound((r) => r + 1); // fresh form state (and preselection) every time it opens
    setOpen(true);
  }, []);

  /** Scroll to this page's contact section, then open the pop-up over it. */
  const openAtSection = useCallback(
    (want: string | null) => {
      cancelLanding.current?.();
      if (!byId(CONTACT_SECTION_ID)) {
        returnTo.current = null;
        show(want);
        return;
      }
      returnTo.current = CONTACT_SECTION_ID;
      cancelLanding.current = landOn(CONTACT_SECTION_ID, { smooth: true, settleMs: 900, onArrive: () => show(want) });
    },
    [show],
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = (e.target as Element | null)?.closest?.("a[href],[data-contact-dialog]");
      if (!el) return;
      const act = contactAction(el, window.location);
      if (act.kind === "none") return;
      if (act.kind === "section") {
        // Menus, the drawer and the event pop-up still run their own close handlers.
        e.preventDefault();
        openAtSection(act.interest);
        return;
      }
      // Go to the contact page as usual; the pop-up opens there (see the arrival effect below).
      setPendingContact(new URL(act.href, window.location.href).pathname, act.interest);
      if (!(el instanceof HTMLAnchorElement)) {
        e.preventDefault();
        router.push(act.href);
      }
    };
    const onEvent = (e: Event) => {
      const d = (e as CustomEvent<ContactDialogDetail>).detail ?? {};
      if (d.atSection) openAtSection(d.interest ?? null);
      else {
        returnTo.current = null;
        show(d.interest ?? null);
      }
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener(CONTACT_DIALOG_EVENT, onEvent);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(CONTACT_DIALOG_EVENT, onEvent);
    };
  }, [show, openAtSection, router]);

  // Arrival on the contact page after a "Let's connect" click elsewhere.
  useEffect(() => {
    const pending = takePendingContact(pathname || "/");
    if (!pending) return;
    const toSection = window.location.hash === `#${CONTACT_SECTION_ID}` && byId(CONTACT_SECTION_ID);
    let timer = 0;
    if (toSection) {
      returnTo.current = CONTACT_SECTION_ID;
      cancelLanding.current?.();
      timer = window.setTimeout(() => {
        cancelLanding.current = landOn(CONTACT_SECTION_ID, { settleMs: 1200, onArrive: () => show(pending.interest) });
      }, 120);
    } else {
      returnTo.current = null;
      timer = window.setTimeout(() => show(pending.interest), 350);
    }
    return () => window.clearTimeout(timer);
  }, [pathname, show]);

  useEffect(() => () => cancelLanding.current?.(), []);

  /** Closing never scrolls: focus moves to the contact section (or the page) with preventScroll. */
  const onCloseAutoFocus = (e: Event) => {
    e.preventDefault();
    const target = (returnTo.current && byId(returnTo.current)) || byId("main");
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1150] bg-[#03060f]/75 backdrop-blur-[6px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          aria-describedby="contact-dialog-desc"
          onCloseAutoFocus={onCloseAutoFocus}
          className="fixed inset-x-0 bottom-0 z-[1160] max-h-[94dvh] overflow-y-auto overscroll-contain rounded-t-[28px] border border-white/10 bg-[#0a0e19] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-8 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-8 md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[calc(100dvh-48px)] md:w-[min(1080px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px] md:data-[state=open]:slide-in-from-bottom-4 md:data-[state=closed]:slide-out-to-bottom-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
            <div className="relative isolate overflow-hidden px-6 pb-2 pt-8 sm:px-8 md:px-9 md:py-11">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(255,120,0,0.20)_0%,transparent_55%),radial-gradient(90%_70%_at_100%_100%,rgba(23,95,255,0.22)_0%,transparent_60%)] md:border-r md:border-white/[0.07]"
              />
              <p className="font-sans text-[11.5px] font-semibold uppercase tracking-[0.28em] text-brand">{heading}</p>
              <Dialog.Title className="mt-4 max-w-[16ch] pr-10 font-heading text-[26px] font-semibold leading-[1.15] text-white md:pr-0 md:text-[32px]">
                {subheading}
              </Dialog.Title>
              <DeckBars className="mt-5" />
              <Dialog.Description id="contact-dialog-desc" className="mt-5 max-w-[40ch] font-sans text-[14px] leading-[1.65] text-white/70">
                Share a few details and the right portfolio specialist will work with you on the next step.
              </Dialog.Description>
              {nextSteps.length ? (
                <div className="mt-8 hidden md:block">
                  {nextStepsTitle ? <h3 className="font-heading text-[15px] font-semibold text-white">{nextStepsTitle}</h3> : null}
                  <ol className="mt-4 flex flex-col gap-3.5">
                    {nextSteps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/12 font-heading text-[11px] font-semibold text-brand ring-1 ring-brand/30"
                        >
                          {i + 1}
                        </span>
                        <span className="pt-[2px] font-sans text-[13.5px] leading-[1.55] text-white/70">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
            <div className="px-5 pb-7 pt-5 sm:px-8 md:px-9 md:py-11">
              <ContactFormClient
                key={round}
                idPrefix="cfd"
                options={options}
                events={events}
                serverNow={serverNow}
                dark
                submitLabel={submitLabel}
                successMessage={successMessage}
                initialInterest={interest}
                salesEmail={salesEmail}
              />
            </div>
          </div>
          <Dialog.Close
            aria-label="Close"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 backdrop-blur transition-[transform,background-color,color] duration-200 hover:scale-[1.06] hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 md:right-5 md:top-5"
          >
            <X aria-hidden className="size-[18px]" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
