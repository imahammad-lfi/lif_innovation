#!/usr/bin/env python3
"""Cross-device responsive QA: every sitemap page on real device profiles (UA, viewport, DPR, touch).

    python3 tools/device_matrix_qa.py http://127.0.0.1:3001 /tmp/devices [--pages 0] [--jobs 5] [--only "iPhone SE,Pixel 7"]

iPhones/iPads and Safari desktop run in WebKit (Safari's engine); Android and other desktops in Chromium.
Per page and device it records:
  overflow   page wider than the viewport (horizontal scroll) + the elements that stick out
  images     broken images
  clipped    headings / buttons / links whose text is cut off (overflow hidden without ellipsis or line clamp)
  tiny       visible text below 12 px
  targets    tap targets smaller than 24×24 CSS px (WCAG 2.2 AA 2.5.8; inline text links exempt)
  h1         number of <h1> elements (expected 1)
  header     fixed header height as a share of the viewport height
  nav        which navigation is shown (desktop menu or hamburger)
  errors     uncaught page errors
Writes <out>/results.json, <out>/summary.md and first-screen screenshots of key pages per device.
"""
import argparse
import asyncio
import json
import os
import re
import sys
import time
import urllib.request
from urllib.parse import urlparse

from playwright.async_api import async_playwright

QUIET = "try{sessionStorage.setItem('lf-promo-v2:atf-2026','closed');localStorage.setItem('lf-promo-v2:atf-2026','closed')}catch(e){}"

DEVICES = [
    # name, engine, playwright descriptor or custom viewport
    ("iPhone SE", "webkit", "iPhone SE"),
    ("iPhone 14", "webkit", "iPhone 14"),
    ("iPhone 15 Pro Max", "webkit", "iPhone 15 Pro Max"),
    ("iPhone 14 landscape", "webkit", "iPhone 14 landscape"),
    ("Galaxy S9+", "chromium", "Galaxy S9+"),
    ("Pixel 7", "chromium", "Pixel 7"),
    ("iPad Mini", "webkit", "iPad Mini"),
    ("Galaxy Tab S4", "chromium", "Galaxy Tab S4"),
    ("iPad Pro 11 landscape", "webkit", "iPad Pro 11 landscape"),
    ("Laptop 1280×800", "chromium", {"viewport": {"width": 1280, "height": 800}}),
    ("Laptop 1366×768", "chromium", {"viewport": {"width": 1366, "height": 768}}),
    ("Safari 1440×900", "webkit", {"viewport": {"width": 1440, "height": 900}, "device_scale_factor": 2}),
    ("Desktop 1920×1080", "chromium", {"viewport": {"width": 1920, "height": 1080}}),
    ("Desktop 2560×1440", "chromium", {"viewport": {"width": 2560, "height": 1440}}),
]
SHOT_PAGES = ["/", "/services/data-ai", "/contact-us", "/events/africa-tech-festival-2026", "/products-and-accelerators"]

