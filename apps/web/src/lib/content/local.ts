import "server-only";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";

/**
 * Local content source (CONTENT_SOURCE=local): reads the Strapi seed JSON produced by
 * seed/transform/build.py so the website can be developed and previewed without a running CMS.
 * Media placeholders ({ "__media": "s3/x.png", width, height, mime, alt }) are turned into
 * Strapi-like media objects served by the /seed-assets route.
 */
const dataDir = () => path.join(env.localContentDir, "data");

type Json = unknown;

function encodePath(p: string) {
  return p.split("/").map(encodeURIComponent).join("/");
}

export function hydrateMedia(value: Json): Json {
  if (Array.isArray(value)) return value.map(hydrateMedia);
  if (value && typeof value === "object") {
    const obj = value as Record<string, Json>;
    if (typeof obj.__media === "string") {
      return {
        url: `/seed-assets/${encodePath(obj.__media)}`,
        width: obj.width ?? null,
        height: obj.height ?? null,
        mime: obj.mime ?? null,
        alternativeText: obj.alt ?? "",
      };
    }
    const out: Record<string, Json> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = hydrateMedia(v);
    return out;
  }
  return value;
}

export async function readLocalJson<T>(file: string): Promise<T | null> {
  try {
    const raw = await readFile(path.join(dataDir(), file), "utf8");
    return hydrateMedia(JSON.parse(raw)) as T;
  } catch {
    return null;
  }
}

export function pageFileName(pagePath: string) {
  return pagePath === "/" ? "index" : pagePath.replace(/^\/+|\/+$/g, "").replace(/\//g, "__");
}

export async function listLocalPages(): Promise<string[]> {
  try {
    return (await readdir(path.join(dataDir(), "pages"))).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
}

export function seedAssetPath(rel: string) {
  return path.join(env.localContentDir, "assets", rel);
}
