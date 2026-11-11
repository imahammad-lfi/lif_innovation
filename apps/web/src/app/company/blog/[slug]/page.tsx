/* eslint-disable @next/next/no-img-element -- Markdown image URLs are CMS-authored original S3 assets. */
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CmsImage } from "@/components/cms/cms-image";
import { Markdown } from "@/components/cms/markdown";
import { blogPostingJsonLd, breadcrumbJsonLd, JsonLd } from "@/components/seo/json-ld";
import { getBlogPost, getBlogPosts, getGlobal } from "@/lib/content";
import type { Media } from "@/lib/content/types";
import { mediaUrl } from "@/lib/media";

type Params = { slug: string };

type PostTemplate = {
  sharePrompt?: string | null;
  subscriptionEyebrow?: string | null;
  subscriptionHeading?: string | null;
  subscriptionPlaceholder?: string | null;
  subscriptionBackground?: Media | null;
  relatedEyebrow?: string | null;
  relatedMessage?: string | null;
};

function decodeSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function displayDate(date?: string | null) {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(parsed);
}

function contentsOf(markdown?: string | null) {
  const headings = (markdown ?? "").match(/^#{1,6}\s+.+$/gm) ?? [];
  return ["Introduction", ...headings.map((heading) => heading.replace(/^#{1,6}\s+/, ""))];
}

const articleMarkdown = {
  p: ({ children, ...props }: React.ComponentProps<"p">) => <p {...props} className="mb-6 font-sans font-normal text-white/65">{children}</p>,
  h1: ({ children, ...props }: React.ComponentProps<"h1">) => <h2 {...props} className="mb-5 mt-12 font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:mt-10 max-[768px]:text-[21.5px]">{children}</h2>,
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => <h2 {...props} className="mb-5 mt-12 font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:mt-10 max-[768px]:text-[21.5px]">{children}</h2>,
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => <h3 {...props} className="mb-4 mt-8 font-heading text-[16.5px] font-semibold leading-[1.35] text-white 3xl:text-[18px] max-[768px]:text-[14.5px]">{children}</h3>,
  blockquote: ({ children, ...props }: React.ComponentProps<"blockquote">) => <blockquote {...props} className="card-surface my-8 rounded-2xl border-l-2 border-l-brand p-6 text-white 3xl:p-8 max-[768px]:p-5 [&>p:last-child]:mb-0">{children}</blockquote>,
  ul: ({ children, ...props }: React.ComponentProps<"ul">) => <ul {...props} className="mb-6 list-disc space-y-3 pl-5 text-white/65 marker:text-brand">{children}</ul>,
  ol: ({ children, ...props }: React.ComponentProps<"ol">) => <ol {...props} className="mb-6 list-decimal space-y-3 pl-5 text-white/65 marker:text-brand">{children}</ol>,
  li: ({ children, ...props }: React.ComponentProps<"li">) => <li {...props} className="pl-2 [&>p]:mb-2">{children}</li>,
  img: ({ alt, ...props }: React.ComponentProps<"img">) => <img {...props} alt={alt ?? "blogimage"} className="my-8 h-auto w-full rounded-2xl object-contain ring-1 ring-white/10" />,
  a: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props} className="text-brand underline decoration-brand/40 underline-offset-4 transition-colors hover:text-[#ffb36b]">{children}</a>,
};

/** CMS paths are prerendered; newly published posts render on their first request. */
export const instant = false;

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await getBlogPosts();
  // Cache Components needs at least one param even when the CMS is unreachable during a build.
  return posts.length ? posts.map((post) => ({ slug: post.slug })) : [{ slug: "__no-posts__" }];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(decodeSlug(slug));
  if (!post) return { title: "Page not found | Linkfields" };
  const seo = post.seo;
  const path = `/company/blog/${encodeURIComponent(post.slug)}`;
  const og = mediaUrl(seo?.ogImage ?? post.cover);
  return {
    title: seo?.metaTitle || post.title,
    description: seo?.metaDescription || post.excerpt || undefined,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: seo?.canonicalUrl || path },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      siteName: "Linkfields",
      locale: "en_GB",
      title: seo?.metaTitle || post.title,
      description: seo?.metaDescription || post.excerpt || undefined,
      url: path,
      images: og ? [{ url: og }] : undefined,
      publishedTime: post.publishedDate || undefined,
      modifiedTime: post.updatedAt || undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [post, global] = await Promise.all([getBlogPost(decodeSlug(slug)), getGlobal()]);
  if (!post) notFound();
  const template = post as typeof post & PostTemplate;
  const toc = contentsOf(post.content);
  const linkedIn = global?.footerSocials?.find((item) => item.platform === "linkedin");
  const twitter = global?.footerSocials?.find((item) => item.platform === "twitter");

  const postPath = `/company/blog/${encodeURIComponent(post.slug)}`;
  return (
    <>
    <JsonLd
      data={[
        blogPostingJsonLd(post, postPath),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Insights", path: "/company/blog" },
          { name: post.title, path: postPath },
        ]),
      ]}
    />
    <article className="mt-[72px] px-gutter py-24 3xl:py-28 max-[768px]:mt-16 max-[768px]:py-16">
      <div className="mx-auto max-w-[1024px] min-[1280px]:grid min-[1280px]:grid-cols-[minmax(0,720px)_240px] min-[1280px]:gap-16">
        <div className="mx-auto w-full min-w-0 max-w-[720px]">
          {post.tag ? <span className="inline-block rounded-full bg-brand/10 px-3 py-1.5 font-sans text-[12.5px] font-medium leading-[1.5] text-brand ring-1 ring-brand/20 max-[768px]:text-[12px]">{post.tag}</span> : null}
          <h1 className="mt-5 font-heading text-[34.5px] font-semibold leading-[1.15] text-white 3xl:text-[41.5px] max-[768px]:text-[24px]">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-y-3 text-[12.5px] leading-[1.5] text-white/50 3xl:text-[13.5px] max-[768px]:text-[12px]">
            {post.authorAvatar ? <CmsImage media={post.authorAvatar} alt="" width={32} height={32} className="size-8 rounded-full bg-white/10 object-cover ring-1 ring-white/10" /> : <span className="size-8 rounded-full bg-white/10 ring-1 ring-white/10" />}
            {post.authorName ? <p className="ml-3 font-medium">{post.authorName}</p> : null}
            {post.publishedDate ? <p className="ml-6">{displayDate(post.publishedDate)}</p> : null}
          </div>
          {post.cover ? <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-white/10"><CmsImage media={post.cover} alt={post.cover.alternativeText || post.title} width={800} height={462} className="aspect-[16/10] w-full object-cover" /></div> : null}
          {post.excerpt ? <p className="mt-8 border-l-2 border-brand/60 pl-5 font-sans text-[15.5px] font-normal leading-[1.75] text-white/75 max-[768px]:text-[14.5px]">{post.excerpt}</p> : null}
          <Markdown className="mt-8 font-sans text-[15.5px] leading-[1.75] text-white/65 [overflow-wrap:anywhere] max-[768px]:text-[14.5px]" components={articleMarkdown}>{post.content}</Markdown>
          <div className="mt-12 flex items-center justify-between gap-6 border-t border-white/[0.07] py-8 max-[768px]:flex-col">
            {template.sharePrompt ? <h2 className="font-heading text-[16.5px] font-semibold leading-[1.35] text-white max-[768px]:text-[14.5px]">{template.sharePrompt}</h2> : null}
            <div className="flex shrink-0 items-center justify-center gap-5 text-white">
              <Image src="/images/link-45deg.png" alt="Copy link" width={32} height={32} className="hover-grow size-8 cursor-pointer" />
              <a aria-label="Share on LinkedIn" className="hover-grow" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.linkfields.com/company/blog/${post.slug}`)}`} target="_blank" rel="noopener noreferrer"><CmsImage media={linkedIn?.icon} alt="LinkedIn" width={32} height={32} className="size-8" /></a>
              <a aria-label="Share on X" className="hover-grow" href={`https://x.com/intent/post?url=${encodeURIComponent(`https://www.linkfields.com/company/blog/${post.slug}`)}`} target="_blank" rel="noopener noreferrer"><CmsImage media={twitter?.icon} alt="X" width={32} height={32} className="size-8" /></a>
            </div>
          </div>
        </div>
        <aside className="sticky top-32 self-start pt-2 max-[1279px]:hidden">
          <h3 className="mb-4 font-heading text-[12.5px] font-semibold leading-[1.5] text-white">Table of contents</h3>
          <ul className="card-surface flex flex-col gap-4 rounded-2xl p-5 font-sans text-[12.5px] leading-[1.6] text-white/65">
            {toc.map((item, index) => <li key={`${item}-${index}`} className="border-l border-white/10 pl-3 first:border-brand first:text-white">{item}</li>)}
          </ul>
        </aside>
      </div>
      {template.subscriptionHeading ? (
        <section className="card-surface relative mx-auto mt-16 max-w-[1024px] overflow-hidden rounded-2xl px-8 py-24 text-center max-[768px]:px-5 max-[768px]:py-16">
          {template.subscriptionBackground ? <CmsImage media={template.subscriptionBackground} alt="" fill sizes="(max-width: 639px) 90vw, 100vw" className="object-cover opacity-65" /> : null}
          <div className="relative z-[1] mx-auto flex max-w-[500px] flex-col items-center">
            {template.subscriptionEyebrow ? <div className="mb-4 flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5"><span aria-hidden className="size-1.5 rounded-full bg-brand" /><span className="font-sans text-[11px] font-semibold uppercase leading-[1.5] tracking-[0.12em] text-brand 3xl:text-[12.5px]">{template.subscriptionEyebrow}</span></div> : null}
            <h2 className="font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:text-[21.5px]">{template.subscriptionHeading}</h2>
            <div className="mt-8 flex w-full items-center border-b border-white/25 py-3">
              <input aria-label={template.subscriptionPlaceholder ?? "Email address"} placeholder={template.subscriptionPlaceholder ?? ""} type="email" className="min-w-0 flex-1 bg-transparent font-sans text-[14px] font-normal max-sm:text-[16px] text-white outline-none placeholder:text-white/50 focus:placeholder:text-white/70 max-[768px]:text-[13.5px]" />
              <Image src="/images/ui/subscribe-arrow.png" alt="Submit email" width={14} height={14} className="hover-grow ml-3 size-4 cursor-pointer" />
            </div>
          </div>
        </section>
      ) : null}
      {template.relatedEyebrow || template.relatedMessage ? (
        <section className="mx-auto mt-24 max-w-[1024px] text-center max-[768px]:mt-16">
          {template.relatedEyebrow ? <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5"><span aria-hidden className="size-1.5 rounded-full bg-brand" /><span className="font-sans text-[11px] font-semibold uppercase leading-[1.5] tracking-[0.12em] text-brand 3xl:text-[12.5px]">{template.relatedEyebrow}</span></div> : null}
          {template.relatedMessage ? <h2 className="font-heading text-[16.5px] font-semibold leading-[1.35] text-white max-[768px]:text-[14.5px]">{template.relatedMessage}</h2> : null}
        </section>
      ) : null}
    </article>
    </>
  );
}
