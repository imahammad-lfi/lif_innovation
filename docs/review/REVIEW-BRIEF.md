# Linkfields website review — shared reviewer brief (2026-11-08)

You are one of several reviewers. Each reviewer owns one page group. The goal is **advice**, not implementation:
decide, section by section, what is not required, what should be merged, what must be reworked, and what is missing,
so that the website serves the company objective and stands out. Be decisive and specific.

## STRICT rules
- **Read-only.** Do NOT edit, create or delete anything in `/home/ubuntu/linkfields` except your own report file under
  `/home/ubuntu/linkfields/docs/review/`. Do not run `apply.py`, `seed.mjs`, `publish_page.py`, builds, `systemctl`,
  `pkill`, or anything that restarts or changes services. Do not touch ports 3000/3001/1337 except with HTTP GET requests.
- Screenshots go only to your own folder `/tmp/review/<group-id>/`.
- Do not use any web search; everything you need is local.

## The company objective (read `/home/ubuntu/linkfields/docs/CORPORATE-DECK-2026.md` first — it is the source of truth)
Linkfields Innovations is a South-Africa-headquartered technology partner (offices/presence: South Africa HQ, India
offshore delivery centre, UAE, UK, USA, Australia) that wants to be seen as **one strategic partner** combining
**five integrated service portfolios**, **its own proprietary software (Linkfields IP)** and **reusable accelerators**,
for enterprise clients: "Innovate · Operate · Analyse · Secure · Scale", "secure by design", "we lead with outcomes,
not offerings" (strategic value plays), flexible commercial models, 20+ years of industry leadership, FT & Statista
Africa growth ranking, B-BBEE Level 1.

Five portfolios (fixed taxonomy, requested by the client — do not recommend changing the five):
1. Digital Transformation (orange): App modernisation, Automation & RPA, Integration services, WhatsApp Business &
   omnichannel, Quality engineering, Cloud services. IP: Linkworks, testoriumz.
2. Intelligent Enterprise Platforms (blue): SAP S/4HANA, Microsoft Dynamics 365, Odoo, Zoho, Salesforce, Linkworks,
   Platform migration & AMS. IP: Linkworks.
3. Data & AI (purple): AI strategy & governance, Agentic AI & GenAI, Data platforms & analytics, Machine learning.
   IP: textIQ, FinSight, EduPilot.
4. Cyber Security (teal): AI security & GRC, Cloud security & IAM, Exposure validation & AppSec, Security operations.
   IP: VajraX, VectorX, AI Governance.
5. Talent Advisory & GCC (yellow): Technology advisory, Specialist talent & managed teams, GCC strategy & setup,
   GCC build-operate-transfer. Engagement models: Staff augmentation, Managed teams, GCC build-operate-transfer.

Industries (8, per a client-supplied slide): Telecom, BFSI (Banking, Insurance, Fintech), Healthcare & Pharma,
Retail FMCG & CPG, Manufacturing, Energy & Mining (Mining, Oil & Gas), Public Sector, Education.
Products & Accelerators: products Linkworks, testoriumz, textIQ, FinSight, EduPilot, VajraX, VectorX, AI Governance;
accelerators Predictive Analytics Suite, Digital Twin Suite, Intelligent Workflow Automation, Power BI + AI/ML,
Delivery accelerators.

