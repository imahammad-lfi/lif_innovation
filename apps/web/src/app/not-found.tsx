import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found | Linkfields",
  robots: { index: false, follow: true },
};

const ROUTES = [
  { label: "Explore services", href: "/services", note: "Five integrated portfolios" },
  { label: "Solutions", href: "/solutions", note: "Five strategic value plays" },
  { label: "Products & Accelerators", href: "/products-and-accelerators", note: "Software we own and reuse" },
  { label: "Industries", href: "/industries", note: "Eight sectors we know deeply" },
];

/** Branded 404: keeps the 404 status / noindex, offers recovery routes and a contact path. */
export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900 px-gutter pb-20 pt-[132px] text-white xl:pb-28 xl:pt-[170px]">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[560px] rounded-full bg-brand/[0.12] blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-32 -z-10 size-[420px] rounded-full bg-[#6A8BFF]/[0.08] blur-[130px]" />
      <div className="mx-auto flex max-w-[1100px] flex-col gap-10 xl:gap-12">
        <div className="flex flex-col gap-5">
          <span className="font-sans text-[11.5px] font-semibold uppercase tracking-[0.28em] text-brand">Error 404</span>
          <h1 className="max-w-[760px] font-heading text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] xl:text-[52px]">
            We couldn&rsquo;t find that page
          </h1>
          <p className="max-w-[620px] font-sans text-[15px] leading-[1.65] text-white/70 xl:text-[17px]">
            The link may have changed or the page may have moved. Explore our portfolios, or tell us what you are looking for.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/contact-us" className="btn-primary group">
              <span>Let&rsquo;s connect</span>
              <ArrowRight aria-hidden className="size-4 stroke-[2.25] transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/"
              className="btn-secondary"
            >
              Go to home
            </Link>
          </div>
        </div>
        <nav aria-label="Popular destinations" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ROUTES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-white/[0.07]"
            >
              <span className="flex items-center justify-between font-heading text-[16px] font-semibold">
                {r.label}
                <ArrowRight aria-hidden className="size-4 text-brand transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              <span className="font-sans text-[13.5px] text-white/60">{r.note}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
