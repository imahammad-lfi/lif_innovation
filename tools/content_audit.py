#!/usr/bin/env python3
"""Site-wide content audit over the seed data (the same content that is imported into Strapi).

Writes one readable outline per page/post (for human or LLM review) and a JSON report of deterministic findings:
duplicate sections (within a page and across pages), empty sections, placeholder text, SEO metadata problems,
images without alt text and American spellings.

Usage: python3 tools/content_audit.py [--out /tmp/content-audit]
"""
import argparse
import glob
import json
import os
import re
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "seed", "data")
SKIP_KEYS = {"href", "url", "ctaHref", "canonicalUrl", "anchorId", "__component", "mime", "accent", "theme", "variant",
             "icon", "videoStyle", "layout", "style", "align", "size", "openInNewTab", "noIndex", "order", "slug"}
AMERICAN = {
    r"\boptimiz": "optimis", r"\borganiz": "organis", r"\bmoderniz": "modernis", r"\bprioritiz": "prioritis",
    r"\bstandardiz": "standardis", r"\bcentraliz": "centralis", r"\bdigitiz": "digitis", r"\banalyz": "analys",
    r"\bcolor\b": "colour", r"\bbehavior": "behaviour", r"\bcenter\b": "centre", r"\bcenters\b": "centres",
    r"\bfavor": "favour", r"\bprogram\b": "programme", r"\blicense\b(?=\s+(?:fee|cost|terms))": "licence",
    r"\bcustomiz": "customis", r"\butiliz": "utilis", r"\bmaximiz": "maximis", r"\bminimiz": "minimis",
    r"\bauthoriz": "authoris", r"\brealiz": "realis", r"\bspecializ": "specialis", r"\bmonetiz": "monetis",
    r"\bindustrializ": "industrialis", r"\bvisualiz": "visualis", r"\bcatalog\b": "catalogue",
}
PLACEHOLDER = re.compile(r"lorem ipsum|\bTBD\b|\bTODO\b|coming soon|\bxx+\b|placeholder|\[insert|dummy text", re.I)


def load(p):
    with open(p) as f:
        return json.load(f)


def is_media(v):
    return isinstance(v, dict) and ("__media" in v or "url" in v and "mime" in v)


def flatten(node, path=""):
    """Yield (path, text) for every human-readable string; media as '[image alt=...]'."""
    if is_media(node):
        yield path, f"[image alt={node.get('alt') or node.get('alternativeText') or ''!r}]"
        return
    if isinstance(node, dict):
        for k, v in node.items():
            if k in SKIP_KEYS or v in (None, "", [], {}):
                continue
            yield from flatten(v, f"{path}.{k}" if path else k)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from flatten(v, f"{path}[{i}]")
    elif isinstance(node, str):
        yield path, node


def section_text(sec):
    return " ".join(t for p, t in flatten(sec) if not t.startswith("[image"))


def shingles(text, n=6):
    w = re.findall(r"[a-z0-9]+", text.lower())
    return {" ".join(w[i:i + n]) for i in range(max(0, len(w) - n + 1))}


def jaccard(a, b):
    return len(a & b) / max(1, len(a | b))


