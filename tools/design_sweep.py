"""Design QA sweep: every sitemap page at 390 and 1440 on a running server.

Checks horizontal overflow, broken images, visible text below 12px and the font families in use.
Usage: python3 tools/design_sweep.py [--base http://127.0.0.1:3001] [--out /tmp/design_sweep.json]
"""
import argparse
import asyncio
import html
import json
import re
import urllib.request
from urllib.parse import quote, unquote

from playwright.async_api import async_playwright

JS = """async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
  window.scrollTo(0, 0);
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 900));
  const imgs = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map(i => i.currentSrc || i.src);
  const small = []; const fams = {};
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n; while ((n = walker.nextNode())) {
    const t = n.textContent.trim(); if (!t) continue;
    const el = n.parentElement; if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) continue;
    if (el.closest('[aria-hidden="true"],script,style,noscript,nextjs-portal')) continue;
    const fs = parseFloat(cs.fontSize);
    const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    fams[fam] = (fams[fam] || 0) + 1;
    if (fs < 12) small.push([t.slice(0, 40), fs]);
  }
  return { sw: document.documentElement.scrollWidth, broken: [...new Set(imgs)].slice(0, 8), small: small.slice(0, 8), smallCount: small.length, fams };
}"""


def paths(base):
    xml = urllib.request.urlopen(base + "/sitemap.xml", timeout=60).read().decode()
    out = []
    for loc in re.findall(r"<loc>([^<]*)</loc>", xml):
        p = re.sub(r"^https?://[^/]+", "", html.unescape(loc)) or "/"
        out.append(unquote(p))
    return out


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://127.0.0.1:3001")
    ap.add_argument("--out", default="/tmp/design_sweep.json")
    ap.add_argument("--jobs", type=int, default=3)
    a = ap.parse_args()
    ps = paths(a.base)
    results = []
    sem = asyncio.Semaphore(a.jobs)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])

        async def one(path, w):
            async with sem:
                ctx = await b.new_context(viewport={"width": w, "height": 900}, reduced_motion="reduce")
                pg = await ctx.new_page()
                try:
                    await pg.goto(a.base + quote(path), wait_until="load", timeout=120000)
                    r = await pg.evaluate(JS)
                    r.update(path=path, w=w, ok=r["sw"] <= w and not r["broken"])
                except Exception as e:  # noqa: BLE001
                    r = dict(path=path, w=w, ok=False, error=str(e)[:200])
                await ctx.close()
                results.append(r)
                flag = "OK  " if r.get("ok") else "FAIL"
                print(flag, w, path, "sw=%s" % r.get("sw"), "small=%s" % r.get("smallCount"), r.get("broken") or "", r.get("error") or "", flush=True)

        await asyncio.gather(*(one(pth, w) for pth in ps for w in (390, 1440)))
        await b.close()
    json.dump(sorted(results, key=lambda r: (r["path"], r["w"])), open(a.out, "w"), indent=1)
    fails = [r for r in results if not r.get("ok")]
    fam = {}
    for r in results:
        for k, v in (r.get("fams") or {}).items():
            fam[k] = fam.get(k, 0) + v
    print(f"\npages={len(ps)} checks={len(results)} fails={len(fails)}")
    print("fonts:", sorted(fam.items(), key=lambda x: -x[1])[:6])
    print("small-text checks with >0:", sum(1 for r in results if r.get("smallCount")))


asyncio.run(main())
