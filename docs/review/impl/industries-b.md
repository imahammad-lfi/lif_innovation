# Industry implementation — industries-b

## Planned and delivered section flows

- **Manufacturing:** hero → factory-to-enterprise context → five-portfolio delivery map → four visible workflows → selected software and accelerators → delivery approach and acceptance artefacts → contextual contact.
- **Energy & Mining:** hero → Mining / Oil & Gas context and direct sector routes → five-portfolio delivery map → Mining workflows (`#mining`) → Oil & Gas workflows (`#oil-gas`) → selected software and accelerators → delivery boundaries and acceptance artefacts → contextual contact. Parent workflows are consolidated into the sector modules, not repeated.
- **Public Sector:** hero → citizen/agency context → five-portfolio delivery map → four visible workflows → selected software and accelerators → delivery, governance and procurement discussion → contextual contact.
- **Education:** hero → course-creation/campus context → five-portfolio delivery map → four visible workflows → EduPilot and textIQ → delivery approach and educator/staff acceptance → contextual contact.

## Scope and completion

All four owned JSON documents are published to the local seed-mode site through `tools/publish_page.py`. All validate OK and pass `tools/page_check.py` at 1,440 px and 390 px without review-wording hits. Every desktop and mobile JPG slice has been visually reviewed. Only the four permitted page source files, this report and scratch files under `/tmp/lf-industries-b/` were edited; the publish tool updated only the corresponding published seed pages. No code, global data, navigation, redirects or other agents’ pages were edited.

Content uses British English, sentence-case headings, 4–6 valid short hero tabs, existing checked assets, deck-derived IP and commercial models, compliant SEO and exactly one final contextual contact form. Company metrics, invented cases, compliance assurances and unsupported deployment claims are absent.

## Manufacturing

URL: `/industries/manufacturing`  
Source: `seed/custom/pages/industries__manufacturing.json`  
Sections: 8 → 7. Final rendered height: **6,269 px desktop**, **11,205 px mobile**.

### Before

1. `sections.page-hero · Manufacturing`
2. `sections.overview · Revolutionizing Manufacturing through smart solutions`
3. `industries.building-tools · Building tools that endure`
4. `sections.message-banner · We are listeners and leaders. Working together to take tomorrow’s challenges`
5. `industries.specialization-list · Our Specialization`
6. `sections.featured-insights · `
7. `sections.contact-form · `
8. `sections.social-banner · `

### After

1. `sections.page-hero · Manufacturing`
2. `sections.overview · Connect the factory with the enterprise` — `#overview`
3. `sections.feature-tiles · Five portfolios, shaped around your work` — `#portfolio-map`
4. `sections.feature-tiles · What we deliver` — `#what-we-deliver`
5. `sections.feature-tiles · Manufacturing software and accelerators` — `#software-accelerators`
6. `sections.feature-tiles · Start with a production or maintenance constraint` — `#delivery-approach`
7. `sections.contact-form · Get in touch` — `#get-in-touch`

### Implemented recommendations

- Rewrote the hero and metadata to describe Linkfields as a technology provider serving manufacturers, not a manufacturing company. Retained the factory hero asset.
- Replaced “Building tools that endure” and the manual-billing/precision filler with exact five-portfolio names, deck colours and valid portfolio routes.
- Consolidated eight specialisations into production/business planning; execution visibility and ERP integration; quality records and exceptions; asset maintenance and supply insight. Every workflow states an input/trigger, human control or system boundary, output and measure to agree.
- Added selected IP with product/accelerator labels and white product logo plates. Explicitly distinguished testoriumz software testing from manufactured-product inspection.
- Replaced unsupported track-record, compliance and downtime promises with an example engagement pattern, workflow map, integration architecture, validation plan and release evidence. Shop-floor interfaces, equipment control, industrial safety and OT capability are not assumed.
- Removed the premature banner, generic insights and social strip. Merged its specific next-step question and in-page enquiry link into the delivery block; kept one contextual final form.

### Evidence and deferred work

