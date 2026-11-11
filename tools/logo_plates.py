#!/usr/bin/env python3
"""
Build the balanced "plate" versions of the product logos used on white logo plates (menus, product cards, logo tiles).

Why: a plate fits its logo into a fixed box, so a logo whose icon is tall (VajraX, FinSight) got a small wordmark and a
text-only logo (VectorX, AI Governance) a large one. A plate file puts each logo on the SAME canvas shape (PLATE_ASPECT : 1)
and scales it so its lower-case letters (x-height, measured by tools/logo_metrics.py) are the SAME share of the canvas
height (X_SHARE). Any box then shows every product wordmark at the same text size, whatever the box size.

The web components recognise plate files by "_plate_" in the uploaded file name (Strapi stores "vajrax-plate.png" as
"/uploads/vajrax_plate_<hash>.png") and give them a box of the plate shape; partner logos keep their existing boxes.

usage: python3 tools/logo_plates.py [--preview out.png]
input:  seed/assets/custom/logos/<slug>.png            (original transparent logos)
output: seed/assets/custom/logos/plate/<slug>-plate.png (transparent, PLATE_ASPECT : 1, CANVAS_H px high)

To add or replace a product logo: save the transparent, trimmed original as seed/assets/custom/logos/<slug>.png, add the
slug to SLUGS in tools/logo_metrics.py (and ICON if the icon sits left of or above the text), run this tool, and check the
preview. Editors uploading by hand can use the generated <slug>-plate.png - keep "-plate" in the file name.
"""
import argparse
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from logo_metrics import LOGOS, SLUGS, measure  # noqa: E402

PLATE_ASPECT = 3.25   # canvas width / height; keep in sync with PLATE_ASPECT in apps/web/src/lib/logo-plate.ts
X_SHARE = 0.24        # x-height as a share of the canvas height (VajraX, the tallest icon, then fills ~94 % of the height)
CANVAS_H = 160        # px; large enough for 3x screens without upscaling the source logos
OUT = os.path.join(LOGOS, "plate")


def build(slug):
    m = measure(slug)
    src = Image.open(os.path.join(LOGOS, f"{slug}.png")).convert("RGBA")
    cw, ch = round(CANVAS_H * PLATE_ASPECT), CANVAS_H
    scale = X_SHARE * ch / m["xHeight"]
    w, h = src.width * scale, src.height * scale
    fit = min(1.0, cw * 0.98 / w, ch * 0.98 / h)  # never exceed the canvas (would shrink this one logo's text)
    w, h = round(w * fit), round(h * fit)
    logo = src.resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    # Centre the lower-case band (not the whole logo), so wordmarks share a baseline across a row of plates; clamp so a
    # tall icon (VajraX, FinSight's arrow) never leaves the canvas.
    k = w / src.width
    band_mid = (m["xTop"] + m["baseline"]) / 2 * k
    top = min(max(0, round(ch / 2 - band_mid)), ch - h)
    canvas.alpha_composite(logo, ((cw - w) // 2, top))
    os.makedirs(OUT, exist_ok=True)
    canvas.save(os.path.join(OUT, f"{slug}-plate.png"), optimize=True)
    return {"slug": slug, "scale": round(scale * fit, 3), "logo": (w, h), "fit": round(fit, 3),
            "xHeightOnCanvas": round(m["xHeight"] * scale * fit, 1), "upscaled": scale * fit > 1.0}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview")
    args = ap.parse_args()
    rows = [build(s) for s in SLUGS]
    for r in rows:
        flag = "  (upscaled)" if r["upscaled"] else ""
        shrink = f"  (shrunk to fit: {r['fit']})" if r["fit"] < 1 else ""
        print(f"{r['slug']:14s} logo {r['logo'][0]}x{r['logo'][1]} on {round(CANVAS_H * PLATE_ASPECT)}x{CANVAS_H}  "
              f"x-height {r['xHeightOnCanvas']}px  scale {r['scale']}{flag}{shrink}")
    if args.preview:
        cw = round(CANVAS_H * PLATE_ASPECT)
        cols, pad = 4, 16
        tile_w, tile_h = cw + 2 * pad, CANVAS_H + 2 * pad
        sheet = Image.new("RGB", (cols * tile_w + pad, 2 * tile_h + pad), (11, 15, 28))
        for i, s in enumerate(SLUGS):
            x, y = pad + (i % cols) * tile_w, pad + (i // cols) * tile_h
            plate = Image.new("RGBA", (cw, CANVAS_H), (255, 255, 255, 255))
            plate.alpha_composite(Image.open(os.path.join(OUT, f"{s}-plate.png")))
            d = ImageDraw.Draw(plate)
            for gy in (CANVAS_H / 2 - X_SHARE * CANVAS_H / 2, CANVAS_H / 2 + X_SHARE * CANVAS_H / 2):
                d.line([(0, gy), (cw, gy)], fill=(255, 120, 120), width=1)  # target x-height band
            sheet.paste(plate.convert("RGB"), (x, y))
        sheet.save(args.preview)


if __name__ == "__main__":
    main()
