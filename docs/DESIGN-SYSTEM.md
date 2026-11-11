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

**Type ramp (11 Nov 2026).** Only these font sizes are used anywhere on the site (px):
`10.5 · 11 · 11.5 · 12 · 12.5 · 13 · 13.5 · 14 · 14.5 · 15.5 · 16 · 16.5 · 18 · 20 · 21.5 · 24 · 27.5 · 34.5 · 40 · 41.5 · 46 · 48 · 55`
(16px is reserved for form fields on phones). Each role below has a primary size and a permitted range of ramp steps;
components choose from that range (compact cards use the lower steps, feature cards the upper ones).

| Role | Desktop 1026–1560 | Wide ≥1561 | Mobile ≤768 | Font / weight / leading |
|---|---|---|---|---|
| Display (home hero h1/h2) | **40px** (34.5px ≤1180px wide or on short screens) | **46px** | **27.5px** | heading 600, 1.08, -0.022em |
| Page hero h1 | **34.5px** | **41.5px** | **24px** | heading 600, 1.15 |
| Section title h2 | 27.5px (statement headings up to 40px) | 34.5px (27.5–46px) | 21.5px (up to 27.5px) | heading 600, 1.2 |
| Band heading (compact bands: email contacts, message and social banners; `data-type-role="band"`) | 20px (18–24px) | 21.5–27.5px | 18px (16.5–21.5px) | heading 600, 1.25 |
| Card / item title h3 | 16.5px (14–24px) | 18px (14.5–24px) | 14.5px (13.5–21.5px) | heading 600, 1.35 |
| Lead paragraph | 15.5px (hero lead 14.5px) | 17px (hero lead 16.5px) | 14.5px | sans 400, 1.6 |
| Body | 14px | 14.5px | 13.5px | sans 400, 1.65 |
| Small / meta / captions | 12.5px (min 12px) | 13.5px (min 12px) | 12px | sans 400–500, 1.5 |
| Labels (uppercase or letter-spaced) | 11–11.5px (10.5–13.5px) | 11.5–12.5px (10.5–13.5px) | 11px (10.5–12.5px) | sans 600, tracking 0.12–0.22em |
| Chips, tags, badges (pills) | 11–11.5px (pill tabs up to 13.5px) | up to 13.5px | 11px (pill tabs up to 13.5px) | sans 500–600, 1.3–1.4 |
| Big numbers (stats) | 48px (18–55px) | 55px | 34.5px (16.5–41.5px) | heading 600, 1.05 |
| Menu items (header) | **13px** (12.5px at 1024–1025px, where the full menu is compacted to fit) | **13.5px** | drawer 15.5px (sub-items 13.5px) | sans 500 (drawer: heading 600) |

Bold values are exact; the others are the primary size with the permitted range in brackets. Text and buttons stay
between 12px and 16.5px (wide 18px); footer text between 12px and 14.5px.

Scale reduced on 10 Nov 2026 (client: "make the font size small to give more smart look"): every arbitrary
`text-[Npx]` class was rescaled once (≤11px unchanged, 11.5–14px −0.5px, 14.5–18px ×0.92, 18.5–24px ×0.90, >24px
×0.86, rounded to 0.5px). Form fields stay at 16px on phones (`max-sm:text-[16px]`) so iOS does not zoom on focus.
On 11 Nov 2026 the remaining odd sizes (15, 17, 19, 22.5, 26, 29, 31, 36, 38, 39.5, 44.5, 46.5px …) were moved to the
nearest ramp step (ties go to the smaller step) with `python3 tools/type_ramp_codemod.py` (80 classes in 37 files;
re-run it with `--dry` after adding components: it must report 0 changes).

- Never use `font-light` / `font-thin`. Never use text below 12px, except uppercase / letter-spaced labels (≥10.5px)
  and pill chips, tags and badges (≥11px).
- Check: `python3 tools/design_conformance_qa.py <base> <out_dir>` measures every page × screen size (phone, projectors,
  laptops, FHD, QHD, ultrawide, 4K, 5120px) against this table, the ramp, the 12px rule, gutters, header heights,
  section padding, hero height / globe offset and the hero autoplay timing (writes `summary.md`).
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
- Section vertical padding: desktop 96px (`py-24`), wide 112px (`3xl:py-28`; the last 31 sections at 120px were
  aligned on 11 Nov 2026), mobile 64px (`py-16`). Compact bands ("Our approach" timeline) use 64 / 80px. Keep consistent rhythm; remove
  extreme values (e.g. 150–200px gaps) unless a hero needs them.