def links_of(node):
    out = []
    if isinstance(node, dict):
        for k, v in node.items():
            if k in ("href", "url", "ctaHref") and isinstance(v, str) and v:
                out.append((node.get("label") or node.get("title") or node.get("ctaLabel") or "", v))
            else:
                out += links_of(v)
    elif isinstance(node, list):
        for v in node:
            out += links_of(v)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="/tmp/content-audit")
    a = ap.parse_args()
    os.makedirs(os.path.join(a.out, "outline"), exist_ok=True)
    findings = defaultdict(list)
    pages = []
    for f in sorted(glob.glob(os.path.join(DATA, "pages", "*.json"))):
        d = load(f)
        pages.append((os.path.basename(f)[:-5], d))
    for coll in ("blog-posts", "news-articles"):
        for i, d in enumerate(load(os.path.join(DATA, f"{coll}.json"))):
            pages.append((f"{coll}__{d.get('slug') or i}", {"title": d.get("title"), "path": f"/{coll}/{d.get('slug') or i}",
                                                           "seo": d.get("seo") or {}, "sections": [dict(d, __component=coll)]}))
    blocks = []  # (page, idx, component, heading, shingles, text)
    titles, descs = defaultdict(list), defaultdict(list)
    for name, d in pages:
        path = d.get("path") or name
        seo = d.get("seo") or {}
        lines = [f"# {d.get('title')}  ({path})", "",
                 f"SEO title: {seo.get('metaTitle')!r}", f"SEO description: {seo.get('metaDescription')!r}",
                 f"SEO keywords: {seo.get('keywords')!r}", ""]
        mt, md = (seo.get("metaTitle") or "").strip(), (seo.get("metaDescription") or "").strip()
        if not mt:
            findings["seo"].append({"page": path, "issue": "missing meta title"})
        elif len(mt) > 65:
            findings["seo"].append({"page": path, "issue": f"meta title {len(mt)} chars (>65)", "value": mt})
        if not md:
            findings["seo"].append({"page": path, "issue": "missing meta description"})
        elif not 70 <= len(md) <= 165:
            findings["seo"].append({"page": path, "issue": f"meta description {len(md)} chars (aim 120-160)", "value": md})
        if not (seo.get("keywords") or "").strip() and not path.startswith(("/blog-posts", "/news-articles")):
            findings["seo"].append({"page": path, "issue": "no keywords"})
        if mt:
            titles[mt.lower()].append(path)
        if md:
            descs[md.lower()].append(path)
        headings_seen = {}
        for i, sec in enumerate(d.get("sections") or []):
            comp = sec.get("__component")
            head = (sec.get("heading") or sec.get("title") or "").strip()
            lines.append(f"## [{i}] {comp}  #{sec.get('anchorId') or ''}  — {head}")
            for p, t in flatten(sec):
                if p in ("heading", "title"):
                    continue
                t1 = t.replace("\n", " ⏎ ")
                lines.append(f"- {p}: {t1[:900]}")
                if t.startswith("[image alt=''") or t.startswith('[image alt=""'):
                    findings["alt"].append({"page": path, "section": i, "field": p})
                if PLACEHOLDER.search(t) and not p.endswith("Placeholder") and "placeholder" not in p.lower():
                    findings["placeholder"].append({"page": path, "section": i, "field": p, "text": t[:160]})
                for pat, fix in AMERICAN.items():
                    if re.search(pat, t, re.I) and "http" not in t[:8]:
                        m = re.search(pat + r"\w*", t, re.I)
                        findings["spelling"].append({"page": path, "section": i, "field": p, "word": m.group(0), "british": fix})
            ln = links_of(sec)
            if ln:
                lines.append("- links: " + "; ".join(f"{l or '(no label)'} → {h}" for l, h in ln[:30]))
            lines.append("")
            text = section_text(sec)
            if comp not in ("sections.page-hero", "sections.contact-form", "sections.events-list", "sections.office-locations",
                            "content.blog-listing", "content.news-listing") and len(text) < 40:
                findings["empty"].append({"page": path, "section": i, "component": comp, "text": text})
            key = (comp, head.lower())
            if head and key in headings_seen:
                findings["dup_in_page"].append({"page": path, "sections": [headings_seen[key], i], "heading": head})
            headings_seen[key] = i
            if len(text) > 160:
                blocks.append((path, i, comp, head, shingles(text), text))
        with open(os.path.join(a.out, "outline", f"{name}.md"), "w") as fh:
            fh.write("\n".join(lines))
    # near-duplicate blocks within a page and across pages
    for x in range(len(blocks)):
        for y in range(x + 1, len(blocks)):
            p1, i1, c1, h1, s1, t1 = blocks[x]
            p2, i2, c2, h2, s2, t2 = blocks[y]
            if not s1 or not s2:
                continue
            j = jaccard(s1, s2)
            if j >= 0.5:
                kind = "dup_in_page" if p1 == p2 else "dup_across"
                findings[kind].append({"a": f"{p1} [{i1}] {c1} — {h1}", "b": f"{p2} [{i2}] {c2} — {h2}", "similarity": round(j, 2)})
    for k, v in titles.items():
        if len(v) > 1:
            findings["seo"].append({"issue": "duplicate meta title", "value": k, "pages": v})
    for k, v in descs.items():
        if len(v) > 1:
            findings["seo"].append({"issue": "duplicate meta description", "value": k[:120], "pages": v})
    with open(os.path.join(a.out, "audit.json"), "w") as fh:
        json.dump(findings, fh, indent=1, ensure_ascii=False)
    print(f"pages/posts: {len(pages)}; outlines in {a.out}/outline")
    for k, v in findings.items():
        print(f"  {k}: {len(v)}")


if __name__ == "__main__":
    main()
