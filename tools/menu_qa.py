#!/usr/bin/env python3
"""Screenshot the desktop mega menus (hover) and mobile drawer accordions. Usage: menu_qa.py OUTDIR"""
import asyncio, sys
from playwright.async_api import async_playwright

import os
BASE = os.environ.get("BASE", "http://127.0.0.1:3000")
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/q"


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1440, "height": 900})
        await pg.goto(BASE + "/about-us", wait_until="networkidle")
        for label, name in (("Industries", "menu-industries"), ("Products & Accelerators", "menu-products")):
            await pg.locator('nav[aria-label="Main"] button', has_text=label).hover()
            await pg.wait_for_timeout(1200)
            await pg.screenshot(path=f"{OUT}/{name}-1440.png")
            await pg.mouse.move(700, 880)
            await pg.wait_for_timeout(500)
        m = await b.new_page(viewport={"width": 390, "height": 844})
        await m.goto(BASE + "/about-us", wait_until="networkidle")
        await m.locator('button[aria-label*="menu" i]').first.click()
        await m.wait_for_timeout(700)
        await m.locator('[role="dialog"] button[aria-label="Expand Industries"]').click()
        await m.wait_for_timeout(500)
        await m.locator('[role="dialog"] button[aria-label="Expand BFSI"]').click()
        await m.wait_for_timeout(600)
        await m.screenshot(path=f"{OUT}/drawer-industries-390.png")
        await m.locator('[role="dialog"] button[aria-label="Collapse Industries"]').click()
        await m.locator('[role="dialog"] button[aria-label="Expand Products & Accelerators"]').click()
        await m.wait_for_timeout(500)
        await m.locator('[role="dialog"] button[aria-label="Expand Data & AI"]').last.click()
        await m.wait_for_timeout(600)
        await m.screenshot(path=f"{OUT}/drawer-products-390.png")
        await b.close()


asyncio.run(main())
