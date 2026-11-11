#!/usr/bin/env python3
"""Publish hand-authored portfolio pages to the local dev site in one step.

    python3 tools/publish_page.py services__data-ai.json [more.json ...]

1. copies seed/custom/pages/<file> into seed/data/pages (seed/custom/apply.py <file>)
2. validates the published page(s) against the Strapi schemas (apps/cms/scripts/validate-seed.mjs <filter>)
3. flushes the dev server cache on http://127.0.0.1:3000 (POST /api/revalidate?now) so the page renders fresh
"""
import os
import subprocess
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NODE = "/opt/node26/bin/node"


def secret():
    for line in open(os.path.join(ROOT, "apps", "web", ".env.local")):
        if line.startswith("REVALIDATE_SECRET="):
            return line.split("=", 1)[1].strip()
    return ""


def main(files):
    if not files:
        raise SystemExit(__doc__)
    names = [os.path.basename(f) for f in files]
    subprocess.run([sys.executable, os.path.join(ROOT, "seed", "custom", "apply.py"), *names], check=True)
    failed = False
    for n in names:
        r = subprocess.run([NODE, "apps/cms/scripts/validate-seed.mjs", n[:-5] if n.endswith(".json") else n], cwd=ROOT,
                           capture_output=True, text=True)
        out = (r.stdout + r.stderr).strip().splitlines()
        print(f"validate {n}: {'OK' if r.returncode == 0 else 'ERRORS'}")
        if r.returncode:
            failed = True
            print("\n".join(out[-25:]))
    req = urllib.request.Request(f"http://127.0.0.1:3000/api/revalidate?now&secret={secret()}", data=b"{}", method="POST",
                                 headers={"Content-Type": "application/json"})
    try:
        print("revalidate:", urllib.request.urlopen(req, timeout=30).status)
    except Exception as e:  # dev server down is not fatal for authoring
        print("revalidate failed:", e)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main(sys.argv[1:])
