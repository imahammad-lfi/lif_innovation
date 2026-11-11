# Linkfields website: final audit and quality scorecard
*10 November 2026. Covers the requests of 10 November 2026 (button and footer hovers, Careers underline, Strapi branding, enquiry emails and reference numbers, admin access, cross-device testing) and an end-to-end audit of the live website.*
*Every figure in this report was measured on the live production build after the last deployment (10 November 2026, 03:11 SAST) using the automated tools listed in section 11. Scores are our assessment against enterprise-website practice; they are not a third-party certification.*

---

## 1. Summary

**Overall score: 9.5 / 10.** All eight requests are delivered and live. The website now passes every automated check we run: 77 pages on 14 device profiles (1,078 page loads), WCAG 2.2 AA accessibility on 156 page views, every internal and external link, 220 menu, drawer and footer clicks and 698 section-landing tests. Two one-off timing failures, which appeared only while six test suites shared one server, passed when repeated on their own (sections 3 and 5). Lighthouse gives 100 for accessibility, Best Practices and SEO on all 22 audited runs, and 100 (99–100) for desktop performance. The one area that is good but not yet excellent is **mobile performance (79 (69–84) on average under Lighthouse's slow-4G simulation)**. Section 7 explains why and what lifts it further. Two go-live steps need Linkfields' own accounts: real SMTP credentials with DKIM, and the custom domain behind Cloudflare. Neither is a code change.

| # | Request | What changed |
|---|---|---|
| 1 | Button hover | Every primary button now wipes from the Linkfields orange gradient to a royal-blue gradient, lifts slightly, gains a soft blue glow ring, and its arrow lights up and slides forward. Outline buttons fill with the orange gradient. Pressing gives a short "push" and reduced-motion settings are respected. |
| 2 | Footer hover | Column accent bars grow, links slide with an orange lead-in dash, contact cards lift with an orange glow, office cards light up in each office's accent colour, badges lift with an orange ring, and social icons fill with the brand gradient. |
| 3 | Careers underline | All top-level menu items, including Careers, now share the same animated orange underline. |
| 4 | Strapi branding | The login page carries the Linkfields logo on the globe artwork and brand gradient. The admin uses Linkfields orange as its primary colour (a deeper orange behind white text, so it passes contrast rules), with a Linkfields favicon, tab title and wording. Strapi tutorials and release pop-ups are hidden. |
| 5 | SMTP and thank-you email | Strapi sends a branded thank-you email to the visitor and an alert to sales@linkfields.com for every enquiry. The subject reads `Linkfields – <Enquiry type> – Ref. <reference>`. The relay is configured through environment settings and is currently tested with a local test inbox. |
| 6 | Unique reference and on-site thank-you | Every enquiry gets a reference such as `LF-261110-Q4J2D`. The form is replaced by "Thank you for submitting your enquiry, our expert consultants will be in touch." with the reference, a copy button and the address the confirmation went to. |
| 7 | Admin credentials | The super-admin password was reset to a new strong value and handed over privately (not in this report). |
| 8 | Re-review to 9.5–10 / 10 | The full audit below covers 14 device profiles, accessibility, performance, links, SEO, security, the CMS and the enquiry flow. The issues it found were fixed and re-tested. |

## 2. Scorecard

| Area | Score | Evidence (production, 10 Nov 2026) | What would raise it |
|---|---|---|---|
| Brand and visual design | 9.5 | One tile model across all five menus, one gradient and hover language on every button, Linkfields colours throughout, open-licence fonts | Linkfields-owned photography and client case-study visuals |
| Responsive, cross-device | 10 | 77 pages × 14 device profiles (1,078 page loads): 0 layout problems | — |
| Navigation, links, section landing | 10 | 0 broken links (225 internal, 36 external); 220/220 menu, drawer and footer clicks; 698/698 section landings | — |
| Content and messaging | 9.5 | Corporate-deck positioning, 242 reviewed content corrections (previous round), British English, no unsupported claims | Named client case studies with approved, quantified outcomes |
| SEO | 9.5 | Lighthouse SEO 100 on 22/22 runs; unique titles and descriptions on 77/77 pages; structured data; sitemap, robots, real 404s for crawlers | Custom domain, Google Search Console and Bing verification, backlinks (off-site) |
| Accessibility | 10 | axe-core WCAG 2.2 AA: 156/156 page views with zero violations (was 15/156); Lighthouse accessibility 100 on 22/22 runs | A manual screen-reader pass before launch (good practice; not automatable) |
| Performance | 8.5 | Desktop 100 (99–100); mobile 79 (69–84); layout shift ≈ 0 everywhere | Lighter mobile home video, Cloudflare edge caching, further JavaScript trimming (section 7) |
| Security and privacy | 9.5 | Full security-header set including CSP and HSTS preload; no third-party trackers; Google Maps loads only after consent | Cloudflare WAF and rate limiting at go-live; independent penetration test |
| CMS and editor experience | 9.5 | Branded admin; editors manage pages, events and pop-ups; Lead list shows reference, enquiry type and email status | Individual editor accounts; SSO if Linkfields uses Microsoft Entra ID |
| Enquiry handling and email | 9.0 | Reference, on-site receipt, thank-you and sales emails verified end-to-end | Real SMTP relay with DKIM on linkfields.com (needs Linkfields credentials) |
| Copyright and licences | 9.5 | Open-licence fonts and libraries, Linkfields-owned or generated artwork, expired badge removed (previous round) | Written confirmation of partner-logo usage and current certificate validity |

The overall 9.5 is the unweighted average of the eleven areas (104.5 / 11). Once SMTP with DKIM is live, Enquiry handling rises to 9.5. After Cloudflare and the mobile video work, Performance should reach 9.

## 3. Cross-device and responsive testing

Every page in the sitemap (77) was loaded on 14 device profiles covering phones, tablets, laptops and large desktops. We used the WebKit engine (Safari on iPhone, iPad and Mac) and Chromium (Chrome on Android and Windows). That is 1,078 page loads, with **0 layout problems**. One load (Microsoft Dynamics 365 on iPhone 15 Pro Max) timed out while every test suite was running at once on the same server; that profile was then re-run on all 77 pages with no problems.

| Device profile | Engine | Viewport | Pages | Problems |
|---|---|---|---|---|
| iPhone SE | WebKit (Safari) | 320×568 | 77 | 0 |
| iPhone 14 | WebKit (Safari) | 390×664 | 77 | 0 |
| iPhone 15 Pro Max | WebKit (Safari) | 430×739 | 77 | 0 (after re-run, see below) |
| iPhone 14 landscape | WebKit (Safari) | 750×340 | 77 | 0 |
| Galaxy S9+ | Chromium (Chrome) | 320×658 | 77 | 0 |
| Pixel 7 | Chromium (Chrome) | 412×839 | 77 | 0 |
| iPad Mini | WebKit (Safari) | 768×1024 | 77 | 0 |
| Galaxy Tab S4 | Chromium (Chrome) | 712×1138 | 77 | 0 |
| iPad Pro 11 landscape | WebKit (Safari) | 1194×834 | 77 | 0 |
| Laptop 1280×800 | Chromium (Chrome) | 1280×800 | 77 | 0 |
| Laptop 1366×768 | Chromium (Chrome) | 1366×768 | 77 | 0 |
| Safari 1440×900 | WebKit (Safari) | 1440×900 | 77 | 0 |
| Desktop 1920×1080 | Chromium (Chrome) | 1920×1080 | 77 | 0 |
| Desktop 2560×1440 | Chromium (Chrome) | 2560×1440 | 77 | 0 |

Each page load checks: no horizontal overflow, no broken images, no clipped or overlapping labels, exactly one H1, no JavaScript errors, no text below 11 px and tap targets of a usable size.

**Found and fixed during testing.** (1) Thirteen components used micro-labels of 9–10.5 px (office chips, footer and email labels, the "Linkfields IP" tag, the partner label, card eyebrows and the countdown units). All now use an 11 px floor, which reads clearly on phones. (2) On phones, the Africa Tech Festival reminder pill covered the footer copyright line at the very bottom of the page. A shared "footer lift" now raises the pill and the scroll-to-top button above the footer bar when it comes into view.

## 4. Accessibility (WCAG 2.2 AA)

We scanned all 77 pages with axe-core 4.14 against WCAG 2.2 level AA, on desktop and mobile and with the event pop-up open (156 page views). At the start of this round, 15 page views were fully clean. After the fixes below, **all 156 page views have zero violations.**

| Issue found | Where | Fix |
|---|---|---|
| Orange eyebrow text on the light Overview background (2.44:1, needs 4.5:1) | 186 elements across service pages | Light-surface eyebrows use a deeper Linkfields orange (#B34F00, 4.81:1) |
| Footer email-card labels just below the threshold (4.49:1) | 156 elements (footer on every page) | Raised to about 7:1 |
| Countdown unit labels (4.47:1) | Event pop-up and pages | Raised above 4.5:1 |
| Screen-reader name differed from the visible text | 67 tiles (industries, product rows, featured insights) | Hidden overriding labels removed, so assistive technology reads exactly what is shown |

Lighthouse accessibility moved from 97–98 to **100 on all 22 runs**.

## 5. Navigation, links and section landing

| Check | Result |
|---|---|
| Pages in the sitemap returning 200 | 77 / 77 |
| Internal links (225 links to 80 destinations) | 0 broken, 0 missing section targets, 0 redirects |
| External links (36) | 0 broken; 27 open directly, 9 (FT, BusinessTech, LinkedIn share) block automated checks but open in a browser |
| Mega-menu, mobile-drawer and footer links clicked in a real browser | 220 / 220 land on the right page and section |
| Section links: direct visits, in-app navigation, sticky tab bar (1440 px and 390 px) | 698 / 698 land at the right heading below the fixed header |

In the first full pass, one click (Products & Accelerators › Digital Transformation) stopped 52 px short, about the height of the pinned tab bar still settling, while six test suites were running at once. Repeated on its own, it and its three sibling links landed exactly (0 px).

During this work we also fixed a menu fault: after in-app navigation, a hidden copy of the previous page could intercept same-page section jumps from the mobile drawer. All element lookups now use only the visible page.

## 6. SEO

Lighthouse SEO is **100 on all 22 runs**. Every one of the 77 pages has a unique title (longest 59 characters) and a unique description (longest 158 characters) built around the service, industry or product and the region. The site language is set to British English (`en-GB`). The sitemap lists 77 URLs, `robots.txt` is in place, and search crawlers receive a real 404 for unknown addresses.

Structured data covers Organization (with the six offices), WebSite, BreadcrumbList on every inner page, Service on service and solution pages, BlogPosting on articles, and Event both on the Events hub and, from this round, on each event's own page (search engines prefer the event's own page for event results). Images have descriptive alternative text. Open Graph and Twitter preview images are set for every page.

**What remains is off-site:** the production domain, verification in Google Search Console and Bing Webmaster Tools, submitting the sitemap there, and earning backlinks. Client case studies and articles are the strongest next on-site content for search, because they target the long-tail queries enterprise buyers type.

## 7. Performance

| Mode | Performance (average) | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop (11 pages) | 100 (99–100) | 100 | 100 | 100 |
| Mobile, slow-4G simulation (11 pages) | 79 (69–84) | 100 | 100 | 100 |

| Mobile page | Score before | Score after | LCP before | LCP after | Blocking before | Blocking after |
|---|---|---|---|---|---|---|
| `/` | 65 | 69 | 4.4 s | 4.0 s | 798 ms | 701 ms |
| `/services/data-ai` | 77 | 79 | 4.3 s | 3.5 s | 371 ms | 442 ms |
| `/services/digital-transformation/integration-services` | 79 | 77 | 3.3 s | 3.6 s | 530 ms | 520 ms |
| `/products-and-accelerators` | 68 | 82 | 4.6 s | 2.9 s | 603 ms | 506 ms |
| `/products-and-accelerators/textiq` | 78 | 76 | 3.6 s | 3.7 s | 469 ms | 520 ms |
| `/industries/bfsi` | 72 | 80 | 4.3 s | 3.5 s | 517 ms | 422 ms |
| `/company/about-us` | 72 | 79 | 4.3 s | 3.5 s | 507 ms | 475 ms |
| `/careers` | 85 | 83 | 2.9 s | 3.6 s | 377 ms | 320 ms |
| `/events/africa-tech-festival-2026` | 77 | 84 | 3.8 s | 2.9 s | 469 ms | 426 ms |
| `/contact-us` | 82 | 80 | 3.2 s | 3.3 s | 448 ms | 474 ms |
| `/company/news-and-articles` | 81 | 83 | 3.3 s | 3.5 s | 448 ms | 360 ms |
| **Average** | **76** | **79** | | | | |

*Before = Lighthouse baseline earlier on 10 November; after = final production build. Lighthouse 13.6 on this server; mobile simulates a mid-range phone on slow 4G (1.6 Mbps, 4× CPU slowdown). Repeat runs vary by about ±5 points.*

**What we changed.**

1. **Code splitting.** Thirteen heavy interactive sections now load only on the pages that use them. Start-up JavaScript per page fell from 1,361 KB to 947 KB (gzip 411 → 284 KB).
2. **Leaner page data.** Interactive sections receive only their own content, and image records are trimmed to the fields the site uses. HTML on a typical service page fell from 471 KB to 354 KB (gzip 69 → 50 KB).
3. **Faster first paint on the home page.** The globe poster is fetched first at high priority, and the 2.5 MB globe video starts only after the page has loaded.
4. **Inner pages no longer download the home poster.** Next.js prefetches the home page whenever the logo is on screen, and the prefetch carried a high-priority request for the 72 KB globe poster. That request was made on every page. The preload now lives in the globe component, so only the home page loads it.
5. **Maps after consent.** The Google Maps embed loads only when a visitor chooses "Show map". This also removes third-party cookies until consent.

**Why mobile is in the 70s–80s rather than the 90s.** Desktop is effectively perfect. On the simulated slow phone, the largest element appears in 2.9–4.0 s. On inner pages that element is the hero backdrop image, only 8–12 KB; on the home page it is the 72 KB globe poster. The time is mostly the phone's CPU processing the page's React JavaScript, measured as Total Blocking Time of 320–700 ms; the home page is heaviest because of its animated hero. Real visitors on modern phones and 4G or 5G will see much faster pages than the simulation. We still recommend these next steps, in order of impact:

1. **Serve the site through Cloudflare** with Brotli compression and edge caching at go-live.
2. **Give phones a smaller globe video** (about 600 KB at 480 px instead of 2.5 MB), or the poster only.
3. **Trim client JavaScript further**, by turning more decorative sections into server-only components and loading the contact form's phone-number library only when the field is used.
4. **Monitor real-user Core Web Vitals** after launch (Cloudflare Web Analytics or Google Search Console).

## 8. Security and privacy

| Control | Status |
|---|---|
| HTTPS with HSTS (2 years, includeSubDomains, preload) | In place |
| Content-Security-Policy (only the site itself, Cloudflare Turnstile/analytics and Google Maps allowed) | Added this round; checked against 81 page views with 0 violations |
| X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy | In place |
| Third-party trackers, fonts, scripts | None: all fonts are self-hosted; the Google map loads only after consent |
| Enquiry storage | Leads are created only by the website's server, using a dedicated API token; the public API can neither read (404) nor create (403) leads |
| CMS admin | Password reset to a new strong value; tutorials and release pop-ups disabled |

**Known trade-off.** The CSP allows inline scripts, because Next.js streams page data as inline scripts. A nonce-based CSP would remove that allowance, but it forces every page to render on each request and loses static caching. For a marketing site, edge caching is the better trade.

**Recommended at go-live:** turn on the Cloudflare WAF, bot protection and rate limiting for `/api/contact` and `/admin`; restrict `/admin` to Linkfields networks, or protect it with Cloudflare Access; commission a penetration test.

## 9. CMS, enquiries and email

**Admin branding.** The login page and admin follow the Linkfields brand: logo, globe artwork, orange primary colour, favicon, "Welcome to Linkfields CMS" and the "Linkfields CMS" tab title. The settings live in `apps/cms/src/admin/` and are documented in the CMS guide.

**Enquiry flow.**

1. The visitor submits the form.
2. The website stores the lead in Strapi.
3. Strapi assigns the reference `LF-YYMMDD-XXXXX`, where the date is in South African time and the five characters avoid easily confused letters and digits.
4. The visitor immediately sees the on-site receipt with the reference.
5. Strapi sends the branded thank-you email (From "Linkfields Sales" <sales@linkfields.com>) and the sales alert (Reply-To set to the visitor), then records the email status on the lead.

The thank-you email follows the requested wording, polished for an enterprise audience. It covers what happens next ("Our expert team will contact you within 24 hours"), a summary of what the visitor submitted, the reference to quote, and "Need an urgent response? Write to sales@linkfields.com". It closes with "Regards, Linkfields – Sales team".

**Email go-live (Linkfields action).** The CMS is ready for any SMTP relay. Our DNS check of linkfields.com found mailboxes on Microsoft 365. The SPF record already authorises Microsoft 365, Brevo and Amazon SES. DMARC is in monitoring mode (`p=none`), and no DKIM record was found.

Microsoft has announced that basic-authentication SMTP for Exchange Online will be disabled by default at the end of December 2026. We therefore recommend **Brevo or Amazon SES** for website email, with **DKIM enabled** for linkfields.com and DMARC moved to `quarantine` once reports look clean. The six settings to fill in are listed in the CMS guide.

## 10. Remaining actions

| Priority | Action | Owner |
|---|---|---|
| 1 | Provide SMTP relay credentials (Brevo or Amazon SES) and enable DKIM for linkfields.com | Linkfields IT |
| 2 | Point the production domain at the site through Cloudflare (DNS, TLS, WAF, caching) | Linkfields IT with us |
| 3 | Change the admin password at first sign-in, set a real admin email and invite editors with their own accounts | Linkfields marketing |
| 4 | Verify the site in Google Search Console and Bing Webmaster Tools and submit the sitemap | Linkfields marketing |
| 5 | Supply two to four approved client case studies with outcomes | Linkfields sales |
| 6 | Confirm partner-logo permissions and current certificate dates | Linkfields alliances |
| 7 | Mobile performance steps (section 7) | Us, after go-live |

## 11. How this was tested

All tools are in the repository (`tools/`) and can be re-run at any time against any environment.

| Check | Tool | Scope |
|---|---|---|
| Cross-device layout | `device_matrix_qa.py` (Playwright, WebKit and Chromium) | 77 pages × 14 device profiles |
| Accessibility | `a11y_qa.py` (axe-core 4.14, WCAG 2.2 AA) | 77 pages × desktop and mobile |
| Performance, SEO, Best Practices | `lighthouse_qa.py` (Lighthouse 13.6) | 11 key pages × mobile and desktop |
| Links | `link_audit.py` | Every internal link, section target and external link |
| Menus and footer | `nav_click_qa.py` | Every mega-menu, mobile-drawer and footer link, clicked in a real browser |
| Section landing | `anchor_qa.py` | Direct, in-app and tab-bar section links at 1440 px and 390 px |
| Enquiry flow | Browser test plus a local test inbox | Page and pop-up forms, receipt, both emails, Lead record |
