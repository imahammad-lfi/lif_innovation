#!/usr/bin/env node
/**
 * Validates seed JSON (seed/data) against the Strapi content model (src/components, src/api).
 *
 *   node apps/cms/scripts/validate-seed.mjs                 # everything
 *   node apps/cms/scripts/validate-seed.mjs services__cloud # only pages whose file name contains the filter
 *
 * Checks: every section's __component exists and is allowed in Page.sections, every field exists in
 * the component schema, required fields are present, enum values are valid, repeatable components
 * are arrays, media fields are {"__media": "..."} objects pointing at an existing file in seed/assets,
 * nested components recursively. Exit code 1 when errors are found.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cms = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = join(cms, '..', '..');
const seedData = join(repo, 'seed', 'data');
const seedAssets = join(repo, 'seed', 'assets');
const filter = process.argv[2] ?? '';

// ------------------------------------------------------------------ load model
const components = {};
const compDir = join(cms, 'src', 'components');
for (const cat of readdirSync(compDir)) {
  const d = join(compDir, cat);
  if (!statSync(d).isDirectory()) continue;
  for (const f of readdirSync(d)) {
    if (!f.endsWith('.json')) continue;
    try {
      components[`${cat}.${f.slice(0, -5)}`] = JSON.parse(readFileSync(join(d, f), 'utf8'));
    } catch (e) {
      console.error(`✖ invalid JSON in src/components/${cat}/${f}: ${e.message}`);
      process.exitCode = 1;
    }
  }
}
const ct = (api) => JSON.parse(readFileSync(join(cms, 'src', 'api', api, 'content-types', api, 'schema.json'), 'utf8'));
const pageSchema = ct('page');
const globalSchema = ct('global');
const blogSchema = ct('blog-post');
const newsSchema = ct('news-article');
const eventSchema = ct('event');

// sections allowed = what sync-sections would register (every non building-block category)
const BUILDING = new Set(['shared', 'layout', 'elements']);
const allowedSections = new Set(
  Object.entries(components)
    .filter(([uid, c]) => !BUILDING.has(uid.split('.')[0]) && c?.info?.isBlock !== false)
    .map(([uid]) => uid),
);

// ------------------------------------------------------------------ error reporting
let errors = 0;
let checked = 0;
function err(where, msg) {
  errors++;
  console.error(`✖ ${where}: ${msg}`);
}

// ------------------------------------------------------------------ schema sanity
const TYPES = new Set(['string', 'text', 'richtext', 'blocks', 'email', 'integer', 'biginteger', 'float', 'decimal', 'boolean', 'date', 'datetime', 'time', 'json', 'enumeration', 'media', 'component', 'dynamiczone', 'relation', 'uid', 'password']);
const tables = new Map();
for (const [uid, c] of Object.entries(components)) {
  const where = `component ${uid}`;
  if (!c.collectionName) err(where, 'missing collectionName');
  else if (tables.has(c.collectionName)) err(where, `collectionName "${c.collectionName}" also used by ${tables.get(c.collectionName)}`);
  else tables.set(c.collectionName, uid);
  if (c.collectionName && c.collectionName.length > 60) err(where, `collectionName longer than 60 chars`);
  if (!c.info?.displayName) err(where, 'missing info.displayName');
  for (const [name, a] of Object.entries(c.attributes ?? {})) {
    if (!TYPES.has(a.type)) err(where, `attribute ${name}: unknown type "${a.type}"`);
    if (a.type === 'component' && !components[a.component]) err(where, `attribute ${name}: unknown component "${a.component}"`);
    if (a.type === 'enumeration' && (!Array.isArray(a.enum) || !a.enum.length)) err(where, `attribute ${name}: enum values missing`);
    if (a.type === 'enumeration' && a.enum.some((v) => /^[0-9]/.test(v) || /[^A-Za-z0-9_-]/.test(v))) err(where, `attribute ${name}: enum values must start with a letter and contain only letters, digits, - or _`);
    if (['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'locale', '__component'].includes(name)) err(where, `attribute name "${name}" is reserved`);
    if (a.type === 'dynamiczone') err(where, `dynamic zones are not allowed inside components`);
  }
}

// ------------------------------------------------------------------ value validation

function checkMedia(where, v, multiple) {
  if (v == null) return;
  if (multiple) {
    if (!Array.isArray(v)) return err(where, 'expected an array of media');
    return v.forEach((m, i) => checkMedia(`${where}[${i}]`, m, false));
  }
  if (typeof v !== 'object' || typeof v.__media !== 'string') return err(where, `expected {"__media": "<path>"} (got ${JSON.stringify(v).slice(0, 80)})`);
  if (!existsSync(join(seedAssets, v.__media))) err(where, `media file not found: seed/assets/${v.__media}`);
}

function checkAttrs(where, attrs, value) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return err(where, 'expected an object');
  for (const key of Object.keys(value)) {
    if (key === '__component' || key === 'id') continue;
    if (!(key in attrs)) err(where, `unknown field "${key}"`);
  }
  for (const [name, a] of Object.entries(attrs)) {
    const v = value[name];
    const w = `${where}.${name}`;
    if (v === undefined || v === null || v === '') {
      if (a.required && a.type !== 'media') err(w, 'required field missing');
      continue;
    }
    switch (a.type) {
      case 'string':
      case 'text':
      case 'richtext':
      case 'email':
      case 'uid':
        if (typeof v !== 'string') err(w, `expected string, got ${typeof v}`);
        else if (a.type === 'string' && v.length > 255) err(w, `string longer than 255 chars (${v.length}) – use "text"`);
        break;
      case 'integer':
      case 'biginteger':
        if (!Number.isInteger(v)) err(w, `expected integer, got ${JSON.stringify(v)}`);
        break;
      case 'float':
      case 'decimal':
        if (typeof v !== 'number') err(w, `expected number`);
        break;
      case 'boolean':
        if (typeof v !== 'boolean') err(w, `expected boolean`);
        break;
      case 'date':
        if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) err(w, `expected YYYY-MM-DD`);
        break;
      case 'enumeration':
        if (!a.enum.includes(v)) err(w, `"${v}" is not one of ${a.enum.join(', ')}`);
        break;
      case 'media':
        checkMedia(w, v, a.multiple);
        break;
      case 'json':
        break;
      case 'component': {
        const c = components[a.component];
        if (!c) {
          err(w, `unknown component ${a.component}`);
          break;
        }
        if (a.repeatable) {
          if (!Array.isArray(v)) err(w, 'expected an array (repeatable component)');
          else v.forEach((item, i) => checkAttrs(`${w}[${i}]`, c.attributes, item));
        } else checkAttrs(w, c.attributes, v);
        break;
      }
      default:
        break;
    }
  }
}

function checkPage(file, page) {
  const where = `pages/${file}`;
  checked++;
  const { sections = [], ...rest } = page;
  const pageAttrs = { ...pageSchema.attributes };
  delete pageAttrs.sections;
  checkAttrs(where, pageAttrs, rest);
  if (!Array.isArray(sections)) return err(where, 'sections must be an array');
  sections.forEach((s, i) => {
    const w = `${where} sections[${i}] ${s?.__component}`;
    if (!s?.__component) return err(w, 'missing __component');
    if (!components[s.__component]) return err(w, `component file apps/cms/src/components/${s.__component.replace('.', '/')}.json does not exist`);
    if (!allowedSections.has(s.__component)) return err(w, 'not allowed in Page.sections (building-block category or isBlock=false)');
    checkAttrs(w, components[s.__component].attributes, s);
  });
}

const pagesDir = join(seedData, 'pages');
if (existsSync(pagesDir)) {
  for (const f of readdirSync(pagesDir).sort()) {
    if (!f.endsWith('.json') || (filter && !f.includes(filter))) continue;
    try {
      checkPage(f, JSON.parse(readFileSync(join(pagesDir, f), 'utf8')));
    } catch (e) {
      err(`pages/${f}`, `invalid JSON: ${e.message}`);
    }
  }
}
if (!filter) {
  const g = join(seedData, 'global.json');
  if (existsSync(g)) {
    checked++;
    checkAttrs('global.json', globalSchema.attributes, JSON.parse(readFileSync(g, 'utf8')));
  }
  for (const [file, schema] of [['blog-posts.json', blogSchema], ['news-articles.json', newsSchema], ['events.json', eventSchema]]) {
    const p = join(seedData, file);
    if (!existsSync(p)) continue;
    const list = JSON.parse(readFileSync(p, 'utf8'));
    list.forEach((item, i) => {
      checked++;
      checkAttrs(`${file}[${i}]`, schema.attributes, item);
    });
  }
}

if (errors) {
  console.error(`\n${errors} error(s) in ${checked} document(s)`);
  process.exit(1);
}
console.log(`✔ ${checked} document(s) valid against ${Object.keys(components).length} components`);
