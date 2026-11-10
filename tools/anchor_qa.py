"""Section landing QA.

For every internal #hash link (from /tmp/hash-links.json) and for every in-page tab on pages that
have a tab bar, measure where the target section starts relative to the bottom of the fixed chrome
(header + docked tab bar when visible). A correct landing puts the section start just below the chrome.

usage: python3 tools/anchor_qa.py BASE OUT.json [--tabs] [--width 1440] [--only /path]
"""
import asyncio, json, sys, glob, argparse, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # repo root, so the tool works from any cwd
from playwright.async_api import async_playwright

CLOSED = "try { localStorage.setItem('lf-promo:atf-2026', 'closed'); sessionStorage.setItem('lf-promo:atf-2026', 'closed'); } catch (e) {}"

MEASURE = """(id) => {
  const pick = (sel) => [...document.querySelectorAll(sel)].find(e => e.getClientRects().length) || null;
  const el = pick('[id="' + CSS.escape(id) + '"]');
  if (!el) return { missing: true };
  const header = document.querySelector('header');
  const bar = header && header.firstElementChild;
  const hb = bar ? bar.getBoundingClientRect().bottom : 0;
  const dock = pick('nav[aria-label="On this page (pinned)"]');
  let db = 0;
  if (dock) { const cs = getComputedStyle(dock); if (cs.visibility === 'visible' && +cs.opacity > 0.5) db = dock.getBoundingClientRect().bottom; }
  const chrome = Math.max(hb, db);
  const top = el.getBoundingClientRect().top;
  const act = dock && dock.querySelector('[aria-current="location"]');
  return { top: Math.round(top), chrome: Math.round(chrome), delta: Math.round(top - chrome), y: Math.round(scrollY), active: act ? act.getAttribute('data-target') : null };
}"""


def ok(m):
    return (not m.get("missing")) and -3 <= m["delta"] <= 6


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base"); ap.add_argument("out")
    ap.add_argument("--tabs", action="store_true"); ap.add_argument("--width", type=int, default=1440)
    ap.add_argument("--only", default=None)
    a = ap.parse_args()
    H = 900 if a.width > 800 else 844
    links = json.load(open("/tmp/hash-links.json"))
    res = {"direct": [], "client": [], "tabs": []}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium")
        ctx = await b.new_context(viewport={"width": a.width, "height": H})
        await ctx.add_init_script(CLOSED)
        pg = await ctx.new_page()
        # 1) direct loads of hash URLs
        for u in links:
            if a.only and not u.startswith(a.only):
                continue
            try:
                await pg.goto(a.base + u, wait_until="load", timeout=120000)
                await pg.wait_for_timeout(2500)
                m = await pg.evaluate(MEASURE, u.split("#", 1)[1])
            except Exception as e:  # noqa
                m = {"error": str(e)[:120]}
            m["url"] = u
            res["direct"].append(m)
            print("direct", "OK " if ok(m) else "XX ", u, m.get("delta"), flush=True)
        # 2) client-side navigation: click a real link on another page (rendered in footer / content)
        for u in links:
            if a.only and not u.startswith(a.only):
                continue
            path = u.split("#")[0]
            src = "/" if path != "/" else "/company/about-us"
            try:
                await pg.goto(a.base + src, wait_until="load", timeout=120000)
                await pg.wait_for_timeout(800)
                # Inject a Next-router-free path: use an existing anchor if one exists, else router push.
                clicked = await pg.evaluate("""(u) => {
                  const a = [...document.querySelectorAll('a')].find(x => x.getAttribute('href') === u);
                  if (a) { a.scrollIntoView({block:'center'}); a.click(); return 'anchor'; }
                  if (window.next && window.next.router) { window.next.router.push(u); return 'router'; }
                  return null; }""", u)
                await pg.wait_for_timeout(3000)
                m = await pg.evaluate(MEASURE, u.split("#", 1)[1])
                m["via"] = clicked
            except Exception as e:  # noqa
                m = {"error": str(e)[:120]}
            m["url"] = u
            res["client"].append(m)
            print("client", "OK " if ok(m) else "XX ", u, m.get("delta"), m.get("via"), flush=True)
        # 3) in-page tab clicks from the top of each page with a tab bar
        if a.tabs:
            pages = []
            for f in sorted(glob.glob(os.path.join(ROOT, "seed/data/pages/*.json"))):
                d = json.load(open(f))
                path = d.get("path") or "/"
                if a.only and not path.startswith(a.only):
                    continue
                hero = next((s for s in d.get("sections", []) if s.get("__component") == "sections.page-hero"), None)
                al = (hero or {}).get("anchorLinks") or []
                if al:
                    pages.append((path, [x["targetId"] for x in al if x.get("targetId")]))
            for path, ids in pages:
                try:
                    await pg.goto(a.base + path, wait_until="load", timeout=120000)
                    await pg.wait_for_timeout(1200)
                except Exception as e:  # noqa
                    res["tabs"].append({"page": path, "error": str(e)[:120]}); continue
                for i, t in enumerate(ids):
                    if t == "get-in-touch":
                        continue
                    sel_hero = f'nav[aria-label="On this page"] [data-target="{t}"]'
                    sel_dock = f'nav[aria-label="On this page (pinned)"] [data-target="{t}"]'
                    try:
                        if i == 0:
                            await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(400)
                            await pg.evaluate(f"document.querySelector('{sel_hero}').click()")
                        else:
                            await pg.evaluate(f"document.querySelector('{sel_dock}').click()")
                        await pg.wait_for_timeout(1700)
                        m = await pg.evaluate(MEASURE, t)
                    except Exception as e:  # noqa
                        m = {"error": str(e)[:120]}
                    m.update(page=path, target=t)
                    m["activeOk"] = m.get("active") == t
                    res["tabs"].append(m)
                    print("tab", "OK " if ok(m) and m["activeOk"] else "XX ", path, t, m.get("delta"), m.get("active"), flush=True)
        await b.close()
    json.dump(res, open(a.out, "w"), indent=1)
    for k in res:
        bad = [m for m in res[k] if not ok(m) or (k == "tabs" and not m.get("activeOk"))]
        print(f"SUMMARY {k}: {len(res[k]) - len(bad)}/{len(res[k])} ok")


asyncio.run(main())
