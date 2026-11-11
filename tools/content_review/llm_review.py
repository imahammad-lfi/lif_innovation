#!/usr/bin/env python3
"""LLM content review of every page/post in seed/data (one structured review per page).

Writes /tmp/r15/review/llm/<name>.json. Run: python3 llm_review.py [--only name1,name2] [--workers 6]
"""
import argparse
import concurrent.futures as cf
import glob
import json
import os
import sys
import time

from openai import OpenAI

ROOT = "/home/ubuntu/linkfields"
sys.path.insert(0, os.path.join(ROOT, "tools"))
from content_audit import flatten  # noqa: E402

OUT = "/tmp/r15/review/llm"
MODEL = "gpt-6.1-sol"

DECK = open(os.path.join(ROOT, "docs", "CORPORATE-DECK-2026.md")).read()
SITE_CONTEXT = ("""
APPROVED SOURCES. Claims that trace to these sources are approved and must NOT be flagged as unverifiable:
(a) the Linkfields Corporate Deck 2026 (full transcript below) — including its positioning, five portfolios, IP and
    accelerator names (e.g. Cyber-Safe Delivery, Modernisation & Integration Toolkit, Release Assurance Packs), the five
    commercial models, the "Up to" outcome figures and the global presence list (South Africa is HQ);
(b) linkfields.com and the site's own data: ISO/IEC 27001:2022 and ISO 9001:2015 certifications; B-BBEE Level 1
    Contributor; Great Place To Work certified; YES member; NASSCOM member; D-U-N-S registered; #35 in the FT & Statista
    Africa's Fastest Growing Companies 2026 ranking; 20+ years of leadership experience;
(c) offices: South Africa (Midrand, Gauteng — HQ), India (Hyderabad), UAE (Dubai), United Kingdom (London),
    USA (New York), Australia (Melbourne);
(d) OEM/technology partners shown on the site: SAP, Microsoft, Microsoft Azure, Salesforce, Oracle, HP, Odoo, Zoho,
    UiPath, Blue Prism;
(e) Africa Tech Festival 2026, CTICC Cape Town, 17–19 Nov 2026, Linkfields is Platinum Sponsor at Stand I74.
Only flag a claim as unverifiable when it is specific (a number, named client, award, certification, guarantee or
superlative such as "leading"/"best"/"world-class") AND not traceable to these sources. Figures from the deck must keep
their "Up to" qualifier and context.

Site conventions: British English; primary CTA label "Let's connect"; headings may use *asterisks* to mark the
highlighted (gradient) phrase — keep that convention; tone is supportive and partnership-led ("business requirements",
not "business challenges"/"problems"/aggressive sales language).

=== CORPORATE DECK 2026 (transcript) ===
""" + DECK).strip()

SYSTEM = f"""You are a senior B2B enterprise content strategist, copy editor and technical SEO lead reviewing one page of the
Linkfields corporate website before launch. Be rigorous, specific and commercially minded.

{SITE_CONTEXT}

Review the page for:
1. Content that is inappropriate, irrelevant to the page's purpose, off-brand, unprofessional, vague, padded or low-value.
2. Flow and connections: does each section lead logically to the next; are related pages/sections linked where a buyer
   would expect (only link to paths in VALID PATHS); broken narrative, dead ends, missing next step.
3. Duplicate or repetitive sections/sentences on this page, or text that repeats the hero/other sections.
4. Unverifiable or risky claims (numbers, client names, guarantees, superlatives such as "leading", "best", "world-class",
   certifications/awards not listed above). Prefer softening/removing to inventing evidence.
5. Grammar, British spelling, consistency of product/service names.
6. SEO: page-specific meta title (50–60 chars, ends with "| Linkfields"), meta description (140–158 chars, benefit-led,
   includes the primary keyword naturally), primary/secondary keywords buyers actually search for (e.g. "SAP S/4HANA
   implementation partner South Africa"), and whether headings carry the keywords.

STRICT RULES
- Never invent facts, statistics, clients, case studies, dates, certifications, partnerships or locations.
- current_text MUST be copied verbatim (exact characters) from ONE field value shown in the page outline, and
  proposed_text replaces exactly that substring. Keep markdown links, *highlight* asterisks and line breaks intact unless
  the fix is about them. Keep proposed text close to the original length (within about ±35%) so layouts still fit.
- Only raise issues that genuinely improve the page; do not rewrite good copy for style alone. Typically 0–8 issues.
- Do not change product names, legal pages' legal substance, email addresses, or event facts.
- British English throughout."""

SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["page_purpose", "overall_score", "issues", "missing_content", "seo"],
    "properties": {
        "page_purpose": {"type": "string"},
        "overall_score": {"type": "integer"},
        "issues": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["section_index", "field_path", "category", "severity", "current_text", "proposed_text", "rationale"],
                "properties": {
                    "section_index": {"type": "integer"},
                    "field_path": {"type": "string"},
                    "category": {"type": "string", "enum": ["inappropriate", "irrelevant", "weak_value", "unprofessional_tone",
                                                            "inconsistent", "flow_gap", "missing_connection", "duplicate",
                                                            "unverifiable_claim", "grammar_spelling", "seo_heading"]},
                    "severity": {"type": "string", "enum": ["high", "medium", "low"]},
                    "current_text": {"type": "string"},
                    "proposed_text": {"type": "string"},
                    "rationale": {"type": "string"},
                },
            },
        },
        "missing_content": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["after_section_index", "suggestion", "rationale"],
                "properties": {"after_section_index": {"type": "integer"}, "suggestion": {"type": "string"}, "rationale": {"type": "string"}},
            },
        },
        "seo": {
            "type": "object",
            "additionalProperties": False,
            "required": ["meta_title", "meta_description", "primary_keyword", "secondary_keywords", "notes"],
            "properties": {
                "meta_title": {"type": "string"},
                "meta_description": {"type": "string"},
                "primary_keyword": {"type": "string"},
                "secondary_keywords": {"type": "array", "items": {"type": "string"}},
                "notes": {"type": "string"},
            },
        },
    },
}


def load(p):
    with open(p) as f:
        return json.load(f)


def valid_paths():
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, "seed/data/pages/*.json"))):
        d = load(f)
        anchors = [s.get("anchorId") for s in d.get("sections", []) if s.get("anchorId")]
        out.append(f"{d['path']}  ({d.get('title')})  anchors: {', '.join('#' + a for a in anchors)}")
    return "\n".join(out)


def outline(d, max_field=6000):
    seo = d.get("seo") or {}
    lines = [f"PAGE: {d.get('title')}  PATH: {d.get('path')}",
             f"CURRENT SEO: title={seo.get('metaTitle')!r} description={seo.get('metaDescription')!r} keywords={seo.get('keywords')!r}", ""]
    for i, sec in enumerate(d.get("sections") or []):
        lines.append(f"### section_index={i} component={sec.get('__component')} anchor=#{sec.get('anchorId') or ''}")
        for p, t in flatten(sec):
            if t.startswith("[image"):
                lines.append(f"  {p} = {t}")
                continue
            lines.append(f"  {p} = {json.dumps(t[:max_field], ensure_ascii=False)}")
        for k in ("href", "ctaHref"):
            pass
        links = []

        def walk(n):
            if isinstance(n, dict):
                for k, v in n.items():
                    if k in ("href", "ctaHref", "url") and isinstance(v, str) and v:
                        links.append(f"{n.get('label') or n.get('title') or n.get('ctaLabel') or ''} -> {v}")
                    else:
                        walk(v)
            elif isinstance(n, list):
                for v in n:
                    walk(v)
        walk(sec)
        if links:
            lines.append("  LINKS: " + " | ".join(links[:40]))
        lines.append("")
    return "\n".join(lines)


def items():
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, "seed/data/pages/*.json"))):
        out.append((os.path.basename(f)[:-5], load(f)))
    for d in load(os.path.join(ROOT, "seed/data/blog-posts.json")):
        out.append((f"blog__{d['slug']}", {"title": d.get("title"), "path": f"/company/blog/{d['slug']}", "seo": d.get("seo") or {},
                                          "sections": [dict({k: v for k, v in d.items() if k not in ('seo',)}, __component="blog-post")]}))
    return out


def review(name, d, paths, client):
    dest = os.path.join(OUT, f"{name}.json")
    if os.path.exists(dest):
        return name, "cached"
    user = f"VALID PATHS (with section anchors):\n{paths}\n\n=== PAGE OUTLINE ===\n{outline(d)}"
    for attempt in range(3):
        try:
            t0 = time.time()
            r = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "system", "content": SYSTEM}, {"role": "user", "content": user}],
                response_format={"type": "json_schema", "json_schema": {"name": "page_review", "strict": True, "schema": SCHEMA}},
                max_completion_tokens=16000,
                extra_body={"reasoning": {"effort": "medium"}},
            )
            data = json.loads(r.choices[0].message.content)
            data["_usage"] = {"in": r.usage.prompt_tokens, "out": r.usage.completion_tokens, "secs": round(time.time() - t0)}
            with open(dest, "w") as fh:
                json.dump(data, fh, indent=1, ensure_ascii=False)
            return name, f"ok {len(data['issues'])} issues score {data['overall_score']} ({data['_usage']})"
        except Exception as e:  # noqa: BLE001
            err = str(e)
            if "Insufficient credits" in err or "Unsupported model" in err:
                return name, "FATAL " + err[:200]
            time.sleep(5 * (attempt + 1))
    return name, "FAILED " + err[:200]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only")
    ap.add_argument("--workers", type=int, default=6)
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    paths = valid_paths()
    todo = items()
    if a.only:
        keep = set(a.only.split(","))
        todo = [t for t in todo if t[0] in keep]
    client = OpenAI()
    with cf.ThreadPoolExecutor(a.workers) as ex:
        futs = [ex.submit(review, n, d, paths, client) for n, d in todo]
        for i, fu in enumerate(cf.as_completed(futs), 1):
            n, msg = fu.result()
            print(f"[{i}/{len(todo)}] {n}: {msg}", flush=True)
            if msg.startswith("FATAL"):
                print("stopping: fatal error", flush=True)
                ex.shutdown(cancel_futures=True)
                break


if __name__ == "__main__":
    main()
