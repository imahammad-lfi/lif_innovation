# Linkfields website: rework brief for page-group content agents (9 Nov 2026)

You are rewriting a group of pages on the Linkfields corporate website (Next.js + Strapi, seeded from JSON). The client asked us to
**implement every recommendation of the website review**. Your group's pages, review report and output path are given in your task prompt.
Work only on the files you own. Your result must be finished, published locally, validated and visually checked.

## 1. Repository and what you may touch
- Repo: `/home/ubuntu/linkfields`. Dev site (local seed mode): `http://127.0.0.1:3000` (already running, do not restart it).
- Page documents you own live in `seed/custom/pages/<file>.json` (file name = path without leading slash, `/` → `__`; e.g. `/industries/bfsi` → `industries__bfsi.json`).
- You may **create/overwrite only the files listed in your prompt**, plus scratch files under `/tmp/lf-<group>/` and your report file.
- Do **not** edit code (`apps/**`), `seed/data/**` directly, `seed/custom/apply.py`, `seed/custom/deck.py`, `seed/custom/portfolio.json`,
  `seed/data/global.json`, redirects, or anyone else's pages. The parent agent owns navigation, footer, Home, global contact copy, redirects and components.
  If you need a code/component change or a redirect, put it in your result (`component_requests`, `redirects_needed`).
- Read freely: everything in the repo, especially the inputs in section 2.

## 2. Inputs (read these first)
1. `docs/review/WEBSITE-REVIEW-RECOMMENDATIONS.md`: the agreed recommendations (sections 3, 6 and 8 apply to every page).
2. Your group report(s) in `docs/review/` (named in your prompt): section-by-section action (keep/rework/merge/move/remove/add) and the
   recommended wording for every page in your group. **Implement every recommendation**, except the parts that need evidence only the client can give
   (see rule 3.3). Where a report proposes wording, prefer it.
3. `docs/CORPORATE-DECK-2026.md`: the client's 2026 corporate deck. The **only** source of company facts, product descriptions, value plays and commercial models.
4. `docs/review/COMPONENT-CATALOGUE.md`: every section component and its fields, with an example page using each. Use only these components and fields.
5. The current page docs in `seed/custom/pages/` and reference copies of retired pages in `seed/custom/retired/` (used where your prompt says to merge or move content).
6. Optional: `docs/DESIGN-SYSTEM.md` (visual standards), `docs/SECTION-CONTRACT.md`.

## 3. Rules that apply to every page
3.1 **Language.** British English (organisation, optimise, specialise, programme for a business programme, centre). Sentence-case headings. No exclamation marks,
    no hype ("cutting-edge", "world-class", "seamless", "unlock the power"). Write for an enterprise buyer: concrete, specific, short sentences.
3.2 **Facts.** Company facts only from the deck, or from existing page text that is consistent with the deck. Never invent clients, case studies, metrics,
    percentages, headcounts, certifications, awards, partner tiers, SLAs, response times or dates. Remove these unsupported claims wherever they appear:
    "10x faster operational growth", "60% savings", any "guaranteed" accuracy/ROI/results, "zero downtime", unconditional "24/7", "We are a leading <industry> company".
    The deck's qualified metrics (95%+, up to 6×, up to 40%, up to 50%) belong on Home only: do not repeat them on your pages.
    Vendor names: say "platforms we deliver" or "we work with", not "partner", unless the deck says partner (the deck says "SAP Partner").
3.3 **Missing evidence.** Where a report asks for proof the client must supply (case studies with outcomes, product screenshots, certificates,
    leadership bios, partner tiers, office addresses), do **not** fake it. Write capability-led depth instead: what we do, how an engagement runs,
    deliverables and artefacts, governance and quality gates, which Linkfields product or accelerator is used, buyer questions answered.
    An "example engagement pattern" (steps and deliverables, no client names or numbers) is allowed. List what's needed in `client_input_needed`.
