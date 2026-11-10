import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getBlogPosts, getPagePaths } from "@/lib/content";

/** Next.js writes <loc> values verbatim, so XML-escape them (e.g. /sap/service&more -> service&amp;more, like the original). */
const xml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** sitemap.xml — every CMS page plus every blog post (same shape as the original site's sitemap). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts] = await Promise.all([getPagePaths(), getBlogPosts()]);
  const entry = (path: string, updatedAt?: string | null): MetadataRoute.Sitemap[number] => ({
    url: xml(`${env.siteUrl}${path === "/" ? "/" : path}`),
    ...(updatedAt ? { lastModified: updatedAt } : {}),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  });
  const seen = new Set<string>();
  const out: MetadataRoute.Sitemap = [];
  for (const p of [...pages].sort((a, b) => (a.path === "/" ? -1 : b.path === "/" ? 1 : a.path.localeCompare(b.path)))) {
    if (seen.has(p.path)) continue;
    seen.add(p.path);
    out.push(entry(p.path, p.updatedAt));
  }
  for (const post of posts) {
    if (!post.slug) continue;
    out.push(entry(`/company/blog/${encodeURIComponent(post.slug)}`, post.updatedAt));
  }
  return out;
}
