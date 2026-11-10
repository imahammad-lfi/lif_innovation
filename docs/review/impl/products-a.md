# Products-a implementation report

## Planned section lists

- **Products & Accelerators:** hero → two-column product/accelerator fit selector → product portfolio (four portfolios, eight unique products) → accelerator grid (five suites) → how to buy → evaluation and evidence guidance → contextual contact.
- **Linkworks:** hero → problem and intended buyer → five deck-supported capabilities and white logo plate → illustrative composition/evaluation workflow → one legacy-modernisation use case → enterprise fit and licensing → demo contact.
- **testoriumz:** hero → continuous-quality problem and intended buyer → test management, low-code testing, AI root-cause analysis, CI/CD and reporting capabilities with white logo plate → evaluation/onboarding workflow → one continuous-testing use case and explicitly labelled product-website link at a real `visit-testoriumz` anchor → enterprise fit and licensing → demo contact.
- **VajraX:** hero → external-exposure problem and intended buyer → validation task/evidence boundaries with white logo plate → authorised evaluation workflow → one exposure-remediation use case → enterprise fit, safe testing and licensing → demo contact.
- **VectorX:** hero → repository-to-release problem and intended buyer → code scanning and supply-chain analysis with white logo plate → illustrative repository-change-to-release-review workflow → one AI-written-change assurance use case → enterprise fit and licensing → demo contact.

## Implementation principles and initial dependencies

The corporate deck is the fact source. No screenshots, client outcomes, supported-platform lists, hosting options, product versions, scan categories or security guarantees will be invented. Workflow and use-case content is explicitly illustrative evaluation/engagement guidance, not a claim about an installed client system. Product licensing remains separate from accelerator delivery IP; licence/subscription terms are not presented as proof of customer-managed hosting. AI Governance is identified as a Linkfields offering built on Portkey + Opik, without claiming ownership of those tools.

The catalogue currently has no hero logo or CTA fields. Product white logo plates will be added through the supported feature-tiles component; a shared hero logo/CTA enhancement is requested from the parent. The product-portfolio renderer currently does not display its existing `linkLabel` field. All rows will retain explicit labels for the parent to expose. Shared form field selection, privacy copy, optional international phone handling and product intent are parent-owned code work.

## Completion record

Completed: all five pages published and schema-validated, all ten final desktop/mobile checks passed without review-wording hits, and every screenshot slice was visually inspected. Final page heights and section inventories are recorded below.

## Review actions implemented

All five assigned documents now follow seven-section flows, with one hero and one contact form last. They use British English, sentence-case editorial headings, short tabs with valid targets, existing media, compliant SEO, and no social banner, generic blue CTA or repeated insights. All eight unique products and five accelerators remain on the hub; no URLs are retired.

- **Hub:** replaced blanket engagement/time-to-value claims with product-versus-accelerator fit guidance; added a task selector; retained both catalogue components and four software-bearing portfolio groups; explained Linkworks is the same product in two portfolios; broadened FinSight to financial data and EduPilot to education/corporate learning; disclosed Portkey + Opik; revised all accelerator descriptions to reusable/adapted delivery IP; separated licence/subscription terms from SaaS and deployment; added optional services and an evaluation panel. A product-by-product availability matrix cannot be verified from the deck, so the page asks buyers to confirm their selected product's scope rather than publishes invented hosting choices. No unverified documentation, public demo or maturity badges are shown.
- **Linkworks:** replaced two positioning-only cards with microservices, REST APIs, composable UI, cloud-native solutions and DevSecOps; explained who it fits and whether it complements or replaces packaged functionality; retained both portfolio links; added an illustrative composition/evaluation flow, a legacy-workflow use case, related Modernisation & Programme Assurance and Intelligent Operations links, enterprise-fit questions, standalone buying and an on-page demo route.
- **testoriumz:** retained the one-platform/fragmented-tool-estate proposition; added test management and dashboard reporting to low-code testing, AI root-cause analysis and CI/CD; removed the self-product portfolio tile; added the assessment/proof-of-concept, reusable tests, execution/failure review and reporting pattern; separated optional quality-engineering services from software-only purchase; added a continuous-testing example and assurance value-play links; fixed the missing `visit-testoriumz` anchor by using it on the use-case/product-website section, with an unmistakably labelled new-tab product-website link. Unsupported web/mobile/API/SAP coverage is no longer stated as a fact.
- **VajraX:** replaced tautological capability copy with external-scope, AI-assisted validation and finding-review tasks; added authorised evaluation, human approval, operational boundaries, remediation ownership and closure-evidence questions; added an illustrative external-exposure use case and Regulated Cyber Readiness link; distinguished a guided demo from permission to test live assets; removed the unverified `vajrax.lfidemo.com` link because it is outside the allowed external URL map; added licensing and product/services responsibility boundaries.
- **VectorX:** replaced tautological cards with code scanning and software supply-chain analysis evaluation tasks; treated repo-to-release as the workflow rather than a third feature; added repository/change, scan/finding and release-review stages, an AI-written-change use case and AI Code Assurance/quality-engineering links; added supported-estate, access, code-handling, deployment and licensing questions. No SAST, SCA, secrets, SBOM, automated gate or public trial is asserted without supporting product facts.

