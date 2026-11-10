"""Corporate deck (2026) alignment: section layouts and content for the key pages.

Imported by apply.py and applied to every page document (idempotent). Source text: docs/CORPORATE-DECK-2026.md.
A layout spec is a list of entries: a component UID keeps the first existing section of that type, a
(uid, anchorId) tuple keeps a specific one, and a dict inserts a new section. Sections not listed are dropped.
"""
import copy
import re

P = "/products-and-accelerators"


def M(path, alt=None):
    m = {"__media": path}
    if alt:
        m["alt"] = alt
    return m


def L(label, href, logo=None):
    link = {"label": label, "href": href, "openInNewTab": False}
    if logo:
        link["logo"] = M(logo, label)
    return link


PRODUCTS = {
    "linkworks": "Linkworks",
    "testoriumz": "testoriumz",
    "vajrax": "VajraX",
    "vectorx": "VectorX",
    "ai-governance": "AI Governance",
    "textiq": "textIQ",
    "finsight": "FinSight",
    "edupilot": "EduPilot",
}


def prod(key):
    return L(PRODUCTS[key], f"{P}/{key}", f"custom/logos/{key}.png")


PLATFORMS = [
    L("SAP S/4HANA", "/services/intelligent-enterprise-platforms/sap-s4hana", "custom/platforms/sap.png"),
    L("Oracle", "/services/intelligent-enterprise-platforms/platform-migration-ams", "custom/platforms/oracle.png"),
    L("Salesforce", "/services/intelligent-enterprise-platforms/salesforce", "custom/platforms/salesforce.png"),
    L("Zoho", "/services/intelligent-enterprise-platforms/zoho", "custom/platforms/zoho.png"),
    L("Odoo", "/services/intelligent-enterprise-platforms/odoo", "custom/platforms/odoo.png"),
    L("Microsoft Dynamics 365", "/services/intelligent-enterprise-platforms/microsoft-dynamics-365", "custom/platforms/microsoft-colour.png"),
]


def tile(title, **kw):
    t = {"title": title}
    t.update(kw)
    return t


def tiles_section(anchor, heading, items, **kw):
    s = {"__component": "sections.feature-tiles", "anchorId": anchor, "heading": heading, "items": items}
    s.update(kw)
    return s


# ---------------------------------------------------------------- shared deck blocks
def portfolios(anchor="portfolios"):
    T = "/services/talent-advisory-gcc"
    return tiles_section(
        anchor,
        "Five portfolios. *One integrated partner.*",
        [
            tile("Digital Transformation", number="01", tagline="Modernise · Automate · Transform", accent="orange",
                 description="Modernise applications, automate operations and connect every channel your customers use.",
                 bullets="App modernisation\nAutomation & RPA\nIntegration services\nWhatsApp Business & omnichannel\nQuality engineering\nCloud services",
                 groupLabel="Linkfields IP", links=[prod("linkworks"), prod("testoriumz")],
                 href="/services/digital-transformation", linkLabel="Explore portfolio"),
            tile("Intelligent Enterprise Platforms", number="02", tagline="Operate · Integrate · Engage", accent="blue",
                 description="Run the core of the enterprise on connected ERP and CRM platforms, made smarter with AI.",
                 bullets="SAP S/4HANA\nMicrosoft Dynamics 365\nOdoo\nZoho\nSalesforce\nPlatform migration & AMS",
                 groupLabel="Linkfields IP", links=[prod("linkworks")],
                 href="/services/intelligent-enterprise-platforms", linkLabel="Explore portfolio"),
            tile("Data & AI", number="03", tagline="Understand · Predict · Govern", accent="purple",
                 description="From AI strategy to agentic AI in production: turn data into decisions, governed from day one.",
                 bullets="AI strategy & governance\nAgentic AI & GenAI\nData platforms & analytics\nMachine learning",
                 groupLabel="Linkfields IP", links=[prod("textiq"), prod("finsight"), prod("edupilot")],
                 href="/services/data-ai", linkLabel="Explore portfolio"),
            tile("Cyber Security", number="04", tagline="Protect · Validate · Govern", accent="teal",
                 description="End-to-end security, from code to AI: our own products plus specialist services.",
                 bullets="AI security & GRC\nCloud security & IAM\nExposure validation & AppSec\nSecurity operations",
                 groupLabel="Linkfields IP", links=[prod("vajrax"), prod("vectorx"), prod("ai-governance")],
                 href="/services/cyber-security", linkLabel="Explore portfolio"),
            tile("Talent Advisory & GCC", number="05", tagline="Advise · Staff · Scale", accent="yellow",
                 description="Strategy, specialist talent and Global Capability Centres (GCC) that scale with you.",
                 bullets="Technology advisory\nSpecialist talent & managed teams\nGCC strategy & setup\nGCC build-operate-transfer",
                 groupLabel="Engagement models",
                 links=[L("Staff augmentation", f"{T}/specialist-talent-managed-teams#staff-augmentation"), L("Managed teams", f"{T}/specialist-talent-managed-teams#managed-teams"),
                        L("GCC build-operate-transfer", f"{T}/gcc-build-operate-transfer")],
                 href=T, linkLabel="Explore portfolio"),
        ],
        eyebrow="Service portfolios",
        description="Services, proprietary software and accelerators in one capability architecture. Every portfolio is backed by "
                    "Linkfields IP, so you modernise, innovate, operate, analyse, secure and scale with one strategic partner.",
        variant="portfolio", columns=5, tone="navy",
    )


def products_teaser(anchor="products"):
    return tiles_section(
        anchor,
        "Software we own. *Accelerators we reuse.*",
        [
            tile("Predictive Analytics Suite", eyebrow="Data & AI", accent="purple",
                 bullets="Churn & segmentation\nDemand forecasting\nFraud & anomaly detection\nLoan default prediction",
                 href=f"{P}/predictive-analytics-suite", linkLabel="View accelerator"),
            tile("Digital Twin Suite", eyebrow="Simulation", accent="teal",
                 bullets="Equipment failure prediction\nForecasting simulation\nInventory optimisation\nReal-time monitoring",
                 href=f"{P}/digital-twin-suite", linkLabel="View accelerator"),
            tile("Intelligent Workflow Automation", eyebrow="Enterprise AI", accent="orange",
                 bullets="Workflow automation\nAI orchestration\nApplication integration\nUnderwriting optimisation",
                 href=f"{P}/intelligent-workflow-automation", linkLabel="View accelerator"),
            tile("Power BI + AI/ML", eyebrow="Analytics", accent="blue",
                 bullets="AI/ML in Power BI\nPredictive dashboards\nRisk scoring visuals",
                 href=f"{P}/power-bi-ai-ml", linkLabel="View accelerator"),
            tile("Delivery accelerators", eyebrow="Portfolio IP", accent="yellow",
                 bullets="Modernisation & integration\nMigration & regression packs\nAutomated testing & release assurance\nCyber-Safe Delivery\nRegulatory & compliance readiness",
                 href=f"{P}/delivery-accelerators", linkLabel="View accelerator"),
        ],
        eyebrow="Products & accelerators",
        description="Proprietary products, licensed on their own or delivered with our services, and pre-built delivery IP that shortens time to value.",
        logosLabel="Proprietary products",
        logos=[prod(k) for k in PRODUCTS],
        variant="compact", columns=5, tone="ink",
        ctaLabel="Explore products & accelerators", ctaUrl=P,
    )


