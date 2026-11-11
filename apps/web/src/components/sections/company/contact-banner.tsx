import type { CSSProperties } from "react";
import { ArrowUpRight, BriefcaseBusiness, Handshake, Mail, Megaphone, type LucideIcon } from "lucide-react";
import { Highlight } from "@/components/primitives/deck";
import { SmartLink } from "@/components/primitives/smart-link";
import type { SectionProps } from "../types";

type Contact = { title?: string | null; email?: string | null };
type Data = { anchorId?: string | null; heading?: string | null; description?: string | null; contacts?: Contact[] | null };

/** Icon by enquiry type, so editors only enter a title and an address. */
function iconFor(title: string): LucideIcon {
  if (/sales|business|commercial|partner/i.test(title)) return Handshake;
  if (/career|job|talent|hiring|recruit/i.test(title)) return BriefcaseBusiness;
  if (/media|press|marketing/i.test(title)) return Megaphone;
  return Mail;
}

/** Linkfields accents cycle across the cards: orange, royal blue, gold. */
const ACCENTS = [
  { acc: "#ff8c00", line: "rgba(255,140,0,0.45)", chip: "linear-gradient(135deg,#ffa033 0%,#ff7800 55%,#ec5a06 100%)", glow: "rgba(255,120,0,0.55)" },
  { acc: "#7d9cff", line: "rgba(93,128,240,0.5)", chip: "linear-gradient(135deg,#4f78e6 0%,#2d58c0 55%,#1f3f96 100%)", glow: "rgba(45,88,192,0.6)" },
  { acc: "#ffc21a", line: "rgba(255,194,26,0.45)", chip: "linear-gradient(135deg,#ffd54a 0%,#ffb21e 55%,#f08c00 100%)", glow: "rgba(255,178,30,0.5)" },
];

/**
 * Compact email strip: one glass card per enquiry type with a gradient icon chip, label and address. The optional
 * heading and description sit on the left on wide desktops and above the cards below 1360px, so every address
 * fits in full; the arrow sits in the card corner rather than taking a column.
 */
export function ContactBanner({ data }: SectionProps<Data>) {
  const contacts = (data.contacts ?? []).filter((c) => c.email);
  if (!contacts.length) return null;
  const heading = data.heading?.trim();
  return (
    <section
      id={data.anchorId || undefined}
      aria-label={heading ? undefined : "Email contacts"}
      className="relative isolate overflow-hidden border-y border-white/[0.06] bg-[#05070f] px-gutter py-12 text-white 3xl:py-14 max-[768px]:py-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_140%_at_0%_0%,rgba(45,88,192,0.22),transparent_62%),radial-gradient(45%_140%_at_100%_100%,rgba(255,120,0,0.14),transparent_60%)]"
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,140,0,0.55)_30%,rgba(45,88,192,0.55)_70%,transparent)]" />
      <div className="flex items-center gap-10 max-[1360px]:flex-col max-[1360px]:items-stretch max-[1360px]:gap-6">
        {heading ? (
          <div className="w-[260px] shrink-0 3xl:w-[340px] max-[1360px]:w-auto">
            <h2 data-type-role="band" className="font-heading text-[20px] font-semibold leading-[1.25] text-white 3xl:text-[21.5px] max-[768px]:text-[18px]">
              <Highlight text={heading} />
            </h2>
            {data.description ? <p className="mt-2 max-w-[48ch] text-pretty font-sans text-[13.5px] leading-[1.55] text-white/60 3xl:text-[14px]">{data.description}</p> : null}
          </div>
        ) : null}
        <ul className="grid min-w-0 flex-1 grid-cols-3 gap-4 max-[900px]:grid-cols-1 max-[900px]:gap-3">
          {contacts.map((contact, index) => {
            const title = contact.title || "Email";
            const Icon = iconFor(title);
            const a = ACCENTS[index % ACCENTS.length];
            return (
              <li key={`${title}-${index}`} className="min-w-0">
                <SmartLink
                  href={`mailto:${contact.email}`}
                  style={{ "--acc": a.acc, "--acc-line": a.line, "--acc-glow": a.glow } as CSSProperties}
                  className="group hover-lift relative flex h-full items-center gap-3.5 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 pr-7 backdrop-blur-sm transition-colors duration-300 hover:border-[var(--acc-line)] hover:bg-white/[0.055] focus-visible:border-[var(--acc-line)] 3xl:p-5"
                >
                  <span
                    aria-hidden
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-white shadow-[0_10px_24px_-12px_var(--acc-glow),inset_0_1px_0_rgba(255,255,255,0.28)] transition-transform duration-300 group-hover:scale-[1.08] motion-reduce:transform-none 3xl:size-12"
                    style={{ backgroundImage: a.chip }}
                  >
                    <Icon className="size-[19px]" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-sans text-[11px] font-semibold uppercase leading-[1.4] tracking-[0.16em] text-white/50 3xl:text-[11px]">{title}</span>
                    <span title={contact.email ?? undefined} className="mt-1 block truncate font-heading text-[14.5px] font-semibold leading-[1.35] text-white transition-colors duration-300 group-hover:text-[var(--acc)] 3xl:text-[15.5px]">
                      {contact.email}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="absolute right-3.5 top-3.5 size-4 text-white/35 transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--acc)] motion-reduce:transform-none"
                  />
                </SmartLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
