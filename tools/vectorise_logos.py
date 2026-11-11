#!/usr/bin/env python3
"""
Vectorise the raster product logos into crisp SVGs (light-background and on-dark versions).

Why: the product logos only exist as small PNG/WebP files (about 300-840 px wide). Drawn larger on high-density screens
and re-encoded by the image optimiser, their edges look soft and ragged. Tracing them gives resolution-independent
SVGs with clean, flat-colour edges that browsers draw sharply at any size, and SVGs bypass the lossy optimiser.

How (deterministic, no new artwork): for each logo
  1. remove the white matte: edge pixels were anti-aliased against white, so their colour is un-premultiplied against
     white and their alpha recovered - no pale fringe is left on dark backgrounds;
  2. find its flat brand colours from the peaks of the colour histogram of fully opaque interior pixels, and assign every
     pixel to its nearest brand colour (CIELAB), giving a coverage map per colour;
  3. enlarge each coverage map SCALE x, smooth it (SMOOTH, Gaussian, in source px) and threshold it at 50 %: stair-steps
     and compression bumps disappear and straight edges trace straight; masks are grown by a hair into neighbouring
     colours only, so adjacent shapes overlap and no seams show;
  4. trace each mask with potrace (smooth Bezier curves) and stack the layers, largest first, into one SVG;
  5. shaded logos (SHADED, i.e. VajraX's 3D-style icon) cannot be flattened: their cleaned shading is embedded as a 4x
     WebP inside a traced vector outline (clipPath), so the edges are vector-crisp and the shading is kept;
  6. write the light version (original colours) and the on-dark version (near-black/navy -> white, dark brand blue
     lifted to a lighter tint of the same hue, HLS lightness >= 0.64; orange/yellow unchanged). The SVG frame is the
     artwork plus 1 px, so proportions match the PNG originals.
Judge results at 4-5x zoom on the banner colour (#0b0f1c). Product banners use the on-dark files (seed/custom/deck.py).
requires: potrace (apt), numpy, scipy, Pillow; optional cairosvg for --preview
usage: python3 tools/vectorise_logos.py [--only slug,slug] [--preview /tmp/out.png]
input : seed/assets/custom/logos/<slug>.png
output: seed/assets/custom/logos/svg/<slug>.svg and seed/assets/custom/logos/svg/<slug>-on-dark.svg
"""
import argparse
import colorsys
import os
import re
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "seed/assets/custom/logos")
OUT = os.path.join(SRC, "svg")
SCALE = 8
# Edge smoothing: SMOOTH is a Gaussian blur (in source pixels) of each colour's coverage before the 50 % threshold. It
# removes the stair-steps and compression bumps of the small source files, so straight edges trace straight.
# ALPHAMAX (potrace corner threshold) and OPTTOL (curve optimisation tolerance) control how smooth the curves are.
SMOOTH = float(os.environ.get("LOGO_SMOOTH", "0.9"))
ALPHAMAX = float(os.environ.get("LOGO_ALPHAMAX", "1.1"))
OPTTOL = float(os.environ.get("LOGO_OPTTOL", "1.5"))
# thin strokes (VajraX's orbit ring and blue line) break up under strong smoothing; such logos get a lighter blur
SMOOTH_BY_SLUG = {"vajrax": 0.4}

# Number of flat colours per logo (chosen by inspecting each logo; anti-aliasing is not a colour).
LOGOS = {
    "linkworks": 4,      # yellow, orange, blue, black wordmark
    "testoriumz": 4,     # orange, yellow, blue, black wordmark
    "textiq": 2,         # blue "text", orange "IQ"
    "finsight": 2,       # blue "Fin", orange "Sight" and arrow
    "edupilot": 3,       # blue figure, orange accent, blue/orange wordmark
    "vectorx": 2,        # navy "Vector", orange "X"
    "ai-governance": 2,  # blue "AI", navy "Governance"
    "vajrax": 14,        # shaded 3D icon -> SHADED mode (vector outline, original shading inside)
}


def srgb_to_lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    m = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ m.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def kmeans(x, k, iters=40, seed=7):
    rng = np.random.default_rng(seed)
    # k-means++ initialisation
    cent = [x[rng.integers(len(x))]]
    for _ in range(1, k):
        d = np.min(((x[:, None, :] - np.array(cent)[None]) ** 2).sum(-1), 1)
        cent.append(x[rng.choice(len(x), p=d / d.sum())])
    cent = np.array(cent, dtype=float)
    for _ in range(iters):
        lab = np.argmin(((x[:, None, :] - cent[None]) ** 2).sum(-1), 1)
        new = np.array([x[lab == i].mean(0) if np.any(lab == i) else cent[i] for i in range(k)])
        if np.allclose(new, cent, atol=1e-3):
            break
        cent = new
    return cent, lab


