#!/usr/bin/env python3
"""Run the full apply.py transform pipeline on selected seed/data files only (Home and/or Global).

  python3 tools/apply_core.py            # index.json + global.json
  python3 tools/apply_core.py index      # Home only

Same steps as the per-target loop in seed/custom/apply.py main(), without republishing every custom page.
Then flushes the dev-server content cache.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "seed", "custom"))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import apply as A  # noqa: E402

which = sys.argv[1:] or ["index", "global"]
portfolio = A.load(os.path.join(A.CUSTOM, "portfolio.json"))
mapping = A.redirect_map()
rewrite = A.make_rewriter(mapping)
overrides = {k: v for k, v in portfolio.get("linkOverrides", {}).items() if not k.startswith("_")}
for name in which:
    p = os.path.join(A.DATA, "global.json") if name == "global" else os.path.join(A.PAGES, name + ".json")
    doc = A.load(p)
    before = json.dumps(doc, sort_keys=True)
    A.walk(doc, rewrite, overrides)
    if name == "global":
        A.patch_global(doc, portfolio)
        A.patch_products_menu(doc, portfolio)
        A.patch_industries_global(doc, portfolio)
        A.site_global.patch(doc, portfolio)
        A.site_global.featured_insights(doc)
    else:
        A.patch_industries_sections(doc, portfolio)
        if name == "index":
            A.patch_home(doc, portfolio)
        A.deck.apply(doc)
        A.site_rules(doc)
    changed = json.dumps(doc, sort_keys=True) != before
    if changed:
        A.save(p, doc)
    print(f"{name}: {'updated' if changed else 'unchanged'}")

import subprocess
import urllib.request

import publish_page

for name in which:
    r = subprocess.run([publish_page.NODE, "apps/cms/scripts/validate-seed.mjs", name], cwd=ROOT, capture_output=True, text=True)
    print(f"validate {name}: {'OK' if r.returncode == 0 else 'ERRORS'}")
    if r.returncode:
        print("\n".join((r.stdout + r.stderr).strip().splitlines()[-25:]))
req = urllib.request.Request(f"http://127.0.0.1:3000/api/revalidate?now&secret={publish_page.secret()}", data=b"{}", method="POST",
                             headers={"Content-Type": "application/json"})
try:
    print("revalidate:", urllib.request.urlopen(req, timeout=30).status)
except Exception as e:  # noqa: BLE001
    print("revalidate failed:", e)
