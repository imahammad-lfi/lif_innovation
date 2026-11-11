# Linkfields website - verification report, 11 November 2026

**Scope.** Three checks requested on 11 Nov 2026 (08:39): (1) font sizes, hero-banner timing and spacing against the
design-system guidelines on monitors, projectors and TVs; (2) the updated website on mobile devices, including the
Africa Tech Festival (ATF) pop-up and the globe size; (3) the latest hand-over archive and the request logs, for any
remaining pending tasks. All measurements were taken on the production build of the preview site (port 3001) with
automated browsers (Chromium and WebKit), from computed styles in the rendered page - not from source code alone.

## 1. Summary

The website now conforms to the design system on every screen size tested, from a 390px phone to a 5120px
super-ultrawide monitor. The first measurement found two gaps - about 3-7% of text still used sizes left over from the
10 November rescale, and some older sections used 120px instead of 112px padding on wide screens - and both were fixed
and redeployed the same morning. After the fixes, **100% of measured text uses a documented type size on all 15 screen
sizes**, no body text is smaller than 12px, wide-screen sections all use 112px, and the hero slides change every
**4 seconds**. On phones and tablets the ATF pop-up opens automatically with Venu Yeligeti's portrait, and the globe is
at its enlarged size (186-240px, depending on the phone width). Nothing blocks launch from the website side; the open
items are configuration and sign-off tasks for go-live (section 5).

| Area | Result | Detail |
| --- | --- | --- |
| Type sizes (15 screen sizes, 17 pages each) | Pass after fixes | 100% on the type ramp (was 92.9-96.8%); 0 text elements below 12px (was 430-492 per size) |
| Role sizes (headings, body, labels, buttons, menu) | Pass | 100% of 2,947 (phone) to 3,663 (desktop) role-classified text elements per size meet their role range |
| Hero banner timing | Pass | 4.02-4.06 s per slide on phone and HD projector; 4.12-4.14 s FHD TV; 4.13-4.33 s 4K TV (test-browser paint load) |
| Spacing: gutters, header, sections, hero | Pass | 0 gutter mismatches; header 64→56 / 72→60 / 84→64px; sections 64 / 96 / 112px |
| Large screens (238 renders, 14 sizes) | Pass | 0 overflow, 0 out-of-frame, 0 overlap, 0 marquee gaps, hero fits on every size |
| Mobile and tablet device matrix (280 renders) | Pass | 0 overflow, broken images, clipped text, heading errors, sub-11px text or small tap targets |
| ATF pop-up on mobile | Pass | Opens after 5-6 s on every phone; Venu's portrait shown and loaded; actions pinned on screen |
| Globe on mobile | Pass | 186px (320 wide) to 240px (430 wide and up); copy 12px below; slides clear of the dots |
| Hand-over archive | Rebuilt | `linkfields-complete-2026-11-11.zip` rebuilt after today's fixes; checksum, contents and secret scan verified (section 4) |

## 2. Monitors, projectors and TVs

**Method.** A new checker, `tools/design_conformance_qa.py`, opens 17 representative pages at 15 screen sizes and
reads the computed font size of every visible text element, classifies each by role (page title, section title, card
title, body, label, chip, button, menu, footer), and compares it with the design system. It also measures the menu and
content gutters, the header height at the top and after scrolling, the vertical padding of every section, the hero
height and globe position, and - on the home page - the real time between slide changes. The 15 sizes cover a phone
(390x844), XGA, HD, WXGA and WUXGA projectors, 1366 and 1536 laptops, an FHD monitor and an FHD TV/projector in full
screen, UW-FHD 2560x1080, QHD, UWQHD 3440x1440, a 4K monitor, a 4K TV in full screen and a 5120x1440 super-ultrawide.

![Type conformance before and after the fixes](/home/ubuntu/linkfields/docs/review/img/type-conformance-2026-11-11.png)

