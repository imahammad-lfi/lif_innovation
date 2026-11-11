# Linkfields website — hand-over guide

This archive is a complete copy of the Linkfields website as it runs today: all source code, every image, logo,
video and icon, the Strapi media library, and a backup of the CMS database. From it you can run the same website
on a laptop, a single server or AWS. Restoring the backup brings back all content, settings and accounts.

## 1. What is inside

| Folder or file | What it is |
| --- | --- |
| `apps/web/` | The website: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui. One React component per CMS section in `src/components/sections/` |
| `apps/cms/` | Strapi 5 CMS: content types, section components, Linkfields admin branding (`src/admin/`), enquiry emails (`src/utils/enquiry-email.ts`), seed importer (`scripts/`) |
| `apps/cms/public/uploads/` | The live media library: every uploaded image, logo, video and document, with the resized versions Strapi generates |
| `database/linkfields_cms.sql.gz` | PostgreSQL backup of the live CMS (pages, header/footer, events and pop-ups, blog posts, news, enquiries, admin users and roles, settings). **Confidential**: it contains visitors' enquiries |
| `seed/` | All content as JSON (`seed/data`), the original media (`seed/assets`) and the scripts that build it. Used for a clean install without the backup |
| `infra/` | Terraform for AWS and Cloudflare, and the `systemd` units used for single-server hosting |
| `.github/workflows/` | GitHub Actions: `ci.yml` (lint, type-check and build both apps, validate Terraform) and `deploy.yml` (build images and deploy to AWS) |
| `docs/` | Guides and reports, listed in section 7 |
| `tools/` | Quality tools: link audit, menu click-through, section landing, device matrix, accessibility, Lighthouse, packaging |
| `docker-compose.yml`, `.env.example` | Run everything in Docker |
| `MANIFEST.txt` | File counts and sizes per folder |

Not included, on purpose: `.env` files (secrets), `node_modules` (installed from the lockfiles) and build output.

## 2. Sign-in details

The CMS sign-in details are supplied **separately**, not in this archive. Strapi uses the email address as the user
name. Restoring the database backup keeps the same accounts and passwords:

| Account | Role | Can do |
| --- | --- | --- |
| Super Admin | Super Admin | Everything, including users, roles, API tokens and settings |
| Content Editor | Editor | Create, edit, publish and delete pages, events and pop-ups, blog posts, news, global header/footer, media; read enquiries |

Change both passwords at first sign-in (avatar menu at the bottom left › **Profile**). Add each person as their own user under
**Settings › Administration panel › Users**.

## 3. Option A — run with Docker (restores the live site exactly)

Needs Docker with Compose v2.

```bash
unzip linkfields-complete-2026-11-10.zip && cd linkfields
cp .env.example .env
# In .env, replace every "replace-with-…" value with a new random secret: openssl rand -base64 32
# APP_KEYS takes two such values separated by a comma.

docker compose up -d db                                                     # PostgreSQL 18
gunzip -c database/linkfields_cms.sql.gz | docker compose exec -T db psql -q -U linkfields -d linkfields_cms
docker compose up -d --build cms                                            # Strapi on :1337
docker compose cp apps/cms/public/uploads/. cms:/opt/app/public/uploads/    # media library
docker compose up -d --build web                                            # website on :3000
```

Then complete the checklist in section 6.

## 4. Option B — run without Docker

Needs Node.js 26 LTS, pnpm 11 (`corepack enable`) and PostgreSQL 18.

```bash
unzip linkfields-complete-2026-11-10.zip && cd linkfields

# Database
createuser -P linkfields && createdb -O linkfields linkfields_cms
gunzip -c database/linkfields_cms.sql.gz | psql -q -U linkfields -d linkfields_cms

# CMS (media are already in apps/cms/public/uploads)
cd apps/cms
cp .env.example .env          # set DATABASE_*, the secrets (openssl rand -base64 32), PUBLIC_URL
npm ci
npm run build
npm run start                 # http://localhost:1337/admin

# Website (second terminal)
cd apps/web
cp .env.example .env.local    # STRAPI_URL=http://localhost:1337, REVALIDATE_SECRET, STRAPI_LEAD_TOKEN
pnpm install --frozen-lockfile
pnpm build
pnpm start                    # http://localhost:3000
```