- Section header: Eyebrow → h2 gap ~8px (Eyebrow already has margin), h2 → lead 16px, header → content 48px (mobile 32px).
- Grids: gap 24px desktop (`gap-6`), 32px wide, 16px mobile.
- Horizontal gutters. Two gutters (10 Nov 2026): the **menu bar** (`px-gutter-nav`: 20 / 40 / 48px) runs wider
  than the **page content** (`px-gutter` / `pl-gutter`: 20 / 40 / 96 / 128 / 144px at <640 / ≥640 / ≥1025 / ≥1281 /
  ≥1561px), so content sits about one inch (≈ 88–96 CSS px) inside the logo and the header CTA on desktops.
  Wider than 1920px both gutters grow (`max(144px, (100% - 1920px) / 2 + 144px)` for content), so everything stays
  in one centred 1920px frame on large monitors, ultra-wides, 4K TVs and projectors while backgrounds stay full-bleed.
  Use `px-gutter` on full-width blocks only (the percentage resolves against the containing block); boxed elements
  with their own `max-w-…` use `px-gutter-box` (fixed 20 / 40 / 96 / 128 / 144px). Do not add `mx-auto max-w-[1920px]`
  around a `px-gutter` element. The pinned section-tab bar uses `px-gutter-nav` (it lines up with the menu bar).
  The hero globe is offset from the right just outside the content edge
  (`max(120px, 50% - 840px)` / 104px / 72px / 48px at ≥1561 / ≥1281 / ≥1181 / ≤1180px).
- Short desktop screens: the `short:` variant (`≥769px` wide and `≤760px` tall — laptops with browser chrome,
  720p/768p projectors) compacts the home hero copy; the desktop hero height follows the screen
  (`clamp(650px, 100svh, 860px)`, wide `clamp(720px, 100svh, 1000px)`) and the globe shrinks with it.
- Large-screen check: `python3 tools/large_screen_qa.py <base> <out_dir> [--shots]` (17 pages × 14 sizes from
  1024×768 projectors to 5120 super-ultrawide: frame alignment, hero fit, marquee fill, overflow, widget overlap).

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

**Logo plates.** Product wordmarks are designed for light backgrounds, so on dark surfaces they always sit on a white plate.
The one exception is the product page banner (below), which uses a dedicated on-dark version of the logo with no plate.

**Balanced product logos (11 Nov 2026, 12:22).** A plate fits its logo into a fixed box, so before this change a logo with
a tall icon (VajraX, FinSight) got a small wordmark and a text-only logo (VectorX, AI Governance) a large one. Now every
product logo is used through a *plate file* (`seed/assets/custom/logos/plate/<slug>-plate.png`, made by
`tools/logo_plates.py`): the same transparent canvas shape (3.25 : 1) with the logo scaled so its lower-case letters
(x-height, measured by `tools/logo_metrics.py`) are 24% of the canvas height. Rules:
- Any box shows every product wordmark at the same text size. Boxes use the plate shape (`PLATE_BOX`,
  `lib/logo-plate.ts`): desktop menu 124×38 (136×42 from 1920px), drawer 112×34, hub product rows (`LogoChip`) and logo
  tiles (`LogoPlate`, max height 30/40/54). Measured on production: one x-height per context (menu 8.0px at 1440 and 8.9px
  from 1920px, drawer 7.1px, hub cards 8.7px, product tiles 8.1px), spread 0.0px across all eight logos.
- Components recognise plate files by `_plate_` in the uploaded file name (keep `-plate` in the name when uploading); partner
  and platform logos are unaffected and keep their own boxes.
- Plate logos and banner logos are delivered at image quality 90 (default 75) for clean edges; both are small files.
- The Services mega-menu shows Linkfields IP as text chips with icons, not logos (by design).

**Product banner logos (11 Nov 2026).** The eight product pages (Linkworks, testoriumz, VajraX, VectorX, AI Governance,
textIQ, FinSight, EduPilot) show the product logo in the page banner in place of the text title; accelerator pages keep the
text title. Rules:
- Use the on-dark SVG in `seed/assets/custom/logos/svg/<slug>-on-dark.svg` (since 11 Nov 10:33; the earlier PNGs in
  `logos/on-dark/` are superseded): black or navy wordmark turned white, brand blue lifted to a lighter tint of the same hue
  (HLS lightness at least 64%) so it reads on the dark banner, orange and yellow unchanged. Never place the
  light-background original directly on a banner.
- **VajraX exception (11 Nov 12:22).** VajraX has a new official logo (shaded icon, black "Vajra", orange "X"), supplied
  as a 2048 px transparent file. It is used directly, not traced: `logos/vajrax.png` (trimmed, 1600×610) for plates and
  `logos/on-dark/vajrax-on-dark.png` for the banner, where only the black "Vajra" letters are turned white (icon and orange
  "X" untouched). At 1600 px it is about four times the largest displayed size, so it stays sharp; the old 2025 logo is kept
  only in `logos/retired/` and has been removed from the Media Library. `tools/vectorise_logos.py` skips VajraX.
- Banner logos must be vector (SVG). The product logos only exist as small bitmaps cut out of a white background; drawn
  larger on high-density screens and re-compressed by the image optimiser they showed soft, lumpy edges with a pale
  fringe. `tools/vectorise_logos.py` traces each original into an SVG: it removes the white matte from the edge pixels,
  finds the flat brand colours, smooths each colour's outline (stair-steps and compression bumps removed) and traces it
  with potrace. Flat-colour logos become pure vector; the shaded VajraX icon keeps its own shading inside a traced vector
  outline, so its edges are crisp too. SVGs bypass the image optimiser and stay sharp at any size. Re-run the tool after
  replacing a logo, and judge the result at 5x zoom on the dark banner colour.
