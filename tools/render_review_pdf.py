#!/usr/bin/env python3
"""Render a review Markdown file to a branded A4 PDF via Chromium.

Usage: python3 tools/render_review_pdf.py <input.md> <output.pdf>
"""
import asyncio
import re
import sys
from pathlib import Path

import markdown
from playwright.async_api import async_playwright

CSS = r"""
@page { size: A4; margin: 15mm 13mm 16mm 13mm; }
:root { --navy:#0B1530; --ink:#1E293B; --muted:#64748B; --orange:#FF7800; --line:#E2E8F0; --soft:#F8FAFC; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: 'Inter', system-ui, sans-serif; color: var(--ink); font-size: 9.6pt; line-height: 1.5; margin: 0; }
h1, h2, h3 { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; color: var(--navy); letter-spacing: -0.01em; }
.cover { background: var(--navy); color: #fff; border-radius: 10px; padding: 22px 24px 18px; margin-bottom: 14px; position: relative; overflow: hidden; }
.cover:after { content: ""; position: absolute; right: -60px; top: -60px; width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,120,0,.35), rgba(255,120,0,0) 70%); }
.cover .eyebrow { font-size: 7.5pt; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--orange); }
.cover h1 { color: #fff; font-size: 21pt; line-height: 1.15; margin: 6px 0 10px; }
.cover .bars { display: flex; gap: 4px; margin-bottom: 12px; }
.cover .bars i { display: block; height: 4px; border-radius: 2px; }
.cover .meta { font-size: 8.4pt; color: #CBD5E1; }
.cover .meta p { margin: 2px 0; }
.cover .meta strong { color: #fff; }
h2 { font-size: 13.5pt; margin: 20px 0 8px; padding-left: 10px; border-left: 4px solid var(--orange); break-after: avoid; }
h3 { font-size: 11pt; margin: 14px 0 6px; break-after: avoid; }
p { margin: 5px 0 7px; }
ol, ul { margin: 4px 0 8px; padding-left: 18px; }
li { margin: 2px 0; }
strong { color: var(--navy); }
hr { border: none; height: 0; margin: 6px 0; }
code { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 7.6pt; background: #EEF2F7; color: #0F2A5F;
  padding: 0 3px; border-radius: 3px; word-break: break-word; overflow-wrap: anywhere; }
ol { padding-left: 2.1em; }
img { width: 100%; border: 1px solid var(--line); border-radius: 8px; margin: 8px 0 4px; break-inside: avoid; }
table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 8px 0 12px; font-size: 8.3pt; line-height: 1.38;
  border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
thead th { background: var(--navy); color: #fff; text-align: left; font-weight: 600; padding: 6px 7px; font-size: 8pt; }
td { padding: 5px 7px; vertical-align: top; border-top: 1px solid var(--line); }
tbody tr:nth-child(even) td { background: var(--soft); }
tr { break-inside: avoid; }
td:first-child { font-weight: 600; color: var(--navy); }
table.fix td:first-child { color: var(--orange); text-align: center; }
.callout { background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; padding: 8px 12px; margin: 8px 0; }
.kpis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin: 10px 0 6px; }
.kpi { border: 1px solid var(--line); border-radius: 8px; padding: 7px 8px; background: #fff; }
.kpi b { display: block; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15pt; color: var(--navy); line-height: 1.1; }
.kpi span { font-size: 7.2pt; color: var(--muted); }
.kpi.r b { color: #E5484D; } .kpi.o b { color: var(--orange); } .kpi.y b { color: #C98A00; } .kpi.b b { color: #2563EB; } .kpi.g b { color: #16A34A; }
"""

