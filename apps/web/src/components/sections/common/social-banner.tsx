import { CmsImage } from "@/components/cms/cms-image";
import { SmartLink } from "@/components/primitives/smart-link";
import type { SocialLink } from "@/lib/content/types";
import type { SectionProps } from "../types";

type Data = { heading?: string | null; links?: SocialLink[] | null };

/** Royal-blue "Follow us for the latest updates" band with glass social pills. Falls back to Global. */
export function SocialBanner({ data, context }: SectionProps<Data>) {
  const links = data.links?.length ? data.links : (context.global?.socialBannerLinks ?? []);
  const heading = data.heading || context.global?.socialBannerHeading || "Follow us for the latest updates";
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(110deg,#1e3d9a_0%,#2d58c0_60%,#3a63d8_100%)] px-gutter py-12 xl:py-14 3xl:py-16">
      <div aria-hidden className="absolute -left-20 -top-40 -z-10 size-[380px] rounded-full bg-white/10 blur-[110px]" />
      <div aria-hidden className="absolute -bottom-40 right-10 -z-10 size-[380px] rounded-full bg-brand/20 blur-[120px]" />
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <h2 className="font-heading text-[22px] font-semibold leading-[1.25] text-white xl:text-[28px] 3xl:text-[34px]">{heading}</h2>
        <div className="flex flex-wrap gap-3">
          {links.map((l) => (
            <SmartLink
              key={l.platform + (l.href ?? "")}
              href={l.href}
              newTab
              className="hover-grow flex items-center gap-3 rounded-full bg-white/10 py-2 pl-2 pr-5 text-left ring-1 ring-white/20 backdrop-blur-md transition-colors hover:bg-white/15"
              aria-label={`${l.label ?? l.platform} – ${l.handle ?? ""}`}
            >
              <span className="relative size-8 min-w-8">
                <CmsImage media={l.icon} alt={l.label ?? l.platform} fill sizes="32px" className="object-contain" />
              </span>
              <span className="flex flex-col">
                <span className="font-heading text-[13.5px] font-semibold leading-[1.3] text-white">{l.label}</span>
                <span className="font-sans text-[12px] leading-[1.3] text-white/70">{l.handle}</span>
              </span>
            </SmartLink>
          ))}
        </div>
      </div>
    </section>
  );
}
