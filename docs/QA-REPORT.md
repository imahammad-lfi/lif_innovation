# Fidelity and quality report

This report compares the rebuild with the live site at <https://www.linkfields.com>. It was produced on 2 November 2026 against the production build of the Next.js site (`next build` + `next start`), which reads all content from Strapi 5 on PostgreSQL 18.

## How it was measured

| Check | Tool | Result |
| --- | --- | --- |
| Visible text, rebuild vs the original | `tools/content_diff.py` (word-level diff against the crawled original DOM) | no wording differences on any page (see note below) |
| Visible text, Strapi-backed production vs the seed data | word-level diff of all 58 sitemap URLs | 58 of 58 pages identical |
| Broken images and media HTTP errors | headless Chromium sweep | 1,823 images on 58 pages, 0 broken, 0 HTTP errors |
| Layout geometry vs the live site | `tools/site_audit.py` (headless Chromium, fonts awaited) | see tables below |
| Lint and types | `eslint .`, `tsc --noEmit` | 0 errors |
| Seed vs CMS schema | `node scripts/validate-seed.mjs` | 65 documents valid against 85 components |

`tools/site_audit.py` loads each page on both sites at the same viewport, scrolls through it to trigger lazy content, waits for web fonts, and records each heading's and short text block's position, size and font. It then compares those anchors between the two sites.

## Headline results

**Desktop (1440 px), 51 measurable pages.** The median page-height difference is **0 px** and the mean is **0.22%**. 33 pages are within ±4 px of the original, 42 within ±20 px and all 51 within ±100 px (largest difference 1.6% of page height). 74% of the 953 text anchors sit within ±4 px of their original position.

**Phone (390 px), 55 measurable pages.** The mean page-height difference is **0.84%** and the largest is 5.0%. These numbers are pessimistic. The live site loads its fonts late on narrow viewports, so in a headless browser parts of the original are still drawn in a fallback serif when measured, which changes line breaks. Where this was checked by hand (for example the contact section and footer on `/company/our-approach`, and the top of `/industries/banking`), the layouts match once the original's fonts have loaded.

## Services update QA (2 Nov 2026)

The five-service portfolio (see `docs/SERVICES-PORTFOLIO.md`) replaced 25 original service pages with 36 new pages.
The new pages have no counterpart on the live site, so they were checked for integrity rather than pixel fidelity.
The pixel-fidelity tables below were measured before this update. Rows for the retired `/services/...` URLs describe
the original pages, which now redirect to their successors.

| Check (production build, content served from Strapi + PostgreSQL 18) | Result |
| --- | --- |
| New pages validate against the Strapi section schemas | 36 / 36 |
| Pages in the CMS after import (retired pages pruned) | 66 published |
| HTTP 200 on every sitemap URL | 69 / 69 |
| Text parity, Strapi-served build vs seed files | 69 / 69 identical |
| Broken images | 0 across 2223 images on 69 pages |
| Internal links resolving directly (no 404, no redirect hop) | 56 / 56 unique targets |
| Old service URLs returning a permanent redirect (308) to a live page | 25 / 25 |
| Retired URLs still listed in the sitemap | 0 |
| Hub "what we offer" tabs: CTA visible inside its card, at 390 px and 1440 px | all tabs on 7 hub pages; no duplicate element IDs |
| New pages screenshot-reviewed at 1440 px and 390 px (horizontal overflow, JS errors) | 36 / 36, none found |
| ESLint and TypeScript (`tsc --noEmit`) | clean |

Shared-component fixes made during this update: the hub tab CTA no longer shifts 128 px below its card on mobile,
tab and panel IDs are unique when a page has more than one tab group, and the home "Our Services" **Our Approach**
button was rebuilt to the original markup. It now matches the original's size and position at 390, 1440 and 1600 px.

## Known differences

