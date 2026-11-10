#!/usr/bin/env python3
"""Side-by-side screenshot of the live original (left) and our local build (right).

usage: cmp.py <path> <out.png> [--width 390] [--height 1600] [--y 0] [--local http://127.0.0.1:3000]
Scrolls the whole page first (lazy images), then captures the region [y, y+height) of both pages.
"""
import argparse, asyncio
from PIL import Image
from playwright.async_api import async_playwright

SCROLL = """async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); }
 const imgs=[...document.images]; await Promise.race([Promise.all(imgs.map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r;}))), new Promise(r=>setTimeout(r,15000))]); window.scrollTo(0,0); await document.fonts.ready; await new Promise(r=>setTimeout(r,500)); await document.fonts.ready; }"""

async def grab(b, url, a, out):
    pg = await b.new_page(viewport={"width": a.width, "height": 900})
    await pg.goto(url, wait_until="load", timeout=120000); await pg.wait_for_timeout(3500)
    await pg.evaluate(SCROLL)
    await pg.wait_for_timeout(1200)
    full = await pg.evaluate("document.documentElement.scrollHeight")
    h = max(1, min(a.height, full - a.y))
    await pg.screenshot(path=out, full_page=True, clip={"x": 0, "y": a.y, "width": a.width, "height": h})
    await pg.close()
    return full

async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path"); ap.add_argument("out")
    ap.add_argument("--width", type=int, default=390); ap.add_argument("--height", type=int, default=1600)
    ap.add_argument("--y", type=int, default=0); ap.add_argument("--local", default="http://127.0.0.1:3000")
    a = ap.parse_args()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        f1 = await grab(b, "https://www.linkfields.com" + a.path, a, "/tmp/_cmp_l.png")
        f2 = await grab(b, a.local + a.path, a, "/tmp/_cmp_r.png")
        await b.close()
    l, r = Image.open("/tmp/_cmp_l.png"), Image.open("/tmp/_cmp_r.png")
    c = Image.new("RGB", (l.width + r.width + 16, max(l.height, r.height)), "red")
    c.paste(l, (0, 0)); c.paste(r, (l.width + 16, 0))
    if c.width > 1600:
        c = c.resize((c.width // 2, c.height // 2))
    c.save(a.out)
    print(f"original page height {f1}px, ours {f2}px -> {a.out}")

asyncio.run(main())
