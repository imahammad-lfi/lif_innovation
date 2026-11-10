import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { env } from "@/lib/env";

import { listLocalPages, pageFileName, readLocalJson } from "./local";
import { strapiGet } from "./strapi";
import type { BlogPost, EventItem, Global, NewsArticle, Page } from "./types";

export type * from "./types";

/**
 * Cache tags (invalidated by /api/revalidate when Strapi publishes):
 *   cms                – everything
 *   cms:global         – header/footer/global
 *   cms:pages          – page index (sitemap, static params)
 *   cms:page:<path>    – a single page
 *   cms:blog / cms:news / cms:events
 */
export const TAGS = {
  all: "cms",
  global: "cms:global",
  pages: "cms:pages",
  page: (p: string) => `cms:page:${p}`,
  blog: "cms:blog",
  news: "cms:news",
  events: "cms:events",
};

type Collection<T> = { data: T[]; meta?: { pagination?: { total: number } } };
type Single<T> = { data: T | null };

function normalizePath(p: string) {
  const clean = "/" + p.replace(/^\/+|\/+$/g, "");
  return clean === "/" ? "/" : clean;
}

function onError(scope: string, error: unknown) {
  // Never cache a failure for long: retry within a minute once the CMS is reachable again.
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  console.error(`[content] ${scope} failed:`, (error as Error)?.message ?? error);
  return null;
}

export async function getGlobal(): Promise<Global | null> {
  "use cache";
  cacheTag(TAGS.all, TAGS.global);
  cacheLife("cms");
  if (env.contentSource === "local") return readLocalJson<Global>("global.json");
  try {
    const res = await strapiGet<Single<Global>>("/global");
    return res.data;
  } catch (error) {
    return onError("getGlobal", error);
  }
}

export async function getPage(pagePath: string): Promise<Page | null> {
  "use cache";
  const p = normalizePath(pagePath);
  cacheTag(TAGS.all, TAGS.page(p));
  cacheLife("cms");
  if (env.contentSource === "local") return readLocalJson<Page>(`pages/${pageFileName(p)}.json`);
  try {
    const res = await strapiGet<Collection<Page>>("/pages", {
      "filters[path][$eq]": p,
      "pagination[pageSize]": 1,
    });
    return res.data[0] ?? null;
  } catch (error) {
    return onError(`getPage(${p})`, error);
  }
}

/** All page paths (for generateStaticParams and the sitemap). */
export async function getPagePaths(): Promise<{ path: string; updatedAt?: string }[]> {
  "use cache";
  cacheTag(TAGS.all, TAGS.pages);
  cacheLife("cms");
  if (env.contentSource === "local") {
    const files = await listLocalPages();
    const pages = await Promise.all(files.map((f) => readLocalJson<Page>(`pages/${f}`)));
    return pages.filter((x): x is Page => Boolean(x)).map((x) => ({ path: x.path }));
  }
  try {
    const out: { path: string; updatedAt?: string }[] = [];
    for (let page = 1; page < 50; page++) {
      const res = await strapiGet<Collection<Page>>("/pages", {
        "fields[0]": "path",
        "fields[1]": "updatedAt",
        "pagination[page]": page,
        "pagination[pageSize]": 100,
      });
      out.push(...res.data.map((x) => ({ path: x.path, updatedAt: x.updatedAt })));
      if (res.data.length < 100) break;
    }
    return out;
  } catch (error) {
    onError("getPagePaths", error);
    return [];
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  "use cache";
  cacheTag(TAGS.all, TAGS.blog);
  cacheLife("cms");
  if (env.contentSource === "local") return (await readLocalJson<BlogPost[]>("blog-posts.json")) ?? [];
  try {
    const res = await strapiGet<Collection<BlogPost>>("/blog-posts", {
      "sort[0]": "order:asc",
      "sort[1]": "publishedDate:desc",
      "pagination[pageSize]": 100,
    });
    return res.data;
  } catch (error) {
    onError("getBlogPosts", error);
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  "use cache";
  cacheTag(TAGS.all, TAGS.blog);
  cacheLife("cms");
  if (env.contentSource === "local") {
    const all = (await readLocalJson<BlogPost[]>("blog-posts.json")) ?? [];
    return all.find((p) => p.slug === slug) ?? null;
  }
  try {
    const res = await strapiGet<Collection<BlogPost>>("/blog-posts", {
      "filters[slug][$eq]": slug,
      "pagination[pageSize]": 1,
    });
    return res.data[0] ?? null;
  } catch (error) {
    return onError(`getBlogPost(${slug})`, error);
  }
}

export async function getNewsArticles(): Promise<NewsArticle[]> {
  "use cache";
  cacheTag(TAGS.all, TAGS.news);
  cacheLife("cms");
  if (env.contentSource === "local") return (await readLocalJson<NewsArticle[]>("news-articles.json")) ?? [];
  try {
    const res = await strapiGet<Collection<NewsArticle>>("/news-articles", {
      "sort[0]": "order:asc",
      "pagination[pageSize]": 100,
    });
    return res.data;
  } catch (error) {
    onError("getNewsArticles", error);
    return [];
  }
}

/** Published events, soonest first. Upcoming/past split and pop-up windows are evaluated at view time (lib/events.ts). */
export async function getEvents(): Promise<EventItem[]> {
  "use cache";
  cacheTag(TAGS.all, TAGS.events);
  cacheLife("cms");
  const sort = (list: EventItem[]) => [...list].sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (env.contentSource === "local") return sort((await readLocalJson<EventItem[]>("events.json")) ?? []);
  try {
    const res = await strapiGet<Collection<EventItem>>("/events", {
      "sort[0]": "startDate:asc",
      "pagination[pageSize]": 100,
    });
    return sort(res.data);
  } catch (error) {
    onError("getEvents", error);
    return [];
  }
}

/**
 * Time the cached render was produced. Server components use it as the hydration-safe "now";
 * client components (lib/use-now.ts) then switch to the visitor's clock, so date-driven UI never goes stale.
 */
export async function contentClock(): Promise<number> {
  "use cache";
  cacheTag(TAGS.all, TAGS.events);
  cacheLife("cms");
  return Date.now();
}