# column width presets keyed by the first header cell text
WIDTHS = {
    "Keep": [40, 60],
    "Section": [18, 13, 34, 35],
    "Current page": [38, 14, 48],
    "Menu": [20, 26, 54],
    "#": [4, 38, 22, 36],
    "Current section (15)": [28, 52, 20],
    "Page type": [17, 70, 13],
    "Industry": [24, 76],
    "Group": [19, 8, 13, 60],
    "Phase": [16, 66, 18],
    "Stage": [18, 18, 64],
    "Step": [6, 50, 15, 29],
    "Element": [16, 84],
    "Behaviour": [16, 84],
    "Before": [27, 25, 38, 10],
    # content, SEO and copyright review (10 Nov 2026)
    ("#", 3): [5, 21, 74],
    ("Stage", 2): [72, 28],
    "Type of correction": [22, 8, 70],
    "Area": [12, 43, 45],
    "Check": [38, 62],
    # final audit (10 Nov 2026)
    ("#", 3): [5, 21, 74],
    ("Area", 4): [17, 7, 42, 34],
    "Device profile": [30, 24, 16, 10, 20],
    "Issue found": [38, 26, 36],
    "Mobile page": [34, 11, 11, 11, 11, 11, 11],
    "Mode": [40, 18, 14, 14, 14],
    "Control": [40, 60],
    "Priority": [11, 64, 25],
    ("Check", 2): [55, 45],
    ("Check", 3): [20, 44, 36],
}


def postprocess(html: str) -> str:
    # assign column widths and classes per table, based on the first header cell
    def fix_table(m):
        t = m.group(0)
        first = re.search(r"<th[^>]*>(.*?)</th>", t, re.S)
        key = re.sub("<[^>]+>", "", first.group(1)).strip() if first else ""
        ncols = len(re.findall(r"<th[ >]", t.split("</thead>")[0]))
        widths = WIDTHS.get((key, ncols)) or WIDTHS.get(key)
        if widths and len(widths) != ncols:  # a preset for a different table shape would squeeze the columns
            widths = None
        cls = ' class="fix"' if key == "#" else ""
        cols = ""
        if widths:
            cols = "<colgroup>" + "".join(f'<col style="width:{w}%">' for w in widths) + "</colgroup>"
        return t.replace("<table>", f"<table{cls}>{cols}", 1)

    html = re.sub(r"<table>.*?</table>", fix_table, html, flags=re.S)
    return html


PROFILES = {
    "review": {"eyebrow": "Linkfields · Website review", "footer": "Linkfields website review · 8 November 2026", "kpis": True},
    "enterprise": {"eyebrow": "Linkfields · Enterprise readiness and change report",
                   "footer": "Linkfields website · enterprise readiness and change report · 9 November 2026", "kpis": True,
                   "kpi_html": """<div class="kpis">
<div class="kpi g"><b>17 / 18</b><span>must-fix items closed</span></div>
<div class="kpi b"><b>5 / 5</b><span>menus on one tile model</span></div>
<div class="kpi o"><b>91</b><span>primary CTAs now &ldquo;Let&rsquo;s connect&rdquo;</span></div>
<div class="kpi y"><b>1.65 s</b><span>mobile LCP (throttled)</span></div>
<div class="kpi r"><b>5</b><span>items to remove</span></div>
<div class="kpi b"><b>12</b><span>additions proposed</span></div>
</div>"""},
    "content": {"eyebrow": "Linkfields · Content, SEO and copyright review",
                "footer": "Linkfields website · content, SEO and copyright review · 10 November 2026", "kpis": True,
                "kpi_html": """<div class="kpis">
<div class="kpi g"><b>11 / 11</b><span>requests delivered</span></div>
<div class="kpi o"><b>242</b><span>content corrections live</span></div>
<div class="kpi b"><b>77 / 77</b><span>unique titles and descriptions</span></div>
<div class="kpi y"><b>0</b><span>broken links or section targets</span></div>
<div class="kpi r"><b>3</b><span>badges made compliant</span></div>
<div class="kpi b"><b>10</b><span>partner logos with colour hover</span></div>
</div>"""},
    "audit": {"eyebrow": "Linkfields · Final audit and quality scorecard",
              "footer": "Linkfields website · final audit and quality scorecard · 10 November 2026", "kpis": True,
              "kpi_html": """<div class="kpis">
<div class="kpi o"><b>9.5 / 10</b><span>overall score</span></div>
<div class="kpi g"><b>1,078</b><span>device page loads, 0 layout problems</span></div>
<div class="kpi g"><b>156 / 156</b><span>WCAG 2.2 AA page views clean</span></div>
<div class="kpi b"><b>100</b><span>Lighthouse SEO, a11y, Best Practices (22/22)</span></div>
<div class="kpi y"><b>0</b><span>broken links</span></div>
<div class="kpi b"><b>698 / 698</b><span>section landings correct</span></div>
</div>"""},
    "implementation": {"eyebrow": "Linkfields · Implementation summary",
                       "footer": "Linkfields website · review recommendations implemented · 9 November 2026", "kpis": False},
}
PROFILE = PROFILES["review"]


