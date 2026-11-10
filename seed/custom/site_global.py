"""Site-wide Global settings (9 Nov 2026 review round).

Applied by apply.py after the portfolio/products/industries patches, so it has the final say on:
navigation order and copy, the Solutions (value plays) and Company menus, header CTA, footer columns,
socials, badge alt text, SEO defaults and the shared contact-form copy and grouped interest options.
"""

ORDER = ["Services", "Solutions", "Products & Accelerators", "Industries", "Company", "Careers"]

PLAYS = [
    ("AI Code Assurance", "/solutions/ai-code-assurance", "orange", "custom/icons/sol-ai-code-assurance.svg",
     "Ship AI-generated code without losing quality or security assurance."),
    ("Modernisation & Programme Assurance", "/solutions/modernisation-programme-assurance", "blue",
     "custom/icons/sol-modernisation-assurance.svg",
     "Validate migration readiness and release quality before critical cutovers."),
    ("Regulated Cyber Readiness", "/solutions/regulated-cyber-readiness", "teal", "custom/icons/sol-regulated-cyber-readiness.svg",
     "Continuous exposure validation and control evidence, not point-in-time reports."),
    ("Intelligent Operations", "/solutions/intelligent-operations", "purple", "custom/icons/sol-intelligent-operations.svg",
     "Discover, redesign and automate work to reduce cost to serve."),
    ("Capability Centres with Embedded IP", "/solutions/capability-centres-embedded-ip", "yellow",
     "custom/icons/sol-capability-centres.svg",
     "Scale delivery capacity through governed capability centres with IP built in."),
]

EVENT_URL = "/events/africa-tech-festival-2026"

COMPANY = [
    ("About Linkfields", "/company/about-us", "South Africa HQ. Global delivery. One integrated partner.", "custom/icons/co-about.svg", "orange"),
    ("Our approach", "/company/our-approach", "Outcome-led, secure-by-design delivery.", "custom/icons/co-approach.svg", "blue"),
    ("Insights", "/company/blog", "Practical perspectives from our specialists.", "custom/icons/co-insights.svg", "purple"),
    ("News & recognition", "/company/news-and-articles", "Company updates and independent recognition.", "custom/icons/co-news.svg", "teal"),
    ("Events", "/events", "Where to meet us next, and where we have been.", "custom/icons/co-events.svg", "yellow"),
]

PRODUCTS = [("Linkworks", "linkworks"), ("testoriumz", "testoriumz"), ("VajraX", "vajrax"), ("VectorX", "vectorx"),
            ("AI Governance", "ai-governance"), ("textIQ", "textiq"), ("FinSight", "finsight"), ("EduPilot", "edupilot")]

LINKEDIN = "https://www.linkedin.com/company/linkfieldsinnovations"


def _m(path, alt):
    return {"__media": path, "alt": alt}


def _item(label, href, description, icon=None, accent=None):
    return {"label": label, "href": href, "description": description, "icon": _m(icon, label) if icon else None,
            "openInNewTab": False, "ctaLabel": None, "ctaHref": None, "links": [], "groupLabel": None, "groupLinks": [],
            "accent": accent}


def _link(label, href):
    return {"label": label, "href": href, "openInNewTab": False}


