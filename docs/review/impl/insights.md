# Insights implementation

## Section plan and final flow

`/company/blog`: page hero → editorial context → latest decision guides (three new posts) → revisited perspectives (three substantively refreshed 2024 posts) → contextual contact form.

`/company/news-and-articles`: page hero → recognition context → 2023 recognition archive (two original sources) → provenance and company information → contextual contact form.

Both old pages contained only their respective legacy listing component: `content.blog-listing` and `content.news-listing`. Both now contain five sections, using `sections.page-hero`, `sections.overview`, `sections.feature-tiles` and one final `sections.contact-form`. The blog has two distinct tile groups; news has one tile group and a second overview for provenance.

## Material factual finding: reconcile the 2026 ranking

**Do not treat the deck’s `#35 FT & Statista Africa Growth Ranking 2026` as independently verified.** The official Statista Africa ranking, after its dynamic table loaded and was filtered to Linkfields, showed **rank 94, Linkfields Innovations**. Rank 35 in that Africa list is BUA Foods. [1] The browser screenshot is `/home/ubuntu/screenshots/rankings_statista_2026-11-09_04-49-50_1448.webp`.

Search results associate Linkfields at 35 with the separate South Africa’s Growth Champions 2026 ranking. That official ranking is created with News24, not the Financial Times. [2] This is a material scope discrepancy, not evidence for the deck wording. No 2026 news item, alternative rank or corrected award claim has been published by this group. The client should reconcile the exact ranking, year, publisher and geography before the parent reuses a trust claim anywhere on the site.

## `/company/blog`

Implemented the recommended H1 `Enterprise insights` and an outcome-led editorial introduction. All six articles appear exactly once across the two groups, with topic, excerpt, author/editorial attribution, publication or substantive-update date, and a descriptive reading link. Empty legacy filters and hidden search are no longer in the listing. The previously featured legacy finance post is no longer promoted as current.

The unified tile model replaces the legacy dynamic listing because that renderer hides dates, author and excerpts; repeats its featured post; and provides no visible no-results reset. Approved component fields now make the required metadata visible without changes to application code. The first new article is the sole `featured: true` record in the data, and there is no repeated featured card on the listing.

Three new decision guides were published on **9 November 2026**, attributed to **Linkfields Insights**, with existing topical cover assets:

- `ai-code-assurance`: **1,172 words**. Risk-based policy, independent test design, code and dependency inspection, connected-system testing, release decisions, exceptions, measures and a practical engagement pattern. Explicit links to the value play, quality engineering, VectorX and testoriumz.
- `single-ai-gateway`: **1,156 words**. Application inventory, policies, identity, guardrails, cost ownership, tracing, evaluation and operating responsibilities. Portkey and Opik are named honestly as underlying technologies; the Linkfields layer is not misrepresented as the origin of those components.
- `continuous-cyber-evidence`: **1,155 words**. Obligations and scope, evidence standards, control mapping, exposure validation, remediation and retest, change triggers, evidence protection and governance. It explicitly avoids asserting automatic compliance or certification.

The three legacy articles were substantively rewritten, not merely re-dated. Their original dates remain 8 February, 21 March and 13 March 2024. Each content body states that it was updated by Linkfields Insights on 9 November 2026. Expired forecasts, unsubstantiated statistics, unsafe AI absolutes, promises of error-free operation, external legacy inline images and copied social-sharing text have been removed. Topics remain conversational AI in finance, RPA and digital customer experience.

Opaque slugs are replaced by `conversational-ai-financial-services`, `rpa-intelligent-operations` and `digital-transformation-customer-experience`. Unverified legacy author portraits are removed rather than attaching an invented expert role to a wholesale rewrite. All article SEO is unique and compliant. Decorative newsletter inputs and the unsupported “stay tuned” section are disabled through their existing optional data fields.

## `/company/news-and-articles`

Implemented `Company news & media`, an explicitly historical introduction, source-labelled archive tiles and editorial provenance. Five near-duplicate items are reduced to the clearest two: the original Financial Times ranking and BusinessTech’s South African coverage. Both are labelled **Recognition** and identified as coverage of the same 2023 recognition, not two separate awards.