* Pages without measurable results: `/company/blog/Privacy Policy`, `/company/blog/Privacy Policy 4` and `/solutions/erp-solutions/sap/service&more`. The audit tool double-encoded the special characters in these URLs, so the "original" side was a blank page or a 404. The text-parity check on the correct URLs confirms that these pages match.
* `/explore-more/innovationAndTransformation` (−76 px at 1440) and the SAP sub-pages (−49 to −71 px at 1440) have small vertical-spacing differences in long text blocks. All content, order, imagery and styling match.
* `/industries/banking`, `/industries/oil-gas` and `/industries/telecom` are about +30 px at 1440 because one list item wraps onto an extra line.
* Fonts: the original self-hosts Inter, Fira Sans and Libre Franklin. These are free and open source under the SIL Open Font License, so the rebuild uses the same three families, self-hosted at build time through `next/font` with no requests to Google at runtime. The font files are a slightly different build, so a few words break onto a different line.
  *(Superseded: the redesigned site uses Plus Jakarta Sans for headings and Inter for body text, both SIL OFL 1.1; see README › Fonts.)*
* Text-diff note: `tools/content_diff.py` also reports differences that come only from markup. Hero tab strips are inside `<nav>`, which the tool strips. Carousels place slides and clones in a different order. The rebuild keeps inactive tab panels in the HTML (good for search engines) and adds screen-reader labels such as "Previous slide". Count-up numbers are split into spans, and RPA bullets are drawn with CSS instead of typed "•" characters. Once these are excluded, the only remaining difference is a stray backslash in the original Insurance page text, which the rebuild omits.

## Detailed tables

The "Text anchors" column is the share of headings and short texts whose top/left position is within ±4 px of the original. "Font mismatches" counts anchors whose computed font family, size or weight differs.

### 1440px viewport

