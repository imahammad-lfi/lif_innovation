import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

import { TAGS } from "@/lib/content";
import { env } from "@/lib/env";

type StrapiWebhook = {
  event?: string;
  model?: string;
  uid?: string;
  entry?: { path?: string; slug?: string } | null;
};

function authorized(req: Request) {
  const given = req.headers.get("x-revalidate-secret") ?? new URL(req.url).searchParams.get("secret") ?? "";
  const expected = env.revalidateSecret;
  if (!expected) return process.env.NODE_ENV !== "production"; // open in local development only
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Strapi webhook target (Settings › Webhooks, or auto-registered by the CMS bootstrap).
 * Publishing a page refreshes just that page; global/media changes refresh the whole site.
 * Add `?now=1` to expire immediately instead of stale-while-revalidate.
 */
export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as StrapiWebhook;
  const immediate = new URL(req.url).searchParams.has("now");
  const profile = immediate ? { expire: 0 } : "max";
  const tags = new Set<string>();

  switch (body.model) {
    case "page":
      tags.add(TAGS.pages);
      if (body.entry?.path) tags.add(TAGS.page(body.entry.path));
      else tags.add(TAGS.all);
      break;
    case "global":
      tags.add(TAGS.global);
      break;
    case "blog-post":
      tags.add(TAGS.blog);
      break;
    case "news-article":
      tags.add(TAGS.news);
      break;
    case "event":
      tags.add(TAGS.events);
      break;
    case "lead":
      break; // form submissions don't affect the website
    default:
      tags.add(TAGS.all); // media library changes, unknown models, manual calls
  }

  for (const tag of tags) revalidateTag(tag, profile);
  return Response.json({ ok: true, revalidated: [...tags], immediate });
}
