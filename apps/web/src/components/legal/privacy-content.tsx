"use client";

import { Markdown } from "@/components/cms/markdown";

export type PrivacySection = { heading: string | null; body: string };

/** Compact legal styles for the pop-up (the page itself uses the larger legal styles in sections/content/rich-text). */
const compact = {
  p: ({ children, ...props }: React.ComponentProps<"p">) => <p {...props} className="mb-4 text-white/70">{children}</p>,
  // the pop-up title is the h2, so the policy's own "##" headings become h3 and "###" become h4
  h1: ({ children, ...props }: React.ComponentProps<"h1">) => <h3 {...props} className="mb-3 mt-8 font-heading text-[16.5px] font-semibold leading-[1.3] text-white first:mt-0 max-[768px]:text-[15.5px]">{children}</h3>,
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => <h3 {...props} className="mb-3 mt-8 font-heading text-[16.5px] font-semibold leading-[1.3] text-white first:mt-0 max-[768px]:text-[15.5px]">{children}</h3>,
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => <h4 {...props} className="mb-2 mt-5 font-heading text-[14.5px] font-semibold leading-[1.35] text-white">{children}</h4>,
  ul: ({ children, ...props }: React.ComponentProps<"ul">) => <ul {...props} className="mb-5 list-disc space-y-2 pl-5 text-white/70 marker:text-brand">{children}</ul>,
  ol: ({ children, ...props }: React.ComponentProps<"ol">) => <ol {...props} className="mb-5 list-decimal space-y-2 pl-5 text-white/70 marker:text-brand">{children}</ol>,
  li: ({ children, ...props }: React.ComponentProps<"li">) => <li {...props} className="pl-1.5 [&>p]:mb-1.5">{children}</li>,
  a: ({ children, href, ...props }: React.ComponentProps<"a">) => (
    <a
      {...props}
      href={href}
      // links inside the pop-up open in a new tab, so the enquiry form (and what the visitor typed) stays put
      target={href && !href.startsWith("#") ? "_blank" : undefined}
      rel={href && !href.startsWith("#") ? "noopener" : undefined}
      className="text-brand underline decoration-brand/40 underline-offset-4 transition-colors hover:text-[#ffb36b]"
    >
      {children}
    </a>
  ),
};

export default function PrivacyContent({ sections }: { sections: PrivacySection[] }) {
  return (
    <div className="font-sans text-[13.5px] leading-[1.7] text-white/70 [overflow-wrap:anywhere]">
      {sections.map((s, i) => (
        // the CMS stores the policy in several text blocks; they read as one continuous document here
        <div key={i} className={i ? "mt-8" : undefined}>
          {s.heading ? <h3 className="mb-4 font-heading text-[18px] font-semibold leading-[1.25] text-white max-[768px]:text-[16.5px]">{s.heading}</h3> : null}
          <Markdown components={compact}>{s.body}</Markdown>
        </div>
      ))}
    </div>
  );
}