def why_linkfields(anchor="why-linkfields", tone="ink"):
    return tiles_section(
        anchor,
        "Why enterprises choose *Linkfields*",
        [
            tile("Services depth", number="01", accent="yellow",
                 description="Five integrated portfolios spanning Digital Transformation, Intelligent Enterprise Platforms, Data & AI, Cyber Security, and Talent Advisory & GCC."),
            tile("Proprietary software", number="02", accent="orange",
                 description="Linkworks, testoriumz, VajraX, VectorX and our AI SaaS products: proof beyond consultant capability."),
            tile("Reusable accelerators", number="03", accent="blue",
                 description="Reusable engineering, automation and Cyber-Safe Delivery IP that accelerates time-to-value while strengthening quality, security and delivery consistency."),
            tile("Integrated delivery", number="04", accent="teal",
                 description="One partner for services, software, managed delivery, dedicated teams and capability centres."),
        ],
        eyebrow="Why Linkfields", columns=4, tone=tone,
        strip="Five portfolios | Proprietary IP | Reusable accelerators | One integrated partner",
    )


def engagement_models(anchor="engagement-models", tone="navy"):
    return tiles_section(
        anchor,
        "Flexible *commercial models*",
        [
            tile("Fixed Price", accent="orange", number="01",
                 description="Defined scope and outcome delivered against agreed milestones and acceptance criteria.",
                 footLabel="Best for", footText="Well-defined projects, migrations, discrete builds."),
            tile("Time & Materials", accent="blue", number="02",
                 description="Flexible delivery where scope evolves, with transparent rates and governance.",
                 footLabel="Best for", footText="Discovery, evolving roadmaps, co-development."),
            tile("Managed Service", accent="teal", number="03",
                 description="Ongoing service with SLAs, governance and continuous improvement built in.",
                 footLabel="Best for", footText="Application management, managed quality, managed security."),
            tile("Dedicated Team", accent="purple", number="04",
                 description="Persistent squads or specialist teams aligned to your priorities and ways of working.",
                 footLabel="Best for", footText="Product engineering, sustained capacity, capability centres (GCC)."),
            tile("Outcome-Based", accent="yellow", number="05",
                 description="Commercials linked to measurable business or operational outcomes, where these can be agreed and evidenced.",
                 footLabel="Best for", footText="Assurance, exposure closure, resolution-rate engagements."),
        ],
        eyebrow="How we engage",
        description="One capability architecture, flexible commercial models. Buy a project, a managed outcome, a dedicated team, or our software on its own.",
        columns=5, tone=tone,
        noteLabel="Proprietary software is sold separately",
        note="Linkworks, testoriumz, VajraX and our AI SaaS solutions are available by licence, subscription or SaaS, with or without a Linkfields services engagement.",
    )


PLAYS = [
    {"title": "AI Code Assurance", "accent": "orange",
     "trigger": "AI-generated code increases delivery speed and assurance risk.",
     "outcome": "Quality and security gates across CI/CD for AI-written change.",
     "ip": "testoriumz, VectorX, Cyber-Safe Delivery"},
    {"title": "Modernisation & Programme Assurance", "accent": "blue",
     "trigger": "Complex migration and customisation create regression and integration risk.",
     "outcome": "Migration readiness, automated regression, integration rebuild and security validation.",
     "ip": "Linkworks, Modernisation & Integration Toolkit, testoriumz, Release Assurance Packs"},
    {"title": "Regulated Cyber Readiness", "accent": "teal",
     "trigger": "Regulated industries need continuous evidence, not point-in-time reports.",
     "outcome": "Continuous exposure validation, control mapping and remediation evidence.",
     "ip": "VajraX, Regulatory Readiness & Control Mapping"},
    {"title": "Intelligent Operations", "accent": "purple",
     "trigger": "Cost-to-serve pressure creates demand for process intelligence and automation.",
     "outcome": "Discover, redesign and automate work across process and customer channels.",
     "ip": "Linkworks, Intelligent Workflow Automation Framework, testoriumz, Cyber-Safe Delivery"},
    {"title": "Capability Centres with Embedded IP", "accent": "yellow",
     "trigger": "Organisations need scalable delivery capacity with stronger governance and automation.",
     "outcome": "Build-operate-transfer GCCs with quality, security and engineering IP embedded.",
     "ip": "Linkworks, Delivery Governance, Quality Engineering IP, Cyber-Safe Delivery"},
]


def value_plays(idx=None, anchor="value-plays", heading="We lead with *outcomes*, not offerings", eyebrow="Strategic value plays"):
    plays = [copy.deepcopy(PLAYS[i]) for i in (idx if idx is not None else range(len(PLAYS)))]
    return {
        "__component": "sections.value-plays", "anchorId": anchor, "eyebrow": eyebrow, "heading": heading,
        "description": "Every play starts from a customer problem. Our five portfolios and Linkfields software sit behind each one.",
        "plays": plays, "ctaLabel": "Discuss your challenge", "ctaUrl": "/contact-us",
    }


