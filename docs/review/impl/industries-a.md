# Industries A implementation report

## Planned and implemented section flow

- `/industries`: hero → integrated-partner overview → required eight-industry photo grid → three strategic value plays → example delivery approach and artefacts → contextual contact.
- `/industries/telecom`: hero → sector context → five-portfolio map → four visible workflows → selected products and accelerator → example engagement pattern → contextual contact.
- `/industries/bfsi`: hero → expanded financial-services context with sector routes → five-portfolio map → Banking workflow tiles (`banking`) → Insurance workflow tiles (`insurance`) → Fintech workflow tiles (`fintech`) → selected products with separate accelerator links → controlled engagement pattern → one BFSI contact.
- `/industries/healthcare-pharma`: hero → provider/pharma context → five-portfolio map → four visible workflows with equal pharma depth → selected products and accelerator → controlled engagement pattern → contextual contact.
- `/industries/retail-fmcg-cpg`: hero → expanded retailer/consumer-goods context → five-portfolio map → four visible workflows → selected product and accelerators → example engagement pattern → contextual contact.

## Scope and common changes

Edited only the five owned JSON documents, this report and scratch under `/tmp/lf-industries-a/`. The mandated `tools/publish_page.py` copied only named pages to the local seed data; no unrestricted seed application, code change, navigation change or redirect modification was made.

All pages have a first-section hero with a short H1, one-sentence subtitle, existing media and four to six valid tab targets. Each ends with exactly one explicit `Get in touch` form and contextual subheading. SEO titles follow `<Topic> | Linkfields`; descriptions are 120–160 characters, with blank canonicals and `noIndex: false`. The copy uses British English, concrete workflows, the fixed portfolio taxonomy and portfolio colours. Product logos remain on white plates; reusable accelerators are identified separately. Adjacent tile sections alternate navy and ink.

Removed every owned social strip, generic message banner, legacy building-tools block and specialisation carousel. Removed global insight fallbacks, including from the hub: no approved, relevant article with a permitted actual article destination was supplied. No historical ranking card is presented as industry evidence. Specific conversion questions now frame delivery scope or the contextual final form instead of a second enquiry banner.

No client names, measured outcomes, automatic compliance/fraud-prevention guarantees, clinical outcomes, network-equipment claims, regulatory certifications or invented architecture/screenshots were added. The evidence recommendations are implemented as capability-led depth and clearly labelled example engagement patterns, with the required client evidence listed below.

## Per-page changes

### `/industries`

**Before (6):** `sections.page-hero` — Industries; `sections.industries-grid` — Industries we know deeply; generic `sections.message-banner`; inherited `sections.featured-insights`; inherited `sections.contact-form`; inherited `sections.social-banner`.

**After (6):** `sections.page-hero` — Industries; `sections.overview` — One partner for industry-specific outcomes (`overview`); `sections.industries-grid` — Industries we know deeply (`industries`); `sections.value-plays` — Start with the business problem (`business-problems`); `sections.feature-tiles` — From industry priority to delivery scope (`delivery-approach`); `sections.contact-form` — Discuss your industry priorities (`get-in-touch`).

Kept the hero and all eight required dark photo tiles, including Public Sector and Education. Rewrote each card around distinct workflows rather than interchangeable transformation claims. Expanded BFSI as Banking, Insurance and Fintech. Added the integrated services + software + accelerators proposition, linked all five portfolios and made secure-by-design delivery explicit. Added three deck-derived value plays: Modernisation & Programme Assurance, Intelligent Operations and Regulated Cyber Readiness. The supporting approach tiles connect these to delivery scope, IP and artefacts, with value-play links rather than a duplicate services catalogue. Approved mini-cases and current industry articles remain evidence-dependent.

### `/industries/telecom`

**Before (8):** hero — Telecom; overview — Superior channels through robust terminals; building-tools — Building tools that endure; generic message banner; specialisation carousel — Our Specialization; inherited insights; inherited contact; inherited social strip.

**After (7):** hero — Telecom; overview — Connect service journeys with telecom operations (`overview`); compact five-portfolio map (`portfolio-map`); four visible workflow tiles — What we deliver (`what-we-deliver`); Telecom software and accelerators (`software-accelerators`); example engagement pattern — Which service journey needs to work better? (`delivery-approach`); contextual contact.

