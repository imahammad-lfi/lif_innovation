"""Shared helpers for turning the crawled TinaCMS documents into Strapi 5 seed JSON.

Every family module (seed/transform/families/<family>.py) uses these helpers. Output conventions:

* A page is ``{"title", "path", "seo", "sections": [ {"__component": "<category>.<name>", ...fields} ]}``
* A media field is ``media(url)`` -> ``{"__media": "<path under seed/assets>", "width", "height", "mime", "alt"}``
  (the Strapi seeder uploads the file and replaces the object with the upload id; the website's
  local-content mode turns it into ``{url: "/seed-assets/<path>", ...}``).
* Long-form text becomes Markdown (Strapi ``richtext`` fields) via ``md(tina_rich_text)``.
"""
from __future__ import annotations

import atexit
import html as htmllib
import json
import os
import re
from functools import lru_cache
from urllib.parse import quote, unquote, urljoin

CRAWL = "/home/ubuntu/lf-crawl"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ASSETS = os.path.join(ROOT, "seed", "assets")
ORIGIN = "https://www.linkfields.com"
COMMON_DOCS = {"navbar", "footer", "blogsCollection", "featuredBlogs", "contactusbanner"}


# ------------------------------------------------------------------ source documents
def _strip(o):
    if isinstance(o, dict):
        return {k: _strip(v) for k, v in o.items() if k not in ("__typename", "_sys", "id")}
    if isinstance(o, list):
        return [_strip(x) for x in o]
    return o


@lru_cache(maxsize=None)
def load_docs(page_key: str) -> dict:
    """All TinaCMS documents rendered on a crawled page, e.g. load_docs('services__engineering__devops').

    Keys are Tina document names (e.g. 'devOpsPage', 'persistentlyInnovative', 'navbar').
    """
    path = os.path.join(CRAWL, "data", f"{page_key}.json")
    if not os.path.exists(path):
        return {}
    return _strip(json.load(open(path)))


def page_doc(page_key: str) -> dict:
    """The page-specific document (the one that isn't navbar/footer/insights/etc.)."""
    docs = load_docs(page_key)
    skip = COMMON_DOCS | {"persistentlyInnovative", "constantlyInnovating"}
    cands = {k: v for k, v in docs.items() if k not in skip and isinstance(v, dict)}
    if len(cands) == 1:
        return next(iter(cands.values()))
    return cands


def key_to_path(page_key: str) -> str:
    """'services__engineering__devops' -> '/services/engineering/devops'; 'home' -> '/'"""
    if page_key == "home":
        return "/"
    return "/" + page_key.replace("__", "/")


# ------------------------------------------------------------------ media
@lru_cache(maxsize=1)
def _manifest() -> dict:
    p = os.path.join(ASSETS, "manifest.json")
    return json.load(open(p)) if os.path.exists(p) else {}


def _normalize_url(url: str) -> str:
    url = url.strip()
    if url.startswith("//"):
        url = "https:" + url
    if url.startswith("/"):
        url = urljoin(ORIGIN, url)
    return url


_DIRTY = {"manifest": False}


def _save_manifest():
    if _DIRTY["manifest"]:
        # merge with what's on disk (other builds may have added entries meanwhile), write atomically
        path = os.path.join(ASSETS, "manifest.json")
        try:
            on_disk = json.load(open(path))
        except Exception:
            on_disk = {}
        on_disk.update(_manifest())
        tmp = f"{path}.{os.getpid()}.tmp"
        json.dump(on_disk, open(tmp, "w"), indent=1, ensure_ascii=False)
        os.replace(tmp, path)
        _DIRTY["manifest"] = False


atexit.register(_save_manifest)


def _download(full: str) -> dict | None:
    """Fetch an asset that the crawl missed, store it under seed/assets and add it to the manifest."""
    import mimetypes
    import urllib.request
    from urllib.parse import urlparse

    u = urlparse(full)
    path = unquote(u.path).lstrip("/")
    if u.netloc == "images-linkfields-poc.s3.eu-west-2.amazonaws.com":
        rel = f"s3/{path}"
    elif u.netloc in ("www.linkfields.com", "linkfields.com"):
        rel = f"site/{path}"
    else:
        rel = f"ext/{u.netloc}/{path}"
    dst = os.path.join(ASSETS, rel)
    try:
        req = urllib.request.Request(quote(full, safe=":/?&=%#()!,'@+"), headers={"User-Agent": "Mozilla/5.0"})
        data = urllib.request.urlopen(req, timeout=60).read()
    except Exception as exc:
        print(f"  [media] download failed {full}: {exc}")
        return None
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    open(dst, "wb").write(data)
    mime = mimetypes.guess_type(dst)[0] or "application/octet-stream"
    width = height = None
    try:
        from PIL import Image

        with Image.open(dst) as im:
            width, height = im.size
    except Exception:
        pass
    meta = {"path": rel, "width": width, "height": height, "mime": mime, "bytes": len(data)}
    _manifest()[full] = meta
    _DIRTY["manifest"] = True
    print(f"  [media] downloaded {rel}")
    return meta


