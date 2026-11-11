#!/usr/bin/env python3
"""Lighthouse audit of key pages (mobile + desktop) with a Markdown summary.

    python3 tools/lighthouse_qa.py http://127.0.0.1:3001 /tmp/lh-out --lighthouse /tmp/lh/node_modules/.bin/lighthouse

Install Lighthouse once in a scratch folder (`npm i lighthouse`). Runs sequentially (parallel runs distort timings) using
/usr/bin/chromium. Mobile uses Lighthouse's default simulated Moto G Power on slow 4G; desktop uses `--preset=desktop`.
Writes one JSON report per run plus <out>/summary.md (scores, Core Web Vitals, and failing audits per category).
Note: scores from a local origin exclude CDN effects (Cloudflare caching, Brotli, HTTP/3), so field numbers behind
Cloudflare are typically better for TTFB/LCP.
"""
import argparse
import json
import os
import re
import subprocess
import sys

PAGES = [
    "/",
    "/services/data-ai",
    "/services/digital-transformation/integration-services",
    "/products-and-accelerators",
    "/products-and-accelerators/textiq",
    "/industries/bfsi",
    "/company/about-us",
    "/careers",
    "/events/africa-tech-festival-2026",
    "/contact-us",
    "/company/news-and-articles",
]
CATS = ["performance", "accessibility", "best-practices", "seo"]


def run(lh, url, out, preset):
    cmd = [lh, url, "--quiet", "--output=json", f"--output-path={out}", "--chrome-path=/usr/bin/chromium",
           "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage", "--only-categories=" + ",".join(CATS),
           "--max-wait-for-load=60000"]
    if preset == "desktop":
        cmd.append("--preset=desktop")
    env = dict(os.environ, PATH="/opt/node26/bin:" + os.environ.get("PATH", ""))
    r = subprocess.run(cmd, capture_output=True, text=True, env=env, timeout=300)
    if r.returncode != 0:
        print("  lighthouse failed:", r.stderr[-300:], file=sys.stderr)
        return None
    return json.load(open(out))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base")
    ap.add_argument("out")
    ap.add_argument("--lighthouse", required=True)
    ap.add_argument("--pages", default="")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    pages = a.pages.split(",") if a.pages else PAGES
    rows, fails = [], {}
    for preset in ("mobile", "desktop"):
        for p in pages:
            slug = re.sub(r"[^a-z0-9]+", "-", (p.strip("/") or "home").lower())
            f = f"{a.out}/{preset}__{slug}.json"
            print(f"{preset:7s} {p}", flush=True)
            rep = run(a.lighthouse, a.base + p, f, preset)
            if not rep:
                rows.append((preset, p, None, {}))
                continue
            sc = {c: round(100 * (rep["categories"][c]["score"] or 0)) for c in CATS}
            au = rep["audits"]
            m = {k: au[k]["displayValue"] if k in au and "displayValue" in au[k] else "–" for k in
                 ("first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index")}
            rows.append((preset, p, sc, m))
            for c in CATS:
                for ref in rep["categories"][c]["auditRefs"]:
                    x = au.get(ref["id"], {})
                    if ref.get("weight", 0) > 0 and x.get("score") is not None and x["score"] < 0.9 and x.get("scoreDisplayMode") not in ("notApplicable", "informative", "manual"):
                        fails.setdefault((c, ref["id"], x.get("title", "")), []).append(f"{preset} {p} ({x.get('displayValue', round(x['score'] * 100))})")
            print("   ", sc, m, flush=True)
    lines = ["# Lighthouse — key pages, mobile and desktop", "",
             "| Mode | Page | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Speed index |",
             "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
    for preset, p, sc, m in rows:
        if not sc:
            lines.append(f"| {preset} | `{p}` | failed | | | | | | | | |")
            continue
        lines.append(f"| {preset} | `{p}` | {sc['performance']} | {sc['accessibility']} | {sc['best-practices']} | {sc['seo']} | "
                     f"{m['first-contentful-paint']} | {m['largest-contentful-paint']} | {m['total-blocking-time']} | {m['cumulative-layout-shift']} | {m['speed-index']} |")
    for preset in ("mobile", "desktop"):
        ok = [r for r in rows if r[0] == preset and r[2]]
        if ok:
            avg = {c: round(sum(r[2][c] for r in ok) / len(ok)) for c in CATS}
            lines.append(f"| **{preset} average** | | **{avg['performance']}** | **{avg['accessibility']}** | **{avg['best-practices']}** | **{avg['seo']}** | | | | | |")
    lines += ["", "## Audits scoring below 90 (weighted)", ""]
    if not fails:
        lines.append("None.")
    for (c, aid, title), where in sorted(fails.items(), key=lambda x: (x[0][0], -len(x[1]))):
        lines.append(f"- **{c}** `{aid}` — {title}: {len(where)} run(s); e.g. {', '.join(where[:3])}")
    open(f"{a.out}/summary.md", "w").write("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
