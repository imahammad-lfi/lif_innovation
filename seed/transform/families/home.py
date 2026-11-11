"""Home family page builders – see docs/SECTION-CONTRACT.md."""
from __future__ import annotations

import lib


PARTNER_LABELS = ["Azure", "Microsoft", "Blueprism", "Automation anywhere", "UiPath", "Salesforce", "Soterion", "Odoo"]
PARTNER_SVGS = {
    "Azure": "azure-svgrepo-com 1.svg",
    "Microsoft": "microsoft-svgrepo-com 1.svg",
    "Blueprism": "blueprism.svg",
    "Automation anywhere": "automation-anywhere-vector.svg",
    "UiPath": "uipath-vector-logo 1.svg",
    "Salesforce": "salesforce.svg",
    "Soterion": "Soterion logo.svg",
    "Odoo": "oddo-svgrepo-.svg",
    "AWS": "AWS_P_Logo.svg",
}
PARTNER_LINKS = {
    "Azure": "https://portal.azure.com",
    "Microsoft": "https://www.microsoft.com/en-in/",
    "Blueprism": "https://www.blueprism.com/",
    "Automation anywhere": "https://www.automationanywhere.com/",
    "UiPath": "https://www.uipath.com/",
    "Salesforce": "https://www.salesforce.com/in/",
    "Soterion": "https://soterion.com/",
    "Odoo": "https://www.odoo.com/",
    "AWS": "https://aws.amazon.com/free/?trk=16847e0c-46fb-467d-91ee-6e259e339665&sc_channel=ps&ef_id=:G:s&s_kwcid=AL!4422!10!72086958325164!72087482393523&msclkid=4c2d8a7749341cdcd932ece03a147043&all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc&awsf.Free%20Tier%20Types=*all&awsf.Free%20Tier%20Categories=*all",
}


def _link(value: dict | None, *, label_key: str = "text", href_keys: tuple[str, ...] = ("url", "link")) -> dict:
    """Map the small inconsistent Tina action object to shared.link."""
    value = value or {}
    href = next((value.get(key) for key in href_keys if value.get(key) is not None), "")
    return lib.link(value.get(label_key) or value.get("label") or "", href)