| Design-system rule | Expected | Measured on production | Result |
| --- | --- | --- | --- |
| Type ramp | Only the 23 documented sizes: 10.5-14.5px in half-pixel steps, then 15.5, 16, 16.5, 18, 20, 21.5, 24, 27.5, 34.5, 40, 41.5, 46, 48 and 55px | 100.0% of text on the ramp at every size | Pass (fixed) |
| Minimum size | 12px for text; 10.5-11.5px only for uppercase labels and pill chips | 0 elements below the rule | Pass (fixed) |
| Role ranges | e.g. section title 27.5-40px desktop, card title 14-24px, body 12-16.5px | 100% of 2,947 (phone) to 3,663 (desktop) role-classified text elements per size meet their role range | Pass |
| Hero autoplay | 4 s per slide (CMS value, default and fallback) | 4.02-4.33 s measured (the upper end only on the 4K TV size, where the test browser paints slowly) | Pass |
| Menu inset | 20 / 40 / 48px, then centred in the 1920px frame | 20, 40, 48px; 368px at 2560; 1008px at 3840; 1648px at 5120 | Pass |
| Content gutter | Content sits inside the menu (about one inch) | 0 mismatches on 255 renders | Pass |
| Header height | 64→56 / 72→60 / 84→64px (top → after scroll) | 65→57 / 73→61 / 85→65px (each includes the 1px border) | Pass |
| Section padding | 64px phone, 96px desktop, 112px wide | 64px x98, 96px x98, 112px x98; no 120px left | Pass (fixed) |
| Hero height and fit | Clamp to the screen, copy and globe inside | 657px (1366x768) to 1000px (≥1080 tall); fits on all 14 large sizes | Pass |
| Copy-to-globe gap | Must not grow on big screens | 390px from 1920 to 5120px | Pass |

**Fixes made during this check (deployed the same morning).**
- *Type ramp.* 80 font-size classes in 37 files that still used in-between sizes (15, 17, 19, 22.5, 26, 29, 31, 36, 38,
  39.5, 44.5, 46.5px …) were moved to the nearest documented size, and plain text below 12px (footer office addresses,
  "Directions", legal links, copyright, badge captions, industry lists) was raised to 12px. Uppercase labels and pill
  badges keep their 11-11.5px size, which the design system allows.
- *Section padding.* 31 older components that used 120px on wide screens now use the standard 112px.
- *Hero timing.* The published value was already 4 s; the CMS default and the website fallback were still 6 s, so a
  cleared field could have brought back 6 s. Both are now 4 s.
- *Compact band headings.* The "Prefer email? Write to the right team." band on the contact page, the message banners
  and the social banner use a deliberately smaller heading (18-24px). This is now a named role in the design system
  (*Band heading*) instead of being reported as an undersized section title.
- *Event card title.* The featured event title on the Events page grew to 27.5px on wide screens, above the 24px
  card-title maximum; it now stops at 24px.
- *Image alt text.* One media-library image (`hero-testoriumz.jpg`, shared by the testoriumz page, the Quality
  engineering page and the first insight card) still had its original upload alt text with a spaced em dash. It now
  reads "Continuous software testing and release assurance". A scan of all 77 pages (visible text, alt text, titles,
  labels and meta descriptions) found no other spaced em dashes outside headings.
- *Enquiry email footer.* The thank-you email footer now reads "Linkfields - One strategic partner across your
  transformation." A test enquiry (LF-261111-CUCCK) confirmed both emails in 0.5 s with no spaced em dashes and the
  agreed subject format; the test lead and its emails were then deleted.
- *Design-system document.* The type table, ramp, 12px rule, band-heading role and padding rules were updated, and
  three out-of-date statements were corrected (hero "6 seconds", header heights and 120px wide padding).

## 3. Mobile devices

