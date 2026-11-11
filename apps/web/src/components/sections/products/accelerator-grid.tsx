import { ArrowRight, Check } from "lucide-react";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { SmartLink } from "@/components/primitives/smart-link";
import { accentVars } from "@/lib/accent";
import type { Accent, Media, TextItem } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import type { SectionProps } from "../types";

type Accelerator = {
  label?: string | null;
  title: string;
  description?: string | null;
  icon?: Media | null;
  accent?: Accent | null;
  features?: TextItem[] | null;
  href?: string | null;
  linkLabel?: string | null;
};

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  items?: Accelerator[] | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

const norm = (p?: string | null) => (p ?? "").replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";

function AcceleratorCard({ item }: { item: Accelerator }) {
  const body = (
    <>
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_60%_at_0%_0%,var(--acc-soft),transparent_65%)] opacity-90 transition-opacity duration-500 group-hover/acc:opacity-100"
      />
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,var(--acc),color-mix(in_srgb,var(--acc)_25%,transparent))]" />
      <span
        aria-hidden
        className="absolute -bottom-24 -right-20 -z-10 size-[220px] rounded-full bg-[var(--acc)] opacity-[0.10] blur-[70px] transition-opacity duration-500 group-hover/acc:opacity-[0.22]"
      />
      <span className="flex items-center justify-between gap-3">
        {item.icon ? (
          <span className="flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--acc-line),var(--acc-soft))] shadow-[0_10px_26px_-12px_var(--acc)] ring-1 ring-[var(--acc-line)] transition-transform duration-300 group-hover/acc:scale-105 max-[768px]:size-10">
            <CmsImage media={item.icon} alt="" width={24} height={24} className="size-6 object-contain max-[768px]:size-5" />
          </span>
        ) : null}
        {item.label ? (
          <span className="font-sans text-[11px] font-semibold uppercase leading-[1.3] tracking-[0.14em] text-[var(--acc)] 3xl:text-[11.5px]">
            {item.label}
          </span>
        ) : null}
      </span>
      <h3 className="mt-5 font-heading text-[15.5px] font-semibold leading-[1.3] text-white xl:text-[16.5px] 3xl:text-[18px]">{item.title}</h3>
      {item.description ? (
        <p className="mt-2 font-sans text-[13px] leading-[1.6] text-white/60 3xl:text-[13.5px]">{item.description}</p>
      ) : null}
      {item.features?.length ? (
        <ul className="mt-5 flex flex-col gap-2.5 border-t border-white/[0.07] pt-5">
          {item.features.map((f, i) =>
            f.title ? (
              <li key={i} className="flex items-start gap-2.5 font-sans text-[13px] leading-[1.45] text-white/80 3xl:text-[13.5px]">
                <span className="mt-[2px] flex size-[16px] shrink-0 items-center justify-center rounded-full bg-[var(--acc-soft)] ring-1 ring-[var(--acc-line)]">
                  <Check aria-hidden className="size-[10px] stroke-[3] text-[var(--acc)]" />
                </span>
                {f.title}
              </li>
            ) : null,
          )}
        </ul>
      ) : null}
      {item.href ? (
        <span className="mt-auto inline-flex items-center gap-2 pt-6 font-heading text-[13px] font-semibold text-[var(--acc)] 3xl:text-[13.5px]">
          {item.linkLabel || "Explore"}
          <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover/acc:translate-x-1" />
        </span>
      ) : null}
    </>
  );
  const cls =
    "card-surface group/acc flex h-full flex-col overflow-hidden rounded-[22px] bg-[#0c111d] p-6 max-[768px]:p-5 3xl:p-8";
  return item.href ? (
    <SmartLink
      href={item.href}
      style={accentVars(item.accent)}
      className={cls}
    >
      {body}
    </SmartLink>
  ) : (
    <div style={accentVars(item.accent)} className={cn(cls, "card-surface-flat")}>
      {body}
    </div>
  );
}

/** "REUSABLE ACCELERATORS": colour-coded accelerator cards. The card linking to the current page is hidden. */
export function AcceleratorGrid({ data, context }: SectionProps<Data>) {
  const here = norm(context.page.path);
  const items = (data.items ?? []).filter((it) => !it.href || norm(it.href) !== here);
  const n = items.length;
  const cols =
    n >= 5
      ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      : n === 4
        ? "sm:grid-cols-2 xl:grid-cols-4"
        : n === 3
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2";
  return (
    <section
      id={data.anchorId || undefined}
      className="relative isolate w-full overflow-hidden bg-[#07090f] px-gutter py-16 xl:py-24 3xl:py-28"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_100%_100%,rgba(160,107,255,0.10),transparent_70%),radial-gradient(45%_40%_at_0%_0%,rgba(31,200,169,0.07),transparent_70%)]"
      />
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="max-w-[760px]">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          {data.heading ? (
            <h2 className="mt-2 font-heading text-[21.5px] font-semibold leading-[1.2] text-white xl:text-[27.5px] 3xl:text-[34.5px]">{data.heading}</h2>
          ) : null}
          {data.description ? (
            <p className="mt-4 max-w-[60ch] font-sans text-[14px] leading-[1.65] text-white/65 xl:text-[14.5px] 3xl:text-[16.5px]">{data.description}</p>
          ) : null}
        </div>
        {data.ctaLabel && data.ctaUrl ? (
          <SmartLink href={data.ctaUrl} className="btn-secondary max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[13.5px]">
            {data.ctaLabel}
            <ArrowRight aria-hidden className="size-4" />
          </SmartLink>
        ) : null}
      </div>
      {n ? (
        <div className={cn("mt-8 grid grid-cols-1 gap-4 xl:mt-12 xl:gap-5 3xl:gap-6", cols)}>
          {items.map((it, i) => (
            <AcceleratorCard key={`${it.title}-${i}`} item={it} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
