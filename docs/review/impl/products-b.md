# Products-b implementation report

## Planned and implemented section lists

All four pages use the seven-section Product template: **hero → problem and fit → capabilities → evaluation workflow → one example engagement pattern → enterprise fit → contextual contact form**.

- **AI Governance:** AI Governance → Guardrails, cost and tracing, with clear ownership → Three governance priorities → Evaluate the gateway in your AI estate → Example: a governed knowledge assistant → Agree the technical and commercial boundary → Get in touch / Request an AI Governance demo.
- **textIQ:** textIQ → Make unstructured enterprise content searchable and useful → Find and understand enterprise content → From document sample to reviewed output → Example: reviewing a document collection → Agree your document and data boundaries → Get in touch / Request a textIQ demo.
- **FinSight:** FinSight → Ask questions of financial data → Conversational analysis and reporting → From financial data to a reviewed report → Example: a management-reporting question → Agree the financial-data and control scope → Get in touch / Request a FinSight demo.
- **EduPilot:** EduPilot → Course creation for education and corporate learning → Structure an authoring evaluation → From course brief to reviewed content → Example: a corporate-learning module → Agree your content and publishing boundaries → Get in touch / Request an EduPilot demo.

## Scope and status

**Completed:** the four assigned page JSON documents have been rewritten, published locally with `tools/publish_page.py`, schema-validated, checked at both required widths, and visually reviewed from full-page screenshot slices. No other page JSON, application code, global data, redirect configuration or shared seed implementation was edited.

Only supplied deck facts and consistent existing product descriptions were used. Real screens, client outcomes, detailed security guarantees and unverified deployment options were not invented. Evaluation workflows and example engagement patterns supply capability-led depth while clearly distinguishing them from product-interface demonstrations and client case studies.

All pages have seven sections, one H1, five short matching hero tabs, an existing hero image, a product logo on a white plate, selective related links, and exactly one final contact form. No social banner, featured-insights grid, duplicate CTA banner or sibling catalogue remains. British English, sentence-case headings and the prescribed SEO constraints have been applied. Canonical fields remain empty for the parent’s final-domain configuration.

## AI Governance

**Page:** `/products-and-accelerators/ai-governance`  
**File:** `seed/custom/pages/products-and-accelerators__ai-governance.json`

### Before

1. `sections.page-hero` — AI Governance; “One gateway for every AI tool”.
2. `sections.overview` — Guardrails, cost and tracing for AI tools.
3. `solutions.card-grid` — One gateway, three governance priorities.
4. `sections.message-banner` — Discuss AI Governance with our team.
5. `sections.contact-form` — default generic heading/subheading.
6. `sections.social-banner` — default social heading.

### After

1. `sections.page-hero` — AI Governance; “An AI gateway for guardrails, cost visibility and tracing.”
2. `sections.overview` (`overview`) — Guardrails, cost and tracing, with clear ownership.
3. `sections.feature-tiles` (`capabilities`, navy, teal accents) — Three governance priorities.
4. `sections.feature-tiles` (`workflow`, compact, ink, teal accents) — Evaluate the gateway in your AI estate.
5. `sections.overview` (`use-case`) — Example: a governed knowledge assistant.
6. `services.process-accordion` (`enterprise-fit`) — Agree the technical and commercial boundary.
7. `sections.contact-form` (`get-in-touch`) — Get in touch / Request an AI Governance demo.

### Recommendations implemented

The hero no longer asserts universal tool coverage. The product name and Cyber Security placement remain unchanged. The overview explicitly identifies the Linkfields-packaged gateway/governance offer as built on **Portkey + Opik**, states that these are third-party components rather than Linkfields-owned platforms, and separates packaging, integration and governance configuration from third-party licences and operating responsibility.