| Page | Original height | Rebuild height | Difference | Text anchors positioned within ±4px | Font mismatches |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | – | – | – | – | 0 |
| `/careers` | – | – | – | – | 0 |
| `/company/about-us` | – | – | – | – | 0 |
| `/company/blog` | 2006 | 2006 | +0 | 100% (13/13) | 0 |
| `/company/blog/Privacy%20Policy` | 900 | 4696 | +3796 | – | 0 |
| `/company/blog/Privacy%20Policy%204` | 900 | 4224 | +3324 | – | 0 |
| `/company/news-and-articles` | 1772 | 1772 | +0 | 100% (1/1) | 0 |
| `/company/our-approach` | – | – | – | – | 0 |
| `/contact-us` | 3002 | 3002 | +0 | 71% (10/14) | 0 |
| `/cookies-policy` | 2666 | 2666 | +0 | 100% (11/11) | 0 |
| `/explore-more/innovationAndTransformation` | 4899 | 4823 | -76 | 11% (2/19) | 0 |
| `/industries` | 900 | 902 | +2 | – | 0 |
| `/industries/banking` | 4548 | 4578 | +30 | 42% (8/19) | 0 |
| `/industries/fintech` | 4527 | 4527 | +0 | 67% (14/21) | 0 |
| `/industries/fmcg` | 4527 | 4527 | +0 | 74% (14/19) | 0 |
| `/industries/insurance` | 4522 | 4527 | +5 | 26% (5/19) | 0 |
| `/industries/manufacturing` | 4553 | 4552 | -1 | 86% (19/22) | 0 |
| `/industries/mining` | 4553 | 4552 | -1 | 82% (14/17) | 0 |
| `/industries/oil-gas` | 3966 | 3995 | +29 | 57% (8/14) | 0 |
| `/industries/telecom` | 4498 | 4527 | +29 | 47% (8/17) | 0 |
| `/privacy-policy` | 6074 | 6074 | +0 | 100% (23/23) | 0 |
| `/services` | 900 | 902 | +2 | – | 0 |
| `/services/automation` | 5020 | 5020 | +0 | 100% (21/21) | 0 |
| `/services/automation/digital-transformation` | 5389 | 5389 | +0 | 96% (24/25) | 0 |
| `/services/automation/robotic-process-automation` | 5933 | 5933 | +0 | 93% (26/28) | 0 |
| `/services/cloud` | 5141 | 5141 | +0 | 96% (22/23) | 1 |
| `/services/cloud/cloud-consulting` | 4160 | 4160 | +0 | 100% (17/17) | 0 |
| `/services/cloud/cloud-development` | 4299 | 4299 | +0 | 100% (23/23) | 0 |
| `/services/cloud/cloud-migration` | 4984 | 4996 | +12 | 61% (14/23) | 0 |
| `/services/cloud/ipaas` | 4612 | 4612 | +0 | 100% (29/29) | 0 |
| `/services/cloud/kubernetes-services` | 4137 | 4108 | -29 | 65% (11/17) | 0 |
| `/services/consulting` | 5051 | 5051 | +0 | 100% (21/21) | 0 |
| `/services/consulting/product-discovery` | 4156 | 4156 | +0 | 94% (16/17) | 0 |
| `/services/consulting/solution-discovery` | 4749 | 4767 | +18 | 17% (3/18) | 0 |
| `/services/consulting/technology-advisory` | 4227 | 4227 | +0 | 100% (20/20) | 0 |
| `/services/consulting/uiux-design` | 4934 | 4942 | +8 | 67% (14/21) | 0 |
| `/services/engineering` | 5076 | 5076 | +0 | 100% (20/20) | 0 |
| `/services/engineering/application-development` | 4779 | 4779 | +0 | 91% (20/22) | 0 |
| `/services/engineering/devops` | 5910 | 5920 | +10 | 57% (17/30) | 0 |
| `/services/engineering/quality-control` | 5710 | 5718 | +8 | 64% (18/28) | 0 |
| `/services/itinfraandsolutions` | 5241 | 5241 | +0 | 96% (22/23) | 1 |
| `/services/teams` | 5141 | 5141 | +0 | 96% (22/23) | 1 |
| `/services/teams/managed-team` | 4073 | 4080 | +7 | 70% (14/20) | 0 |
| `/services/teams/staff-augmentation` | 4831 | 4831 | +0 | 100% (23/23) | 0 |
| `/services/technology` | 5116 | 5116 | +0 | 96% (22/23) | 1 |
| `/services/technology/ai-ml` | 4203 | 4203 | +0 | 100% (17/17) | 0 |
| `/services/technology/big-data` | 4178 | 4178 | +0 | 100% (17/17) | 0 |
| `/solutions/erp-solutions` | 3722 | 3699 | -23 | 7% (1/14) | 0 |
| `/solutions/erp-solutions/microsoft-dynamics` | 4709 | 4707 | -2 | 83% (15/18) | 3 |
| `/solutions/erp-solutions/odoo` | 5258 | 5246 | -12 | 64% (18/28) | 0 |
| `/solutions/erp-solutions/salesforce` | 4357 | 4347 | -10 | 0% (0/18) | 7 |
| `/solutions/erp-solutions/sap` | 4213 | 4213 | +0 | 64% (9/14) | 5 |
| `/solutions/erp-solutions/sap/core-sap-expertise` | 5098 | 5049 | -49 | 24% (5/21) | 0 |
| `/solutions/erp-solutions/sap/data-services` | 4122 | 4062 | -60 | 8% (1/13) | 1 |
| `/solutions/erp-solutions/sap/sap-hana` | 5425 | 5354 | -71 | 5% (1/19) | 0 |
| `/solutions/erp-solutions/sap/sap-special-expertise` | 3239 | 3239 | +0 | 100% (11/11) | 0 |
| `/solutions/erp-solutions/sap/service&amp;more` | 1446 | 1371 | -75 | 100% (1/1) | 1 |
| `/terms-of-use` | 4114 | 4114 | +0 | 100% (19/19) | 0 |