## Things the client explicitly asked for (keep; you may suggest refinements, not removal)
Five-portfolio taxonomy and sub-services above; Products & Accelerators top-level menu and pages; product logos and
colour-accent tiles; the dark "Industries we know deeply" photo-card grid with Public Sector and Education; the sticky
section tab bar (Overview / What we deliver / … ) that docks under the header and highlights the active section;
the rotating full-globe video in the home hero; a single, unified tile look across services/solutions/products/
industries; deck-aligned sections (who we are, portfolios, value plays, client value metrics, commercial models,
why Linkfields, global presence); open-source fonts (Plus Jakarta Sans + Inter); British English; Linkfields brand
colours (orange #FF7800 family, yellow, blue, navy/ink backgrounds); hover effect = subtle expansion/scale everywhere.

## Background you need to judge fairly
- The site began as a copy of the old linkfields.com. Many sub-pages still carry **legacy copy and legacy section
  types** from that crawl (the original HTML/text is in `/home/ubuntu/lf-crawl/` if you want to compare). Newer pages
  were authored in 2026 against the deck. Legacy content is a prime suspect for "not required / needs rework":
  generic filler, repetition, outdated positioning, old service names, dated statistics/years, American spelling,
  awkward grammar, sections that say the same thing twice, overly long pages.
- Global sections appear at the bottom of most pages: `featured-insights` (4 global insight cards), `contact-form`,
  `social-banner` (Twitter/YouTube/LinkedIn strip). `message-banner` is a full-width blue CTA strip.
- Page content (what the CMS holds) is in `/home/ubuntu/linkfields/seed/data/pages/<file>.json`; the file name is the
  URL path with `/` replaced by `__` (home = `index.json`). Each page has `sections`, an ordered list of dynamic-zone
  blocks with `__component` (e.g. `sections.overview`, `services.flow-cards`). Navigation/footer/global insights are
  in `/home/ubuntu/linkfields/seed/data/global.json`. Design rules: `/home/ubuntu/linkfields/docs/DESIGN-SYSTEM.md`.
- The page/section inventory for the whole site is in `/home/ubuntu/linkfields/docs/review/inventory.txt`.

## How to look at pages (production site, CMS mode, port 3001)
Desktop, full page, sliced into 720-px-wide JPGs you can view with your image reader:
`python3 /home/ubuntu/linkfields/tools/shot.py <url-path> /tmp/review/<group-id>/<name>.png --base http://127.0.0.1:3001 --slice 1500`
→ writes `/tmp/review/<group-id>/<name>_0.jpg`, `_1.jpg`, …
Mobile: add `--width 390 --height 844 --slice 2400`.
Quote paths containing `&` (e.g. `'/solutions/erp-solutions/sap/service&more'`). Look at every page in your group on
desktop (all slices) and at least the 2 most important pages on mobile. Also read each page's JSON for exact wording.
You may `curl -s http://127.0.0.1:3001<path>` to check the HTML (title, meta description, H1, links).

## What to evaluate (for every section on every page in your group)
1. **Necessity** — does it move an enterprise buyer towards understanding the offer and contacting Linkfields? Is it
   on-message with the deck? If not, recommend removal.
2. **Duplication** — does the same message/section appear elsewhere on the same page or repeatedly across the site
   (e.g. identical value-plays/industries grids on many pages)? Recommend keeping it in one place or tailoring it.
3. **Accuracy & consistency** — names, taxonomy, numbers, URLs, product names, years must match the deck; flag
   contradictions (e.g. different years-of-experience figures, old service names, links pointing to old areas).
4. **Content quality** — generic/AI-sounding filler, vague claims without proof, long walls of text, typos, American
   spelling (British English required), headings that do not say anything, missing specifics (outcomes, examples,
   use cases, case studies, client proof, certifications, partner status).
5. **Visual/UX** — section order and rhythm, density, consistency with the unified tile model, empty/placeholder looking
   areas, image relevance/quality, readability, mobile layout, repeated identical backgrounds, page length.
6. **Conversion & SEO** — clear CTAs relevant to the page, H1 present and meaningful, title/meta description sensible.
7. **What is missing** that would make the page stand out (e.g. proof points, case studies, demo request, FAQs,
   architecture visuals, partner badges) — only where it would genuinely add value.

Classify: page verdict = keep | rework | merge | retire (with redirect target). Section action = keep | remove |
merge | rework | move | add. Priority: P1 (must fix: wrong, duplicated, damaging, confusing), P2 (should fix: quality),
P3 (nice to have).

## Output
1. A Markdown report at the exact path you were given: short summary, then per page a table
   `# | section (component · heading) | action | priority | issue | recommendation`, then group-level findings and
   "missing content" suggestions. Quote exact headings/text when you criticise them. Keep it crisp; no padding.
2. Your final structured answer (JSON matching the schema you were given) — the parent agent aggregates these.
