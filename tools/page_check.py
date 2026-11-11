#!/usr/bin/env python3
"""Quick rendered-page QA for one or more site paths (dev server by default).

    python3 tools/page_check.py /services/data-ai [/industries/bfsi ...] [--base http://127.0.0.1:3001]

Reports, per path and for 1440 px and 390 px widths: HTTP status, page height, section count, H1 count,
broken images, hero tab targets without a matching section id, horizontal overflow, and banned/legacy phrases.
Exit code 1 if any hard problem is found (status != 200, H1 != 1, broken images, missing tab targets, overflow).
"""
import asyncio
import json
import re
import sys

from playwright.async_api import async_playwright

BANNED = [r"10x faster", r"10× faster", r"60% (?:cost )?savings", r"guarantee", r"zero downtime", r"\b24/7\b", r"specializ", r"organiz",
          r"optimiz", r"Follow us for the latest", r"Vector X\b", r"We are a leading", r"tuned to precision", r"listeners and leaders",
          r"Lorem", r"TODO", r"TBC", r"\[placeholder"]

JS = r"""
() => {
  const vw = document.documentElement.clientWidth;
  const imgs = [...document.images].filter(i => i.currentSrc || i.src);
  const broken = imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src);
  const ids = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
  const tabs = [...document.querySelectorAll('a[href^="#"], button[data-target]')]
     .map(a => (a.getAttribute('data-target') || a.getAttribute('href').slice(1))).filter(Boolean);
  const missing = [...new Set(tabs)].filter(t => !ids.has(t));
  const sw = document.documentElement.scrollWidth;
  const wide = sw > vw + 1 ? [`page scrollWidth ${sw} > ${vw}`] : [];
  const main = document.querySelector('main') || document.body;
  return {
    height: document.documentElement.scrollHeight,
    sections: main.querySelectorAll(':scope > section, :scope > div > section, main section[id]').length,
    h1: document.querySelectorAll('h1').length,
    h1text: [...document.querySelectorAll('h1')].map(h => h.innerText.trim().slice(0, 80)),
    title: document.title, broken, missingTabTargets: missing, overflow: wide,
    text: main.innerText,
  };
}
"""


async def check(page, base, path, width):
    await page.set_viewport_size({"width": width, "height": 900})
    resp = await page.goto(base + path, wait_until="networkidle", timeout=90000)
    # scroll through to trigger lazy images
    h = await page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < h:
        y += 800
        await page.evaluate(f"window.scrollTo(0,{y})")
        await page.wait_for_timeout(60)
    await page.wait_for_timeout(600)
    r = await page.evaluate(JS)
    r["status"] = resp.status if resp else 0
    text = r.pop("text")
    r["banned"] = sorted({m.group(0) for pat in BANNED for m in re.finditer(pat, text, re.I)})
    return r


async def main(argv):
    base = "http://127.0.0.1:3000"
    paths = []
    it = iter(argv)
    for a in it:
        if a == "--base":
            base = next(it)
        else:
            paths.append(a)
    bad = False
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium")
        page = await b.new_page()
        for path in paths:
            for w in (1440, 390):
                r = await check(page, base, path, w)
                problems = []
                if r["status"] != 200:
                    problems.append(f"status {r['status']}")
                if r["h1"] != 1:
                    problems.append(f"h1={r['h1']}")
                if r["broken"]:
                    problems.append(f"broken images {r['broken'][:3]}")
                if r["missingTabTargets"]:
                    problems.append(f"missing tab targets {r['missingTabTargets']}")
                if r["overflow"]:
                    problems.append(f"horizontal overflow {r['overflow'][:2]}")
                bad |= bool(problems)
                print(f"{path} @{w}: height={r['height']}px h1={r['h1text']} title={r['title']!r}")
                if r["banned"]:
                    print(f"   review wording: {r['banned']}")
                print("   " + ("PROBLEMS: " + "; ".join(problems) if problems else "OK"))
        await b.close()
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1:]))