33 of 58 pages are within ±4px of the original's total height at 1440px.

### 390px viewport

| Page | Original height | Rebuild height | Difference | Text anchors positioned within ±4px | Font mismatches |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 8692 | 8652 | -40 | 7% (2/28) | 16 |
| `/careers` | 6868 | 6883 | +15 | 25% (5/20) | 0 |
| `/company/about-us` | 8892 | 8946 | +54 | 77% (20/26) | 0 |
| `/company/blog` | 3020 | 3020 | +0 | 100% (13/13) | 0 |
| `/company/blog/Privacy%20Policy` | 900 | 5975 | +5075 | – | 0 |
| `/company/blog/Privacy%20Policy%204` | 900 | 6874 | +5974 | – | 0 |
| `/company/news-and-articles` | 2796 | 2796 | +0 | 100% (1/1) | 0 |
| `/company/our-approach` | 7146 | 7206 | +60 | 90% (19/21) | 0 |
| `/contact-us` | 4452 | 4471 | +19 | 50% (7/14) | 0 |
| `/cookies-policy` | 4581 | 4580 | -1 | 100% (11/11) | 0 |
| `/explore-more/innovationAndTransformation` | 6900 | 6960 | +60 | 95% (18/19) | 0 |
| `/industries` | 1027 | 1003 | -24 | – | 0 |
| `/industries/banking` | 5770 | 5831 | +61 | 93% (14/15) | 0 |
| `/industries/fintech` | 5719 | 5721 | +2 | 100% (15/15) | 0 |
| `/industries/fmcg` | 5767 | 5805 | +38 | 67% (10/15) | 0 |
| `/industries/insurance` | 5766 | 5721 | -45 | 40% (6/15) | 0 |
| `/industries/manufacturing` | 5744 | 5805 | +61 | 87% (13/15) | 0 |
| `/industries/mining` | 5770 | 5831 | +61 | 93% (14/15) | 0 |
| `/industries/oil-gas` | 4946 | 4911 | -35 | 55% (6/11) | 0 |
| `/industries/telecom` | 5719 | 5721 | +2 | 100% (15/15) | 0 |
| `/privacy-policy` | 11785 | 11843 | +58 | 91% (21/23) | 0 |
| `/services` | 1027 | 1003 | -24 | – | 0 |
| `/services/automation` | 7231 | 7269 | +38 | 19% (4/21) | 0 |
| `/services/automation/digital-transformation` | 8316 | 8365 | +49 | 40% (10/25) | 0 |
| `/services/automation/robotic-process-automation` | 9267 | 9320 | +53 | 46% (13/28) | 0 |
| `/services/cloud` | 7379 | 7416 | +37 | 17% (4/23) | 1 |
| `/services/cloud/cloud-consulting` | 5361 | 5412 | +51 | 71% (12/17) | 0 |
| `/services/cloud/cloud-development` | 7240 | 7300 | +60 | 96% (22/23) | 0 |
| `/services/cloud/cloud-migration` | 5979 | 6072 | +93 | 61% (14/23) | 0 |
| `/services/cloud/ipaas` | 7780 | 7841 | +61 | 97% (28/29) | 0 |
| `/services/cloud/kubernetes-services` | 6440 | 6454 | +14 | 71% (12/17) | 0 |
| `/services/consulting` | 7268 | 7306 | +38 | 18% (4/22) | 0 |
| `/services/consulting/product-discovery` | 6409 | 6457 | +48 | 71% (12/17) | 0 |
| `/services/consulting/solution-discovery` | 6303 | 6355 | +52 | 72% (13/18) | 0 |
| `/services/consulting/technology-advisory` | 5605 | 5607 | +2 | 100% (20/20) | 0 |
| `/services/consulting/uiux-design` | 7111 | 7167 | +56 | 86% (18/21) | 0 |
| `/services/engineering` | 7270 | 7307 | +37 | 20% (4/20) | 0 |
| `/services/engineering/application-development` | 7155 | 7206 | +51 | 55% (12/22) | 0 |
| `/services/engineering/devops` | 8015 | 8106 | +91 | 57% (17/30) | 0 |
| `/services/engineering/quality-control` | 8118 | 8200 | +82 | 64% (18/28) | 0 |
| `/services/itinfraandsolutions` | 7781 | 7842 | +61 | 91% (21/23) | 1 |
| `/services/teams` | 7295 | 7333 | +38 | 17% (4/23) | 1 |
| `/services/teams/managed-team` | 6270 | 6357 | +87 | 70% (14/20) | 0 |
| `/services/teams/staff-augmentation` | 7658 | 7719 | +61 | 96% (22/23) | 1 |
| `/services/technology` | 7367 | 7404 | +37 | 17% (4/23) | 1 |
| `/services/technology/ai-ml` | 6464 | 6513 | +49 | 71% (12/17) | 0 |
| `/services/technology/big-data` | 6410 | 6460 | +50 | 71% (12/17) | 0 |
| `/solutions/erp-solutions` | 5339 | 5424 | +85 | 21% (3/14) | 0 |
| `/solutions/erp-solutions/microsoft-dynamics` | 6791 | 6851 | +60 | 94% (17/18) | 0 |
| `/solutions/erp-solutions/odoo` | 9062 | 9064 | +2 | 89% (25/28) | 0 |
| `/solutions/erp-solutions/salesforce` | 6523 | 6567 | +44 | 28% (5/18) | 5 |
| `/solutions/erp-solutions/sap` | 6312 | 6219 | -93 | 7% (1/15) | 5 |
| `/solutions/erp-solutions/sap/core-sap-expertise` | 6727 | 6390 | -337 | 24% (5/21) | 0 |
| `/solutions/erp-solutions/sap/data-services` | 5566 | 5478 | -88 | 8% (1/13) | 1 |
| `/solutions/erp-solutions/sap/sap-hana` | 8180 | 8344 | +164 | 26% (5/19) | 0 |
| `/solutions/erp-solutions/sap/sap-special-expertise` | 3999 | 4001 | +2 | 55% (6/11) | 0 |
| `/solutions/erp-solutions/sap/service&amp;more` | 1903 | 1633 | -270 | 0% (0/1) | 1 |
| `/terms-of-use` | 8149 | 8207 | +58 | 95% (18/19) | 0 |

