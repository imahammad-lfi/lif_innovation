import { Markdown } from "@/components/cms/markdown";
import { Eyebrow } from "@/components/primitives/eyebrow";
import { cn } from "@/lib/utils";

import type { SectionProps } from "../types";

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  body?: string | null;
  secondaryEyebrow?: string | null;
  secondaryHeading?: string | null;
  secondaryBody?: string | null;
  theme?: "light" | "dark" | null;
};

function Block({ eyebrow, heading, body, dark }: { eyebrow?: string | null; heading?: string | null; body?: string | null; dark: boolean }) {
  if (!eyebrow && !heading && !body) return null;
  return (
    <div className="flex w-full flex-col items-start">
      <Eyebrow tone={dark ? "dark" : "light"}>{eyebrow}</Eyebrow>
      <div className="mt-2 flex w-full flex-col gap-5 text-left xl:flex-row xl:items-start xl:justify-between xl:gap-16">
        {heading ? (
          <h2
            className={cn(
              "w-full whitespace-pre-line font-heading text-[21.5px] font-semibold leading-[1.2] xl:max-w-[40%] xl:text-[27.5px] 3xl:text-[34.5px]",
              dark ? "text-white" : "text-[#0b0b0b]",
            )}
          >
            {heading}
          </h2>
        ) : null}
        {body ? (
          <div className="w-full xl:max-w-[52%]">
            <Markdown
              className={cn(
                "text-left font-sans text-[14px] leading-[1.7] xl:text-[14.5px] 3xl:text-[16.5px] [&_p:last-child]:pb-0 [&_p]:pb-4",
                dark ? "text-white/65" : "text-[#4b5157]",
              )}
            >
              {body}
            </Markdown>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** "OVERVIEW" block: eyebrow + heading on the left, copy on the right (light or black background). */
export function Overview({ data }: SectionProps<Data>) {
  const dark = data.theme === "dark";
  return (
    <section
      id={data.anchorId || undefined}
      className={cn(
        "flex w-full flex-col items-start gap-14 px-gutter py-16 xl:py-24 3xl:py-28",
        dark ? "bg-black" : "bg-[#f5f6f7]",
      )}
    >
      <Block eyebrow={data.eyebrow} heading={data.heading} body={data.body} dark={dark} />
      <Block eyebrow={data.secondaryEyebrow} heading={data.secondaryHeading} body={data.secondaryBody} dark={dark} />
    </section>
  );
}
