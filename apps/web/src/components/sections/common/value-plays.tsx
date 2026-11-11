import { ArrowRight } from "lucide-react";
import { DeckHeader, DeckStage } from "@/components/primitives/deck";
import { SmartLink } from "@/components/primitives/smart-link";
import { accentVars } from "@/lib/accent";
import type { Accent } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Play = { title: string; trigger?: string | null; outcome?: string | null; ip?: string | null; accent?: Accent | null; href?: string | null; linkLabel?: string | null };
type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  plays?: Play[] | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

const CYCLE: Accent[] = ["orange", "blue", "teal", "purple", "yellow"];
const COLS = "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.05fr)]";

function chips(ip?: string | null) {
  return (ip ?? "")
    .split(/,|\band\b|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 lg:hidden">{label}</span>
      {children}
    </div>
  );
}

/** "We lead with outcomes, not offerings": each play maps a customer trigger to an outcome and the Linkfields IP behind it. */
export function ValuePlays({ data }: SectionProps<Data>) {
  const plays = (data.plays ?? []).filter((p) => p?.title);
  return (
    <DeckStage id={data.anchorId} tone="ink">
      <DeckHeader
        eyebrow={data.eyebrow}
        heading={data.heading}
        description={data.description}
        aside={
          data.ctaUrl ? (
            <SmartLink href={data.ctaUrl} className="group/cta inline-flex items-center gap-2 font-heading text-[13.5px] font-semibold text-brand hover:text-[#ff9a3d]">
              {data.ctaLabel || "Let's connect"}
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
            </SmartLink>
          ) : null
        }
      />
      <div className="mt-10 xl:mt-12">
        <div className={`hidden gap-6 px-6 pb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45 lg:grid ${COLS}`}>
          <span>Value play</span>
          <span>Customer trigger</span>
          <span>Business outcome</span>
          <span>Linkfields IP</span>
        </div>
        <ol className="space-y-3">
          {plays.map((p, i) => (
            <li key={p.title} style={accentVars(p.accent || CYCLE[i % CYCLE.length])} className={`card-surface grid items-center gap-4 p-5 lg:gap-6 lg:px-6 ${COLS}`}>
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--acc)] font-heading text-[14px] font-bold text-[#0a0f1d] shadow-[0_10px_24px_-10px_var(--acc)]">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-heading text-[14.5px] font-semibold leading-[1.3] text-white xl:text-[16px]">
                    {p.href ? (
                      <SmartLink href={p.href} className="transition-colors hover:text-[var(--acc)]">
                        {p.title}
                      </SmartLink>
                    ) : (
                      p.title
                    )}
                  </h3>
                  {p.href ? (
                    <SmartLink
                      href={p.href}
                      aria-hidden
                      tabIndex={-1}
                      className="group/play mt-1 inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold text-[var(--acc)]"
                    >
                      {p.linkLabel || "Explore this play"}
                      <ArrowRight className="size-3.5 transition-transform group-hover/play:translate-x-0.5" />
                    </SmartLink>
                  ) : null}
                </div>
              </div>
              <Cell label="Customer trigger">
                <p className="font-sans text-[13px] leading-[1.55] text-white/60 xl:text-[13.5px]">{p.trigger}</p>
              </Cell>
              <Cell label="Business outcome">
                <p className="font-sans text-[13px] font-medium leading-[1.55] text-white/85 xl:text-[13.5px]">{p.outcome}</p>
              </Cell>
              <Cell label="Linkfields IP">
                <ul className="flex flex-wrap gap-1.5">
                  {chips(p.ip).map((c) => (
                    <li key={c} className="rounded-full bg-[var(--acc-soft)] px-2.5 py-1 font-sans text-[11px] font-semibold leading-[1.3] text-[var(--acc)] ring-1 ring-[var(--acc-line)]">
                      {c}
                    </li>
                  ))}
                </ul>
              </Cell>
            </li>
          ))}
        </ol>
      </div>
    </DeckStage>
  );
}
