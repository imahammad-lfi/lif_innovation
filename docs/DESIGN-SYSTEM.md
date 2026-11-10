# Linkfields design refresh — design system (2 Nov 2026)

Goal (client request): "relook at the font size and look and feel … proper small font, smart, clean, eye-catching,
very attractive" across the **entire website**. Keep all content, URLs, page structure and brand colours; modernise
typography, spacing, surfaces and interactions so the site feels like a premium 2026 technology brand.

Already done by the lead (do not redo):
- Fonts: **Plus Jakarta Sans** (`font-heading`: headings, nav, buttons, card titles, numbers) and **Inter**
  (`font-sans` / `font-inter` / `font-body`: everything else). Both SIL OFL, self-hosted via next/font.
- A codemod mapped every `text-[Npx]` to a compact scale and turned px line-heights into ratios. Values are now
  *approximately* right but not consistent; normalise them to the scale below.
- New header, mega menu and mobile drawer (`components/layout/*`), pill `Eyebrow`, `ReadMore` primitive.
- Utilities in `globals.css`: `btn-primary`, `btn-secondary`, `card-surface`, `hover-grow`, `hover-lift`, `px-gutter`.

## Type scale
Breakpoints used in this codebase: mobile `max-[768px]:`, tablet `max-[1025px]:`, desktop default (designed at 1440),
wide `3xl:` (≥1561px) or the existing `max-[1560px]:` desktop-first pattern. Keep whichever pattern the file uses.

| Role | Desktop 1440 | Wide ≥1561 | Mobile ≤768 | Font / weight / leading |
|---|---|---|---|---|
| Display (home hero h1) | 44px | 52px | 30px | heading 600, 1.1 |
| Page hero h1 | 40px | 48px | 28px | heading 600, 1.15 |
| Section title h2 | 32px | 40px | 24px | heading 600, 1.2 |
| Card / item title h3 | 18px | 20px | 16px | heading 600, 1.35 |
| Lead paragraph | 17px | 19px | 15.5px | sans 400, 1.6 |
| Body | 15px | 16px | 14.5px | sans 400, 1.65 |
| Small / meta / captions | 13px | 14px | 12.5px | sans 400–500, 1.5 |
| Labels (uppercase) | 11–12px | 13px | 11px | sans 600, tracking 0.12–0.14em |
| Big numbers (stats) | 56px | 64px | 40px | heading 600, 1.05 |

- Never use `font-light` / `font-thin`. Never use text below 12px except uppercase labels (≥10.5px).
- Paragraph measure: cap long copy at ~68ch (`max-w-[68ch]` or the existing width constraints).
- Headings get `text-wrap: balance` globally; h1/h2 have -0.015em tracking globally — do not add positive tracking
  to headings or nav. Uppercase labels keep their positive tracking.

## Colour
- Dark sections (default): headings `text-white` (or `text-cloud`), body `text-white/65` (≈ #a6a6a6; `text-ash` is
  acceptable), secondary/meta `text-white/50`. `text-stone`/`text-slate` are too dim for body copy — upgrade them.
