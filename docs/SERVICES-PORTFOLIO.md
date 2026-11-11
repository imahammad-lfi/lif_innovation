# Services portfolio: 5 services (update of 2 November 2026)

The original site's six service groups (Engineering, Consulting, Cloud, Technology, Automation, Teams) have been
replaced by the five-service portfolio requested on 2 November 2026. Everything else on the site (solutions,
industries, company, careers, blog, legal pages, header, footer, design) is unchanged. The new pages reuse the
original site's section components, typography, spacing and imagery. Copy for the new services and the Linkfields
IP products comes from the Linkfields portfolio material (`docs/portfolio-source.md`) and from the original pages they
replace.

## Structure and URLs

| Service | Sub-services | Group inside the service |
| --- | --- | --- |
| **Digital Transformation** `/services/digital-transformation` | App modernisation, Automation & RPA, Integration services, WhatsApp Business & omnichannel, Quality engineering, Cloud services (`/services/digital-transformation/<slug>`) | LINKFIELDS IP: Linkworks, testoriumz (external, https://testoriumz.com) |
| **Intelligent Enterprise Platforms** `/services/intelligent-enterprise-platforms` | SAP S/4HANA, Microsoft Dynamics 365, Odoo, Salesforce (the existing `/solutions/erp-solutions/...` pages), Zoho, Platform migration & AMS (new), Linkworks | LINKFIELDS IP: Linkworks |
| **Data & AI** `/services/data-ai` | AI strategy & governance, Agentic AI & GenAI, Data platforms & analytics | LINKFIELDS IP: textIQ, Finsight, EduPilot |
| **Cyber Security** `/services/cyber-security` | AI security & GRC, Cloud security & IAM, Exposure validation & AppSec, Security operations, Machine learning | LINKFIELDS IP: VajraX, VectorX, AI Governance |
| **Talent Advisory & GCC** `/services/talent-advisory-gcc` | Technology advisory, Specialist talent & managed teams, GCC strategy & setup, GCC build-operate-transfer | ENGAGEMENT MODELS: Staff augmentation, Managed teams, GCC build-operate-transfer |

There are also new pages for **Services overview** `/services` and one page per Linkfields product. Since 3 November
the product pages live under the **Products & Accelerators** tab (`/products-and-accelerators/<product>`; the old
`/linkfields-ip/*` URLs redirect) — see `docs/PRODUCTS-AND-ACCELERATORS.md`.
In total there are 36 new or rebuilt pages, and the site now has 66 CMS pages.

The new structure appears in the following places:

* **Header mega menu (desktop):** five service tiles, each with its icon, sub-service links and an orange group
  heading ("LINKFIELDS IP" / "ENGAGEMENT MODELS").
* **Mobile drawer:** Services, then each service (expandable), its sub-services and the group heading.
* **Home page "Our Services" carousel:** five service tiles with updated copy.
* **Footer services column, contact form "service" options, industry pages' service links:** all point to the new
  pages.

## Redirects from the old service URLs

All 25 retired URLs return a permanent redirect (HTTP 308) to the closest new page, so bookmarks and search-engine
links keep working. The map lives in `apps/web/redirects.json` and is loaded by `next.config.ts`.

| Old | New |
| --- | --- |
| /services/engineering, /services/automation, /services/automation/digital-transformation | /services/digital-transformation |
| /services/engineering/application-development, /services/engineering/devops, /services/consulting/uiux-design | /services/digital-transformation/app-modernisation |
| /services/engineering/quality-control | /services/digital-transformation/quality-engineering |
| /services/automation/robotic-process-automation | /services/digital-transformation/automation-rpa |
| /services/cloud, /services/cloud/{cloud-consulting, cloud-migration, cloud-development, kubernetes-services}, /services/itinfraandsolutions | /services/digital-transformation/cloud-services |
| /services/cloud/ipaas | /services/digital-transformation/integration-services |
| /services/technology | /services/data-ai |
| /services/technology/big-data | /services/data-ai/data-platforms-analytics |
| /services/technology/ai-ml | /services/data-ai/agentic-ai-genai |
| /services/consulting, /services/teams | /services/talent-advisory-gcc |
| /services/consulting/{product-discovery, solution-discovery, technology-advisory} | /services/talent-advisory-gcc/technology-advisory |
| /services/teams/staff-augmentation | /services/talent-advisory-gcc/staff-augmentation |
| /services/teams/managed-team | /services/talent-advisory-gcc/managed-teams |

## How it is built

| File | Purpose |
| --- | --- |
| `seed/custom/portfolio.json` | Single source of truth for the menu: services, sub-service links, group headings, icons, home tiles |
| `seed/custom/pages/*.json` | The 36 hand-authored pages (same JSON shape as every other page: `path`, `title`, `seo`, `sections`) |
| `seed/custom/apply.py` | Overlay run automatically at the end of `seed/transform/build.py`. It publishes the custom pages, removes retired pages, rebuilds the Services menu, footer column, home tiles and contact options from `portfolio.json`, and rewrites links that point at retired URLs |
| `seed/custom/retired/` | Archived copies of the 25 retired page documents (reference only) |
| `apps/web/redirects.json` | Old URL to new URL map (permanent redirects) |
| `tools/publish_page.py <file.json>` | Validates one custom page against the Strapi schemas, copies it into `seed/data` and refreshes the dev site |
| `seed/assets/custom/` | New hero banners, home tiles and service icons |

Menu groups are two optional fields on the CMS `layout.nav-item` component: `groupLabel` (for example "LINKFIELDS
IP") and `groupLinks` (list of links). Editors can change them in Strapi under **Global → Navigation**.

To re-import everything into Strapi after editing seed files:

```bash
python3 seed/transform/build.py                                        # crawl data + portfolio overlay -> seed/data
cd apps/cms && npm run seed -- --only=global,pages --prune-pages       # import; deletes CMS pages no longer in seed/data
```

In production, editors simply edit the pages in the Strapi admin. The seed files are only the initial content.

## Images

The 15 new photographs (13 hero banners and 2 new home tiles) were generated specifically for this project
with an AI image model. They are not stock photos, so no third-party stock licence, attribution or fee applies. The six orange service icons are rendered from the open-source **Lucide** icon set (ISC licence).
Pages that directly succeed an original page keep that page's original images.

## Notes for the content owner

* Product claims for VajraX, VectorX, AI Governance, textIQ, Finsight and EduPilot are limited to what the portfolio
  material states. Please review the copy before go-live and add any approved figures or customer references.
* The Automation & RPA page keeps the original site's partner strip images (ElectroNeek, Coca-Cola, CipherWave,
  UiPath) exactly as the original showed them. Coca-Cola and CipherWave look like client logos rather than RPA tool
  vendors. Replace them in Strapi if that was not intended.
* Demo buttons on the IP product pages link to the product URLs from the portfolio material, or to `/contact-us`
  where no public URL exists.
