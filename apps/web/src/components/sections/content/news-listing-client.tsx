"use client";

import { useMemo, useState } from "react";
import { CmsImage } from "@/components/cms/cms-image";
import { ReadMore } from "@/components/primitives/read-more";
import { SmartLink } from "@/components/primitives/smart-link";
import type { NewsArticle } from "@/lib/content";

type Props = { heading?: string | null; articles: NewsArticle[] };

export function NewsListingClient({ heading, articles }: Props) {
  const [query, setQuery] = useState("");
  const visibleArticles = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return articles;
    return articles.filter((article) => `${article.title} ${article.excerpt ?? ""}`.toLocaleLowerCase().includes(term));
  }, [articles, query]);

  return (
    <section className="mt-[72px] bg-ink px-gutter py-24 3xl:py-28 max-[768px]:mt-16 max-[768px]:py-16">
      {heading ? <h1 className="font-heading text-[34.5px] font-semibold leading-[1.15] text-white 3xl:text-[41.5px] max-[768px]:text-[24px]">{heading}</h1> : null}
      <label className="sr-only" htmlFor="news-search">Search news and articles</label>
      <input id="news-search" className="sr-only" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search news and articles" />
      <div className="mt-12 grid grid-cols-3 gap-6 3xl:gap-8 max-[1025px]:grid-cols-2 max-[600px]:grid-cols-1 max-[768px]:mt-8 max-[768px]:gap-4">
        {visibleArticles.map((article) => (
          <SmartLink key={`${article.order ?? ""}-${article.title}`} href={article.url} newTab className="card-surface group hover-lift block h-full overflow-hidden rounded-2xl">
            <article className="flex h-full flex-col">
              <div className="relative aspect-[16/10] overflow-hidden ring-1 ring-white/10">
                <CmsImage media={article.image} alt={article.label ?? ""} fill sizes="(max-width: 600px) 90vw, (max-width: 1025px) 45vw, 30vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" />
              </div>
              <div className="flex flex-1 flex-col items-start p-6 3xl:p-8 max-[768px]:p-5">
                {article.label ? <p className="mb-3 font-sans text-[12.5px] leading-[1.5] text-white/50 3xl:text-[13.5px] max-[768px]:text-[12px]">{article.label}</p> : null}
                <h3 className="mb-6 flex-1 font-heading text-[16.5px] font-semibold leading-[1.35] text-white transition-colors group-hover:text-brand 3xl:text-[18px] max-[768px]:text-[14.5px]">{article.title}</h3>
                <ReadMore />
              </div>
            </article>
          </SmartLink>
        ))}
      </div>
    </section>
  );
}