def build_cover(md: str):
    """Pull the H1 + metadata block into a branded cover; return (cover_html, rest_md)."""
    lines = md.splitlines()
    title = lines[0].lstrip("# ").strip()
    meta, i = [], 1
    while i < len(lines) and not lines[i].startswith("---"):
        if lines[i].strip():
            meta.append(lines[i].rstrip())
        i += 1
    meta_html = markdown.markdown("\n".join(m.rstrip() + "  " for m in meta))
    bars = "".join(f'<i style="width:{w}px;background:{c}"></i>' for w, c in
                   [(34, "#FF7800"), (22, "#FDB813"), (14, "#3B82F6"), (10, "#8B5CF6"), (8, "#14B8A6")])
    cover = (f'<div class="cover"><div class="eyebrow">{PROFILE['eyebrow']}</div><h1>{title}</h1>'
             f'<div class="bars">{bars}</div><div class="meta">{meta_html}</div></div>')
    return cover, "\n".join(lines[i + 1:])


KPI_HTML = """<div class="kpis">
<div class="kpi"><b>668</b><span>existing sections assessed</span></div>
<div class="kpi r"><b>140</b><span>remove</span></div>
<div class="kpi o"><b>102</b><span>merge into another section</span></div>
<div class="kpi y"><b>30</b><span>move to a better page</span></div>
<div class="kpi b"><b>356</b><span>rework</span></div>
<div class="kpi g"><b>40</b><span>keep as is</span></div>
</div>"""


async def main(src: str, dst: str):
    md = Path(src).read_text()
    cover, rest = build_cover(md)
    body = markdown.markdown(rest, extensions=["tables", "sane_lists"])
    body = postprocess(body)
    # insert KPI tiles after the first paragraph of section 1
    if PROFILE["kpis"]:
        body = body.replace("</h2>\n<p>", "</h2>\n" + PROFILE.get("kpi_html", KPI_HTML) + "<p>", 1)
    html = f"""<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{cover}{body}</body></html>"""
    out_html = Path(dst).with_suffix(".html")
    out_html.write_text(html)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium")
        pg = await b.new_page()
        await pg.goto(out_html.resolve().as_uri(), wait_until="networkidle")
        await pg.evaluate("document.fonts.ready")
        await pg.pdf(path=dst, format="A4", print_background=True, display_header_footer=True,
                     header_template="<span></span>",
                     footer_template=('<div style="width:100%;font-family:Inter,sans-serif;font-size:7px;color:#94A3B8;'
                                      'padding:0 13mm;display:flex;justify-content:space-between">'
                                      f'<span>{PROFILE["footer"]}</span>'
                                      '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'),
                     margin={"top": "15mm", "bottom": "16mm", "left": "13mm", "right": "13mm"})
        await b.close()
    out_html.unlink()
    print("written", dst)


if __name__ == "__main__":
    if len(sys.argv) > 3:
        PROFILE = PROFILES[sys.argv[3]]
    asyncio.run(main(sys.argv[1], sys.argv[2]))
