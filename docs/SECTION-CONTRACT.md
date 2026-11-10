# Linkfields clone – section contract (read fully before you start)

We are rebuilding **https://www.linkfields.com** as a pixel-faithful copy ("no changes": same copy, images,
layout, colours, behaviour) on **Next.js 16 (App Router, React 19, TypeScript) + Tailwind CSS v4 + shadcn/ui**,
with all content managed in **Strapi 5 (PostgreSQL)**. Pages are composed of *sections* stored in a
Strapi dynamic zone (`Page.sections`). Each section = one Strapi component schema + one React component +
seed data produced from the crawl of the original site.

The work is split by **page family**. You own one family. Several people work in parallel in the same
repository, so **only create/edit files you own** (listed in your task). Never edit shared files; if you
need a change in a shared file, describe it in your final report instead.

## 1. Repository layout

```
/home/ubuntu/linkfields
├─ apps/web                         Next.js site (dev server ALREADY RUNNING at http://127.0.0.1:3000 – do NOT start another one, do NOT run `next build`)
│  └─ src/components/sections/
│     ├─ registry.tsx               shared – maps Strapi UID -> React component (merges each family map)
│     ├─ types.ts                   shared – SectionProps / SectionMap
│     ├─ common/                    shared – common sections (owned by the lead)
│     └─ <family>/index.ts          YOURS – `export const <family>Sections: SectionMap = { "<family>.<name>": Component }`
├─ apps/cms                         Strapi 5 (not running – you only add schema JSON files)
│  └─ src/components/
│     ├─ shared/ layout/ sections/  shared building blocks & common sections (read-only for you)
│     ├─ <family>/<name>.json       YOURS – one file per section component (auto-registered in Page.sections)
│     └─ elements/<family>-<name>.json  YOURS – nested helper components used inside your sections
├─ seed/transform/                  Python: crawl -> Strapi seed JSON
│  ├─ lib.py                        shared helpers (read it!)
│  ├─ build.py                      runner: `python3 seed/transform/build.py <family>`
│  └─ families/<family>.py          YOURS – `build() -> list[page]` (and optional `extra()`)
├─ seed/data/pages/<path>.json      generated (one file per page) – never edit by hand
└─ seed/assets/                     images (S3 + site assets) referenced by {"__media": "<rel path>"}
```

Crawl of the original (read-only): `/home/ubuntu/lf-crawl`
- `shots/<page_key>.jpg` full-page screenshots at 1440 px, `small/<page_key>_<n>.jpg` 720 px slices (view these!)
- `rendered/<page_key>.html` fully rendered DOM, `pages/<page_key>.html` raw HTML
- `clean/<DocName>.json` + `data/<page_key>.json` TinaCMS documents (= the original structured content)
- `all.css` original CSS, `assets/` downloaded media, `menu/` mega-menu screenshots
- page_key = path with `/` → `__`, home = `home` (e.g. `services__engineering__devops`)

Tools:
- `python3 /home/ubuntu/lf-crawl/section_dump.py <page_key> "<class or text>" [max_chars]` – original markup of one
  section + all its CSS-module rules (incl. media queries). **Use this for exact sizes/colours/spacing.**
- `python3 /home/ubuntu/linkfields/tools/shot.py <path> <out.png> [--width 390] [--selector "#id"] [--slice 1400]` –
  screenshot of our local page (default full page at 1440 px). Compare with `lf-crawl/shots` / `lf-crawl/small`.
- `/opt/node26/bin/node /home/ubuntu/linkfields/apps/cms/scripts/validate-seed.mjs <filter>` – validates your seed pages
  against the Strapi schemas (must pass with 0 errors).
- Type check: `cd /home/ubuntu/linkfields/apps/web && /opt/node26/bin/node node_modules/typescript/bin/tsc --noEmit -p . 2>&1 | grep "sections/<family>"`
- Lint: `cd /home/ubuntu/linkfields/apps/web && PATH=/opt/node26/bin:$PATH pnpm exec eslint src/components/sections/<family>`
- Use `/opt/node26/bin/node` (Node 26 LTS) and `PATH=/opt/node26/bin:$PATH pnpm ...` for any node tooling.

## 2. Workflow per page

