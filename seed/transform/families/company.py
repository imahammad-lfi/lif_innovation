"""Company family page transforms – see docs/SECTION-CONTRACT.md.

The service and solution card grids are cross-family shared blocks.  Their owners may
publish after this module, therefore their builders are loaded inside ``build`` and a
missing builder is deliberately omitted rather than reimplemented here.
"""
from __future__ import annotations

import importlib

import lib


def _media_story(raw: dict | None, *, anchor_id: str, reverse: bool = False, rounded_image: bool = False) -> dict:
    """Return company.media-story from Tina's common {status,title,description,imageURL} shape."""
    raw = raw or {}
    return {
        "__component": "company.media-story",
        "anchorId": anchor_id,
        "eyebrow": lib.clean(raw.get("status")) or "",
        "heading": raw.get("title") or "",
        "description": raw.get("description") or "",
        "image": lib.media(raw.get("imageURL"), raw.get("title")),
        "reverse": reverse,
        "roundedImage": rounded_image,
    }


def _shared_builder(module_name: str, candidates: tuple[str, ...], raw: dict | None, **kwargs) -> dict | None:
    """Call a published cross-family builder, returning None until that owner publishes it."""
    try:
        module = importlib.import_module(module_name)
    except ImportError:
        return None
    for name in candidates:
        builder = getattr(module, name, None)
        if callable(builder):
            return builder(raw or {}, **kwargs)
    return None



def _company_card_grid(raw: dict | None, *, anchor_id: str, variant: str, background_image: str | None = None) -> dict:
    """Return the company-owned values or how-we-work card matrix from Tina card data."""
    raw = raw or {}
    return {
        "__component": "company.card-grid",
        "anchorId": anchor_id,
        "eyebrow": lib.clean(raw.get("heading") or raw.get("status") or raw.get("status1")) or "",
        "heading": raw.get("title") or raw.get("heading1") or "",
        "description": raw.get("description") or raw.get("desc") or "",
        "cards": [
            {
                "icon": lib.media(card.get("icon") or card.get("logo"), card.get("title") or card.get("heading")),
                "title": lib.clean(card.get("title") or card.get("heading")) or "",
                "description": card.get("description") or card.get("content") or "",
                "href": "",
                "linkLabel": "",
                "color": "",
            }
            for card in (raw.get("cardsData") or raw.get("Cards") or raw.get("cards") or [])
            if isinstance(card, dict)
        ],
        "backgroundImage": lib.media(background_image, "") if background_image else None,
        "variant": variant,
    }


def _vision_list(cards: list[dict] | None) -> dict:
    return {
        "__component": "company.vision-list",
        "anchorId": "our-vision",
        "items": [
            {
                "icon": lib.media(card.get("logo"), card.get("heading")),
                "title": lib.clean(card.get("heading")) or "",
                "description": card.get("content") or "",
            }
            for card in cards or []
        ],
    }


def _exploration(raw: dict | None) -> dict:
    raw = raw or {}
    return {
        "__component": "company.exploration-grid",
        "anchorId": "our-exploration",
        "eyebrow": lib.clean(raw.get("heading")) or "",
        "heading": raw.get("title") or "",
        "cards": [
            {"icon": lib.media(card.get("icon")), "description": card.get("title") or ""}
            for card in raw.get("cardsData") or []
        ],
    }


def _career_slider(raw: dict | None) -> dict:
    raw = raw or {}
    button = raw.get("button") or {}
    return {
        "__component": "company.career-slider",
        "anchorId": "careers",
        "heading": raw.get("heading") or "",
        "ctaLabel": lib.clean(button.get("buttonLabel")) or "",
        "ctaHref": (button.get("action") or "").strip(),
        "backgroundImage": lib.media("/backgroud-images/careerspagebg.png"),
        "images": [lib.media(image.get("image")) for image in raw.get("images") or []],
    }


def _location_carousel(raw: dict | None) -> dict:
    raw = raw or {}
    return {
        "__component": "company.location-carousel",
        "anchorId": "life-at-linkfields",
        "eyebrow": lib.clean(raw.get("status")) or "",
        "heading": raw.get("title") or "",
        "description": raw.get("description") or "",
        "slides": [
            {"image": lib.media(slide.get("image"), slide.get("location")), "label": lib.clean(slide.get("location")) or ""}
            for slide in raw.get("imagesSlider") or []
        ],
    }


def _career_cta(raw: dict | None) -> dict:
    raw = raw or {}
    action = raw.get("actionButton") or {}
    return {
        "__component": "company.career-cta",
        "anchorId": "jobs",
        "eyebrow": lib.clean(raw.get("status")) or "",
        "heading": raw.get("title") or "",
        "description": raw.get("description") or "",
        "cta": lib.link(action.get("text"), action.get("url")) if action else None,
        "ctaIcon": lib.media("/images/linkedin.svg", "LinkedIn"),
        "backgroundImage": lib.media("/backgroud-images/careers.jpg"),
    }


