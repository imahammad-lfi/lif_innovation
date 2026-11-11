import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RenderSections } from "@/components/sections/registry";
import { breadcrumbJsonLd, eventsJsonLd, JsonLd, serviceJsonLd } from "@/components/seo/json-ld";
import { getEvents, getGlobal, getPage, getPagePaths } from "@/lib/content";
import type { Media, Page } from "@/lib/content/types";
import { mediaUrl } from "@/lib/media";

type Params = { slug?: string[] };

function toPath(slug?: string[]) {
  if (!slug?.length) return "/";
  return "/" + slug.map((s) => decodeURIComponent(s)).join("/");
}

/** Every CMS page is prerendered at build time; pages published later render on first request. */
/**
 * All CMS paths are prerendered via generateStaticParams. Paths published later render on their first
 * request (blocking, so a missing page can still return a real 404) and are then cached like ISR.
 */
export const instant = false;

export async function generateStaticParams(): Promise<Params[]> {
  const paths = await getPagePaths();
  const params = paths
    .filter((p) => !p.path.startsWith("/company/blog/"))
    .map((p) => ({ slug: p.path === "/" ? [] : p.path.slice(1).split("/") }));
  return params.length ? params : [{ slug: [] }];
}

/** Social preview image: the page's own OG image, else its hero background image. */
function previewImage(page: Page) {
  const hero = page.sections?.[0] as { backgroundImage?: Media | null } | undefined;
  return mediaUrl(page.seo?.ogImage) ?? mediaUrl(hero?.backgroundImage ?? null);
}
/** Home › … › page, using the titles of ancestor pages that exist. */
async function trailFor(page: Page) {
  const parts = page.path.split("/").filter(Boolean);
  const ancestors = await Promise.all(parts.slice(0, -1).map((_, i) => getPage("/" + parts.slice(0, i + 1).join("/"))));
  return [
    { name: "Home", path: "/" },
    ...ancestors.filter((a): a is Page => !!a).map((a) => ({ name: a.title, path: a.path })),
    { name: page.title, path: page.path },
  ];
}
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const path = toPath(slug);
  const page = await getPage(path);
  if (!page) return { title: "Page not found | Linkfields" };
  const seo = page.seo;
  const og = previewImage(page);
  return {
    title: seo?.metaTitle || page.title,
    description: seo?.metaDescription || undefined,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: seo?.canonicalUrl || path },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
    // Page-level openGraph replaces (does not merge with) the root one, so repeat the site-wide fields.
    openGraph: {
      type: "website",
      siteName: "Linkfields",
      locale: "en_GB",
      title: seo?.metaTitle || page.title,
      description: seo?.metaDescription || undefined,
      url: path,
      images: og ? [{ url: og }] : undefined,
    },
  };
}

export default async function CmsPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [page, global] = await Promise.all([getPage(toPath(slug)), getGlobal()]);
  if (!page) notFound();
  const isService = page.path.startsWith("/services/");
  const areaServed = [...new Set((global?.offices ?? []).map((o) => o.country).filter(Boolean))];
  // An event's own page carries its schema.org Event entry (the /events hub lists all of them), which is the page
  // search engines prefer for event results. Matched through the CMS Event's detail link.
  const event = page.path.startsWith("/events/")
    ? (await getEvents()).find((e) => (e.detailLink?.href ?? "").split(/[?#]/)[0].replace(/\/$/, "") === page.path)
    : undefined;
  return (
    <>
      {page.path !== "/" ? <JsonLd data={breadcrumbJsonLd(await trailFor(page))} /> : null}
      {isService ? <JsonLd data={serviceJsonLd(page, areaServed)} /> : null}
      {event ? <JsonLd data={eventsJsonLd([event])[0]} /> : null}
      <RenderSections page={page} global={global} />
    </>
  );
}
