"""Services-family seed transform and shared services block builders.

The four public builders below deliberately accept the raw Tina object where that
component lives.  A few original pages keep a section heading and its card list
as sibling fields; in those cases callers pass the page document (or the small
``headingBlock``/``cardItems`` bundle) so no copy has to be duplicated.
"""
from __future__ import annotations

import lib


FLOW_PAIRS = (
    ("Projectflow", "Cards"),
    ("ProjectFlowCards", "Cards"),
    ("aiMlCardSection", "aiMlCards"),
    ("bigDataCardSection", "bigDataCards"),
    ("achievementSection", "achievementCards"),
    ("buildingSection", "buildingCards"),
    ("kubernetesCardsSection", "kubernetesCards"),
    ("bringingBest", "transformationCards"),
    ("staffAugmentationSection", "staffAugmentationCards"),
    ("breakthrough", "breakThroughCards"),
    ("UseCases", "UseCasesCards"),
    ("HowWeCanHelpSection", "howCanWeHelp"),
)

UIUX_PROCESS_LOGOS = (
    ("diamond", "/images/image 85.png"),
    ("figma", "/images/image 86.png"),
    ("in", "/images/image 87.png"),
    ("axure", "/images/axure-2.png"),
    ("ai", "/images/image 89.png"),
    ("ps", "/images/image 90.png"),
    ("ps", "/images/image 84.png"),
)


def _text(value) -> str:
    if isinstance(value, str) or value is None:
        return lib.clean(value) or ""
    return lib.clean(lib.plain(value)) or ""


def _node_text(node) -> str:
    """Return textual leaves from a Tina rich-text node without dropping item boundaries."""
    if isinstance(node, str):
        return node
    if not isinstance(node, dict):
        return ""
    if node.get("type") == "text":
        return node.get("text") or ""
    return "".join(_node_text(child) for child in (node.get("children") or []))


def _card_description(value) -> str:
    """Keep source unordered-list items distinguishable instead of concatenating them."""
    if isinstance(value, dict) and value.get("type") == "root":
        lists = [block for block in (value.get("children") or []) if block.get("type") in {"ul", "ol"}]
        if lists:
            items = [lib.clean(_node_text(item)) or "" for item in lists[0].get("children") or []]
            return "\n".join(f"• {item}" for item in items if item)
    return _text(value)


def _cards(cards: list | None) -> list[dict]:
    """Map all observed Tina card variants into the services icon-card element."""
    return [
        {
            "icon": lib.media(card.get("icon") or card.get("logo"), _text(card.get("title") or card.get("heading"))),
            "title": _text(card.get("title") or card.get("heading")),
            "description": _card_description(card.get("description") or card.get("content")),
        }
        for card in (cards or [])
        if isinstance(card, dict)
    ]


def _flow_source(doc: dict) -> tuple[dict, list, str]:
    """Find a flow heading/list in an individual block, page document, or bundle."""
    if not doc:
        return {}, [], "image"
    if doc.get("headingBlock") or doc.get("cardItems") is not None:
        return doc.get("headingBlock") or {}, doc.get("cardItems") or [], doc.get("backgroundStyle") or "image"
    if any(k in doc for k in ("status1", "heading1", "heading", "title")):
        return doc, doc.get("cards") or doc.get("Cards") or [], doc.get("backgroundStyle") or "image"
    for heading_key, cards_key in FLOW_PAIRS:
        if doc.get(heading_key):
            return doc[heading_key] or {}, doc.get(cards_key) or [], doc.get("backgroundStyle") or "image"
    return {}, [], doc.get("backgroundStyle") or "image"


def what_we_offer(doc: dict, *, anchor_id: str = "") -> dict:
    """Build ``services.what-we-offer`` from Tina ``whatweoffer``.

    Reads ``heading``, ``title``, ``description``, ``list[]`` and
    ``cardsData[].icon/title``.  This exact object appears on service, company,
    and careers documents, so fields are intentionally optional.
    """
    doc = doc or {}
    return {
        "__component": "services.what-we-offer",
        "anchorId": anchor_id,
        "eyebrow": _text(doc.get("heading") or doc.get("status1")),
        "heading": _text(doc.get("title") or doc.get("heading1")),
        "description": _text(doc.get("description") or doc.get("desc")),
        "items": [{"title": "", "description": _text(item)} for item in (doc.get("list") or []) if _text(item)],
        "cards": _cards(doc.get("cardsData") or doc.get("cards")),
        "cardLayout": "two" if doc.get("list") else "three",
    }