def upscale_premultiplied(im, s):
    a = np.asarray(im.convert("RGBA")).astype(np.float32) / 255.0
    pm = a.copy()
    pm[..., :3] *= pm[..., 3:4]
    big = []
    for ch in range(4):
        c = Image.fromarray(np.asarray(Image.fromarray(pm[..., ch].astype(np.float32), mode="F").resize(
            (im.width * s, im.height * s), Image.LANCZOS)))
        big.append(np.asarray(c, dtype=np.float32))
    big = np.clip(np.stack(big, -1), 0, 1)
    alpha = big[..., 3]
    rgb = np.where(alpha[..., None] > 1e-4, big[..., :3] / np.maximum(alpha[..., None], 1e-4), 0)
    return np.clip(rgb * 255, 0, 255), alpha


def potrace_paths(mask, turd=6):
    """Trace a boolean mask; returns (transform, [path d]) from potrace's SVG backend. turd = speck size to drop (px)."""
    h, w = mask.shape
    with tempfile.TemporaryDirectory() as td:
        pbm = os.path.join(td, "m.pbm")
        Image.fromarray(np.where(mask, 0, 255).astype(np.uint8)).convert("1").save(pbm)
        svg = os.path.join(td, "m.svg")
        subprocess.run(["potrace", pbm, "-s", "-o", svg, "-t", str(turd), "-a", str(ALPHAMAX), "-O", str(OPTTOL),
                        "-u", "10", "--flat"], check=True)
        s = open(svg).read()
    tr = re.search(r'<g transform="([^"]+)"', s).group(1)
    ds = re.findall(r'<path d="([^"]+)"', s)
    return tr, ds


def hex_of(c):
    return "#%02x%02x%02x" % tuple(int(round(v)) for v in c)


def on_dark(c):
    r, g, b = [v / 255 for v in c]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if l < 0.30 and (s < 0.55 or l < 0.18):  # black, near-black and navy wordmarks -> white
        return (255, 255, 255)
    if 0.53 <= h <= 0.72 and s > 0.35 and l < 0.64:  # dark brand blue -> lighter tint, same hue
        r, g, b = colorsys.hls_to_rgb(h, 0.64, min(1.0, s))
        return (r * 255, g * 255, b * 255)
    return tuple(c)