The circular cards have been replaced with concrete guardrail, cost and trace evaluation tasks and their inputs/outputs. Unknown enforcement, budget-control, provider-coverage or compliance features are not asserted. The workflow maps the application, gateway, model/provider and tracing paths at evaluation level, with trust-boundary, licence, policy-test and operating deliverables. It is explicitly not presented as a production architecture.

One labelled knowledge-assistant engagement pattern provides a control checklist, sample usage/trace evidence and a responsibility matrix without inventing a deployed client or result. Related links distinguish the product from Data & AI’s **AI strategy & governance** advisory, route security control work to **AI security & GRC**, and position **Regulated Cyber Readiness** as the wider evidence/remediation programme rather than claim gateway compliance.

Enterprise-fit questions cover ownership, supported tools, integration/failure behaviour, hosting/residency, prompts/logs, secrets/access, third-party fees, Linkfields product/service scope and support. The CTA detour and social strip were removed. Early walkthrough links now lead to the local contextual form.

### Deferred, with reasons

Precise Linkfields-owned artefacts, Portkey/Opik editions and feature allocation, licences, real policy/cost/trace screens and production architecture require client confirmation. The page therefore states the known packaging boundary and makes the remaining scope a procurement/evaluation question. A logo and CTA inside the hero require fields not present in the allowed hero component; the logo is on the capabilities white plate and the early CTA is in the overview.

## textIQ

**Page:** `/products-and-accelerators/textiq`  
**File:** `seed/custom/pages/products-and-accelerators__textiq.json`

### Before

1. `sections.page-hero` — textIQ; “Intelligent search and document intelligence”.
2. `sections.overview` — Turn filed paperwork into queryable information.
3. `solutions.card-grid` — Find and understand enterprise content.
4. `sections.message-banner` — Explore textIQ document intelligence; external demo.
5. `sections.contact-form` — default generic heading/subheading.
6. `sections.social-banner` — default social heading.

### After

1. `sections.page-hero` — textIQ; “Search, extract and summarise enterprise documents.”
2. `sections.overview` (`overview`) — Make unstructured enterprise content searchable and useful.
3. `sections.feature-tiles` (`capabilities`, navy, purple accents) — Find and understand enterprise content.
4. `sections.feature-tiles` (`workflow`, compact, ink, purple accents) — From document sample to reviewed output.
5. `sections.overview` (`use-case`) — Example: reviewing a document collection.
6. `services.process-accordion` (`enterprise-fit`) — Agree your document and data boundaries.
7. `sections.contact-form` (`get-in-touch`) — Get in touch / Request a textIQ demo.

### Recommendations implemented

The paper/field-only positioning has been broadened to the confirmed search, extraction, classification and summarisation scope. Intended document-heavy business work and reviewer tasks are explicit. Three unified tiles replace the mixed legacy/custom icons and describe query/result, document/field-category and document/summary evaluation tasks with concrete inputs and outputs.

The four-step workflow covers selecting safe material, processing content, reviewer checks and the enterprise-use/export plan. Source-reference, confidence, file/language/scan and connector behaviour are framed as features to establish in a demonstration, not unverified promises. One labelled policy-document example supplies a reference answer, reviewed outputs, quality rubric and exception log without fabricated benchmarks.

Selective links connect textIQ to **Agentic AI & GenAI**, **Data platforms & analytics** and wider **Intelligent Operations** process redesign. Enterprise fit addresses storage/retention/deletion, model-provider use, permission inheritance, isolation, repositories/APIs, review, hosting/residency and product/service terms. No unconditional privacy or training-data promise remains. Initial-demo copy warns against confidential or personal uploads.

The external-demo banner and social strip were removed; the primary and fallback journey is now a local guided-demo enquiry.

### Deferred, with reasons

Real redacted documents, query/result and extraction/summary screens, supported-format matrices, quality measurements and contractual data/deployment controls require client evidence. The original `https://textiq.lfidemo.com/` destination is not retained: the shared brief permits external links only to official vendor sites, plus testoriumz.com, and this destination lacks supplied safe-data/access approval. Reinstatement needs client confirmation and parent URL-policy approval.

