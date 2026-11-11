"use client";

import { useMemo, useState } from "react";
import { CmsImage } from "@/components/cms/cms-image";
import { ReadMore } from "@/components/primitives/read-more";
import { SmartLink } from "@/components/primitives/smart-link";
import type { BlogPost } from "@/lib/content";

export type FilterGroup = {
  label?: string | null;
  options?: { label?: string | null; value?: string | null }[] | null;
};

type Props = {
  heading?: string | null;
  discoverHeading?: string | null;
  categoryGroups: FilterGroup[];
  posts: BlogPost[];
};

function postHref(post: BlogPost) {
  return `/company/blog/${post.slug}`;
}

function FeatureCard({ post }: { post: BlogPost }) {
  return (
    <SmartLink href={postHref(post)} className="card-surface group hover-lift block overflow-hidden rounded-2xl">
      <article className="grid grid-cols-2 max-[700px]:grid-cols-1">
        <div className="relative min-h-[320px] overflow-hidden ring-1 ring-white/10 3xl:min-h-[380px] max-[700px]:min-h-0 max-[700px]:aspect-[16/10]">
          <CmsImage media={post.cover} alt={post.label ?? ""} fill sizes="(max-width: 700px) 90vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" />
        </div>
        <div className="flex flex-col items-start justify-center p-10 3xl:p-12 max-[1025px]:p-8 max-[768px]:p-5">
          {post.label ? <span className="mb-5 rounded-full bg-brand/10 px-3 py-1 font-sans text-[12.5px] font-medium leading-[1.5] text-brand ring-1 ring-brand/20 3xl:text-[13.5px] max-[768px]:text-[12px]">{post.label}</span> : null}
          <h3 className="max-w-[40ch] font-heading text-[16.5px] font-semibold leading-[1.35] text-white transition-colors group-hover:text-brand 3xl:text-[18px] max-[768px]:text-[14.5px]">{post.title}</h3>
          <ReadMore className="mt-6" />
        </div>
      </article>
    </SmartLink>
  );
}

function DiscoverCard({ post }: { post: BlogPost }) {
  return (
    <SmartLink href={postHref(post)} className="card-surface group hover-lift block h-full overflow-hidden rounded-2xl">
      <article className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden ring-1 ring-white/10">
          <CmsImage media={post.cover} alt={post.label ?? ""} fill sizes="(max-width: 600px) 90vw, (max-width: 980px) 45vw, 30vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6 3xl:p-8 max-[768px]:p-5">
          <p className="font-sans text-[12.5px] leading-[1.5] text-white/50 3xl:text-[13.5px] max-[768px]:text-[12px]">{post.label}</p>
          <h3 className="font-heading text-[16.5px] font-semibold leading-[1.35] text-white transition-colors group-hover:text-brand 3xl:text-[18px] max-[768px]:text-[14.5px]">{post.title}</h3>
        </div>
      </article>
    </SmartLink>
  );
}

export function BlogListingClient({ heading, discoverHeading, categoryGroups, posts }: Props) {
  const [activeCategory, setActiveCategory] = useState(categoryGroups[0]?.label ?? "");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [query, setQuery] = useState("");
  const activeGroup = categoryGroups.find((group) => group.label === activeCategory) ?? categoryGroups[0];

  const visiblePosts = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return posts.filter((post) => {
      const keywordMatch = !activeKeyword || (post.categoryGroup === activeCategory && post.keyword === activeKeyword);
      const text = `${post.title} ${post.excerpt ?? ""} ${post.keyword ?? ""}`.toLocaleLowerCase();
      return keywordMatch && (!term || text.includes(term));
    });
  }, [activeCategory, activeKeyword, posts, query]);

  const featured = activeKeyword || query ? visiblePosts[0] : posts.find((post) => post.featured) ?? posts[0];

  return (
    <>
      <div className="mb-12 max-[768px]:mb-8">
        {heading ? <h1 className="font-heading text-[34.5px] font-semibold leading-[1.15] text-white 3xl:text-[41.5px] max-[768px]:text-[24px]">{heading}</h1> : null}
        <div className="mt-8 flex flex-wrap gap-3 border-b border-white/[0.07] pb-5 font-heading text-[13.5px] font-semibold leading-[1.5]">
          {categoryGroups.map((group) => {
            const active = group.label === activeCategory;
            return (
              <button key={group.label} type="button" aria-pressed={active} className={`hover-grow cursor-pointer rounded-full px-5 py-2.5 text-left transition-colors ${active ? "bg-brand-gradient text-white shadow-[0_8px_22px_-10px_rgba(255,120,0,0.9)]" : "bg-white/[0.04] text-white/70 ring-1 ring-white/10"}`} onClick={() => { setActiveCategory(group.label ?? ""); setActiveKeyword(""); }}>
                {group.label}
              </button>
            );
          })}
        </div>
        <label className="sr-only" htmlFor="blog-search">Search blogs</label>
        <input id="blog-search" className="sr-only" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blogs" />
        <div className="mt-5 flex flex-wrap gap-2.5">
          {(activeGroup?.options ?? []).map((option) => {
            const value = option.value ?? option.label ?? "";
            const active = value === activeKeyword;
            return (
              <button key={value} type="button" aria-pressed={active} className={`hover-grow rounded-full px-4 py-2 font-sans text-[12.5px] font-medium leading-[1.5] transition-colors 3xl:text-[13.5px] max-[768px]:text-[12px] ${active ? "bg-brand-gradient text-white shadow-[0_8px_22px_-10px_rgba(255,120,0,0.9)]" : "bg-white/[0.04] text-white/70 ring-1 ring-white/10 hover:bg-white/[0.08]"}`} onClick={() => setActiveKeyword((current) => (current === value ? "" : value))}>
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      {featured ? <FeatureCard post={featured} /> : null}
      <div className="mt-24 max-[768px]:mt-16">
        {discoverHeading ? <h2 className="mb-12 font-heading text-[27.5px] font-semibold leading-[1.2] text-white 3xl:text-[34.5px] max-[768px]:mb-8 max-[768px]:text-[21.5px]">{discoverHeading}</h2> : null}
        <div className="grid grid-cols-3 gap-6 3xl:gap-8 max-[980px]:grid-cols-2 max-[600px]:grid-cols-1 max-[768px]:gap-4">
          {visiblePosts.map((post) => <DiscoverCard key={post.slug} post={post} />)}
        </div>
      </div>
    </>
  );
}
