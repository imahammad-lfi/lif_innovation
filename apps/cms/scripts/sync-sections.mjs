#!/usr/bin/env node
/**
 * Registers every section component in the Page `sections` dynamic zone.
 *
 * Section components live in src/components/<category>/*.json. Every category except the
 * building-block categories (shared, layout, elements) is treated as a page section. Run automatically
 * before `develop` and `build`, so adding a component file is all that's needed.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const componentsDir = join(root, 'src', 'components');
const schemaPath = join(root, 'src', 'api', 'page', 'content-types', 'page', 'schema.json');
const BUILDING_BLOCKS = new Set(['shared', 'layout', 'elements']);

const uids = [];
for (const category of readdirSync(componentsDir).sort()) {
  const dir = join(componentsDir, category);
  if (!statSync(dir).isDirectory() || BUILDING_BLOCKS.has(category)) continue;
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith('.json')) continue;
    const json = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    if (json?.info?.isBlock === false) continue; // opt-out for nested helper components
    uids.push(`${category}.${file.replace(/\.json$/, '')}`);
  }
}

// keep the common sections first, in a stable order
uids.sort((a, b) => (a.startsWith('sections.') === b.startsWith('sections.') ? a.localeCompare(b) : a.startsWith('sections.') ? -1 : 1));

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const before = JSON.stringify(schema.attributes.sections.components);
schema.attributes.sections.components = uids;
if (before !== JSON.stringify(uids)) {
  writeFileSync(schemaPath, JSON.stringify(schema, null, 2) + '\n');
  console.log(`[sync-sections] page.sections now accepts ${uids.length} components`);
} else {
  console.log(`[sync-sections] ${uids.length} components (unchanged)`);
}