def media(url: str | None, alt: str | None = None) -> dict | None:
    """Reference an original asset URL (absolute S3 URL or site-relative '/images/x.png')."""
    if not url or not isinstance(url, str):
        return None
    full = _normalize_url(url)
    m = _manifest()
    meta = m.get(full)
    if meta is None:
        # try encoded/decoded variants
        for cand in (unquote(full), quote(full, safe=":/?&=%#()!,'"), full.replace(" ", "%20")):
            if cand in m:
                meta = m[cand]
                break
    if meta is None:
        # fallback: match by decoded path suffix
        tail = unquote(full.split("?")[0]).split("/", 3)[-1]
        for k, v in m.items():
            if unquote(k.split("?")[0]).endswith(tail):
                meta = v
                break
    if meta is None:
        meta = _download(full)
    if meta is None:
        print(f"  [media] missing asset for {url}")
        return None
    return {
        "__media": meta["path"],
        "width": meta.get("width"),
        "height": meta.get("height"),
        "mime": meta.get("mime"),
        "alt": alt or "",
    }


# ------------------------------------------------------------------ text
def _text_of(node) -> str:
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return "".join(_text_of(n) for n in node)
    if node.get("type") == "text":
        return node.get("text", "")
    return "".join(_text_of(c) for c in node.get("children", []) or [])


def plain(rich) -> str:
    """Tina rich-text (or str) -> plain text, paragraphs separated by blank lines."""
    if rich is None:
        return ""
    if isinstance(rich, str):
        return rich.strip()
    if isinstance(rich, dict) and rich.get("type") == "root":
        parts = [_text_of(c).strip() for c in rich.get("children", [])]
        return "\n\n".join(p for p in parts if p)
    return _text_of(rich).strip()


def _inline(nodes) -> str:
    out = []
    for n in nodes or []:
        t = n.get("type")
        if t == "text":
            s = n.get("text", "")
            if not s:
                continue
            lead = len(s) - len(s.lstrip())
            trail = len(s) - len(s.rstrip())
            core = s.strip()
            if core:
                if n.get("code"):
                    core = f"`{core}`"
                if n.get("bold"):
                    core = f"**{core}**"
                if n.get("italic"):
                    core = f"*{core}*"
                if n.get("strikethrough"):
                    core = f"~~{core}~~"
            out.append(s[:lead] + core + (s[len(s) - trail:] if trail else ""))
        elif t == "a":
            out.append(f"[{_inline(n.get('children'))}]({n.get('url', '')})")
        elif t == "break":
            out.append("  \n")
        elif t == "img":
            out.append(f"![{n.get('alt') or ''}]({n.get('url', '')})")
        else:
            out.append(_inline(n.get("children")))
    return "".join(out)


def _block(n, depth=0) -> str:
    t = n.get("type")
    kids = n.get("children") or []
    if t in ("h1", "h2", "h3", "h4", "h5", "h6"):
        return "#" * int(t[1]) + " " + _inline(kids).strip()
    if t == "p":
        return _inline(kids).strip()
    if t in ("ul", "ol"):
        lines = []
        for i, li in enumerate(kids, 1):
            bullet = f"{i}." if t == "ol" else "-"
            body_parts = []
            for c in li.get("children") or []:
                if c.get("type") in ("ul", "ol"):
                    body_parts.append("\n" + "\n".join("   " + x for x in _block(c, depth + 1).split("\n")))
                elif c.get("type") == "lic":
                    body_parts.append(_inline(c.get("children")).strip())
                else:
                    body_parts.append(_inline(c.get("children")).strip() if c.get("type") != "text" else _inline([c]))
            lines.append(f"{bullet} " + "".join(body_parts).strip())
        return "\n".join(lines)
    if t == "blockquote":
        return "\n".join("> " + x for x in _inline(kids).split("\n"))
    if t == "hr":
        return "---"
    if t == "img":
        return f"![{n.get('alt') or ''}]({n.get('url', '')})"
    if t == "code_block":
        return f"```{n.get('lang') or ''}\n{n.get('value', '')}\n```"
    if t == "html":
        return n.get("value", "")
    if t == "table":
        rows = []
        for r in kids:
            rows.append([_inline(c.get("children")).strip().replace("|", "\\|") for c in r.get("children") or []])
        if not rows:
            return ""
        w = max(len(r) for r in rows)
        rows = [r + [""] * (w - len(r)) for r in rows]
        out = ["| " + " | ".join(rows[0]) + " |", "|" + "---|" * w]
        out += ["| " + " | ".join(r) + " |" for r in rows[1:]]
        return "\n".join(out)
    if t == "text":
        return _inline([n])
    return _inline(kids)


