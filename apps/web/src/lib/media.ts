import type { Media } from "@/lib/content/types";

/**
 * Resolve a CMS media object to a URL the browser (and next/image) can load.
 * - Strapi local uploads ("/uploads/...") are proxied same-origin by app/uploads/[...path]/route.ts
 * - S3/CDN uploads are absolute URLs and used as-is (host must be listed in MEDIA_HOSTS)
 * - Local seed assets ("/seed-assets/...") are served by app/seed-assets/[...path]/route.ts
 */
export function mediaUrl(media?: Pick<Media, "url"> | null): string | undefined {
  if (!media?.url) return undefined;
  return media.url;
}

export function isSvg(media?: Media | null) {
  return Boolean(media && (media.mime === "image/svg+xml" || /\.svg($|\?)/i.test(media.url)));
}

export function isVideo(media?: Media | null) {
  return Boolean(media && ((media.mime ?? "").startsWith("video/") || /\.(mp4|webm|mov)($|\?)/i.test(media.url)));
}

export function altText(media?: Media | null, fallback = "") {
  return media?.alternativeText || fallback;
}
