# Deploying on DigitalOcean App Platform

The website and the CMS run as two App Platform apps in London, with a managed PostgreSQL database and a Spaces
bucket for the media library. Deploys are manual (Autodeploy off).

```
Visitors ──► linkfields-web (Next.js, apps/web)          www.linkfields.com
                 │ HTTPS: page content, contact form
                 ▼
             linkfields-cms (Strapi, apps/cms)            cms.linkfields.com
                 │                        │
                 ▼                        ▼
       Managed PostgreSQL          Spaces bucket + CDN (images, documents)
       (linkfields-db)             <bucket>.lon1.cdn.digitaloceanspaces.com
```

Why Spaces: the App Platform disk is wiped on every deploy, so uploads cannot stay in `public/uploads`.

| Item | Size | About per month |
| --- | --- | --- |
| linkfields-cms | apps-s-1vcpu-2gb | $25 |
| linkfields-web | apps-s-1vcpu-1gb | $12 |
| Managed PostgreSQL | 1 vCPU / 1 GB | $15 |
| Spaces (250 GB + CDN) | | $5 |

App specs: [`.do/cms.yaml`](../.do/cms.yaml) and [`.do/web.yaml`](../.do/web.yaml). They hold every environment
variable; secrets are entered in the DigitalOcean dashboard and never committed.

## 1. Spaces bucket (media)

1. **Spaces Object Storage › Create Bucket**: region **London (LON1)**, name e.g. `linkfields-media`,
   **Enable CDN**, File listing **Restricted**.
2. **API › Spaces Keys › Generate New Key** (name `linkfields-cms`). Copy the access key and the secret (shown once).
3. Bucket **Settings › CORS**: origin `*`, method `GET`.

Your values: `AWS_BUCKET=linkfields-media`, `CDN_URL=https://linkfields-media.lon1.cdn.digitaloceanspaces.com`,
`MEDIA_HOSTS`/`CSP_MEDIA_HOSTS=linkfields-media.lon1.cdn.digitaloceanspaces.com`.

## 2. PostgreSQL

1. **Databases › Create Database Cluster**: PostgreSQL (newest version), London, 1 GB, name **`linkfields-db`**.
2. In the cluster: **Users & Databases** › add user **`linkfields`** and database **`linkfields_cms`**.
3. **Settings › Trusted sources**: add your own IP for the data import (step 3). App Platform adds the apps itself.
4. **Overview › Connection details**: choose user `linkfields`, database `linkfields_cms`, **Connection string**,
   and copy it (`postgresql://linkfields:…@…:25060/linkfields_cms?sslmode=require`).

## 3. Copy the content (database + media)

Take the newest content from the current production server so recent edits and enquiries come along.

**a. Export from the current server** (adjust the container name and user to that server):

```bash
docker exec pg18 pg_dump -U linkfields -d linkfields_cms --no-owner --no-privileges | gzip > cms.sql.gz
tar -czf uploads.tgz -C /path/to/apps/cms/public uploads
```

Copy both files to your machine. Without access to that server, the hand-over backup `database/linkfields_cms.sql.gz`
and your local `apps/cms/public/uploads` work too, but miss anything changed since.

**b. Import the database** (needs Docker on your machine; paste the connection string from step 2):

```bash
gunzip -c cms.sql.gz | docker run --rm -i postgres:18 psql "postgresql://linkfields:…@…:25060/linkfields_cms?sslmode=require"
```

**c. Move the media to Spaces.** `apps/cms/scripts/media-to-spaces.mjs` uploads every file to the bucket and points
the database at the CDN. Run it from the repo root in the CMS image, with the unpacked `uploads` folder mounted:

```bash
tar -xzf uploads.tgz                     # creates ./uploads
docker compose build cms
docker compose run --rm --no-deps -v "$PWD/uploads:/media:ro" \
  -e UPLOADS_DIR=/media \
  -e DATABASE_URL="postgresql://linkfields:…@…:25060/linkfields_cms?sslmode=require" \
  -e AWS_ENDPOINT=https://lon1.digitaloceanspaces.com -e AWS_BUCKET=linkfields-media \
  -e AWS_ACCESS_KEY_ID=… -e AWS_SECRET_ACCESS_KEY=… \
  -e CDN_URL=https://linkfields-media.lon1.cdn.digitaloceanspaces.com \
  cms node scripts/media-to-spaces.mjs              # dry run: must report 0 missing files
# then the same command with:  node scripts/media-to-spaces.mjs --apply
```