def md(rich) -> str:
    """Tina rich-text AST (or plain string) -> Markdown for Strapi richtext fields."""
    if rich is None:
        return ""
    if isinstance(rich, str):
        return rich.strip()
    if isinstance(rich, dict) and rich.get("type") == "root":
        blocks = [_block(c) for c in rich.get("children", [])]
        return "\n\n".join(b for b in blocks if b and b.strip())
    if isinstance(rich, list):
        return "\n\n".join(md(r) for r in rich)
    return _inline([rich])


def slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return s or "section"


def clean(s):
    """Trim strings, collapse internal double spaces; leaves non-strings untouched."""
    if isinstance(s, str):
        return re.sub(r"[ \t]{2,}", " ", s).strip()
    return s


def link(label, href, new_tab=None) -> dict:
    href = (href or "").strip()
    return {"label": clean(label) or "", "href": href, "openInNewTab": bool(new_tab) or href.startswith("http")}


# ------------------------------------------------------------------ SEO + anchors from crawled HTML
@lru_cache(maxsize=None)
def _raw_html(page_key: str) -> str:
    p = os.path.join(CRAWL, "pages", f"{page_key}.html")
    return open(p, encoding="utf-8", errors="ignore").read() if os.path.exists(p) else ""


def _meta(html: str, attr: str, name: str) -> str | None:
    m = re.search(rf'<meta[^>]+{attr}="{re.escape(name)}"[^>]*content="([^"]*)"', html) or re.search(
        rf'<meta[^>]+content="([^"]*)"[^>]*{attr}="{re.escape(name)}"', html
    )
    return htmllib.unescape(m.group(1)).strip() if m else None


def seo(page_key: str, fallback_title: str = "") -> dict:
    html = _raw_html(page_key)
    t = re.search(r"<title[^>]*>(.*?)</title>", html, re.S)
    title = htmllib.unescape(t.group(1)).strip() if t else fallback_title
    data = {
        "metaTitle": title or fallback_title or "Linkfields",
        "metaDescription": _meta(html, "name", "description") or "",
        "keywords": _meta(html, "name", "keywords") or "",
        "canonicalUrl": "",
        "noIndex": False,
    }
    og = _meta(html, "property", "og:image")
    if og:
        img = media(og)
        if img:
            data["ogImage"] = img
    return data


@lru_cache(maxsize=None)
def hero_tabs(page_key: str) -> list[str]:
    """Labels of the anchor tab strip at the bottom of the inner-page hero (e.g. OVERVIEW, GET IN TOUCH)."""
    p = os.path.join(CRAWL, "rendered", f"{page_key}.html")
    if not os.path.exists(p):
        return []
    html = open(p, encoding="utf-8", errors="ignore").read()
    m = re.search(r'<div class="[^"]*absolute bottom-0 w-full[^"]*">(.*?)</div>', html, re.S)
    if not m:
        return []
    return [htmllib.unescape(re.sub(r"<[^>]+>", "", b)).strip() for b in re.findall(r"<button[^>]*>(.*?)</button>", m.group(1), re.S)]


def anchor_links(page_key: str, overrides: dict | None = None) -> list[dict]:
    """[{label, targetId}] for the hero tab strip. targetId = slug(label) unless overridden."""
    overrides = overrides or {}
    return [{"label": l, "targetId": overrides.get(l, slug(l))} for l in hero_tabs(page_key)]


# ------------------------------------------------------------------ common section builders
def hero_section(page_key: str, hero: dict, *, anchors: list | None = None) -> dict:
    """sections.page-hero from a Tina heroSectionData {heading1, subheading1, imagesrc}."""
    return {
        "__component": "sections.page-hero",
        "title": clean(hero.get("heading1")) or "",
        "subtitle": clean(hero.get("subheading1")) or "",
        "backgroundImage": media(hero.get("imagesrc"), clean(hero.get("heading1"))),
        "anchorLinks": anchors if anchors is not None else anchor_links(page_key),
    }


def overview_section(hero: dict, *, anchor_id="overview", theme="light") -> dict:
    """sections.overview from heroSectionData {status1, subheading2, para1, status2, subheading3, para2}."""
    return {
        "__component": "sections.overview",
        "anchorId": anchor_id,
        "eyebrow": clean(hero.get("status1")) or "",
        "heading": clean(hero.get("subheading2")) or "",
        "body": md(hero.get("para1")),
        "secondaryEyebrow": clean(hero.get("status2")) or "",
        "secondaryHeading": clean(hero.get("subheading3")) or "",
        "secondaryBody": md(hero.get("para2")),
        "theme": theme,
    }


