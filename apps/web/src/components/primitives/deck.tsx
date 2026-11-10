import type { ReactNode } from "react";
import { CmsImage } from "@/components/cms/cms-image";
import { SmartLink } from "@/components/primitives/smart-link";
import type { Link, Media } from "@/lib/content/types";
import { cn } from "@/lib/utils";

/**
 * Corporate-deck building blocks shared by the deck sections (feature tiles, metrics, value plays,
 * who we are, global presence) so that every tile grid on the site reads as one system.
 */

/** `*text*` renders in brand orange and `_text_` in brand yellow, as in the deck headlines. */
export function Highlight({ text }: { text?: string | null }) {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*|_[^_]+_)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
          return (
            <span key={i} className="text-gradient-brand">
              {part.slice(1, -1)}
            </span>
          );
        if (part.startsWith("_") && part.endsWith("_") && part.length > 2)
          return (
            <span key={i} className="text-gradient-gold">
              {part.slice(1, -1)}
            </span>
          );
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/** Yellow, orange and blue brand bars that sit under deck headings. */
export function DeckBars({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex items-center gap-2", className)}>
      <span className="h-[4px] w-9 rounded-full bg-[#FFC21A]" />
      <span className="h-[4px] w-9 rounded-full bg-brand-line" />
      <span className="h-[4px] w-9 rounded-full bg-[#6E9BFF]" />
    </span>
  );
}

/** Small spaced capitals used for deck labels ("PERFORMANCE AT SCALE"). */
export function DeckLabel({ children, className }: { children?: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <span className={cn("block font-sans text-[11.5px] font-semibold uppercase leading-[1.4] tracking-[0.28em] text-brand xl:text-[12.5px]", className)}>
      {children}
    </span>
  );
}

const TONES = {
  navy: "bg-[#070b16]",
  ink: "bg-[#05070d]",
} as const;

/** Deck stage: deep navy with soft blue/orange glows (navy) or a darker plain variant (ink) for alternation. */
export function DeckStage({
  id,
  tone = "navy",
  className,
  children,
}: {
  id?: string | null;
  tone?: "navy" | "ink" | null;
  className?: string;
  children: ReactNode;
}) {
  const t = tone === "ink" ? "ink" : "navy";
  return (
    <section
      id={id || undefined}
      className={cn("relative isolate w-full overflow-clip px-gutter py-16 xl:py-24 3xl:py-28", TONES[t], className)}
    >
      {t === "navy" ? (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_100%_0%,rgba(255,120,0,0.13),transparent_70%),radial-gradient(50%_50%_at_0%_100%,rgba(61,123,255,0.13),transparent_70%),linear-gradient(180deg,#0a1124,#070b16)]"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_0%_0%,rgba(61,123,255,0.08),transparent_70%),radial-gradient(40%_45%_at_100%_100%,rgba(255,120,0,0.07),transparent_70%)]" />
      )}
      <div className="mx-auto max-w-[1760px]">{children}</div>
    </section>
  );
}

