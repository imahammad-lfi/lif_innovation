#!/usr/bin/env python3
"""Apply the 5-service portfolio (seed/custom) on top of the crawled seed data in seed/data.

    python3 seed/custom/apply.py                 # full apply (also run automatically at the end of seed/transform/build.py)
    python3 seed/custom/apply.py <file.json>...  # only (re)publish the given hand-authored pages from seed/custom/pages

Full apply is idempotent and does, in order:
  1. copies every seed/custom/pages/*.json to seed/data/pages/<path-as-file>.json
  2. deletes seed/data/pages for every retired path (each `source` in apps/web/redirects.json)
  3. rewrites links to retired paths everywhere in seed/data (JSON string values, Markdown links, absolute
     linkfields.com URLs) using apps/web/redirects.json plus the per-section overrides in portfolio.json
  4. rebuilds the Services mega menu, footer "Services" column, contact-form service options (global.json) and the
     home "Our Services" tiles (pages/index.json) from seed/custom/portfolio.json
  5. applies the corporate-deck page layouts and content from seed/custom/deck.py (home, services, portfolios,
     about us, our approach, products hub)
"""
import json
import os
import re
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import site_global  # noqa: E402
import deck  # noqa: E402  (corporate-deck layouts and content, see seed/custom/deck.py)
import content_fixes  # noqa: E402  (final auditable copy corrections and SEO metadata)

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CUSTOM = os.path.join(ROOT, "seed", "custom")
DATA = os.path.join(ROOT, "seed", "data")
PAGES = os.path.join(DATA, "pages")
REDIRECTS = os.path.join(ROOT, "apps", "web", "redirects.json")


def page_file(path: str) -> str:
    return "index" if path == "/" else path.strip("/").replace("/", "__")


def load(p):
    with open(p) as f:
        return json.load(f)


def save(p, data):
    tmp = p + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)
    os.replace(tmp, p)


def publish(files):
    out = []
    for f in files:
        src = f if os.path.isabs(f) else os.path.join(CUSTOM, "pages", os.path.basename(f))
        doc = load(src)
        path = doc.get("path")
        if not path or not path.startswith("/"):
            raise SystemExit(f"{src}: missing/invalid 'path'")
        dst = os.path.join(PAGES, page_file(path) + ".json")
        portfolio = load(os.path.join(CUSTOM, "portfolio.json"))
        patch_industries_sections(doc, portfolio)
        deck.apply(doc)
        site_rules(doc)
        save(dst, doc)
        out.append(path)
    return out


# ---------------------------------------------------------------- site-wide rules (review, 9 Nov 2026)
HUB_PATHS = {"/", "/services", "/solutions", "/industries", "/products-and-accelerators"}
SOCIAL_PATHS = {"/careers"}
SKIP_KEYS = {"__component", "__media", "href", "url", "ctaUrl", "ctaHref", "path", "slug", "anchorId", "targetId", "platform",
             "handle", "mime", "canonicalUrl", "value", "embedUrl", "videoUrl"}
_UK_STEMS = ("speciali", "organi", "optimi", "utili", "analy", "prioriti", "customi", "moderni", "digiti", "digitali", "standardi",
             "minimi", "maximi", "centrali", "reali", "recogni", "visuali", "personali", "mobili", "moneti", "synchroni", "authori",
             "operationali", "industriali", "categori", "capitali", "democrati", "harmoni", "summari", "emphasi", "materiali",
             "contextuali", "virtuali", "containeri", "tokeni", "monetis", "globali", "localis", "localiz", "revolutioni", "incentivi",
             "finali", "initiali", "normali", "rationali", "stabili", "sanitiz", "sanitis", "anonymi", "producti", "commerciali", "familiari", "energi", "strategi", "sociali", "modulari", "itemi", "legitimi", "memori", "critici", "apologi")
_UK_RE = re.compile(r"\b(" + "|".join(sorted({s.rstrip("sz") if s.endswith(("s", "z")) and s[-2] == "i" else s for s in _UK_STEMS}, key=len, reverse=True))
                    + r")z(e|es|ed|ing|ation|ations|ational|ationally|er|ers|able)\b", re.I)
