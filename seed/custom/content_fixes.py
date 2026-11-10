"""Final, auditable content corrections and SEO metadata (seed/custom/content_fixes.json).

Applied by apply.py after every builder, so each entry states exactly what changes on which page:

{
  "pages": {
    "/path": {
      "seo": {"metaTitle": "...", "metaDescription": "...", "keywords": "..."},
      "edits": [{"section": "anchor-id or index", "field": "items[0].description", "find": "...", "replace": "..."}]
    }
  },
  "posts": {"slug": {"seo": {...}, "edits": [...]}}
}

An edit whose `find` text is missing is reported (not silently dropped) unless its `replace` text is already present.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
_TOKEN = re.compile(r"([^.\[\]]+)|\[(\d+)\]")


def load():
    p = os.path.join(HERE, "content_fixes.json")
    if not os.path.exists(p):
        return {"pages": {}, "posts": {}}
    with open(p) as f:
        return json.load(f)


def _walk(node, field):
    """Return (container, key) for a dotted/indexed path such as items[0].description."""
    parts = [(m.group(1), m.group(2)) for m in _TOKEN.finditer(field)]
    cur = node
    for n, (name, idx) in enumerate(parts):
        key = name if name is not None else int(idx)
        last = n == len(parts) - 1
        if last:
            return cur, key
        cur = cur[key]
    raise KeyError(field)


def _section(doc, ref):
    secs = doc.get("sections") or []
    if isinstance(ref, int) or (isinstance(ref, str) and ref.isdigit()):
        return secs[int(ref)]
    for s in secs:
        if s.get("anchorId") == ref:
            return s
    raise KeyError(f"section {ref!r}")


def _apply(target, spec, label, report, root_for_edits):
    seo = spec.get("seo")
    if seo:
        cur = dict(target.get("seo") or {})
        cur.update({k: v for k, v in seo.items() if not k.startswith("_")})
        target["seo"] = cur
    for e in spec.get("edits", []):
        try:
            base = root_for_edits(e)
            box, key = _walk(base, e["field"])
            val = box[key]
        except (KeyError, IndexError, TypeError) as err:
            report.append(f"{label}: cannot locate {e.get('section')} {e.get('field')} ({err})")
            continue
        if not isinstance(val, str):
            report.append(f"{label}: {e['field']} is not text")
            continue
        if e["find"] in val:
            box[key] = val.replace(e["find"], e["replace"], 1)
        elif e["replace"] not in val:
            report.append(f"{label}: text not found in {e.get('section')} {e['field']}: {e['find'][:70]!r}")


def apply_page(doc, fixes, report):
    spec = fixes.get("pages", {}).get(doc.get("path"))
    if spec:
        _apply(doc, spec, doc.get("path"), report, lambda e: _section(doc, e["section"]))


def apply_posts(posts, fixes, report):
    for post in posts:
        spec = fixes.get("posts", {}).get(post.get("slug"))
        if spec:
            _apply(post, spec, f"post {post.get('slug')}", report, lambda e, p=post: p)