def message_banner(doc: dict | None, *, anchor_id: str = "") -> dict | None:
    """sections.message-banner from Tina {title, description, url, urlMessage}."""
    if not doc:
        return None
    return {
        "__component": "sections.message-banner",
        "anchorId": anchor_id,
        "title": clean(doc.get("title")) or "",
        "description": clean(doc.get("description")) or "",
        "ctaLabel": clean(doc.get("urlMessage")) or "",
        "ctaUrl": (doc.get("url") or "").strip(),
    }


def stats_band(doc: dict | None = None, *, anchor_id: str = "") -> dict:
    """sections.stats-band from the shared Tina 'persistentlyInnovative' document."""
    doc = doc or json.load(open(os.path.join(CRAWL, "clean", "persistentlyInnovative.json")))
    return {
        "__component": "sections.stats-band",
        "anchorId": anchor_id,
        "eyebrow": clean(doc.get("status")) or "",
        "heading": clean(doc.get("title")) or "",
        "description": clean(doc.get("description")) or "",
        "backgroundImage": media("/backgroud-images/persistently_innovative.jpg", "Persistently innovative background"),
        "stats": [
            {"value": str(a.get("time") or ""), "suffix": a.get("suffix") or "", "label": clean(a.get("description")) or ""}
            for a in doc.get("analytics") or []
        ],
    }


INDUSTRY_LINKS = {
    "Telecom": "/industries/telecom",
    "Fintech": "/industries/fintech",
    "FMCG": "/industries/fmcg",
    "Banking": "/industries/banking",
    "Insurance": "/industries/insurance",
    "Mining": "/industries/mining",
    "Oil and Gas": "/industries/oil-gas",
    "Manufacturing": "/industries/manufacturing",
}


def industries_showcase(doc: dict | None = None, *, anchor_id: str = "") -> dict:
    """sections.industries-showcase from the shared Tina 'constantlyInnovating' document."""
    doc = doc or json.load(open(os.path.join(CRAWL, "clean", "constantlyInnovating.json")))
    return {
        "__component": "sections.industries-showcase",
        "anchorId": anchor_id,
        "eyebrow": clean(doc.get("status")) or "",
        "heading": clean(doc.get("title")) or "",
        "description": clean(doc.get("description")) or "",
        "backgroundImage": media("/backgroud-images/constantly-innovating.jpg", "Constantly innovating background"),
        "items": [
            {
                "title": clean(i.get("title")) or "",
                "image": media(i.get("cardImage"), clean(i.get("title"))),
                "href": INDUSTRY_LINKS.get(clean(i.get("title")), ""),
            }
            for i in doc.get("imageBlock") or []
        ],
    }


def featured_insights(*, anchor_id: str = "insights", heading: str = "") -> dict:
    """sections.featured-insights – cards come from Global › insights unless items are given."""
    return {"__component": "sections.featured-insights", "anchorId": anchor_id, "heading": heading, "items": []}


def contact_theme(page_key: str) -> str:
    """'dark' or 'light' – detected from the crawled page (light variant uses bg-[#E5E8E8])."""
    p = os.path.join(CRAWL, "rendered", f"{page_key}.html")
    html = open(p, encoding="utf-8", errors="ignore").read() if os.path.exists(p) else ""
    return "light" if "bg-[#E5E8E8]" in html and "bg-[#161211]" not in html else "dark"


def contact_form(*, anchor_id: str = "get-in-touch", layout: str = "section", theme: str = "dark", page_key: str | None = None) -> dict:
    """sections.contact-form – copy & options come from Global › contactForm. Pass page_key to auto-detect theme."""
    if page_key:
        theme = contact_theme(page_key)
    return {"__component": "sections.contact-form", "anchorId": anchor_id, "heading": "", "subheading": "", "nextStepsTitle": "", "nextSteps": [], "layout": layout, "theme": theme}


def social_banner() -> dict:
    """sections.social-banner – links come from Global › socialBannerLinks."""
    return {"__component": "sections.social-banner", "heading": "", "links": []}


def page(page_key: str, title: str, sections: list, path: str | None = None) -> dict:
    return {
        "title": title,
        "path": path or key_to_path(page_key),
        "seo": seo(page_key, title),
        "sections": [s for s in sections if s],
    }


def standard_tail(page_key: str | None = None) -> list:
    """Insights + contact form + follow-us banner, which close almost every page."""
    return [featured_insights(), contact_form(page_key=page_key), social_banner()]