def client_value(anchor="client-value"):
    return {
        "__component": "sections.metrics-grid", "anchorId": anchor, "eyebrow": "Client value",
        "heading": "Scale that _delivers._\nIntelligence that *creates value.*",
        "description": "From enterprise AI strategy and responsible governance to intelligent execution, we connect technology investment with measurable ROI and sustainable growth.",
        "bullets": "Global OEM ecosystem\nOutcome-led accountability",
        "metricsLabel": "Performance at scale", "metricsHeading": "Business outcomes, by design",
        "metrics": [
            {"label": "01 / Proven expertise", "value": "20+", "title": "Years of industry experience", "description": "Enterprise AI, digital and cloud leadership", "accent": "yellow"},
            {"label": "02 / Delivery confidence", "value": "95%+", "title": "Reported project success rate", "description": "Quality-led execution and accountability", "accent": "orange"},
            {"label": "03 / Delivery speed", "prefix": "Up to", "value": "6×", "title": "Faster technology delivery", "description": "AI-enabled engineering and accelerators", "accent": "blue"},
            {"label": "04 / Development efficiency", "prefix": "Up to", "value": "40%", "title": "Development cost savings", "description": "Through faster, automated delivery", "accent": "purple"},
            {"label": "05 / Cloud optimisation", "prefix": "Up to", "value": "50%", "title": "Infrastructure cost savings", "description": "Through cloud modernisation", "accent": "teal"},
            {"label": "06 / Market agility", "value": "Sooner", "title": "Faster time-to-market", "description": "Shorter release cycles, earlier value", "accent": "yellow"},
        ],
        "bannerLabel": "07 / Cyber-safe delivery", "bannerTitle": "Secure by design:", "bannerText": "security embedded across engineering and delivery.",
        "stepsLabel": "From AI strategy to measurable business value",
        "steps": [
            {"title": "Strategise & govern", "description": "Prioritise use cases, ROI and controls", "accent": "orange"},
            {"title": "Accelerate & deliver", "description": "Faster go-live, less development effort", "accent": "blue"},
            {"title": "Measure & optimise", "description": "Validate impact, adoption and savings", "accent": "yellow"},
        ],
        "image": M("custom/videos/linkfields-globe-poster.jpg", "Linkfields globe"),
    }


WHO_BODY = (
    "Linkfields is an AI-driven technology, engineering and advisory company, headquartered in South Africa with a global delivery footprint. "
    "Through our integrated service portfolios, we empower enterprises to accelerate digital transformation and modernise, run, analyse, secure "
    "and scale their operations. Combining deep industry expertise, proprietary software and reusable delivery IP, we accelerate time-to-market, "
    "optimise costs and deliver measurable business outcomes.\n\n"
    "We also help organisations design, build, operate and scale Global Capability Centres (GCCs) through flexible engagement models, including "
    "Build–Operate–Transfer (BOT), enabling innovation, operational excellence and sustainable growth."
)
MISSION = ("We help global organisations grow, adapt, scale, reinvent and transform: modernising their technology, running their core platforms, "
           "unlocking data and AI, securing what matters and scaling their teams.")
VISION = ("To become the preferred partner for creative, customised, integrated and sustainable 360-degree solutions across technology, data, "
          "security and talent that enable businesses to thrive and expand.")


def who_we_are(anchor="who-we-are"):
    return {
        "__component": "sections.who-we-are", "anchorId": anchor, "eyebrow": "Who we are",
        "heading": "One strategic partner across *your transformation*", "body": WHO_BODY,
        "missionLabel": "Our mission", "mission": MISSION, "visionLabel": "Our vision", "vision": VISION,
        "stats": [
            {"value": "20+", "title": "Years of industry leadership experience", "accent": "yellow"},
            {"value": "#35", "title": "FT & Statista Africa's Fastest-Growing Companies 2026", "accent": "orange"},
            {"value": "Level 1", "title": "B-BBEE Contributor", "accent": "blue"},
        ],
    }


def global_presence(anchor="global-presence"):
    return {
        "__component": "sections.global-presence", "anchorId": anchor, "eyebrow": "Where we are",
        "heading": "Global reach, *local accountability*",
        "description": "Headquartered in South Africa, Linkfields combines international market presence with scalable engineering, delivery and managed "
                       "services capabilities to support enterprise clients across regions and time zones.",
        "locations": [
            {"name": "South Africa", "role": "Headquarters", "lat": -26.2041, "lng": 28.0473, "hq": True, "accent": "orange"},
            {"name": "India", "role": "Offshore Delivery Centre", "lat": 19.076, "lng": 72.8777, "hq": False, "accent": "blue"},
            {"name": "UAE", "role": "Middle East", "lat": 25.2048, "lng": 55.2708, "hq": False, "accent": "yellow"},
            {"name": "United Kingdom", "role": "Europe", "lat": 51.5074, "lng": -0.1278, "hq": False, "accent": "teal"},
            {"name": "USA", "role": "North America", "lat": 40.7128, "lng": -74.006, "hq": False, "accent": "purple"},
            {"name": "Australia", "role": "Asia Pacific", "lat": -33.8688, "lng": 151.2093, "hq": False, "accent": "blue"},
        ],
        "strip": "South Africa HQ | Global Engineering & Delivery | International Market Presence",
    }


def value_framework(anchor="value-framework"):
    return tiles_section(
        anchor,
        "From AI strategy to *measurable business value*",
        [
            tile("Strategise & govern", number="1", accent="orange",
                 description="Prioritise use cases, ROI and controls before build starts, so investment follows value and governance is designed in."),
            tile("Accelerate & deliver", number="2", accent="blue",
                 description="Faster go-live and less development effort, using our own software, reusable accelerators and Cyber-Safe Delivery."),
            tile("Measure & optimise", number="3", accent="yellow",
                 description="Validate impact, adoption and savings, then optimise continuously against the outcomes we agreed together."),
        ],
        eyebrow="Our value framework", columns=3, tone="navy",
        description="Strategy, delivery and measurement are one connected cycle, from enterprise AI strategy and responsible governance to intelligent execution.",
    )


# ---------------------------------------------------------------- portfolio pages
def deliver(anchor, heading, rows, accentless=True):
    items = []
    for i, (title, detail, href) in enumerate(rows, 1):
        t = tile(title, number=f"{i:02d}", description=detail)
        if href:
            t["href"] = href
            t["linkLabel"] = "Read more"
        items.append(t)
    return tiles_section(anchor, heading, items, eyebrow="What we deliver", variant="compact",
                         columns=4 if len(items) in (4, 7, 8) else 3, tone="ink")


def ip_section(heading, products, accelerators, platforms=None, description=None):
    descs = {
        "linkworks": None, "testoriumz": None, "textiq": None, "finsight": None, "edupilot": None,
        "vajrax": None, "vectorx": None, "ai-governance": None,
    }
    items = []
    for key, text in products:
        descs[key] = text
        items.append(tile(PRODUCTS[key], logo=M(f"custom/logos/{key}.png", PRODUCTS[key]), description=text,
                          href=f"{P}/{key}", linkLabel=f"Explore {PRODUCTS[key]}"))
    s = tiles_section("linkfields-ip", heading, items, eyebrow="Linkfields IP",
                      description=description or "Our own software and reusable accelerators sit behind every engagement, licensed on their own or delivered with our services.",
                      columns=1 if len(items) == 1 else min(3, len(items)), tone="navy",
                      noteLabel="Reusable accelerators", note=" · ".join(accelerators))
    if platforms:
        s["logosLabel"] = "OEM platforms we deliver"
        s["logos"] = platforms
    return s


