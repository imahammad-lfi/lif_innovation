#!/usr/bin/env python3
"""
Measure the wordmark text height of each product logo, so logo plates can show every wordmark at the same text size.

Why: logo plates fit each logo into the same box. A logo whose icon is tall (VajraX, FinSight) then gets a small wordmark,
and a text-only logo (VectorX, AI Governance) a large one. Balancing by *text height* fixes that. This tool finds, for each
logo, the wordmark's cap/ascender top and its baseline (descenders such as j, g and the Q tail are ignored) and reports
textRatio = text height / logo height, and the x-height (height of the lower-case letters) as xRatio. tools/logo_plates.py and docs/DESIGN-SYSTEM.md use these figures.

How: the wordmark area is the logo minus its icon. Icons to the left of the text are split off at the widest empty column
gap in the left part of the logo; FinSight's arrow (above the text) is split off at the widest empty row gap. Inside the
wordmark area the row ink profile gives the top (first row with ink) and the baseline (last row whose ink is at least 22 %
of the busiest row - descender rows carry far less ink).

usage: python3 tools/logo_metrics.py [--json out.json] [--overlay out.png]
input: seed/assets/custom/logos/<slug>.png
"""
import argparse
import json
import os

import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGOS = os.path.join(ROOT, "seed/assets/custom/logos")
SLUGS = ["linkworks", "testoriumz", "vajrax", "vectorx", "ai-governance", "textiq", "finsight", "edupilot"]
# where the icon sits relative to the wordmark ("left", "above" or None for text-only logos)
ICON = {"linkworks": "left", "testoriumz": "left", "vajrax": "left", "edupilot": "left", "finsight": "above"}


def widest_gap(profile, lo, hi):
    """Widest run of empty entries in profile[lo:hi] -> (start, end) or None."""
    best, x = None, lo
    while x < hi:
        if profile[x] == 0:
            s = x
            while x < hi and profile[x] == 0:
                x += 1
            if best is None or (x - s) > (best[1] - best[0]):
                best = (s, x)
        x += 1
    return best


def measure(slug):
    im = Image.open(os.path.join(LOGOS, f"{slug}.png")).convert("RGBA")
    a = np.array(im)
    ink = a[..., 3] > 96
    h, w = ink.shape
    x0, y0, x1, y1 = 0, 0, w, h
    where = ICON.get(slug)
    if where == "left":
        g = widest_gap(ink.sum(0), int(w * 0.08), int(w * 0.55))
        if g:
            x0 = g[1]
    elif where == "above":
        g = widest_gap(ink.sum(1), int(h * 0.15), int(h * 0.85))
        if g:
            y0 = g[1]
        else:
            # arrow overlaps the text rows: use the lower part where the text sits
            y0 = int(h * 0.42)
    region = ink[y0:y1, x0:x1]
    rows = region.sum(1)
    nz = np.nonzero(rows)[0]
    top = y0 + int(nz[0])
    busy = rows.max()
    body = np.nonzero(rows >= busy * 0.22)[0]
    base = y0 + int(body[-1]) + 1
    text_h = base - top
    # x-height: where the lower-case letters start, the row ink jumps up (above it only capitals and ascenders such as
    # l, d, t carry ink). The top of the x-height band is the biggest rise of the (lightly smoothed) row profile in the
    # upper-middle part of the text.
    k = max(1, round(text_h / 40))
    sm = np.convolve(rows.astype(float), np.ones(2 * k + 1) / (2 * k + 1), mode="same")
    lo, hi = (top - y0) + round(text_h * 0.12), (base - y0) - round(text_h * 0.45)
    rise = sm[lo + k: hi + k] - sm[lo - k: hi - k] if hi > lo else np.array([0.0])
    x_top = y0 + lo + int(np.argmax(rise))
    x_h = base - x_top
    return {
        "slug": slug, "width": w, "height": h, "aspect": round(w / h, 3),
        "wordmark": [x0, y0, x1, y1], "textTop": top, "baseline": base,
        "textHeight": text_h, "textRatio": round(text_h / h, 3),
        "xTop": x_top, "xHeight": x_h, "xRatio": round(x_h / h, 3),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json")
    ap.add_argument("--overlay")
    args = ap.parse_args()
    res = [measure(s) for s in SLUGS]
    for r in res:
        print(f"{r['slug']:14s} {r['width']}x{r['height']} aspect {r['aspect']:5.2f}  text {r['textHeight']:4d}px "
              f"(top {r['textTop']}, baseline {r['baseline']})  textRatio {r['textRatio']:.3f}  x-height {r['xHeight']}px xRatio {r['xRatio']:.3f}")
    if args.json:
        json.dump(res, open(args.json, "w"), indent=2)
    if args.overlay:
        tiles = []
        for r in res:
            im = Image.open(os.path.join(LOGOS, f"{r['slug']}.png")).convert("RGBA")
            sc = 120 / im.height
            im = im.resize((round(im.width * sc), 120), Image.LANCZOS)
            t = Image.new("RGBA", (im.width + 20, 140), (255, 255, 255, 255))
            t.alpha_composite(im, (10, 10))
            d = ImageDraw.Draw(t)
            for y, c in ((r["textTop"], (230, 0, 0, 255)), (r["xTop"], (200, 0, 200, 255)), (r["baseline"], (0, 150, 0, 255))):
                yy = 10 + round(y * sc)
                d.line([(10, yy), (t.width - 10, yy)], fill=c, width=1)
            xx = 10 + round(r["wordmark"][0] * sc)
            d.line([(xx, 6), (xx, 134)], fill=(0, 90, 255, 255), width=1)
            tiles.append(t)
        W = max(t.width for t in tiles)
        S = Image.new("RGB", (W, sum(t.height for t in tiles)), (255, 255, 255))
        y = 0
        for t in tiles:
            S.paste(t.convert("RGB"), (0, y))
            y += t.height
        S.save(args.overlay)


if __name__ == "__main__":
    main()
