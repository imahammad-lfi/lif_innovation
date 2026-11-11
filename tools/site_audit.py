#!/usr/bin/env python3
"""Site-wide fidelity audit: live linkfields.com vs our build.

For every path (default: all sitemap URLs) and width, loads both pages, then for every heading-like element on OUR
page (h1–h4, plus short p/span/a/button texts with font-size ≥ 20px) finds the same text on the original and compares
document top, height, left and the computed font (family/size/weight/line-height). Writes a JSON report and prints a
per-page summary (page height delta, # of elements off by > tolerance, worst offenders).

usage: site_audit.py [--paths p1 p2 ...] [--widths 1440 390] [--tol 4] [--out /tmp/site_audit.json] [--jobs 3]
"""
import argparse
import asyncio
import json
import sys
from pathlib import Path

from playwright.async_api import async_playwright

sys.path.insert(0, str(Path(__file__).parent))
from style_cmp import normalize  # noqa: E402  (font-name aliases)

LIVE = "https://www.linkfields.com"

COLLECT = """() => {
  const norm = s => (s || '').replace(/\\s+/g, ' ').trim();
  const out = [], seen = new Set();
  for (const e of document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main span, main a, main button')) {
    if (e.closest('[aria-hidden="true"], [inert]')) continue;
    const t = norm(e.innerText);
    if (t.length < 4 || t.length > 90 || seen.has(t)) continue;
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    if (!r.width || !r.height || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    const isHeading = /^H[1-4]$/.test(e.tagName);
    if (!isHeading && parseFloat(cs.fontSize) < 20) continue;
    if ([...e.children].some(c => norm(c.innerText) === t)) continue;  // prefer the innermost element
    seen.add(t); out.push(t);
  }
  return out.slice(0, 60);
}"""

MEASURE = """(texts) => {
  const norm = s => (s || '').replace(/\\s+/g, ' ').trim().toLowerCase();
  const all = [...document.body.querySelectorAll('*')].filter(e => !['SCRIPT','STYLE','NOSCRIPT','TEMPLATE'].includes(e.tagName));
  const res = {};
  for (const t of texts) {
    const nt = norm(t); let best = null, bl = Infinity;
    for (const e of all) {
      const txt = norm(e.innerText); if (txt !== nt) continue;
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
      if (txt.length <= bl) { best = e; bl = txt.length; }
    }
    if (!best) continue;
    const cs = getComputedStyle(best), r = best.getBoundingClientRect();
    res[t] = { top: Math.round(r.top + scrollY), left: Math.round(r.left), height: Math.round(r.height), width: Math.round(r.width),
      fontFamily: cs.fontFamily.split(',')[0].replace(/"/g, ''), fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight };
  }
  return { res, height: document.documentElement.scrollHeight };
}"""

SCROLL = """async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); await document.fonts.ready; await new Promise(r => setTimeout(r, 400)); await document.fonts.ready; }"""


async def load(browser, url, width):
    page = await browser.new_page(viewport={"width": width, "height": 900})
    try:
        await page.goto(url, wait_until="load", timeout=120000)
        await page.wait_for_timeout(2500)
        await page.evaluate(SCROLL)
        await page.wait_for_timeout(800)
        return page
    except Exception:
        await page.close()
        raise


async def audit(browser, path, width, tol, local):
    ours = await load(browser, local + path, width)
    texts = await ours.evaluate(COLLECT)
    m_ours = await ours.evaluate(MEASURE, texts)
    await ours.close()
    orig = await load(browser, LIVE + path, width)
    m_orig = await orig.evaluate(MEASURE, texts)
    await orig.close()
    rows, offenders = [], []
    for t in texts:
        o, u = m_orig["res"].get(t), m_ours["res"].get(t)
        if not o or not u:
            rows.append({"text": t, "missing": "original" if not o else "ours"})
            continue
        o, u = normalize(dict(o)), normalize(dict(u))
        d = {k: u[k] - o[k] for k in ("top", "left", "height", "width")}
        font = {k: (o[k], u[k]) for k in ("fontFamily", "fontSize", "fontWeight", "lineHeight") if str(o[k]) != str(u[k])}
        row = {"text": t, "delta": d, "font": font, "origTop": o["top"]}
        rows.append(row)
        if any(abs(v) > tol for v in d.values()) or font:
            offenders.append(row)
    return {"path": path, "width": width, "heightOrig": m_orig["height"], "heightOurs": m_ours["height"],
            "rows": rows, "offenders": offenders}


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--paths", nargs="*")
    ap.add_argument("--widths", nargs="*", type=int, default=[1440, 390])
    ap.add_argument("--tol", type=int, default=4)
    ap.add_argument("--jobs", type=int, default=3)
    ap.add_argument("--out", default="/tmp/site_audit.json")
    ap.add_argument("--local", default="http://127.0.0.1:3000")
    a = ap.parse_args()
    paths = a.paths or [u.strip().replace(LIVE, "") or "/" for u in open("/home/ubuntu/lf-crawl/urls.txt") if u.strip()]
    tasks = [(p, w) for p in paths for w in a.widths]
    results, sem = [], asyncio.Semaphore(a.jobs)
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])

        async def run(p, w):
            async with sem:
                for attempt in range(2):
                    try:
                        r = await audit(browser, p, w, a.tol, a.local)
                        break
                    except Exception as e:  # live site occasionally times out
                        r = {"path": p, "width": w, "error": str(e)[:200]}
                results.append(r)
                if "error" in r:
                    print(f"ERR  {w:5} {p}: {r['error'][:100]}", flush=True)
                else:
                    worst = sorted(r["offenders"], key=lambda x: -max(abs(v) for v in x["delta"].values()))[:3]
                    desc = "; ".join(f"{x['text'][:28]!r} Δ{x['delta']['top']:+}/{x['delta']['height']:+}" + (" font" if x["font"] else "") for x in worst)
                    print(f"{'OK ' if not r['offenders'] else 'DIFF'} {w:5} {p}  h {r['heightOrig']}→{r['heightOurs']} ({r['heightOurs']-r['heightOrig']:+})  off={len(r['offenders'])}/{len(r['rows'])}  {desc}", flush=True)
                Path(a.out).write_text(json.dumps(sorted(results, key=lambda x: (x["path"], x["width"])), indent=1))

        await asyncio.gather(*(run(p, w) for p, w in tasks))
        await browser.close()
    print("report:", a.out)


if __name__ == "__main__":
    asyncio.run(main())