_UK_PAIRS = {
    "behavior": "behaviour", "behaviors": "behaviours", "behavioral": "behavioural", "color": "colour", "colors": "colours",
    "colored": "coloured", "colorful": "colourful", "favor": "favour", "favorable": "favourable", "favorite": "favourite",
    "favorites": "favourites", "labor": "labour", "catalog": "catalogue", "catalogs": "catalogues", "enrollment": "enrolment",
    "enrollments": "enrolments", "modeling": "modelling", "modeled": "modelled", "fulfillment": "fulfilment", "fulfill": "fulfil",
    "labeled": "labelled", "labeling": "labelling", "traveling": "travelling", "canceled": "cancelled", "defense": "defence",
    "center of excellence": "centre of excellence", "centers of excellence": "centres of excellence",
}
_UK_WORD_RE = re.compile(r"\b(" + "|".join(sorted(map(re.escape, _UK_PAIRS), key=len, reverse=True)) + r")\b", re.I)


def _case_like(src, rep):
    sw, rw = src.split(" "), rep.split(" ")
    if len(sw) > 1 and len(sw) == len(rw):
        return " ".join(_case_like(a, b) for a, b in zip(sw, rw))
    if src.isupper():
        return rep.upper()
    if src[0].isupper():
        return rep[0].upper() + rep[1:]
    return rep


_UK_KEEP = ("World Health Organization", "International Organization for Standardization", "Organization for Economic")


def _uk(text):
    if not text or not isinstance(text, str) or text.startswith(("http", "/")):
        return text
    keep = {}
    for i, k in enumerate(_UK_KEEP):
        if k in text:
            keep[f"\u0000{i}\u0000"] = k
            text = text.replace(k, f"\u0000{i}\u0000")
    text = _UK_RE.sub(lambda m: m.group(1) + ("S" if m.group(0)[len(m.group(1))] == "Z" else "s") + m.group(2), text)
    text = _UK_WORD_RE.sub(lambda m: _case_like(m.group(0), _UK_PAIRS[m.group(0).lower()]), text)
    for ph, k in keep.items():
        text = text.replace(ph, k)
    return text