3.4 **Sections to drop.** No `sections.social-banner`. No `sections.featured-insights` (allowed only on the hubs `/services`, `/solutions`, `/industries`,
    `/products-and-accelerators`). No legacy filler: `industries.building-tools` blocks, the "listeners and leaders" and "tuned to precision" texts, `services.superpowers`,
    duplicate service directories, duplicated process or benefit blocks, sibling catalogues that repeat a hub. No full eight-card `sections.industries-grid` except on `/industries`.
    A `sections.message-banner` only if it offers a specific next step (book a demo, request an assessment) and **never directly above the contact form**.
3.5 **One contact form, last.** Every page ends with exactly one `sections.contact-form`:
    `{"__component":"sections.contact-form","anchorId":"get-in-touch","heading":"Get in touch","subheading":"<contextual question, ≤ 8 words, e.g. Discuss your SAP S/4HANA programme>","nextStepsTitle":"","nextSteps":[],"layout":"section","theme":"dark"}`.
3.6 **Hero and tabs.** The first section is `sections.page-hero`: `title` ≤ 6 words (this is the page H1), `subtitle` one sentence ≤ 24 words, an existing
    `backgroundImage`, and `anchorLinks` with 4–6 short Title Case labels (≤ 3 words), whose `targetId` values exactly equal `anchorId`s of sections on the page.
    The last tab is `{"label":"Get in touch","targetId":"get-in-touch"}`. Give every tab-target section a kebab-case `anchorId`.
3.7 **Length.** Use the template for your page type (section 4). Aim for ≤ 6,500 px at 1,440 px desktop (the check tool prints the height). Depth comes
    from specific, well-structured content, not from more sections.
3.8 **SEO.** `seo.metaTitle` ≤ 60 characters, pattern `<Topic> | Linkfields`; `seo.metaDescription` 120–160 characters, specific, British English;
    `keywords` a short comma list; `canonicalUrl` ""; `noIndex` false.
3.9 **Links.** Internal links only to URLs in the URL map (section 5) or anchors on them. External links only to official vendor sites when useful (open in new tab).
3.10 **Media.** Only files that exist under `seed/assets/` (check with `ls`). Reference them as `{"__media":"<path under seed/assets>","alt":"<meaningful alt>"}`.
    Prefer images already used on the page. Heroes in `seed/assets/custom/hero-*.jpg`; product logos `custom/logos/<slug>.png`; platform logos `custom/platforms/*.png`;
    industry portraits `custom/industries/ind-*.jpg`. Never use client logos (e.g. Coca-Cola, CipherWave) to represent vendors or tools.
3.11 **Visual consistency.** Prefer the unified tile model `sections.feature-tiles` (variants `default` / `portfolio` / `compact`; `tone` `navy` / `ink`, alternate
    tones between adjacent tile sections; `columns` 2–5; item `accent`). Accent colours: Digital Transformation **orange**, Intelligent Enterprise Platforms **blue**,
    Data & AI **purple**, Cyber Security **teal**, Talent Advisory & GCC **yellow**. Use product logos (white plates) through `items[].logo` or `logos` + `logosLabel`.
    Headings may highlight one phrase with `*phrase*` (orange). Keep paragraphs ≤ 3 sentences; use `bullets` (newline-separated) for lists.

## 4. Page templates (section flow; Hero first, contact form last)
- **Portfolio pillar:** hero → overview (buyer outcome) → one sub-service grid (links to every sub-service) → relevant value plays (`sections.value-plays`, 1–3 plays) →
  Linkfields IP and accelerators (logos) → how we deliver / engagement models → compact "where this applies" (tailored industry use cases, feature-tiles compact) → contact. 8–9 sections.
- **Sub-service:** hero → buyer trigger and objectives (overview) → one "what we deliver" grid → delivery approach / example engagement pattern or architecture →
  relevant Linkfields IP or accelerator (logo) → secure-by-design and governance → buyer questions (accordion) and engagement models → contact. About 7–9 sections.
- **Product:** hero → problem and fit (who it is for) → capabilities → how it works / workflow → one use case → enterprise fit (deployment, security, integrations,
  licensing: licence, subscription or SaaS, with or without services) → demo or enquiry (contact form subheading "Request a <product> demo"). 6–7 sections.