Client cases and real product/operational artefacts were not supplied. Capability-led workflow detail, example engagement patterns, governance gates and acceptance artefacts replace fabricated proof. Relevant client inputs are listed below. Shared form/footer/tab issues are outside this group’s file ownership and are handed to the parent.

## Energy & Mining

URL: `/industries/energy-mining`  
Source: `seed/custom/pages/industries__energy-mining.json`  
Sections: 9 → 8. Final rendered height: **6,545 px desktop**, **12,176 px mobile**.

### Before

1. `sections.page-hero · Energy & Mining`
2. `sections.overview · Connect assets, data and operations`
3. `solutions.how-can-we-help · Focused expertise across resource operations`
4. `industries.building-tools · Build intelligence into resource operations`
5. `sections.message-banner · We are listeners and leaders. Together, let’s take on tomorrow’s energy and mining challenges.`
6. `industries.specialization-list · Our Specialization`
7. `sections.featured-insights · `
8. `sections.contact-form · `
9. `sections.social-banner · `

### After

1. `sections.page-hero · Energy & Mining`
2. `sections.overview · Connect assets, data and operations` — `#overview`
3. `sections.feature-tiles · Five portfolios, shaped around your work` — `#portfolio-map`
4. `sections.feature-tiles · What we deliver for mining` — `#mining`
5. `sections.feature-tiles · What we deliver for Oil & Gas` — `#oil-gas`
6. `sections.feature-tiles · Resource-operations software and accelerators` — `#software-accelerators`
7. `sections.feature-tiles · Make the operating boundary explicit` — `#delivery-approach`
8. `sections.contact-form · Get in touch` — `#get-in-touch`

### Implemented recommendations

- Kept Energy & Mining and its existing hero. Named Mining and Oil & Gas in the sector context; did not extend the offer to utilities, renewables or upstream operations.
- Replaced redirecting child-page cards with direct Mining/Oil & Gas links in the overview and hero tabs. Created `#mining` and `#oil-gas` on visible workflow sections.
- Merged Mining’s maintenance/material/monitoring content into three visible tiles: asset health and maintenance planning; materials, inventory and logistics; reporting and exception review. Removed patronising “non-IT” copy and unqualified real-time, safety, no-downtime and savings assurances.
- Merged Oil & Gas into four visible workflows: terminal integration; ERP/operational integration; fuel commerce/retail applications; asset/operational analytics. Preserved midstream/downstream scope. Removed unverified IS-Oil module/version and experience claims, profit/market-share/sustainability promises and implied terminal package or availability claims.
- Consolidated the umbrella’s four recommended parent-level workflow concepts into those sector modules, avoiding a duplicate parent grid. Kept one concise five-portfolio map.
- Added the brief’s Linkworks, Digital Twin Suite, Predictive Analytics Suite and Delivery accelerators mapping. Added contextual Power BI + AI/ML and testoriumz links from the selected IP cards as requested by the child reviews.
- Specified usable history, source freshness, human review, model validation, authorised interfaces, configured versus tailored components and enterprise IT versus process-control responsibilities.
- Removed filler, news and social blocks; kept distinct sector enquiries pointing to the single final form. Reduced the first rendered desktop version from 7,464 px to the final measured height by using compact visible tiles and removing duplicate notes.

### Evidence and deferred work

Client cases and real product/operational artefacts were not supplied. Capability-led workflow detail, example engagement patterns, governance gates and acceptance artefacts replace fabricated proof. Relevant client inputs are listed below. Shared form/footer/tab issues are outside this group’s file ownership and are handed to the parent.

## Public Sector

URL: `/industries/public-sector`  
Source: `seed/custom/pages/industries__public-sector.json`  
Sections: 8 → 7. Final rendered height: **6,240 px desktop**, **10,980 px mobile**.

### Before

1. `sections.page-hero · Public Sector`
2. `sections.overview · Public services designed around people`
3. `industries.building-tools · Connected services. Accountable operations.`
4. `sections.message-banner · We are listeners and leaders. Working together to make public services clearer, connected and secure.`
5. `industries.specialization-list · Our specialisation`
6. `sections.featured-insights · `
7. `sections.contact-form · `
8. `sections.social-banner · `

