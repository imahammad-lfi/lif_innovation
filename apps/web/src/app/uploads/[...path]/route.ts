import { env } from "@/lib/env";

/**
 * Same-origin proxy for Strapi's local upload folder (/uploads/*). Used when Strapi stores media on
 * disk (development / single-server installs). With the S3 upload provider media URLs are absolute
 * (S3 or CloudFront/Cloudflare) and never hit this route.
 */
export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const upstream = new URL(`/uploads/${path.map(encodeURIComponent).join("/")}`, env.strapiUrl);
  const res = await fetch(upstream, { headers: { Accept: req.headers.get("accept") ?? "*/*" } });
  if (!res.ok || !res.body) return new Response("Not found", { status: res.status === 200 ? 404 : res.status });
  const headers = new Headers();
  for (const h of ["content-type", "content-length", "etag", "last-modified"]) {
    const v = res.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(res.body, { status: 200, headers });
}
