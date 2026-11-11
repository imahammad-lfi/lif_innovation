"""Large-screen / projector / TV layout QA.

Measures, per page and viewport, how far visible content extends beyond the header's content frame,
the hero copy-to-globe gap, hero fit, horizontal overflow, marquee fill and fixed-widget overlap with the footer.

usage: python3 tools/large_screen_qa.py BASE OUTDIR [--shots] [--only "4K monitor,..."] [--pages /,/contact-us]
"""
import argparse, asyncio, json, os, time
from playwright.async_api import async_playwright

VIEWPORTS = [
    ("XGA projector", 1024, 768),
    ("HD projector", 1280, 720),
    ("WXGA projector", 1280, 800),
    ("Laptop 1366", 1366, 657),
    ("Laptop 1536 (FHD 125%)", 1536, 740),
    ("FHD monitor", 1920, 960),
    ("FHD TV / projector fullscreen", 1920, 1080),
    ("WUXGA projector", 1920, 1200),
    ("UW-FHD 2560x1080", 2560, 960),
    ("QHD monitor", 2560, 1320),
    ("UWQHD 3440x1440", 3440, 1320),
    ("4K monitor 100%", 3840, 2040),
    ("4K TV fullscreen", 3840, 2160),
    ("Super-ultrawide 5120x1440", 5120, 1320),
]
PAGES = [
    "/", "/services", "/services/digital-transformation", "/services/digital-transformation/app-modernisation",
    "/solutions", "/solutions/ai-code-assurance", "/products-and-accelerators", "/products-and-accelerators/linkworks",
    "/industries", "/industries/telecom", "/company/about-us", "/contact-us", "/events",
    "/events/africa-tech-festival-2026", "/careers", "/company/blog", "/privacy-policy",
]
QUIET = "try{sessionStorage.setItem('lf-promo-v2:atf-2026','closed')}catch(e){}"

