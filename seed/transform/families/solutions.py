"""Seed transformer for the ERP solutions family.

Owns reusable ``howCanWeHelpSection*`` and ``technologyDetails*`` blocks. Source
content is taken from the crawled Tina documents, with the Odoo/Salesforce
presentational-only datasets transcribed from their rendered original markup.
"""
from __future__ import annotations

import lib


BG_HOW = "/backgroud-images/how-can-we-help.jpg"
BG_PROCESS = "https://images-linkfields-poc.s3.eu-west-2.amazonaws.com/OurprocessBackground.png"
BG_OUR_PROCESS = "/backgroud-images/our-process.jpg"
BG_TECH = "/backgroud-images/whats-in-it-for-you.jpg"
BG_SALESFORCE = "/backgroud-images/salesforce-services-BG.png"


def _value(doc: dict | None, *names: str):
    """Return the first non-empty spelling of a Tina field from ``doc``."""
    doc = doc or {}
    for name in names:
        value = doc.get(name)
        if value not in (None, "", [], {}):
            return value
    return None


def _block(doc: dict | None, *names: str) -> dict:
    """Locate one of several casing/name variants of a Tina child object."""
    doc = doc or {}
    lower = {str(key).lower(): value for key, value in doc.items()}
    for name in names:
        value = doc.get(name, lower.get(name.lower()))
        if isinstance(value, dict):
            return value
    return doc if isinstance(doc, dict) else {}


def _card(item: dict) -> dict:
    """Convert the recurring Tina Cards item into the editable icon-card payload."""
    action = item.get("actionButton") or {}
    return {
        "icon": lib.media(item.get("logo"), lib.clean(item.get("heading"))),
        "title": lib.clean(item.get("heading")) or "",
        "description": lib.clean(item.get("content")) or "",
        "href": (action.get("url") or item.get("href") or "").strip(),
        "linkLabel": lib.clean(action.get("text")) or "",
        "color": lib.clean(item.get("bgcolor")) or "",
    }


def _cards(items) -> list[dict]:
    return [_card(item) for item in (items or []) if isinstance(item, dict)]


def _heading_fields(doc: dict | None) -> dict:
    doc = doc or {}
    return {
        "eyebrow": lib.clean(_value(doc, "status1", "status", "eyebrow", "header")) or "",
        "heading": lib.clean(_value(doc, "heading1", "heading", "title")) or "",
        "description": lib.md(_value(doc, "desc", "description", "body")),
        "image": lib.media(_value(doc, "logo", "imagesrc", "image", "imageSrc"), lib.clean(_value(doc, "heading1", "heading", "title"))),
    }


def how_can_we_help(doc: dict, *, anchor_id: str = "") -> dict:
    """Build ``solutions.how-can-we-help`` from Tina ``howCanWeHelpSection*``.

    Accepts either the raw header sub-object (``status1``, ``heading1``, ``desc``)
    or its owning page document, whose sibling ``Cards`` become editable icon
    cards. This covers SAP, Microsoft Dynamics, Salesforce, SAP HANA, Innovation
    & Transformation, ERP, Data Services, and Services & More casing variants.
    """
    source = _block(
        doc,
        "HowCanWeHelpSection",
        "howCanWeHelpSection",
        "TransformingOperations",
        "Benefits",
        "S_4_Hana",
        "keyComponents",
    )
    card_source = _value(doc, "Cards", "sapCards", "S4HanaCards", "howCanWeHelpCards") if isinstance(doc, dict) else None
    return {
        "__component": "solutions.how-can-we-help",
        "anchorId": anchor_id,
        **_heading_fields(source),
        "cards": _cards(card_source),
        "backgroundImage": lib.media(BG_HOW, ""),
        "linkedCards": bool(any(card.get("href") for card in _cards(card_source))),
    }


def technology_details(doc: dict, *, anchor_id: str = "") -> dict:
    """Build ``solutions.technology-details`` from Tina ``technologyDetails*``.

    The page documents call the same visual block ``dynamics365Section`` /
    ``dynamics365Cards`` and ``odooImplementationAreasSection`` /
    ``OdooImplementationAreasCards``. The generic spelling and conventional
    first/second text aliases remain supported for About Us and Innovation pages.
    """
    source = _block(doc, "technologyDetails", "dynamics365Section", "odooImplementationAreasSection")
    cards = _value(doc, "dynamics365Cards", "OdooImplementationAreasCards", "cards", "Cards")
    fields = _heading_fields(source)
    return {
        "__component": "solutions.technology-details",
        "anchorId": anchor_id,
        **fields,
        "layout": "grid" if ("odooImplementationAreasSection" in doc or doc.get("innovationGrid")) else "stack",
        "secondaryEyebrow": lib.clean(_value(source, "status2", "secondaryStatus", "eyebrow2")) or "",
        "secondaryHeading": lib.clean(_value(source, "heading2", "secondaryHeading", "title2")) or "",
        "secondaryDescription": lib.md(_value(source, "desc2", "secondaryDescription", "description2", "para2")),
        "cards": _cards(cards),
        "backgroundImage": lib.media(BG_TECH, ""),
    }