/** Eyebrow + heading (+ bars) + description, with an optional element (CTA) on the right. */
export function DeckHeader({
  eyebrow,
  heading,
  description,
  aside,
  className,
  headingClassName,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  aside?: ReactNode;
  className?: string;
  headingClassName?: string;
}) {
  if (!eyebrow && !heading && !description) return null;
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-10 gap-y-5", className)}>
      <div className="min-w-0 max-w-[880px]">
        <DeckLabel>{eyebrow}</DeckLabel>
        {heading ? (
          <h2
            className={cn(
              "mt-3 whitespace-pre-line font-heading text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-white xl:text-[40px] 3xl:text-[48px]",
              headingClassName,
            )}
          >
            <Highlight text={heading} />
          </h2>
        ) : null}
        <DeckBars className="mt-4" />
        {description ? (
          <p className="mt-5 max-w-[76ch] whitespace-pre-line short:mt-3 font-sans text-[15px] leading-[1.7] text-white/70 xl:text-[16.5px] 3xl:text-[18px]">{description}</p>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}

/** White logo plate (product, platform or partner logos sit on white, as in the deck). */
export function LogoPlate({
  media,
  name,
  href,
  className,
  size = "md",
}: {
  media?: Media | null;
  name?: string | null;
  href?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = { sm: "h-9 w-[104px] px-2.5", md: "h-12 w-[138px] px-3.5", lg: "h-[64px] w-[168px] px-5" }[size];
  const inner = { sm: "h-[20px]", md: "h-[26px]", lg: "h-[36px]" }[size];
  const body = (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] ring-1 ring-black/5 transition-[box-shadow,transform] duration-300",
        href ? "hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-14px_var(--acc),0_0_0_2px_var(--acc-line)]" : "",
        dims,
        className,
      )}
    >
      {media ? (
        <span className={cn("relative block w-full", inner)}>
          <CmsImage media={media} alt={name || ""} fill sizes="180px" className="object-contain" />
        </span>
      ) : (
        <span className="font-heading text-[15px] font-bold text-[#0b1530]">{name}</span>
      )}
    </span>
  );
  return href ? (
    <SmartLink href={href} aria-label={name || undefined} className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      {body}
    </SmartLink>
  ) : (
    body
  );
}

/** A row of logo plates (or text chips when a link has no logo). */
const GRID: Record<number, string> = {
  1: "grid-cols-1 sm:max-w-[200px]",
  2: "grid-cols-2 sm:max-w-[400px]",
  3: "grid-cols-3 sm:max-w-[600px]",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6",
  7: "grid-cols-2 sm:grid-cols-4 xl:grid-cols-7",
  8: "grid-cols-2 sm:grid-cols-4 xl:grid-cols-8",
};

export function LogoRow({
  links,
  size = "sm",
  className,
  grid,
}: {
  links?: Link[] | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Even grid of full-width plates (section-level logo walls) instead of a wrapping row. */
  grid?: boolean;
}) {
  const items = (links ?? []).filter((l) => l?.label || l?.logo);
  if (!items.length) return null;
  if (grid && items.every((l) => l.logo)) {
    return (
      <div className={cn("grid gap-3", GRID[Math.min(items.length, 8)], className)}>
        {items.map((l, i) => (
          <LogoPlate key={`${l.label}-${i}`} media={l.logo} name={l.label} href={l.href} size={size} className="w-full" />
        ))}
      </div>
    );
  }
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((l, i) =>
        l.logo ? (
          <LogoPlate key={`${l.label}-${i}`} media={l.logo} name={l.label} href={l.href} size={size} />
        ) : (
          <SmartLink
            key={`${l.label}-${i}`}
            href={l.href || "#"}
            className="inline-flex items-center rounded-full bg-white/[0.05] px-3 py-1.5 font-sans text-[12px] font-semibold text-white/80 ring-1 ring-white/10 transition-colors hover:bg-[var(--acc-soft)] hover:text-white hover:ring-[var(--acc-line)]"
          >
            {l.label}
          </SmartLink>
        ),
      )}
    </div>
  );
}

/** Splits "Title – detail" bullet lines (one per line). */
export function parseBullets(text?: string | null) {
  return (text ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(.+?)\s+[–—-]\s+(.+)$/);
      return m ? { title: m[1], detail: m[2] } : { title: l, detail: null as string | null };
    });
}

export function Bullets({ text, className, dense }: { text?: string | null; className?: string; dense?: boolean }) {
  const items = parseBullets(text);
  if (!items.length) return null;
  return (
    <ul className={cn(dense ? "space-y-2" : "space-y-2.5", "font-sans text-[13.5px] leading-[1.55] 3xl:text-[14.5px]", className)}>
      {items.map((b, i) => (
        <li key={`${b.title}-${i}`} className="flex gap-2.5">
          <span aria-hidden className="mt-[7px] size-[6px] shrink-0 rounded-full bg-[var(--acc)] shadow-[0_0_8px_var(--acc)]" />
          <span className="min-w-0">
            <span className="font-semibold text-white/90">{b.title}</span>
            {b.detail ? <span className="text-white/55"> – {b.detail}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
