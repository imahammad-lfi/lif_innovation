import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * Remote hosts that may serve CMS media in production (S3 bucket / Cloudflare media domain).
 * Example: MEDIA_HOSTS="media.linkfields.com,linkfields-media.s3.eu-west-2.amazonaws.com"
 */
const mediaHosts = (process.env.MEDIA_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

/**
 * Permanent redirects from the retired service URLs (pre-Nov-2026 structure) to the 5-service portfolio.
 * Source of truth: apps/web/redirects.json (also used by seed/custom/apply.py to rewrite internal links).
 */
const portfolioRedirects = JSON.parse(readFileSync(path.join(process.cwd(), "redirects.json"), "utf8")) as {
  source: string;
  destination: string;
  permanent: boolean;
}[];

/**
 * Content-Security-Policy (production only — `next dev` needs eval and a websocket for hot reload).
 * Everything is first-party except: Google Maps (office map iframe), Cloudflare Turnstile + Web Analytics (when the
 * site runs behind Cloudflare), YouTube embeds an editor may add to an article, and MEDIA_HOSTS for CMS media.
 * 'unsafe-inline' scripts are required by Next.js's inline hydration data unless every page is rendered per request
 * with a nonce, which would switch off the static/partial prerendering the site relies on.
 * Add an origin here before embedding anything new (e.g. another video host).
 */
const mediaOrigins = mediaHosts.map((h) => `https://${h}`).join(" ");
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${mediaOrigins}`.trim(),
  "font-src 'self' data:",
  `media-src 'self' blob: ${mediaOrigins}`.trim(),
  "connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com",
  "frame-src 'self' https://www.google.com https://maps.google.com https://challenges.cloudflare.com https://www.youtube-nocookie.com https://www.youtube.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }] : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Dev only: let local QA browsers (127.0.0.1) and the sandbox preview domain load HMR / dev chunks.
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.manus.computer"],
  cacheComponents: true,
  // Bots that get blocking (non-streamed) metadata. Next's default list plus Googlebot, so an unknown URL's first
  // request is a real 404 for Google too (streamed responses commit 200 before notFound() is known).
  htmlLimitedBots: /Googlebot|[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i,
  partialPrefetching: true,
  cacheLife: {
    // CMS content: refreshed on publish through the Strapi webhook (/api/revalidate),
    // and re-validated in the background at most every hour as a safety net.
    cms: { stale: 300, revalidate: 3600, expire: 60 * 60 * 24 * 30 },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/seed-assets/**" },
      { pathname: "/images/**" },
      { pathname: "/icons/**" },
    ],
    remotePatterns: mediaHosts.map((hostname) => ({ protocol: "https" as const, hostname, pathname: "/**" })),
  },
  async redirects() {
    return portfolioRedirects;
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        // Loaders run last-to-first: Tailwind compiles, then `inclusive-max-media` turns `max-[Npx]:` into the
        // original site's inclusive `max-width: Npx` media queries (see loaders/inclusive-max-media.cjs).
        loaders: [path.join(process.cwd(), "loaders/inclusive-max-media.cjs"), "@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
