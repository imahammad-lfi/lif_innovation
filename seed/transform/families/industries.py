"""Industry detail pages – see docs/SECTION-CONTRACT.md."""
from __future__ import annotations

import lib


BACKGROUND_IMAGE = "/backgroud-images/buildingsTools.jpg"
PAGES = (
    ("industries__banking", "banking"),
    ("industries__fintech", "fintech"),
    ("industries__fmcg", "fmcg"),
    ("industries__insurance", "insurance"),
    ("industries__manufacturing", "manufacturing"),
    ("industries__mining", "mining"),
    ("industries__oil-gas", "oilandgas"),
    ("industries__telecom", "telecom"),
)


def building_tools(doc: dict | None, shared_doc: dict | None, *, anchor_id: str = "what-we-offer") -> dict | None:
    """Build ``industries.building-tools`` from page ``BuildingToolsSection`` and global ``buildingsTools``.

    The page document supplies the orange eyebrow and heading while the shared document supplies
    the three editable Automation, Consulting, and Engineering cards.
    """
    doc = doc or {}
    shared_doc = shared_doc or {}
    tools = shared_doc.get("detailSection") or []
    if not doc and not tools:
        return None
    return {
        "__component": "industries.building-tools",
        "anchorId": anchor_id,
        "eyebrow": lib.clean(doc.get("status1")) or "",
        "heading": lib.clean(doc.get("heading1")) or "",
        "backgroundImage": lib.media(BACKGROUND_IMAGE, ""),
        "tools": [
            {
                "title": lib.clean(item.get("title")) or "",
                "description": lib.clean(item.get("description")) or "",
                "actionLabel": lib.clean(item.get("actionButton")) or "",
                "actionUrl": (item.get("url") or "").strip(),
            }
            for item in tools
        ],
    }


def specialization_list(doc: dict | None, *, anchor_id: str = "our-specialization") -> dict | None:
    """Build ``industries.specialization-list`` from a Tina ``specializationList`` object."""
    doc = doc or {}
    items = doc.get("list") or []
    if not doc and not items:
        return None
    heading = lib.clean(doc.get("heading")) or ""
    return {
        "__component": "industries.specialization-list",
        "anchorId": anchor_id,
        # Original source stores this in uppercase; the original rendered label is title case.
        "heading": heading.title(),
        "backgroundImage": lib.media("/images/Industries S bg.png", ""),
        "items": [
            {
              "title": lib.clean(item.get("title")) or "",
                "description": lib.clean(item.get("desc")) or "",
                "image": lib.media(item.get("image"), lib.clean(item.get("title"))),
            }
            for item in items
        ],
    }


def build() -> list[dict]:
    """Return the eight industry detail pages in their captured top-to-bottom section order."""
    pages: list[dict] = []
    for page_key, document_key in PAGES:
        docs = lib.load_docs(page_key)
        page_doc = docs.get(document_key) or {}
        hero = page_doc.get("heroSectionData") or {}
        sections = [
            lib.hero_section(page_key, hero),
            lib.overview_section(hero, anchor_id="industry-overview"),
        ]
        # Oil & Gas is the sole industry reference page without the building-tools band.
        if page_key != "industries__oil-gas":
            sections.append(building_tools(page_doc.get("BuildingToolsSection"), docs.get("buildingsTools")))
        sections.extend(
            [
                lib.message_banner(page_doc.get("leadersMessageBanner")),
                specialization_list(page_doc.get("specializationList")),
                *lib.standard_tail(page_key),
            ]
        )
        pages.append(lib.page(page_key, lib.clean(hero.get("heading1")) or document_key, sections))
    return pages
