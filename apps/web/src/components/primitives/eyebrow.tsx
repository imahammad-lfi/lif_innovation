import { cn } from "@/lib/utils";
/**
 * Section label shown above headings ("OVERVIEW"), in the corporate-deck style: brand-orange spaced capitals.
 * Matches DeckLabel in primitives/deck.tsx so legacy and deck sections read as one system.
 * The CMS text is upper-cased, so editors may type any case.
 * `tone="light"` (sections on the light #f5f6f7 surface) uses the deeper brand orange #b34f00 — 4.8:1 on that surface,
 * where the standard #ff7800 is only 2.4:1 (WCAG 2.2 AA needs 4.5:1 for text this size).
 */
export function Eyebrow({ children, className, tone = "dark" }: { children?: React.ReactNode; className?: string; tone?: "dark" | "light" }) {
  if (!children) return null;
  return (
    <div className={cn("my-2.5 flex w-fit items-center xl:my-3.5", className)}>
      <span className={cn("font-sans text-[11px] font-semibold leading-[1.4] tracking-[0.28em] xl:text-[12px]", tone === "light" ? "text-[#b34f00]" : "text-brand")}>
        {typeof children === "string" ? children.toUpperCase() : children}
      </span>
    </div>
  );
}