- Size by area, not height, so compact marks and long wordmarks carry the same visual weight: width = √(area × aspect),
  with area 6,800 px² on phones, 10,000 from 640px, 14,000 from 1280px and 17,500 from 1920px (for example testoriumz
  199×34 → 285×49 → 319×55; AI Governance 249×27 → 357×39 → 399×44). Width is capped at min(84vw, 560px).
- The h1 keeps the product name as screen-reader-only text; the image is decorative (empty alt), so the name is announced
  once and search engines still see the heading text. A soft drop shadow separates the logo from busy backgrounds.

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
- **Timing: 4 seconds per slide** (changed from 6 s on 10 Nov, client request), set in the CMS: *Content Manager ›
  Page › Home › Hero slider › Autoplay seconds* (whole number, 4–15; default and website fallback 4 since 11 Nov).
  The active dot fills with the brand gradient as the time runs, so visitors can see when the next slide is coming.
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

## Round 10 Nov 2026 (23:42): smaller type, compact header, inset content, process timeline
- **Header**: full height at the top of the page, compact once scrolled (`html[data-hdr="compact"]`, set in
  `header-client.tsx` with hysteresis). Heights live in `--hdr-h`: phones (<640px) 64 → 56px, tablets and desktops
  (640–1560px) 72 → 60px, wide (≥1561px) 84 → 64px (plus a 1px bottom border). Anything that sits under the header (mega menu, pinned tabs, landing offsets in `lib/landing.ts`)
  reads `--hdr-h` / the compact height, never a hard-coded 72/84px. Use the `compact:` variant for styling.
- **Hero**: 4 seconds per slide (`autoplaySeconds` on the hero, CMS field 4–15). The eyebrow is a glass pill with a
  glowing brand dot (plain label on phones); the description has a slim orange → blue accent rule.
- **Strips**: the credentials and partner strips are full-bleed (edge to edge on every screen). `Marquee` takes a
  `copies` prop so a 5120px screen never shows a gap. The "OEM & technology partners" label is static (11 Nov, client
  request): it sits at the left of the partner strip (fixed content gutter 40 / 96 / 128 / 144px, so it lines up with the
  hero copy up to 1920px) and only the logos scroll, from beside the label to the right edge of the screen. On phones the
  label sits above the logos.
- **"Our approach" (`services.numbered-help`)**: a compact numbered timeline (gradient-ring markers 01–04 joined by a
  gradient rule; 4 / 2 / 1 columns) on a deep navy band (`py-16`). Editors write each step as
  `Title - description`; the lead-in becomes the step title.
- **Dashes**: body text uses a spaced hyphen " - " instead of spaced em/en dashes. `seed/custom/apply.py`
  (`dash_style`) enforces it on every seed run; headings, titles, names, alt text, date ranges and the official
  event name "PitchXPO Conclave 2026 – Real Economy" keep their typography. Editors adding copy in Strapi should
  type " - " in body text.

## Round 11 Nov (12:22): VajraX logo, privacy pop-up, balanced product logos

- **New VajraX logo** everywhere (menu, drawer, product cards, Linkfields IP tiles, VajraX banner); see *Product banner
  logos › VajraX exception* above.
- **Balanced product logos**: all product logos on white plates use plate files with equal x-height; see
  *Balanced product logos* above.
- **Privacy Policy pop-up** (`components/legal/privacy-dialog.tsx`, `privacy-content.tsx`, `app/api/legal/privacy`). The
  "Privacy Policy" link in the enquiry form (pop-up and inline on the Contact page) no longer opens the page behind the
  form. It opens a second dialog stacked above the enquiry form (z-index 1170/1180, above the contact dialog), so the policy
  is always in front and the form never needs to be closed:
  - The text is the published *Privacy policy* page (its rich-text sections), fetched when the link is first used, so the
    policy is edited in one place. Its `##` / `###` headings become h3 / h4 under the dialog title (h2).
  - Desktop: centred 760px panel; phones: bottom sheet. Own scroll area; the page and the form behind do not scroll.
  - Close with ×, "Back to the form", Escape or a click outside. Only the policy closes; the enquiry form stays open with
    everything typed kept, and focus returns to the "Privacy Policy" link.
  - "Open the full page ↗" opens `/privacy-policy` in a new tab. Ctrl/⌘-click and middle-click on the link keep normal
    link behaviour; without JavaScript the link still opens the page.

- **Link chips (deck rows)** - text chips next to logo plates use `rounded-[15px]` rather than `rounded-full`: on one line
  (30 px tall) they are the same pill; when a long label must wrap in a narrow column (1280-1365 px four-column tiles) the
  chip becomes a tidy rounded tag with balanced lines instead of an oval. They carry `data-chip` so QA tools classify them
  as chips (11-13.5 px) at any height. Do not force `whitespace-nowrap` - the label would overflow the column.
