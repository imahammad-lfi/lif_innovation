import "server-only";

import { env } from "@/lib/env";

type Query = Record<string, string | number | boolean | undefined>;

export class StrapiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

/** GET a Strapi REST endpoint, e.g. strapiGet('/api/pages', { 'filters[path][$eq]': '/about' }). */
export async function strapiGet<T>(endpoint: string, query: Query = {}): Promise<T> {
  const url = new URL(`/api${endpoint}`, env.strapiUrl);
  for (const [k, v] of Object.entries(query)) if (v !== undefined) url.searchParams.set(k, String(v));

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(env.strapiReadToken ? { Authorization: `Bearer ${env.strapiReadToken}` } : {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 404) throw new StrapiError(`Not found: ${endpoint}`, 404);
  if (!res.ok) throw new StrapiError(`Strapi ${res.status} for ${url.pathname}${url.search}`, res.status);
  return slimMedia(await res.json()) as T;
}

/** The only media fields the website reads (see `Media` in ./types). */
const MEDIA_KEEP = ["id", "url", "alternativeText", "caption", "width", "height", "mime"] as const;

/**
 * Strapi returns ~20 bookkeeping fields per uploaded file (documentId, hash, provider metadata, timestamps, formats …).
 * Every image handed to a client component (menus, carousels, cards) is serialised into the page's RSC payload, so
 * pages carried ~100 of these objects twice (HTML + payload). Reduce each file object to the fields we use.
 */
function slimMedia(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(slimMedia);
  if (!node || typeof node !== "object") return node;
  const o = node as Record<string, unknown>;
  if (typeof o.url === "string" && "mime" in o && "hash" in o && "provider" in o) {
    const out: Record<string, unknown> = {};
    for (const k of MEDIA_KEEP) if (o[k] !== undefined && o[k] !== null) out[k] = o[k];
    return out;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) out[k] = slimMedia(v);
  return out;
}

/** POST to a Strapi REST endpoint with the server-side lead token. */
export async function strapiPost<T>(endpoint: string, body: unknown, token: string): Promise<T> {
  const res = await fetch(new URL(`/api${endpoint}`, env.strapiUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new StrapiError(`Strapi ${res.status} for POST ${endpoint}: ${await res.text()}`, res.status);
  return (await res.json()) as T;
}
