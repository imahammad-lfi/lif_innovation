import { getGlobal } from "@/lib/content";
import type { BlogPost, EventItem, Media, Page } from "@/lib/content/types";
import { env } from "@/lib/env";
import { mediaUrl } from "@/lib/media";

/** Serialises schema.org data safely into a <script type="application/ld+json"> tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const abs = (u?: string | null) => (!u ? undefined : /^https?:/.test(u) ? u : `${env.siteUrl}${u.startsWith("/") ? "" : "/"}${u}`);
const absMedia = (m?: Media | null) => abs(mediaUrl(m));

/** Site-wide Organization + WebSite data (brand, logo, positioning, offices, expertise and social profiles) from Global. */
export async function OrganizationJsonLd() {
  const g = await getGlobal();
  if (!g) return null;
  const sameAs = (g.footerSocials ?? []).map((s) => s.href).filter((h): h is string => !!h && /^https?:/.test(h));
  const postal = (o: { address: string; country: string }) => ({
    "@type": "PostalAddress",
    streetAddress: o.address.split("\n").map((l) => l.trim()).filter(Boolean).join(", "),
    addressCountry: o.country,
  });
  const offices = (g.offices ?? []).filter((o) => o.address && o.country);
  const hq = offices.find((o) => o.isHeadquarters) ?? offices[0];
  const services = (g.footerColumns ?? []).find((c) => c.title === "Services")?.links ?? [];
  const knowsAbout = services.map((l) => l.label).filter((l) => l && !/^all /i.test(l));
  const orgId = `${env.siteUrl}/#organization`;
  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": orgId,
          name: g.siteName || "Linkfields",
          alternateName: "Linkfields Innovations",
          url: env.siteUrl,
          logo: absMedia(g.logo),
          description: g.footerTagline || undefined,
          email: g.contactEmail || undefined,
          address: hq ? postal(hq) : undefined,
          location: offices.length
            ? offices.map((o) => ({ "@type": "Place", name: `Linkfields ${o.country}${o.role ? ` (${o.role})` : ""}`, address: postal(o) }))
            : undefined,
          knowsAbout: knowsAbout.length ? knowsAbout : undefined,
          sameAs: sameAs.length ? sameAs : undefined,
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${env.siteUrl}/#website`,
          name: g.siteName || "Linkfields",
          url: env.siteUrl,
          inLanguage: "en-GB",
          publisher: { "@id": orgId },
        },
      ]}
    />
  );
}
/** Plain-text label for breadcrumbs: page title without highlight asterisks or the "| Linkfields" suffix. */
const crumbLabel = (t: string) => t.replace(/\*/g, "").replace(/\s*\|\s*Linkfields\s*$/i, "").trim();
/** BreadcrumbList for a path, e.g. Home › Services › Data & AI › Machine Learning. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: crumbLabel(c.name), item: abs(c.path) })),
  };
}
/** Service entry for service pages (provider = the site Organization). */
export function serviceJsonLd(page: Page, areaServed: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: crumbLabel(page.title),
    description: page.seo?.metaDescription || undefined,
    url: abs(page.path),
    provider: { "@id": `${env.siteUrl}/#organization` },
    areaServed: areaServed.length ? areaServed.map((c) => ({ "@type": "Country", name: c })) : undefined,
  };
}
/** BlogPosting entry for insight articles. */
export function blogPostingJsonLd(post: BlogPost, path: string) {
  const img = absMedia(post.seo?.ogImage ?? post.cover);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo?.metaDescription || post.excerpt || undefined,
    image: img ? [img] : undefined,
    datePublished: post.publishedDate || undefined,
    dateModified: post.updatedAt || post.publishedDate || undefined,
    author: post.authorName ? { "@type": "Person", name: post.authorName } : { "@id": `${env.siteUrl}/#organization` },
    publisher: { "@id": `${env.siteUrl}/#organization` },
    mainEntityOfPage: abs(path),
    inLanguage: "en-GB",
  };
}
const MODE: Record<string, string> = {
  "in-person": "https://schema.org/OfflineEventAttendanceMode",
  online: "https://schema.org/OnlineEventAttendanceMode",
  hybrid: "https://schema.org/MixedEventAttendanceMode",
};

/** schema.org Event entries for the Events page (eligible for search engine event listings). */
export function eventsJsonLd(events: EventItem[]) {
  return events.map((e) => {
    const page = abs(e.detailLink?.href) ?? `${env.siteUrl}/events`;
    const online = e.format === "online";
    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: e.title,
      startDate: e.startDate,
      endDate: e.endDate || e.startDate,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: MODE[e.format ?? "in-person"] ?? MODE["in-person"],
      location: online
        ? { "@type": "VirtualLocation", url: e.organiserUrl || page }
        : {
            "@type": "Place",
            name: e.venue || e.city || undefined,
            address: { "@type": "PostalAddress", addressLocality: e.city || undefined, addressCountry: e.country || undefined },
          },
      image: absMedia(e.image) ? [absMedia(e.image)] : undefined,
      description: e.summary || undefined,
      url: page,
    };
  });
}