### After

1. `sections.page-hero · Public Sector`
2. `sections.overview · Public services designed around people` — `#overview`
3. `sections.feature-tiles · Five portfolios, shaped around your work` — `#portfolio-map`
4. `sections.feature-tiles · What we deliver` — `#what-we-deliver`
5. `sections.feature-tiles · Software for accountable public services` — `#software-accelerators`
6. `sections.feature-tiles · Start with a citizen journey or agency workflow` — `#delivery-approach`
7. `sections.contact-form · Get in touch` — `#get-in-touch`

### Implemented recommendations

- Retained “Public services designed around people”; rewrote the hero around citizen requests, agency workflows and secure-by-design delivery.
- Replaced overlapping portal/automation/data cards with the exact five-portfolio map and valid links.
- Replaced the hidden carousel with four visible workflows: citizen application/status; case/document ownership; controlled agency integration; service-demand/resource planning. Removed reused hero and banking-derived illustrations from the body.
- Made language/accessibility discovery, assisted-channel escalation, identity verification, staff decision rights, record controls and reviewable data sharing explicit. No WCAG level, records-law compliance, government accreditation or autonomous public decision is claimed.
- Added Linkworks, textIQ, Intelligent Workflow Automation and AI Governance, including the honest Linkfields layer built on Portkey and Opik. Explained approved sources and human-review boundaries.
- Added delivery/procurement discussion, service blueprint, responsibility matrix, proposed architecture, acceptance checks, South Africa HQ and India delivery-centre context from the deck. Did not publish unverified tender eligibility, a fabricated procurement pack or current certificate evidence.
- Removed the intervening banner, unrelated insights and social strip; moved the purpose-led enquiry into delivery and the single final contextual form.

### Evidence and deferred work

Client cases and real product/operational artefacts were not supplied. Capability-led workflow detail, example engagement patterns, governance gates and acceptance artefacts replace fabricated proof. Relevant client inputs are listed below. Shared form/footer/tab issues are outside this group’s file ownership and are handed to the parent.

## Education

URL: `/industries/education`  
Source: `seed/custom/pages/industries__education.json`  
Sections: 8 → 7. Final rendered height: **6,182 px desktop**, **10,914 px mobile**.

### Before

1. `sections.page-hero · Education`
2. `sections.overview · Connected learning. Simpler campus operations.`
3. `industries.building-tools · Digital tools for learning and campus life`
4. `sections.message-banner · We are listeners and leaders. Working together to connect learning, student services and campus operations.`
5. `industries.specialization-list · Our specialisation`
6. `sections.featured-insights · `
7. `sections.contact-form · `
8. `sections.social-banner · `

### After

1. `sections.page-hero · Education`
2. `sections.overview · Connected learning. Simpler campus operations.` — `#overview`
3. `sections.feature-tiles · Five portfolios, shaped around your work` — `#portfolio-map`
4. `sections.feature-tiles · What we deliver` — `#what-we-deliver`
5. `sections.feature-tiles · EduPilot and document intelligence` — `#software-accelerators`
6. `sections.feature-tiles · Start with a course-creation or campus workflow` — `#delivery-approach`
7. `sections.contact-form · Get in touch` — `#get-in-touch`

### Implemented recommendations

- Rewrote the hero around EduPilot and campus operations. Retained existing education imagery and narrowed product claims to deck-supported rapid course creation.
- Removed “Instant” capitalisation, unverified learner support/material grounding and any inference of a full LMS or improved learning outcomes.
- Replaced overlapping category cards with five exact portfolios and moved EduPilot into its own prominent product panel.
- Replaced the carousel with four visible workflows: educator-reviewed course creation; admissions/support hand-offs; administrative records/approvals; controlled campus integration/analytics. Each has input/context, responsible staff, output or control and an agreed measure.
- Added white-plate EduPilot and textIQ tiles following the brief’s education-IP map. Kept a visible route to the EduPilot product page for a product walkthrough; did not promise an unconfirmed live demo. Optional Linkworks/AI Governance/workflow-accelerator campus tiles were not added because product fit is unconfirmed.
- Added educator/staff acceptance, supported-input/output review, data and deployment boundaries, course preparation or campus operational measures, and appropriate engagement choices.
- Removed generic banner, insights and social strip, retaining the specific course/campus starting point and one contextual final form.

