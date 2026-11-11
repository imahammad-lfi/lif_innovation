/**
 * Replaces the "·" separator between inline links with "|" in CMS content, e.g.
 *   [Business applications](#digital-transformation) · [ERP and CRM fit](#…)
 *   → [Business applications](#digital-transformation) | [ERP and CRM fit](#…)
 *
 * Only a "·" that sits between two Markdown links (") · [") is changed; other text is left alone.
 * Scans every text field of every component, in both the draft and the published version, so the
 * live site changes without re-publishing. Afterwards it asks the website to refresh its cache.
 *
 *   node scripts/link-separators.mjs            # dry run: lists what would change
 *   node scripts/link-separators.mjs --apply    # writes the changes and refreshes the website
 *
 * Docker: docker compose --env-file .env.prod exec cms node scripts/link-separators.mjs [--apply]
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
process.env.STRAPI_TELEMETRY_DISABLED = 'true';

const apply = process.argv.includes('--apply');
const FROM = ') · [';
const TO = ') | [';
const TEXT_TYPES = new Set(['string', 'text', 'richtext']);
// Fields where " · " is a list delimiter, not visible text: the Tiles "note" is split on it into linked chips
// (apps/web/src/components/sections/common/feature-tiles.tsx), so it must keep its dots.
const SKIP = new Set(['sections.feature-tiles.note']);

const { createStrapi, compileStrapi } = require('@strapi/strapi');
const app = await createStrapi(await compileStrapi()).load();
app.log.level = 'error';

let rows = 0;
let replacements = 0;
let failed = false;
try {
  for (const [uid, component] of Object.entries(app.components)) {
    const fields = Object.entries(component.attributes)
      .filter(([name, a]) => TEXT_TYPES.has(a.type) && !SKIP.has(`${uid}.${name}`))
      .map(([name]) => name);
    for (const field of fields) {
      const matches = await app.db.query(uid).findMany({ where: { [field]: { $contains: FROM } }, select: ['id', field] });
      for (const row of matches) {
        const before = row[field];
        const count = before.split(FROM).length - 1;
        rows += 1;
        replacements += count;
        console.log(`${apply ? 'updated' : 'would update'}  ${uid}#${row.id}.${field}  (${count} separator${count === 1 ? '' : 's'})`);
        if (apply) await app.db.query(uid).update({ where: { id: row.id }, data: { [field]: before.split(FROM).join(TO) } });
      }
    }
  }
  console.log(`\n${apply ? 'Changed' : 'Would change'} ${replacements} separator(s) in ${rows} field(s).`);

  if (apply && rows) {
    // Direct database updates do not fire webhooks, so refresh the website's cache explicitly.
    const url = process.env.WEBSITE_REVALIDATE_URL;
    const secret = process.env.WEBSITE_REVALIDATE_SECRET;
    if (url && secret) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
        body: JSON.stringify({ event: 'manual', model: 'link-separators' }),
      });
      console.log(`Website refresh: ${res.status} ${(await res.text()).slice(0, 120)}`);
    } else {
      console.log('WEBSITE_REVALIDATE_URL / WEBSITE_REVALIDATE_SECRET not set: publish any page or wait for the cache to expire.');
    }
  } else if (!apply) {
    console.log('Dry run only. Re-run with --apply to write the changes.');
  }
} catch (error) {
  failed = true;
  console.error('FAILED:', error);
} finally {
  await app.destroy();
}
process.exit(failed ? 1 : 0);
