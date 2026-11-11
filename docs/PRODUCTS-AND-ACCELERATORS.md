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
- Logos: `seed/assets/custom/logos/` (textIQ, FinSight, EduPilot, Linkworks and testoriumz from the product sites;
  VajraX from the new official logo file supplied on 11 Nov 2026; VectorX and AI Governance rendered as wordmarks in the
  site fonts). Balanced plate versions: `logos/plate/<slug>-plate.png` (see below). Accelerator icons:
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
  to every product link in the Products menu whose slug has a logo (Linkworks, testoriumz, textIQ, FinSight, EduPilot, VajraX,
  VectorX and, since 11 Nov 2026, AI Governance; the earlier rule that kept very wide wordmarks as text was removed).
* Desktop menu and mobile drawer render logos on white plates; the hub product rows already use `LogoChip`.
* Category, product-row, accelerator and menu tiles use the shared `.acc-tile` treatment (see DESIGN-SYSTEM.md).

## Balanced logo sizes (11 Nov 2026, 12:22)

* Every product logo on a white plate (menu, mobile drawer, product cards on the hub, home page and event page, Linkfields IP
  tiles on the service pages) now uses a **plate file**: `seed/assets/custom/logos/plate/<slug>-plate.png`. Each plate file
  has the same shape (3.25 : 1) and places the logo so its lower-case letters are the same height, so all eight wordmarks
  read at the same size side by side, whether the logo has a tall icon (VajraX, FinSight) or none (VectorX).
* The seed pipeline swaps `logos/<slug>.png` for the plate file automatically (`apply.py`, final pass). The banner logos on
  the product pages are separate and unchanged by this.
* To add or replace a product logo: save the transparent, trimmed original as `seed/assets/custom/logos/<slug>.png`, add the
  slug to `SLUGS` in `tools/logo_metrics.py`, run `python3 tools/logo_plates.py --preview /tmp/plates.png`, check the
  preview (all wordmarks the same height), then rebuild the seed and import. Editors uploading by hand use the generated
  `<slug>-plate.png` and **keep "-plate" in the file name**: the website recognises plate files by that name and gives them
  the balanced box.
* VajraX: the new logo (shaded icon, black "Vajra", orange "X") replaced the 2025 logo everywhere on 11 Nov 2026: menu,
  drawer, product cards, Linkfields IP tiles and the VajraX page banner. The three unused older VajraX files were removed from
  the Media Library; the old artwork is kept only in `seed/assets/custom/logos/retired/`.

## Product banner logos (11 Nov 2026)

* `sections.page-hero` has an optional **logo** image field. When it is set, the banner shows the logo in place of the
  visible title; the title text stays in the page heading for screen readers and search engines, so keep it filled in.
* Seven product pages use on-dark vector versions of their logos (`seed/assets/custom/logos/svg/<slug>-on-dark.svg`,
  uploaded to the Media Library as `<slug>_on_dark…svg`), set by `deck.product_hero_logo()` in the seed pipeline. VajraX
  uses the new official logo directly as a high-resolution PNG (`logos/on-dark/vajrax-on-dark.png`, 1600 px wide, "Vajra"
  turned white). Accelerator pages have no logo and keep the text title.
* The SVGs are traced from the original logos by `tools/vectorise_logos.py` (needs `potrace`, `scipy`, `numpy`,
  `Pillow`): the white-background fringe is removed, outlines are smoothed and each brand colour is traced to smooth curves,
  so the banner logos have clean, sharp edges at every screen size. Light-background versions
  (`logos/svg/<slug>.svg`) are generated alongside for future use; the menu pills and cards use the plate files above.
* Editors: Content Manager → Page → open the product page → first section (Page hero) → **logo** → choose or upload an
  SVG made for dark backgrounds (white or light wordmark; a transparent PNG works but must be at least twice the
  displayed size, about 800 px wide, to stay sharp) → Save → Publish. Remove the image to return
  to the text title. The website sizes the logo automatically from its proportions (see DESIGN-SYSTEM.md).