### Evidence and deferred work

Client cases and real product/operational artefacts were not supplied. Capability-led workflow detail, example engagement patterns, governance gates and acceptance artefacts replace fabricated proof. Relevant client inputs are listed below. Shared form/footer/tab issues are outside this group’s file ownership and are handed to the parent.

## Validation and visual review

Publication printed `validate <file>: OK` for every owned page and `revalidate: 200`. The first post-publish Energy desktop request was stale; final rerender checks and screenshots use the updated version. Energy was captured at 6,488 px desktop after compacting its two merged sector modules; the final check measured 6,545 px, slightly above the 6,500 px guideline. It retains seven visible workflows across the two merged sectors without a duplicate parent workflow grid. Heights varied between capture and final verification during concurrent shared-site work.

Final rendered checks:

```text
/industries/manufacturing @1440: height=6269px h1=['Manufacturing'] title='Manufacturing | Linkfields'
   OK
/industries/manufacturing @390: height=11205px h1=['Manufacturing'] title='Manufacturing | Linkfields'
   OK
/industries/energy-mining @1440: height=6545px h1=['Energy & Mining'] title='Energy & Mining | Linkfields'
   OK
/industries/energy-mining @390: height=12176px h1=['Energy & Mining'] title='Energy & Mining | Linkfields'
   OK
/industries/public-sector @1440: height=6240px h1=['Public Sector'] title='Public Sector | Linkfields'
   OK
/industries/public-sector @390: height=10980px h1=['Public Sector'] title='Public Sector | Linkfields'
   OK
/industries/education @1440: height=6182px h1=['Education'] title='Education | Linkfields'
   OK
/industries/education @390: height=10914px h1=['Education'] title='Education | Linkfields'
   OK
```

All captures used `tools/shot.py`, desktop `--slice 1800` and mobile `--width 390 --height 844 --slice 2400`. Manufacturing’s first desktop capture timed out under concurrent capture load; a subsequent required-tool capture succeeded. No page-level broken images, empty sections, clipping or horizontal document overflow were found. Dark tones alternate between adjacent tile sections, product logo plates render correctly and workflow text stacks readably on mobile.

| Page | Desktop JPGs reviewed | Mobile JPGs reviewed |
|---|---|---|
| manufacturing | `manufacturing_0.jpg`, `manufacturing_1.jpg`, `manufacturing_2.jpg`, `manufacturing_3.jpg` | `manufacturing-m_0.jpg`, `manufacturing-m_1.jpg`, `manufacturing-m_2.jpg`, `manufacturing-m_3.jpg`, `manufacturing-m_4.jpg` |
| energy-mining | `energy-mining_0.jpg`, `energy-mining_1.jpg`, `energy-mining_2.jpg`, `energy-mining_3.jpg` | `energy-mining-m_0.jpg`, `energy-mining-m_1.jpg`, `energy-mining-m_2.jpg`, `energy-mining-m_3.jpg`, `energy-mining-m_4.jpg` |
| public-sector | `public-sector_0.jpg`, `public-sector_1.jpg`, `public-sector_2.jpg`, `public-sector_3.jpg` | `public-sector-m_0.jpg`, `public-sector-m_1.jpg`, `public-sector-m_2.jpg`, `public-sector-m_3.jpg`, `public-sector-m_4.jpg` |
| education | `education_0.jpg`, `education_1.jpg`, `education_2.jpg`, `education_3.jpg` | `education-m_0.jpg`, `education-m_1.jpg`, `education-m_2.jpg`, `education-m_3.jpg`, `education-m_4.jpg` |