## Parent-owned component requests

1. Expose the existing `products.product-portfolio` row `linkLabel` as a visible action (`Explore <product>`) on desktop and mobile, distinct from its service-portfolio link. The page data retains every label; current mobile rendering hides them.
2. Add supported page-hero logo white plates and a direct demo/fit CTA. The current hero schema contains only title/subtitle/image/tabs, so product logo plates and demo links are supplied in the first capability section and buyer-fit body instead. Suggested route-based logo names are `custom/logos/linkworks.png`, `testoriumz.png`, `vajrax.png` and `vectorx.png`; all CTAs target `#get-in-touch`.
3. Preserve the exact required contact-form data shape while making source-path-aware product selection/demo intent visible. Separate accelerator-delivery enquiry from the current combined `Products & accelerators (licence / SaaS)` option. Use work email, organisation, optional international phone, multi-line enquiry and a suitable submit label. Initial screenshots show optional phone/privacy/message improvements already landed, but still show generic dropdown/Submit and unverified 24-hour and absolute NDA/privacy fallback next steps; remove those centrally.
4. Give Markdown body links a clear visual affordance (colour/underline/focus). Current overview links are functional, including the new-tab testoriumz destination, but look like ordinary body copy in screenshots. This affects the early assisted-demo routes and hub task selector.
5. Preserve horizontally scrolling sticky tabs and strengthen edge/overflow affordance on mobile; labels are now short, with 5 tabs (6 on testoriumz) and matching anchors.

## Client evidence needed

- Current approved product screenshots, captioned walkthroughs and architecture diagrams for Linkworks, testoriumz, VajraX and VectorX, with version, redaction/sample scope and permission.
- One approved use case per product, including real outputs, limitations, measurement scope and publication permission; illustrative evaluation patterns are supplied instead of invented results.
- Product-specific supported languages/platforms/targets/connectors, scan categories, deployment/regions, identity/access controls, tenancy, retention/data handling, release/support model, licence/subscription/SaaS availability and implementation/handover/source rights.
- AI Governance ownership/dependency register: the exact Linkfields layer versus Portkey + Opik, third-party licences, operating responsibilities and product maturity.
- Guided/public demo availability, access instructions and safe sample-data/authorised-target rules. The unverified VajraX public demo was not republished; the authorised guided-demo route remains local.
- Accelerator asset inventory, reuse/handover rights, scope/support and readiness dependencies; do not infer standalone SaaS availability from the product buying models.

## Initial validation evidence

`tools/publish_page.py` published all five owned pages, with `validate <file>: OK` for each and revalidation HTTP 200. An initial hub desktop request served stale content; the prescribed fresh repeat returned current metadata, no review-wording hits and OK at 1440/390. A separate browser run was interrupted by a shared HMR navigation; it was retried without restarting the development server. JSON/editorial checks confirm seven sections, one contact form, existing media, SEO titles 36–54 characters and descriptions 147–153 characters.

### Shared component progress observed during review