def flow_cards(doc: dict, *, anchor_id: str = "") -> dict:
    """Build ``services.flow-cards`` from the raw ProjectFlow/Card Tina fields.

    Supports a direct heading object (``status1``, ``heading1``, ``desc``), a
    full page document using all observed pairs such as ``Projectflow`` +
    ``Cards``, ``achievementSection`` + ``achievementCards`` and
    ``UseCases`` + ``UseCasesCards``, or a ``headingBlock``/``cardItems``
    bundle. Individual cards read ``logo|icon``, ``heading|title`` and
    ``content|description``.
    """
    heading, cards, background_style = _flow_source(doc or {})
    return {
        "__component": "services.flow-cards",
        "anchorId": anchor_id,
        "eyebrow": _text(heading.get("status1") or heading.get("heading")),
        "heading": _text(heading.get("heading1") or heading.get("title")),
        "description": _text(heading.get("desc") or heading.get("description")),
        "backgroundImage": lib.media("/backgroud-images/our-service.jpg", ""),
        "backgroundStyle": background_style,
        "cards": _cards(cards),
    }


def process_accordion(doc: dict, *, anchor_id: str = "") -> dict:
    """Build ``services.process-accordion`` from Tina ``CollapseComponentData``.

    Reads ``header``, ``title``, ``description``, ``image``, ``bg`` and
    ``list[].title/description``.  The shape is shared by service detail,
    ERP, SAP HANA, and core-SAP pages and safely handles absent media.
    """
    doc = doc or {}
    return {
        "__component": "services.process-accordion",
        "anchorId": anchor_id,
        "eyebrow": _text(doc.get("header") or doc.get("status1")),
        "heading": _text(doc.get("title") or doc.get("heading1")),
        "description": _text(doc.get("description") or doc.get("desc")),
        "backgroundImage": lib.media("https://images-linkfields-poc.s3.eu-west-2.amazonaws.com/OurprocessBackground.png", ""),
        "backgroundStyle": "image" if doc.get("bg") else "dark",
        "image": lib.media(doc.get("image"), _text(doc.get("title"))),
        "imageVariant": "standard",
        "items": [
            {"title": _text(item.get("title")), "description": _text(item.get("description"))}
            for item in (doc.get("list") or [])
            if isinstance(item, dict)
        ],
        "logos": [
            {"label": label, "image": lib.media(asset, label), "href": ""}
            for label, asset in UIUX_PROCESS_LOGOS
        ] if doc.get("imageList") else [],
    }


def superpowers(doc: dict, *, anchor_id: str = "") -> dict:
    """Build ``services.superpowers`` from Tina benefits/superpowers fields.

    Reads the observed heading variants ``OurSuperPowers``, ``OurBenefits``,
    ``Benefits`` or ``benefits`` (or a direct heading object) and sibling
    ``darkAndLightComponentCards[].icon/title/description``.
    """
    doc = doc or {}
    if any(k in doc for k in ("status1", "heading1", "title")):
        heading = doc
        cards = doc.get("darkAndLightComponentCards") or doc.get("cards") or []
    else:
        heading = next((doc[key] for key in ("OurSuperPowers", "OurBenefits", "Benefits", "benefits") if doc.get(key)), {})
        cards = doc.get("darkAndLightComponentCards") or []
    return {
        "__component": "services.superpowers",
        "anchorId": anchor_id,
        "eyebrow": _text(heading.get("status1") or heading.get("heading")),
        "heading": _text(heading.get("heading1") or heading.get("title")),
        "cards": _cards(cards),
    }


def _media_process(doc: dict, *, anchor_id: str = "", variant: str = "standard") -> dict:
    doc = doc or {}
    return {
        "__component": "services.media-process",
        "anchorId": anchor_id,
        "eyebrow": _text(doc.get("status") or doc.get("status1")),
        "heading": _text(doc.get("title") or doc.get("heading1")),
        "description": _text(doc.get("description") or doc.get("desc")),
        "points": [{"title": "", "description": _text(point.get("points") if isinstance(point, dict) else point)} for point in (doc.get("points") or [])],
        "image": lib.media(doc.get("imageURL") or doc.get("image"), _text(doc.get("title") or doc.get("heading1"))),
        "backgroundImage": lib.media(doc.get("bgImageURL"), ""),
        "partnersHeading": _text((doc.get("ourOffering") or {}).get("heading")),
        "partners": [
            {"label": "", "image": lib.media(card.get("icon"), "icons"), "href": card.get("url") or ""}
            for card in ((doc.get("ourOffering") or {}).get("platformCardsData") or [])
            if isinstance(card, dict)
        ],
        "variant": variant,
    }


