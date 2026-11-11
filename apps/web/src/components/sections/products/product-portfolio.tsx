import { ArrowUpRight } from "lucide-react";
import { CmsImage } from "@/components/cms/cms-image";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { ReadMore } from "@/components/primitives/read-more";
import { SmartLink } from "@/components/primitives/smart-link";
import { accentVars } from "@/lib/accent";
import { isPlateLogo, PLATE_BOX } from "@/lib/logo-plate";
import type { Accent, Media } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import type { SectionProps } from "../types";

export type Product = {
  name: string;
  logo?: Media | null;
  tagline?: string | null;
  description?: string | null;
  tags?: string | null;
  href?: string | null;
  linkLabel?: string | null;
  openInNewTab?: boolean | null;
};

type Category = {
  anchorId?: string | null;
  number?: string | null;
  title: string;
  href?: string | null;
  accent?: Accent | null;
  products?: Product[] | null;
};

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  categories?: Category[] | null;
};

const splitTags = (tags?: string | null) =>
  (tags ?? "")
    .split(/[|,]/)
    .map((t) => t.trim())
    .filter(Boolean);

/** Three short brand bars (yellow, orange, blue) used under Products & Accelerators headings. */
export function BrandBars({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex items-center gap-2", className)}>
      <span className="h-[4px] w-9 rounded-full bg-[#FFC21A]" />
      <span className="h-[4px] w-9 rounded-full bg-brand-line" />
      <span className="h-[4px] w-9 rounded-full bg-[#3D7BFF]" />
    </span>
  );
}

function LogoChip({ product, className }: { product: Product; className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-white px-4 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] ring-1 ring-black/5 transition-[box-shadow,transform] duration-300 group-hover/prod:shadow-[0_14px_34px_-14px_var(--acc),0_0_0_2px_var(--acc-line)]",
        className,
      )}
    >
      {product.logo ? (
        <span className={isPlateLogo(product.logo) ? PLATE_BOX : "relative block h-[30px] w-full 3xl:h-[34px]"}>
          <CmsImage media={product.logo} alt={product.name} fill sizes="170px" quality={isPlateLogo(product.logo) ? 90 : undefined} className="object-contain" />
        </span>
      ) : (
        <span className="font-heading text-[15.5px] font-bold text-[#0b1530]">{product.name}</span>
      )}
    </span>
  );
}

function ProductRow({ product }: { product: Product }) {
  const tags = splitTags(product.tags);
  const body = (
    <>
      <span
        aria-hidden
        className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-[var(--acc)] opacity-0 shadow-[0_0_14px_var(--acc)] transition-opacity duration-300 group-hover/prod:opacity-100 max-[480px]:hidden"
      />
      <LogoChip product={product} className="h-[64px] w-[150px] max-[480px]:h-[52px] max-[480px]:w-[160px] 3xl:h-[72px] 3xl:w-[170px]" />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        {product.tagline ? (
          <span className="font-heading text-[14px] font-semibold leading-[1.35] text-white 3xl:text-[14.5px]">{product.tagline}</span>
        ) : null}
        {product.description ? (
          <span className="font-sans text-[13px] leading-[1.55] text-white/60 3xl:text-[13.5px]">{product.description}</span>
        ) : null}
        {tags.length ? (
          <span className="mt-1 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-[var(--acc-soft)] px-2.5 py-[3px] font-sans text-[11px] font-medium leading-[1.4] text-white/80 ring-1 ring-[var(--acc-line)]"
              >
                {t}
              </span>
            ))}
          </span>
        ) : null}
      </span>
      {product.href ? (
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center self-center rounded-full bg-white/[0.06] text-white/60 ring-1 ring-white/10 transition-all duration-300 group-hover/prod:bg-[var(--acc)] group-hover/prod:text-white group-hover/prod:ring-transparent max-[480px]:hidden"
        >
          <ArrowUpRight className="size-4" />
        </span>
      ) : null}
    </>
  );
  const cls =
    "group/prod relative flex items-center gap-4 rounded-2xl bg-white/[0.035] p-3 ring-1 ring-white/[0.07] transition-[background-color,box-shadow,transform] duration-300 max-[480px]:flex-col max-[480px]:items-stretch max-[480px]:gap-3 3xl:gap-5 3xl:p-4";
  if (!product.href) return <div className={cls}>{body}</div>;
  return (
    <SmartLink
      href={product.href}
      newTab={product.openInNewTab}
      className={cn(cls, "hover-lift hover:bg-[var(--acc-soft)] hover:shadow-[0_20px_44px_-26px_var(--acc)] hover:ring-[var(--acc-line)]")}
    >
      {body}
    </SmartLink>
  );
}