## FinSight

**Page:** `/products-and-accelerators/finsight`  
**File:** `seed/custom/pages/products-and-accelerators__finsight.json`

### Before

1. `sections.page-hero` — FinSight; “Financial insight and reporting analytics over banking data”.
2. `sections.overview` — For the people behind the numbers.
3. `solutions.card-grid` — Explore financial data through analytics.
4. `sections.message-banner` — Explore FinSight banking analytics; external demo.
5. `sections.contact-form` — default generic heading/subheading.
6. `sections.social-banner` — default social heading.

### After

1. `sections.page-hero` — FinSight; “Conversational analysis and reporting over financial data.”
2. `sections.overview` (`overview`) — Ask questions of financial data.
3. `sections.feature-tiles` (`capabilities`, navy, purple accents) — Conversational analysis and reporting.
4. `sections.feature-tiles` (`workflow`, compact, ink, purple accents) — From financial data to a reviewed report.
5. `sections.overview` (`use-case`) — Example: a management-reporting question.
6. `services.process-accordion` (`enterprise-fit`) — Agree the financial-data and control scope.
7. `sections.contact-form` (`get-in-touch`) — Get in touch / Request a FinSight demo.

### Recommendations implemented

The hero, body and metadata now use the deck’s broader **financial-data** proposition. Unsupported machine-learning claims and the banking-only limitation were removed. The buyer task is to ask a financial question and review the evidence behind the answer, with analytical assistance explicitly separated from regulated advice and reporting compliance.

Overlapping insight/reporting cards have been merged into two distinct capabilities: conversational exploration and reviewed reporting. The example period-movement question is clearly an evaluation question, not a claimed product output. The workflow defines sources, periods/entities/measures, question/answer, reconciliation and report review. Deliverables include a metric dictionary, reference calculations, exception record and reviewed reporting output.

One labelled management-reporting engagement pattern names the finance owner’s calculation and interpretation responsibilities without fabricated results. Links point to **Data platforms & analytics**, **AI strategy & governance** and the wider **Intelligent Operations** workflow.

Enterprise-fit questions cover data sources/connectors, grain/freshness, reporting definitions, output formats, source evidence/auditability, reconciliation ownership, access/model/data controls, hosting/residency, licensing and optional services. Sensitive financial data is excluded from initial-demo guidance. The generic CTA banner and social strip were removed; the local FinSight demo request is prominent.

### Deferred, with reasons

Sample financial-data question/answer/report screens, actual supported connectors/outputs, reconciliation and accuracy evidence, banking-specific features and any ML functionality require client confirmation. No charts, exports or calculation guarantees were invented. The unapproved `https://finsight.lfidemo.com/` journey was removed under the shared external-link rule; safe access/data instructions and parent URL-policy approval are needed before reinstatement.

## EduPilot

**Page:** `/products-and-accelerators/edupilot`  
**File:** `seed/custom/pages/products-and-accelerators__edupilot.json`

### Before

1. `sections.page-hero` — EduPilot; “Education AI grounded in your institution’s material”.
2. `sections.overview` — AI for education and corporate learning.
3. `solutions.card-grid` — Support course creation and learning workflows.
4. `sections.message-banner` — Explore EduPilot education AI; external demo.
5. `sections.contact-form` — default generic heading/subheading.
6. `sections.social-banner` — default social heading.

### After

1. `sections.page-hero` — EduPilot; “Rapid course creation for education and corporate learning.”
2. `sections.overview` (`overview`) — Course creation for education and corporate learning.
3. `sections.feature-tiles` (`capabilities`, navy, purple accents) — Structure an authoring evaluation.
4. `sections.feature-tiles` (`workflow`, compact, ink, purple accents) — From course brief to reviewed content.
5. `sections.overview` (`use-case`) — Example: a corporate-learning module.
6. `services.process-accordion` (`enterprise-fit`) — Agree your content and publishing boundaries.
7. `sections.contact-form` (`get-in-touch`) — Get in touch / Request an EduPilot demo.