Original publication dates were verified and corrected to **2 May 2023** for the Financial Times [3] and **7 May 2023** for BusinessTech [4]. Publisher, date, excerpt and “Read on [publisher]” links are visible. External links open in a new tab and are clearly labelled; no paywall claim is invented. News and expert insights cross-link while remaining distinct editorial destinations. No unmonitored media contact or decorative archive filter has been introduced.

## Publishing and checks

Created `seed/custom/blog-posts.json` and `seed/custom/news-articles.json` from their original data shapes. Copied only those two files to their authorised `seed/data` counterparts for preview. Published both page JSON files through `tools/publish_page.py`; both printed **validate OK**, and cache revalidation returned **200**. No unscoped apply command was used.

`tools/page_check.py` returned **OK** with no review-wording hits, one H1, no broken images, no missing tab targets and no horizontal overflow:

- Blog: **4,037 px** desktop at 1,440; **6,689 px** mobile at 390.
- News: **3,553 px** desktop at 1,440; **5,376 px** mobile at 390.

All six article detail routes also passed at both widths. New-guide desktop heights were 6,190, 6,122 and 6,270 px; refreshed-guide heights were 4,465, 4,382 and 4,579 px. Logs are `/tmp/lf-insights/page-check.txt` and `/tmp/lf-insights/article-checks.txt`.

Every listing screenshot slice was visually viewed: `blog_0.jpg` through `blog_2.jpg`, `blog-m_0.jpg` through `blog-m_2.jpg`, `news_0.jpg` through `news_1.jpg`, and `news-m_0.jpg` through `news-m_2.jpg`, all under `/tmp/lf-insights/`. Hero text, article metadata, responsive tile stacking and provenance are legible and polished. Existing hero images are topical; no new or externally sourced assets were introduced.

## Parent-owned fixes and client input

The local final contact sections exactly follow the brief: `heading: Get in touch`, short contextual subheading, `nextStepsTitle: ""`, `nextSteps: []`, dark section layout. **The shared renderer still falls back to the old global next steps**, including “within 24 hours” and “sign on a NDA … highest level of privacy”. The parent must remove/replace that fallback. Shared navigation/footer labels and credentials visible in the screenshots are also outside this group’s file ownership. No form was submitted.

Client input is needed for the ranking discrepancy; named specialist identities, roles and author consent for future expert attribution; approved field examples and delivery artefacts; product demonstration screenshots; and a nominated monitored media contact if one is to be published. The current material is capability-led guidance, not invented client evidence.

Permanent redirects required, using these original decoded path segments:

- `/company/blog/AI changing lives` → `/company/blog/conversational-ai-financial-services`
- `/company/blog/Privacy Policy 4` → `/company/blog/rpa-intelligent-operations`
- `/company/blog/Privacy Policy` → `/company/blog/digital-transformation-customer-experience`

Recommended site-wide featured selection: the three new guides, with their actual article routes and the existing `custom/hero-testoriumz.jpg`, `custom/hero-ai-governance.jpg` and `custom/hero-cyber-security.jpg` assets. Historic recognition is not recommended for current promotion. Other value-play commissions (programme assurance and capability centres with embedded IP) remain future editorial work, not falsely represented as published articles.

## References

[1]: https://rankings.statista.com/en/fastest-growing-companies/rankings/fastest-growing-companies-africa-2026/ "Official Statista Africa fastest-growing companies 2026 ranking"
[2]: https://rankings.statista.com/en/fastest-growing-companies/rankings/fastest-growing-companies-south-africa-2026/ "Official Statista and News24 South Africa Growth Champions 2026 ranking"
[3]: https://www.ft.com/africas-fastest-growing-companies-2023 "Financial Times Africa fastest-growing companies 2023 ranking, published 2 May 2023"
[4]: https://businesstech.co.za/news/business/685565/these-are-the-20-fastest-growing-companies-in-south-africa/ "BusinessTech South African growth-ranking coverage, published 7 May 2023"