PROBE = r"""async () => {
  const H = document.documentElement, vw = innerWidth, vh = innerHeight;
  for (let y = 0; y < document.body.scrollHeight; y += Math.round(vh * 0.9)) { scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); }
  scrollTo(0, 0); await document.fonts.ready; await new Promise(r => setTimeout(r, 500));
  const visible = el => { const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const hiddenByAncestor = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p); if (s.display === 'none' || s.visibility === 'hidden') return true;
      if (p.getAttribute('aria-hidden') === 'true' && p.closest('[data-marquee],.marquee,[class*="marquee"]')) return true;
      if (p.hasAttribute('inert')) return true; }
    return false; };
  const clippedX = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX; if (ox !== 'visible') { const r = p.getBoundingClientRect(); return r.right <= vw + 1 && r.left >= -1; } }
    return false; };
  const sel = el => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id;
    const c = (el.getAttribute('class') || '').split(/\s+/).filter(x => x && !x.includes(':') && !x.includes('[')).slice(0, 3); if (c.length) s += '.' + c.join('.');
    const t = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40); return t ? `${s} "${t}"` : s; };
  const out = { sw: H.scrollWidth, vw, vh, overflowEls: [], broken: [], clipped: [], tiny: 0, tinySamples: [], small: 0, smallSamples: [], targets: [], h1: 0, header: 0, nav: '' };
  if (H.scrollWidth > vw + 1) {
    for (const el of document.body.querySelectorAll('*')) { const r = el.getBoundingClientRect();
      if ((r.right > vw + 1 || r.left < -1) && r.width > 0 && visible(el) && !clippedX(el) && !hiddenByAncestor(el)) { out.overflowEls.push(sel(el) + ` [${Math.round(r.left)}→${Math.round(r.right)}]`); if (out.overflowEls.length > 6) break; } } }
  out.broken = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src') && visible(i)).map(i => (i.currentSrc || i.src).slice(-80));
  const srOnly = el => !!el.closest('.sr-only') || (() => { const r = el.getBoundingClientRect(); return r.width <= 1 || r.height <= 1; })();
  for (const el of document.querySelectorAll('h1,h2,h3,h4,button,a,[role=tab],label')) {
    if (!visible(el) || hiddenByAncestor(el) || srOnly(el)) continue; const s = getComputedStyle(el);
    if (!(s.overflow === 'hidden' || s.overflowX === 'hidden' || s.overflowY === 'hidden')) continue;
    if (s.textOverflow === 'ellipsis' || (s.webkitLineClamp && s.webkitLineClamp !== 'none')) continue;
    const box = el.getBoundingClientRect(); let cut = false;
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let t;
    while (!cut && (t = tw.nextNode())) { if (!t.textContent.trim()) continue; const pe = t.parentElement;
      if (!pe || !visible(pe) || pe.closest('[aria-hidden="true"]')) continue;
      const pcs = getComputedStyle(pe); if (pcs.textOverflow === 'ellipsis' || (pcs.webkitLineClamp && pcs.webkitLineClamp !== 'none')) continue;
      const rg = document.createRange(); rg.selectNodeContents(t);
      for (const r of rg.getClientRects()) { if (r.width && (r.right > box.right + 1.5 || r.left < box.left - 1.5 || r.bottom > box.bottom + 1.5 || r.top < box.top - 1.5)) { cut = true; break; } } }
    if (cut) out.clipped.push(sel(el));
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = walker.nextNode())) { const t = n.textContent.trim(); if (t.length < 2) continue; const el = n.parentElement; if (!el || !visible(el) || hiddenByAncestor(el)) continue;
    if (el.closest('svg,[aria-hidden="true"],.sr-only,script,style,noscript')) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 11) { out.tiny++; if (out.tinySamples.length < 4) out.tinySamples.push(`${fs}px "${t.slice(0, 30)}"`); } else if (fs < 12) { out.small++; if (out.smallSamples.length < 4) out.smallSamples.push(`${fs}px "${t.slice(0, 30)}"`); } }
  for (const el of document.querySelectorAll('a[href],button,[role=button],[role=tab],input:not([type=hidden]),select,textarea,summary')) {
    if (!visible(el) || hiddenByAncestor(el) || el.closest('.sr-only')) continue; const s = getComputedStyle(el);
    if (el.tagName === 'A' && s.display === 'inline') continue;
    const r = el.getBoundingClientRect(); if (r.width < 24 && r.height < 24 || r.width < 16 || r.height < 16) out.targets.push(sel(el) + ` [${Math.round(r.width)}×${Math.round(r.height)}]`); }
  out.h1 = [...document.querySelectorAll('h1')].filter(visible).length;
  const hd = document.querySelector('header'); if (hd) out.header = Math.round(hd.getBoundingClientRect().height);
  const burger = [...document.querySelectorAll('header button')].find(b => /menu/i.test(b.getAttribute('aria-label') || '') && visible(b));
  out.nav = burger ? 'hamburger' : 'desktop menu';
  out.viewportMeta = !!document.querySelector('meta[name=viewport]');
  return out;
}"""


def sitemap_paths(base):
    xml = urllib.request.urlopen(base + "/sitemap.xml", timeout=30).read().decode()
    paths = []
    for loc in re.findall(r"<loc>([^<]+)</loc>", xml):
        p = urlparse(loc).path or "/"
        if p not in paths:
            paths.append(p)
    return paths


async def run_device(pw, browsers, base, name, engine, desc, paths, out, jobs, results):
    b = browsers[engine]
    opts = dict(pw.devices[desc]) if isinstance(desc, str) else dict(desc)
    opts.pop("default_browser_type", None)
    sem = asyncio.Semaphore(jobs)
    dev = {"device": name, "engine": engine, "viewport": opts.get("viewport"), "pages": {}}
    results.append(dev)

    async def one(path):
        async with sem:
            ctx = await b.new_context(**opts)
            await ctx.add_init_script(QUIET)
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
            rec = {}
            try:
                resp = await pg.goto(base + path, wait_until="load", timeout=60000)
                rec["status"] = resp.status if resp else None
                await pg.wait_for_timeout(600)
                rec.update(await pg.evaluate(PROBE))
                if path in SHOT_PAGES:
                    slug = re.sub(r"[^a-z0-9]+", "-", (path.strip("/") or "home").lower())
                    dn = re.sub(r"[^A-Za-z0-9]+", "-", name)
                    await pg.screenshot(path=f"{out}/shots/{dn}__{slug}.png")
            except Exception as e:  # noqa: BLE001
                rec["exception"] = str(e)[:200]
            rec["errors"] = errs[:3]
            dev["pages"][path] = rec
            await ctx.close()

    await asyncio.gather(*(one(p) for p in paths))
    bad = sum(1 for r in dev["pages"].values() if problems(r))
    print(f"{name:24s} {len(paths)} pages, {bad} with problems", flush=True)


