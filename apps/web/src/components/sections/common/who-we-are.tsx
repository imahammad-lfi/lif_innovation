import { CmsImage } from "@/components/cms/cms-image";
import { DeckBars, DeckLabel, DeckStage, Highlight } from "@/components/primitives/deck";
import { accentVars } from "@/lib/accent";
import type { Accent, Media } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import type { SectionProps } from "../types";
import type { Metric } from "./metrics-grid";

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  body?: string | null;
  missionLabel?: string | null;
  mission?: string | null;
  visionLabel?: string | null;
  vision?: string | null;
  stats?: Metric[] | null;
  image?: Media | null;
};

const STAT_COLOURS: Accent[] = ["yellow", "orange", "blue", "teal"];

function Statement({ label, text, accent }: { label?: string | null; text?: string | null; accent: Accent }) {
  if (!text) return null;
  return (
    <div style={accentVars(accent)} className="card-surface flex min-w-0 flex-col p-6 xl:p-8">
      <div className="flex items-center gap-3">
        <span aria-hidden className="size-4 rounded-full bg-[var(--acc)] shadow-[0_0_14px_var(--acc)]" />
        <span className="font-sans text-[11.5px] font-semibold uppercase tracking-[0.3em] text-[var(--acc)] xl:text-[12.5px]">{label}</span>
      </div>
      <p className="mt-5 font-sans text-[14px] leading-[1.8] text-white/80 xl:text-[14.5px]">{text}</p>
    </div>
  );
}

/** Company introduction from the corporate deck: positioning, mission, vision and headline facts. */
export function WhoWeAre({ data }: SectionProps<Data>) {
  const paragraphs = (data.body ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const stats = (data.stats ?? []).filter((s) => s?.value);
  return (
    <DeckStage id={data.anchorId}>
      <DeckLabel>{data.eyebrow}</DeckLabel>
      {data.heading ? (
        <h2 className="mt-3 max-w-[30ch] font-heading text-[27.5px] font-semibold leading-[1.12] tracking-[-0.02em] text-white xl:text-[40px] 3xl:text-[46px]">
          <Highlight text={data.heading} />
        </h2>
      ) : null}
      <DeckBars className="mt-5" />
      {paragraphs.length ? (
        <div className="mt-7 grid max-w-[1180px] gap-5 font-sans text-[14.5px] leading-[1.8] text-white/75 xl:text-[15.5px]">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
      ) : null}
      {data.mission || data.vision || data.image ? (
      <div className={cn("mt-10 grid gap-5 xl:mt-12", data.image ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.85fr)]" : "md:grid-cols-2")}>
        <Statement label={data.missionLabel || "Our mission"} text={data.mission} accent="yellow" />
        <Statement label={data.visionLabel || "Our vision"} text={data.vision} accent="blue" />
        {data.image ? (
          <div className="relative hidden min-h-[280px] overflow-hidden rounded-2xl lg:block">
            <CmsImage media={data.image} alt="" fill sizes="(max-width: 1280px) 30vw, 520px" className="object-contain [mask-image:radial-gradient(circle_at_50%_50%,#000_62%,transparent_74%)]" />
          </div>
        ) : null}
      </div>
      ) : null}
      {stats.length ? (
        <dl className={cn(data.mission || data.vision ? "mt-5" : "mt-9", "grid overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.08] sm:divide-x sm:divide-white/[0.08]", stats.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3")}>
          {stats.map((s, i) => (
            <div key={`${s.value}-${i}`} style={accentVars(s.accent || STAT_COLOURS[i % STAT_COLOURS.length])} className="min-w-0 px-6 py-5 max-sm:border-b max-sm:border-white/[0.08] max-sm:last:border-b-0 xl:px-8">
              <dt className="font-heading text-[21.5px] font-bold leading-none text-[var(--acc)] xl:text-[27.5px]">{s.value}</dt>
              <dd className="mt-2 font-sans text-[13px] leading-[1.45] text-white/75 xl:text-[13.5px]">{s.title}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </DeckStage>
  );
}