DT = "/services/digital-transformation"
IEP = "/services/intelligent-enterprise-platforms"
DAI = "/services/data-ai"
CS = "/services/cyber-security"
TAG = "/services/talent-advisory-gcc"
SOL = "/services/intelligent-enterprise-platforms"

PILLARS = {
    DT: {
        "hub_heading": "Six specialist services. *One transformation partner.*",
        "hub_body": "From applications and cloud foundations to automated operations and connected customer journeys, bring your next stage of change together.",
        "overview": ("Modernise applications, automate operations and connect every channel your customers use.\n\n"
                     "We combine specialist engineering services with our own software – Linkworks and testoriumz – and reusable accelerators, "
                     "so modernisation moves faster, every release is assured and change is delivered cyber-safe."),
        "deliver": deliver("what-we-deliver", "Modernise, automate and *connect every channel*", [
            ("App modernisation", "Cloud, DevOps & microservices", f"{DT}/app-modernisation"),
            ("Automation & RPA", "UiPath, Blue Prism & AI workflows", f"{DT}/automation-rpa"),
            ("Integration services", "APIs, Boomi & enterprise integration", f"{DT}/integration-services"),
            ("WhatsApp Business", "Conversational service & commerce", f"{DT}/whatsapp-omnichannel"),
            ("Omnichannel", "Connected journeys, every channel", f"{DT}/whatsapp-omnichannel"),
            ("Quality engineering", "Test automation & AI code assurance", f"{DT}/quality-engineering"),
            ("Cloud services", "Modernise, migrate and optimise enterprise cloud environments through engineering, DevOps and automation", f"{DT}/cloud-services"),
        ]),
        "ip": ip_section("Software we own, *built into delivery*", [
            ("linkworks", "Modernise legacy systems, transform applications and build scalable digital solutions with cyber-safe delivery to meet evolving enterprise needs."),
            ("testoriumz", "Quality engineering platform for continuous testing: test management, low-code automation, root-cause analysis, dashboards and CI/CD integration. Replaces a fragmented tool estate with one platform."),
        ], ["Modernisation & Integration Toolkit", "Intelligent Workflow Automation Framework", "Automated Testing & Release Assurance Packs", "Cyber-Safe Delivery"]),
        "plays": [0, 1, 3],
    },
    IEP: {
        "deliver": deliver("what-we-deliver", "Run the core of the enterprise, *made smarter with AI*", [
            ("SAP S/4HANA", "Implementation, upgrades & migration", f"{SOL}/sap/sap-hana"),
            ("Dynamics 365", "Microsoft finance, operations & CE", f"{SOL}/microsoft-dynamics"),
            ("CRM & Customer 360", "Salesforce, Odoo & Zoho journeys", f"{SOL}/salesforce"),
            ("Odoo & Zoho", "Agile platforms for growing firms", f"{SOL}/odoo"),
            ("Customer portals", "Self-service & partner portals", f"{P}/linkworks"),
            ("Platform AMS", "Managed support & optimisation", f"{IEP}/platform-migration-ams"),
        ]),
        "ip": ip_section("A composable platform *where ERP and CRM do not fit*", [
            ("linkworks", "A flexible, composable platform for customised ERP, CRM and complex business applications, offering a scalable alternative to traditional enterprise systems with cyber-safe delivery."),
        ], ["Migration & Readiness", "Regression & Release Assurance", "Data Migration & Reconciliation", "Intelligent Platform Operations"], platforms=PLATFORMS),
        "plays": [1, 3],
    },
    DAI: {
        "hub_heading": "Four specialist services, *governed from day one*",
        "hub_body": "From strategy and governance to agents, data platforms and machine learning in production.",
        "deliver": deliver("what-we-deliver", "Turn data into decisions, *governed from day one*", [
            ("AI strategy", "Roadmaps, use cases & value", f"{DAI}/ai-strategy-governance"),
            ("Agentic AI", "Autonomous agents that act", f"{DAI}/agentic-ai-genai"),
            ("AI governance", "Guardrails, cost & observability", f"{DAI}/ai-strategy-governance"),
            ("GenAI & RAG", "Knowledge assistants on your data", f"{DAI}/agentic-ai-genai"),
            ("Data & analytics", "Platforms, pipelines & Power BI", f"{DAI}/data-platforms-analytics"),
            ("Machine learning", "Prediction, scoring & forecasting", f"{DAI}/machine-learning"),
        ]),
        "ip": ip_section("AI products *in production today*", [
            ("textiq", "Intelligent search and insight across unstructured enterprise content."),
            ("finsight", "Conversational analysis and reporting over financial data."),
            ("edupilot", "Rapid course creation for education and corporate learning."),
        ], ["Data & AI Readiness", "Predictive Analytics Suite", "Digital Twin & Simulation Suite"]),
        "plays": [3, 0],
    },
    CS: {
        "hub_heading": "Four specialist services, *from code to AI*",
        "hub_body": "Governance, cloud and identity, exposure validation and security operations, working with our own security products.",
        "deliver": deliver("what-we-deliver", "End-to-end security, *from code to AI*", [
            ("Offensive testing", "AI, LLM & web app testing", f"{CS}/exposure-validation-appsec"),
            ("Cloud security & GRC", "Controls, IAM & regulation", f"{CS}/cloud-security-iam"),
            ("Security operations", "Splunk SIEM, Qualys monitoring", f"{CS}/security-operations"),
            ("Architecture review", "Network, firewall & IAM", f"{CS}/cloud-security-iam"),
            ("Security awareness", "Staff education & phishing drills", f"{CS}/ai-security-grc"),
            ("Incident response", "Rapid7: detect, triage, contain", f"{CS}/security-operations"),
        ]),
        "ip": ip_section("Our own security products, *plus specialist services*", [
            ("vajrax", "AI-powered exposure validation of your external attack surface."),
            ("vectorx", "Code scanning and supply-chain analysis, repo to release."),
            ("ai-governance", "One gateway for every AI tool: guardrails, cost & tracing (Portkey + Opik)."),
        ], ["Regulatory Readiness & Control Mapping", "Continuous Compliance & Audit Evidence", "Cloud, AI & Identity Security Baselines"]),
        "plays": [2, 0],
    },
    TAG: {
        "deliver": deliver("what-we-deliver", "Strategy, specialist talent and *GCCs that scale with you*", [
            ("Technology advisory", "Roadmaps, architecture & assessments", f"{TAG}/technology-advisory"),
            ("Specialist talent", "On-demand experts across portfolios", f"{TAG}/specialist-talent-managed-teams"),
            ("Managed teams", "Outcome-based delivery pods", f"{TAG}/specialist-talent-managed-teams#managed-teams"),
            ("GCC strategy & setup", "Operating model & set-up advisory", f"{TAG}/gcc-strategy-setup"),
            ("GCC build & operate", "Build-Operate-Transfer (BOT) centres", f"{TAG}/gcc-build-operate-transfer"),
            ("GCC scale & govern", "Talent, tooling & embedded IP", f"{TAG}/gcc-build-operate-transfer"),
        ]),
        "ip": tiles_section("engagement-models", "Three ways to *add capacity*", [
            tile("Staff augmentation", number="01", accent="yellow", description="Specialists embedded in your teams, ready to start fast.",
                 href=f"{TAG}/specialist-talent-managed-teams#staff-augmentation", linkLabel="Read more"),
            tile("Managed teams", number="02", accent="orange", description="Outcome-based delivery pods we run end to end.",
                 href=f"{TAG}/specialist-talent-managed-teams#managed-teams", linkLabel="Read more"),
            tile("GCC Build-Operate-Transfer (BOT)", number="03", accent="blue", description="We build and run your GCC, then hand it over.",
                 href=f"{TAG}/gcc-build-operate-transfer", linkLabel="Read more"),
        ], eyebrow="Engagement models", columns=3, tone="navy",
            description="Scale delivery capacity with the model that fits your roadmap, from embedded specialists to a capability centre you own.",
            strip="Scalable Talent & Delivery | Accelerated GCC Setup | Governed Delivery & Embedded IP | Sustainable Capability Transfer"),
        "plays": [4],
    },
}