**Device matrix.** `tools/device_matrix_qa.py` loaded 20 pages on 14 device profiles (iPhone SE, iPhone 14,
iPhone 15 Pro Max, iPhone 14 landscape, Galaxy S9+, Pixel 7, iPad Mini, Galaxy Tab S4, iPad Pro 11 landscape, laptops at
1280 and 1366, Safari 1440, desktop 1920 and 2560): 280 renders with **no horizontal overflow, no broken images, no
clipped text, one H1 per page, no text below 11px and no tap targets below the minimum**. One page (`/company/blog` on
iPhone 14) timed out while four test browsers were running at once; on its own, iPhone 14 loaded all 20 pages with no
problems.

**ATF pop-up.** Checked on iPhone SE, iPhone 14, iPhone 15 Pro Max, Pixel 7, Galaxy S9+, Galaxy Tab S4 and a 1440px
desktop. On every phone the pop-up opens by itself after 5-6 seconds as a bottom sheet; Venu Yeligeti's portrait and quote
card are shown and the photo is loaded; the Platinum Sponsor badge row stays on one line; *Book a meeting* and *Plan your
visit* stay pinned on screen; the sheet scrolls to its end (the calendar link is not hidden behind the buttons); there is
no sideways scrolling; and closing it leaves the small "Meet us at ATF" pill. On iPad sizes (768x1024, 810x1080,
820x1180 and 1024x768 landscape) the pop-up opens as the larger card with the full portrait (304-398px wide), date,
stand, venue, live countdown and all three actions. The published CMS settings run the pop-up as the meeting invitation until the
end of 19 November; on 20 November it becomes a short "Thank you for visiting us" reminder that does not interrupt
visitors, and it switches off automatically at the end of that day. The event moves to Past events after 19 November.

> The headless WebKit engine used for automated iPad testing cannot paint animated layers, so it reports the iPad pop-up
> as invisible even though it is open; the same page in Chromium at iPad sizes is correct (screenshots below). A
> two-minute look on a real iPad in Safari is still the best final confirmation.

![ATF pop-up on phones and iPad](/home/ubuntu/linkfields/docs/review/img/mobile-popup-ipad-2026-11-11.png)

**Globe size.** Measured at nine widths from 320 to 768px with `tools/mobile_hero_fit_qa.py`:

| Screen width | 320 | 360 | 375 | 390 | 412 | 430 and up |
| --- | --- | --- | --- | --- | --- | --- |
| Globe diameter | 186px | 209px | 218px | 226px | 239px | 240px |

This is the enlarged size introduced on 10 November (58% of the screen width, capped at 240px; previously 48%, capped at
200px). On every width the slide copy starts 12px below the globe and every one of the five slides ends at least 97px
above the slide dots, with nothing past the right edge.

## 4. Hand-over archive

The complete hand-over archive, `linkfields-complete-2026-11-11.zip`, was rebuilt after all of today's changes, so it
contains the fixes and tools described in this report. Its SHA-256 checksum is in the `.sha256` file next to it.

| Folder / file | Contents |
| --- | --- |
| `apps/web`, `apps/cms` | Website (Next.js) and CMS (Strapi 5) source, including CMS branding and the enquiry email templates |
| `seed/` | Content seed (pages, global settings, navigation) and all images, logos and media used by the site |
| `database/` | PostgreSQL backup with the CMS content, plus restore instructions (webhook secret redacted) |
| `infra/`, `.github/`, `docker-compose.yml` | AWS Terraform, CI/CD workflow and the local container set-up |
| `docs/` | Hand-over, deployment, design-system and CMS/email guides, request logs and review reports (this one included) |
| `tools/` | QA and packaging tools, including the five used for this verification |
| `README.md`, `HANDOVER.md`, `MANIFEST.txt`, `.env.example` | Start-here guide, file manifest and an environment template with placeholders only |

**Checks on the rebuilt archive.** The checksum file verifies; every `.env`-named file in it is a template containing
placeholders, not real passwords or keys; the CMS admin password, API tokens and SMTP keys are not included (they are in
the separate confidential access document); and the archive contains the files changed today (type ramp, padding,
4-second hero default, band headings, email footer, design-system document and the new QA tools). The installation, CMS
access and SMTP set-up steps are in the Word guide delivered on 10 November, which still applies unchanged.