def _numbered_help(doc: dict, items: list, *, anchor_id: str = "") -> dict:
    doc = doc or {}
    return {
        "__component": "services.numbered-help",
        "anchorId": anchor_id,
        "eyebrow": _text(doc.get("status1") or doc.get("heading")),
        "heading": _text(doc.get("heading1") or doc.get("title")),
        "backgroundImage": lib.media("/backgroud-images/blue-gradient.jpg", ""),
        "items": [{"description": _text(item.get("description") if isinstance(item, dict) else item)} for item in (items or [])],
    }


def _logo_offering(doc: dict, *, anchor_id: str = "") -> dict:
    doc = doc or {}
    industries = [
        ("Telecom", "https://images-linkfields-poc.s3.eu-west-2.amazonaws.com/telecom-small.jpg"),
        ("Fintech", "https://images-linkfields-poc.s3.eu-west-2.amazonaws.com/fintech-small.jpg"),
        ("FMCG", "https://images-linkfields-poc.s3.eu-west-2.amazonaws.com/FMCG%20(1).png"),
        ("Banking", "https://images-linkfields-poc.s3.eu-west-2.amazonaws.com/banking-small.jpg"),
        ("Insurance", "https://images-linkfields-poc.s3.eu-west-2.amazonaws.com/insurance-small.jpg"),
        ("Mining", "https://images-linkfields-poc.s3.eu-west-2.amazonaws.com/mining-small.jpg"),
        ("Oil and Gas", "https://images-linkfields-poc.s3.eu-west-2.amazonaws.com/oil%26gas-small.jpg"),
        ("Manufacturing", "https://images-linkfields-poc.s3.eu-west-2.amazonaws.com/Manufacturing%20(1).png"),
    ]
    groups = []
    for source_key in ("performingLanguages", "platforms"):
        item = doc.get(source_key) or {}
        groups.append(
            {
                "heading": _text(item.get("heading")),
                "logos": [
                    {"icon": lib.media(card.get("icon"), "icons"), "title": "", "description": ""}
                    for card in (item.get("platformCardsData") or [])
                    if isinstance(card, dict)
                ],
            }
        )
    return {
        "__component": "services.logo-offering",
        "anchorId": anchor_id,
        "backgroundImage": lib.media("/backgroud-images/our-process.jpg", ""),
        "groups": groups,
        "industriesHeading": "Industries",
        "industries": [{"title": name, "description": "", "image": lib.media(url, name), "href": ""} for name, url in industries],
    }


def _bundle(heading: dict, cards: list, *, background_style: str = "image") -> dict:
    return {"headingBlock": heading or {}, "cardItems": cards or [], "backgroundStyle": background_style}


def _base(page_key: str, doc: dict, sections: list) -> dict:
    hero = doc.get("heroSectionData") or {}
    return lib.page(page_key, _text(hero.get("heading1")), [lib.hero_section(page_key, hero), lib.overview_section(hero), *sections, *lib.standard_tail(page_key)])