Replaced opaque legacy copy and title-only metadata. Replaced the purple tunnel with an existing approved service-channel hero (`custom/hero-whatsapp-omnichannel.jpg`), aligning the imagery with service operations rather than network equipment. Added the five exact portfolios, including Data & AI, Cyber Security and delivery-team options. The visible workflows cover billing/reconciliation exceptions, customer-service hand-offs, legacy application/API modernisation and churn/segmentation insight. Each states trigger, workflow, controls and measures to agree. Selected IP is Linkworks, testoriumz, VectorX and Predictive Analytics Suite, with the review's supplemental VajraX fit explicitly scoped. The page distinguishes enterprise integration from unconfirmed BSS/OSS or network-equipment engineering.

### `/industries/bfsi`

**Before (9):** hero — BFSI; overview — Connected financial services, built on trust; three child-sector cards — Specialist focus across financial services; building-tools — Build secure, connected financial services; generic message banner; six-item specialisation carousel; inherited insights; inherited contact; inherited social strip.

**After (9):** hero — BFSI; expanded overview with direct sector links (`overview`); compact five-portfolio map (`portfolio-map`); Banking: modernise operations without losing control (`banking`); Insurance: connect claims, documents and service (`insurance`); Fintech: connect payment journeys and assure product change (`fintech`); Software and accelerators for financial operations (`software-accelerators`); concise controlled engagement overview (`delivery-approach`); one contextual BFSI contact.

Merged the useful retired Banking, Insurance and Fintech topics into three directly addressable sections, each with three visible outcome tiles. Sector links and hero tabs now use the exact parent anchors rather than retired child URLs. The previous three-card sector directory was absorbed into the substantive modules to avoid another layer of navigation.

Banking covers servicing/reconciliation, modernisation/release assurance and fraud signals/control evidence. Insurance covers claims/document triage, policy/billing/service integration and human-reviewed underwriting. Fintech covers payment integration/reconciliation, quality/security gates and governed analytics/AI. Across these modules, all six umbrella concepts are retained and grouped without repeating a shared carousel. Removed personalised advice, investment, automatic fraud prevention/compliance, blockchain and P2P assertions.

Primary product tiles show textIQ, FinSight and VajraX. Intelligent Workflow Automation and Predictive Analytics Suite are separately labelled reusable-accelerator links with workflow-specific descriptions. Linkworks, testoriumz, VectorX and AI Governance are linked in the relevant sector modules, not repeated as a supplementary product directory. AI Governance is honestly described as the Linkfields gateway built on Portkey and Opik. Human decision rights, access boundaries, model validation, exception handling and jurisdiction-specific review are explicit. The shared map and engagement block were compacted in response to the rendered length while preserving all three sector modules. BFSI is slightly above the 6,500 px desktop aim because it retains three substantial merged sectors; this is not a check failure.

### `/industries/healthcare-pharma`

**Before (8):** hero — Healthcare & Pharma; overview — Connected care. Smarter pharmaceutical operations.; building-tools — Digital tools for care and operational clarity; generic message banner; five-item specialisation carousel; inherited insights; inherited contact; inherited social strip.

**After (7):** hero; concise two-audience overview (`overview`); five-portfolio delivery map (`portfolio-map`); four visible workflows (`what-we-deliver`); Software and accelerators for connected operations (`software-accelerators`); controlled engagement pattern — Which patient or supply workflow needs to connect? (`delivery-approach`); contextual contact.

Retained the provider/pharma distinction and privacy/human-oversight framing. Removed the unsupported patient-care outcome promise and narrow generic digital-health language. The portfolio map explains integration, enterprise operations, governed Data & AI, application/identity controls and specialist teams. Four equally visible workflows cover patient enquiries/appointments, health application/data integration, pharmaceutical procurement/inventory/distribution and controlled documents/approvals. Removed the carousel's reused hero and banking-derived stock art rather than replacing it with invented implementation evidence. Linked Linkworks, textIQ and Intelligent Workflow Automation; added the reviewed supplemental testoriumz fit and explicitly distinguished software release testing from clinical or pharmaceutical product validation. Clinical, GxP and interoperability assertions remain excluded pending evidence.

### `/industries/retail-fmcg-cpg`

**Before (8):** hero; overview — Connect consumer insight with everyday operations; building-tools — Build connected consumer experiences; generic message banner; five-item specialisation carousel; inherited insights; inherited contact; inherited social strip.

**After (7):** hero; expanded retailer/consumer-goods overview (`overview`); five-portfolio delivery map (`portfolio-map`); four visible workflows (`what-we-deliver`); Software and accelerators for demand and fulfilment (`software-accelerators`); example engagement pattern — Where do demand, stock and journeys disconnect? (`delivery-approach`); contextual contact.

