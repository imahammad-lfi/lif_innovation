"""Core seed data: the Global single type (header mega-menu, footer, socials, insights, contact defaults)."""
import json
import os
import re

import lib
from lib import clean, link, media

CLEAN = os.path.join(lib.CRAWL, "clean")


def _doc(name):
    return json.load(open(os.path.join(CLEAN, f"{name}.json")))


SOCIAL = {
    "linkedin": ("LinkedIn", "https://www.linkedin.com/company/40661516/admin/feed/posts/"),
    "twitter": ("X (Twitter)", "https://x.com/LinkfieldsI"),
    "youtube": ("YouTube", "https://www.youtube.com/channel/UCiSaCEnC7Gtu7YkanoA6mpg"),
    "goodfirms": ("GoodFirms", "https://www.goodfirms.co/company/linkfields-innovations"),
}


def navigation():
    nav = _doc("navbar")
    groups = []
    for g in nav["links"]:
        items = []
        for c in g.get("children") or []:
            btn = c.get("navbutton") or {}
            items.append({
                "label": clean(c.get("label")),
                "href": c.get("href") or "",
                "description": clean(c.get("description")) or "",
                "icon": media(c.get("icon"), clean(c.get("label"))),
                "openInNewTab": bool(c.get("openInNewTab")),
                "ctaLabel": clean(btn.get("label")) or "",
                "ctaHref": btn.get("href") or "",
                "links": [link(x.get("label"), x.get("href")) for x in c.get("children") or []],
            })
        groups.append({
            "label": clean(g["label"]),
            "href": g.get("href") or "",
            "description": clean(g.get("description")) or "",
            "coverImage": media(g.get("coverImage"), clean(g["label"])),
            "items": items,
        })
    return nav, groups


def footer():
    f = _doc("footer")
    cols = []
    for s in f["sections"]:
        cols.append({
            "title": clean(s.get("title") or s.get("label")),
            "mobileVisible": bool(s.get("mobileVisible")),
            "badges": [
                {"image": media(l.get("image")), "alt": "", "href": "", "width": l.get("width"), "height": l.get("height")}
                for l in s.get("logos") or []
            ],
            "links": [link(l.get("label"), l.get("link")) for l in s.get("links") or []],
        })
    bottom = f.get("bottomFooterLinks") or {}
    legal = [link(l.get("label"), l.get("link")) for l in bottom.get("aboutCompanyLinks") or []]
    email = bottom.get("link") or "info@linkfields.com"
    socials = [
        {"platform": "linkedin", "label": SOCIAL["linkedin"][0], "handle": "", "href": SOCIAL["linkedin"][1], "icon": media("/images/linkedin.svg", "LinkedIn")},
        {"platform": "twitter", "label": SOCIAL["twitter"][0], "handle": "", "href": SOCIAL["twitter"][1], "icon": media("/images/twitter-new-X.png", "X")},
        {"platform": "youtube", "label": SOCIAL["youtube"][0], "handle": "", "href": SOCIAL["youtube"][1], "icon": media("/images/youtube.svg", "YouTube")},
        {"platform": "goodfirms", "label": SOCIAL["goodfirms"][0], "handle": "", "href": SOCIAL["goodfirms"][1], "icon": media("https://assets.goodfirms.co/badges/icon/white-goodfirms-icon.svg", "GoodFirms")},
    ]
    return cols, legal, email, socials


def social_banner():
    d = _doc("contactusbanner")
    out = []
    for c in d.get("contactCards") or []:
        platform = clean(c.get("title")).lower()
        platform = {"twitter": "twitter", "youtube": "youtube", "linkedin": "linkedin"}.get(platform, "other")
        href = c.get("link") or ""
        if not href.startswith("http"):
            href = SOCIAL.get(platform, ("", href))[1]
        out.append({
            "platform": platform,
            "label": clean(c.get("title")),
            "handle": clean(c.get("emailId")) or "",
            "href": href,
            "icon": media(c.get("icon"), clean(c.get("title"))),
        })
    return clean(d.get("heading")), out