- Light sections: background `#f5f6f7` or white, headings `text-[#0b0b0b]`, body `text-[#4b5157]`, meta `text-[#6b7177]`.
  Grey-on-grey (e.g. #a4a8a9 on #f0f0f0) is not allowed.
- Brand orange `#FF7800` (`brand`) only for accents: eyebrow, links, buttons, icon chips, small rules/dots, active states,
  numbers highlights. Never for body paragraphs.
- Optional accent gradient for display words / big numbers: `bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent`
  or orange `from-[#ff7800] to-[#ffb36b]` — use sparingly (max once per section).

## Spacing
- Section vertical padding: desktop 96px (`py-24`), wide 120px, mobile 64px (`py-16`). Keep consistent rhythm; remove
  extreme values (e.g. 150–200px gaps) unless a hero needs them.
- Section header: Eyebrow → h2 gap ~8px (Eyebrow already has margin), h2 → lead 16px, header → content 48px (mobile 32px).
- Grids: gap 24px desktop (`gap-6`), 32px wide, 16px mobile.
- Horizontal gutters: `px-gutter` (unchanged).

## Surfaces & shapes
- Cards: `card-surface` utility (soft border, subtle gradient, orange border on hover) or equivalent; padding `p-6`
  (wide `p-8`, mobile `p-5`); radius `rounded-2xl`. Add `hover-lift` for clickable cards.
- Images: `rounded-2xl overflow-hidden` + `ring-1 ring-white/10`; inside clickable cards, image zoom on hover
  (`transition-transform duration-500 group-hover:scale-105`).
- Icon chips (when a card has an icon image): `flex size-11 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/20`
  with the icon at `size-6` (mobile `size-10` / `size-5`). Coloured pastel icon tiles from the original may stay if they
  look good, but make them consistent within a section.
- Buttons: **always** `btn-primary` (orange pill) or `btn-secondary` (glass outline). Mobile: add `max-[768px]:h-11 max-[768px]:px-6 max-[768px]:text-[14px]`.
  Remove fixed widths like `w-[183px]`. Arrow icons: lucide `ArrowRight` `size-4`.
- Text links: `ReadMore` primitive (`components/primitives/read-more.tsx`).
- Dividers: `border-white/[0.07]` on dark, `border-black/[0.08]` on light.
- Tabs / pills: rounded-full, inactive `bg-white/[0.04] text-white/70 ring-1 ring-white/10`, active `bg-brand text-white`.

## Motion
- Keep the existing interaction language: every interactive element gets a subtle expansion on hover (`hover-grow`
  for buttons/links/icons, `hover-lift` for cards). Keep `animate-fade-up` where used. Respect reduced motion.

## Rules for page-family agents
- Edit **only** the files you own (listed in your brief). The lead owns `app/globals.css`, `app/layout.tsx`,
  `components/layout/*`, `components/primitives/*`, `components/sections/common/*`, `components/ui/*`.
  If you need a change there, describe it in your final report instead.
- Do not change content text, data shapes, CMS schemas, URLs, or seed data.
- Do not restart the dev server (shared, http://127.0.0.1:3000). HMR picks up component edits.
- Verify visually at **1440 and 390** (and spot-check 1920 and 1100): `python3 tools/type_audit.py <out_dir> --pages <paths>`
  (writes full-page JPGs + a font-size report) or `python3 tools/shot.py`. Check that nothing overflows horizontally
  at 390 (`document.scrollingElement.scrollWidth <= 390`).
- Run `pnpm exec eslint <your files>` (PATH=/opt/node26/bin:$PATH, cwd apps/web) and `pnpm exec tsc --noEmit -p .`.

## Additions (November 2026 round)

**Accent tiles (`.acc-tile`, `globals.css`).** Products & Accelerators cards and the Products mega-menu tiles take their colour
from `accentVars()` (`--acc`, `--acc-soft`, `--acc-line`). The class adds a corner accent wash, a masked gradient hairline
border (`::before`) and, on hover/focus, an accent glow with a 1.5% scale (disabled for `prefers-reduced-motion`).
Use `.acc-tile-flat` on containers that hold their own interactive rows (glow without the scale).

**Logo plates.** Product wordmarks are designed for light backgrounds, so on dark surfaces they always sit on a white plate
(menu: 118×34, drawer: 100×26, hub rows: `LogoChip`). Very wide wordmarks (aspect > 7, e.g. AI Governance) fall back to text in the menu.

**Industries grid (`sections.industries-grid`).** Slide-style dark navy photo cards: portrait image, title, one-sentence
description and dot tags; tag colours cycle blue / yellow / orange. Content comes from `seed/custom/portfolio.json → industries`
and is written into every industries grid, the Industries mega menu (photo cards with sub-industry chips) and the footer by `apply.py`.

**Sticky section tabs (`HeroTabs`).** The hero tab bar docks under the fixed header (portalled to `body`) once it scrolls out of view,
stays visible while scrolling in either direction, always highlights one section (scroll-spy, `aria-current`: the first tab while the
visitor is still in the hero or in an intro strip above the first section) and scrolls clicked sections to just below the dock. On wide
screens (xl+) the docked bar also names the page on the left and shows "02 / 05" plus a back-to-top button on the right; both side
columns use container queries and simply hide when there is no room, never truncating to a stub. A 2 px brand gradient along the
bottom of the docked bar shows reading progress. Small screens get a horizontally scrollable bar with edge fades; the current tab
is kept centred.

**Home globe (`videoStyle: "globe"`).** The supplied 1:1 globe video is never cropped: it plays inside a circular mask on a navy
stage (right half on desktop, above the copy on mobile), with a poster fallback and a static poster for reduced motion.

## Corporate-deck alignment (2026-11-08)

Source: `docs/CORPORATE-DECK-2026.md` (transcription of the 2026 corporate deck). Content and layouts are applied by
`seed/custom/deck.py` (called from `seed/custom/apply.py`, idempotent) for Home, Services, the five portfolio pages,
About us, Our approach and the Products & Accelerators hub.

**One tile model.** Every tile on the site uses the `card-surface` utility (globals.css): navy `#0c111d` fill, accent wash from
the top-left, gradient hairline border and a 36 px accent tab on the top edge; hover lifts 1.2 % with an accent glow.
Colour comes from `--acc` (set by `accentVars()`), which defaults to the page portfolio colour via `lib/page-accent.ts`:
Digital Transformation orange, Intelligent Enterprise Platforms blue, Data & AI purple, Cyber Security teal,
Talent Advisory & GCC yellow. `acc-tile` remains only for menu tiles. Products/accelerator cards were moved to `card-surface`.

**Deck primitives** (`components/primitives/deck.tsx`): `Highlight` (`*text*` brand orange, `_text_` yellow in any heading),
`DeckBars` (yellow/orange/blue bars under headings), `DeckLabel` (spaced orange capitals; `Eyebrow` now renders the same style),
`DeckStage` (navy or ink section background), `DeckHeader`, `LogoPlate` / `LogoRow` (logos always on white plates; `grid`
for logo walls), `Bullets` ("Title – detail" lines).

**New CMS sections**: `sections.feature-tiles` (variants default / portfolio / compact, 1–5 columns with centred orphans,
optional logo wall, note with chips when separated by " · ", strip with " | "), `sections.metrics-grid` (client value),
`sections.value-plays` (trigger → outcome → IP table, stacked on mobile), `sections.who-we-are` (positioning, mission,
vision, facts), `sections.global-presence` (dotted map `public/maps/world-dots.svg` from Natural Earth, lat/lng pins,
animated arcs from the HQ; arcs stop under prefers-reduced-motion). `hubs.what-we-offer` is now a photo tile grid
(the tabbed panel was retired); `home.solutions-grid` uses white logo plates (`seed/assets/custom/platforms/`).

**Content decisions**: Machine learning moved from Cyber Security to Data & AI as in the deck
(`/services/cyber-security/machine-learning` → 308 → `/services/data-ai/machine-learning`; copy reframed for prediction,
scoring and forecasting). Years-of-experience statistic unified to "20+ years of industry leadership experience".
Deck metrics are quoted as the deck states them (e.g. "Up to 6×", "95%+ reported project success rate").

## Review implementation round (2026-11-09)

- **One template per page type.** Pillar, sub-service, product, accelerator, industry, solution and company pages follow the
  section sequences in `docs/review/WEBSITE-REVIEW-RECOMMENDATIONS.md` §8. Legacy blocks (social banner, CTA strip, repeated
  insights, "Building tools", specialisation carousel, unsourced stats bands, duplicate "What we offer" grids) are no longer used.
- **In-page tab bar (`common/hero-tabs.tsx`).** The docked bar animates in only when docking and disappears instantly when the
  hero bar returns, so two bars never show together. While the hero bar is visible the first tab is the current one. After a smooth scroll
  the landing is re-checked on `scrollend` (with a 1 s fallback) and corrected if lazy media moved the target. Both bars use
  `.tab-scroller` with `data-fade` edge masks that appear only on the side where more tabs are hidden. QA: `tools/tabs_harden_qa.py`.
- **Rich-text links (`.md-link`).** Links in CMS Markdown are semibold with a 1.5 px underline in the page accent
  (`--acc-line`, `--acc` on hover) and an accent focus ring. `.prose-lf a` (legal/blog prose) keeps its own brand colour.
- **Contact form.** Visible labels, optional international phone (7–15 digits), optional grouped "Area of interest" with
  preselection from the page path, privacy notice linked to `/privacy-policy`, rate-limited API (HTTP 429).
- **404.** Branded not-found page with recovery links and `noindex`. With `cacheComponents` the first uncached hit of an
  unknown URL streams that page with HTTP 200; cached hits return 404. Revisit if a strict first-hit 404 is required.

## Round 9 Nov (12:33): contact pop-up, hero strips, recognitions footer

- **Contact pop-up** (`components/layout/contact-dialog*.tsx`, `lib/contact-dialog.ts`): every "Let's connect" link, `#get-in-touch` anchor, docked-tab "Let's connect" and `/contact-us?interest=…` link opens the form in a Radix dialog (desktop: two-column card; phones: bottom sheet). Close with X, Esc or backdrop. Real `/contact-us` page keeps the inline form. Modifier-clicks fall through to normal navigation. *(Navigation behaviour superseded at 13:31, see below: the link now goes to its destination first.)*
- **Supportive wording**: the form asks for "Your requirements" ("Tell us about your business requirements"); `apply.py` rewrites "business challenge(s)" in authored content. Values copy and quotes are left untouched.
- **Hero strips** (`primitives/marquee.tsx`, `.marquee*` CSS): two seamless marquees under the home hero: *credentials* (20+ years, #35 FT 2026, ISO, B-BBEE Level 1, Great Place To Work, YES, NASSCOM, D-U-N-S) and *OEM & technology partners* (white mono logos, `seed/assets/custom/partners/mono/oem-mono-*.png`). Hover/focus pauses; the hero pause button stops slides and strips; `prefers-reduced-motion` shows a static, scrollable row. CMS: `home.hero-slider.proofPoints` (with `logo`), `partners`, `partnersLabel`.
- **Footer trust strip**: groups *ISO certifications*, *Recognitions* (FT 2026, B-BBEE, Great Place To Work, YES) and *Memberships & registrations*. Every badge is an 80px tile (wide marks 168px) with a 60px white plate and centred caption, 8px apart within a group, groups separated by hairline dividers. On phones a wide mark in a group of 4+ takes its own row. *(The "Meet us next" footer card was removed at 13:31.)*
- **Media naming rule**: the CMS importer reconciles uploads by file name, so variant assets need unique names (e.g. `oem-mono-oracle.png`, not `mono/oracle.png`).

## Round 9 Nov (13:31): contact pop-up on the contact section, landing, countdown

- **Contact pop-up never replaces the page.** `lib/contact-dialog.ts` decides per click:
  - *Section mode*: links to the on-page contact section (`#get-in-touch`, the docked "Let's connect" tab), and any
    contact link clicked while already on `/contact-us`. The page scrolls to its "Let's connect" section first, then
    the form opens as a pop-up over it. Closing it leaves the visitor on that section.
  - *Page mode*: links to the Contact page from elsewhere (header CTA, banners, event "Book a meeting",
    `/contact-us?interest=…#get-in-touch`). The router opens the Contact page (at its form section when the link has
    the hash), then the pop-up opens. Closing it leaves the visitor on the Contact page; the inline form still works.
  - Plain "Contact us" navigation (menus, footer) just opens the Contact page, without a pop-up.
  - Focus returns to the trigger without scrolling (`preventScroll`), so closing never moves the page.
- **Section landing** (`lib/landing.ts`, `components/layout/hash-landing.tsx`): the offset is a CSS variable
  (`--lo-header` + `--lo-dock` via `html:has(nav[aria-label="On this page"])`, used by `scroll-padding-top`), so
  native hash jumps, router hash changes and tab clicks all land the section flush under the header and docked tabs.
  Do not add `scroll-mt-*` classes to sections; they double the offset.
  Only one landing runs at a time (`landOn` in `lib/landing.ts`): a landing on another section cancels the one still
  holding the previous section in its 2.5 s settle window; a second landing on the *same* section joins it (so the
  contact pop-up's arrival callback still fires). Hash-only changes on the same page (address-bar edits, Back/Forward
  between sections) are landed by `HashLanding` via `hashchange`/`popstate`.
- **Page wrapper must be a real box.** `RenderSections` uses a block `div`, never `display: contents`: Next.js skips
  scroll-to-top when the first page element has no box, which made pages open at the old scroll position (the footer).
  `<html data-scroll-behavior="smooth">` lets the router disable smooth scrolling during navigation.
- **Event countdown** (`components/primitives/event-countdown.tsx`): tiles variant (pop-up, Events card) and inline
  variant (reminder pill). States: doors open in · open now (day N of M, until HH:MM SAST) · next day opens in · over.
  Uses `role="timer"` with a spoken label; respects `prefers-reduced-motion` (no ping).
- **Footer**: no event card. Events are promoted only by the pop-up, the reminder pill and `/events`.
- **Pop-up frequency**: dismissal is stored in `sessionStorage` (`lf-promo-v2:<id>`), i.e. once per visit, never permanently;
  legacy `localStorage` flags (`lf-promo:<id>`) from earlier builds are cleared on load. On `/events/<slug>` of the active event the
  modal is replaced by the reminder pill. Recommended exclusion is `/contact-us` only.

## Round 9 Nov (16:43): compact menu and footer, gradients, offices

- **Services mega menu (compact)**: three portfolio tiles, then two wide tiles filling the row. In wide tiles the
  services list sits on the left with the *Linkfields IP* / *Engagement models* items as compact chips in a column
  beside it (`split`); narrow tiles stack the chips under the list (`stack`). Chips keep the tile accent.
- **Mega menu closing**: any link click inside an open mega menu closes it. Route changes already closed it, but
  same-page section links (e.g. *BFSI › Banking* while on `/industries/bfsi`) keep the path and previously left the
  menu open over the page.
- **Pinned section bar**: compact when docked (smaller tab padding/type) so the full page name (up to two lines)
  and every tab fit at 1280–1920 px; below 1280 px (`xl`), or when its slot is under 130 px, the page name is
  hidden rather than cut off, and the tabs scroll horizontally if they need to.
- **Gradients**: `bg-brand-gradient` (orange → amber, 135°) is the single fill for primary actions: header CTA,
  `btn-primary`, active tab pills, HQ badges, the scroll-to-top core and social-icon hover. `btn-secondary`
  stays a glass/outline button with a gradient hairline on hover. Avoid flat `bg-brand` for buttons.
- **Scroll-to-top**: gradient core inside a dark glass ring whose arc shows page progress. It rises above the footer
  bottom bar (`[data-footer-bar]`) when that bar is on screen, so it never covers the legal links or social icons.
- **Footer (compact)**: brand block (logo, positioning line, a single two-row enquiry contact card) beside five link
  columns at a 26 px rhythm; *Our offices* row (six columns: country, HQ badge, flowing address, *Directions*);
  trust strip on 52 px plates; one bottom bar with copyright · legal links · social icons (32 px, monochrome,
  gradient on hover; GoodFirms uses a matching monochrome shield mark). Phones: link columns collapse into
  accordions; offices use two columns.
- **Offices** (`Global › Offices`, component `layout.office`): country, role, HQ flag, address (one line per row),
  optional map query and accent. Used by the footer and by the `sections.office-locations` section (Contact page,
  `#our-offices`): selectable office cards beside a dark-styled Google map that loads only when the section nears
  the viewport; *Directions* and *Open in Google Maps* use the documented Google Maps URLs format. No phone numbers.
- **Contact form**: the dialling code always defaults to South Africa (+27); visitors can change it.
- **Link QA tools**: `tools/link_audit.py` (every internal link, redirect and `#section` target from server HTML
  plus CMS data; optional external probe) and `tools/nav_click_qa.py` (clicks every mega-menu, mobile-drawer and
  footer link and checks the destination and landing position).

### Editors: changing an office address

Strapi › Content Manager › **Global** › *Offices* → edit the entry (put each address line on its own line; leave
*Map query* empty to pin the address itself, or enter a building/company name for a more precise pin) → **Save**
and **Publish**. The footer and the Contact page update together. Reorder entries by dragging; tick
*Is headquarters* on exactly one office.

### Link integrity (9 Nov, 17:40)

- **Hidden background pages**: Next.js 16 (`cacheComponents`) keeps recently visited routes alive in a hidden
  React `<Activity>`, so their DOM (and ids such as `get-in-touch`, `overview`) stays in the document. Never use
  `document.getElementById` for landing/scroll-spy/pop-up targets; use `byId()` / `visibleQuery()` from
  `src/lib/dom.ts`, which return the rendered copy. Form field ids are unique per form (`useId`), and the page
  hero heading id includes the page path.
- **Same-page links**: a link to the page already shown (footer logo on Home, *Explore services* on `/services`)
  smooth-scrolls to the top (instant with reduced motion); any mega-menu link click closes the menu.
- **404s**: unknown URLs render *Page not found* with `noindex`. `htmlLimitedBots` adds Googlebot to Next's
  blocking-metadata bot list, so crawlers get a real 404 even on a path's first request (browsers may receive a
  streamed 200 on that first request; the visible page is the same).
- **Footer badges**: *Great Place To Work®* links to `/careers#employer-story` (it previously pointed to a
  non-existent `/company/careers`).

## Round 2026-11-09g — hover colour, partner strip, gradients, content corrections

- **Button hover = colour change, not only growth.** `btn-primary` (orange gradient) cross-fades to the royal-blue
  gradient on hover/focus; `btn-secondary` (dark outline) fills with the orange gradient. One-off gradient CTAs
  (header, mobile drawer, event pop-up, scroll-to-top) use the `hover-swap` utility for the same blue cross-fade.
  New buttons must use one of these three; do not add bespoke hover colours.
- **Partner logos come in pairs.** `elements.home-partner` has `image` (white mark, ~opacity 60% on the banner) and
  `colorImage` (original colours on a white chip, shown on hover/focus). Assets live in
  `seed/assets/custom/partners/mono/` and `.../partners/color/` with matching names (`oem-mono-hp.png` /
  `oem-color-hp.png`). Source and licence of each new colour logo is recorded in `docs/request-2026-11-09g.md`.
- **Marquee copies are not `inert`.** `Marquee` renders the set three times; copies 2–3 are `aria-hidden` and
  `data-marquee-copy`, and `MarqueeFocusGuard` sets `tabindex=-1` on their links after hydration. `inert` must not be
  used: it disables hover and clicks on the copies that fill most of a wide screen.
- **Gradient text for highlights.** `Highlight` (`*phrase*` / `_phrase_` in headings) renders `text-gradient-brand`
  (orange → amber) / `text-gradient-gold`. Both keep a solid fallback colour and `box-decoration-break: clone`, so
  wrapped phrases stay continuous. Use these utilities for any new highlighted text instead of flat `text-brand`.
- **Contact email band** (`company.contact-banner`): optional heading/description left of three glass cards with
  accent icon chips; stacks below 1360px so every address fits; arrow sits in the card corner. No full-bleed blue
  bands anywhere on the site.
- **Products menu tiles carry no numeric eyebrows** (01–04 removed); category eyebrows on accelerator tiles stay.
- **Content corrections are data, not hand edits.** `seed/custom/content_fixes.json` (applied last by
  `seed/custom/apply.py` via `content_fixes.py`) holds every reviewed wording fix and SEO block with a `_why` note.
  An edit whose `find` text no longer exists is reported, never silently dropped. Blog posts are keyed by slug
  under `posts`, pages by path under `pages`.
- **Badges must comply with the issuer's rules** (see `docs/review/CONTENT-SEO-COMPLIANCE-REVIEW.md` §5): no ISO
  logo, no expired GPTW badge, no Statista award logo without a licence.

### Resource hints and structured data (10 Nov 2026)

- **Never declare a page-specific preload in a server component.** `ReactDOM.preload()` and a hoisted `<link rel="preload">`
  rendered by a server component both become Flight "hints". The browser applies them as soon as *another* page prefetches
  that route (Next.js prefetches the home page whenever the logo is in view), so the asset downloads on every page.
  Declare such preloads inside a client component (as `GlobeVideo` does for the home poster); SSR still emits them into
  `<head>` for the page itself.
- **Event pages carry their own schema.org `Event`.** `app/[[...slug]]/page.tsx` matches `/events/...` pages to the CMS
  Event whose *Detail link* points at the page and emits `eventsJsonLd([event])`. The `/events` hub keeps the full list.
  Editors only need the Event's *Detail link* to be the event page's path.

### Home hero slides (10 Nov 2026)
- **Five slides, in this order:** One strategic partner · *Strategic value plays* ("We lead with outcomes, not
  offerings", corporate deck slide 15) · AI Code Assurance · Global Capability Centres · Software and accelerators.
- **Timing: 6 seconds per slide**, set in the CMS: *Content Manager › Page › Home › Hero slider › Autoplay seconds*
  (whole number, 4–15, default 6). The active dot fills with the brand gradient as the time runs, so visitors can see
  when the next slide is coming.
- **Pause rule:** the timer pauses only while the cursor or keyboard focus is on the slide copy (eyebrow, headline,
  text, chips and buttons), not over the globe or the rest of the hero. When the cursor leaves, the slide resumes with
  its remaining time instead of restarting. The pause/play button stops autoplay completely; with *reduced motion*
  switched on in the operating system there is no autoplay.
  (Before this change, the pause covered the whole full-screen hero, which made slides feel like they took about 10 s.)
- **Per-slide options** (*Hero slider › Slides › [slide]*):
  - *Eyebrow*: optional label above the headline that replaces the hero's main eyebrow for that slide only
    (the value plays slide uses "Strategic value plays").
  - *Chips*: optional linked labels under the text (*Hero chip*: label, link, accent colour). The value plays slide
    lists the five plays in their deck colours, each linking to its solution page. Keep chips to five or fewer
    short labels. They show from 1024 px upwards; on tablets in portrait and on phones they are hidden and the slide's
    button ("Explore the value plays" → `#value-plays`) leads to the full section just below.
- The home *Strategic value plays* section no longer repeats the slide headline in its description
  ("Pick the challenge closest to yours…"), so the two read as a lead-in and the detail rather than a duplicate.
