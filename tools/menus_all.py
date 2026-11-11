#!/usr/bin/env python3
"""Screenshot every desktop mega menu. Usage: BASE=http://127.0.0.1:3001 menus_all.py OUTDIR [width]"""
import asyncio, sys, os
from playwright.async_api import async_playwright
BASE = os.environ.get("BASE", "http://127.0.0.1:3001")
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/mn"
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1440
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": W, "height": 900})
        await pg.goto(BASE + "/company/about-us", wait_until="networkidle")
        await pg.add_style_tag(content="[data-atf-popup]{display:none!important}")
        btns = pg.locator('nav[aria-label="Main"] button')
        n = await btns.count()
        for i in range(n):
            label = (await btns.nth(i).inner_text()).strip()
            await btns.nth(i).hover(); await pg.wait_for_timeout(1300)
            slug = label.lower().replace(" & ", "-").replace(" ", "-")
            await pg.screenshot(path=f"{OUT}/menu-{slug}-{W}.png")
            await pg.mouse.move(W // 2, 880); await pg.wait_for_timeout(500)
            print("captured", label)
        await b.close()
asyncio.run(main())
