#!/usr/bin/env python3
"""Compare computed styles + geometry of elements (found by their text) on the live original vs our build.

usage: style_cmp.py <path> "<text 1>" ["<text 2>" ...] [--width 1440] [--local http://127.0.0.1:3000]

For each text, the smallest element whose own text content starts with / equals that text is reported on both
sites: top/left/width/height (document coordinates), font-family, size, weight, line-height, letter-spacing,
text-transform, colour, and the element's tag. Differences are marked with "<<".
"""
import argparse
import asyncio
import json

from playwright.async_api import async_playwright

PROPS = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "color"]

JS = """([texts, props]) => {
  const norm = s => (s || '').replace(/\\s+/g, ' ').trim().toLowerCase();
  const all = [...document.body.querySelectorAll('*')].filter(e => !['SCRIPT','STYLE','NOSCRIPT','TEMPLATE'].includes(e.tagName));
  return texts.map(t => {
    const nt = norm(t);
    let best = null, bestLen = Infinity;
    for (const e of all) {
      const txt = norm(e.innerText || e.textContent);
      if (!txt.startsWith(nt)) continue;
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (txt.length < bestLen || (txt.length === bestLen)) { best = e; bestLen = txt.length; }
    }
    if (!best) return { text: t, found: false };
    const cs = getComputedStyle(best), r = best.getBoundingClientRect();
    const out = { text: t, found: true, tag: best.tagName.toLowerCase(),
      top: Math.round(r.top + scrollY), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) };
    for (const p of props) out[p] = p === 'fontFamily' ? cs[p].split(',')[0].replace(/"/g, '') : cs[p];
    return out;
  });
}"""


FONT_ALIASES = {  # original custom font names -> (our open-source family, weight)
    "FiraSansMedium": ("Fira Sans", "500"), "FiraSansRegular": ("Fira Sans", "400"), "FiraSansLight": ("Fira Sans", "300"),
    "FiraSansSemiBold": ("Fira Sans", "600"), "FiraSansBold": ("Fira Sans", "700"),
    "InterMedium": ("Inter", "500"), "InterLight": ("Inter", "300"), "InterThin": ("Inter", "100"),
    "InterSemiBold": ("Inter", "600"), "InterRegular": ("Inter", "400"), "libre-franklin": ("Libre Franklin", None),
}


def normalize(r):
    fam = r.get("fontFamily")
    if fam in FONT_ALIASES:
        name, weight = FONT_ALIASES[fam]
        r["fontFamily"] = name
        if weight and r.get("fontWeight") in ("400", "normal"):
            r["fontWeight"] = weight
    return r


async def measure(browser, url, texts, width):
    page = await browser.new_page(viewport={"width": width, "height": 900})
    await page.goto(url, wait_until="domcontentloaded", timeout=120000); await page.wait_for_timeout(5000)
    await page.wait_for_timeout(3000)
    res = await page.evaluate(JS, [texts, PROPS])
    await page.close()
    return [normalize(r) for r in res]


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("texts", nargs="+")
    ap.add_argument("--width", type=int, default=1440)
    ap.add_argument("--local", default="http://127.0.0.1:3000")
    a = ap.parse_args()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        orig = await measure(b, "https://www.linkfields.com" + a.path, a.texts, a.width)
        ours = await measure(b, a.local + a.path, a.texts, a.width)
        await b.close()
    keys = ["top", "left", "width", "height"] + PROPS  # tags differ on purpose (semantic h1/h2 vs divs)
    for o, u in zip(orig, ours):
        print(f"=== {o['text']!r}")
        if not o.get("found") or not u.get("found"):
            print("   original found:", o.get("found"), "| ours found:", u.get("found"))
            continue
        for k in keys:
            mark = "" if str(o[k]) == str(u[k]) else "   <<"
            print(f"   {k:14} orig={o[k]!s:28} ours={u[k]!s:28}{mark}")


if __name__ == "__main__":
    asyncio.run(main())