The final VectorX mobile capture shows the parent's shared updates have landed: unsupported response-time and absolute privacy promises are removed, the next steps are concise, phone is optional, work-email/organisation and multi-line challenge fields are present, privacy is linked, the CTA is “Send enquiry”, and the footer now follows the new Solutions/Products taxonomy. These are not edits by this group. The remaining form request is explicit current-product/demo intent and a distinct accelerator-delivery route. Earlier screenshots captured the old global wording before those shared changes. The final consolidated page checks below are taken after the shared updates.

## Per-page section and visual check record

### Products & Accelerators — `/products-and-accelerators`

**Old section list:**
1. sections.page-hero · Products & Accelerators
2. sections.overview · Our own IP, built into every engagement
3. products.product-portfolio · Software we own
4. products.accelerator-grid · Accelerators we reuse
5. sections.feature-tiles · Licensed on their own *or delivered with our services*
6. sections.message-banner · Find the right product or accelerator for your organisation
7. sections.contact-form · (default heading)
8. sections.social-banner · (default heading)

**New section list:**
1. sections.page-hero · Products & Accelerators
2. sections.overview · Proprietary software and reusable IP, matched to your needs
3. products.product-portfolio · Linkfields products
4. products.accelerator-grid · Accelerators we reuse
5. sections.feature-tiles · Buy software independently, or add delivery support
6. sections.overview · What to bring to a product evaluation
7. sections.contact-form · Get in touch

**Result:** Retained all eight products and five accelerators; added fit selector, honest Portkey + Opik disclosure, corrected product scope, buying boundaries and evaluation guidance.

**Checks:** published and schema-validated OK; `page_check.py` OK at 1440 and 390 with no review-wording hits on the current rendering. Recorded desktop check height: 6099 px.

**Visual inspection:** Desktop: 1440 × 6042 px, 4 JPG slices; Mobile: 390 × 11095 px, 5 JPG slices. All JPG slices were opened and reviewed. Existing imagery, logo plates, tile spacing, heading/body hierarchy, stacking and the contextual enquiry ending are intact. No page-level overflow or broken layout was observed. Shared component issues are listed above.

### Linkworks — `/products-and-accelerators/linkworks`

**Old section list:**
1. sections.page-hero · Linkworks
2. sections.overview · When packaged platforms do not fit
3. solutions.card-grid · A composable approach to business applications
4. sections.message-banner · Discuss your business application needs
5. sections.contact-form · (default heading)
6. sections.social-banner · (default heading)

**New section list:**
1. sections.page-hero · Linkworks
2. sections.overview · When packaged platforms do not fit
3. sections.feature-tiles · Compose the application around your business
4. sections.feature-tiles · From business workflow to composed application
5. sections.overview · Example: modernising a bespoke operations workflow
6. sections.feature-tiles · Enterprise fit and licensing
7. sections.contact-form · Get in touch

**Result:** Added five concrete composable capabilities, a workflow and one modernisation example, enterprise-fit/licensing guidance and contextual demo contact.

**Checks:** published and schema-validated OK; `page_check.py` OK at 1440 and 390 with no review-wording hits on the current rendering. Recorded desktop check height: 5624 px.

**Visual inspection:** Desktop: 1440 × 5568 px, 4 JPG slices; Mobile: 390 × 8862 px, 4 JPG slices. All JPG slices were opened and reviewed. Existing imagery, logo plates, tile spacing, heading/body hierarchy, stacking and the contextual enquiry ending are intact. No page-level overflow or broken layout was observed. Shared component issues are listed above.

### testoriumz — `/products-and-accelerators/testoriumz`

**Old section list:**
1. sections.page-hero · testoriumz
2. sections.overview · One platform for continuous quality
3. solutions.card-grid · Quality engineering
4. products.product-portfolio · Continuous testing, built into delivery
5. sections.message-banner · Bring continuous quality into your delivery
6. sections.contact-form · (default heading)
7. sections.social-banner · (default heading)

**New section list:**
1. sections.page-hero · testoriumz
2. sections.overview · One platform for continuous quality
3. sections.feature-tiles · Plan, automate and investigate tests in one platform
4. sections.feature-tiles · A continuous-testing evaluation workflow
5. sections.overview · Example: checking a changing customer journey
6. sections.feature-tiles · Enterprise fit and licensing
7. sections.contact-form · Get in touch

