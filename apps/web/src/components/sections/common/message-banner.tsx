import { ArrowRight } from "lucide-react";
import { SmartLink } from "@/components/primitives/smart-link";
import type { SectionProps } from "../types";

type Data = {
  anchorId?: string | null;
  title: string;
  description?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

/** Royal-blue gradient band: statement on the left, orange call-to-action pill on the right. */
export function MessageBanner({ data }: SectionProps<Data>) {
  return (
    <section
      id={data.anchorId || undefined}
      className="relative isolate overflow-hidden bg-[linear-gradient(110deg,#1e3d9a_0%,#2d58c0_55%,#3a63d8_100%)] px-gutter py-12 xl:py-14 3xl:py-16"
    >
      <div aria-hidden className="absolute -right-24 -top-32 -z-10 size-[420px] rounded-full bg-brand/25 blur-[110px]" />
      <div aria-hidden className="absolute -bottom-40 left-1/4 -z-10 size-[360px] rounded-full bg-white/10 blur-[120px]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:44px_44px]"
      />
      <div className="flex flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
        <div className="max-w-[880px]">
          <p data-type-role="band" className="font-heading text-[20px] font-semibold leading-[1.25] text-white xl:text-[24px] 3xl:text-[27.5px]">{data.title}</p>
          {data.description ? (
            <p className="mt-3 font-sans text-[14px] leading-[1.6] text-white/80 xl:text-[14.5px] 3xl:text-[16.5px]">{data.description}</p>
          ) : null}
        </div>
        {data.ctaLabel ? (
          <SmartLink href={data.ctaUrl || "/contact-us"} className="btn-primary group shrink-0 max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[13.5px]">
            {data.ctaLabel}
            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </SmartLink>
        ) : null}
      </div>
    </section>
  );
}
