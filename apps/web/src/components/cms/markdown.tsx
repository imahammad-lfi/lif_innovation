import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

const schema = {
  ...defaultSchema,
  clobberPrefix: "",
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "id"],
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
  },
};

type Props = {
  children?: string | null;
  className?: string;
  /** Override element renderers, e.g. { p: (p) => <p className="..." {...p} /> } */
  components?: Components;
};

/** Renders CMS Markdown (Strapi richtext) safely: GFM tables/lists, sanitized inline HTML, heading ids. */
export function Markdown({ children, className, components }: Props) {
  if (!children) return null;
  return (
    <div className={cn(className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeSlug]}
        components={{
          a: ({ href, children: c, node: _node, ...p }) => {
            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                {...p}
                className={cn("md-link", p.className as string | undefined)}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {c}
              </a>
            );
          },
          ...components,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
