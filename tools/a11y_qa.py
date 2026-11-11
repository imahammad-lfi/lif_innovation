#!/usr/bin/env python3
"""Accessibility scan with axe-core (WCAG 2.0/2.1/2.2 A + AA rules) on every sitemap page, desktop and mobile.

    python3 tools/a11y_qa.py http://127.0.0.1:3001 /tmp/a11y --axe /tmp/lh/node_modules/axe-core/axe.min.js [--jobs 4]

Install axe-core once, e.g. `npm i axe-core` in a scratch folder, and pass the path to axe.min.js.
Writes <out>/a11y.json (violations per page) and <out>/a11y.md (rules ranked by affected pages, with sample targets).
The ATF pop-up is suppressed so the page itself is scanned (the pop-up is scanned separately on the home page).
"""
import argparse
import asyncio
import json
import os
import re
import urllib.request
from urllib.parse import urlparse

from playwright.async_api import async_playwright

TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
QUIET = "try{sessionStorage.setItem('lf-promo-v2:atf-2026','closed');localStorage.setItem('lf-promo-v2:atf-2026','closed')}catch(e){}"


def sitemap_paths(base):
    xml = urllib.request.urlopen(base + "/sitemap.xml", timeout=30).read().decode()
    out = []
    for loc in re.findall(r"<loc>([^<]+)</loc>", xml):
        p = urlparse(loc).path or "/"
        if p not in out:
            out.append(p)
    return out


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base")
    ap.add_argument("out")
    ap.add_argument("--axe", required=True)
    ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    axe = open(a.axe).read()
    paths = sitemap_paths(a.base)
    res = {}
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path="/usr/bin/chromium")
        sem = asyncio.Semaphore(a.jobs)

        async def scan(path, w, h, label, promo=False):
            async with sem:
                ctx = await b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce")
                if not promo:
                    await ctx.add_init_script(QUIET)
                pg = await ctx.new_page()
                try:
                    await pg.goto(a.base + path, wait_until="load", timeout=60000)
                    await pg.evaluate("async()=>{for(let y=0;y<document.body.scrollHeight;y+=800){scrollTo(0,y);await new Promise(r=>setTimeout(r,40))}scrollTo(0,0)}")
                    await pg.wait_for_timeout(5500 if promo else 900)
                    await pg.add_script_tag(content=axe)
                    ctxsel = '[role="dialog"]' if promo else "document"
                    r = await pg.evaluate(
                        "async ([tags, sel]) => { const c = sel === 'document' ? document : document.querySelector(sel);"
                        " if (!c) return {violations: [], note: 'no context'};"
                        " const x = await axe.run(c, {runOnly: {type: 'tag', values: tags}, resultTypes: ['violations']});"
                        " return {violations: x.violations.map(v => ({id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length,"
                        " targets: v.nodes.slice(0, 4).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\\n').slice(1, 2).join(''))}))} }",
                        [TAGS, ctxsel])
                except Exception as e:  # noqa: BLE001
                    r = {"violations": [], "error": str(e)[:200]}
                res[f"{label} {path}"] = r
                await ctx.close()

        jobs = [scan(p, 1440, 900, "desktop") for p in paths] + [scan(p, 390, 844, "mobile") for p in paths]
        jobs.append(scan("/", 1440, 900, "desktop-popup", promo=True))
        jobs.append(scan("/", 390, 844, "mobile-popup", promo=True))
        await asyncio.gather(*jobs)
        await b.close()
    json.dump(res, open(a.out + "/a11y.json", "w"), indent=1)
    rules = {}
    for k, r in res.items():
        for v in r.get("violations", []):
            e = rules.setdefault(v["id"], {"impact": v["impact"], "help": v["help"], "pages": set(), "nodes": 0, "samples": []})
            e["pages"].add(k)
            e["nodes"] += v["nodes"]
            if len(e["samples"]) < 5:
                e["samples"] += [f"{k}: {t}" for t in v["targets"][:2]]
    errs = [k for k, r in res.items() if r.get("error")]
    clean = sum(1 for r in res.values() if not r.get("violations") and not r.get("error"))
    lines = [f"# axe-core WCAG 2.2 AA scan — {len(res)} page views ({len(paths)} pages × desktop/mobile + pop-up)", "",
             f"Page views with zero violations: **{clean}/{len(res)}**. Scan errors: {len(errs)}.", ""]
    if rules:
        lines += ["| Rule | Impact | Page views | Nodes | What it means |", "| --- | --- | --- | --- | --- |"]
        for rid, e in sorted(rules.items(), key=lambda x: -len(x[1]["pages"])):
            lines.append(f"| `{rid}` | {e['impact']} | {len(e['pages'])} | {e['nodes']} | {e['help']} |")
        lines += ["", "## Samples", ""]
        for rid, e in rules.items():
            lines.append(f"### {rid}")
            lines += [f"- {s[:300]}" for s in e["samples"][:5]]
    if errs:
        lines += ["", "## Scan errors", ""] + [f"- {k}: {res[k]['error']}" for k in errs]
    open(a.out + "/a11y.md", "w").write("\n".join(lines) + "\n")
    print("\n".join(lines[:4 + len(rules) + 2]))


if __name__ == "__main__":
    asyncio.run(main())
