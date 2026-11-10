# Products & Accelerators (update of 2–3 November 2026)

A new top-level menu tab, **Products & Accelerators**, sits between *Services* and *Industries*. It follows the client
slide "Software we own. Accelerators we reuse." and groups the offer in two bands:

- **Proprietary products** — "Licensed on their own or delivered with our services", grouped by service line
  (01 Digital Transformation, 02 Intelligent Enterprise Platforms, 03 Data & AI, 04 Cyber Security).
- **Reusable accelerators** — "Pre-built delivery IP that shortens time to value" (five colour-coded accelerators).

The previous *Linkfields IP* pages have moved into this tab; their old URLs redirect permanently (308).

## Structure and URLs

| Group | Item | URL |
|---|---|---|
| Hub | Products & Accelerators | `/products-and-accelerators` |
| 01 Digital Transformation | Linkworks — app modernisation & composable UI | `/products-and-accelerators/linkworks` |
| | testoriumz — quality engineering | `/products-and-accelerators/testoriumz` (new) |
| 02 Intelligent Enterprise Platforms | Linkworks — composable apps | `/products-and-accelerators/linkworks` |
| 03 Data & AI | textIQ — document intelligence | `/products-and-accelerators/textiq` |
| | FinSight — financial insights | `/products-and-accelerators/finsight` |
| | EduPilot — instant course creation | `/products-and-accelerators/edupilot` |
| 04 Cyber Security | VajraX — exposure validation | `/products-and-accelerators/vajrax` |
| | VectorX — supply-chain security | `/products-and-accelerators/vectorx` |
| | AI Governance — AI gateway & guardrails | `/products-and-accelerators/ai-governance` |
| Data & AI | Predictive Analytics Suite | `/products-and-accelerators/predictive-analytics-suite` (new) |
| Simulation | Digital Twin Suite | `/products-and-accelerators/digital-twin-suite` (new) |
| Enterprise AI | Intelligent Workflow Automation | `/products-and-accelerators/intelligent-workflow-automation` (new) |
| Analytics | Power BI + AI/ML | `/products-and-accelerators/power-bi-ai-ml` (new) |
| Portfolio IP | Delivery accelerators | `/products-and-accelerators/delivery-accelerators` (new) |

Redirects: `/linkfields-ip` → `/products-and-accelerators` and `/linkfields-ip/<product>` →
`/products-and-accelerators/<product>` (all in `apps/web/redirects.json`).

Also updated: the footer *Quick links* column (new "Products & Accelerators" link after *Our Approach*) and the
contact-form service list ("Products & accelerators (licence / SaaS)").

## Page sections

**Hub** (`/products-and-accelerators`): hero with anchor tabs → overview → **Proprietary products** bento
(`products.product-portfolio`: four numbered category cards, white logo chips, tags, per-category link to the service
line) → **Reusable accelerators** (`products.accelerator-grid`: five accent cards with feature checklists) → call to
action → contact form → social links.

**Accelerator pages** (five): hero → overview → *What's inside* (`solutions.card-grid`, one card per slide bullet) →
delivery approach (`services.numbered-help`, four steps) → *Explore our other accelerators* (the current one is hidden
automatically) → call to action → contact form → social links.

**testoriumz**: hero → overview → capabilities (low-code testing, AI root-cause analysis, CI/CD integration) →
delivery card with the product logo linking to https://testoriumz.com (new tab) → call to action → contact form →
social links. Facts come from testoriumz.com and the existing quality-engineering page.

## New CMS building blocks (Strapi 5)

| Component | Purpose | Key fields |
|---|---|---|
| `products.product-portfolio` | Product bento grid | eyebrow, heading, description, `categories[]` |
| `elements.products-category` | One service-line card | number, title, href, accent, `products[]` |
| `elements.products-product` | One product row | name, logo, tagline, description, tags (`\|`-separated), href, openInNewTab |
| `products.accelerator-grid` | Accelerator cards | eyebrow, heading, description, `items[]` |
| `elements.products-accelerator` | One accelerator | label, title, description, icon, accent, `features[]`, href |
| `layout.nav-item` (extended) | Sectioned mega menu | `section`, `sectionDescription`, `eyebrow`, `accent` |
| `shared.link` (extended) | Menu link sub-line | `description` |

Accent colours: `orange`, `blue`, `purple`, `teal`, `yellow` (the slide palette, toned for the dark theme).

The mega menu switches to the **sectioned layout** automatically when its items carry a `section` value: items are
grouped under each section heading, and each row lays out its tiles in 4 or 5 columns (2 or 3 on tablets). The mobile
drawer shows the same sections, with expandable product categories.

## How it is built

- Menu definition: `seed/custom/portfolio.json` → `productsMenu` (applied by `seed/custom/apply.py`,
  `patch_products_menu`). Page documents: `seed/custom/pages/products-and-accelerators*.json`.
- Logos: `seed/assets/custom/logos/` (textIQ, FinSight, EduPilot, VajraX, Linkworks and testoriumz from the
  product sites; VectorX and AI Governance rendered as wordmarks in the site fonts). Accelerator icons:
  `seed/assets/custom/icons/acc-*.svg` (Lucide, ISC licence). Banners: `seed/assets/custom/hero-*.jpg` (AI-generated
  for this project).
- To rebuild: `python3 seed/custom/apply.py`, then validate (`node apps/cms/scripts/validate-seed.mjs`), then import
  (`npm run seed -- --only=global,pages --prune-pages` in `apps/cms`).

## Notes for the content owner

- Accelerator descriptions are deliberately factual and general: no statistics, client names or certifications have
  been invented. Add proof points (case studies, metrics) in the CMS when they are approved.
- Linkworks appears under two service lines, as on the slide; both rows link to the same product page.
- During a bulk seed import Strapi may log "Could not emit entry.publish … Timeout acquiring a connection". These are
  webhook notifications only; the content is written. Trigger one revalidation afterwards (or publish any entry).

## Logos and colour effects (November 2026)

* `shared.link` has an optional `logo` media field. `apply.py` (`with_logo`) attaches `seed/assets/custom/logos/<slug>.png`
  to every product link in the Products menu whose slug has a logo (Linkworks, testoriumz, textIQ, FinSight, EduPilot, VajraX, VectorX).
  AI Governance stays text because its wordmark is too wide for a menu plate.
* Desktop menu and mobile drawer render logos on white plates; the hub product rows already use `LogoChip`.
* Category, product-row, accelerator and menu tiles use the shared `.acc-tile` treatment (see DESIGN-SYSTEM.md).