def patch(g, portfolio):
    nav = {grp["label"]: grp for grp in g["navigation"]}

    svc = nav.get("Services")
    if svc:
        svc["href"] = "/services"
        svc["description"] = "Five integrated portfolios to modernise, operate, analyse, secure and scale your enterprise."

    sol = nav.get("Solutions")
    if sol:
        sol["href"] = "/solutions"
        sol["description"] = "We lead with outcomes, not offerings. Five strategic value plays, each starting from a customer problem."
        sol["items"] = [_item(l, h, d, icon, acc) for (l, h, acc, icon, d) in PLAYS]

    pa = nav.get("Products & Accelerators")
    if pa:
        pa["description"] = "Software we own. Accelerators we reuse. Licensed on their own or delivered with our services."

    ind = nav.get("Industries")
    if ind:
        ind["description"] = "Eight industries we know deeply, with use cases tailored to each sector."
        for it in ind.get("items") or []:
            if it.get("label") == "BFSI":
                it["description"] = "Banking, insurance and fintech"
            if it.get("label") == "Energy & Mining":
                it["description"] = "Mining, oil and gas, and energy operations"

    com = nav.get("Company")
    if com:
        com["href"] = "/company/about-us"
        com["description"] = "Who we are, how we deliver and what we are thinking about."
        com["items"] = [_item(l, h, d, icon, acc) for (l, h, d, icon, acc) in COMPANY]

    g["navigation"] = [nav[k] for k in ORDER if k in nav] + [grp for grp in g["navigation"] if grp["label"] not in ORDER]
    g["headerCta"] = {"label": "Let\u2019s connect", "href": "/contact-us", "openInNewTab": False}

    # Footer: trust strip (ISO certifications, FT 2026 recognition next to them, B-BBEE, memberships),
    # then five link columns. Rebuilt from the base badges on every run so the patch stays idempotent.
    services = portfolio["services"]
    cols = {c["title"]: c for c in g["footerColumns"]}
    all_badges = [b for c in g["footerColumns"] for b in (c.get("badges") or [])]

    def _src(b):
        return ((b.get("image") or {}).get("__media") or "").lower()

    def _badge(b, alt, caption, href=""):
        b = dict(b)
        b.update({"alt": alt, "caption": caption, "href": href})
        if isinstance(b.get("image"), dict):
            b["image"] = dict(b["image"], alt=alt)
        return b

    iso = [b for b in all_badges if "iso" in _src(b)]
    iso = sorted(iso, key=lambda b: 0 if "27001" in _src(b) else 1)
    iso = [_badge(b, "ISO/IEC 27001:2022 certification badge", "ISO/IEC 27001:2022") if "27001" in _src(b)
           else _badge(b, "ISO 9001:2015 certification badge", "ISO 9001:2015") for b in iso]
    # ISO does not permit its own logo in connection with certification, so the 9001 mark is a neutral badge
    # in the same family as the 27001 one (seed/assets/custom/badges/iso-9001.png).
    for b in iso:
        if "27001" not in _src(b):
            b["image"] = {"__media": "custom/badges/iso-9001.png", "alt": "ISO 9001:2015 certified"}
            b["width"], b["height"] = 111, 103
    members = [b for b in all_badges if "nascom" in _src(b) or "nasscom" in _src(b) or "duns" in _src(b)]
    members = [_badge(b, "NASSCOM member badge", "NASSCOM member") if "nas" in _src(b)
               else _badge(b, "D-U-N-S Registered badge", "D-U-N-S registered") for b in members]
    # Text-only ranking badge (our artwork): the FT/Statista award logo needs a Statista licence, so the supplied
    # logo artwork (custom/badges/ft-africa-fastest-growing-2026.png) is kept in the repo but not displayed.
    recognition = {"__media": "custom/badges/growth-ranking-2026.png",
                   "alt": "Ranked #35 in Africa’s Fastest-Growing Companies 2026, a Financial Times and Statista ranking"}
    bbbee = {"__media": "custom/badges/bbbee-level-1.png", "alt": "B-BBEE Level 1 contributor, Proudly South African"}
    yes = {"__media": "custom/badges/yes-member.png", "alt": "A proudly YES (Youth Employment Service) member"}
    # 9 Nov (12:33): "Transformation" renamed "Recognitions"; FT 2026, B-BBEE and YES sit together. The Great Place To
    # Work badge on record (Sep 2023 - Sep 2024, India) has expired; GPTW terms only allow a badge during its 12-month
    # certification period, so it returns only when a current badge is supplied.
    badge_cols = [
        {"title": "ISO certifications", "mobileVisible": True, "links": [], "badges": iso},
        {"title": "Recognitions", "mobileVisible": True, "links": [], "badges": [
            {"image": recognition, "alt": recognition["alt"], "href": "/company/news-and-articles",
             "width": 242, "height": 99, "caption": "#35 · Africa’s Fastest-Growing 2026"},
            {"image": bbbee, "alt": bbbee["alt"], "href": "", "width": 174, "height": 191, "caption": "B-BBEE Level 1"},
            {"image": yes, "alt": yes["alt"], "href": "", "width": 168, "height": 167, "caption": "Proud YES member"}]},
        {"title": "Memberships & registrations", "mobileVisible": True, "links": [], "badges": members},
    ]
    link_cols = [
        {"title": "Services", "links": [_link(s["label"], s["href"]) for s in services] + [_link("All services", "/services")]},
        {"title": "Solutions", "links": [_link(l, h) for (l, h, *_rest) in PLAYS] + [_link("All solutions", "/solutions")]},
        {"title": "Products & Accelerators", "links": [_link(l, f"/products-and-accelerators/{s}") for l, s in PRODUCTS]
         + [_link("All products & accelerators", "/products-and-accelerators")]},
        {"title": "Industries", "links": [_link(it["title"], it["href"]) for it in portfolio["industries"]["items"]]
         + [_link("All industries", "/industries")]},
        {"title": "Company", "links": [_link("About Linkfields", "/company/about-us"), _link("Our approach", "/company/our-approach"),
                                       _link("Insights", "/company/blog"), _link("News & recognition", "/company/news-and-articles"),
                                       _link("Events", "/events"),
                                       _link("Careers", "/careers"), _link("Contact us", "/contact-us")]},
    ]
    for c in link_cols:
        old = cols.get(c["title"]) or {}
        c.update({k: v for k, v in old.items() if k not in ("title", "links")})
        c.setdefault("badges", [])
    g["footerColumns"] = badge_cols + link_cols

    g["contactEmail"] = "info@linkfields.com"
    g["salesEmail"] = "sales@linkfields.com"
    g["footerTagline"] = ("An AI-driven technology, engineering and advisory company helping enterprises accelerate digital "
                          "transformation and build scalable Global Capability Centres.")
    g["footerLocations"] = "South Africa (HQ) · India · UAE · United Kingdom · USA · Australia"
    # Office addresses (no phone numbers). Five from linkfields.com/contact-us; the UK address supplied by Linkfields.
    # One line per address row; mapQuery drives the map pin and "Directions" link.
    g["offices"] = [
        {"country": "South Africa", "role": "Headquarters", "isHeadquarters": True, "accent": "orange",
         "address": "Block H, Midridge Office Estate\nInternational Business Gateway, Cnr 6th Street\nMidrand 1684, South Africa",
         "mapQuery": "Linkfields Innovations (Pty) Ltd, Block H, Midridge Office Estate, International Business Gateway, Midrand 1684, South Africa"},
        {"country": "India", "role": "Offshore Delivery Centre", "isHeadquarters": False, "accent": "blue",
         "address": "809, 8th Floor, Gowra Fountain Head\nRaheja Mindspace IT Park, Hitech City\nHyderabad 500081, India",
         "mapQuery": "Gowra Fountain Head, Raheja Mindspace IT Park, Hitech City, Hyderabad 500081, India"},
        {"country": "UAE", "role": "Middle East", "isHeadquarters": False, "accent": "teal",
         "address": "409, Churchill Towers, Business Bay\nDubai, United Arab Emirates 1686",
         "mapQuery": "Churchill Towers, Business Bay, Dubai, United Arab Emirates"},
        {"country": "United Kingdom", "role": "Europe", "isHeadquarters": False, "accent": "purple",
         "address": "71-75 Shelton Street, Covent Garden\nLondon WC2H 9JQ, United Kingdom",
         "mapQuery": "71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom"},
        {"country": "USA", "role": "North America", "isHeadquarters": False, "accent": "yellow",
         "address": "1604, 447 Broadway, 2nd Floor\nNew York, NY 10013, USA",
         "mapQuery": "447 Broadway, New York, NY 10013, USA"},
        {"country": "Australia", "role": "Asia Pacific", "isHeadquarters": False, "accent": "blue",
         "address": "Level 40, 140 William Street\nMelbourne VIC 3000, Australia",
         "mapQuery": "140 William Street, Melbourne VIC 3000, Australia"},
    ]

    for s in (g.get("footerSocials") or []) + (g.get("socialBannerLinks") or []):
        p = s.get("platform")
        if p == "linkedin":
            s["href"] = LINKEDIN
            s["label"] = "LinkedIn"
        elif p == "twitter":
            s["label"] = "X"
            if isinstance(s.get("icon"), dict):
                s["icon"]["alt"] = "X (formerly Twitter)"
        elif p == "youtube":
            s["label"] = "YouTube"
        elif p == "instagram":
            s["label"] = "Instagram"
        if s.get("handle") == "linkfields":
            s["handle"] = ""
    g["socialBannerHeading"] = "Follow Linkfields"

    g["defaultSeo"] = {
        "metaTitle": "Linkfields | Services, Software & Accelerators",
        "metaDescription": "South Africa-headquartered technology, engineering and advisory partner combining five service portfolios, "
                           "proprietary software and reusable accelerators.",
        "keywords": "Linkfields, digital transformation, enterprise platforms, data and AI, cyber security, GCC, proprietary software, accelerators",
        "canonicalUrl": "",
        "noIndex": False,
    }

    cf = g.setdefault("contactForm", {})
    cf["heading"] = "Let\u2019s connect"
    cf["subheading"] = "Tell us about your business requirements"
    cf["nextStepsTitle"] = "What happens next"
    cf["nextSteps"] = [
        {"title": "We route your enquiry to the relevant portfolio specialist.", "description": ""},
        {"title": "Where needed, we agree an NDA before you share confidential information.", "description": ""},
        {"title": "We clarify your priorities and agree the right next step with you.", "description": ""},
    ]
    cf["submitLabel"] = "Send enquiry"
    cf["successMessage"] = "Thank you for submitting your enquiry. Our expert consultants will be in touch."
    # Event meeting options are added automatically by the form for upcoming events (Strapi › Event).
    opts = [{"label": "Not sure \u2014 help me choose", "value": "Not sure", "group": None}]
    for s in services:
        seen = set()
        for l in s["links"]:
            if l["label"] in seen:
                continue
            seen.add(l["label"])
            opts.append({"label": l["label"], "value": f'{s["label"]}: {l["label"]}', "group": s["label"]})
    for (l, h, *_rest) in PLAYS:
        opts.append({"label": l, "value": f"Solution: {l}", "group": "Solutions (value plays)"})
    opts.append({"label": "Licence, subscription or SaaS", "value": "Products & Accelerators: licence or SaaS", "group": "Products & accelerators"})
    opts.append({"label": "Product demonstration", "value": "Products & Accelerators: demo", "group": "Products & accelerators"})
    opts.append({"label": "Accelerator delivery", "value": "Products & Accelerators: accelerator delivery", "group": "Products & accelerators"})
    opts.append({"label": "Partnership or general enquiry", "value": "General enquiry", "group": "Other"})
    cf["serviceOptions"] = opts

    # The event pop-up now lives on each Event (Strapi › Event › Pop-up); see seed/custom/events.json.
    g.pop("eventPromo", None)


# Featured insights shown on hubs and Home: the three current decision guides (see docs/review/impl/insights.md).
_FEATURED = [
    ("ai-code-assurance", "custom/hero-testoriumz.jpg"),
    ("single-ai-gateway", "custom/hero-ai-governance.jpg"),
    ("continuous-cyber-evidence", "custom/hero-cyber-security.jpg"),
]


def featured_insights(g):
    import json as _json
    import os as _os

    posts_path = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "blog-posts.json")
    posts = {p["slug"]: p for p in _json.load(open(posts_path))}
    items = []
    for slug, fallback in _FEATURED:
        post = posts.get(slug)
        if not post:
            continue
        cover = post.get("cover") if isinstance(post.get("cover"), dict) and post["cover"].get("__media") else _m(fallback, post["title"])
        items.append({"label": post.get("label") or "Insight", "title": post["title"], "href": f"/company/blog/{slug}",
                      "image": cover, "openInNewTab": False})
    if items:
        g["insights"] = items
        g["insightsHeading"] = "Practical guidance for *enterprise leaders*"
