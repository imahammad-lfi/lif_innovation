"use client";

import { ArrowUpRight, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { useCallback, useRef, useState, type MouseEvent, type ReactNode } from "react";
import type { PrivacySection } from "./privacy-content";

type Policy = { title: string; path: string; sections: PrivacySection[] };

// The Markdown renderer is only downloaded the first time the pop-up opens.
const PrivacyContent = dynamic(() => import("./privacy-content"), { ssr: false, loading: () => <Skeleton /> });

let cache: Promise<Policy> | null = null;
function loadPolicy(): Promise<Policy> {
  cache ??= fetch("/api/legal/privacy", { headers: { accept: "application/json" } }).then((r) => {
    if (!r.ok) throw new Error(String(r.status));
    return r.json() as Promise<Policy>;
  });
  cache.catch(() => (cache = null)); // allow a retry after a failure
  return cache;
}

function Skeleton() {
  return (
    <div aria-hidden className="space-y-3 py-2">
      {[92, 100, 84, 96, 70, 88].map((w, i) => (
        <div key={i} className="h-3 animate-pulse rounded-full bg-white/[0.07]" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

/**
 * "Privacy Policy" link for the enquiry form. A plain click opens the policy in a pop-up above the form (also above the
 * Let's connect pop-up), so the visitor reads it and returns to the form with everything they typed still in place.
 * Ctrl/Cmd/Shift/middle click keep the normal link behaviour (open /privacy-policy in a new tab or window).
 */
export function PrivacyPolicyLink({ className, children = "Privacy Policy" }: { className?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [failed, setFailed] = useState(false);
  const trigger = useRef<HTMLAnchorElement>(null);

  const show = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setFailed(false);
    setOpen(true);
    loadPolicy().then(setPolicy, () => setFailed(true));
  }, []);

  return (
    <>
      <Link ref={trigger} href="/privacy-policy" onClick={show} className={className} aria-haspopup="dialog" prefetch={false}>
        {children}
      </Link>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[1170] bg-[#03060f]/70 backdrop-blur-[4px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <Dialog.Content
            data-privacy-dialog=""
            // back to the link the visitor used, inside the enquiry form (Radix would otherwise focus the form's dialog)
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              trigger.current?.focus({ preventScroll: true });
            }}
            className="fixed inset-x-0 bottom-0 z-[1180] flex max-h-[90dvh] flex-col overflow-hidden rounded-t-[24px] border border-white/10 bg-[#0a0e19] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-8 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-8 md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[min(86dvh,860px)] md:w-[min(760px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px] md:data-[state=open]:slide-in-from-bottom-4 md:data-[state=closed]:slide-out-to-bottom-4"
          >
            <div className="relative isolate shrink-0 overflow-hidden border-b border-white/[0.07] px-6 pb-5 pt-6 pr-16 sm:px-8 md:pt-7">
              <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(90%_140%_at_0%_0%,rgba(255,120,0,0.16)_0%,transparent_60%),radial-gradient(70%_120%_at_100%_100%,rgba(23,95,255,0.16)_0%,transparent_65%)]" />
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">Your data</p>
              <Dialog.Title className="mt-2 font-heading text-[21.5px] font-semibold leading-[1.2] text-white md:text-[24px]">
                {policy?.title || "Privacy Policy"}
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 font-sans text-[13px] leading-[1.6] text-white/60">
                How Linkfields collects, uses and protects the details you share with us.
              </Dialog.Description>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8" tabIndex={0} aria-label="Privacy Policy text">
              {failed ? (
                <p className="font-sans text-[13.5px] leading-[1.7] text-white/70">
                  The policy could not be loaded just now.{" "}
                  <a href="/privacy-policy" target="_blank" rel="noopener" className="text-brand underline underline-offset-4">
                    Open the Privacy Policy page
                  </a>{" "}
                  in a new tab instead.
                </p>
              ) : policy ? (
                <PrivacyContent sections={policy.sections} />
              ) : (
                <Skeleton />
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] px-6 py-4 sm:px-8">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 font-sans text-[12.5px] font-medium text-white/65 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Open the full page <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
              <Dialog.Close className="btn-primary">Back to the form</Dialog.Close>
            </div>
            <Dialog.Close
              aria-label="Close the Privacy Policy"
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 backdrop-blur transition-[transform,background-color,color] duration-200 hover:scale-[1.06] hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 md:right-5 md:top-5"
            >
              <X aria-hidden className="size-[18px]" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
