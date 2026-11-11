/**
 * Database smoke test: boots Strapi against the configured database (DATABASE_* env vars), lets Strapi run its
 * schema sync, reads the published content the website depends on, and exits non-zero on any failure.
 *
 *   node scripts/db-smoke.mjs
 *   DATABASE_PORT=5434 DATABASE_PASSWORD=... node scripts/db-smoke.mjs   # e.g. against a PostgreSQL 18 instance
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
process.env.STRAPI_TELEMETRY_DISABLED = 'true';

const started = Date.now();
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const app = await createStrapi(await compileStrapi()).load();
let failed = false;
try {
  const [{ version }] = (await app.db.connection.raw('select version() as version')).rows;
  console.log(`[smoke] database: ${version.split(' on ')[0]}`);

  const global = await app.documents('api::global.global').findFirst({ status: 'published', populate: '*' });
  if (!global) throw new Error('global single type is missing');
  console.log(`[smoke] global: ok (${Object.keys(global).length} fields)`);

  const pages = await app.documents('api::page.page').findMany({ status: 'published', fields: ['path'], limit: 500 });
  console.log(`[smoke] published pages: ${pages.length}`);
  if (!pages.length) throw new Error('no published pages');

  const home = await app.documents('api::page.page').findFirst({
    status: 'published',
    filters: { path: '/' },
    populate: { sections: { populate: '*' } },
  });
  if (!home?.sections?.length) throw new Error('home page has no sections');
  console.log(`[smoke] home sections: ${home.sections.map((s) => s.__component).join(', ')}`);

  const posts = await app.documents('api::blog-post.blog-post').findMany({ status: 'published', fields: ['slug', 'order'], sort: ['order:asc'] });
  console.log(`[smoke] blog posts: ${posts.map((p) => p.slug).join(' | ')}`);

  const files = await app.db.query('plugin::upload.file').count();
  console.log(`[smoke] media files: ${files}`);
} catch (error) {
  failed = true;
  console.error('[smoke] FAILED:', error);
} finally {
  await app.destroy();
}
console.log(`[smoke] ${failed ? 'FAILED' : 'OK'} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
process.exit(failed ? 1 : 0);