1. Look at the original screenshots of the page (`small/<page_key>_*.jpg`) and list its sections top→bottom.
   The section inventory (top→bottom) is in `/home/ubuntu/linkfields/docs/section-inventory.txt`.
2. Load the original content: `lib.load_docs(page_key)` (all Tina docs on that page) / `lib.page_doc(page_key)`.
   Text MUST be taken from these docs (or from `rendered/<page_key>.html` when not in Tina) – never retype or paraphrase.
3. For each section: reuse a common section (§4) or another family's published block (§5) when it is the same
   design; otherwise create your own component (§3).
4. Write `seed/transform/families/<family>.py` → `build()` returns `lib.page(page_key, title, sections, path=None)` dicts.
   Run `python3 seed/transform/build.py <family>` then the validator.
5. Open `http://127.0.0.1:3000/<path>`, screenshot at 1440 and 390 px, compare with the original, iterate until it matches.
   Content changes in seed JSON are cached by the dev server: after rebuilding seed data run
   `curl -s -X POST 'http://127.0.0.1:3000/api/revalidate?now=1' -H 'content-type: application/json' -d '{}'`
   (code changes hot-reload automatically). If a page shows "Missing renderer for X", X isn't registered yet.

## 3. Creating a section component

### 3a. Strapi schema – `apps/cms/src/components/<family>/<name>.json`
```json
{
  "collectionName": "components_<family>_<name_with_underscores>",
  "info": { "displayName": "Human readable name", "icon": "layout", "description": "One line for editors" },
  "options": {},
  "attributes": {
    "anchorId": { "type": "string" },
    "eyebrow": { "type": "string" },
    "heading": { "type": "text" },
    "body": { "type": "richtext" },
    "image": { "type": "media", "multiple": false, "allowedTypes": ["images", "files", "videos"] },
    "cards": { "type": "component", "repeatable": true, "component": "shared.icon-card" },
    "theme": { "type": "enumeration", "enum": ["light", "dark"], "default": "light" }
  }
}
```
Rules: `collectionName` ≤ 60 chars and unique; kebab-case file names; attribute names camelCase; `string` ≤ 255
chars (use `text` for longer copy, `richtext` for Markdown with bold/links/lists); enum values letters/digits/-/_
starting with a letter; every section that is a scroll target of the hero tab strip gets an `anchorId` string.
Make everything editable: headings, copy, images, links, button labels, card lists, background images.
Do NOT add a dynamic zone inside a component. Nested repeatables: use existing `shared.*` components, or create
`apps/cms/src/components/elements/<family>-<name>.json` (UID `elements.<family>-<name>`).

Existing building blocks (`apps/cms/src/components/shared/*.json`, read them for exact fields):
`shared.link {label, href, openInNewTab}`, `shared.anchor-link {label*, targetId*}`, `shared.stat {value*, suffix, label}`,
`shared.image-card {title, description, image, href}`, `shared.icon-card {icon, title, description, href, linkLabel, color}`,
`shared.text-item {title, description}`, `shared.social-link`, `shared.insight-card`, `shared.option {label*, value}`, `shared.seo`.

### 3b. React component – `apps/web/src/components/sections/<family>/<name>.tsx`
```tsx
import type { SectionProps } from "../types";
import type { Media } from "@/lib/content/types";
import { CmsImage } from "@/components/cms/cms-image";        // next/image wrapper for Strapi media ({url,width,height,alternativeText})
import { Markdown } from "@/components/cms/markdown";         // renders richtext fields (safe, no raw HTML)
import { Eyebrow } from "@/components/primitives/eyebrow";    // orange uppercase label with the short orange bar
import { SmartLink } from "@/components/primitives/smart-link"; // internal (next/link) vs external links
import { ReadMore } from "@/components/primitives/read-more";   // orange "Read more →"

type Data = { anchorId?: string | null; heading?: string | null; image?: Media | null; cards?: { title?: string | null }[] };

export function FeatureGrid({ data }: SectionProps<Data>) {
  return (
    <section id={data.anchorId || undefined} className="scroll-mt-[100px] bg-black px-[100px] py-[100px] max-[1560px]:p-[80px] max-[1025px]:p-[40px] max-sm:px-[20px]">
      ...
    </section>
  );
}
```
Register it in `<family>/index.ts`: `export const <family>Sections: SectionMap = { "<family>.feature-grid": FeatureGrid };`
(the file already exists with an empty map – keep the export name). Read `src/components/cms/*.tsx`,
`src/components/primitives/*.tsx` and `src/lib/content/types.ts` first.