def build() -> list[dict]:
    """Seed all 18 requested service-detail pages in their original visual order."""
    pages: list[dict] = []

    page_key = "services__engineering__application-development"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("Projectflow"), doc.get("Cards")), anchor_id="what-we-offer"),
        lib.message_banner(doc.get("growthMessage")),
        _media_process(doc.get("MediaSection"), anchor_id="our-process"),
        superpowers(doc, anchor_id="our-superpowers"),
    ]))

    page_key = "services__engineering__devops"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        what_we_offer(doc.get("whatweoffer"), anchor_id="how-can-we-help"),
        lib.message_banner(doc.get("messageBannerData")),
        flow_cards(_bundle(doc.get("ProjectFlowCards"), doc.get("Cards")), anchor_id="what-we-offer"),
        process_accordion(doc.get("CollapseComponentData"), anchor_id="our-process"),
        superpowers(doc, anchor_id="benefits"),
    ]))

    page_key = "services__engineering__quality-control"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("ProjectFlowCards"), doc.get("Cards")), anchor_id="what-we-offer"),
        lib.message_banner(doc.get("messageBannerData")),
        _media_process(doc.get("MediaSection"), anchor_id="our-process"),
        process_accordion(doc.get("CollapseComponentData"), anchor_id="automation-framework"),
        superpowers(doc, anchor_id="benifits"),
    ]))

    page_key = "services__consulting__product-discovery"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("Projectflow"), doc.get("transformationCards")), anchor_id="what-we-offer"),
        lib.message_banner(doc.get("growthmessage")),
        _media_process(doc.get("MediaSection"), anchor_id="our-process"),
    ]))

    page_key = "services__consulting__solution-discovery"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        _numbered_help(doc.get("HowWeCanHelpSection"), doc.get("howCanWeHelp"), anchor_id="how-can-we-help"),
        lib.message_banner(doc.get("growthmessage")),
        what_we_offer(doc.get("whatweoffer"), anchor_id="what-we-offer"),
        _media_process(doc.get("MediaSection"), anchor_id="our-process"),
    ]))

    page_key = "services__consulting__technology-advisory"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        what_we_offer(doc.get("whatweoffer"), anchor_id="what-we-offer"),
        lib.message_banner(doc.get("growthmessage")),
        flow_cards(_bundle(doc.get("Projectflow"), doc.get("transformationCards"), background_style="dark"), anchor_id="our-offerings"),
    ]))

    page_key = "services__consulting__uiux-design"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("Projectflow"), doc.get("Cards")), anchor_id="what-we-offer"),
        lib.message_banner(doc.get("messageBannerData")),
        process_accordion(doc.get("CollapseComponentData"), anchor_id="our-process"),
    ]))

    page_key = "services__technology__ai-ml"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("aiMlCardSection"), doc.get("aiMlCards")), anchor_id="how-can-we-help"),
        lib.message_banner(doc.get("growthmessage")),
        _media_process(doc.get("MediaSection"), anchor_id="our-process"),
    ]))

    page_key = "services__technology__big-data"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("bigDataCardSection"), doc.get("bigDataCards")), anchor_id="how-can-we-help"),
        lib.message_banner(doc.get("growthmessage")),
        _media_process(doc.get("MediaSection"), anchor_id="our-process"),
    ]))

    page_key = "services__cloud__cloud-consulting"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        what_we_offer(doc.get("whatweoffer"), anchor_id="what-we-offer"),
        lib.message_banner(doc.get("growthmessage")),
        _media_process(doc.get("MediaSection"), anchor_id="our-process"),
    ]))

    page_key = "services__cloud__cloud-development"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("achievementSection"), doc.get("achievementCards")), anchor_id="what-we-offer"),
        lib.message_banner(doc.get("growthmessage")),
        flow_cards(_bundle(doc.get("buildingSection"), doc.get("buildingCards")), anchor_id="our-process"),
    ]))

    page_key = "services__cloud__cloud-migration"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        what_we_offer(doc.get("whatweoffer"), anchor_id="how-can-we-help"),
        lib.message_banner(doc.get("growthmessage")),
        process_accordion(doc.get("CollapseComponentData"), anchor_id="our-process"),
    ]))

    page_key = "services__cloud__ipaas"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("achievementSection"), doc.get("achievementCards"), background_style="dark"), anchor_id="what-we-offer"),
        lib.message_banner(doc.get("growthmessage")),
        flow_cards(_bundle(doc.get("buildingSection"), doc.get("buildingCards")), anchor_id="our-process"),
    ]))

    page_key = "services__cloud__kubernetes-services"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("kubernetesCardsSection"), doc.get("kubernetesCards")), anchor_id="how-can-we-help"),
        lib.message_banner(doc.get("growthmessage")),
        _media_process(doc.get("MediaSection"), anchor_id="our-process"),
    ]))

    page_key = "services__automation__digital-transformation"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("Projectflow"), doc.get("Cards"), background_style="dark"), anchor_id="how-can-we-help"),
        _media_process(doc.get("MediaSection"), anchor_id="covid-19"),
        lib.message_banner(doc.get("messageBannerData")),
        _media_process(doc.get("digitalEvolutionMediaSection"), anchor_id="our-process", variant="compact"),
        flow_cards(_bundle(doc.get("UseCases"), doc.get("UseCasesCards")), anchor_id="use-cases"),
    ]))

    page_key = "services__automation__robotic-process-automation"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("Projectflow"), doc.get("Cards")), anchor_id="how-can-we-help"),
        lib.message_banner(doc.get("messageBannerData")),
        _media_process(doc.get("MediaSection"), anchor_id="our-process"),
        superpowers(doc, anchor_id="benefits"),
        flow_cards(_bundle(doc.get("breakthrough"), doc.get("breakThroughCards")), anchor_id="use-cases"),
    ]))

    page_key = "services__teams__managed-team"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("bringingBest"), doc.get("transformationCards")), anchor_id="how-can-we-help"),
        lib.message_banner(doc.get("growthmessage")),
        process_accordion(doc.get("CollapseComponentData"), anchor_id="our-process"),
    ]))

    page_key = "services__teams__staff-augmentation"
    doc = lib.page_doc(page_key)
    pages.append(_base(page_key, doc, [
        flow_cards(_bundle(doc.get("staffAugmentationSection"), doc.get("staffAugmentationCards")), anchor_id="how-can-we-help"),
        lib.message_banner(doc.get("growthmessage")),
        _media_process(doc.get("MediaSection"), anchor_id="our-process"),
        _logo_offering(doc, anchor_id="our-offering"),
    ]))

    return pages