**Result:** Expanded continuous-quality capabilities, replaced self-catalogue with onboarding workflow, fixed visit-testoriumz anchor, labelled external product website and added standalone licensing/demo context.

**Checks:** published and schema-validated OK; `page_check.py` OK at 1440 and 390 with no review-wording hits on the current rendering. Recorded desktop check height: 5636 px.

**Visual inspection:** Desktop: 1440 × 5580 px, 4 JPG slices; Mobile: 390 × 8698 px, 4 JPG slices. All JPG slices were opened and reviewed. Existing imagery, logo plates, tile spacing, heading/body hierarchy, stacking and the contextual enquiry ending are intact. No page-level overflow or broken layout was observed. Shared component issues are listed above.

### VajraX — `/products-and-accelerators/vajrax`

**Old section list:**
1. sections.page-hero · VajraX
2. sections.overview · Validate exposure beyond your perimeter
3. solutions.card-grid · AI-powered exposure validation
4. sections.message-banner · Explore VajraX exposure validation
5. sections.contact-form · (default heading)
6. sections.social-banner · (default heading)

**New section list:**
1. sections.page-hero · VajraX
2. sections.overview · Validate exposure beyond your perimeter
3. sections.feature-tiles · Evaluate the exposure and its evidence
4. sections.feature-tiles · An authorised validation evaluation
5. sections.overview · Example: reviewing an external exposure
6. sections.feature-tiles · Enterprise fit and licensing
7. sections.contact-form · Get in touch

**Result:** Added authorised exposure-validation evaluation, finding evidence and remediation responsibilities, one cyber-readiness example, licensing and guided-demo route without unverified scanning claims.

**Checks:** published and schema-validated OK; `page_check.py` OK at 1440 and 390 with no review-wording hits on the current rendering. Recorded desktop check height: 5262 px.

**Visual inspection:** Desktop: 1440 × 5205 px, 3 JPG slices; Mobile: 390 × 8255 px, 4 JPG slices. All JPG slices were opened and reviewed. Existing imagery, logo plates, tile spacing, heading/body hierarchy, stacking and the contextual enquiry ending are intact. No page-level overflow or broken layout was observed. Shared component issues are listed above.

### VectorX — `/products-and-accelerators/vectorx`

**Old section list:**
1. sections.page-hero · VectorX
2. sections.overview · Software security from repo to release
3. solutions.card-grid · Code and software supply-chain analysis
4. sections.message-banner · Discuss VectorX with our team
5. sections.contact-form · (default heading)
6. sections.social-banner · (default heading)

**New section list:**
1. sections.page-hero · VectorX
2. sections.overview · Software security from repo to release
3. sections.feature-tiles · Review code and its software supply chain
4. sections.feature-tiles · From repository change to release review
5. sections.overview · Example: assurance for AI-written change
6. sections.feature-tiles · Enterprise fit and licensing
7. sections.contact-form · Get in touch

**Result:** Added code/supply-chain evaluation tasks, repo-to-release workflow, AI-written-change assurance example, supported-estate/security/licensing questions and contextual demo contact.

**Checks:** published and schema-validated OK; `page_check.py` OK at 1440 and 390 with no review-wording hits on the current rendering. Recorded desktop check height: 5317 px.

**Visual inspection:** Desktop: 1440 × 5261 px, 3 JPG slices; Mobile: 390 × 8493 px, 4 JPG slices. All JPG slices were opened and reviewed. Existing imagery, logo plates, tile spacing, heading/body hierarchy, stacking and the contextual enquiry ending are intact. No page-level overflow or broken layout was observed. Shared component issues are listed above.

## Completion and scope

Only the five authorised custom page JSON files, this report and `/tmp/lf-products-a/` scratch were edited. The supplied `tools/publish_page.py` was used with explicit owned filenames; no unrestricted apply, server restart, global edit or code change was performed. Screenshot captures were retried only following confirmed interruption/failure. Product screens, measured results and product-specific procurement facts remain client-input dependencies, replaced with explicitly illustrative evaluation patterns and capability-led depth. No redirects or featured insights are needed for this group.