- Server Components by default. Put interactivity (carousels, accordions, tabs, counters, hover state) in a small
  `"use client"` leaf component in your folder. Available UI kit (`@/components/ui`): accordion, button, carousel
  (embla), input, label, select, sheet, sonner, tabs, textarea. Do not add npm packages or run `shadcn add`.
- Media fields arrive as `Media` objects `{ url, alternativeText, width, height, mime }` (or null) – always render with
  `<CmsImage media={...} ... />` (use `fill` + `sizes` for backgrounds, `priority` only for the first section).
- Richtext arrives as Markdown → `<Markdown>`; `text` fields may contain `\n` → use `whitespace-pre-line` where the
  original shows line breaks.
- All fields can be null/empty: render conditionally, never crash.

### 3c. Styling rules (match the original exactly)
- Tailwind v4 utility classes only (no CSS modules, no inline style except computed values). Translate the original
  CSS/arbitrary values literally (e.g. `padding: 42px 100px` → `px-[100px] py-[42px]`).
- Original breakpoints are **max-width** based: use `max-[1560px]:`, `max-[1025px]:`, `max-[768px]:`, `max-sm:` (639px),
  `max-[440px]:` and `3xl:` (min 1561px) / `2xl:` (min 1536px) exactly as the original CSS does. Screens are designed
  at 1920 (base), 1440 (`max-[1560px]`), 1024, 768, 390.
- Standard horizontal gutter: 100px (base) / 80px (≤1560) / 40px (≤1025) / 20px (≤639) – utility `px-gutter`.
- Fonts (open-source replacements, already wired): original **FiraSans*** → `font-heading` (+ `font-medium` for
  FiraSansMedium, `font-light` for FiraSansLight); **libre-franklin** → `font-sans` (default body); **Inter*** →
  `font-inter` (+ weight: InterThin `font-thin`, InterMedium `font-medium`, InterSemiBold `font-semibold`).
- Colours: use tokens where they match – `brand` #ff7800, `brand-dark` #6e3809, `royal` #2d58c0, `ink` #0a0a0a,
  `ink-900` #111, `ink-950` #0b0b0b, `espresso` #161211, `coal` #272727, `graphite` #3b3b3b, `mist` #f0f0f0,
  `cloud` #e6eced, `steel` #d1dcde, `ash` #a4a8a9, `stone` #8a8e8f, `slate` #737575; otherwise arbitrary hex values.
- **Every interactive element** (links, buttons, cards, icons that link) gets the subtle hover effect: utility
  `hover-grow` (scale 1.04 + smooth transition) for text/buttons/icons, `hover-lift` for cards/tiles; keep any
  original hover (orange text, image zoom `group-hover:scale-[1.08]` with `transition-transform duration-500`).
- Sections that are anchor targets need `id={data.anchorId}` and `scroll-mt-[100px] max-[1560px]:scroll-mt-[75px]`.
- The fixed header is transparent black (100 px / 75 px high) and overlays the first section, exactly like the
  original – don't add top padding unless the original has it.
- Accessibility: real `<section>`, headings in order (h1 only in the hero), alt text from CMS, buttons for toggles.

## 4. Common sections (implemented by the lead in `sections/common` – just use them)

Python builders in `seed/transform/lib.py` (read the docstrings):