MEASURE = r"""
() => {
  const vw = document.documentElement.clientWidth, vh = innerHeight;
  // Content frame = a full-width px-gutter block's padding box (10 Nov 2026: content sits inside the menu bar,
  // which uses the wider px-gutter-nav). Falls back to the menu bar when a page has no px-gutter block.
  const fullW = (el) => el.getBoundingClientRect().width >= vw * 0.98;
  const bar = document.querySelector('header [class*="px-gutter-nav"]') || document.querySelector('header');
  const content = [...document.querySelectorAll('main [class~="px-gutter"]')].find(fullW) || bar;
  const hs = getComputedStyle(content), hr = content.getBoundingClientRect();
  const frameL = hr.left + parseFloat(hs.paddingLeft), frameR = hr.right - parseFloat(hs.paddingRight);
  const bs = getComputedStyle(bar), br = bar.getBoundingClientRect();
  const menuInset = Math.round(frameL - (br.left + parseFloat(bs.paddingLeft)));
  const skip = (el) => el.closest('[aria-hidden="true"],[data-marquee-copy],.marquee,[hidden]');
  const vis = (el) => { const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none'; };
  const desc = (el) => {
    const c = (el.getAttribute('class') || '').split(/\s+/).slice(0, 4).join('.');
    const t = (el.innerText || el.getAttribute('alt') || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50);
    return `${el.tagName.toLowerCase()}${c ? '.' + c : ''} "${t}"`;
  };
  function extents(root) {
    let L = Infinity, R = -Infinity, lEl = null, rEl = null;
    const add = (r, el) => {
      if (r.width < 1 || r.height < 1) return;
      if (r.width >= vw * 0.98) return;           // full-bleed backgrounds / bars
      if (r.left < L) { L = r.left; lEl = el; }
      if (r.right > R) { R = r.right; rEl = el; }
    };
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) {
        if (!n.textContent.trim()) continue;
        const el = n.parentElement; if (!el || skip(el) || !vis(el)) continue;
        // full-bleed strips (client request: edge to edge) and screen-reader-only text are not part of the frame
        if (el.closest('[data-full-bleed], .sr-only')) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const r of rg.getClientRects()) add(r, el);
        continue;
      }
      const el = n; if (skip(el) || !vis(el) || el.closest('[data-full-bleed]')) continue;
      const tag = el.tagName;
      const s = getComputedStyle(el);
      if (s.position === 'fixed') continue;
      const replaced = ['IMG', 'SVG', 'VIDEO', 'CANVAS', 'IFRAME', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(tag.toUpperCase());
      const bg = s.backgroundImage !== 'none' || (s.backgroundColor && !/rgba\(.*,\s*0(\.0\d*)?\)$/.test(s.backgroundColor) && s.backgroundColor !== 'transparent');
      const border = parseFloat(s.borderLeftWidth) > 0 && !/rgba\(.*,\s*0\)$/.test(s.borderLeftColor);
      if (replaced || bg || border) add(el.getBoundingClientRect(), el);
    }
    return { L, R, lEl: lEl && desc(lEl), rEl: rEl && desc(rEl) };
  }
  const main = document.querySelector('main');
  let tops = [...main.querySelectorAll('section')].filter(s => !s.parentElement.closest('section'));
  if (!tops.length) tops = [...main.children];
  const blocks = [...tops, ...document.querySelectorAll('footer')];
  const sections = [];
  blocks.forEach((b, i) => {
    const r = b.getBoundingClientRect(); if (r.height < 4) return;
    const e = extents(b); if (!isFinite(e.L)) return;
    const outL = Math.round(frameL - e.L), outR = Math.round(e.R - frameR);
    const label = b.getAttribute('aria-label') || b.id || (b.querySelector('h1,h2')?.innerText || b.tagName).trim().slice(0, 40);
    sections.push({ i, label, L: Math.round(e.L), R: Math.round(e.R), outL, outR, lEl: e.lEl, rEl: e.rEl,
      marginL: Math.round(e.L), marginR: Math.round(vw - e.R) });
  });
  // hero copy vs globe
  let hero = null;
  const hs2 = document.querySelector('section[aria-label="Linkfields highlights"]');
  if (hs2) {
    const hb = hs2.getBoundingClientRect();
    const g = hs2.querySelector('.globe-halo')?.parentElement;
    const slides = [...hs2.querySelectorAll('[data-carousel-hold]')];
    let copyR = -Infinity, copyL = Infinity;
    for (const s of slides) {
      const w = document.createTreeWalker(s, NodeFilter.SHOW_TEXT); let t;
      while ((t = w.nextNode())) { if (!t.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(t);
        for (const r of rg.getClientRects()) { if (r.width > 0) { copyR = Math.max(copyR, r.right); copyL = Math.min(copyL, r.left); } } }
      for (const a of s.querySelectorAll('a,li')) { const r = a.getBoundingClientRect(); if (r.width > 0) copyR = Math.max(copyR, r.right); }
    }
    const gr = g ? g.getBoundingClientRect() : null;
    const hb2 = bar.getBoundingClientRect().bottom;
    const dotsBtn = hs2.querySelector('[aria-label^="Go to slide"]');
    const dotsTop = dotsBtn ? dotsBtn.closest('[data-carousel-hold]').getBoundingClientRect().top : hb.bottom;
    const strip = [...hs2.querySelectorAll('div')].find(d => (d.className || '').includes('bottom-0') && (d.className || '').includes('backdrop-blur-md'));
    const stripTop = strip ? strip.getBoundingClientRect().top : hb.bottom;
    const slideFit = [...hs2.querySelectorAll('[role="group"]')].map(gp => {
      const h = gp.querySelector('[data-carousel-hold]'); const r = h.getBoundingClientRect();
      return { top: Math.round(r.top - hb2), bottom: Math.round(dotsTop - r.bottom), h: Math.round(r.height) };
    });
    hero = { height: Math.round(hb.height), bottom: Math.round(hb.bottom), fits: hb.bottom <= vh + 1,
      copyL: Math.round(copyL), copyR: Math.round(copyR),
      globe: gr ? { L: Math.round(gr.left), R: Math.round(gr.right), w: Math.round(gr.width), top: Math.round(gr.top), bottom: Math.round(gr.bottom) } : null,
      gap: gr ? Math.round(gr.left - copyR) : null, globeOutR: gr ? Math.round(gr.right - frameR) : null,
      globeTopClear: gr ? Math.round(gr.top - hb2) : null, globeBottomClear: gr ? Math.round(stripTop - gr.bottom) : null,
      slideFit, minSlideTop: Math.min(...slideFit.map(s => s.top)), minSlideBottom: Math.min(...slideFit.map(s => s.bottom)),
      dotsToStrip: Math.round(stripTop - dotsTop) };
  }
  // marquee fill
  const marquees = [...document.querySelectorAll('.marquee')].filter(m => m.getBoundingClientRect().width > 0).map(m => {
    const lists = m.querySelectorAll('.marquee-track > *'); const copyW = lists[0]?.getBoundingClientRect().width || 0;
    const mw = m.getBoundingClientRect().width;
    return { label: m.getAttribute('aria-label'), mw: Math.round(mw), copyW: Math.round(copyW), copies: lists.length,
      ok: (lists.length - 1) * copyW >= mw - 1 };
  });
  return { vw, vh, menuInset, frameL: Math.round(frameL), frameR: Math.round(frameR), frameW: Math.round(frameR - frameL),
    overflowX: document.documentElement.scrollWidth > vw + 1, sections, hero, marquees };
}
"""

