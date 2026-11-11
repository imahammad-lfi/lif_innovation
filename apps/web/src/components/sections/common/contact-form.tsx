import type { CSSProperties } from "react";

import { DeckBars } from "@/components/primitives/deck";
import { contentClock, getEvents } from "@/lib/content";
import type { Option, TextItem } from "@/lib/content/types";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

import type { SectionProps } from "../types";
import type { FormEvent } from "./contact-form-client";
import { ContactFormClient } from "../lazy"; // code-split (see sections/lazy.tsx)

type Data = {
  anchorId?: string | null;
  heading?: string | null;
  subheading?: string | null;
  nextStepsTitle?: string | null;
  nextSteps?: TextItem[] | null;
  layout?: "section" | "page" | null;
  theme?: "dark" | "light" | null;
};

/**
 * "Let's connect" lead form. Empty fields fall back to
 * Strapi › Global › Contact form defaults, so editors manage the copy and service list once.
 */
export async function ContactForm({ data, context }: SectionProps<Data>) {
  const defaults = context.global?.contactForm ?? {};
  const [allEvents, serverNow] = await Promise.all([getEvents(), contentClock()]);
  // Only what the form needs; the client decides (on the visitor's clock) which events are still selectable.
  const events: FormEvent[] = allEvents.map((e) => ({ slug: e.slug, title: e.title, startDate: e.startDate, endDate: e.endDate, stand: e.stand }));
  const dark = data.theme !== "light";
  const heading = data.heading || defaults.heading || "Let's connect";
  const subheading = data.subheading || defaults.subheading || "";
  const nextStepsTitle = data.nextStepsTitle || defaults.nextStepsTitle || "";
  const nextSteps = data.nextSteps?.length ? data.nextSteps : (defaults.nextSteps ?? []);
  const options: Option[] = defaults.serviceOptions ?? [];
  const bg = mediaUrl(dark ? defaults.backgroundDark : defaults.backgroundLight);
  const bgMobile = mediaUrl(dark ? defaults.backgroundDarkMobile : defaults.backgroundLightMobile) ?? bg;
  const style = {
    "--contact-bg": bg ? `url("${bg}")` : "none",
    "--contact-bg-m": bgMobile ? `url("${bgMobile}")` : "none",
  } as CSSProperties;

  const page = data.layout === "page";
  return (
    <section
      id={data.anchorId || "get-in-touch"}
      style={style}
      className={cn(
        "relative isolate w-full overflow-hidden bg-[image:var(--contact-bg-m)] bg-cover bg-center bg-no-repeat px-gutter py-16 md:bg-[image:var(--contact-bg)] xl:py-24 3xl:py-28",
        dark ? "bg-espresso" : "bg-[#eef0f1]",
        page && "pt-[120px] xl:pt-[150px] 3xl:pt-[170px]",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10",
          dark ? "bg-[linear-gradient(90deg,rgba(10,8,7,0.92)_0%,rgba(10,8,7,0.75)_55%,rgba(10,8,7,0.55)_100%)]" : "bg-white/60",
        )}
      />
      <div className="grid w-full grid-cols-1 gap-10 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-16 3xl:gap-24">
        <div className="flex flex-col">
          {subheading ? (
            <>
              <p className="w-fit font-sans text-[11px] font-semibold uppercase leading-[1.4] tracking-[0.28em] text-brand xl:text-[12px]">{heading}</p>
              <h2
                className={cn(
                  "mt-5 max-w-[18ch] font-heading text-[24px] font-semibold leading-[1.15] xl:text-[34.5px] 3xl:text-[41.5px]",
                  dark ? "text-white" : "text-[#0b0b0b]",
                )}
              >
                {subheading}
              </h2>
            </>
          ) : (
            <h2
              className={cn(
                "max-w-[18ch] font-heading text-[24px] font-semibold leading-[1.15] xl:text-[34.5px] 3xl:text-[41.5px]",
                dark ? "text-white" : "text-[#0b0b0b]",
              )}
            >
              {heading}
            </h2>
          )}
          <DeckBars className="mt-5" />
          {nextStepsTitle || nextSteps.length ? (
            <div className="mt-10 xl:mt-12">
              <h3 className={cn("font-heading text-[14.5px] font-semibold xl:text-[16.5px] 3xl:text-[18px]", dark ? "text-white" : "text-[#0b0b0b]")}>
                {nextStepsTitle}
              </h3>
              <ol className="mt-5 flex flex-col gap-4">
                {nextSteps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <span
                      aria-hidden
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/12 font-heading text-[11.5px] font-semibold text-brand ring-1 ring-brand/30"
                    >
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "pt-[3px] font-sans text-[13.5px] leading-[1.6] xl:text-[14px] 3xl:text-[14.5px]",
                        dark ? "text-white/75" : "text-[#4b5157]",
                      )}
                    >
                      {s.title}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "rounded-3xl border p-5 backdrop-blur-xl sm:p-8 3xl:p-10",
            dark ? "border-white/10 bg-black/40 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]" : "border-black/[0.06] bg-white/80 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]",
          )}
        >
          <ContactFormClient
            options={options}
            events={events}
            serverNow={serverNow}
            dark={dark}
            submitLabel={defaults.submitLabel || "Submit"}
            successMessage={defaults.successMessage || "Thank you for submitting your enquiry. Our expert consultants will be in touch."}
            salesEmail={context.global?.salesEmail || "sales@linkfields.com"}
          />
        </div>
      </div>
    </section>
  );
}