| UID | builder | original |
| --- | --- | --- |
| `sections.page-hero` {title, subtitle, backgroundImage, anchorLinks[]} | `lib.hero_section(page_key, heroSectionData, anchors=None)` | inner-page hero 512/450/384/320 px with centred title + tab strip |
| `sections.overview` {anchorId, eyebrow, heading, body, secondaryEyebrow, secondaryHeading, secondaryBody, theme} | `lib.overview_section(heroSectionData, anchor_id="overview", theme="light")` | `ant-row` "OVERVIEW" block on #F0F0F0 |
| `sections.message-banner` {anchorId, title, description, ctaLabel, ctaUrl} | `lib.message_banner(doc)` | `messageBanner_*` blue strip + orange CTA |
| `sections.stats-band` | `lib.stats_band(doc=None)` | `persistentlyInnovative` |
| `sections.industries-showcase` | `lib.industries_showcase(doc=None)` | `constantly-innovating` |
| `sections.featured-insights` {heading, items[]} | `lib.featured_insights()` | `FeaturedBlogs_*` "Insights & Updates" |
| `sections.contact-form` | `lib.contact_form(page_key=page_key)` | "Contact Us / Let's connect over a virtual coffee" form |
| `sections.social-banner` | `lib.social_banner()` | `contactusBanner_*` "Follow us for the latest updates" |
| `sections.rich-text` {anchorId, heading, body, variant} | – | legal pages |

`lib.standard_tail(page_key)` = [featured insights, contact form, social banner] – the footer of almost every page.
`lib.seo(page_key)` is applied automatically by `lib.page(...)`. `lib.media(url, alt)` turns any original image URL
(S3 or `/images/...`, `/backgroud-images/...`) into a seed media reference (downloads it if the crawl missed it).
`lib.md(rich)` converts Tina rich-text to Markdown, `lib.plain(rich)` to plain text, `lib.link(label, href)`.

## 5. Cross-family shared blocks

Some original components appear in several families. Exactly one family owns each; the others reuse it:

| original component (css prefix) | owner family | UID prefix | Python builders |
| --- | --- | --- | --- |
| `whatweoffer_*`, `ProjectFlowCardSection_*`, `CollapseComponents_*`, `ourSuperpowers_*` | services | `services.*` | `seed/transform/families/services.py` |
| `howCanWeHelpSection*`, `technologyDetails*` | solutions | `solutions.*` | `seed/transform/families/solutions.py` |

Owners: publish the builder functions **first** (within your first ~15 minutes) as module-level functions with a
docstring, taking the raw Tina sub-object as found in `lib.load_docs(...)` plus keyword args, returning a section
dict, e.g. `def what_we_offer(doc: dict, *, anchor_id: str = "") -> dict`. Keep them tolerant of the shape variations
found on other families' pages (check them: grep `lf-crawl/clean/*.json`). Also list them in
`docs/shared-blocks.md` (owner-maintained: UID, builder signature, which Tina fields it reads).
Consumers: `from families.services import what_we_offer` inside your `build()` (import inside the function so a
temporarily broken owner module doesn't break your module import); if the owner's builder isn't there yet, work on
your other sections first and come back.

## 6. Done = for every page you own
- seed page generated, validator passes, page renders at 1440 / 1024 / 390 px without console errors and matches the
  original screenshots section by section (copy, images, order, colours, spacing, typography, hover states);
- all content editable through the Strapi schema (no hard-coded copy in React except tiny UI labels like aria-labels);
- `tsc` and `eslint` clean for your folder.
Final report: pages done, section UIDs created, anything you could not match, any change you need in shared files.

## Global updates (lead, 09:55)
- **Default body font is now the original's `FiraSansMedium`** (`font-body` = a Fira Sans family containing only the 500
  face). Anything that does not set a font family inherits it, exactly like the original (`body{font-family:FiraSansMedium}`).
  Where the original CSS declares `libre-franklin` you must still put `font-sans` on that element.
  *(Superseded: the redesigned site uses Plus Jakarta Sans for headings and Inter for body text, both SIL OFL 1.1; see README › Fonts.)*
- **Tailwind `leading-normal` is `1.5`, not CSS `normal`.** For original `line-height: normal` use `leading-[normal]`.
- `next.config.ts` has `allowedDevOrigins` so client components hydrate in Playwright on 127.0.0.1 (fixed 09:47).
- Common insights section shows max 3 cards (as the original); not-found page matches the original 404.
- QA tools: `tools/style_cmp.py <path> "<text>"... [--width N]` (computed styles + geometry, live vs ours) and
  `tools/cmp.py <path> out.png [--width N] [--y N] [--height N]` (side-by-side live/ours screenshot).
- `leading-[normal]` only where the original CSS says `line-height:normal`; otherwise the original inherits html 1.5.