def problems(r):
    p = []
    if r.get("exception"):
        p.append("exception: " + r["exception"][:80])
    if r.get("status") not in (200, None) and r.get("status"):
        p.append(f"status {r['status']}")
    if r.get("sw", 0) > r.get("vw", 0) + 1:
        p.append(f"horizontal overflow {r['sw']}>{r['vw']}")
    if r.get("broken"):
        p.append(f"{len(r['broken'])} broken image(s)")
    if r.get("clipped"):
        p.append(f"{len(r['clipped'])} clipped label(s)")
    if r.get("h1", 1) != 1:
        p.append(f"h1={r.get('h1')}")
    if r.get("errors"):
        p.append(f"{len(r['errors'])} page error(s)")
    return p


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base")
    ap.add_argument("out")
    ap.add_argument("--pages", type=int, default=0, help="limit number of sitemap pages (0 = all)")
    ap.add_argument("--jobs", type=int, default=5)
    ap.add_argument("--only", default="")
    a = ap.parse_args()
    os.makedirs(a.out + "/shots", exist_ok=True)
    paths = sitemap_paths(a.base)
    if a.pages:
        keep = [p for p in SHOT_PAGES if p in paths]
        paths = keep + [p for p in paths if p not in keep][: max(0, a.pages - len(keep))]
    devices = [d for d in DEVICES if not a.only or d[0] in a.only.split(",")]
    print(f"{len(paths)} pages × {len(devices)} devices", flush=True)
    t0 = time.time()
    results = []
    async with async_playwright() as pw:
        browsers = {"chromium": await pw.chromium.launch(executable_path="/usr/bin/chromium"), "webkit": await pw.webkit.launch()}
        for name, engine, desc in devices:
            await run_device(pw, browsers, a.base, name, engine, desc, paths, a.out, a.jobs, results)
        for b in browsers.values():
            await b.close()
    json.dump(results, open(a.out + "/results.json", "w"), indent=1)
    # Summary
    lines = [f"# Device matrix QA — {len(paths)} pages × {len(devices)} devices ({round(time.time() - t0)} s)", "",
             "| Device | Engine | Viewport | Nav | Pages | Overflow | Broken img | Clipped | H1≠1 | Errors | Text <11px (pages) | Text 11–12px (pages) | Small targets (pages) | Header % vh |",
             "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
    detail = []
    for d in results:
        P = d["pages"].values()
        vp = d["viewport"] or {}
        navs = sorted({r.get("nav", "?") for r in P})
        hdr = max((round(100 * r.get("header", 0) / max(1, r.get("vh", 1))) for r in P), default=0)
        row = [d["device"], d["engine"], f"{vp.get('width')}×{vp.get('height')}", "/".join(navs), str(len(d["pages"])),
               str(sum(r.get("sw", 0) > r.get("vw", 0) + 1 for r in P)), str(sum(bool(r.get("broken")) for r in P)),
               str(sum(bool(r.get("clipped")) for r in P)), str(sum(r.get("h1", 1) != 1 for r in P)),
               str(sum(bool(r.get("errors")) or bool(r.get("exception")) for r in P)),
               str(sum(r.get("tiny", 0) > 0 for r in P)), str(sum(r.get("small", 0) > 0 for r in P)), str(sum(bool(r.get("targets")) for r in P)), f"{hdr}%"]
        lines.append("| " + " | ".join(row) + " |")
        for path, r in d["pages"].items():
            pr = problems(r)
            if pr:
                detail.append(f"- **{d['device']}** `{path}`: " + "; ".join(pr) + (f" — {r.get('overflowEls', [])[:3]}" if r.get("overflowEls") else "") + (f" — {r.get('clipped', [])[:2]}" if r.get("clipped") else "") + (f" — {r.get('errors', [])[:1]}" if r.get("errors") else ""))
    lines += ["", "## Problems", ""] + (detail or ["None."])
    tg = {}
    for d in results:
        for path, r in d["pages"].items():
            for t in r.get("targets", []):
                k = re.sub(r" \[.*", "", t)
                tg.setdefault(k, set()).add(d["device"])
    lines += ["", "## Small tap targets (element → devices)", ""] + [f"- {k}: {len(v)} device(s)" for k, v in sorted(tg.items(), key=lambda x: -len(x[1]))[:25]]
    ti = {}
    for d in results:
        for path, r in d["pages"].items():
            for t in r.get("tinySamples", []):
                ti.setdefault(t, set()).add(d["device"])
    lines += ["", "## Text below 11 px (sample → devices)", ""] + [f"- {k}: {len(v)} device(s)" for k, v in sorted(ti.items(), key=lambda x: -len(x[1]))[:20]]
    open(a.out + "/summary.md", "w").write("\n".join(lines) + "\n")
    print("\n".join(lines[:4 + len(results)]))
    print(f"problems: {len(detail)}")


if __name__ == "__main__":
    asyncio.run(main())
