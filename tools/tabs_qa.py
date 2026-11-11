#!/usr/bin/env python3
"""QA for the docked section tab bar (HeroTabs): docking, scroll-spy, click offsets. Usage: tabs_qa.py PATH [WIDTH]"""
import asyncio, json, sys
from playwright.async_api import async_playwright

import os
BASE = os.environ.get("BASE", "http://127.0.0.1:3000")


async def main(path, width):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": width, "height": 900 if width > 600 else 844})
        await pg.goto(BASE + path, wait_until="networkidle")
        await pg.wait_for_timeout(600)
        dock = pg.locator('nav[aria-label="On this page (pinned)"]')
        state = lambda: pg.evaluate("""() => {
          const d = document.querySelector('nav[aria-label="On this page (pinned)"]');
          const cur = [...d.querySelectorAll('button')].filter(b => b.getAttribute('aria-current')).map(b => b.textContent);
          return {opacity: getComputedStyle(d).opacity, hidden: d.getAttribute('aria-hidden'), top: d.getBoundingClientRect().top, h: d.getBoundingClientRect().height, active: cur, y: scrollY};
        }""")
        out = {"initial": await state()}
        await pg.mouse.wheel(0, 1400)
        await pg.wait_for_timeout(900)
        out["after_scroll_down"] = await state()
        await pg.screenshot(path=f"/tmp/q/tabs-{width}-docked.png")
        labels = await dock.locator("button").all_text_contents()
        ids = await dock.locator("button").evaluate_all("bs => bs.map(b => b.dataset.target)")
        clicks = []
        for i in range(len(ids)):
            pre = await state()
            try:
                await dock.locator("button").nth(i).click(timeout=4000)
            except Exception as e:
                clicks.append({"label": labels[i], "error": str(e).splitlines()[0], "pre": pre})
                continue
            await pg.wait_for_timeout(1300)
            r = await pg.evaluate("""(id) => { const el = document.getElementById(id); return el ? Math.round(el.getBoundingClientRect().top) : null }""", ids[i])
            st = await state()
            clicks.append({"label": labels[i], "id": ids[i], "targetTop": r, "dockBottom": round(st["top"] + st["h"]), "active": st["active"]})
        out["clicks"] = clicks
        await pg.screenshot(path=f"/tmp/q/tabs-{width}-clicked.png")
        await pg.mouse.wheel(0, -700)
        await pg.wait_for_timeout(900)
        out["after_scroll_up"] = await state()
        await pg.evaluate("scrollTo(0,0)")
        await pg.wait_for_timeout(800)
        out["back_top"] = await state()
        print(json.dumps(out, indent=1))
        await b.close()


asyncio.run(main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 1440))