def pick_palette(px, k, min_de):
    """Deterministic palette: greedy peaks of the solid-pixel colour histogram, at least min_de apart (CIELAB),
    then each refined to the mean of the solid pixels nearest to it."""
    q = (px // 8).astype(np.int32)
    keys, counts = np.unique(q[:, 0] * 1024 + q[:, 1] * 32 + q[:, 2], return_counts=True)
    order = np.argsort(-counts)
    picks = []
    for o in order:
        kk = keys[o]
        c = np.array([(kk // 1024) * 8 + 4, ((kk // 32) % 32) * 8 + 4, (kk % 32) * 8 + 4], dtype=float)
        if counts[o] < max(12, 0.002 * len(px)):
            break
        lab = srgb_to_lab(c[None])[0]
        if all(np.linalg.norm(lab - srgb_to_lab(pc[None])[0]) >= min_de for pc in picks):
            picks.append(c)
        if len(picks) == k:
            break
    picks = np.array(picks)
    lab_px = srgb_to_lab(px)
    idx = np.argmin(((lab_px[:, None, :] - srgb_to_lab(picks)[None]) ** 2).sum(-1), 1)
    return np.array([px[idx == i].mean(0) if np.any(idx == i) else picks[i] for i in range(len(picks))])


MIN_DE = {"vajrax": 7.0}
# Shaded artwork cannot be flattened into a few colours without posterising it. For these logos the SVG is a smooth
# traced outline used as a clip path, filled with the logo's own shading (un-matted, colours bled outwards from the
# interior so no white fringe reaches the edge, enlarged SHADED_SCALE x). Edges are vector-crisp, shading unchanged.
SHADED = {"vajrax"}
RETIRED = {"vajrax"}  # client supplied a high-resolution original (11 Nov 2026); see main()
SHADED_SCALE = 4


def shaded_svg(slug, im, W, H, union, conf, iy, ix, label, pal, vb):
    """Vector outline (clip path) + the logo's own shading as an embedded image. Written for the light and dark versions.
    clipPath may only contain shapes (no <g>), so potrace's transform goes on each path."""
    import base64
    import io
    tr, ds = potrace_paths(union, turd=40)  # drop specks under ~0.6 source px
    rgb = np.asarray(im.convert("RGB")).astype(np.float32)
    # colour of every pixel = colour of its nearest confident interior pixel when it is an edge pixel (removes the white
    # matte), the original colour inside; the fill is then bled outwards so the clip edge never meets background
    clean = rgb[iy, ix]
    fill = np.where(conf[..., None], rgb, clean)
    dark_ids = [i for i, c in enumerate(pal) if on_dark(c) == (255, 255, 255)]

    def encode(img):
        big = img.resize((W * SHADED_SCALE, H * SHADED_SCALE), Image.LANCZOS)
        buf = io.BytesIO()
        big.save(buf, "WEBP", quality=92, method=6)
        return base64.b64encode(buf.getvalue()).decode()

    light_img = Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8))
    # on-dark: near-black wordmark pixels -> white; blue shading lifted towards the same tint used for flat logos
    d = fill.copy()
    isdark = np.isin(label, dark_ids)
    d[isdark] = 255.0
    hls = np.array([colorsys.rgb_to_hls(*(px / 255.0)) for px in d.reshape(-1, 3)]).reshape(H, W, 3)
    blue = (hls[..., 0] >= 0.53) & (hls[..., 0] <= 0.72) & (hls[..., 2] > 0.35) & ~isdark
    L = hls[..., 1]
    hls[..., 1] = np.where(blue, np.maximum(L, 0.40 + 0.6 * L), L)
    lifted = np.array([colorsys.hls_to_rgb(*v) for v in hls.reshape(-1, 3)]).reshape(H, W, 3) * 255.0
    dark_img = Image.fromarray(np.clip(np.where(blue[..., None], lifted, d), 0, 255).astype(np.uint8))

    def svg(img):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{vb[2]}" '
                f'height="{vb[3]}" viewBox="{vb[0] * SCALE} {vb[1] * SCALE} {vb[2] * SCALE} {vb[3] * SCALE}">\n'
                f'<defs><clipPath id="lf-{slug}-outline">'
                + "".join(f'<path transform="{tr}" d="{p}"/>' for p in ds) + "</clipPath></defs>\n"
                f'<image clip-path="url(#lf-{slug}-outline)" x="0" y="0" width="{W * SCALE}" height="{H * SCALE}" '
                f'preserveAspectRatio="none" href="data:image/webp;base64,{encode(img)}"/>\n</svg>\n')

    os.makedirs(OUT, exist_ok=True)
    light = os.path.join(OUT, f"{slug}.svg")
    dark = os.path.join(OUT, f"{slug}-on-dark.svg")
    open(light, "w").write(svg(light_img))
    open(dark, "w").write(svg(dark_img))
    print(f"{slug:14s} {vb[2]}x{vb[3]} shaded outline+fill {os.path.getsize(light)//1024}KB/{os.path.getsize(dark)//1024}KB")
    return light, dark


def vectorise(slug, k):
    from scipy import ndimage

    im = Image.open(os.path.join(SRC, f"{slug}.png")).convert("RGBA")
    bb = im.getchannel("A").getbbox()
    im = im.crop(bb)
    pad = 4
    canvas = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad))
    im = canvas
    W, H = im.size
    # the SVG frame is the artwork plus 1 source px (the 4 px working margin only gives the smoothing room)
    vb = (pad - 1, pad - 1, W - 2 * pad + 2, H - 2 * pad + 2)
    a = np.asarray(im).astype(np.float32)
    rgb, alpha = a[..., :3], a[..., 3] / 255.0

    # 1. palette from fully opaque interior pixels
    solid = np.asarray(im.getchannel("A").filter(ImageFilter.MinFilter(3))) >= 250
    pal = pick_palette(rgb[solid], k, MIN_DE.get(slug, 18.0))
    pal_lab = srgb_to_lab(pal)
    lab = srgb_to_lab(rgb)
    dist = np.sqrt(((lab[..., None, :] - pal_lab[None, None]) ** 2).sum(-1))
    near = np.argmin(dist, -1)
    conf = solid & (np.min(dist, -1) < 14)

    # 2. every visible pixel takes the colour of its nearest confident pixel (edge pixels belong to the shape beside them)
    _, (iy, ix) = ndimage.distance_transform_edt(~conf, return_indices=True)
    label = near[iy, ix]

    # 3. un-matte: the logos were cut out of a white background, so edge pixels are a blend of the shape colour C and
    #    white. Their real coverage is how far they sit from white towards C (dark, properly transparent edges keep alpha).
    C = pal[label]
    wc = 255.0 - C
    t = np.clip(((255.0 - rgb) * wc).sum(-1) / np.maximum((wc * wc).sum(-1), 1.0), 0, 1)
    cover = alpha * t

    # 4. per-colour coverage, enlarged smoothly and thresholded at 50 % -> sub-pixel accurate, smooth contours
    def up(x):
        big = np.asarray(Image.fromarray(x.astype(np.float32), mode="F").resize((W * SCALE, H * SCALE), Image.LANCZOS))
        sm = SMOOTH_BY_SLUG.get(slug, SMOOTH)
        return ndimage.gaussian_filter(big, sm * SCALE) if sm > 0 else big

    union = up(cover) >= 0.5
    layers = []
    for i in range(len(pal)):
        ci = np.where(label == i, cover, 0.0)
        if ci.sum() < 4:
            continue
        m = up(ci) >= 0.5
        if m.sum() < 60:
            continue
        # grow 2 px (a quarter of a source pixel) into neighbouring colours only: adjacent shapes overlap, no seams
        grown = ndimage.binary_dilation(m, iterations=2) & union
        layers.append((int(m.sum()), pal[i], grown))
    layers.sort(key=lambda t_: -t_[0])

    if slug in SHADED:
        # a slightly lower threshold keeps 1-px strokes (the thin blue line) continuous in the outline
        return shaded_svg(slug, im, W, H, up(cover) >= 0.44, conf, iy, ix, label, pal, vb)

    traced = [(col, *potrace_paths(m)) for _, col, m in layers]

    def svg(map_colour):
        parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{vb[2]}" height="{vb[3]}" '
                 f'viewBox="{vb[0] * SCALE} {vb[1] * SCALE} {vb[2] * SCALE} {vb[3] * SCALE}">']
        for col, tr, ds in traced:
            parts.append(f'<g transform="{tr}" fill="{hex_of(map_colour(col))}" stroke="none">'
                         + "".join(f'<path d="{d}"/>' for d in ds) + "</g>")
        parts.append("</svg>")
        return "\n".join(parts) + "\n"

    os.makedirs(OUT, exist_ok=True)
    light = os.path.join(OUT, f"{slug}.svg")
    dark = os.path.join(OUT, f"{slug}-on-dark.svg")
    open(light, "w").write(svg(lambda c: c))
    open(dark, "w").write(svg(on_dark))
    pal_txt = ", ".join(f"{hex_of(c)}->{hex_of(on_dark(c))}" for _, c, _ in layers)
    print(f"{slug:14s} {vb[2]}x{vb[3]} layers={len(layers)} {os.path.getsize(light)//1024}KB/{os.path.getsize(dark)//1024}KB  {pal_txt}")
    return light, dark


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--preview", default="")
    args = ap.parse_args()
    # VajraX: since 11 Nov 12:22 the client's own high-resolution transparent logo is used (banner: its on-dark raster
    # logos/on-dark/vajrax-on-dark.png), so it is no longer traced unless asked for explicitly with --only=vajrax.
    slugs = [s for s in LOGOS if (s in args.only.split(",")) if args.only] if args.only else [s for s in LOGOS if s not in RETIRED]
    outs = [vectorise(s, LOGOS[s]) for s in slugs]
    if args.preview:
        import cairosvg  # optional, preview only
        rows = []
        for (light, dark), s in zip(outs, slugs):
            for f, bg in ((dark, (12, 16, 30)), (light, (255, 255, 255))):
                png = cairosvg.svg2png(url=f, output_width=900)
                tile = Image.open(__import__("io").BytesIO(png)).convert("RGBA")
                t = Image.new("RGBA", (940, tile.height + 40), bg + (255,))
                t.alpha_composite(tile, (20, 20))
                rows.append(t)
        Wp = 940 * 2 + 10
        Hp = sum(max(rows[i].height, rows[i + 1].height) + 10 for i in range(0, len(rows), 2))
        sheet = Image.new("RGB", (Wp, Hp), (128, 128, 128))
        y = 0
        for i in range(0, len(rows), 2):
            sheet.paste(rows[i], (0, y))
            sheet.paste(rows[i + 1], (950, y))
            y += max(rows[i].height, rows[i + 1].height) + 10
        sheet.save(args.preview)
        print("preview", args.preview, sheet.size)


if __name__ == "__main__":
    main()