def insights():
    """Featured 'Insights & Updates' cards (same on every page)."""
    fb = _doc("featuredBlogs")
    html = open(os.path.join(lib.CRAWL, "rendered", "services__engineering__devops.html"), encoding="utf-8").read()
    i = html.find("FeaturedBlogs")
    hrefs = re.findall(r'href="([^"]+)"', html[i:i + 40000])
    by_title = {}
    for x in fb.get("blogListArray") or []:
        b = x.get("blogList") or {}
        by_title[clean(b.get("title"))] = b
    cards = []
    # The original renders blogListArray in order; hrefs follow the same order on the page
    for idx, x in enumerate(fb.get("blogListArray") or []):
        b = x.get("blogList") or {}
        href = b.get("url") or ""
        if not href and idx < len(hrefs):
            href = hrefs[idx]
        cards.append({
            "label": clean(b.get("heading")) or "",
            "title": clean(b.get("title")),
            "image": media(b.get("image"), clean(b.get("title"))),
            "href": href,
            "openInNewTab": href.startswith("http"),
        })
    return cards


def insight_hrefs():
    """Map card title -> href from the crawled devops page (the Tina doc doesn't carry blog URLs)."""
    from html import unescape
    html = open(os.path.join(lib.CRAWL, "rendered", "services__engineering__devops.html"), encoding="utf-8").read()
    i = html.find("FeaturedBlogs")
    seg = html[i:i + 60000]
    out = {}
    for m in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', seg, re.S):
        text = unescape(re.sub(r"<[^>]+>", " ", m.group(2)))
        out[m.group(1)] = re.sub(r"\s+", " ", text).strip()
    return out


CONTACT_SERVICES = [
    "SAP", "Odoo", "Microsoft Dynamics", "Salesforce", "iPaaS", "Robotic process automation",
    "Application Development", "Quality Control", "DevOps", "Product Discovery", "Solution Discovery",
    "UX/UI Design", "Technology Advisory", "Cloud Consulting", "Cloud Migration", "Cloud Development",
    "Kubernetes Services", "Big Data Engineering", "AI & Machine Learning", "Digital transformation",
    "Staff Augmentation", "Managed Team", "IT Infrastructure", "Others",
]


def contact_defaults():
    return {
        "heading": "Contact Us",
        "subheading": "Let's connect over a virtual coffee",
        "nextStepsTitle": "What happens next?",
        "nextSteps": [
            {"title": "Our sales team will get in touch within 24 hours", "description": ""},
            {"title": "If required, we sign on a NDA with you, to assure the highest level of privacy.", "description": ""},
            {"title": "Once we have analysed your business requirements our sales team will provide you with the next steps.", "description": ""},
        ],
        "serviceOptions": [{"label": s, "value": s} for s in CONTACT_SERVICES],
        "submitLabel": "Submit",
        "successMessage": "Thank you for your interest in Linkfields. We will get in touch with you shortly.",
        "backgroundLight": media("/backgroud-images/contact-us.png", ""),
        "backgroundLightMobile": media("/backgroud-images/contact-us-mobile.jpg", ""),
        "backgroundDark": media("/backgroud-images/contact-us-dark.jpg", ""),
        "backgroundDarkMobile": media("/backgroud-images/contact-us-mobile-dark.jpg", ""),
    }


def build():
    nav, groups = navigation()
    cols, legal, email, socials = footer()
    banner_heading, banner_links = social_banner()
    cards = insights()
    # resolve hrefs of insight cards by matching link text to card titles
    hrefs = insight_hrefs()
    for c in cards:
        if not c["href"]:
            for h, text in hrefs.items():
                if c["title"] and c["title"][:30] in text:
                    c["href"] = h
                    c["openInNewTab"] = h.startswith("http")
                    break
    home_seo = lib.seo("home", "Linkfields")
    global_data = {
        "siteName": "Linkfields",
        "logo": media("/images/linkfields_logo 1.svg", "Linkfields – exploring innovation") or media(nav.get("logo"), "Linkfields"),
        "favicon": media("/favicon.ico", "Linkfields"),
        "navigation": groups,
        "headerCta": link((nav.get("btn") or {}).get("label") or "Contact us", (nav.get("btn") or {}).get("href") or "/contact-us"),
        "footerColumns": cols,
        "legalLinks": legal,
        "copyright": "Linkfields. All Rights Reserved",
        "contactEmail": email,
        "footerSocials": socials,
        "socialBannerHeading": banner_heading,
        "socialBannerLinks": banner_links,
        "insightsHeading": "Insights & Updates",
        "insights": cards,
        "contactForm": contact_defaults(),
        "defaultSeo": home_seo,
    }
    return {"global.json": global_data}