8 of 58 pages are within ±4px of the original's total height at 390px.

## Design refresh (2 Nov, 22:58)

A site-wide typography and visual refresh was applied on request ("smaller, smarter, cleaner, more attractive"). The binding spec is `docs/DESIGN-SYSTEM.md`.

- **Fonts** (both SIL Open Font License, self-hosted through `next/font`): Plus Jakarta Sans for headings, Inter for body and UI. A browser sweep confirms these are the only two families rendered.
- **Type scale**: page titles 40–44px desktop / 28–30px mobile; section headings 32px / 24px; body 15–16px desktop / 14.5–15px mobile (previously 18px with 36px statement paragraphs); uppercase micro-labels 11–11.5px with wide tracking.
- **Components**: pill buttons (`btn-primary` / `btn-secondary`), rounded card surfaces with hairline borders, pill eyebrows, glass tab strip on page heroes, refined mega menu, accordion mobile drawer, new footer (brand block, link columns, badge strip, legal bar).
- **Sweep** (`tools/design_sweep.py`, production build, Strapi mode): 69 pages × 390px and 1440px = 138 checks. 0 failures: no horizontal overflow, no broken images. Text under 12px is limited to the intentional uppercase micro-labels.
- ESLint 0 errors, `tsc --noEmit` 0 errors. Content, URLs, CMS fields and interactions are unchanged.