- **Accelerator:** hero → what it accelerates → what is pre-built and what is tailored → artefacts and outputs → time to value and readiness prerequisites → 1–2 related items → contact. About 6 sections.
- **Industry:** hero → sector context (+ sector sections with anchors where merged) → portfolio map (which of the five portfolios apply, how) → visible workflow tiles
  "What we deliver" (replace carousels) → selected Linkfields products and accelerators → buyer questions or delivery approach → contact. About 7 sections.
- **Hub:** hero → overview → one tile grid of children → one supporting proof or approach block → (featured insights allowed) → contact.

## 5. URL map (the whole site after this round)
Home `/` · `/services` · `/solutions` · `/products-and-accelerators` · `/industries` · `/company/about-us` · `/company/our-approach` · `/company/blog` ·
`/company/news-and-articles` · `/careers` · `/contact-us` · `/privacy-policy` · `/terms-of-use` · `/cookies-policy`
**Services:** `/services/digital-transformation` (+ `/app-modernisation`, `/automation-rpa`, `/integration-services`, `/whatsapp-omnichannel`, `/quality-engineering`, `/cloud-services`) ·
`/services/intelligent-enterprise-platforms` (+ `/sap-s4hana`, `/microsoft-dynamics-365`, `/odoo`, `/zoho`, `/salesforce`, `/platform-migration-ams`) ·
`/services/data-ai` (+ `/ai-strategy-governance`, `/agentic-ai-genai`, `/data-platforms-analytics`, `/machine-learning`) ·
`/services/cyber-security` (+ `/ai-security-grc`, `/cloud-security-iam`, `/exposure-validation-appsec`, `/security-operations`) ·
`/services/talent-advisory-gcc` (+ `/technology-advisory`, `/specialist-talent-managed-teams` with anchors `#staff-augmentation` and `#managed-teams`, `/gcc-strategy-setup`, `/gcc-build-operate-transfer`).
Linkworks is listed under both DT and IEP (shared IP).
**Solutions (the five strategic value plays):** `/solutions/ai-code-assurance` · `/solutions/modernisation-programme-assurance` · `/solutions/regulated-cyber-readiness` ·
`/solutions/intelligent-operations` · `/solutions/capability-centres-embedded-ip`.
**Products:** `/products-and-accelerators/linkworks`, `/testoriumz`, `/vajrax`, `/vectorx`, `/ai-governance`, `/textiq`, `/finsight`, `/edupilot`.
**Accelerators:** `/products-and-accelerators/predictive-analytics-suite`, `/digital-twin-suite`, `/intelligent-workflow-automation`, `/power-bi-ai-ml`, `/delivery-accelerators`.
**Industries:** `/industries/telecom`, `/bfsi` (anchors `#banking`, `#insurance`, `#fintech`), `/healthcare-pharma`, `/retail-fmcg-cpg`, `/manufacturing`,
`/energy-mining` (anchors `#mining`, `#oil-gas`), `/public-sector`, `/education`.
Retired (do not link): everything under `/solutions/erp-solutions/...`, `/explore-more/...`, `/industries/banking|insurance|fintech|mining|oil-gas|fmcg`,
`/services/talent-advisory-gcc/staff-augmentation|managed-teams`. External product site: `https://testoriumz.com` (allowed on testoriumz pages).