## 5. Option C — clean install without the backup

To start from the authored content instead of the backup (no enquiries, new admin account), follow
**Local development** in `README.md`: start the CMS, create the first admin user, then run `npm run seed` in
`apps/cms`. The importer uploads `seed/assets` and creates every page, event, post and the global settings.

## 6. After restoring: checklist

1. **Sign in** with the supplied Super Admin details, then change the password and email address.
2. **Contact form token.** New secrets invalidate the old API token. In **Settings › API Tokens › website-leads**,
   choose **Regenerate**, copy the token into `STRAPI_LEAD_TOKEN` for the website, and restart it
   (`docker compose up -d web`). Without it the form still shows the receipt, but the enquiry is not stored.
3. **Publish refresh.** Set `WEBSITE_REVALIDATE_URL` and `WEBSITE_REVALIDATE_SECRET` in the CMS (the secret must equal
   the website's `REVALIDATE_SECRET`). The CMS creates the publish webhook from these at start-up (the backup holds no
   secret), and publishing in Strapi then updates the website within seconds.
4. **Enquiry emails.** Emails go through Microsoft 365 via Microsoft Graph. Fill in `MS_GRAPH_TENANT_ID`,
   `MS_GRAPH_CLIENT_ID`, `MS_GRAPH_CLIENT_SECRET` and `MS_GRAPH_SENDER`, then set `ENQUIRY_EMAILS_ENABLED=true`. App
   registration, mailbox restriction and SPF, DKIM and DMARC steps are in `docs/CMS-BRANDING-AND-EMAIL.md`.
5. **Behind HTTPS** set `IS_PROXIED=true` and `PUBLIC_URL=https://<cms domain>` in the CMS, then run
   `npm run build` again (the admin bundle embeds the URL).
6. **Test**: open the home page, an inner page and `/events`; submit the contact form and check the reference
   appears on screen and the enquiry appears under **Content Manager › Lead**.

## 7. Going live and further reading

| Document | Covers |
| --- | --- |
| `README.md` | Architecture, local development, scripts, single-server hosting with `systemd` |
| `docs/DEPLOYMENT.md` | AWS (ECS Fargate, RDS, S3 + CloudFront) and Cloudflare (DNS, TLS, WAF), Terraform, CI/CD, costs |
| `docs/CMS-BRANDING-AND-EMAIL.md` | Admin branding, accounts, enquiry references, thank-you and sales emails, Microsoft 365 / Graph set-up |
| `docs/EVENTS-AND-POPUPS.md` | Creating events and pop-ups, countdown and expiry rules |
| `docs/DESIGN-SYSTEM.md` | Design rules: tiles, gradients, hover effects, section landing, accessibility; home hero slides, timing (6 s) and per-slide options |
| `docs/SERVICES-PORTFOLIO.md`, `docs/PRODUCTS-AND-ACCELERATORS.md` | Service and product structure, redirects |
| `docs/SECTION-CONTRACT.md` | How a CMS section maps to a React component (for developers adding sections) |
| `docs/review/` | Audit and review reports, including `WEBSITE-AUDIT-2026-11-10.pdf` |

On AWS, media are stored in S3. The documented route for a new AWS environment is the one-off seed run in
`docs/DEPLOYMENT.md`. To move this backup onto S3 instead, upload `apps/cms/public/uploads` to the bucket and
have a developer update the media URLs in the database.

## 8. Versions

Node.js 26.13 LTS · pnpm 11.25 · Next.js 16.4 · React 19.3 · TypeScript 5.9 · Tailwind CSS 4.3 · Strapi 5.60 ·
PostgreSQL 18.6. Exact package versions are pinned in `apps/web/pnpm-lock.yaml` and `apps/cms/package-lock.json`.

## 9. Licences

The website fonts, Plus Jakarta Sans and Inter, are under the SIL Open Font License 1.1. `next/font` downloads them
once at build time (so the build machine needs internet access) and the website serves them itself; visitors'
browsers never contact Google. Code dependencies
are open source (mainly MIT, Apache-2.0, ISC and BSD). Images are Linkfields-owned, generated for Linkfields, or
partner and certification marks used to show real relationships; see
`docs/review/CONTENT-SEO-COMPLIANCE-REVIEW.md`.