### Recommendations implemented

The hero and metadata now lead with the deck’s concrete **rapid course creation for education and corporate learning** proposition. Broad education-workflow, learner-support and institution-only claims were replaced by a defined authoring evaluation. Source handling/grounding and actual formats are to be established, not guaranteed.

Unified tiles describe the course brief, draft assessment and expert review/publishing hand-off. The workflow makes educator or subject-matter-expert approval explicit and does not imply instantly publishable content, automatic LMS publication or LMS replacement. Outputs include the course brief, sample draft, quality rubric/revision log and publishing/acceptance plan.

One labelled corporate-learning engagement pattern is separate from an institution’s educator-led process and displays no learner or client data. Related links connect wider delivery to **Agentic AI & GenAI**, governance to **AI strategy & governance**, and broader process redesign to **Intelligent Operations**.

Enterprise fit covers source/output/LMS formats, content rights, model-provider use, grounding/review, access/retention/isolation, hosting/residency, licensing and optional implementation/support. Learner-facing use and age-appropriate safeguards require separate scope confirmation. The contextual form uses the grammatically correct “Request an EduPilot demo”. The external banner and social strip were removed.

### Deferred, with reasons

Actual source/draft/review screens, supported authoring outputs, grounding/review controls, LMS/export support and approved education/corporate examples require client evidence. No learner-support or educational-outcome claim was retained. The unapproved `https://edupilot.lfiai.com/` demo was removed under the shared external-link rule; safe demonstration instructions and parent URL-policy approval are required before reinstatement.

## Publication and rendered QA

Final publication log: [publish-final.log](/tmp/lf-products-b/publish-final.log). All four files printed `validate <file>: OK`; cache revalidation returned HTTP 200.

Final prescribed rendered checks: [check-final.log](/tmp/lf-products-b/check-final.log).

| Page | Desktop 1,440 px | Mobile 390 px | Result |
|---|---:|---:|---|
| AI Governance | 5,342 px | 9,033 px | OK at both widths |
| textIQ | 5,356 px | 8,829 px | OK at both widths |
| FinSight | 5,319 px | 8,547 px | OK at both widths |
| EduPilot | 5,369 px | 8,997 px | OK at both widths |

Each final check returned HTTP 200, one correct H1, no broken images, no missing tab targets, no horizontal overflow and **no review-wording hits**. Desktop heights remain below 6,500 px. Mobile length reflects the readable single-column cards, workflow, shared form and footer, not duplicate product catalogues.

Interactive QA also opened all four enterprise-fit panels on every page at both widths: **32 panel checks passed**, all content was visible and the page remained within the viewport. See [interactive-check.log](/tmp/lf-products-b/interactive-check.log) and [interactive-check.json](/tmp/lf-products-b/interactive-check.json). The latest shared form was checked for “24 hours”, “highest level of privacy” and “Select Service”; none remained. Those shared fixes were performed outside this group, not through unauthorised code changes here.

## Visual review

The prescribed `tools/shot.py` desktop captures used `--slice 1800`; mobile captures used `--width 390 --height 844 --slice 2400`. All **12 desktop JPG slices and 16 mobile JPG slices** were inspected. The three pages receiving the final wording polish were recaptured and their final slices reviewed. Expanded enterprise-fit screenshots were additionally inspected at both widths.

The owned sections render cleanly: balanced overview columns, visible white logo plates, navy capabilities followed by ink workflows, portfolio-correct teal/purple accents, readable numbered deliverables, clearly labelled example patterns and a contextual final form. No empty card, clipped heading, missing image, off-brand icon mixture or page overflow was found. Long enterprise-fit questions and answers wrap cleanly at 390 px.