## 5. Pending tasks from the request logs

All website and CMS changes requested up to 11 November are complete and deployed. The items below remain open; none of
them needs further design or development work, but each needs a decision or access that sits with Linkfields.

| # | Item | Why it matters | Who / next step |
| --- | --- | --- | --- |
| 1 | **Live email relay.** The preview CMS sends enquiry emails to Mailpit, a local test inbox, so no real mailbox receives them. The latest enquiry (reference LF-261110-YLF63, 10 Nov 13:33) was stored and both emails were generated correctly, but they are in the test inbox only. | Customers will not receive the thank-you email, and sales will not receive alerts, until a real relay is configured. | Linkfields IT: choose Brevo or Amazon SES (both already in the linkfields.com SPF record) and provide an SMTP key. Microsoft 365 is possible only if IT allows it; Microsoft turns off basic-authentication SMTP by default for existing tenants at the end of December 2026. Steps are in the SMTP guide. |
| 2 | **DKIM and DMARC.** No DKIM records were found for linkfields.com and DMARC is at `p=none`. | Without DKIM, enquiry emails are more likely to land in spam. | Linkfields IT: enable DKIM with the chosen relay and publish its DNS records; move DMARC to `p=quarantine` once reports are clean. |
| 3 | **Domain and hosting go-live.** The site runs on temporary preview URLs. | The final domain, HTTPS and Cloudflare protection apply only after deployment. | Linkfields IT with us: AWS and Cloudflare deployment as in `docs/DEPLOYMENT.md` (Terraform and CI/CD included), DNS for www and the CMS host, then a final smoke test. |
| 4 | **Real-iPad check of the ATF pop-up.** | Automated WebKit cannot paint the iPad pop-up (see section 3). | Linkfields team: open the preview on an iPad in Safari and wait 6 seconds - about two minutes. |
| 5 | **Test enquiries in the CMS.** Six test leads from linkfields.com addresses remain (10 Nov: three with references, including LF-261110-YLF63; 9 Nov: three older ones without references). Automated test leads were already deleted. | They would appear in reports as real enquiries. | Linkfields: confirm they are tests and delete them in *Content Manager › Lead*, or ask us to. |
| 6 | **Step headings with a spaced em dash.** 16 accordion step headings on four Data & AI service pages keep a spaced em dash (e.g. "Define the decision — baseline and error cost"), because the dash rule applies to text, not headings. | Consistency only. | Linkfields: confirm whether these headings should also use " - " (a five-minute content change). |

No other open items were found. Earlier recommendations are closed: contact-form hardening and email template tests (10
Nov), mobile menu performance (10 Nov), large-screen layout (10 Nov), the type rescale and spacing (10-11 Nov), the
static partner label (11 Nov) and this verification. Unknown URLs show the "Page not found" page with `noindex` and
return a real 404 status to search engines; this is a known trade-off of the framework, not an open task.

## 6. How to repeat these checks

Run each tool from the project folder as `python3 tools/<tool> <site-url> <output-folder>`:

| Tool | What it checks |
| --- | --- |
| `design_conformance_qa.py --jobs 2` | Type ramp and role sizes, gutters, header heights, section padding, hero fit and slide timing |
| `large_screen_qa.py --jobs 2` | Monitors, projectors and TVs (14 sizes): overflow, frame, overlap, marquee and hero fit |
| `device_matrix_qa.py --pages 20` | Phones, tablets and laptops (14 profiles): overflow, images, clipping, headings, tap targets |
| `promo_popup_qa.py` | ATF pop-up on phones, tablets and desktop |
| `mobile_hero_fit_qa.py` (site URL only) | Mobile globe size and hero fit at nine widths |

Running more than two browsers in parallel on a small server can cause page-load timeouts that are not website faults;
re-run any single failure on its own before investigating.
