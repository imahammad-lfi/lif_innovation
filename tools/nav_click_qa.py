#!/usr/bin/env python3
"""Click-through navigation QA: clicks every desktop mega-menu link, every mobile-drawer link and every internal
footer link the way a visitor would, then checks the destination:
  * the URL path (and query) is the link's target;
  * a link with a #section lands with that section's top just below the fixed header / pinned tab bar
    (same rule as anchor_qa.py: -3 px <= delta <= 6 px);
  * a link without a #section opens the page at the top (scrollY <= 2).
usage: nav_click_qa.py BASE OUT.json [--only menu|drawer|footer]
"""
import argparse
import asyncio
import json
from urllib.parse import urlsplit

from playwright.async_api import async_playwright

GROUPS = ["Services", "Solutions", "Products & Accelerators", "Industries", "Company"]
MATCH = None
QUIET = "try{sessionStorage.setItem('lf-promo-v2:atf-2026','closed')}catch(e){}"
MEASURE = """(id) => {
  if (!id) return { y: Math.round(scrollY) };
  const pick = (sel) => [...document.querySelectorAll(sel)].find(e => e.getClientRects().length) || null;
  const el = pick('[id="' + CSS.escape(id) + '"]');
  if (!el) return { missing: true, y: Math.round(scrollY) };
  const header = document.querySelector('header');
  const bar = header && header.firstElementChild;
  const hb = bar ? bar.getBoundingClientRect().bottom : 0;
  const dock = pick('nav[aria-label="On this page (pinned)"]');
  let db = 0;
  if (dock) { const cs = getComputedStyle(dock); if (cs.visibility === 'visible' && +cs.opacity > 0.5) db = dock.getBoundingClientRect().bottom; }
  const chrome = Math.max(hb, db);
  const top = el.getBoundingClientRect().top;
  const dockState = dock ? `${getComputedStyle(dock).visibility}/${(+getComputedStyle(dock).opacity).toFixed(2)}/${Math.round(dock.getBoundingClientRect().bottom)}` : 'none';
  return { delta: Math.round(top - chrome), y: Math.round(scrollY), top: Math.round(top), header: Math.round(hb), dock: dockState,
           dialogs: document.querySelectorAll('[role="dialog"]').length };
}"""


def judge(frag, m):
    if frag:
        return (not m.get("missing")) and -3 <= m.get("delta", 99) <= 6
    return m.get("y", 99) <= 2


async def settle(pg, href):
    u = urlsplit(href)
    want = u.path or "/"
    await pg.wait_for_function("(p) => location.pathname === p", arg=want, timeout=45000)
    await pg.wait_for_load_state("load")
    await pg.wait_for_timeout(1900)
    m = await pg.evaluate(MEASURE, u.fragment or "")
    m["url"] = await pg.evaluate("location.pathname + location.search + location.hash")
    q_ok = (not u.query) or (("?" + u.query) in m["url"])
    return judge(u.fragment, m) and q_ok, m


async def run_menu(b, base, res):
    ctx = await b.new_context(viewport={"width": 1440, "height": 900})
    await ctx.add_init_script(QUIET)
    pg = await ctx.new_page()
    await pg.goto(base + "/company/about-us", wait_until="load")
    for g in GROUPS:
        trig = pg.locator('nav[aria-label="Main"] button', has_text=g).first
        await trig.hover()
        region = pg.locator('[role=region][aria-label$=" menu"]')
        await region.wait_for(state="visible")
        hrefs = await region.locator("a[href]").evaluate_all("els => els.map(e => [e.getAttribute('href'), e.innerText.trim().split('\\n')[0]])")
        for i, (href, text) in enumerate(hrefs):
            if not href or not href.startswith("/") or (MATCH and MATCH not in href):
                continue
            ok, m = False, {}
            try:
                await pg.mouse.move(10, 600)
                await pg.wait_for_timeout(250)
                await pg.locator('nav[aria-label="Main"] button', has_text=g).first.hover()
                await region.wait_for(state="visible")
                await region.locator("a[href]").nth(i).click()
                ok, m = await settle(pg, href)
            except Exception as e:  # noqa: BLE001
                m = {"error": str(e)[:140]}
            res.append({"where": f"menu:{g}", "text": text, "href": href, "ok": ok, **m})
            print("menu  ", "OK " if ok else "XX ", g, "|", text, "->", href, m.get("delta", m.get("y")), m.get("error", ""), flush=True)
    await ctx.close()