Full PNGs and slices: `/tmp/lf-industries-b/`. Source-level audit confirms legal component fields, existing media, unique anchors, valid hero targets, metadata limits, removed legacy components and absence of unsupported/banned copy. Final check log: `/tmp/lf-industries-b/final-page-check.log`.

### Merged sector anchor test

`#mining` and `#oil-gas` were clicked through the pinned tabs at both widths. Target section top equalled dock bottom: **125 px at desktop** and **113 px at mobile**; document scroll widths were **1,440 px** and **390 px** respectively. Both headings and all visible workflow tiles were reachable. Evidence: `/tmp/lf-industries-b/anchors.json`.

## Redirect handoff

- `/industries/mining` → `/industries/energy-mining#mining` (permanent redirect, after published destination verification).
- `/industries/oil-gas` → `/industries/energy-mining#oil-gas` (permanent redirect, after published destination verification).

The old child source files are retired references and were not changed. Parent owner must update header sector chips and sitemap/internal URLs; no links in the owned page documents point to retired industry URLs.

## Shared-component requests

1. Shared contact defaults: empty page nextSteps still inherit the old 24-hour promise and awkward highest-level-of-privacy NDA copy. Replace with agreed goals/constraints, confidentiality where needed and scoped discovery/commercial-model next steps. Keep the required empty page-level nextSteps fields; make area of interest optional, preserve page and selected-sector enquiry context, and use a purpose-led submit label. Phone is visually optional and privacy guidance is present in these captures; verify international client/server acceptance.
2. Shared HeroTabs: Manufacturing full-page return-to-top capture showed a faint pinned tab copy below the header and Get in touch active at the top. Hide/reset the dock and scroll-spy when the original hero bar re-enters view. Sector click offsets themselves passed at both widths.
3. Global navigation/footer owner: point Mining and Oil & Gas sector chips directly to /industries/energy-mining#mining and #oil-gas, implement the permanent redirects, and update internal links/sitemap. Complete the footer taxonomy, verified public LinkedIn and evidence-backed badge cleanup without changing these industry page files.
4. Global SEO owner: configure the confirmed production canonical domain at release; owned page canonicalUrl fields intentionally remain empty.

## Client input needed

1. Approved Manufacturing case with plant/application scope, ERP or shop-floor interfaces, acceptance criteria, baseline and measured period/result; a redacted production-to-enterprise architecture. Separate evidence before naming OT protocols, MES relationships, inspection AI or industrial safety capability.
2. Approved Mining case with asset/history sources, material/ERP integrations, model validation, operational ownership and measured maintenance or inventory baseline/result; a redacted dashboard or data-flow architecture.
3. Approved midstream/downstream Oil & Gas case with terminal/ERP/fuel retail scope, interface boundaries, security/change controls and measured baseline/result. Confirm SAP/IS-Oil modules, versions and actual delivery experience before restoring that label.
4. Approved Public Sector case with jurisdiction, workflow and service/case baseline/result, redacted audit/accessibility artefacts and verified reference permissions; procurement pack and current B-BBEE certificate entity, validity and scope before presenting buying proof.
5. Approved EduPilot walkthrough showing supported inputs/outputs, educator edits and review, deployment boundary and preparation-time baseline/result. Product-owner confirmation and demonstration are required before adding learner-support or material-grounding claims.
6. Approved Education campus-integration or service case with institution permission, systems, staff checkpoints and measured operational baseline/result; confirmed student-data and accessibility safeguards.
7. Workflow-specific product/accelerator fit and operating limits for Manufacturing, Mining, Oil & Gas, Public Sector and Education, including configured versus custom components and data prerequisites.
8. Sales-owner confirmation of response commitments, a verified public LinkedIn URL, evidence for shared footer certification/membership badges and the final production canonical domain.

## Remaining limitations

No enquiry was submitted, no external demo was exercised and no unsupported certificate or customer claim was published. Empty `nextStepsTitle` and `nextSteps` follow the mandatory page contract, but the current shared component falls back to legacy global copy; this is explicitly a parent-owned correction, not a fabricated page-level workaround. Optional unconfirmed Education IP tiles and all real client proof remain deferred pending evidence.