function CategoryCard({ category, className }: { category: Category; className?: string }) {
  return (
    <article
      id={category.anchorId || undefined}
      style={accentVars(category.accent)}
      className={cn(
        "card-surface card-surface-flat flex flex-col overflow-hidden rounded-[22px] bg-[#0c111d] p-6 xl:p-7 3xl:p-9",
        className,
      )}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,var(--acc),transparent_75%)]" />
      <span
        aria-hidden
        className="absolute -right-24 -top-28 -z-10 size-[340px] rounded-full bg-[var(--acc)] opacity-[0.16] blur-[90px]"
      />
      <header className="flex items-center gap-3">
        {category.number ? (
          <span className="flex h-7 min-w-9 items-center justify-center rounded-full bg-[var(--acc-soft)] px-2.5 font-heading text-[12px] font-bold text-[var(--acc)] ring-1 ring-[var(--acc-line)]">
            {category.number}
          </span>
        ) : null}
        <h3 className="font-heading text-[16.5px] font-semibold leading-[1.3] text-white xl:text-[18px] 3xl:text-[20px]">{category.title}</h3>
      </header>
      {category.products?.length ? (
        <div className="mt-5 flex flex-col gap-3 xl:mt-6 3xl:gap-4">
          {category.products.map((p, i) => (
            <ProductRow key={`${p.name}-${i}`} product={p} />
          ))}
        </div>
      ) : null}
      {category.href ? (
        <div className="mt-auto pt-6">
          <div className="border-t border-white/[0.07] pt-5">
            <ReadMore href={category.href} label={`Explore ${category.title}`} className="text-[var(--acc)]" />
          </div>
        </div>
      ) : null}
    </article>
  );
}

/** Bento layout: wide/narrow pairs per row so long and short categories balance (7/5, 5/7, then 6/6). */
const SPANS = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-6", "lg:col-span-6"];

/** "PROPRIETARY PRODUCTS – Software we own": products grouped by service line with logos. */
export function ProductPortfolio({ data }: SectionProps<Data>) {
  const cats = data.categories ?? [];
  return (
    <section
      id={data.anchorId || undefined}
      className="relative isolate w-full overflow-hidden bg-ink px-gutter py-16 xl:py-24 3xl:py-28"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_85%_0%,rgba(255,120,0,0.10),transparent_70%),radial-gradient(50%_45%_at_0%_100%,rgba(61,123,255,0.08),transparent_70%)]"
      />
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="max-w-[760px]">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          {data.heading ? (
            <h2 className="mt-2 font-heading text-[21.5px] font-semibold leading-[1.2] text-white xl:text-[27.5px] 3xl:text-[34.5px]">{data.heading}</h2>
          ) : null}
          <BrandBars className="mt-4" />
        </div>
        {data.description ? (
          <p className="max-w-[46ch] font-sans text-[14px] leading-[1.65] text-white/65 xl:text-[14.5px] 3xl:text-[16.5px]">{data.description}</p>
        ) : null}
      </div>
      {cats.length ? (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12 xl:mt-12 xl:gap-6 3xl:gap-8">
          {cats.map((c, i) => (
            <CategoryCard key={`${c.title}-${i}`} category={c} className={cats.length === 1 ? "lg:col-span-12" : cats.length >= 3 ? SPANS[i % SPANS.length] : "lg:col-span-6"} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
