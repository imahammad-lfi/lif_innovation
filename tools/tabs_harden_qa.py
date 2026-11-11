"""QA for in-page HeroTabs and contact preselection.

usage: python3 tools/tabs_harden_qa.py <base> <width> <path> [<path> ...]
For each page: click every docked tab (checks the target lands just below the dock), jump back to the
top instantly and confirm the dock is hidden and no tab is active, and report the preselected
Area of interest value.
"""
import asyncio
import json
import sys

from playwright.async_api import async_playwright

BASE, WIDTH, PATHS = sys.argv[1].rstrip("/"), int(sys.argv[2]), sys.argv[3:]

STATE = """() => {
  const dock = document.querySelector('nav[aria-label="On this page (pinned)"]');
  const cs = dock ? getComputedStyle(dock) : null;
  const act = [...document.querySelectorAll('nav[aria-label^="On this page"] [aria-current="location"]')].map(b => b.dataset.target);
  return { dockVisible: cs ? cs.visibility !== 'hidden' && +cs.opacity > 0.05 : null, active: act, y: Math.round(scrollY) };
}"""


async def check(page, path):
    out = {"path": path, "width": WIDTH, "landings": [], "problems": []}
    await page.goto(BASE + path, wait_until="networkidle", timeout=90000)
    await page.wait_for_timeout(600)
    targets = await page.eval_on_selector_all('nav[aria-label="On this page"] button[data-target]', "els => els.map(e => e.dataset.target)")
    out["tabs"] = targets
    sel = await page.evaluate("() => document.querySelector('[id^=cf-][id$=-service]')?.value ?? null")
    out["preselected"] = sel
    if not targets:
        return out
    # dock by scrolling past the hero
    await page.evaluate("() => window.scrollTo(0, innerHeight * 1.2)")
    await page.wait_for_timeout(500)
    for t in targets:
        btn = page.locator(f'nav[aria-label="On this page (pinned)"] button[data-target="{t}"]')
        try:
            await btn.scroll_into_view_if_needed(timeout=3000)
            await btn.click(timeout=5000)
        except Exception as e:  # noqa: BLE001
            out["problems"].append(f"click {t}: {str(e)[:120]}")
            continue
        await page.wait_for_timeout(1500)
        r = await page.evaluate(
            """(t) => { const el = document.getElementById(t); const dock = document.querySelector('nav[aria-label="On this page (pinned)"] > div');
            const db = dock.getBoundingClientRect().bottom; const top = el.getBoundingClientRect().top;
            const max = document.documentElement.scrollHeight - innerHeight; return { top: Math.round(top), dockBottom: Math.round(db), atEnd: scrollY >= max - 2 }; }""",
            t,
        )
        st = await page.evaluate(STATE)
        delta = r["top"] - r["dockBottom"]
        ok = (-4 <= delta <= 6) or (r["atEnd"] and delta >= -4)
        out["landings"].append({"t": t, "delta": delta, "atEnd": r["atEnd"], "active": st["active"]})
        if not ok:
            out["problems"].append(f"landing {t}: delta {delta}")
        if t not in st["active"]:
            out["problems"].append(f"active after click {t}: {st['active']}")
    # instant return to top
    await page.evaluate("() => window.scrollTo({ top: 0, behavior: 'instant' })")
    await page.wait_for_timeout(120)
    st = await page.evaluate(STATE)
    out["top_state"] = st
    if st["dockVisible"]:
        out["problems"].append("dock visible at top")
    if st["active"]:
        out["problems"].append(f"active at top: {st['active']}")
    await page.screenshot(path=f"/tmp/tabsqa/{path.strip('/').replace('/', '_') or 'home'}-{WIDTH}-top.png")
    return out


async def main():
    import os

    os.makedirs("/tmp/tabsqa", exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium")
        ctx = await b.new_context(viewport={"width": WIDTH, "height": 900 if WIDTH > 600 else 844})
        page = await ctx.new_page()
        results = []
        for path in PATHS:
            try:
                results.append(await check(page, path))
            except Exception as e:  # noqa: BLE001
                results.append({"path": path, "width": WIDTH, "problems": [f"error {str(e)[:160]}"]})
        await b.close()
    for r in results:
        print(("OK  " if not r.get("problems") else "FAIL"), r["path"], WIDTH, "preselect=", r.get("preselected"), "tabs=", len(r.get("tabs", [])))
        for pr in r.get("problems", []):
            print("     -", pr)
    json.dump(results, open(f"/tmp/tabsqa/result-{WIDTH}.json", "w"), indent=1)


asyncio.run(main())