# The drawer mounts an accordion panel the first time it is expanded, so links are discovered by expanding every
# group and item first (depth-first, real clicks on each level), then recording each link's chain of panel ids.
DRAWER_JS = """
const nav = document.querySelector('[role="dialog"] nav[aria-label="Mobile"]');
const isPanel = (el) => el.id && nav.querySelector(`button[aria-controls="${CSS.escape(el.id)}"]`);
const panelOf = (el) => { for (let p = el.parentElement; p && p !== nav; p = p.parentElement) if (isPanel(p)) return p; return null; };
const chain = (el) => { const ids = []; for (let p = panelOf(el); p; p = panelOf(p)) ids.unshift(p.id); return ids; };
const label = (pid) => { const b = nav.querySelector(`button[aria-controls="${CSS.escape(pid)}"]`); return (b.innerText.trim().split('\\n')[0] || b.getAttribute('aria-label') || '').replace(/^(Expand|Collapse) /, ''); };
"""
EXPAND_ALL = "async () => {" + DRAWER_JS + """
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const seen = new Set();
  async function within(root) {
    const btns = [...root.querySelectorAll('button[aria-controls]')].filter((b) => (panelOf(b) || nav) === root);
    for (const b of btns) {
      const pid = b.getAttribute('aria-controls');
      if (seen.has(pid)) continue;
      seen.add(pid);
      if (b.getAttribute('aria-expanded') !== 'true') { b.click(); await wait(80); }
      const panel = document.getElementById(pid);
      if (panel) await within(panel);
    }
  }
  await within(nav);
  return seen.size;
}"""
COLLECT = "() => {" + DRAWER_JS + """
  return [...nav.querySelectorAll('a[href]')].map((a) => {
    const ids = chain(a);
    const box = ids.length ? document.getElementById(ids[ids.length - 1]) : nav;
    const same = [...box.querySelectorAll('a[href]')].filter((x) => x.getAttribute('href') === a.getAttribute('href'));
    // useId panel ids change every time the drawer mounts, so the chain is replayed by button label
    return { href: a.getAttribute('href'), text: a.innerText.trim().split('\\n')[0], labels: ids.map(label), nth: same.indexOf(a) };
  });
}"""
# Expand the panel whose toggle button (at this level of `scope_id`) carries `lab`; returns the panel id.
EXPAND_ONE = "async ([scopeId, lab]) => {" + DRAWER_JS + """
  const scope = scopeId ? document.getElementById(scopeId) : nav;
  const btns = [...scope.querySelectorAll('button[aria-controls]')].filter((b) => (panelOf(b) || nav) === scope);
  const b = btns.find((x) => label(x.getAttribute('aria-controls')) === lab);
  if (!b) return null;
  return b.getAttribute('aria-controls');
}"""


async def run_drawer(b, base, res):
    ctx = await b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    await ctx.add_init_script(QUIET)
    pg = await ctx.new_page()
    await pg.goto(base + "/company/about-us", wait_until="load")
    nav_sel = '[role="dialog"] nav[aria-label="Mobile"]'

    async def open_drawer():
        await pg.locator('button[aria-label*="menu" i]').first.click()
        await pg.locator(nav_sel).wait_for(state="visible")
        await pg.wait_for_timeout(350)

    await open_drawer()
    expanded = await pg.evaluate(EXPAND_ALL)
    links = await pg.evaluate(COLLECT)
    print(f"drawer: {expanded} accordion panels expanded, {len(links)} links found", flush=True)
    await pg.keyboard.press("Escape")
    await pg.wait_for_timeout(400)
    for i, item in enumerate(links):
        href, text, labels, nth = item["href"], item["text"], item["labels"], item["nth"]
        if not href or not href.startswith("/") or (MATCH and MATCH not in href and MATCH not in (links[i - 1]["href"] if i else "")):
            continue
        ok, m = False, {}
        group = labels[0] if labels else ""
        try:
            await open_drawer()
            pid = None
            for lab in labels:
                pid = await pg.evaluate(EXPAND_ONE, [pid, lab])
                if not pid:
                    raise RuntimeError(f"accordion button not found: {lab}")
                btn = pg.locator(f'{nav_sel} button[aria-controls="{pid}"]').first
                if await btn.get_attribute("aria-expanded") != "true":
                    await btn.click()
                    await pg.wait_for_timeout(380)
            scope = f'{nav_sel} [id="{pid}"]' if pid else nav_sel
            link = pg.locator(f'{scope} a[href="{href}"]').nth(nth)
            await link.scroll_into_view_if_needed(timeout=8000)
            await link.click(timeout=8000)
            ok, m = await settle(pg, href)
        except Exception as e:  # noqa: BLE001
            m = {"error": str(e)[:140]}
            await pg.keyboard.press("Escape")
            await pg.wait_for_timeout(300)
        res.append({"where": f"drawer:{group}", "text": text, "href": href, "ok": ok, **m})
        print("drawer", "OK " if ok else "XX ", group, "|", text, "->", href, m.get("delta", m.get("y")), m.get("error", ""), "" if ok else m, flush=True)
    await ctx.close()


async def run_footer(b, base, res):
    ctx = await b.new_context(viewport={"width": 1440, "height": 900})
    await ctx.add_init_script(QUIET)
    pg = await ctx.new_page()
    await pg.goto(base + "/", wait_until="load")
    hrefs = await pg.locator("footer a[href^='/']:visible").evaluate_all("els => els.map(e => [e.getAttribute('href'), e.innerText.trim().split('\\n')[0]])")
    for i, (href, text) in enumerate(hrefs):
        if MATCH and MATCH not in href:
            continue
        ok, m = False, {}
        try:
            link = pg.locator("footer a[href^='/']:visible").nth(i)
            await link.scroll_into_view_if_needed()
            await pg.wait_for_timeout(200)
            await link.click()
            ok, m = await settle(pg, href)
        except Exception as e:  # noqa: BLE001
            m = {"error": str(e)[:140]}
        res.append({"where": "footer", "text": text, "href": href, "ok": ok, **m})
        print("footer", "OK " if ok else "XX ", "|", text, "->", href, m.get("delta", m.get("y")), m.get("error", ""), flush=True)
    await ctx.close()


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base")
    ap.add_argument("out")
    ap.add_argument("--only", default=None)
    ap.add_argument("--match", default=None, help="only click links whose href contains this text")
    a = ap.parse_args()
    global MATCH
    MATCH = a.match
    base = a.base.rstrip("/")
    res = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium")
        if a.only in (None, "menu"):
            await run_menu(b, base, res)
        if a.only in (None, "drawer"):
            await run_drawer(b, base, res)
        if a.only in (None, "footer"):
            await run_footer(b, base, res)
        await b.close()
    bad = [r for r in res if not r["ok"]]
    json.dump(res, open(a.out, "w"), indent=1)
    print(f"TOTAL {len(res)} clicked, {len(res) - len(bad)} OK, {len(bad)} failed")


if __name__ == "__main__":
    asyncio.run(main())
