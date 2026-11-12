/**
 * Moves the CMS media library from local disk (public/uploads) to DigitalOcean Spaces, or any S3-compatible store.
 *
 * For every row of the Strapi "files" table whose URL starts with /uploads/ it:
 *   1. uploads the original and every resized format (thumbnail, small, medium, large) to the bucket
 *      under the same file name, public-read with a one-year cache;
 *   2. rewrites url and formats[].url to CDN_URL/<name> and sets provider = 'aws-s3'.
 * The file names match what the aws-s3 upload provider uses for new uploads (<rootPath>/<hash><ext>).
 * Files already in the bucket are not uploaded again, so the script can be re-run safely.
 *
 *   node scripts/media-to-spaces.mjs            # dry run: checks every file and lists what would change
 *   node scripts/media-to-spaces.mjs --apply    # uploads the files and updates the database
 *
 * Environment:
 *   DATABASE_URL          connection string of the TARGET database (DigitalOcean: Databases › Connection details)
 *   DATABASE_SSL_CA       optional path to the database CA certificate (otherwise TLS is used without verification)
 *   DATABASE_SSL=false    only for a database without TLS (e.g. the local Docker one, for a test dry run)
 *   AWS_ENDPOINT          e.g. https://lon1.digitaloceanspaces.com
 *   AWS_REGION            us-east-1 for Spaces (the endpoint selects the real region)
 *   AWS_BUCKET            Spaces bucket name
 *   AWS_ACCESS_KEY_ID     Spaces access key
 *   AWS_SECRET_ACCESS_KEY Spaces secret
 *   CDN_URL               e.g. https://<bucket>.lon1.cdn.digitaloceanspaces.com (same value as the CMS's CDN_URL)
 *   CDN_ROOT_PATH         optional folder inside the bucket (same value as the CMS's CDN_ROOT_PATH)
 *   UPLOADS_DIR           default: public/uploads
 *
 * Docker (the local CMS container has the media and the libraries):
 *   docker compose exec -e DATABASE_URL=... -e AWS_ENDPOINT=... [...] cms node scripts/media-to-spaces.mjs [--apply]
 */
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Client } = require('pg');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

const apply = process.argv.includes('--apply');
const need = (name) => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. See the header of this script.`);
    process.exit(1);
  }
  return value;
};

const databaseUrl = need('DATABASE_URL');
const bucket = need('AWS_BUCKET');
const cdnUrl = need('CDN_URL').replace(/\/+$/, '');
const rootPath = (process.env.CDN_ROOT_PATH ?? '').replace(/^\/+|\/+$/g, '');
const uploadsDir = path.resolve(process.env.UPLOADS_DIR ?? 'public/uploads');
const prefix = rootPath ? `${rootPath}/` : '';

const s3 = new S3Client({
  endpoint: need('AWS_ENDPOINT'),
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: { accessKeyId: need('AWS_ACCESS_KEY_ID'), secretAccessKey: need('AWS_SECRET_ACCESS_KEY') },
});

// node-postgres treats sslmode=require as full verification, which fails without the CA; TLS is set explicitly instead.
const connectionString = databaseUrl.replace(/([?&])sslmode=[^&]*&?/, '$1').replace(/[?&]$/, '');
const caPath = process.env.DATABASE_SSL_CA;
const db = new Client({
  connectionString,
  ssl:
    process.env.DATABASE_SSL === 'false'
      ? false
      : caPath
        ? { ca: readFileSync(caPath, 'utf8'), rejectUnauthorized: true }
        : { rejectUnauthorized: false },
});

/** "/uploads/abc_123.png" -> "abc_123.png" (null for anything that is not a local upload). */
const localName = (url) => (typeof url === 'string' && url.startsWith('/uploads/') ? url.slice('/uploads/'.length) : null);

async function exists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') return false;
    throw error;
  }
}

let uploaded = 0;
let skipped = 0;
const missing = [];

async function put(name, mime) {
  const file = path.join(uploadsDir, name);
  if (!existsSync(file)) {
    missing.push(name);
    return false;
  }
  const key = `${prefix}${name}`;
  if (!apply) return true;
  if (await exists(key)) {
    skipped += 1;
    return true;
  }
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: await readFile(file),
      ContentType: mime || 'application/octet-stream',
      ACL: 'public-read',
      // Strapi file names carry a content hash, so they never change and can be cached for a year.
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  uploaded += 1;
  return true;
}

/** Runs fn over items with a small worker pool. */
async function pool(items, size, fn) {
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) await fn(items[next++]);
    }),
  );
}

let failed = false;
await db.connect();
try {
  const { rows } = await db.query(`SELECT id, url, mime, formats FROM files WHERE url LIKE '/uploads/%' ORDER BY id`);
  console.log(`${rows.length} media file(s) stored locally. Uploads folder: ${uploadsDir}`);
  let updated = 0;

  await pool(rows, 8, async (row) => {
    const name = localName(row.url);
    let ok = await put(name, row.mime);
    const formats = row.formats && typeof row.formats === 'object' ? structuredClone(row.formats) : null;
    for (const format of Object.values(formats ?? {})) {
      const formatName = localName(format?.url);
      if (!formatName) continue;
      ok = (await put(formatName, format.mime || row.mime)) && ok;
      format.url = `${cdnUrl}/${prefix}${formatName}`;
    }
    if (!ok) return; // never point the database at a file that is not in the bucket
    updated += 1;
    if (apply) {
      await db.query(`UPDATE files SET url = $1, formats = $2, provider = 'aws-s3' WHERE id = $3`, [
        `${cdnUrl}/${prefix}${name}`,
        formats ? JSON.stringify(formats) : null,
        row.id,
      ]);
    }
  });

  if (missing.length) {
    console.log(`\n${missing.length} file(s) missing from ${uploadsDir} (their rows are left unchanged):`);
    for (const name of missing.slice(0, 20)) console.log(`  ${name}`);
    if (missing.length > 20) console.log(`  … and ${missing.length - 20} more`);
  }
  if (apply) {
    console.log(`\nUploaded ${uploaded} file(s), ${skipped} already in the bucket. Updated ${updated} database row(s).`);
    console.log('Next: refresh the website cache (publish any page in the CMS, or redeploy the website).');
  } else {
    console.log(`\nDry run: ${updated} row(s) would move to ${cdnUrl}/${prefix}… Re-run with --apply.`);
  }
} catch (error) {
  failed = true;
  console.error('FAILED:', error);
} finally {
  await db.end();
}
process.exit(failed || missing.length ? 1 : 0);