Full-page screenshot files:

- [AI Governance desktop](/tmp/lf-products-b/ai-governance.png) and [mobile](/tmp/lf-products-b/ai-governance-m.png).
- [textIQ desktop](/tmp/lf-products-b/textiq.png) and [mobile](/tmp/lf-products-b/textiq-m.png).
- [FinSight desktop](/tmp/lf-products-b/finsight.png) and [mobile](/tmp/lf-products-b/finsight-m.png).
- [EduPilot desktop](/tmp/lf-products-b/edupilot.png) and [mobile](/tmp/lf-products-b/edupilot-m.png).

Expanded-fit examples: [AI Governance mobile](/tmp/lf-products-b/ai-governance-fit-390.png), [textIQ mobile](/tmp/lf-products-b/textiq-fit-390.png), [FinSight mobile](/tmp/lf-products-b/finsight-fit-390.png), [EduPilot mobile](/tmp/lf-products-b/edupilot-fit-390.png). Corresponding `-fit-1440.png` desktop files are in the same scratch directory.

The shared site changed while other agents worked: later form/footer heights differ from the first capture. Final reported heights come from the last prescribed check. Initial full-page desktop captures also reproduced the known duplicated sticky-tab state after returning to the top. This is a parent-owned component issue, not a missing page anchor. Development-only rendering/issue indicators in some captures are not page content.

## Parent-owned component requests

1. **Product hero media and CTA:** extend `sections.page-hero` with approved optional product-logo and primary-CTA support. The allowed schema currently has only title, subtitle, background image and tabs. Until then, these pages use a capabilities white logo plate plus an early overview demo link. Do not substitute conceptual artwork for a real interface.
2. **Product-aware form metadata:** preserve the route’s product in a hidden/preselected enquiry field and capture demo, licence or fit intent. The permitted page-level form schema exposes no product or intent field. Keep the newly corrected work-email, organisation, optional-phone, multiline-message and privacy behaviour.
3. **Shared navigation/link refinement:** harden sticky tabs against duplicate bars after fast return-to-top and keep a clear mobile horizontal-scroll affordance. Make prose-level internal links visibly recognisable at rest, not only on hover. All page tab targets already match their section IDs.

## Client input needed

- **All four products:** current approved screenshots/demo clips and version; publication-safe sample or redacted data; at least one approved scenario with inputs, outputs, limitations and measured methodology; current availability/maturity; confirmed hosting/residency, licence/subscription/SaaS terms, onboarding and support scope.
- **AI Governance:** exact Linkfields-owned layer/artefacts versus Portkey/Opik features and editions; third-party licence fees and responsibilities; supported models/providers/tools; architecture and trust boundaries; real guardrail decisions, cost and trace views; policy-test evidence; prompt/log retention/redaction, access/secrets, failure/failover and operational accountability.
- **textIQ:** file/language/scan/output and repository/API matrices; real query, extraction/classification and summary outputs; source-reference/confidence behaviour; quality benchmark/reviewer effort; permission inheritance, isolation, storage/retention/deletion and contractual model-provider data handling.
- **FinSight:** supported financial sources/connectors, data grain/freshness and reporting/export formats; source evidence/auditability; reconciliation ownership and calculation-quality evidence; access/model/data controls; confirmation of any banking-specific or ML scope.
- **EduPilot:** actual material-handling/grounding, authoring/review outputs, export/LMS integrations and content ownership; educator-review controls; separate education/corporate-learning evidence; learner privacy and age-appropriate safeguards only if learner-facing use is supported.
- **Legacy public demos:** approved access/login instructions, safe sample scope, upload/privacy rules, availability/fallback, and permission for the three demo URLs to be added to the shared allowed-link policy. No public/sample-demo claim is made without this evidence.

## Redirects and insights

No redirects are needed: all four product URLs are retained. No featured insights were added; product detail pages are excluded by the shared brief.