def _home_sections() -> list[dict]:
    doc = lib.load_docs("home").get("home", {})
    hero = doc.get("HeroSection") or {}
    solution_data = doc.get("ourSolutions") or {}
    services = doc.get("ourServices") or {}
    journey = doc.get("ourJourney") or {}
    careers = doc.get("carrers") or {}

    # The live front end ignores the CMS "technologies" icons and renders its own 200x120 SVG artboards
    # (public/images/*.svg) in this order, so the seed uses exactly those files.
    partners = [
        {"label": label, "image": lib.media(f"/images/{PARTNER_SVGS[label]}", label), "href": PARTNER_LINKS[label]}
        for label in [*PARTNER_LABELS, "AWS"]
    ]

    service_tabs = services.get("serviceTabs") or []
    industries = doc.get("industry") or []
    # The original loop starts at Fintech; retain its visible initial ordering while preserving all CMS records.
    industry_order = {"Fintech": 0, "Insurance": 1, "Mining": 2, "FMCG": 3, "Oil & Gas": 4, "Manufacturing": 5, "Telecom": 6, "Banking": 7}
    industries = sorted(industries, key=lambda item: industry_order.get(lib.clean(item.get("title")), 99))

    return [
        {
            "__component": "home.hero-slider",
            "backgroundVideo": lib.media("/videos/heroVideo.webm", "Linkfields innovation highlights"),
            "slides": [
                {
                    "title": lib.clean(slide.get("title")) or "",
                    "description": lib.clean(slide.get("description")) or "",
                    "cta": _link(slide.get("btn"), label_key="label", href_keys=("link",)),
                }
                for slide in hero.get("services") or []
            ],
            "partners": partners,
        },
        {
            "__component": "home.solutions-grid",
            "anchorId": "solutions",
            "backgroundImage": lib.media("/backgroud-images/our-solutions.jpg", "Our Solutions background"),
            "heading": lib.clean(solution_data.get("title")) or "",
            "description": lib.clean(solution_data.get("subtitle")) or "",
            "cards": [
                {
                    "title": lib.clean(card.get("title")) or "",
                    "image": lib.media(card.get("image"), lib.clean(card.get("title"))),
                    "description": lib.clean(card.get("description")) or "",
                    "cta": _link(card.get("actionButton")),
                }
                for card in solution_data.get("details") or []
            ],
        },
        {
            "__component": "home.services-showcase",
            "anchorId": "services",
            "backgroundImage": lib.media("/backgroud-images/our-service.jpg", "Our Services background"),
            "heading": lib.clean(services.get("mainTitle")) or "",
            "description": lib.clean(services.get("mainDesc")) or "",
            "cta": _link(services.get("button"), label_key="labelText"),
            "cards": [
                {
                    "title": lib.clean(tab.get("TabName")) or "",
                    "image": lib.media(tab.get("tabImage"), lib.clean(tab.get("TabName"))),
                    "href": (tab.get("url") or "").strip(),
                }
                for tab in service_tabs
            ],
        },
        {
            "__component": "home.industries-carousel",
            "anchorId": "industries",
            "heading": "Industries",
            "description": "We have rich experience in your industry. We also share insights across industries to help you uncover new opportunities to adapt and disrupt.",
            "items": [
                {
                    "title": lib.clean(item.get("title")) or "",
                    "description": lib.clean(item.get("description")) or "",
                    "image": lib.media(item.get("backgroundImage"), lib.clean(item.get("title"))),
                    "cta": _link(item.get("actionButton")),
                }
                for item in industries
            ],
        },
        {
            "__component": "home.journey",
            "anchorId": "journey",
            "backgroundImage": lib.media("/backgroud-images/our-journey.jpg", "Our Journey background"),
            "heading": lib.clean(journey.get("title")) or "",
            "description": lib.clean(journey.get("description")) or "",
            "stats": [
                {
                    "value": str(item.get("time") or ""),
                    "suffix": item.get("suffix") or "",
                    "label": lib.clean(item.get("description")) or "",
                }
                for item in journey.get("analytics") or []
            ],
        },
        {
            "__component": "home.awards-carousel",
            "anchorId": "awards",
            "backgroundImage": lib.media("/backgroud-images/awards.jpg", "Awards background"),
            "cards": [
                {
                    "title": lib.clean(item.get("title")) or "",
                    "description": lib.clean(item.get("description")) or "",
                    "image": lib.media(item.get("image"), lib.clean(item.get("title"))),
                    "cta": _link(item.get("actionButton")),
                }
                for item in doc.get("awardsAndRecognition") or []
            ],
        },
        lib.featured_insights(),
        {
            "__component": "home.careers-banner",
            "anchorId": "careers",
            "backgroundImage": lib.media("/backgroud-images/careers.jpg", "Careers background"),
            "heading": lib.clean(careers.get("description")) or "",
            "cta": _link(careers.get("actionButton")),
        },
        lib.contact_form(page_key="home"),
        lib.social_banner(),
    ]


def _innovation_sections() -> list[dict]:
    page_key = "explore-more__innovationAndTransformation"
    doc = lib.load_docs(page_key).get("innovationAndTransformation", {})
    # Imported here so another family's temporary module state cannot break the home page builder.
    from families.solutions import how_can_we_help, technology_details

    hero = doc.get("heroSectionData") or {}
    technology = doc.get("innovationAndTransformationSection") or {}

    return [
        lib.hero_section(page_key, hero, anchors=lib.anchor_links(page_key, {
            "OVERVIEW": "overview",
            "HOW CAN WE HELP": "how-can-we-help",
            "TECHNOLOGY DETAILS": "technology-details",
            "GET IN TOUCH": "get-in-touch",
        })),
        lib.overview_section(hero),
        how_can_we_help(doc, anchor_id="how-can-we-help"),
        lib.message_banner(doc.get("messageBannerData")),
        technology_details({"technologyDetails": technology, "Cards": doc.get("innovationCards") or [], "innovationGrid": True}, anchor_id="technology-details"),
        lib.stats_band(lib.load_docs(page_key).get("persistentlyInnovative"), anchor_id="persistently-innovative"),
        *lib.standard_tail(page_key),
    ]


def build() -> list[dict]:
    """Build the home and Innovation and Transformation pages owned by this family."""
    return [
        lib.page("home", "Linkfields Innovations", _home_sections()),
        lib.page("explore-more__innovationAndTransformation", "Innovation and Transformation", _innovation_sections()),
    ]
