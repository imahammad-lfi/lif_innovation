"""One-off generator for the base Strapi 5 content model (shared/layout/sections components + content types).

Run from repo root:  python3 tools/gen_base_schema.py
Family-specific section components live in apps/cms/src/components/<family>/ and are written by hand.
"""
import json
import os

CMS = os.path.join(os.path.dirname(__file__), "..", "apps", "cms", "src")

MEDIA = {"type": "media", "multiple": False, "allowedTypes": ["images", "files", "videos"]}
MEDIA_MULTI = {"type": "media", "multiple": True, "allowedTypes": ["images", "files", "videos"]}


def s(**kw):
    return {"type": "string", **kw}


def t(**kw):
    return {"type": "text", **kw}


def rt(**kw):
    return {"type": "richtext", **kw}


def comp(uid, repeatable=False):
    return {"type": "component", "repeatable": repeatable, "component": uid}


def enum(values, default=None):
    a = {"type": "enumeration", "enum": values}
    if default:
        a["default"] = default
    return a


def boolean(default=False):
    return {"type": "boolean", "default": default}


def component(category, name, display, attrs, icon="cube", description=""):
    path = os.path.join(CMS, "components", category, f"{name}.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    table = f"components_{category}_{name}".replace("-", "_")
    doc = {
        "collectionName": table[:60],
        "info": {"displayName": display, "icon": icon, "description": description},
        "options": {},
        "attributes": attrs,
    }
    json.dump(doc, open(path, "w"), indent=2)
    return f"{category}.{name}"


def content_type(api, kind, singular, plural, display, attrs, description="", draft=True):
    base = os.path.join(CMS, "api", api, "content-types", api)
    os.makedirs(base, exist_ok=True)
    doc = {
        "kind": kind,
        "collectionName": plural.replace("-", "_"),
        "info": {"singularName": singular, "pluralName": plural, "displayName": display, "description": description},
        "options": {"draftAndPublish": draft},
        "pluginOptions": {},
        "attributes": attrs,
    }
    json.dump(doc, open(os.path.join(base, "schema.json"), "w"), indent=2)


# ---------------------------------------------------------------- shared
component("shared", "seo", "SEO", {
    "metaTitle": s(required=True),
    "metaDescription": t(),
    "keywords": t(),
    "canonicalUrl": s(),
    "ogImage": MEDIA,
    "noIndex": boolean(False),
}, icon="search")
component("shared", "link", "Link", {
    "label": s(),
    "href": s(),
    "openInNewTab": boolean(False),
}, icon="link")
component("shared", "anchor-link", "Anchor link", {
    "label": s(required=True),
    "targetId": s(required=True),
}, icon="arrowDown")
component("shared", "stat", "Statistic", {
    "value": s(required=True),
    "suffix": s(),
    "label": s(),
}, icon="chartBubble")
component("shared", "image-card", "Image card", {
    "title": s(),
    "description": t(),
    "image": MEDIA,
    "href": s(),
}, icon="picture")
component("shared", "icon-card", "Icon card", {
    "icon": MEDIA,
    "title": s(),
    "description": t(),
    "href": s(),
    "linkLabel": s(),
    "color": s(),
}, icon="apps")
component("shared", "text-item", "Text item", {
    "title": t(),
    "description": t(),
}, icon="bulletList")
component("shared", "social-link", "Social link", {
    "platform": enum(["twitter", "youtube", "linkedin", "facebook", "instagram", "goodfirms", "other"], "other"),
    "label": s(),
    "handle": s(),
    "href": s(),
    "icon": MEDIA,
}, icon="earth")
component("shared", "insight-card", "Insight card", {
    "label": s(),
    "title": s(required=True),
    "image": MEDIA,
    "href": s(),
    "openInNewTab": boolean(False),
}, icon="feather")
component("shared", "option", "Option", {"label": s(required=True), "value": s()}, icon="bulletList")

# ---------------------------------------------------------------- layout (global)
component("layout", "nav-item", "Navigation item", {
    "label": s(required=True),
    "href": s(),
    "description": t(),
    "icon": MEDIA,
    "openInNewTab": boolean(False),
    "ctaLabel": s(),
    "ctaHref": s(),

    "links": comp("shared.link", True),
    "groupLabel": s(),
    "groupLinks": comp("shared.link", True),
}, icon="link")
component("layout", "nav-group", "Navigation group", {
    "label": s(required=True),
    "href": s(),
    "description": t(),
    "coverImage": MEDIA,
    "items": comp("layout.nav-item", True),
}, icon="layer")
component("layout", "badge", "Badge / logo", {
    "image": MEDIA,
    "alt": s(),
    "href": s(),
    "width": {"type": "integer"},
    "height": {"type": "integer"},
}, icon="medal")
component("layout", "footer-column", "Footer column", {
    "title": s(required=True),
    "mobileVisible": boolean(False),
    "badges": comp("layout.badge", True),
    "links": comp("shared.link", True),
}, icon="layout")
component("layout", "contact-defaults", "Contact form defaults", {
    "heading": s(),
    "subheading": s(),
    "nextStepsTitle": s(),
    "nextSteps": comp("shared.text-item", True),
    "serviceOptions": comp("shared.option", True),
    "submitLabel": s(),
    "successMessage": t(),
    "backgroundLight": MEDIA,
    "backgroundLightMobile": MEDIA,
    "backgroundDark": MEDIA,
    "backgroundDarkMobile": MEDIA,
}, icon="envelop")

# ---------------------------------------------------------------- common sections
SECTIONS = []
SECTIONS.append(component("sections", "page-hero", "Page hero", {
    "title": s(required=True),
    "subtitle": t(),
    "backgroundImage": MEDIA,
    "anchorLinks": comp("shared.anchor-link", True),
}, icon="landscape", description="Inner-page hero with background image and in-page anchor tabs"))
SECTIONS.append(component("sections", "overview", "Overview", {
    "anchorId": s(),
    "eyebrow": s(),
    "heading": t(),
    "body": rt(),
    "secondaryEyebrow": s(),
    "secondaryHeading": t(),
    "secondaryBody": rt(),
    "theme": enum(["light", "dark"], "light"),
}, icon="layout", description="Eyebrow + heading on the left, copy on the right"))
SECTIONS.append(component("sections", "message-banner", "Message banner", {
    "anchorId": s(),
    "title": t(required=True),
    "description": t(),
    "ctaLabel": s(),
    "ctaUrl": s(),
}, icon="message", description="Blue strip with an orange call-to-action"))
SECTIONS.append(component("sections", "stats-band", "Stats band", {
    "anchorId": s(),
    "eyebrow": s(),
    "heading": t(),
    "description": t(),
    "stats": comp("shared.stat", True),
    "backgroundImage": MEDIA,
}, icon="chartPie", description="Persistently innovative – animated counters"))
SECTIONS.append(component("sections", "industries-showcase", "Industries showcase", {
    "anchorId": s(),
    "eyebrow": s(),
    "heading": t(),
    "description": t(),
    "items": comp("shared.image-card", True),
}, icon="grid", description="Constantly innovating – industry image tiles"))
SECTIONS.append(component("sections", "featured-insights", "Featured insights", {
    "anchorId": s(),
    "heading": s(),
    "items": comp("shared.insight-card", True),
}, icon="feather", description="Insights & Updates cards (falls back to the global list when empty)"))
SECTIONS.append(component("sections", "contact-form", "Contact form", {
    "anchorId": s(default="get-in-touch"),
    "heading": s(),
    "subheading": s(),
    "nextStepsTitle": s(),
    "nextSteps": comp("shared.text-item", True),
    "layout": enum(["section", "page"], "section"),
    "theme": enum(["dark", "light"], "dark"),
}, icon="envelop", description="Lead form – empty fields fall back to Global › Contact form defaults"))
SECTIONS.append(component("sections", "social-banner", "Social banner", {
    "heading": s(),
    "links": comp("shared.social-link", True),
}, icon="earth", description="Follow us for the latest updates (falls back to Global social links)"))
SECTIONS.append(component("sections", "rich-text", "Rich text", {
    "anchorId": s(),
    "heading": s(),
    "body": rt(),
    "variant": enum(["legal", "article", "plain"], "legal"),
}, icon="feather"))

# ---------------------------------------------------------------- content types
content_type("page", "collectionType", "page", "pages", "Page", {
    "title": s(required=True),
    "path": s(required=True, unique=True, regex="^/[A-Za-z0-9\\-_/&%.]*$"),
    "seo": comp("shared.seo"),
    "sections": {"type": "dynamiczone", "components": SECTIONS},
}, description="Every website page. Sections are rendered top-to-bottom in the order shown here.")

content_type("global", "singleType", "global", "globals", "Global", {
    "siteName": s(required=True),
    "logo": MEDIA,
    "favicon": MEDIA,
    "navigation": comp("layout.nav-group", True),
    "headerCta": comp("shared.link"),
    "footerColumns": comp("layout.footer-column", True),
    "legalLinks": comp("shared.link", True),
    "copyright": s(),
    "contactEmail": s(),
    "footerSocials": comp("shared.social-link", True),
    "socialBannerHeading": s(),
    "socialBannerLinks": comp("shared.social-link", True),
    "insightsHeading": s(),
    "insights": comp("shared.insight-card", True),
    "contactForm": comp("layout.contact-defaults"),
    "defaultSeo": comp("shared.seo"),
}, description="Header, footer, contact defaults and other site-wide content")

content_type("blog-post", "collectionType", "blog-post", "blog-posts", "Blog post", {
    "title": s(required=True),
    "slug": {"type": "string", "required": True, "unique": True},
    "excerpt": t(),
    "cover": MEDIA,
    "label": s(default="Blog"),
    "tag": s(),
    "categoryGroup": enum(["Industries", "Technology"], "Industries"),
    "keyword": s(),
    "authorName": s(),
    "authorAvatar": MEDIA,
    "publishedDate": {"type": "date"},
    "content": rt(),
    "featured": boolean(False),
    "seo": comp("shared.seo"),
}, description="Articles shown on /company/blog")

content_type("news-article", "collectionType", "news-article", "news-articles", "News article", {
    "title": s(required=True),
    "label": s(default="News"),
    "image": MEDIA,
    "url": s(),
    "excerpt": t(),
    "publishedDate": {"type": "date"},
    "order": {"type": "integer", "default": 0},
}, description="Press coverage shown on /company/news-and-articles")

content_type("lead", "collectionType", "lead", "leads", "Lead", {
    "name": s(required=True),
    "email": {"type": "email", "required": True},
    "phone": s(),
    "service": s(),
    "message": t(),
    "sourcePath": s(),
    "status": enum(["new", "contacted", "qualified", "closed"], "new"),
}, description="Contact form submissions from the website", draft=False)

print("ok", len(SECTIONS), "common sections")
