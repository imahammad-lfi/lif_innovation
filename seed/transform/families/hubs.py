"""Service-hub family – see docs/SECTION-CONTRACT.md."""
from __future__ import annotations

import lib


HUB_PAGE_KEYS = (
    "services__engineering",
    "services__consulting",
    "services__cloud",
    "services__technology",
    "services__automation",
    "services__teams",
    "services__itinfraandsolutions",
)


def what_we_offer(doc: dict, *, anchor_id: str = "what-we-offer") -> dict:
    """Build ``hubs.what-we-offer`` from a hub document's heroSectionData and tabItems.

    Reads ``status2``, ``subheading3``, ``para2`` and each tab item's ``title``,
    ``descriptions``, ``imageUrl`` and optional ``button``. The shape is shared by
    Engineering, Consulting, Cloud, Technology, Automation, Teams, and IT Infrastructure.
    """
    hero = doc.get("heroSectionData") or {}
    cards = []
    for item in doc.get("tabItems") or []:
        title = lib.clean(item.get("title")) or ""
        button = item.get("button") or {}
        card = {
            "title": title,
            "description": lib.md(item.get("descriptions")),
            "image": lib.media(item.get("imageUrl"), title),
        }
        if button.get("label") or button.get("link"):
            card["cta"] = lib.link(button.get("label"), button.get("link"))
        cards.append(card)
    return {
        "__component": "hubs.what-we-offer",
        "anchorId": anchor_id,
        "eyebrow": lib.clean(hero.get("status2")) or "",
        "heading": lib.clean(hero.get("subheading3")) or "",
        "body": lib.clean(hero.get("para2")) or "",
        "cards": cards,
    }


def _common_sections(page_key: str, doc: dict, *, order: tuple[str, ...]) -> list[dict]:
    """Assemble one hub's original sections in its page-specific order."""
    hero = doc.get("heroSectionData") or {}
    overview_hero = {key: hero.get(key) for key in ("status1", "subheading2", "para1")}
    docs = lib.load_docs(page_key)
    sections = [
        lib.hero_section(page_key, hero, anchors=lib.anchor_links(page_key)),
        # The source places status2/subheading3/para2 in the following offer block,
        # not in a second row of the shared overview section.
        lib.overview_section(overview_hero, anchor_id="overview"),
        what_we_offer(doc, anchor_id="what-we-offer"),
    ]
    for name in order:
        if name == "stats":
            sections.append(lib.stats_band(docs.get("persistentlyInnovative"), anchor_id="why-us"))
        elif name == "industries":
            sections.append(lib.industries_showcase(docs.get("constantlyInnovating"), anchor_id="our-expertise"))
        elif name == "message":
            sections.append(lib.message_banner(doc.get("messageBannerData")))
        elif name == "message2":
            sections.append(lib.message_banner(doc.get("messageBannerData2")))
    sections.extend(lib.standard_tail(page_key))
    return sections


def build() -> list[dict]:
    page_orders = {
        "services__engineering": ("stats", "message", "industries"),
        "services__consulting": ("industries", "stats", "message"),
        "services__cloud": ("message", "stats", "industries", "message2"),
        "services__technology": ("message", "stats", "industries", "message2"),
        "services__automation": ("stats", "message", "industries"),
        "services__teams": ("message", "stats", "industries", "message2"),
        "services__itinfraandsolutions": ("message", "stats", "industries", "message2"),
    }
    pages = []
    for page_key in HUB_PAGE_KEYS:
        doc = lib.page_doc(page_key)
        hero = doc.get("heroSectionData") or {}
        title = lib.clean(hero.get("heading1")) or "Linkfields"
        pages.append(lib.page(page_key, title, _common_sections(page_key, doc, order=page_orders[page_key])))
    return pages