# ---------------------------------------------------------------- helpers
def find(secs, comp, anchor=None):
    for s in secs:
        if s.get("__component") == comp and (anchor is None or s.get("anchorId") == anchor):
            return s
    return None


def layout(doc, spec):
    pool = list(doc.get("sections") or [])
    out = []
    for entry in spec:
        if isinstance(entry, dict):
            out.append(entry)
            continue
        comp, anchor = (entry, None) if isinstance(entry, str) else entry
        s = find(pool, comp, anchor)
        if s is not None:
            pool.remove(s)
            out.append(s)
    doc["sections"] = out


def set_anchors(doc, pairs):
    hero = find(doc.get("sections") or [], "sections.page-hero")
    if hero is None:
        return
    present = {s.get("anchorId") for s in doc["sections"]}
    hero["anchorLinks"] = [{"label": lbl.upper(), "targetId": t} for lbl, t in pairs if t in present]


INLINE_MORE = re.compile(r"\n*\*\*\[Read more[^\]]*\]\(([^)]+)\)\*\*")


def clean_hub_cards(sec):
    """IP products get their own section, so the specialist-services grid keeps services only."""
    cards = []
    for c in sec.get("cards") or []:
        desc = c.get("description") or ""
        cta = c.get("cta") or {}
        href = cta.get("href") or ""
        m = INLINE_MORE.search(desc)
        if href.startswith(P + "/") and not m:
            continue
        if m and (not href or href.startswith(P + "/")):
            c["cta"] = {"label": "Read more", "href": m.group(1), "openInNewTab": False}
        desc = INLINE_MORE.sub("", desc)
        desc = re.split(r"\n*\*\*LINKFIELDS IP", desc)[0].strip()
        c["description"] = desc
        cards.append(c)
    sec["cards"] = cards


def fix_stats(doc):
    """One consistent experience figure across the site (deck: 20+ years of industry leadership experience)."""
    for s in doc.get("sections") or []:
        if s.get("__component") == "sections.stats-band":
            for st in s.get("stats") or []:
                if "year" in (st.get("label") or "").lower() and str(st.get("value")) in ("16", "18"):
                    st["value"] = "20"
                    st["suffix"] = "+"
                    st["label"] = "years of industry leadership experience"


HERO_SLIDES = [
    ("Integrating *your business* for a better future",
     "Services + proprietary software + accelerators. One strategic partner to modernise, innovate, operate, analyse, secure and scale.",
     "Explore our portfolios", "/services"),
    ("Run the core of the enterprise on *connected platforms*",
     "SAP S/4HANA, Microsoft Dynamics 365, Odoo, Zoho and Salesforce, made smarter with AI.",
     "Intelligent Enterprise Platforms", IEP),
    ("From AI strategy to *agentic AI in production*",
     "Turn data into decisions, governed from day one.",
     "Explore Data & AI", DAI),
    ("End-to-end security, *from code to AI*",
     "Our own products – VajraX, VectorX and AI Governance – plus specialist services.",
     "Explore Cyber Security", CS),
    ("Software we own. *Accelerators we reuse.*",
     "Proprietary products and pre-built delivery IP that shorten time to value.",
     "Products & accelerators", P),
    ("Talent and capability centres that *scale with you*",
     "Specialist talent, managed teams and Build-Operate-Transfer Global Capability Centres.",
     "Talent Advisory & GCC", TAG),
]


def patch_hero_slides(doc):
    hero = find(doc.get("sections") or [], "home.hero-slider")
    if not hero:
        return
    slides = hero.get("slides") or []
    for i, (title, desc, label, href) in enumerate(HERO_SLIDES):
        if i < len(slides):
            slides[i]["title"] = title
            slides[i]["description"] = desc
            slides[i]["cta"] = {"label": label, "href": href, "openInNewTab": False}
    hero["slides"] = slides[: len(HERO_SLIDES)]