def card_grid(doc: dict, cards, *, anchor_id: str = "", variant: str = "dark", background: str = BG_HOW) -> dict:
    """Build a solutions card grid from a Tina header object plus recurring Cards."""
    return {
        "__component": "solutions.card-grid",
        "anchorId": anchor_id,
        **_heading_fields(doc),
        "cards": _cards(cards),
        "variant": variant,
        "backgroundImage": lib.media(background, ""),
    }


def split_accordion(doc: dict, *, anchor_id: str = "") -> dict:
    """Build a two-column title/copy and openable list block from Collapse data."""
    return {
        "__component": "solutions.split-accordion",
        "anchorId": anchor_id,
        "eyebrow": lib.clean(_value(doc, "header", "status1", "status")) or "",
        "heading": lib.clean(_value(doc, "title", "heading1", "heading")) or "",
        "description": lib.md(_value(doc, "description", "desc", "body")),
        "items": [
            {"title": lib.clean(item.get("title", item.get("heading"))) or "", "description": lib.clean(item.get("description", item.get("content"))) or ""}
            for item in (doc.get("list") or doc.get("content") or [])
            if isinstance(item, dict)
        ],
        "backgroundImage": lib.media(BG_PROCESS, ""),
    }


def _accordion_text(item: dict) -> str:
    """Flatten nested Tina accordion blocks while preserving every visible heading and list item."""
    content = item.get("content", item.get("description", ""))
    if not isinstance(content, list):
        return lib.clean(content) or ""
    blocks: list[str] = []
    for part in content:
        if not isinstance(part, dict):
            continue
        title = lib.clean(part.get("heading")) or ""
        body = lib.clean(part.get("description", part.get("content", ""))) or ""
        list_items = [lib.clean(row.get("listItem")) or "" for row in (part.get("list") or []) if isinstance(row, dict)]
        pieces = [piece for piece in [title, body, *(f"• {entry}" for entry in list_items if entry)] if piece]
        if pieces:
            blocks.append("\n".join(pieces))
    return "\n\n".join(blocks)


def accordion_stack(items, *, anchor_id: str = "", eyebrow: str = "", heading: str = "", variant: str = "full") -> dict:
    """Build full-width accordion rows from Tina title/content collections."""
    return {
        "__component": "solutions.accordion-stack",
        "anchorId": anchor_id,
        "eyebrow": eyebrow,
        "heading": heading,
        "variant": variant,
        "items": [
            {
                "title": lib.clean(item.get("title", item.get("heading"))) or "",
                "description": _accordion_text(item),
            }
            for item in (items or [])
            if isinstance(item, dict)
        ],
        "backgroundImage": lib.media("/backgroud-images/S1.png", ""),
    }


def numbered_list(header: dict, items, *, anchor_id: str = "") -> dict:
    """Build the Data Services numbered-capabilities list from Tina text items."""
    return {
        "__component": "solutions.numbered-list",
        "anchorId": anchor_id,
        "heading": lib.clean(_value(header, "heading1", "heading", "title")) or "",
        "items": [
            {"title": lib.clean(item.get("description", item.get("content"))) or "", "description": ""}
            for item in (items or []) if isinstance(item, dict)
        ],
    }


def _service_blocks():
    """Use published services builders when available; retain valid local fallbacks while parallel work lands."""
    try:
        from families.services import flow_cards, process_accordion  # type: ignore
        return flow_cards, process_accordion
    except (ImportError, AttributeError):
        return None, None


def _flow_or_local(header, cards, *, anchor_id=""):
    flow_cards, _ = _service_blocks()
    if flow_cards:
        return flow_cards({"headingBlock": header, "cardItems": cards}, anchor_id=anchor_id)
    return card_grid(header, cards, anchor_id=anchor_id, variant="dark", background=BG_PROCESS)


