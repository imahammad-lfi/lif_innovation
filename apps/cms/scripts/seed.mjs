#!/usr/bin/env node
/**
 * Imports the website content (seed/data/*.json + seed/assets/**) into Strapi.
 *
 *   npm run seed                 # import everything (idempotent: re-running updates documents in place)
 *   npm run seed -- --only=pages # global | pages | blog | news | events
 *   npm run seed -- --dry-run    # parse + resolve media only, write nothing
 *   npm run seed -- --prune-duplicate-media   # first delete unreferenced duplicate uploads
 *   npm run seed -- --only=pages --prune-pages # also delete CMS pages whose path is not in seed/data/pages
 *                                               (e.g. the service pages retired by the Nov 2026 portfolio)
 *   npm run seed -- --prune-posts            # also delete blog posts / news articles / events no longer in the seed
 *
 * Environment: the normal Strapi env (DATABASE_*, UPLOAD_PROVIDER …) plus optional
 *   SEED_DIR             path to the seed folder (default: ../../seed relative to apps/cms)
 *   SEED_LEAD_TOKEN=1    also create a "website-leads" API token (create-only on Lead) and print it once
 *
 * Media placeholders in the seed JSON look like { "__media": "s3/Frame 381.png", alt, width, height, mime }.
 * Every distinct file is uploaded once through the Upload plugin (local disk or S3, whichever provider is
 * configured) and re-used on later runs (see uploadAll), then replaced by its file id.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const cmsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const seedDir = resolve(process.env.SEED_DIR || join(cmsRoot, '..', '..', 'seed'));
const dataDir = join(seedDir, 'data');
const assetsDir = join(seedDir, 'assets');

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const only = args.get('only') ? new Set(String(args.get('only')).split(',')) : null;
const dryRun = Boolean(args.get('dry-run'));
const want = (k) => !only || only.has(k);

const MIME = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif',
  svg: 'image/svg+xml', ico: 'image/x-icon', mp4: 'video/mp4', webm: 'video/webm', pdf: 'application/pdf',
};
const readJson = (file) => JSON.parse(readFileSync(join(dataDir, file), 'utf8'));
const log = (...m) => console.log('[seed]', ...m);

function collectMedia(value, out = new Map()) {
  if (Array.isArray(value)) value.forEach((v) => collectMedia(v, out));
  else if (value && typeof value === 'object') {
    if (typeof value.__media === 'string') {
      if (!out.has(value.__media)) out.set(value.__media, value);
    } else Object.values(value).forEach((v) => collectMedia(v, out));
  }
  return out;
}

function replaceMedia(value, ids) {
  if (Array.isArray(value)) return value.map((v) => replaceMedia(v, ids)).filter((v) => v !== undefined);
  if (value && typeof value === 'object') {
    if (typeof value.__media === 'string') return ids.get(value.__media) ?? null;
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = replaceMedia(v, ids);
    return out;
  }
  return value;
}

/**
 * Uploads every referenced seed file once. A map { "<seed path>": { id, sha1 } } is kept in Strapi's core store, so
 * re-runs re-use files (and only re-upload a file whose bytes changed). Without a map entry, an existing file with
 * the same original name and MIME type is re-used (Strapi optimises images on upload, so sizes cannot be compared).
 */
async function uploadAll(strapi, refs) {
  const ids = new Map();
  const uploadService = strapi.plugin('upload').service('upload');
  const files = strapi.db.query('plugin::upload.file');
  const store = strapi.store({ type: 'plugin', name: 'linkfields-seed' });
  const map = (await store.get({ key: 'media' })) ?? {};
  let created = 0;
  let reused = 0;
  let missing = 0;
  for (const [rel, ref] of refs) {
    const file = join(assetsDir, rel);
    if (!existsSync(file)) {
      log(`  ! missing asset ${rel} (field left empty)`);
      missing++;
      continue;
    }
    const bytes = readFileSync(file);
    const sha1 = createHash('sha1').update(bytes).digest('hex');
    const name = basename(rel);
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    const mime = ref.mime || MIME[ext] || 'application/octet-stream';

    let id = null;
    const known = map[rel];
    if (known && known.sha1 === sha1 && (await files.findOne({ where: { id: known.id }, select: ['id'] }))) id = known.id;
    if (!id && !known) {
      const existing = await files.findOne({ where: { name, mime }, orderBy: { id: 'asc' }, select: ['id'] });
      if (existing) id = existing.id;
    }
    if (id) {
      reused++;
    } else if (dryRun) {
      id = -1;
    } else {
      const [uploaded] = await uploadService.upload({
        data: { fileInfo: { name, alternativeText: ref.alt || null, caption: null } },
        files: { filepath: file, originalFilename: name, mimetype: mime, size: bytes.length },
      });
      id = uploaded.id;
      created++;
      if (created % 25 === 0) log(`  uploaded ${created} files…`);
    }
    ids.set(rel, id);
    if (id > 0) map[rel] = { id, sha1 };
  }
  if (!dryRun) await store.set({ key: 'media', value: map });
  log(`media: ${created} uploaded, ${reused} re-used, ${missing} missing`);
  return ids;
}