# ---------------------------------------------------------------- page specs
def apply(doc):
    """Since 9 Nov 2026 every page except Home is a fully authored doc in seed/custom/pages; only Home is laid out here."""
    path = doc.get("path")
    fix_stats(doc)
    if path != "/":
        return
    if path == "/":
        home(doc)
        seo = doc.setdefault("seo", {})
        seo["metaTitle"] = "Enterprise Technology, Software & AI | Linkfields"
        seo["metaDescription"] = ("Linkfields: AI-driven technology, engineering and advisory helping enterprises accelerate "
                                   "digital transformation and build scalable Global Capability Centres.")
        seo["keywords"] = ("Linkfields, digital transformation, enterprise platforms, SAP S/4HANA, data and AI, cyber security, "
                           "global capability centres, Linkworks, testoriumz")
    elif path == "/services":
        ov = find(doc["sections"], "sections.overview")
        if ov:
            ov["heading"] = "One strategic partner across your transformation"
            ov["body"] = WHO_BODY
        layout(doc, ["sections.page-hero", "sections.overview", portfolios("our-services"), value_plays(),
                     engagement_models(tone="ink"), why_linkfields(tone="navy"), "sections.contact-form", "sections.social-banner"])
        set_anchors(doc, [("Overview", "overview"), ("Portfolios", "our-services"), ("Value plays", "value-plays"),
                          ("Engagement models", "engagement-models"), ("Why Linkfields", "why-linkfields"), ("Get in touch", "get-in-touch")])
    elif path in PILLARS:
        cfg = PILLARS[path]
        ov = find(doc["sections"], "sections.overview")
        if ov and cfg.get("overview"):
            ov["body"] = cfg["overview"]
        hub = find(doc["sections"], "hubs.what-we-offer")
        if hub:
            clean_hub_cards(hub)
            hub["eyebrow"] = "Specialist services"
            if cfg.get("hub_heading"):
                hub["heading"] = cfg["hub_heading"]
            if cfg.get("hub_body"):
                hub["body"] = cfg["hub_body"]
            hub["body"] = re.sub(r"\s*[^.]*LINKFIELDS IP[^.]*\.", "", hub.get("body") or "").strip()
        ip = copy.deepcopy(cfg["ip"])
        plays = value_plays(cfg["plays"], heading="Where we lead with *outcomes*")
        layout(doc, ["sections.page-hero", "sections.overview", copy.deepcopy(cfg["deliver"]), "hubs.what-we-offer", ip, plays,
                     "sections.stats-band", "sections.industries-grid", "sections.featured-insights", "sections.contact-form", "sections.social-banner"])
        anchor_ip = ip["anchorId"]
        set_anchors(doc, [("Overview", "overview"), ("What we deliver", "what-we-deliver"),
                          ("Services", hub.get("anchorId") if hub else "what-we-offer"),
                          ("Engagement models" if anchor_ip == "engagement-models" else "Linkfields IP", anchor_ip),
                          ("Value plays", "value-plays"), ("Why us", "why-us"), ("Who we serve", "our-expertise"), ("Get in touch", "get-in-touch")])
    elif path == "/company/about-us":
        layout(doc, ["sections.page-hero", ("company.media-story", "our-story"), who_we_are("who-we-are"), "company.card-grid",
                     global_presence(), why_linkfields(tone="ink"), "sections.industries-grid", ("company.media-story", "csr"),
                     "sections.featured-insights", "sections.contact-form", "sections.social-banner"])
        set_anchors(doc, [("Our story", "our-story"), ("Who we are", "who-we-are"), ("Our values", "our-values"),
                          ("Global presence", "global-presence"), ("Who we serve", "our-expertise"), ("CSR", "csr"), ("Get in touch", "get-in-touch")])
    elif path == "/company/our-approach":
        layout(doc, ["sections.page-hero", "company.card-grid", value_framework(), "company.exploration-grid", value_plays(),
                     engagement_models(tone="navy"), "sections.industries-grid", "sections.featured-insights", "sections.contact-form", "sections.social-banner"])
        set_anchors(doc, [("How we work", "how-we-work"), ("Value framework", "value-framework"), ("Our exploration", "our-exploration"),
                          ("Value plays", "value-plays"), ("Engagement models", "engagement-models"), ("Who we serve", "our-expertise"), ("Get in touch", "get-in-touch")])
    elif path == P:
        buy = tiles_section("how-to-buy", "Licensed on their own *or delivered with our services*", [
            tile("Licence", number="01", accent="orange", description="Deploy the product in your own environment under a licence agreement."),
            tile("Subscription", number="02", accent="blue", description="A recurring subscription that grows with your adoption."),
            tile("SaaS", number="03", accent="purple", description="Use the product as a service, hosted and operated for you."),
            tile("With our services", number="04", accent="teal", description="Add Linkfields implementation, integration, managed delivery or a dedicated team – or not."),
        ], eyebrow="How to buy", columns=4, tone="navy",
            description="Linkworks, testoriumz, VajraX and our AI SaaS solutions are available by licence, subscription or SaaS, with or without a Linkfields services engagement.")
        layout(doc, ["sections.page-hero", "sections.overview", "products.product-portfolio", "products.accelerator-grid", buy,
                     "sections.message-banner", "sections.contact-form", "sections.social-banner"])
        set_anchors(doc, [("Overview", "overview"), ("Proprietary products", "proprietary-products"),
                          ("Reusable accelerators", "reusable-accelerators"), ("How to buy", "how-to-buy"), ("Get in touch", "get-in-touch")])


# ---------------------------------------------------------------- Home (9 Nov 2026 review round)
SOLUTION_URLS = {
    "AI Code Assurance": "/solutions/ai-code-assurance",
    "Modernisation & Programme Assurance": "/solutions/modernisation-programme-assurance",
    "Regulated Cyber Readiness": "/solutions/regulated-cyber-readiness",
    "Intelligent Operations": "/solutions/intelligent-operations",
    "Capability Centres with Embedded IP": "/solutions/capability-centres-embedded-ip",
}

HOME_SLIDES = [
    ("One strategic partner across *your transformation*",
     # Banner form of the positioning statement: category in the eyebrow, promise in the headline, outcome here;
     # "20+ years of leadership experience" is carried by the proof strip directly below, so it is not repeated.
     "We help enterprises accelerate digital transformation and build scalable Global Capability Centres, "
     "from strategy and engineering to ongoing operations.",
     "Explore our capabilities", "/services"),
    # Strategic value plays (corporate deck slide 15: "We lead with outcomes, not offerings"). Optional 5th item:
    # per-slide extras — an eyebrow that replaces the hero eyebrow, and chips (one per play, deck colours).
    ("We lead with *outcomes*, not offerings",
     "Each value play starts from a business problem and is built to deliver a measurable outcome, "
     "with our five portfolios and Linkfields software behind it.",
     "Explore the value plays", "#value-plays",
     {"eyebrow": "Strategic value plays", "chips": "PLAYS"}),
    ("AI you can govern. *Code you can trust.*",
     "From AI strategy and agentic AI in production to assurance for AI-written code, with quality, security and governance built in.",
     "Explore AI Code Assurance", "/solutions/ai-code-assurance"),
    ("Global Capability Centres, *built to scale with you*",
     "GCC strategy, set-up and build-operate-transfer, with specialist talent, managed teams and Linkfields IP embedded from day one.",
     "Explore Talent Advisory & GCC", "/services/talent-advisory-gcc"),
    ("Software we own. *Accelerators we reuse.*",
     "Eight proprietary products, available independently or with our services, plus five reusable accelerator families that shorten time to value.",
     "Explore our software", P),
]

