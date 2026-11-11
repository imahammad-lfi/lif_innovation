import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";
import { seedAssetPath } from "@/lib/content/local";

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

/**
 * Serves seed media (seed/assets) when the site runs with CONTENT_SOURCE=local.
 * In production the CMS serves media from S3/CloudFront and this route returns 404.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  if (env.contentSource !== "local") return new Response("Not found", { status: 404 });
  const { path: parts } = await ctx.params;
  const rel = parts.map((p) => decodeURIComponent(p)).join("/");
  const root = path.resolve(seedAssetPath(""));
  const file = path.resolve(seedAssetPath(rel));
  if (!file.startsWith(root + path.sep)) return new Response("Forbidden", { status: 403 });
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    const body = await readFile(file);
    return new Response(body, {
      headers: {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