| Page @ width | Body text px (before → after) | h2 px | h1 px |
|---|---|---|---|
| `/` @1440 | 18/36 → 15/17 px | 36 → 32/44 px | 36 → 44 px |
| `/services` @1440 | 18/36 → 16/15 px | 32/36 → 32/28 px | 36 → 40 px |
| `/services/digital-transformation` @1440 | 18/36 → 16/15 px | 32/36 → 32/28 px | 36 → 40 px |
| `/services/digital-transformation/app-modernisation` @1440 | 16/18 → 15/17 px | 32/36 → 32/28 px | 36 → 40 px |
| `/services/cyber-security` @1440 | 18/36 → 16/15 px | 32/36 → 32/28 px | 36 → 40 px |
| `/linkfields-ip/vajrax` @1440 | 18/15 → 16/15 px | 32/36 → 32/28 px | 36 → 40 px |
| `/solutions/erp-solutions/sap` @1440 | 18/28 → 16/18 px | 32/36 → 32/28 px | 36 → 40 px |
| `/industries/banking` @1440 | 18/16 → 15/16 px | 36/32 → 32/28 px | 36 → 40 px |
| `/company/about-us` @1440 | 18/16 → 17/15 px | 32/36 → 32/28 px | 36 → 40 px |
| `/careers` @1440 | 18/24 → 13/17 px | 32/36 → 32/28 px | 56 → 40 px |
| `/contact-us` @1440 | 18/36 → 13/40 px | 32/16 → 32/11 px | - → - px |
| `/company/blog` @1440 | 12/18 → 13 px | 36 → 32 px | 48 → 40 px |
| `/` @390 | 16/12 → 14.5/15.5 px | 32/24 → 24/30 px | 32 → 30 px |
| `/services` @390 | 16/14 → 15/14.5 px | 24/32 → 24/22 px | 36 → 28 px |
| `/services/digital-transformation` @390 | 16/12 → 15/14.5 px | 24/32 → 24/22 px | 36 → 28 px |
| `/services/digital-transformation/app-modernisation` @390 | 16/12 → 14.5/15.5 px | 24/32 → 24/22 px | 36 → 28 px |
| `/services/cyber-security` @390 | 16/12 → 15/14.5 px | 24/32 → 24/22 px | 36 → 28 px |
| `/linkfields-ip/vajrax` @390 | 16/24 → 15/14.5 px | 24/32 → 24/22 px | 36 → 28 px |
| `/solutions/erp-solutions/sap` @390 | 16/12 → 15/16 px | 24/32 → 24/22 px | 36 → 28 px |
| `/industries/banking` @390 | 16/18 → 14.5/15 px | 24/32 → 24/22 px | 36 → 28 px |
| `/company/about-us` @390 | 16/12 → 15.5/14.5 px | 24/32 → 24/22 px | 36 → 28 px |
| `/careers` @390 | 16 → 12.5/15.5 px | 24/38 → 24/22 px | 56 → 28 px |
| `/contact-us` @390 | 16/24 → 12.5/28 px | 24/16 → 11/24 px | - → - px |
| `/company/blog` @390 | 12 → 12.5 px | 28 → 24 px | 30 → 28 px |

## Products & Accelerators update (3 Nov, 00:10)

Checked on the production build (Strapi content, `next start`) after the new tab went live:

| Check | Result |
|---|---|
| New and moved pages (`/products-and-accelerators` + 13) | all HTTP 200 |
| Old `/linkfields-ip/*` URLs | 308 redirects to the new addresses |
| Sitemap | 75 URLs, including 14 Products & Accelerators pages and none of the retired URLs |
| CMS content vs seed | 72 pages, section counts identical for every page |
| Internal links across all pages | 63 unique, 0 non-200 |
| Images across all pages | 75 pages, 1922 images, 0 broken |
| Lint / TypeScript | clean |
| Visual review | mega menu at 1100/1440/1920, mobile drawer at 390, hub and new pages at 1440/390 |