def british(obj, key=None):
    if isinstance(obj, dict):
        for k, v in list(obj.items()):
            if k in SKIP_KEYS:
                continue
            if isinstance(v, str):
                obj[k] = _uk(v)
            else:
                british(v, k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            obj[i] = _uk(v) if isinstance(v, str) else british(v, key) or v
    return obj


# CTA lexicon (9 Nov review): one primary conversion label site-wide, buyer-centred contact titles.
CTA_PRIMARY = "Let\u2019s connect"
_CTA_KEYS = ("label", "ctaLabel", "buttonLabel", "linkLabel", "secondaryCtaLabel", "primaryCtaLabel")
_CTA_GENERIC = ("Let's connect", "Get in touch", "Contact us", "Contact Us", "Talk to us", "Talk to an expert", "Discuss your challenge")


def _contact_title(t):
    m = re.match(r"^Discuss your (.+)$", t)
    if m:
        return "Tell us about your " + m.group(1)
    m = re.match(r"^Discuss (.+)$", t)
    if m:
        return "Talk to us about " + m.group(1)
    return t


# Supportive wording (9 Nov, 12:33): talk about the client's requirements and outcomes, not "challenges".
# Values copy ("challenge ideas constructively"), insights references and quoted speech are deliberately untouched.
_SUPPORTIVE = [
    (r"\bTell us about your (enterprise |business )?challenge\b", "Tell us about your business requirements"),
    (r"\bTell us about your ([a-z]+) challenge\b", r"Tell us about your \1 requirements"),
    (r"\[discuss your challenge\]", "[talk to us about your requirements]"),
    (r"\[Discuss your ([a-z]+) challenge\]", r"[Talk to us about your \1 requirements]"),
    (r"\baround your business challenge\b", "around your business requirements"),
    (r"\baround the enterprise challenge\b", "around your business requirements"),
    (r"\baround one challenge\b", "around one business outcome"),
    (r"\bStart with your business challenge\b", "Start with your business requirements"),
    (r"^Start with the challenge$", "Start with your requirements"),
    (r"^Which challenge are you facing\?$", "What would you like to achieve?"),
    (r"^Start with the \*challenge\* you need to solve$", "Start with the *outcome* you want to achieve"),
    (r"\bWe begin with the business challenge\b", "We begin with your business requirements"),
    (r"\bAgree the real challenge\b", "Agree the real requirements"),
    (r"^From challenge to acceptance evidence$", "From requirements to acceptance evidence"),
    (r"\bFor a services or project challenge\b", "For a services or project requirement"),
    (r"\bto your next challenge\b", "to your next initiative"),
]


def supportive(obj):
    if isinstance(obj, dict):
        for k, v in list(obj.items()):
            if isinstance(v, str):
                for pat, rep in _SUPPORTIVE:
                    v = re.sub(pat, rep, v)
                obj[k] = v
            else:
                supportive(v)
    elif isinstance(obj, list):
        for v in obj:
            supportive(v)


def cta_lexicon(obj, comp=None):
    if isinstance(obj, dict):
        c = obj.get("__component", comp)
        for k, v in list(obj.items()):
            if isinstance(v, str):
                if c == "sections.contact-form" and k == "heading" and v in ("", "Let's connect", "Get in touch", "Contact us", "Contact Us"):
                    obj[k] = CTA_PRIMARY
                elif c == "sections.contact-form" and k == "subheading":
                    obj[k] = _contact_title(v)
                elif k in _CTA_KEYS and (v in _CTA_GENERIC or re.match(r"^Discuss\b", v)):
                    obj[k] = CTA_PRIMARY
            else:
                cta_lexicon(v, c)
    elif isinstance(obj, list):
        for v in obj:
            cta_lexicon(v, comp)


def site_rules(doc):
    """Removals that apply to every page, plus a British English pass over all text."""
    path = doc.get("path")
    secs = doc.get("sections") or []
    keep = []
    for s in secs:
        comp = s.get("__component")
        if comp == "sections.social-banner" and path not in SOCIAL_PATHS:
            continue
        if comp == "sections.featured-insights" and path not in HUB_PATHS:
            continue
        keep.append(s)
    doc["sections"] = keep
    present = {s.get("anchorId") for s in keep} | {s.get("pastAnchorId") or "past-events" for s in keep if s.get("__component") == "sections.events-list"}
    for s in keep:
        if s.get("__component") == "sections.page-hero" and s.get("anchorLinks"):
            s["anchorLinks"] = [a for a in s["anchorLinks"] if a.get("targetId") in present]
        if s.get("__component") == "sections.value-plays":
            # every value play links to its solution page (except on that page itself)
            for play in s.get("plays") or []:
                url = deck.SOLUTION_URLS.get(play.get("title"))
                if url and not play.get("href") and url != path:
                    play["href"] = url
                    play.setdefault("linkLabel", "Explore this play")
    cta_lexicon(doc)
    supportive(doc)
    british(doc)


def redirect_map():
    return {r["source"]: r["destination"] for r in load(REDIRECTS)}


def make_rewriter(mapping):
    # longest first so /services/cloud/ipaas wins over /services/cloud
    olds = sorted(mapping, key=len, reverse=True)
    alt = "|".join(re.escape(o) for o in olds)
    exact = re.compile(rf"^(?:https?://(?:www\.)?linkfields\.com)?({alt})/?(#[^\s]*)?$")
    inline = re.compile(rf"(\]\(|href=\"|https?://(?:www\.)?linkfields\.com)({alt})(?=[/)#\"\s?]|$)")
    quick = re.compile(alt)

    def rewrite(value: str, overrides=None) -> str:
        table = {**mapping, **(overrides or {})}
        m = exact.match(value)
        if m:
            return table[m.group(1)] + (m.group(2) or "")

        def sub(mm):
            prefix = mm.group(1)
            if prefix.startswith("http"):
                prefix = ""  # make absolute links site-relative
                return prefix + table[mm.group(2)]
            return prefix + table[mm.group(2)]

        return inline.sub(sub, value) if quick.search(value) else value

    return rewrite


def walk(obj, rewrite, overrides_by_component, current=None):
    if isinstance(obj, dict):
        comp = obj.get("__component", current)
        for k, v in list(obj.items()):
            if isinstance(v, str):
                obj[k] = rewrite(v, overrides_by_component.get(comp))
            else:
                walk(v, rewrite, overrides_by_component, comp)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            if isinstance(v, str):
                obj[i] = rewrite(v, overrides_by_component.get(current))
            else:
                walk(v, rewrite, overrides_by_component, current)


def media(path, alt=None):
    m = {"__media": path}
    if alt:
        m["alt"] = alt
    return m


SUB_ICON_DIR = os.path.join(ROOT, "seed", "assets", "custom", "icons", "sub")


def with_icon(l):
    """Attach the menu sub-link icon (custom/icons/sub/<slug>.svg, generated by tools/mksubicons.mjs)."""
    l = dict(l)
    href = l.get("href") or ""
    key = (href.split("#", 1)[1] if "#" in href else href.rstrip("/").rsplit("/", 1)[-1]).lower()
    if key and os.path.exists(os.path.join(SUB_ICON_DIR, key + ".svg")):
        l["icon"] = media(f"custom/icons/sub/{key}.svg", "")
    return l


def patch_global(g, portfolio):
    services = portfolio["services"]
    nav = next(grp for grp in g["navigation"] if grp["label"] == "Services")
    nav["items"] = [
        {
            "label": s["label"],
            "href": s["href"],
            "description": None,
            "icon": media(s["icon"], s["label"]),
            "openInNewTab": False,
            "ctaLabel": None,
            "ctaHref": None,
            "links": [with_icon(l) for l in s["links"]],
            "groupLabel": s["groupLabel"],
            "groupLinks": [with_icon(with_logo(l)) for l in s["groupLinks"]],
            "accent": s.get("accent"),
        }
        for s in services
    ]
    col = next(c for c in g["footerColumns"] if c["title"] == "Services")
    col["links"] = [{"label": s["label"], "href": s["href"], "openInNewTab": False} for s in services]
    cf = g.get("contactForm") or {}
    if "serviceOptions" in cf:
        opts, seen = [], set()
        for s in services:
            for l in s["links"]:
                if l["label"] not in seen:
                    seen.add(l["label"])
                    opts.append({"label": l["label"], "value": l["label"]})
        opts.append({"label": "Products & accelerators (licence / SaaS)", "value": "Products & Accelerators"})
        opts.append({"label": "Others", "value": "Others"})
        cf["serviceOptions"] = opts


LOGOS = os.path.join(ROOT, "seed", "assets", "custom", "logos")


def png_size(path):
    """(width, height) from the PNG IHDR header; no PIL needed. (0, 0) if the file is not a readable PNG."""
    try:
        with open(path, "rb") as fh:
            head = fh.read(24)
        if head[:8] == b"\x89PNG\r\n\x1a\n" and head[12:16] == b"IHDR":
            return int.from_bytes(head[16:20], "big"), int.from_bytes(head[20:24], "big")
    except OSError:
        pass
    return 0, 0


def with_logo(link):
    """Product links get their logo (seed/assets/custom/logos/<slug>.png) unless the mark is a very wide wordmark."""
    out = dict(link)
    slug = (link.get("href") or "").rstrip("/").rsplit("/", 1)[-1]
    f = os.path.join(LOGOS, slug + ".png")
    if slug and os.path.exists(f):
        w, h = png_size(f)
        wide = w / max(h, 1) > 7
        if not wide:
            out["logo"] = media(f"custom/logos/{slug}.png", link.get("label"))
    return out


def patch_product_hero(doc):
    """Product pages (/products-and-accelerators/<slug>) show their logo (custom/logos/<slug>.png) in the page hero,
    in place of the text title. Drop a new <slug>.png into seed/assets/custom/logos to add one; no file = text title."""
    if not isinstance(doc, dict):
        return
    path = (doc.get("path") or "").rstrip("/")
    prefix = "/products-and-accelerators/"
    if not path.startswith(prefix) or "/" in path[len(prefix):]:
        return
    slug = path[len(prefix):]
    hero = next((s for s in doc.get("sections") or [] if s.get("__component") == "sections.page-hero"), None)
    if not hero:
        return
    if os.path.exists(os.path.join(LOGOS, slug + ".png")):
        hero["logo"] = media(f"custom/logos/{slug}.png", f"{hero.get('title') or slug} logo")
    else:
        hero.pop("logo", None)


def patch_products_menu(g, portfolio):
    """Insert (or refresh) the sectioned Products & Accelerators menu group and its footer quick link."""
    pm = portfolio.get("productsMenu")
    if not pm:
        return
    group = {
        "label": pm["label"],
        "href": pm["href"],
        "description": pm.get("description"),
        "coverImage": media(pm["coverImage"], pm["label"]) if pm.get("coverImage") else None,
        "items": [
            {
                "label": it["label"],
                "href": it["href"],
                "description": it.get("description"),
                "icon": media(it["icon"], it["label"]) if it.get("icon") else None,
                "openInNewTab": False,
                "ctaLabel": None,
                "ctaHref": None,
                "links": [with_logo(l) for l in it.get("links", [])],
                "groupLabel": None,
                "groupLinks": [],
                "eyebrow": it.get("eyebrow"),
                "section": it.get("section"),
                "sectionDescription": it.get("sectionDescription"),
                "accent": it.get("accent"),
            }
            for it in pm["items"]
        ],
    }
    nav = [grp for grp in g["navigation"] if grp["label"] != pm["label"]]
    after = next((i for i, grp in enumerate(nav) if grp["label"] == pm.get("insertAfter")), len(nav) - 1)
    nav.insert(after + 1, group)
    g["navigation"] = nav
    col = next((c for c in g["footerColumns"] if c["title"] == "Quick links"), None)
    if col is not None:
        col["links"] = [l for l in col["links"] if l.get("href") != pm["href"]]
        idx = next((i for i, l in enumerate(col["links"]) if l.get("label") == "Our Approach"), len(col["links"]) - 1)
        col["links"].insert(idx + 1, {"label": pm.get("footerLabel") or pm["label"], "href": pm["href"], "openInNewTab": False})


def patch_home(home, portfolio):
    for sec in home.get("sections", []):
        if sec.get("__component") == "home.hero-slider":
            sec["backgroundVideo"] = {"__media": "custom/videos/linkfields-globe.mp4", "width": 800, "height": 800,
                                      "mime": "video/mp4", "alt": "Rotating Linkfields globe"}
            sec["videoPoster"] = {"__media": "custom/videos/linkfields-globe-poster.jpg", "alt": "Linkfields globe"}
            sec["videoStyle"] = "globe"
        if sec.get("__component") == "home.services-showcase":
            sec["description"] = portfolio["homeServicesDescription"]
            sec["cards"] = [{"title": s["label"], "image": media(s["tile"], s["label"]), "href": s["href"]} for s in portfolio["services"]]


def industry_cards(portfolio):
    ind = portfolio["industries"]
    return [
        {
            "title": it["title"],
            "description": it["description"],
            "image": media(it["image"], it["title"]),
            "href": it["href"],
            "tags": "\n".join(it["tags"]),
            "accent": it.get("accent"),
        }
        for it in ind["items"]
    ]


def patch_industries_global(g, portfolio):
    """Industries mega menu (image cards + sub-pages) and footer column from portfolio.json."""
    ind = portfolio.get("industries")
    if not ind:
        return
    nav = next((grp for grp in g["navigation"] if grp["label"] == "Industries"), None)
    if nav is not None:
        nav["href"] = "/industries"
        nav["description"] = ind["description"]
        nav["items"] = [
            {
                "label": it["title"],
                "href": it["href"],
                "description": it.get("menu"),
                "icon": None,
                "image": media(it["image"], it["title"]),
                "accent": it.get("accent") or ["blue", "yellow", "orange"][i % 3],
                "openInNewTab": False,
                "ctaLabel": None,
                "ctaHref": None,
                "links": [{"label": l["label"], "href": l["href"], "openInNewTab": False} for l in it.get("links", [])],
                "groupLabel": None,
                "groupLinks": [],
            }
            for i, it in enumerate(ind["items"])
        ]
    col = next((c for c in g["footerColumns"] if c["title"] == "Industries"), None)
    if col is not None:
        col["links"] = [{"label": it["title"], "href": it["href"], "openInNewTab": False} for it in ind["items"]]


def patch_industries_sections(doc, portfolio):
    """Every industries section becomes the slide-style sections.industries-grid with the canonical cards."""
    ind = portfolio.get("industries")
    if not ind or not isinstance(doc, dict):
        return
    secs = doc.get("sections") or []
    renamed = set()
    for i, sec in enumerate(secs):
        comp = sec.get("__component")
        if comp in ("sections.industries-showcase", "home.industries-carousel"):
            anchor = sec.get("anchorId") or "industries"
            secs[i] = {
                "__component": "sections.industries-grid",
                "anchorId": anchor,
                "eyebrow": ind["eyebrow"],
                "heading": ind["heading"],
                "description": ind["description"],
                "items": industry_cards(portfolio),
                "cta": None,
            }
            renamed.add(anchor)
        elif comp == "sections.industries-grid":
            sec.setdefault("eyebrow", ind["eyebrow"])
            sec.setdefault("heading", ind["heading"])
            sec.setdefault("description", ind["description"])
            if not sec.get("items"):
                sec["items"] = industry_cards(portfolio)
    if renamed:
        for sec in secs:
            for a in sec.get("anchorLinks") or []:
                if a.get("targetId") in renamed:
                    a["label"] = ind.get("anchorLabel") or a.get("label")


def main(argv):
    if argv:
        for p in publish(argv):
            print(f"published {p}")
        return
    portfolio = load(os.path.join(CUSTOM, "portfolio.json"))
    custom_files = sorted(f for f in os.listdir(os.path.join(CUSTOM, "pages")) if f.endswith(".json"))
    published = publish(custom_files)
    mapping = redirect_map()
    removed = []
    for old in mapping:
        f = os.path.join(PAGES, page_file(old) + ".json")
        if os.path.exists(f) and old not in published:
            os.remove(f)
            removed.append(old)
    rewrite = make_rewriter(mapping)
    overrides = {k: v for k, v in portfolio.get("linkOverrides", {}).items() if not k.startswith("_")}
    changed = 0
    fixes, fix_report = content_fixes.load(), []
    for name in ("blog-posts.json", "news-articles.json", "events.json"):
        src = os.path.join(CUSTOM, name)
        if os.path.exists(src):
            save(os.path.join(DATA, name), load(src))
    targets = [os.path.join(PAGES, f) for f in os.listdir(PAGES) if f.endswith(".json")]
    targets += [os.path.join(DATA, f) for f in ("global.json", "blog-posts.json", "news-articles.json", "events.json")]
    for p in targets:
        if not os.path.exists(p):
            continue
        doc = load(p)
        before = json.dumps(doc, sort_keys=True)
        walk(doc, rewrite, overrides)
        if p.endswith("global.json"):
            patch_global(doc, portfolio)
            patch_products_menu(doc, portfolio)
            patch_industries_global(doc, portfolio)
            site_global.patch(doc, portfolio)
            site_global.featured_insights(doc)
        else:
            patch_industries_sections(doc, portfolio)
            patch_product_hero(doc)
        if p.endswith(os.sep + "index.json"):
            patch_home(doc, portfolio)
        if not p.endswith(("global.json", "blog-posts.json", "news-articles.json", "events.json")):
            deck.apply(doc)
            site_rules(doc)
            content_fixes.apply_page(doc, fixes, fix_report)
        elif p.endswith(("blog-posts.json", "events.json")):
            british(doc)
            if p.endswith("blog-posts.json"):
                content_fixes.apply_posts(doc, fixes, fix_report)
        if json.dumps(doc, sort_keys=True) != before:
            save(p, doc)
            changed += 1
    leftovers = []
    for p in targets:
        if os.path.exists(p):
            txt = open(p).read()
            for old in mapping:
                if re.search(re.escape(old) + r'(?=["/)#\s?])', txt) and old != "/services":
                    leftovers.append((os.path.basename(p), old))
    print(f"custom pages published: {len(published)}; retired pages removed: {len(removed)}; files rewritten: {changed}")
    if removed:
        print("  removed:", ", ".join(removed))
    if leftovers:
        print("  WARNING old links still present:", sorted(set(leftovers))[:20])
    n_fix = sum(len(v.get("edits", [])) + (1 if v.get("seo") else 0)
                for grp in ("pages", "posts") for v in fixes.get(grp, {}).values())
    print(f"content fixes: {n_fix} entries; problems: {len(fix_report)}")
    for line in fix_report:
        print("  FIX WARNING", line)


if __name__ == "__main__":
    main(sys.argv[1:])