def _collapse_or_local(data, *, anchor_id=""):
    _, process_accordion = _service_blocks()
    if process_accordion:
        return process_accordion(data, anchor_id=anchor_id)
    return split_accordion(data, anchor_id=anchor_id)


def _odoo_process() -> dict:
    """Rendered OdooImplementationProcess cards, absent from its Tina document."""
    rows = [
        ("Analysis", "We start with a thorough analysis to understand your unique business requirements and challenges.", "Analysis.0cdd2844.png"),
        ("Planning", "Developing additional functionalities or modules required for your business.", "calendar-clock.751fb58a.png"),
        ("Customization", "Adapting and customizing Odoo to fit your specific business needs and processes.", "customization.c7004146.png"),
        ("Development", "Developing additional functionalities or modules required for your business.", "app-window.b48cd409.png"),
        ("Data Migration", "Safely migrating existing data to the new Odoo system, ensuring integrity and accessibility.", "server-cog.6f06ecde.png"),
        ("Testing", "Rigorously testing the system to ensure it meets all requirements and operates flawlessly.", "shield-check.bb7692da.png"),
        ("Deployment", "Deploying the new Odoo system in your business environment, ensuring a smooth transition.", "release.d1d1be47.png"),
        ("Training", "Providing comprehensive training to ensure your staff is fully equipped to use the Odoo system effectively.", "clipboard-pen-line.953b663e.png"),
    ]
    return {
        "__component": "solutions.process-grid",
        "eyebrow": "IMPLEMENTATION PROCESS",
        "heading": "",
        "description": "",
        "cards": [
            {"icon": lib.media(f"/_next/static/media/{icon}", title), "title": title, "description": body, "href": "", "linkLabel": "", "color": ""}
            for title, body, icon in rows
        ],
        "backgroundImage": lib.media(BG_TECH, ""),
        "centerImage": lib.media("/_next/static/media/odoo-img.995f4a89.png", ""),
    }


def _salesforce_review() -> dict:
    """Rendered Salesforce consulting review copy/list, absent from the Tina data model."""
    return {
        "__component": "solutions.split-accordion",
        "anchorId": "consulting-services",
        "eyebrow": "CONSULTING SERVICES",
        "heading": "Salesforce Consulting Services",
        "description": "Our certified Salesforce consultants work closely with you to unlock the full potential of the Salesforce ecosystem. Through a thorough analysis of your business processes, engaging consultations with key stakeholders, and a keen understanding of your business goals, we provide tailored Salesforce Consulting Services.",
        "items": [
            {"title": "Optimized CRM Strategy & Assessment", "description": ""},
            {"title": "Streamlined CRM Onboarding Process", "description": ""},
            {"title": "Customized Salesforce Roadmap Development", "description": ""},
        ],
        "backgroundImage": lib.media(BG_PROCESS, ""),
    }


def _salesforce_services() -> dict:
    """Rendered Salesforce tab payload recovered from every live original tab panel."""
    def cards(rows: list[tuple[str, str]]) -> list[dict]:
        return [{"icon": lib.media(f"/icons/{icon}", title), "title": title, "description": "", "href": "", "linkLabel": "", "color": ""} for title, icon in rows]
    return {
        "__component": "solutions.salesforce-services",
        "anchorId": "salesforce-services",
        "heading": "Salesforce Services",
        "backgroundImage": lib.media(BG_SALESFORCE, ""),
        "tabs": [
            {
                "label": "Implementation Services",
                "title": "Salesforce implementation services",
                "description": "Our seasoned professionals ensure that your Salesforce implementation aligns with your business objectives, runs smoothly, and adheres to industry best practices.",
                "cards": cards([("Sales cloud", "salesCloud.svg"), ("Service cloud", "serviceCloud.svg"), ("Marketing cloud", "marketingCloud.svg"), ("Non profit cloud", "nonProfitCloud.svg"), ("Education cloud", "educationCloud.svg"), ("Experience cloud", "exeperienceCloud.svg"), ("Health cloud", "healthCould.svg"), ("Financial service cloud", "financialServiceCloud.svg"), ("Data cloud", "dataCloud.svg")]),
            },
            {"label": "Integration services", "title": "Salesforce integration services", "description": "Integrate Salesforce seamlessly with your existing business tools to boost productivity and minimize time spent toggling between applications.", "cards": cards([("Tableau Integration", "tableauIntegration.svg"), ("SharePoint Integration", "sharepointIntegration.svg"), ("ERP Integration", "erPintegration.svg"), ("DocuSign Integration", "docsignIntegration.svg"), ("Stripe Integration", "stripeIntegration.svg"), ("Outlook Integration", "outlookIntegration.svg"), ("MailChimp Integration", "mailchimpIntegration.svg"), ("SAP Integration", "sapIntegration.svg"), ("SOAP API", "soapApi.svg")])},
            {"label": "Development services", "title": "Salesforce development services", "description": "At Linkfields, we understand that every business has unique needs. Our Salesforce Development Services are designed to help you scale your CRM capabilities, with solutions crafted by certified Salesforce developers and architects.", "cards": cards([("Custom App Cloud Development", "customApp.svg"), ("AppExchange Product Development", "appExchangeProduct.svg"), ("Mobile-First Solution Rollout", "mobileFirst.svg"), ("Salesforce Customization", "salesforceCloud.svg")])},
            {"label": "Migration services", "title": "Salesforce migration services", "description": "Transitioning to the Salesforce should be smooth and efficient. Our experts specialize in seamless migrations, addressing functionality gaps and mitigating risks such as data loss and business disruptions.", "cards": cards([("Salesforce Classic to Lightning Migration", "salesforceClassic.svg"), ("Third-Party to Salesforce Migration", "salesforceMigration.svg")])},
            {"label": "Support services", "title": "Salesforce support services", "description": "Our comprehensive Salesforce Support Services cover everything from bug fixes to user training. We ensure your Salesforce org operates at peak performance, offering daily management, issue resolution, upgrades, and enhancements.", "cards": cards([("Managed Services", "managedServices.svg"), ("Remote Administrator", "remoteAdmin.svg"), ("Production Support and Administration", "productionsupport.svg"), ("User, Admin, and Management Training", "useradmin.svg")])},
        ],
    }


