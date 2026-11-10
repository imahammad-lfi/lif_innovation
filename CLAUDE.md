# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A rebuild of www.linkfields.com: a **Next.js 16 / React 19** website (`apps/web`, pnpm) whose content lives in **Strapi 5 + PostgreSQL 18** (`apps/cms`, npm). All page content is authored as seed JSON (`seed/`) and imported into Strapi. Node.js 26 LTS. The repo is a hand-over archive, not a pnpm/npm workspace: each app installs and runs on its own.

`apps/web/AGENTS.md`: this Next.js version has breaking changes compared with older releases. Before writing Next.js code, read the relevant guide in `apps/web/node_modules/next/dist/docs/`. The site uses Cache Components (`"use cache"`, `cacheTag`, `cacheLife`).

## Commands

```bash
# Website (apps/web)
pnpm install && pnpm dev            # :3000
pnpm lint                           # ESLint
pnpm exec tsc --noEmit              # type-check (CI runs lint, tsc, build)
pnpm exec eslint src/components/sections/<family>   # lint one folder
CONTENT_SOURCE=local pnpm dev       # read seed/data directly, no CMS needed

# CMS (apps/cms)
npm ci && npm run develop           # :1337/admin (runs scripts/sync-sections.mjs first)
npm run seed                        # idempotent import of seed/ (--only=pages,global,blog,news,events; --prune-pages; --prune-posts)
npm run seed:validate [filter]      # validate seed JSON against the Strapi schemas
npm run db:smoke                    # boot Strapi against the DB and check schema and content
pnpm exec strapi ts:generate-types  # after adding content types, before building

# Everything in Docker (repo root)
cp .env.example .env && docker compose up -d --build
docker compose --profile seed run --rm seed

# Seed pipeline (repo root)
python3 seed/custom/apply.py                  # re-apply the portfolio overlay onto seed/data
python3 seed/custom/apply.py <file.json>      # publish only the given seed/custom/pages files
python3 tools/publish_page.py <file.json>     # apply + validate + flush the dev-server cache
curl -s -X POST 'http://127.0.0.1:3000/api/revalidate?now=1' -H 'content-type: application/json' -d '{}'  # flush cached content in dev
```

There are no unit tests. Checks are lint, `tsc`, the build, `seed:validate`, and the Playwright/Python QA scripts in `tools/` (link audit, menu click-through, accessibility, Lighthouse, device matrix, screenshots).

## Architecture

**Pages are a list of CMS sections.** A Strapi `page` has a `path`, `seo` and a `sections` dynamic zone. A catch-all route, `apps/web/src/app/[[...slug]]/page.tsx`, renders any path that exists in the CMS. Each section type exists in three places that must agree:
1. Strapi schema: `apps/cms/src/components/<family>/<name>.json`, UID `<family>.<name>`. `scripts/sync-sections.mjs` adds every category except `shared`, `layout` and `elements` to `page.sections` automatically (it runs before `develop`, `build` and `seed`). Nested helper components go in `elements/<family>-<name>.json`.
2. React component: `apps/web/src/components/sections/<family>/<name>.tsx`, registered in that family's `index.ts` map. The family maps are merged in `sections/registry.tsx`. Unknown UIDs are skipped, and in dev the page shows "Missing renderer for X".
3. Seed data: `seed/data/pages/<path-with-__>.json`.

`docs/SECTION-CONTRACT.md` describes how a section is built: field conventions, Tailwind breakpoints (`max-[1560px]`, `max-[1025px]`, `max-[768px]`, `max-sm`), the `px-gutter`, `hover-grow` and `hover-lift` utilities, colour tokens, `CmsImage` and `Markdown` wrappers, and `scroll-mt` on anchor targets. Every field can be null. Sections are Server Components, with interactivity kept in small `"use client"` leaf components. All copy is editable in the CMS; don't hard-code it in React. Its font notes are outdated: the site now uses Plus Jakarta Sans for headings and Inter for body text. Design rules are in `docs/DESIGN-SYSTEM.md`.

**Content loading** (`apps/web/src/lib/content/`): `index.ts` exposes cached getters (`getGlobal`, `getPage`, …) tagged `cms`, `cms:global`, `cms:page:<path>` and so on. They read Strapi (`strapi.ts`) or, with `CONTENT_SOURCE=local`, the seed JSON (`local.ts`). Errors are cached only briefly, so the build succeeds even when the CMS can't be reached (CI builds against a dead `STRAPI_URL`). Strapi is only called from the server; config is in `src/lib/env.ts`. When something is published, Strapi calls `/api/revalidate` (shared `REVALIDATE_SECRET`), which invalidates those tags. The CMS creates that webhook at start-up from `WEBSITE_REVALIDATE_URL` and `WEBSITE_REVALIDATE_SECRET` (`apps/cms/src/index.ts`, which also grants public read access).

**Seed pipeline: where content edits go.**
- `seed/data/` is **generated. Don't edit it by hand.**
- `seed/transform/` (`build.py`, `lib.py`, `families/*.py`) originally turned a crawl of the old site into `seed/data`, then runs `seed/custom/apply.py`. The crawl (`/home/ubuntu/lf-crawl`) and `/opt/node26` mentioned in older docs are not in this environment, so a full `build.py` run won't work here.
- `seed/custom/` is the overlay that holds the current content. `pages/*.json` are hand-authored pages. `portfolio.json` drives the Services mega menu, footer, contact-form options and home tiles. `deck.py` holds the corporate-deck layouts. `content_fixes.py` holds copy and SEO corrections. `events.json`, `blog-posts.json` and `news-articles.json` hold those collections. `site_global.py` holds global settings. `apply.py` is idempotent: it copies the pages, deletes retired paths, rewrites links and rebuilds the menus.
- `apps/web/redirects.json` is the single source of truth for retired URLs. `next.config.ts` serves those redirects, and `apply.py` rewrites internal links from the same file.
- To change content, edit `seed/custom/...`, run `apply.py`, run `seed:validate`, then `npm run seed -- --only=pages` (or the relevant collection). The live CMS may hold editor changes that aren't in the seed. Media are matched by file name, so a replacement image needs a new file name.

**Other pieces:** events and the site-wide pop-up (`api::event`; `docs/EVENTS-AND-POPUPS.md`; `components/layout/event-promo-client.tsx`). JSON-LD is in `src/components/seo/json-ld.tsx` and uses `NEXT_PUBLIC_SITE_URL`. The contact form is `app/api/contact`: honeypot, rate limit, optional Turnstile, phone validated with libphonenumber-js, and the lead written with a token limited to `lead.create`. Enquiry emails and admin branding are in `apps/cms/src/utils`, `src/admin` and `docs/CMS-BRANDING-AND-EMAIL.md`.

## Deployment

- AWS ECS Fargate, RDS, S3 + CloudFront, with Cloudflare in front: Terraform in `infra/terraform`, `.github/workflows/deploy.yml`, `docs/DEPLOYMENT.md`.
- Single server: `infra/systemd/lf-cms.service` (:1337) and `lf-web.service` (:3001); logs in `/var/log/linkfields/`.
- Behind HTTPS the CMS needs `IS_PROXIED=true` and `PUBLIC_URL`, then `npm run build` again, because the admin bundle embeds the URL.

## Project history

`docs/request-YYYY-MM-DD*.md` record each client change request: what was asked, which files changed, and how it was checked. Read the recent ones for context on an area before changing it, and add a new one when you finish a client request. `HANDOVER.md` covers restoring from `database/linkfields_cms.sql.gz`, which is confidential because it contains visitor enquiries.