It can be re-run safely; files already in the bucket are skipped.

## 4. CMS app

1. **Apps › Create App › GitHub**: repo `imahammad-lfi/lif_innovation`, branch `main`, **Source directory `/apps/cms`**,
   Autodeploy **off**. Accept the detected Dockerfile and finish (the first deploy may fail; that is expected).
2. **Settings › App Spec › Edit**: paste [`.do/cms.yaml`](../.do/cms.yaml) and replace every `CHANGE_ME`:
   - Strapi secrets: reuse the values from the current production CMS `.env` if you have them (existing API tokens
     then keep working). Otherwise generate new ones with `openssl rand -base64 32`.
   - `AWS_BUCKET`, the Spaces key, `CDN_URL`, `CSP_MEDIA_HOSTS` from step 1.
   - `MS_GRAPH_*` from the current `.env`.
   - Leave `CHANGE_ME_WEBSITE` for now (step 6).
3. Save. It deploys; then open the app's URL (`https://linkfields-cms-xxxxx.ondigitalocean.app/admin`) and sign in with
   the existing CMS account.
4. **Settings › API Tokens › website-leads › Regenerate** and copy the token (skip if you reused the old secrets and
   still have the old token).

## 5. Website app

1. **Apps › Create App › GitHub**: same repo, **Source directory `/apps/web`**, Autodeploy **off**.
2. **Settings › App Spec › Edit**: paste [`.do/web.yaml`](../.do/web.yaml) and set:
   - `STRAPI_URL`: the CMS URL from step 4 (no trailing slash).
   - `MEDIA_HOSTS`: the Spaces CDN host.
   - `REVALIDATE_SECRET`: a new random value (also used in step 6).
   - `STRAPI_LEAD_TOKEN`: the token from step 4.
3. Save and let it deploy. The build reads all pages from the CMS, so the CMS must be running.

## 6. Connect the CMS to the website

In the CMS app's App Spec replace `CHANGE_ME_WEBSITE` with the website host (e.g. `linkfields-web-xxxxx.ondigitalocean.app`,
later `www.linkfields.com`) and set `WEBSITE_REVALIDATE_SECRET` to the website's `REVALIDATE_SECRET`. Save (redeploys).

## 7. Check

- Website: Home tab title is "AI-Driven Technology, Engineering & Advisory | Linkfields" (not "Page not found");
  images load from `…cdn.digitaloceanspaces.com`; Products & Accelerators and a few service pages open.
- Change a word on a page in the CMS and publish: the website shows it within a few seconds.
- Upload a test image in the CMS Media Library: its URL starts with the CDN address.
- Send one test enquiry: it appears in CMS › Leads and the emails arrive.

## 8. Domains

- Website app › **Settings › Domains**: add `www.linkfields.com` (and `linkfields.com`); CMS app: `cms.linkfields.com`.
  Create the DNS records DigitalOcean shows.
- After the domains are live, update and save (each redeploys):
  CMS `WEBSITE_URL`, `CORS_ORIGINS`, `WEBSITE_REVALIDATE_URL` → `www.linkfields.com`;
  website `STRAPI_URL` → `https://cms.linkfields.com`.
  The CMS `PUBLIC_URL` uses `${APP_URL}` and follows its primary domain automatically. The website's
  `NEXT_PUBLIC_SITE_URL` is fixed to `https://www.linkfields.com` (canonical links and the sitemap).

## Deploying changes

Push to `main`, then **Actions › Deploy** on the app that changed (website, CMS, or both: CMS first). Roll back with
**Activity › previous deployment › Rollback**.

## Notes

- The database password and CA come from the cluster binding (`${db.*}`), so they are never typed in.
- If the CMS cannot connect to the database because of the certificate, set `DATABASE_SSL_REJECT_UNAUTHORIZED=false`
  in the CMS app (the connection stays encrypted inside DigitalOcean's network).
- Contact-form rate limiting is per instance; keep `instance_count: 1` for the website or add Turnstile keys.