def _why_choose_us() -> dict:
    """Salesforce why-us statistics. Values come from the original page bundle (the crawl captured the
    count-up counters at 0). The original's CSS overrides the section background with persistently_innovative.jpg."""
    return {
        "__component": "solutions.why-choose-us",
        "anchorId": "why-us",
        "eyebrow": "WHY US",
        "heading": "Why choose us",
        "backgroundImage": lib.media(BG_SALESFORCE.replace("salesforce-services-BG.png", "persistently_innovative.jpg"), ""),
        "stats": [
            {"value": "5", "suffix": "+", "label": "Years"},
            {"value": "50", "suffix": "+", "label": "Projects successfully delivered"},
            {"value": "6", "suffix": "+", "label": "Solutions & Accelerators"},
            {"value": "5/5", "suffix": "", "label": "Customer CSAT"},
            {"value": "300", "suffix": "+", "label": "Certifications"},
            {"value": "60", "suffix": "+", "label": "Salesforce Practice Size"},
        ],
    }


def build() -> list[dict]:
    """Build the ten crawled ERP solutions pages in original section order."""
    pages: list[dict] = []

    key = "solutions__erp-solutions"; doc = lib.page_doc(key)
    pages.append(lib.page(key, "ERP", [
        lib.hero_section(key, doc.get("heroSectionData") or {}),
        _collapse_or_local(doc.get("CollapseComponentData") or {}, anchor_id="solutions-overview"),
        how_can_we_help(doc, anchor_id="transforming-operations-across-the-board"),
        *lib.standard_tail(key),
    ]))

    key = "solutions__erp-solutions__sap"; doc = lib.page_doc(key)
    pages.append(lib.page(key, "SAP", [
        lib.hero_section(key, doc.get("heroSectionData") or {}),
        lib.overview_section(doc.get("heroSectionData") or {}),
        how_can_we_help(doc, anchor_id="how-we-can-help"),
        lib.message_banner(doc.get("messageBannerData")),
        lib.stats_band(lib.load_docs(key).get("persistentlyInnovative")),
        *lib.standard_tail(key),
    ]))

    key = "solutions__erp-solutions__odoo"; doc = lib.page_doc(key)
    pages.append(lib.page(key, "Odoo", [
        lib.hero_section(key, doc.get("heroSectionData") or {}),
        lib.overview_section(doc.get("heroSectionData") or {}),
        _flow_or_local(doc.get("Benefits") or {}, doc.get("Cards") or [], anchor_id="benefits"),
        technology_details(doc, anchor_id="implementation-areas"),
        lib.message_banner(doc.get("messageBannerData")),
        _odoo_process(),
        *lib.standard_tail(key),
    ]))

    key = "solutions__erp-solutions__microsoft-dynamics"; doc = lib.page_doc(key)
    pages.append(lib.page(key, "Microsoft Dynamics", [
        lib.hero_section(key, doc.get("heroSectionData") or {}),
        lib.overview_section(doc.get("heroSectionData") or {}),
        how_can_we_help(doc, anchor_id="how-we-can-help"),
        lib.message_banner(doc.get("messageBannerData")),
        technology_details(doc, anchor_id="dynamics-365"),
        lib.stats_band(lib.load_docs(key).get("persistentlyInnovative")),
        *lib.standard_tail(key),
    ]))

    key = "solutions__erp-solutions__salesforce"; doc = lib.page_doc(key)
    pages.append(lib.page(key, "Salesforce", [
        lib.hero_section(key, doc.get("heroSectionData") or {}),
        _salesforce_review(), _salesforce_services(), _why_choose_us(), *lib.standard_tail(key),
    ]))

    key = "solutions__erp-solutions__sap__core-sap-expertise"; doc = lib.page_doc(key)
    pages.append(lib.page(key, "Core SAP Expertise", [
        lib.hero_section(key, doc.get("heroSectionData") or {}),
        _collapse_or_local(doc.get("CollapseComponentData") or {}, anchor_id="enhancements-and-optimizations"),
        accordion_stack(doc.get("accordionContent") or [], anchor_id="merges-acquisitions-and-diversities", eyebrow=(doc.get("accordionFlow") or {}).get("status1", ""), heading=(doc.get("accordionFlow") or {}).get("heading1", ""), variant="grid"),
        accordion_stack(doc.get("rolloutCards") or [], anchor_id="template-bases-global-local-rollouts", eyebrow=(doc.get("rollouts") or {}).get("status1", ""), heading=(doc.get("rollouts") or {}).get("heading1", ""), variant="static-grid"),
        *lib.standard_tail(key),
    ]))

    key = "solutions__erp-solutions__sap__data-services"; doc = lib.page_doc(key)
    pages.append(lib.page(key, "Data Services", [
        lib.hero_section(key, doc.get("heroSectionData") or {}),
        lib.overview_section(doc.get("heroSectionData") or {}, anchor_id="data-services"),
        how_can_we_help(doc, anchor_id="key-components"),
        numbered_list(doc.get("keyCapabilities") or {}, doc.get("howCanWeHelp") or [], anchor_id="key-capabilities"),
        *lib.standard_tail(key),
    ]))

    key = "solutions__erp-solutions__sap__sap-hana"; doc = lib.page_doc(key)
    pages.append(lib.page(key, "SAP HANA", [
        lib.hero_section(key, doc.get("heroSectionData") or {}),
        lib.overview_section(doc.get("heroSectionData") or {}, anchor_id="roadmaps-and-strategy"),
        _collapse_or_local(doc.get("CollapseComponentData") or {}, anchor_id="technical-migrations"),
        card_grid(doc.get("offerDetails") or {}, doc.get("offerDetailCards") or [], anchor_id="what-we-offer", variant="offer-rows"),
        how_can_we_help(doc, anchor_id="s-4-hana"),
        *lib.standard_tail(key),
    ]))

    key = "solutions__erp-solutions__sap__sap-special-expertise"; doc = lib.page_doc(key)
    pages.append(lib.page(key, "SAP Special Expertise", [
        lib.hero_section(key, doc.get("heroSectionData") or {}),
        accordion_stack(doc.get("fullPageAccordion") or [], anchor_id="sap-special-expertise"),
        *lib.standard_tail(key),
    ]))

    key = "solutions__erp-solutions__sap__serviceandmore"; doc = lib.page_doc(key)
    mission = doc.get("marketingAndPromotionsContent") or {}
    mission_card = {"logo": mission.get("logo"), "heading": mission.get("heading1"), "content": mission.get("desc")}
    pages.append(lib.page(key, "Services and More", [
        lib.hero_section(key, doc.get("heroSectionData") or {}),
        how_can_we_help(doc, anchor_id="sap-technical-complexities"),
        card_grid(doc.get("marketingAndPromotionsHeading") or {}, [mission_card], anchor_id="marketing-and-promotions", variant="intro", background=BG_OUR_PROCESS),
        card_grid(doc.get("differentiators") or {}, doc.get("differentiatorsCards") or [], anchor_id="differentiators", variant="transparent"),
        card_grid(doc.get("coreServices") or {}, doc.get("coreServicesCards") or [], anchor_id="core-services", variant="transparent"),
        *lib.standard_tail(key),
    ], path="/solutions/erp-solutions/sap/service&more"))

    return pages
