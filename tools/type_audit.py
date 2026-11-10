"""Typography audit: full-page screenshots + computed text-style histogram.

usage: python3 tools/type_audit.py <out_dir> [--base http://127.0.0.1:3000] [--widths 1440 390] [--pages / /services ...]
Writes <out_dir>/<slug>_<w>.jpg and <out_dir>/type_stats.json
"""
import argparse, asyncio, json, os, re
from collections import Counter, defaultdict
from playwright.async_api import async_playwright

DEFAULT_PAGES = [
    "/", "/services", "/services/digital-transformation", "/services/digital-transformation/app-modernisation",
    "/services/cyber-security", "/linkfields-ip/vajrax", "/solutions/erp-solutions/sap", "/industries/banking",
    "/company/about-us", "/careers", "/contact-us", "/company/blog",
]

JS = r"""() => {
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const t = walker.currentNode; const txt = t.textContent.trim();
    if (txt.length < 2) continue;
    const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue;
    let role = el.tagName.toLowerCase();
    const a = el.closest('header'); const f = el.closest('footer');
    const zone = a ? 'header' : f ? 'footer' : 'main';
    out.push({zone, role, fs: parseFloat(cs.fontSize), lh: cs.lineHeight, fw: cs.fontWeight,
      ff: cs.fontFamily.split(',')[0].replace(/["']/g,'').trim(), n: txt.length, sample: txt.slice(0, 50)});
  }
  return out;
}"""


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--base", default="http://127.0.0.1:3000")
    ap.add_argument("--widths", nargs="+", type=int, default=[1440, 390])
    ap.add_argument("--pages", nargs="+", default=DEFAULT_PAGES)
    ap.add_argument("--no-shots", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    stats = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        for w in a.widths:
            ctx = await b.new_context(viewport={"width": w, "height": 900}, device_scale_factor=1)
            pg = await ctx.new_page()
            for path in a.pages:
                slug = (path.strip("/").replace("/", "__") or "home")
                try:
                    await pg.goto(a.base + path, wait_until="load", timeout=120000)
                    await pg.evaluate("document.fonts.ready")
                    h = await pg.evaluate("document.body.scrollHeight")
                    for y in range(0, h, 700):
                        await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(60)
                    await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(800)
                    rows = await pg.evaluate(JS)
                    stats[f"{slug}@{w}"] = rows
                    if not a.no_shots:
                        await pg.screenshot(path=f"{a.out}/{slug}_{w}.jpg", full_page=True, type="jpeg", quality=70)
                    print("ok", path, w, len(rows), flush=True)
                except Exception as e:
                    print("ERR", path, w, e, flush=True)
            await ctx.close()
        await b.close()
    json.dump(stats, open(f"{a.out}/type_stats.json", "w"))
    # summary
    for w in a.widths:
        c = Counter(); fams = Counter(); byrole = defaultdict(Counter)
        for k, rows in stats.items():
            if not k.endswith(f"@{w}"): continue
            for r in rows:
                c[r["fs"]] += r["n"]; fams[r["ff"]] += r["n"]; byrole[r["zone"] + ":" + r["role"]][r["fs"]] += r["n"]
        tot = sum(c.values()) or 1
        print(f"\n=== width {w}: font-size share of characters")
        print("  ".join(f"{fs:g}px {100*n/tot:.1f}%" for fs, n in sorted(c.items())))
        print("families:", ", ".join(f"{f} {100*n/tot:.0f}%" for f, n in fams.most_common(6)))
        for role, cc in sorted(byrole.items(), key=lambda x: -sum(x[1].values()))[:14]:
            print(f"  {role:16s}", "  ".join(f"{fs:g}:{n}" for fs, n in cc.most_common(6)))


asyncio.run(main())