## 6. Reference data
**Products** (deck): Linkworks: composable enterprise applications (microservices, REST APIs, composable UI, cloud-native, DevSecOps; "where ERP/CRM does not fit") ·
testoriumz: continuous quality engineering (low-code testing, AI root-cause analysis, CI/CD integration) · VajraX: AI-powered exposure validation of the external attack surface ·
VectorX: code scanning and supply-chain analysis, repo to release · AI Governance: one gateway for every AI tool: guardrails, cost and tracing (built on Portkey + Opik; describe
the Linkfields layer honestly) · textIQ: document intelligence: search and insight across unstructured content · FinSight: conversational analysis and reporting over financial data ·
EduPilot: rapid course creation for education and corporate learning. All are available by licence, subscription or SaaS, with or without a Linkfields services engagement.
**Accelerators** (deck): Predictive Analytics Suite (churn and segmentation, demand forecasting, fraud and anomaly detection, loan default prediction) · Digital Twin Suite (equipment
failure prediction, forecasting simulation, inventory optimisation, real-time monitoring) · Intelligent Workflow Automation (workflow automation, AI orchestration, application
integration, underwriting optimisation) · Power BI + AI/ML (AI/ML in Power BI, predictive dashboards, risk-scoring visuals) · Delivery accelerators (Modernisation & Integration
Toolkit, Migration & regression packs, Automated Testing & Release Assurance Packs, Cyber-Safe Delivery, Regulatory & Compliance Readiness).
**Value plays** (deck slide 15): trigger → outcome → IP. 1 AI Code Assurance (orange) · 2 Modernisation & Programme Assurance (blue) · 3 Regulated Cyber Readiness (teal) ·
4 Intelligent Operations (purple) · 5 Capability Centres with Embedded IP (yellow). Exact text in the deck file.
**Commercial models** (deck slide 16): Fixed Price · Time & Materials · Managed Service · Dedicated Team · Outcome-Based.
**Industry ↔ IP map:** Telecom: Linkworks, testoriumz, VectorX, Predictive Analytics (churn) · BFSI: textIQ, FinSight, VajraX, Intelligent Workflow Automation (underwriting),
Predictive Analytics (fraud, loan default) · Healthcare & Pharma: Linkworks, textIQ, Intelligent Workflow Automation · Retail, FMCG & CPG: Linkworks, Predictive Analytics
(demand forecasting), Digital Twin Suite (inventory) · Manufacturing: Linkworks, Digital Twin Suite, Predictive Analytics · Energy & Mining: Linkworks, Digital Twin Suite,
Predictive Analytics, Delivery accelerators · Public Sector: Linkworks, textIQ, AI Governance, Intelligent Workflow Automation · Education: EduPilot, textIQ.
**Company:** headquartered in South Africa; Offshore Delivery Centre in India; presence UAE (Middle East), United Kingdom (Europe), USA (North America), Australia (Asia Pacific).
20+ years of industry leadership experience; #35 FT & Statista Africa Growth Ranking 2026; Level 1 B-BBEE Contributor. Sales enquiries: sales@linkfields.com; general: info@linkfields.com.

## 7. How to work (mandatory loop)
1. Read your inputs, then plan the new section list per page (write it at the top of your report).
2. Write the page JSON (valid JSON, UTF-8, 1-space or 2-space indent). Keep `title` and `path` correct.
3. Publish and validate: `cd /home/ubuntu/linkfields && python3 tools/publish_page.py <file.json> [more.json]`. It must print `validate <file>: OK`.
   (This writes only your pages into `seed/data/pages` and refreshes the dev cache. Do not run `seed/custom/apply.py` without arguments.)
4. Check the rendered page: `python3 tools/page_check.py <path> [<path> ...]`. It must print OK for 1440 and 390, with no "review wording" hits.
   (A first request after publishing can be stale; re-run once if a removed section still shows.)
5. Look at it: `python3 tools/shot.py <path> /tmp/lf-<group>/<name>.png --slice 1800` and `python3 tools/shot.py <path> /tmp/lf-<group>/<name>-m.png --width 390 --height 844 --slice 2400`,
   then view the JPG slices (`<name>_0.jpg`, …). Fix anything that looks broken, empty, cramped, repetitive or off-brand. Iterate until the page looks polished.
6. Write your report (path in your prompt): per page, the old and new section lists, what you implemented from the review, and anything deferred and why.

## 8. Result (return JSON matching the schema in your prompt)
`group_id`, `pages` (url, file, status `done|partial|failed`, `sections_before`, `sections_after`, `height_desktop_px`, `summary`), `redirects_needed`
([{source, destination}]), `component_requests` ([strings]), `client_input_needed` ([strings]), `report_path`, `notes`.