def _m(path, alt):
    return {"__media": path, "alt": alt}


# Credentials strip (scrolls under the hero copy). Value and/or badge logo + label.
HERO_PROOF = [
    {"value": "20+", "label": "Years of leadership experience", "href": "/company/about-us#who-we-are"},
    {"value": "#35", "label": "Africa\u2019s Fastest-Growing Companies 2026 \u00b7 FT & Statista", "href": "/company/news-and-articles"},
    {"value": "ISO", "label": "27001:2022 & 9001:2015 certified", "logo": _m("custom/badges/iso-27001.png", "ISO/IEC 27001:2022 certified")},
    {"value": "Level 1", "label": "B-BBEE contributor", "logo": _m("custom/badges/bbbee-level-1.png", "B-BBEE Level 1 proud contributor")},
    {"label": "NASSCOM member", "logo": _m("custom/badges/nasscom-member.png", "NASSCOM member")},
    {"label": "D-U-N-S\u00ae Registered", "logo": _m("custom/badges/duns-registered.png", "Dun & Bradstreet D-U-N-S Registered")},
    {"label": "Proud YES member", "logo": _m("custom/badges/yes-member.png", "A proudly YES (Youth Employment Service) member")},
]

# OEM and technology partners: white marks on the dark hero; the original-colour logo shows on a light chip on
# hover. Each links to the Linkfields service built on it (HP has no dedicated page, so it is not linked).
# (label, white-mark file key, colour file key, href)
_IEP = "/services/intelligent-enterprise-platforms"
_RPA = "/services/digital-transformation/automation-rpa"
HERO_PARTNERS = [
    ("SAP", "sap", "sap", f"{_IEP}/sap-s4hana"),
    ("Microsoft", "microsoft", "microsoft", f"{_IEP}/microsoft-dynamics-365"),
    ("Microsoft Azure", "azure", "azure", "/services/digital-transformation/cloud-services"),
    ("Salesforce", "salesforce", "salesforce", f"{_IEP}/salesforce"),
    ("Oracle", "oracle", "oracle", _IEP),
    ("HP", "hp", "hp", None),
    ("Odoo", "odoo", "odoo", f"{_IEP}/odoo"),
    ("Zoho", "zoho", "zoho", f"{_IEP}/zoho"),
    ("UiPath", "uipath-2025", "uipath", _RPA),
    ("Blue Prism", "blue-prism-wordmark", "blue-prism", _RPA),
]
def home_hero(doc):
    hero = find(doc.get("sections") or [], "home.hero-slider")
    if not hero:
        return
    hero["eyebrow"] = "AI-driven technology, engineering & advisory"
    hero["primaryCta"] = {"label": "Let\u2019s connect", "href": "#get-in-touch", "openInNewTab": False}
    hero["proofPoints"] = copy.deepcopy(HERO_PROOF)
    slides = hero.get("slides") or []
    out = []
    for i, (title, desc, label, href, *extra) in enumerate(HOME_SLIDES):
        base = copy.deepcopy(slides[i]) if i < len(slides) else {}
        for key in ("eyebrow", "chips"):  # per-slide extras are set explicitly below, never inherited by index
            base.pop(key, None)
        base.update({"title": title, "description": desc, "cta": {"label": label, "href": href, "openInNewTab": False}})
        opts = dict(extra[0]) if extra else {}
        if opts.get("chips") == "PLAYS":
            opts["chips"] = [{"label": pl["title"], "href": SOLUTION_URLS[pl["title"]], "accent": pl["accent"]} for pl in PLAYS]
        base.update(opts)
        out.append(base)
    hero["slides"] = out
    hero["autoplaySeconds"] = 6  # seconds per slide (CMS field, 4-15)
    hero["partnersLabel"] = "OEM & technology partners"
    hero["partners"] = [{"label": label,
                         "image": _m(f"custom/partners/mono/oem-mono-{mono}.png", f"{label} logo"),
                         "colorImage": _m(f"custom/partners/color/oem-color-{color}.png", f"{label} logo"),
                         "href": href}
                        for (label, mono, color, href) in HERO_PARTNERS]


def home_who():
    return {
        "__component": "sections.who-we-are", "anchorId": "who-we-are", "eyebrow": "Who we are",
        "heading": "South Africa headquarters. *Integrated global delivery.*",
        "body": ("Linkfields combines technology services, proprietary software and reusable delivery IP for enterprise transformation. "
                 "Headquartered in South Africa, with an offshore delivery centre in India and international market presence, we help "
                 "clients modernise, run, analyse, secure and scale."),
        "stats": [
            {"value": "5", "title": "Integrated service portfolios", "accent": "orange"},
            {"value": "8", "title": "Proprietary software products", "accent": "blue"},
            {"value": "5", "title": "Accelerator families for faster delivery", "accent": "yellow"},
        ],
    }


HOME_PLAYS = [
    ("AI Code Assurance", "Shipping AI-generated code without losing assurance?",
     "Keep delivery speed while quality and security gates check every AI-written change before release."),
    ("Modernisation & Programme Assurance", "Planning a complex migration?",
     "Validate migration readiness and release quality before critical cutovers, with regression and integration risk under control."),
    ("Regulated Cyber Readiness", "Need continuous evidence for regulatory readiness?",
     "Move from point-in-time reports to continuous exposure validation, mapped controls and remediation evidence."),
    ("Intelligent Operations", "Under pressure to reduce cost to serve?",
     "Find, redesign and automate the work that drives cost across processes and customer channels."),
    ("Capability Centres with Embedded IP", "Need scalable delivery capacity with stronger governance?",
     "Build-operate-transfer capability centres with quality, security and engineering IP embedded from day one."),
]


def home_plays():
    plays = []
    for base, (title, trigger, outcome) in zip(PLAYS, HOME_PLAYS):
        assert base["title"] == title
        plays.append({"title": title, "accent": base["accent"], "trigger": trigger, "outcome": outcome, "ip": base["ip"],
                      "href": SOLUTION_URLS[title], "linkLabel": "Explore this play"})
    return {
        "__component": "sections.value-plays", "anchorId": "value-plays", "eyebrow": "Strategic value plays",
        "heading": "Start with the *challenge* you need to solve",
        # The hero's value plays slide carries "We lead with outcomes, not offerings", so this line does not repeat it.
        "description": "Pick the challenge closest to yours. Each play shows the outcome we work towards, backed by our five portfolios and Linkfields software.",
        "plays": plays, "ctaLabel": "See all solutions", "ctaUrl": "/solutions",
    }


