"""ATF pop-up verification across phones, tablets and desktop.
Per device: auto-open timing, portrait visible + loaded, badge row single-line, actions on screen without scrolling,
no horizontal overflow / clipped button text, end-of-scroll content not hidden behind the pinned bar, close -> pill.
    python3 tools/promo_popup_qa.py <base-url> <out-dir>
"""
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright

BASE = sys.argv[1].rstrip("/")
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
DEVICES = [("webkit", "iPhone SE"), ("webkit", "iPhone 14"), ("webkit", "iPhone 15 Pro Max"), ("chromium", "Pixel 7"),
           ("chromium", "Galaxy S9+"), ("webkit", "iPad Mini"), ("chromium", "Galaxy Tab S4"), ("chromium", "Desktop 1440")]

STATE = """() => {
  const d = document.querySelector('[data-event-promo=dialog]');
  if (!d) return null;
  const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const fig = d.querySelector('[data-promo-portrait]');
  const figImg = fig ? fig.querySelector('img') : null;
  const deskImg = [...d.querySelectorAll('img')].find(i => i.closest('figure') !== fig && i.getAttribute('alt') && i.getBoundingClientRect().width > 200);
  const pill = d.querySelector('span.rounded-full.whitespace-nowrap');
  const eyebrow = pill ? pill.parentElement.querySelector('span.mt-1\\\\.5') : null;
  const bar = d.querySelector('[data-promo-actions]');
  const btns = bar ? [...bar.querySelectorAll('a')].filter(vis) : [];
  const vh = window.innerHeight, vw = window.innerWidth;
  return {
    sheet: (() => { const r = d.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), scrollH: d.scrollHeight, overflowX: d.scrollWidth > d.clientWidth + 1 }; })(),
    portrait: fig ? { shown: vis(fig), img: figImg ? { w: Math.round(figImg.getBoundingClientRect().width), loaded: figImg.complete && figImg.naturalWidth > 0 } : null } : null,
    desktopPhoto: deskImg ? { shown: vis(deskImg), loaded: deskImg.complete && deskImg.naturalWidth > 0, w: Math.round(deskImg.getBoundingClientRect().width) } : null,
    pillH: pill ? Math.round(pill.getBoundingClientRect().height) : null,
    eyebrowH: eyebrow ? Math.round(eyebrow.getBoundingClientRect().height) : null,
    buttons: btns.map(b => { const r = b.getBoundingClientRect(); return { text: b.innerText.trim(), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width), onScreen: r.top >= 0 && r.bottom <= vh && r.left >= 0 && r.right <= vw, clipped: b.scrollWidth > b.clientWidth + 1 }; }),
    barTop: bar ? Math.round(bar.getBoundingClientRect().top) : null,
    vh, vw,
  };
}"""

END = """() => {
  const d = document.querySelector('[data-event-promo=dialog]');
  d.scrollTop = d.scrollHeight;
  return new Promise(r => setTimeout(() => {
    const bar = d.querySelector('[data-promo-actions]');
    const barTop = bar.getBoundingClientRect().top;
    const cal = [...d.querySelectorAll('a[download]')].find(a => getComputedStyle(a).display !== 'none' && !bar.contains(a));
    const cd = d.querySelector('[role=timer], [aria-live]');
    const lastBottom = cal ? cal.getBoundingClientRect().bottom : null;
    r({ scrolled: Math.round(d.scrollTop), calendarVisible: cal ? (lastBottom <= barTop + 1) : 'desktop-in-bar', calendarBottom: lastBottom && Math.round(lastBottom), barTop: Math.round(barTop),
        barBottom: Math.round(bar.getBoundingClientRect().bottom), vh: innerHeight });
  }, 350));
}"""


async def run(p, engine, name):
    b = await (p.webkit.launch() if engine == "webkit" else p.chromium.launch(executable_path="/usr/bin/chromium"))
    opts = p.devices[name] if name in p.devices else {"viewport": {"width": 1440, "height": 900}}
    ctx = await b.new_context(**opts)
    pg = await ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
    t0 = time.time()
    await pg.goto(BASE + "/", wait_until="load")
    opened_at = None
    for _ in range(120):
        if await pg.locator("[data-event-promo=dialog]").count():
            opened_at = round(time.time() - t0, 1)
            break
        await pg.wait_for_timeout(100)
    res = {"device": name, "engine": engine, "auto_open_s": opened_at}
    if opened_at is None:
        res["pill_instead"] = bool(await pg.locator("[data-event-promo=pill]").count())
    else:
        await pg.wait_for_timeout(1500)  # animation + image load
        res["open"] = await pg.evaluate(STATE)
        tag = name.replace(" ", "_")
        await pg.screenshot(path=f"{OUT}/{tag}-open.png")
        res["end"] = await pg.evaluate(END)
        await pg.screenshot(path=f"{OUT}/{tag}-end.png")
        await pg.keyboard.press("Escape")
        await pg.wait_for_timeout(700)
        res["after_close"] = {"dialog": bool(await pg.locator("[data-event-promo=dialog]").count()), "pill": bool(await pg.locator("[data-event-promo=pill]").count())}
    res["errors"] = errs
    await ctx.close()
    await b.close()
    return res


def verdict(r):
    issues = []
    if r["auto_open_s"] is None:
        return ["did not auto-open"]
    o = r["open"]
    phone = o["vw"] < 768
    if phone:
        if not (o["portrait"] and o["portrait"]["shown"] and o["portrait"]["img"] and o["portrait"]["img"]["loaded"]):
            issues.append("portrait not shown/loaded")
        if not all(b["onScreen"] for b in o["buttons"]) or len(o["buttons"]) < 2:
            issues.append("actions not on screen at open")
        if r["end"]["calendarVisible"] is not True:
            issues.append("calendar link hidden behind bar at end")
    else:
        if not (o["desktopPhoto"] and o["desktopPhoto"]["shown"] and o["desktopPhoto"]["loaded"]):
            issues.append("desktop photo not shown")
        if o["portrait"] and o["portrait"]["shown"]:
            issues.append("mobile portrait visible on large screen")
    if o["sheet"]["overflowX"]:
        issues.append("horizontal overflow")
    if any(b["clipped"] for b in o["buttons"]):
        issues.append("button text clipped")
    if o["pillH"] and o["pillH"] > 24:
        issues.append(f"badge pill wraps ({o['pillH']}px)")
    if o["eyebrowH"] and o["eyebrowH"] > 20:
        issues.append(f"eyebrow wraps ({o['eyebrowH']}px)")
    if not r["after_close"]["pill"] or r["after_close"]["dialog"]:
        issues.append("close did not leave the reminder pill")
    if r["errors"]:
        issues.append("page errors")
    return issues


async def main():
    async with async_playwright() as p:
        allres = []
        for engine, name in DEVICES:
            r = await run(p, engine, name)
            r["issues"] = verdict(r)
            allres.append(r)
            o = r.get("open") or {}
            print(f"{name:18} open {r['auto_open_s']}s  sheet {o.get('sheet')}  portrait {o.get('portrait')}  desk {o.get('desktopPhoto')}  pill {o.get('pillH')} eyebrow {o.get('eyebrowH')}", flush=True)
            print(f"{'':18} buttons {[(b['text'], b['w'], b['bottom'], b['onScreen']) for b in o.get('buttons', [])]} vh {o.get('vh')}  end {r.get('end')}  close {r.get('after_close')}", flush=True)
            print(f"{'':18} ISSUES: {r['issues'] or 'none'}", flush=True)
        json.dump(allres, open(f"{OUT}/promo_verify.json", "w"), indent=1)

asyncio.run(main())