OVERLAP = r"""
() => {
  const vw = document.documentElement.clientWidth;
  const fixed = [...document.querySelectorAll('body *')].filter(el => {
    const s = getComputedStyle(el); if (s.position !== 'fixed' || s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
    if (el.closest('header')) return false;
    const r = el.getBoundingClientRect(); return r.width > 20 && r.height > 20 && r.width < vw * 0.9 && r.bottom > 0 && r.top < innerHeight;
  });
  const top = fixed.filter(el => !fixed.some(o => o !== el && o.contains(el)));
  const footer = document.querySelector('footer'); if (!footer) return [];
  const targets = [...footer.querySelectorAll('img, a, p, span, h2, h3, li')].filter(el => el.children.length === 0 || el.tagName === 'IMG');
  const out = [];
  for (const f of top) {
    const fr = f.getBoundingClientRect();
    const hits = [];
    for (const t of targets) {
      const r = t.getBoundingClientRect(); if (r.width < 1) continue;
      const ix = Math.min(fr.right, r.right) - Math.max(fr.left, r.left), iy = Math.min(fr.bottom, r.bottom) - Math.max(fr.top, r.top);
      if (ix > 2 && iy > 2) hits.push((t.innerText || t.getAttribute('alt') || t.tagName).trim().slice(0, 30));
    }
    if (hits.length) out.push({ widget: (f.innerText || f.getAttribute('aria-label') || f.className).toString().trim().replace(/\s+/g, ' ').slice(0, 40),
      rect: [Math.round(fr.left), Math.round(fr.top), Math.round(fr.width), Math.round(fr.height)], hits: [...new Set(hits)].slice(0, 6) });
  }
  return out;
}
"""


async def run_one(browser, base, name, w, h, path, outdir, shots):
    ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
    await ctx.add_init_script(QUIET)
    pg = await ctx.new_page()
    res = {"viewport": name, "w": w, "h": h, "path": path}
    try:
        t0 = time.time()
        await pg.goto(base + path, wait_until="load", timeout=90000)
        await pg.wait_for_timeout(1200)
        # walk the page so lazy/reveal content is laid out
        total = await pg.evaluate("document.documentElement.scrollHeight")
        y = 0
        while y < total:
            y += h
            await pg.evaluate(f"window.scrollTo(0,{y})")
            await pg.wait_for_timeout(120)
        await pg.wait_for_timeout(500)
        res["overlap_bottom"] = await pg.evaluate(OVERLAP)
        if shots:
            await pg.screenshot(path=os.path.join(outdir, f"{slug(name)}{slug(path)}-bottom.png"))
        await pg.evaluate("window.scrollTo(0,0)")
        await pg.wait_for_timeout(700)
        res.update(await pg.evaluate(MEASURE))
        if shots:
            await pg.screenshot(path=os.path.join(outdir, f"{slug(name)}{slug(path)}-top.png"))
            if path == "/contact-us" or path == "/":
                # the contact/enquiry form section
                ok = await pg.evaluate("""() => { const f = document.querySelector('main form'); if (!f) return false;
                    f.scrollIntoView({block:'center'}); return true; }""")
                if ok:
                    await pg.wait_for_timeout(700)
                    await pg.screenshot(path=os.path.join(outdir, f"{slug(name)}{slug(path)}-form.png"))
        res["secs"] = round(time.time() - t0, 1)
    except Exception as e:  # noqa
        res["error"] = str(e)[:300]
    await ctx.close()
    return res


def slug(s):
    return "".join(c if c.isalnum() else "_" for c in s).strip("_") + "_"


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base"); ap.add_argument("out")
    ap.add_argument("--shots", action="store_true")
    ap.add_argument("--only", default="")
    ap.add_argument("--pages", default="")
    ap.add_argument("--jobs", type=int, default=3)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    vps = [v for v in VIEWPORTS if not a.only or v[0] in a.only.split(",")]
    pages = a.pages.split(",") if a.pages else PAGES
    jobs = [(v, p) for v in vps for p in pages]
    results = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium")
        sem = asyncio.Semaphore(a.jobs)

        async def go(v, pth):
            async with sem:
                r = await run_one(b, a.base, v[0], v[1], v[2], pth, a.out, a.shots)
                results.append(r)
                bad = [s for s in r.get("sections", []) if s["outL"] > 4 or s["outR"] > 4]
                print(json.dumps({"vp": v[0], "path": pth, "err": r.get("error"), "frameW": r.get("frameW"),
                                  "outside": len(bad), "worst": max([max(s["outL"], s["outR"]) for s in bad], default=0),
                                  "gap": (r.get("hero") or {}).get("gap"), "heroFits": (r.get("hero") or {}).get("fits"),
                                  "heroH": (r.get("hero") or {}).get("height"),
                                  "slideTop": (r.get("hero") or {}).get("minSlideTop"), "slideBottom": (r.get("hero") or {}).get("minSlideBottom"),
                                  "globeTop": (r.get("hero") or {}).get("globeTopClear"), "globeBottom": (r.get("hero") or {}).get("globeBottomClear"),
                                  "globeW": ((r.get("hero") or {}).get("globe") or {}).get("w"),
                                  "overflowX": r.get("overflowX"), "overlap": len(r.get("overlap_bottom") or []),
                                  "marqueeShort": sum(1 for m in r.get("marquees", []) if not m["ok"])}), flush=True)

        await asyncio.gather(*(go(v, pth) for v, pth in jobs))
        await b.close()
    json.dump(results, open(os.path.join(a.out, "wide_qa.json"), "w"), indent=1)


asyncio.run(main())