def home_portfolios():
    sec = portfolios("portfolios")
    one_liners = {
        "Digital Transformation": "Modernise applications, automate work and connect customer channels.",
        "Intelligent Enterprise Platforms": "Connect and run ERP and CRM, from migration to managed support.",
        "Data & AI": "Turn enterprise data into governed AI and better decisions.",
        "Cyber Security": "Validate exposure and embed security from code to AI.",
        "Talent Advisory & GCC": "Scale specialist teams and build governed capability centres.",
    }
    for t in sec["items"]:
        t["description"] = one_liners[t["title"]]
        t.pop("bullets", None)
    sec["heading"] = "Five portfolios. *One integrated partner.*"
    sec["description"] = "Every portfolio is backed by Linkfields software and reusable IP. Combine them around the outcome you need."
    sec["ctaLabel"] = "See all capabilities"
    sec["ctaUrl"] = "/services"
    sec["logosLabel"] = "OEM platforms we deliver"
    sec["logos"] = [l for l in copy.deepcopy(PLATFORMS) if l["label"] != "Oracle"]
    return sec


PRODUCT_TILES = [
    ("linkworks", "Platform", "orange", "Composable enterprise applications and workflows."),
    ("testoriumz", "Quality", "orange", "Continuous, automated quality engineering."),
    ("textiq", "Data & AI", "purple", "Document intelligence for unstructured content."),
    ("finsight", "Data & AI", "purple", "Conversational financial analysis."),
    ("edupilot", "Data & AI", "purple", "AI-assisted course creation."),
    ("vajrax", "Cyber", "teal", "Continuous exposure validation."),
    ("vectorx", "Cyber", "teal", "Code and software supply-chain security."),
    ("ai-governance", "AI security", "teal", "AI gateway, policies and guardrails."),
]

ACCELERATORS = [
    ("Predictive Analytics Suite", "predictive-analytics-suite"),
    ("Digital Twin Suite", "digital-twin-suite"),
    ("Intelligent Workflow Automation", "intelligent-workflow-automation"),
    ("Power BI + AI/ML", "power-bi-ai-ml"),
    ("Delivery accelerators", "delivery-accelerators"),
]


def home_products():
    items = [tile(PRODUCTS[k], eyebrow=eb, accent=acc, description=d, logo=M(f"custom/logos/{k}.png", PRODUCTS[k]),
                  href=f"{P}/{k}", linkLabel="View product") for k, eb, acc, d in PRODUCT_TILES]
    return tiles_section(
        "products", "Software we own. *Accelerators we reuse.*", items,
        eyebrow="Products & accelerators",
        description="Proprietary products, available independently or with Linkfields services, and reusable accelerators that shorten time to value.",
        variant="compact", columns=4, tone="ink",
        noteLabel="Reusable accelerators",
        note=" \u00b7 ".join(f"[{n}]({P}/{slug})" for n, slug in ACCELERATORS),
        ctaLabel="Explore products & accelerators", ctaUrl=P,
    )


def home_why():
    return {
        "__component": "sections.metrics-grid", "anchorId": "why-linkfields", "eyebrow": "Why Linkfields",
        "heading": "One partner. *Owned IP.* Assured delivery.",
        "description": ("One partner accountable for services, software and delivery. Our own products and reusable accelerators shorten "
                        "time to value, and security is embedded across engineering and delivery."),
        "bullets": "Five integrated portfolios\nProprietary software\nReusable accelerators\nSecure by design",
        "metricsLabel": "Client value", "metricsHeading": "Outcomes our clients report",
        "metrics": [
            {"label": "Delivery confidence", "value": "95%+", "title": "Reported project success rate", "description": "Quality-led execution and accountability", "accent": "orange"},
            {"label": "Delivery speed", "prefix": "Up to", "value": "6\u00d7", "title": "Faster technology delivery", "description": "AI-enabled engineering and accelerators", "accent": "blue"},
            {"label": "Development efficiency", "prefix": "Up to", "value": "40%", "title": "Development cost savings", "description": "Through faster, automated delivery", "accent": "purple"},
            {"label": "Cloud optimisation", "prefix": "Up to", "value": "50%", "title": "Infrastructure cost savings", "description": "Through cloud modernisation", "accent": "teal"},
        ],
        "footnote": ("Figures as reported in the Linkfields 2026 corporate profile. Results depend on scope, baseline and environment; "
                     "ask us about examples relevant to your programme."),
        "bannerLabel": "Cyber-safe delivery", "bannerTitle": "Secure by design:",
        "bannerText": "security embedded across engineering and delivery, from code to AI.",
    }


def home_models():
    sec = engagement_models("engagement-models", tone="navy")
    for t in sec["items"]:
        t["description"] = t.pop("footText")
        t.pop("footLabel", None)
    sec["heading"] = "Choose the engagement *that fits*"
    sec["eyebrow"] = "Commercial models"
    sec["description"] = "Buy a project, a managed service, a dedicated team or our software on its own."
    sec["variant"] = "compact"
    sec["ctaLabel"] = "Compare engagement models"
    sec["ctaUrl"] = "/services#engagement-models"
    sec["noteLabel"] = "Outcome-based terms"
    sec["note"] = "Offered where outcomes can be agreed and evidenced. Software licensing terms are confirmed per product."
    return sec


def home_presence():
    sec = global_presence("global-presence")
    sec["heading"] = "South Africa HQ. India delivery centre. *International market presence.*"
    sec["description"] = "Headquartered in Johannesburg, with engineering and delivery from India and market presence across the Middle East, Europe, North America and Asia Pacific."
    sec["variant"] = "compact"
    sec["ctaLabel"] = "Find your nearest office"
    sec["ctaUrl"] = "/contact-us#our-offices"
    sec.pop("strip", None)
    return sec


def home(doc):
    home_hero(doc)
    cf = find(doc["sections"], "sections.contact-form")
    if cf:
        cf["heading"] = "Get in touch"
        cf["subheading"] = "Discuss your enterprise challenge"
    layout(doc, [
        "home.hero-slider", home_who(), home_plays(), home_portfolios(), home_products(), home_why(),
        "sections.industries-grid", home_models(), home_presence(), "sections.featured-insights", "sections.contact-form",
    ])
