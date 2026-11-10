import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/** robots.txt — same rules as the original site. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/404" }],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