Kept the fixed Retail, FMCG & CPG taxonomy and existing relevant retail hero. Expanded FMCG/CPG on first body mention and distinguished retailer omnichannel needs from brand/distributor operations. The four visible workflows cover demand/replenishment planning, inventory/fulfilment exceptions, retailer/distributor order connectivity and CRM-led commerce/service journeys. Each identifies inputs, decision ownership, controls and operational measures. Marketing survives only as approved, consent-aware CRM engagement, not an unproven precision/growth claim. Linked Linkworks, Predictive Analytics Suite and Digital Twin Suite, plus the reviewed supplemental Intelligent Workflow Automation accelerator. Forecast evaluation, data readiness and the distinction between technology contribution and pricing/promotions are explicit.

## Publication, rendered checks and visual review

`tools/publish_page.py` printed `validate <file>: OK` for all five files and `revalidate: 200`. BFSI was republished and validated after each content refinement. Initial first-request stale Telecom content was detected and rerun; the subsequent desktop/mobile checks were clean. Final QA logs are under `/tmp/lf-industries-a/`.

The required desktop captures use `--slice 1800`; mobile captures use `--width 390 --height 844 --slice 2400`. Full PNGs and JPG slices use stems `industries`, `telecom`, `bfsi`, `healthcare-pharma` and `retail-fmcg-cpg`, with `-m` for mobile. Screenshot slices were checked for text wrapping, complete workflows, photo-grid continuity, product logos, contact and footer layout. The shared form/footer changed during the group work, so a final two-width check was also run after that refresh. No enquiry was submitted.

A separate read-only BFSI tab test reached `banking`, `insurance` and `fintech` at 1,440 and 390 px, with all headings below the fixed header and no document-wide overflow. The docking state and offsets were inconsistent during animated scrolling, and duplicate hero/pinned bars appeared after return-to-top screenshot capture. This is handed to the shared component owner; the sections and target IDs themselves exist and are reachable.

## Client input needed

1. Approved named or anonymised mini-cases for the hub and each of Telecom, Banking, Insurance, Fintech, Healthcare/Pharma and Retail/consumer goods: starting problem, systems/interfaces, Linkfields scope, controls, measured baseline/result, period and publication permission.
2. Approved workflow/product walkthroughs and redacted architecture or dashboard artefacts showing the named IP in each sector. The deck establishes capability fit, not deployed sector products.
3. Telecom scope confirmation before naming BSS/OSS, network modernisation or network-equipment engineering; provide actual integrations and measured service/billing/release evidence.
4. Financial-services jurisdiction-specific requirements, reviewer decision rights, privacy/access models, model-validation and audit-evidence examples. Supply separate proof before any blockchain/P2P or financial-advice claim is reconsidered.
5. Healthcare/pharma consent/access and integration boundaries, actual provider/pharma administrative or supply cases, and separate proof for named health interoperability standards or validated GxP/clinical systems.
6. Retail channel/SKU scope and forecasting evaluation period/metric, baseline stock/service/planning measures and attributable results; separate technology contribution from pricing/promotions.
7. Approved current industry articles with actual article destinations for the Industries hub. Current ranking source, public LinkedIn URL, certificate validity and response commitments remain global/client-owner responsibilities; this group does not elevate unsourced credentials or response promises.

## Shared-component and migration handoffs

- Retest and harden sticky-tab docking, scroll-spy reset and return-to-top visibility. Capture exposed duplicate hero/pinned bars; the BFSI anchor test also showed inconsistent dock opacity and animation settling.
- Make the form's Area of interest optional, support a contextual CTA such as “Discuss your priorities”, and preserve the page path plus Banking/Insurance/Fintech context in the enquiry. The JSON catalogue has no fields for these behaviours. Phone is now visibly optional, the message is multi-line, and the shared refresh added usable privacy/NDA/next-step copy.
- The common footer still displays certification/membership badge assets. Their entity, scope and validity need global-owner/client verification; no owned-page badge was added.
- Permanent redirects needed after the parent verifies the destination modules: `/industries/banking` → `/industries/bfsi#banking`; `/industries/insurance` → `/industries/bfsi#insurance`; `/industries/fintech` → `/industries/bfsi#fintech`. Update header sector chips, sitemap and any other incoming internal links, preserving useful query parameters. Do not restore standalone sector pages or redirect the industry hub/detail pages owned by this group.