/** Deletes duplicate media (same original name + MIME, not the oldest copy) that no content references. */
async function pruneDuplicateMedia(strapi) {
  const knex = strapi.db.connection;
  const uploadService = strapi.plugin('upload').service('upload');
  const groups = await knex('files').select('name', 'mime').count('* as n').groupBy('name', 'mime').having(knex.raw('count(*) > 1'));
  let removed = 0;
  for (const g of groups) {
    const dupes = await strapi.db.query('plugin::upload.file').findMany({ where: { name: g.name, mime: g.mime }, orderBy: { id: 'asc' } });
    for (const file of dupes.slice(1)) {
      const [{ n }] = await knex('files_related_mph').where('file_id', file.id).count('* as n');
      if (Number(n) > 0) continue;
      await uploadService.remove(file);
      removed++;
    }
  }
  log(`pruned ${removed} unreferenced duplicate media file(s)`);
}

async function upsert(strapi, uid, filters, data) {
  const docs = strapi.documents(uid);
  const model = strapi.getModel(uid);
  const publish = model.options?.draftAndPublish ? { status: 'published' } : {};
  if (dryRun) return 'dry';
  const existing = filters ? await docs.findFirst({ filters }) : await docs.findFirst();
  if (existing) {
    await docs.update({ documentId: existing.documentId, data, ...publish });
    return 'updated';
  }
  await docs.create({ data, ...publish });
  return 'created';
}

async function main() {
  if (!existsSync(dataDir)) throw new Error(`Seed data not found at ${dataDir} (set SEED_DIR)`);
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'warn';
  const strapi = app;
  try {
    const global = want('global') ? readJson('global.json') : null;
    const pageFiles = want('pages') ? readdirSync(join(dataDir, 'pages')).filter((f) => f.endsWith('.json') && !f.startsWith('lead-test')) : [];
    const pages = pageFiles.map((f) => readJson(join('pages', f)));
    const blog = want('blog') ? readJson('blog-posts.json') : [];
    const news = want('news') ? readJson('news-articles.json') : [];
    const events = want('events') && existsSync(join(dataDir, 'events.json')) ? readJson('events.json') : [];

    if (args.get('prune-duplicate-media') && !dryRun) await pruneDuplicateMedia(strapi);

    const refs = collectMedia([global, pages, blog, news, events]);
    log(`${pages.length} pages, ${blog.length} blog posts, ${news.length} news articles, ${events.length} events, ${refs.size} media files`);
    const ids = await uploadAll(strapi, refs);

    if (global) log(`global: ${await upsert(strapi, 'api::global.global', null, replaceMedia(global, ids))}`);

    const counts = {};
    for (const page of pages) {
      try {
        const r = await upsert(strapi, 'api::page.page', { path: page.path }, replaceMedia(page, ids));
        counts[r] = (counts[r] ?? 0) + 1;
      } catch (error) {
        counts.failed = (counts.failed ?? 0) + 1;
        log(`  ! page ${page.path}: ${error.message}${error.details?.errors ? ' ' + JSON.stringify(error.details.errors).slice(0, 400) : ''}`);
      }
    }
    if (pages.length) log('pages:', counts);
    if (args.get('prune-pages') && pages.length && !dryRun) {
      const keep = new Set(pages.map((p) => p.path));
      const docs = strapi.documents('api::page.page');
      const all = await docs.findMany({ fields: ['path'], status: 'draft', limit: 1000 });
      for (const d of all.filter((d) => !keep.has(d.path))) {
        await docs.delete({ documentId: d.documentId });
        log(`  - deleted page ${d.path}`);
      }
    }

    for (const post of blog) log(`blog ${post.slug}: ${await upsert(strapi, 'api::blog-post.blog-post', { slug: post.slug }, replaceMedia(post, ids))}`);
    for (const [i, item] of news.entries()) {
      const data = replaceMedia({ order: i, ...item }, ids);
      log(`news ${String(item.title).slice(0, 40)}: ${await upsert(strapi, 'api::news-article.news-article', { title: item.title }, data)}`);
    }
    for (const ev of events) log(`event ${ev.slug}: ${await upsert(strapi, 'api::event.event', { slug: ev.slug }, replaceMedia(ev, ids))}`);
    // --prune-posts: remove blog posts / news articles / events that are no longer in the seed (retired slugs, merged duplicates).
    if (args.get('prune-posts') && !dryRun) {
      const prune = async (uid, key, keepValues) => {
        const keep = new Set(keepValues);
        const docs = strapi.documents(uid);
        const all = await docs.findMany({ fields: [key], status: 'draft', limit: 1000 });
        for (const d of all.filter((d) => !keep.has(d[key]))) {
          await docs.delete({ documentId: d.documentId });
          log(`  - deleted ${uid.split('.').pop()} ${String(d[key]).slice(0, 60)}`);
        }
      };
      if (blog.length) await prune('api::blog-post.blog-post', 'slug', blog.map((p) => p.slug));
      if (news.length) await prune('api::news-article.news-article', 'title', news.map((n) => n.title));
      if (events.length) await prune('api::event.event', 'slug', events.map((e) => e.slug));
    }

    if (process.env.SEED_LEAD_TOKEN && !dryRun) {
      const tokens = strapi.service('admin::api-token');
      const name = 'website-leads';
      if (await tokens.exists({ name })) log(`API token "${name}" already exists (value is only shown on creation)`);
      else {
        const token = await tokens.create({
          name,
          description: 'Used by the website /api/contact route to store enquiries (create-only).',
          type: 'custom',
          lifespan: null,
          permissions: ['api::lead.lead.create'],
        });
        log(`API token "${name}" created. Set STRAPI_LEAD_TOKEN=${token.accessKey}`);
      }
    }
    if (failedCount(counts)) process.exitCode = 1;
  } finally {
    await app.destroy();
  }
}
const failedCount = (c) => c.failed ?? 0;

main().catch((error) => {
  console.error('[seed] failed:', error);
  process.exit(1);
});
