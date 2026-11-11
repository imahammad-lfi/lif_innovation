"""Copy the crawled media library into seed/assets, downsizing oversized raster images.

Output layout (relative to seed/assets):
  s3/<file>          <- https://images-linkfields-poc.s3.eu-west-2.amazonaws.com/<file>
  site/<path>        <- https://www.linkfields.com/<path>  (public folder of the original site)
  ext/<host>/<path>  <- any other host (e.g. goodfirms badge)

Writes seed/assets/manifest.json: { original_url: { path, width, height, mime, bytes } }
"""
import json
import mimetypes
import os
import shutil
import sys
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import unquote, urlparse

from PIL import Image

CRAWL = "/home/ubuntu/lf-crawl"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "seed", "assets")
MAX_W = 2560
S3_HOST = "images-linkfields-poc.s3.eu-west-2.amazonaws.com"

Image.MAX_IMAGE_PIXELS = None


def rel_for(url: str) -> str:
    u = urlparse(url)
    path = unquote(u.path).lstrip("/")
    if u.netloc == S3_HOST:
        return f"s3/{path}"
    if u.netloc in ("www.linkfields.com", "linkfields.com", ""):
        return f"site/{path}"
    return f"ext/{u.netloc}/{path}"


def process(item):
    url, info = item
    if info.get("status") != "ok" or not os.path.exists(info["local"]):
        return url, None
    src = info["local"]
    rel = rel_for(url)
    dst = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    mime = mimetypes.guess_type(dst)[0] or "application/octet-stream"
    width = height = None
    try:
        if mime.startswith("image/") and not mime.endswith("svg+xml") and not mime.endswith("x-icon"):
            with Image.open(src) as im:
                width, height = im.size
                fmt = im.format
                if width > MAX_W and fmt in ("PNG", "JPEG", "WEBP"):
                    ratio = MAX_W / width
                    im2 = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB").resize(
                        (MAX_W, round(height * ratio)), Image.LANCZOS
                    )
                    if fmt == "JPEG":
                        im2.convert("RGB").save(dst, "JPEG", quality=86, optimize=True, progressive=True)
                    elif fmt == "WEBP":
                        im2.save(dst, "WEBP", quality=86)
                    else:
                        im2.save(dst, "PNG", optimize=True)
                    width, height = im2.size
                else:
                    shutil.copy2(src, dst)
        else:
            shutil.copy2(src, dst)
    except Exception as exc:  # corrupt or unsupported -> copy as-is
        print("warn", url, exc, file=sys.stderr)
        shutil.copy2(src, dst)
    return url, {"path": rel, "width": width, "height": height, "mime": mime, "bytes": os.path.getsize(dst)}


def main():
    manifest = json.load(open(os.path.join(CRAWL, "asset_manifest.json")))
    os.makedirs(OUT, exist_ok=True)
    out = {}
    with ThreadPoolExecutor(8) as pool:
        for url, meta in pool.map(process, manifest.items()):
            if meta:
                out[url] = meta
    json.dump(out, open(os.path.join(OUT, "manifest.json"), "w"), indent=1, ensure_ascii=False)
    total = sum(m["bytes"] for m in out.values())
    print(f"{len(out)} assets, {total / 1e6:.1f} MB -> {OUT}")


if __name__ == "__main__":
    main()
