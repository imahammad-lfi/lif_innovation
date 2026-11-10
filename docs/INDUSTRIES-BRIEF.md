# Brief: new and refreshed Industry pages (content only)

Repo: `/home/ubuntu/linkfields` (Next.js 16 site + Strapi 5 CMS, content authored as JSON seed docs).
You author page documents in `seed/custom/pages/<file>.json` (file name = path with `/` → `__`, no leading slash,
e.g. `/industries/public-sector` → `industries__public-sector.json`) and publish them to the local dev site with:

    python3 tools/publish_page.py industries__public-sector.json

This copies the doc into `seed/data/pages`, validates it against the Strapi schemas (must print "valid") and refreshes
the dev server (shared, http://127.0.0.1:3000 — do NOT restart it; the lead edits components in parallel, so if a page
briefly errors, wait 20 s and retry).

Screenshots: `python3 tools/type_audit.py /tmp/<you>/shots --pages <path> [<path>...]` writes full-page JPGs at 1440
and 390 (view them with your image reader; crop tall images with PIL first). Confirm no horizontal overflow at 390.

## Source of truth
- Slide text (verbatim) and decisions: `docs/request-2026-11-07.md` (read it first).
- Model page docs (copy their section shapes exactly): `seed/data/pages/industries__banking.json`,
  `seed/data/pages/industries__mining.json`. Other component shapes: browse `seed/custom/pages/*.json`
  (e.g. `solutions.card-grid` in `seed/custom/pages/products-and-accelerators__vajrax.json`).
- Section schemas: `apps/cms/src/components/<category>/<name>.json` (`__component` = "<category>.<name>").
  Only use components and fields that already exist; never invent fields.
- Media: `{"__media": "<path under seed/assets>", "alt": "..."}`. Banners are listed below. For icons, reuse icons
  already referenced by existing industry/service pages (grep `__media` in `seed/data/pages/industries__*.json` and
  `seed/custom/pages/*.json`) or `custom/icons/*.svg`.
- Do **not** edit code (apps/web, apps/cms), `global.json`, `portfolio.json`, `apply.py`, redirects or other agents'
  pages, and do not restart servers. If a component looks broken, describe it in your report.

## Page structure (mirror the existing industry pages)
1. `sections.page-hero` — title (industry name exactly as below), subtitle = the slide description (verbatim),
   `backgroundImage` = the banner below, anchorLinks (uppercase labels → anchorIds):
   INDUSTRY OVERVIEW → industry-overview, [umbrella pages only: SECTORS → sectors], WHAT WE OFFER → what-we-offer,
   OUR SPECIALIZATION → our-specialization, GET IN TOUCH → get-in-touch.
2. `sections.overview` (anchorId industry-overview) — eyebrow INDUSTRY OVERVIEW, heading, 2 short paragraphs.
3. Umbrella pages only (BFSI, Energy & Mining): anchorId `sectors`, eyebrow SECTORS, a linked card section (pick an
   existing component whose cards carry an image or icon **and** an `href`, e.g. `solutions.card-grid`) with one card
   per sub-industry page listed below (title, 1–2 sentence description, href to the existing page). Read the sub-pages'
   own docs to describe them accurately.
4. `industries.building-tools` (anchorId what-we-offer) — eyebrow WHAT WE OFFER. Items must include **each slide tag**
   for that industry (title exactly as the tag), plus 1–3 more relevant offers drawn from Linkfields' services
   (Digital Transformation, Intelligent Enterprise Platforms, Data & AI, Cyber Security, Talent Advisory & GCC; their
   pages are `seed/custom/pages/services__*.json`). Link items to the relevant service page where the shape allows.
5. `sections.message-banner` — copy the banking one, adapting the text to the industry.
6. `industries.specialization-list` (anchorId our-specialization) — 4–6 focused specialisations for the industry.
7. `sections.featured-insights`, `sections.contact-form`, `sections.social-banner` — copy **verbatim** from banking.
SEO block: metaTitle "<Industry> | Linkfields Innovations", metaDescription ≤ 160 chars, keywords, canonicalUrl "",
noIndex false.

## Content rules
- British English; crisp, confident, specific. Card/item descriptions ≤ 170 characters.
- **No invented facts**: no statistics, percentages, client names, certifications, prices, partner claims or dates.
- Keep the slide's industry names and tag wording exactly.

## Pages
| Path | Title | Banner | Notes |
|---|---|---|---|
| /industries/bfsi | BFSI | custom/hero-bfsi.jpg | Umbrella. Sectors: Banking `/industries/banking`, Insurance `/industries/insurance`, Fintech `/industries/fintech`. Tags: Security · Digital financial services · Intelligent automation · Customer Experience |
| /industries/energy-mining | Energy & Mining | custom/hero-energy-mining.jpg | Umbrella. Sectors: Mining `/industries/mining`, Oil & Gas `/industries/oil-gas`. Tags: Asset optimisation · Automation · Security · Operational efficiency |
| /industries/retail-fmcg-cpg | Retail, FMCG & CPG | keep the current hero image | **Existing doc** `seed/custom/pages/industries__retail-fmcg-cpg.json` (the former FMCG page, already moved). Refresh title, hero subtitle, overview, building-tools and specialisations to cover Retail, FMCG & CPG; keep what is still accurate. Tags: Customer experience · Forecasting · Personalisation · Growth |
| /industries/healthcare-pharma | Healthcare & Pharma | custom/hero-healthcare-pharma.jpg | Tags: Patient care · Digital health · AI-powered insights |
| /industries/public-sector | Public Sector | custom/hero-public-sector.jpg | Not on the slide. Subtitle in the slide's style, e.g. "Modernise public services with secure digital innovation, intelligent automation and Data & AI for citizens and agencies." Tags to use: Citizen services · Digital government · Secure data · Automation |
| /industries/education | Education | custom/hero-education.jpg | Not on the slide. Subtitle in the slide's style, e.g. "Transform learning and campus operations with digital innovation, AI-driven insights and intelligent automation." Tags to use: Digital learning · Student experience · AI-powered insights · Automation. Mention Linkfields' EduPilot product (`/products-and-accelerators/edupilot`, "Instant course creation") where relevant. |

## Report
Return: files written, published OK (yes/no), screenshot paths reviewed, anything that looked off.
