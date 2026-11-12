import "server-only";

import path from "node:path";

/** Server-side configuration. Nothing here is exposed to the browser. */
export const env = {
  /** "strapi" (default) reads the CMS; "local" reads the seed JSON in /seed/data (development without a CMS). */
  contentSource: (process.env.CONTENT_SOURCE || "strapi") as "strapi" | "local",
  /** Internal URL the website server uses to reach Strapi, e.g. http://cms:1337 */
  strapiUrl: (process.env.STRAPI_URL ?? "http://127.0.0.1:1337").replace(/\/$/, ""),
  /** Optional read token (only needed if the public role is locked down). */
  strapiReadToken: process.env.STRAPI_READ_TOKEN ?? "",
  /** Token with `lead.create` permission, used by the contact form. */
  strapiLeadToken: process.env.STRAPI_LEAD_TOKEN ?? "",
  /** Shared secret Strapi sends in the `x-revalidate-secret` header of its webhook. */
  revalidateSecret: process.env.REVALIDATE_SECRET ?? "",
  /** Optional Cloudflare Turnstile secret – when set, the contact form requires a valid token. */
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY ?? "",
  /** Folder with seed JSON + assets for CONTENT_SOURCE=local. */
  localContentDir: process.env.LOCAL_CONTENT_DIR ?? path.join(process.cwd(), "..", "..", "seed"),
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.linkfields.com").replace(/\/$/, ""),
};
