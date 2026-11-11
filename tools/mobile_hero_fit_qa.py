"""Mobile hero fit: globe size and, for every slide, the gap between the bottom of the copy/CTA and the slide dots.
    python3 tools/mobile_hero_fit_qa.py <base-url>
"""
import asyncio, json, sys
from playwright.async_api import async_playwright

BASE = sys.argv[1].rstrip("/")
SIZES = [(320, 568), (360, 740), (375, 667), (390, 844), (412, 915), (430, 932), (480, 900), (600, 960), (768, 1024)]
JS = """() => {
  const hero = document.querySelector('section[aria-label="Linkfields highlights"]');
  const hr = hero.getBoundingClientRect();
  const globe = hero.querySelector('.globe-mask');
  const g = globe ? globe.getBoundingClientRect() : null;
  const header = document.querySelector('header'); const hb = header ? header.getBoundingClientRect().bottom : 0;
  const dots = [...hero.querySelectorAll('button[aria-label^="Go to"], [role=tab]')].map(b => b.getBoundingClientRect().top);
  const dotsTop = dots.length ? Math.min(...dots) : null;
  const slides = [...hero.querySelectorAll('[data-carousel-hold]')].filter((s) => !s.querySelector('button[aria-label^="Go to"]')).map((s) => {
    let bottom = 0, right = 0;
    s.querySelectorAll('*').forEach((e) => { const r = e.getBoundingClientRect(); if (r.width && r.height && getComputedStyle(e).display !== 'none') { bottom = Math.max(bottom, r.bottom); right = Math.max(right, r.right); } });
    return { top: Math.round(s.getBoundingClientRect().top - hr.top), bottom: Math.round(bottom - hr.top), right: Math.round(right) };
  });
  return { vw: innerWidth, heroH: Math.round(hr.height), headerBottom: Math.round(hb),
           globe: g ? { size: Math.round(g.width), top: Math.round(g.top - hr.top), bottom: Math.round(g.bottom - hr.top) } : null,
           dotsTop: dotsTop === null ? null : Math.round(dotsTop - hr.top), slides };
}"""


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium")
        for w, h in SIZES:
            ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2, is_mobile=True, has_touch=True)
            await ctx.add_init_script("try{sessionStorage.setItem('lf-promo-v2:atf-2026','closed')}catch(e){}")
            pg = await ctx.new_page()
            await pg.goto(BASE + "/", wait_until="networkidle")
            await pg.wait_for_timeout(400)
            d = await pg.evaluate(JS)
            gaps = [d["dotsTop"] - s["bottom"] for s in d["slides"]] if d["dotsTop"] is not None else []
            gap_globe = [s["top"] - d["globe"]["bottom"] for s in d["slides"]] if d["globe"] else []
            print(json.dumps({"vp": f"{w}x{h}", "heroH": d["heroH"], "globe": d["globe"], "dotsTop": d["dotsTop"],
                              "slide_bottoms": [s["bottom"] for s in d["slides"]], "min_gap_to_dots": min(gaps) if gaps else None,
                              "globe_to_copy": min(gap_globe) if gap_globe else None, "max_right": max(s["right"] for s in d["slides"])}))
            await ctx.close()
        await b.close()

asyncio.run(main())
