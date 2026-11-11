#!/usr/bin/env python3
"""Crop AI-generated images in /home/ubuntu/lf-gen to the site's formats and store them in seed/assets/custom.
hero-*.jpg -> 1920x512 (same as the original page-hero backgrounds); tile-*.jpg -> 1400x1920 (home service tiles).
Usage: python3 tools/crop_generated.py [names...]   (default: every image in lf-gen)
"""
import os
import sys

from PIL import Image

SRC = "/home/ubuntu/lf-gen"
DST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "seed", "assets", "custom")


def crop_to(im: Image.Image, w: int, h: int, focus_y: float = 0.5) -> Image.Image:
    r = w / h
    if im.width / im.height > r:  # too wide -> trim sides (centre)
        nw = round(im.height * r)
        x = (im.width - nw) // 2
        im = im.crop((x, 0, x + nw, im.height))
    else:  # too tall -> trim top/bottom around focus_y
        nh = round(im.width / r)
        y = max(0, min(im.height - nh, round(im.height * focus_y - nh / 2)))
        im = im.crop((0, y, im.width, y + nh))
    return im.resize((w, h), Image.LANCZOS)


def main(names):
    os.makedirs(DST, exist_ok=True)
    files = names or sorted(f for f in os.listdir(SRC) if f.endswith((".jpg", ".png")))
    for f in files:
        im = Image.open(os.path.join(SRC, f)).convert("RGB")
        out = os.path.splitext(f)[0] + ".jpg"
        if f.startswith("hero-"):
            im = crop_to(im, 1920, 512, 0.5)
        elif f.startswith("tile-"):
            im = crop_to(im, 1400, 1920, 0.5)
        else:
            continue
        im.save(os.path.join(DST, out), quality=82, optimize=True, progressive=True)
        print(f"{f} -> seed/assets/custom/{out} {im.size}")


if __name__ == "__main__":
    main(sys.argv[1:])
