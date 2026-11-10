import { Markdown } from "@/components/cms/markdown";
import type { SectionProps } from "../types";

type Data = {
  anchorId?: string | null;
  heading?: string | null;
  body?: string | null;
  variant?: "legal" | "article" | "plain" | null;
};

const legalMarkdown = {
  p: ({ children, ...props }: React.ComponentProps<"p">) => <p {...props} className="mb-5 text-white/65">{children}</p>,
  h1: ({ children, ...props }: React.ComponentProps<"h1">) => <h2 {...props} className="mb-4 mt-10 font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:text-[24px]">{children}</h2>,
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => <h2 {...props} className="mb-4 mt-10 font-heading text-[32px] font-semibold leading-[1.2] text-white 3xl:text-[40px] max-[768px]:text-[24px]">{children}</h2>,
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => <h3 {...props} className="mb-3 mt-8 font-heading text-[18px] font-semibold leading-[1.35] text-white 3xl:text-[20px] max-[768px]:text-[16px]">{children}</h3>,
  ul: ({ children, ...props }: React.ComponentProps<"ul">) => <ul {...props} className="mb-6 list-disc space-y-3 pl-5 text-white/65 marker:text-brand">{children}</ul>,
  ol: ({ children, ...props }: React.ComponentProps<"ol">) => <ol {...props} className="mb-6 list-decimal space-y-3 pl-5 text-white/65 marker:text-brand">{children}</ol>,
  li: ({ children, ...props }: React.ComponentProps<"li">) => <li {...props} className="pl-2 [&>p]:mb-2">{children}</li>,
  a: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props} className="text-brand underline decoration-brand/40 underline-offset-4 transition-colors hover:text-[#ffb36b]">{children}</a>,
};

export function RichText({ data }: SectionProps<Data>) {
  const legal = (data.variant ?? "legal") === "legal";
  const textClass = "font-sans text-[15px] font-normal leading-[1.75] text-white/65 [overflow-wrap:anywhere] 3xl:text-[16px] max-[768px]:text-[14.5px]";
  if (!legal) return <Markdown className={textClass} components={legalMarkdown}>{data.body}</Markdown>;
  return (
    <section id={data.anchorId || undefined} className="mt-[72px] bg-black px-gutter py-24 text-white 3xl:py-[120px] max-[768px]:mt-16 max-[768px]:py-16">
      <div className="mx-auto w-full max-w-[800px]">
        {data.heading ? <h1 className="mb-10 border-b border-white/[0.07] pb-8 font-heading text-[40px] font-semibold leading-[1.15] 3xl:text-[48px] max-[768px]:mb-8 max-[768px]:text-[28px]">{data.heading}</h1> : null}
        <Markdown className={textClass} components={legalMarkdown}>{data.body}</Markdown>
      </div>
    </section>
  );
}