def _join_lines(*values: str | None) -> str:
    return "\n".join(lib.clean(value) for value in values if lib.clean(value))


def _office_presence(raw: dict | None, *, anchor_id: str = "our-presence") -> dict:
    """Return the reusable office-map section from the ContactUsPage location-card source."""
    raw = raw or {}
    offices = []
    for card in raw.get("locationCard") or []:
        action = card.get("actionButton") or {}
        offices.append(
            {
                "icon": lib.media(card.get("imageUrl"), card.get("country")),
                "country": lib.clean(card.get("country")) or "",
                "address": _join_lines(card.get("building"), card.get("landmark"), card.get("city")),
                "phone": _join_lines(card.get("pinCode")),
                "directionsLabel": lib.clean(action.get("labelText")) or "",
                "directionsHref": action.get("url") or "",
            }
        )
    return {
        "__component": "company.office-presence",
        "anchorId": anchor_id,
        "eyebrow": lib.clean(raw.get("status")) or "",
        "heading": raw.get("title") or "",
        "mapImage": lib.media("/backgroud-images/location-world-map.jpg"),
        "offices": offices,
    }


def _contact_banner(raw: dict | None) -> dict:
    raw = raw or {}
    return {
        "__component": "company.contact-banner",
        "anchorId": "contact-details",
        "contacts": [
            {"title": lib.clean(contact.get("title")) or "", "email": lib.clean(contact.get("emailId")) or ""}
            for contact in raw.get("banner") or []
        ],
    }


def build() -> list[dict]:
    about_key = "company__about-us"
    approach_key = "company__our-approach"
    careers_key = "careers"
    contact_key = "contact-us"

    about_docs = lib.load_docs(about_key)
    about = about_docs.get("aboutUs") or {}
    about_hero = about.get("heroSectionData") or {}
    approach_docs = lib.load_docs(approach_key)
    approach = approach_docs.get("ourApproach") or {}
    approach_hero = approach.get("heroSectionData") or {}
    careers_docs = lib.load_docs(careers_key)
    careers = careers_docs.get("careersPage") or {}
    contact_docs = lib.load_docs(contact_key)
    contact = contact_docs.get("contactUsPage") or {}

    about_values = _company_card_grid(
        {**(about.get("transformationFlow") or {}), "cards": about.get("transformationCards") or []},
        anchor_id="our-values",
        variant="values",
        background_image="/backgroud-images/how-can-we-help.jpg",
    )
    approach_work = _company_card_grid(
        approach.get("whatweoffer") or {},
        anchor_id="how-we-work",
        variant="work",
    )
    careers_values = _shared_builder(
        "families.services",
        ("what_we_offer", "what_we_offer_section"),
        careers.get("whatweoffer") or {},
        anchor_id="we-nurture",
    )

    about_sections = [
        lib.hero_section(
            about_key,
            about_hero,
            anchors=lib.anchor_links(
                about_key,
                {
                    "OUR STORY": "our-story",
                    "Our Vision": "our-vision",
                    "OUR VALUES": "our-values",
                    "OUR EXPERTISE": "our-expertise",
                    "CSR": "csr",
                    "GET IN TOUCH": "get-in-touch",
                },
            ),
        ),
        _media_story(about.get("transformingFuture"), anchor_id="our-story"),
        _vision_list(about.get("visionCards")),
        about_values,
        lib.industries_showcase(about_docs.get("constantlyInnovating"), anchor_id="our-expertise"),
        _media_story(about.get("betterFuture"), anchor_id="csr"),
        *lib.standard_tail(about_key),
    ]

    approach_sections = [
        lib.hero_section(
            approach_key,
            approach_hero,
            anchors=lib.anchor_links(
                approach_key,
                {
                    "HOW WE WORK": "how-we-work",
                    "OUR EXPLORATION": "our-exploration",
                    "OUR EXPERTISE": "our-expertise",
                    "GET IN TOUCH": "get-in-touch",
                },
            ),
        ),
        approach_work,
        _exploration(approach.get("exploration")),
        lib.industries_showcase(approach_docs.get("constantlyInnovating"), anchor_id="our-expertise"),
        *lib.standard_tail(approach_key),
    ]

    careers_sections = [
        _career_slider(careers.get("slider")),
        _media_story(careers.get("careersMedia"), anchor_id="career", rounded_image=True),
        _location_carousel(careers.get("locationSliderMedia")),
        careers_values,
        _career_cta(careers.get("nextLevelCareer")),
        _office_presence(contact, anchor_id="our-presence"),
        lib.social_banner(),
    ]

    contact_sections = [
        lib.contact_form(layout="page", page_key=contact_key),
        _contact_banner(contact),
        _office_presence(contact, anchor_id="our-presence"),
    ]

    return [
        lib.page(about_key, "About Us", about_sections),
        lib.page(approach_key, "Our Approach", approach_sections),
        lib.page(careers_key, "Careers", careers_sections),
        lib.page(contact_key, "Contact Us", contact_sections),
    ]
