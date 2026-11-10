"""QA for the 9 Nov round: all five mega menus, the ATF pop-up (desktop), the reminder pill and the mobile banner/sheet,
plus the mobile drawer Solutions/Company accordions. Usage: atf_menu_qa.py BASE OUTDIR"""
import asyncio
import json
import sys

from playwright.async_api import async_playwright

BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://127.0.0.1:3000"
OUT = sys.argv[2] if len(sys.argv) > 2 else "/tmp/atfqa"
GROUPS = ["Services", "Solutions", "Products & Accelerators", "Industries", "Company"]
CLOSED = "try { localStorage.setItem('lf-promo:atf-2026', 'closed') } catch (e) {}"


async def main():
    import os

    os.makedirs(OUT, exist_ok=True)
    report = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])

        # 1) Mega menus with the promo suppressed
        ctx = await b.new_context(viewport={"width": 1440, "height": 900})
        await ctx.add_init_script(CLOSED)
        pg = await ctx.new_page()
        await pg.goto(BASE + "/company/about-us", wait_until="networkidle")
        for label in GROUPS:
            await pg.locator('nav[aria-label="Main"] button', has_text=label).first.hover()
            await pg.wait_for_timeout(900)
            name = label.lower().replace(" & ", "-").replace(" ", "-")
            await pg.screenshot(path=f"{OUT}/menu-{name}.png")
            # tile metrics: background colour, radius and top hairline presence for every tile in the open menu
            report[label] = await pg.evaluate(
                """() => {
                  const r = document.querySelector('[role=region][aria-label$=" menu"]');
                  if (!r) return null;
                  const tiles = [...r.querySelectorAll('.acc-tile')];
                  return tiles.map(t => { const cs = getComputedStyle(t);
                    return [cs.backgroundColor, cs.borderRadius, getComputedStyle(t).getPropertyValue('--acc').trim()]; });
                }"""
            )
            await pg.mouse.move(700, 880)
            await pg.wait_for_timeout(400)
        await ctx.close()

        # 2) Desktop pop-up opens after the delay, then the pill after dismissal
        ctx = await b.new_context(viewport={"width": 1440, "height": 900})
        pg = await ctx.new_page()
        await pg.goto(BASE + "/", wait_until="networkidle")
        await pg.wait_for_timeout(5500)
        dlg = pg.locator('[data-event-promo="dialog"]')
        report["dialog_visible_desktop"] = await dlg.is_visible()
        await pg.screenshot(path=f"{OUT}/popup-1440.png")
        report["dialog_title"] = await pg.locator('[data-event-promo="dialog"] h2').first.inner_text() if report["dialog_visible_desktop"] else None
        await pg.keyboard.press("Escape")
        await pg.wait_for_timeout(700)
        report["pill_after_escape"] = await pg.locator('[data-event-promo="pill"]').is_visible()
        report["storage_after_escape"] = await pg.evaluate("() => localStorage.getItem('lf-promo:atf-2026')")
        await pg.screenshot(path=f"{OUT}/pill-1440.png")
        await pg.reload(wait_until="networkidle")
        await pg.wait_for_timeout(5500)
        report["dialog_after_reload"] = await pg.locator('[data-event-promo="dialog"]').is_visible()
        report["pill_after_reload"] = await pg.locator('[data-event-promo="pill"]').is_visible()
        # excluded on the contact page
        await pg.goto(BASE + "/contact-us", wait_until="networkidle")
        await pg.wait_for_timeout(1500)
        report["pill_on_contact"] = await pg.locator('[data-event-promo="pill"]').count()
        await ctx.close()

        # 3) Mobile: banner only (no auto interstitial), opens the sheet on tap
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page()
        await pg.goto(BASE + "/", wait_until="networkidle")
        await pg.wait_for_timeout(5500)
        report["mobile_dialog_auto"] = await pg.locator('[data-event-promo="dialog"]').is_visible()
        report["mobile_pill"] = await pg.locator('[data-event-promo="pill"]').is_visible()
        await pg.screenshot(path=f"{OUT}/pill-390.png")
        await pg.locator('[data-event-promo="pill"] button[aria-haspopup="dialog"]').click()
        await pg.wait_for_timeout(900)
        await pg.screenshot(path=f"{OUT}/sheet-390.png")
        report["mobile_sheet_open"] = await pg.locator('[data-event-promo="dialog"]').is_visible()
        await ctx.close()

        # 4) Mobile drawer accordions for Solutions and Company
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        await ctx.add_init_script(CLOSED)
        m = await ctx.new_page()
        await m.goto(BASE + "/company/about-us", wait_until="networkidle")
        await m.locator('button[aria-label*="menu" i]').first.click()
        await m.wait_for_timeout(600)
        await m.locator('[role="dialog"] nav button[aria-expanded]', has_text="Solutions").first.click()
        await m.wait_for_timeout(600)
        await m.screenshot(path=f"{OUT}/drawer-solutions-390.png")
        await m.locator('[role="dialog"] nav button[aria-expanded]', has_text="Solutions").first.click()
        await m.locator('[role="dialog"] nav button[aria-expanded]', has_text="Company").first.click()
        await m.wait_for_timeout(600)
        await m.screenshot(path=f"{OUT}/drawer-company-390.png")
        await ctx.close()
        await b.close()
    print(json.dumps(report, indent=1))


asyncio.run(main())
