#!/usr/bin/env bash
# Build ONE complete, restorable hand-over archive of the Linkfields website.
#
#   tools/package_complete.sh [out_dir]
#
# The archive unpacks into a single folder `linkfields/` that contains:
#   apps/, seed/, infra/, docs/, tools/, .github/ ...  all source code (follows .gitignore)
#   seed/assets/                                        original images, logos, videos used by the seed importer
#   apps/cms/public/uploads/                            the live Strapi media library (every upload + its resized formats)
#   database/linkfields_cms.sql.gz                      PostgreSQL backup of the live CMS (pages, events, global, posts,
#                                                       enquiries, admin users and roles, settings)
#   HANDOVER.md, MANIFEST.txt                           how to restore / run / deploy, and what is inside
#
# Never included: .env files (except *.env.example), node_modules, build output (.next, dist), Terraform state.
# Credentials are delivered separately and are NOT written into this archive.
#
# Environment overrides: PG_CONTAINER (default pg18), DB_NAME (linkfields_cms), DB_USER (linkfields), STAMP (YYYY-MM-DD).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/../lf-deliver}"
mkdir -p "$OUT"; OUT="$(cd "$OUT" && pwd)"
PG_CONTAINER="${PG_CONTAINER:-pg18}"
DB_NAME="${DB_NAME:-linkfields_cms}"
DB_USER="${DB_USER:-linkfields}"
STAMP="${STAMP:-$(date +%Y-%m-%d)}"
NAME="linkfields-complete-$STAMP"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
PKG="$WORK/linkfields"
mkdir -p "$PKG"

# 1. File list: everything not ignored by .gitignore, minus internal working notes.
git init -q "$WORK/git"
EXCLUDE_RE='^(docs/(research-notes\.md|POLISH-BRIEF\.md|PORTFOLIO-BRIEF\.md|PRODUCTS-BRIEF\.md|site_audit_full\.json|content_diff_all\.txt|hero-measurements\.txt))$'
cd "$ROOT"
GIT_DIR="$WORK/git/.git" GIT_WORK_TREE="$ROOT" git ls-files -co --exclude-standard | grep -Ev "$EXCLUDE_RE" > "$WORK/files.txt"
# The live media library is ignored by .gitignore (it is re-creatable by the seeder) but belongs in a complete hand-over.
find apps/cms/public/uploads -type f ! -name '.gitkeep' | sort >> "$WORK/files.txt"

# 2. Secret guard: never ship environment files or credential files.
if grep -E '(^|/)\.env($|\.)' "$WORK/files.txt" | grep -v '\.env\.example$'; then
  echo "refusing to package: environment files found in the list above" >&2; exit 1
fi
if grep -Ei '(^|/)(\.secrets|credentials?|.*admin_pw)(/|$|\.)' "$WORK/files.txt"; then
  echo "refusing to package: credential files found in the list above" >&2; exit 1
fi

# 3. Copy the files (hard links when possible, so staging costs no extra disk space).
while IFS= read -r f; do
  mkdir -p "$PKG/$(dirname "$f")"
  ln "$f" "$PKG/$f" 2>/dev/null || cp -p "$f" "$PKG/$f"
done < "$WORK/files.txt"

# 4. Database backup (plain SQL, no owner/privileges so it restores into any PostgreSQL user).
mkdir -p "$PKG/database"
# The revalidation webhook record stores the website's shared secret in plain text. Blank it: the CMS re-creates the
# webhook from WEBSITE_REVALIDATE_URL / WEBSITE_REVALIDATE_SECRET at every start-up (src/index.ts).
REDACT_PY='import re,sys
pat=re.compile(r"(\"x-revalidate-secret\"\s*:\s*\")[^\"]*(\")")
for line in sys.stdin: sys.stdout.write(pat.sub(r"\1REDACTED-set-WEBSITE_REVALIDATE_SECRET\2", line))'
sudo docker exec "$PG_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-privileges --clean --if-exists \
  | python3 -c "$REDACT_PY" | gzip -9 > "$PKG/database/linkfields_cms.sql.gz"
gzip -t "$PKG/database/linkfields_cms.sql.gz"
[ "$(gunzip -c "$PKG/database/linkfields_cms.sql.gz" | grep -c 'REDACTED-set-WEBSITE_REVALIDATE_SECRET')" -ge 1 ] \
  || { echo "webhook secret redaction did not apply" >&2; exit 1; }
PGV="$(sudo docker exec "$PG_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -Atc 'show server_version' | cut -d' ' -f1)"
cat > "$PKG/database/README.md" <<EOF
# Database backup

\`linkfields_cms.sql.gz\` is a plain-SQL \`pg_dump\` of the live Strapi database (\`$DB_NAME\`), taken $STAMP from
PostgreSQL $PGV. It holds all CMS content (pages, global header/footer, events and pop-ups, blog posts, news),
website enquiries (leads), media-library records, admin users and roles, and Strapi settings.

It is **confidential**: it contains visitors' enquiry details and the (hashed) admin passwords. Share it only with
people who host or maintain the site. The website revalidation secret has been removed from the webhook record;
the CMS re-creates the webhook from \`WEBSITE_REVALIDATE_URL\` and \`WEBSITE_REVALIDATE_SECRET\` when it starts.

Restore (see ../HANDOVER.md for the full procedure):

    gunzip -c database/linkfields_cms.sql.gz | psql -h <host> -U <user> -d <database>

The media files referenced by these records are in \`apps/cms/public/uploads/\`.
EOF
cp "$ROOT/docs/HANDOVER.md" "$PKG/HANDOVER.md"

# 5. Manifest.
{
  echo "Linkfields website — complete hand-over archive ($STAMP)"
  echo
  printf '%-34s %8s %10s\n' "Folder" "Files" "Size"
  for d in apps/web apps/cms/src apps/cms/public/uploads apps/cms/scripts apps/cms/config seed/assets seed/data seed/custom seed/transform infra docs tools database; do
    [ -e "$PKG/$d" ] || continue
    printf '%-34s %8s %10s\n' "$d" "$(find "$PKG/$d" -type f | wc -l)" "$(du -sh "$PKG/$d" | cut -f1)"
  done
  echo
  echo "Total files: $(find "$PKG" -type f | wc -l)   Total size: $(du -sh "$PKG" | cut -f1)"
  echo "Database   : database/linkfields_cms.sql.gz ($(du -h "$PKG/database/linkfields_cms.sql.gz" | cut -f1), PostgreSQL $PGV)"
  echo "Not included: .env files (secrets), node_modules, build output — see HANDOVER.md"
} > "$PKG/MANIFEST.txt"

# 6. Zip (already-compressed media are stored, everything else deflated).
rm -f "$OUT/$NAME.zip" "$OUT/$NAME.zip.sha256"
( cd "$WORK" && zip -q -r -X -n .jpg:.jpeg:.png:.webp:.avif:.gif:.mp4:.webm:.mov:.woff:.woff2:.gz:.zip:.pdf "$OUT/$NAME.zip" linkfields )
( cd "$OUT" && sha256sum "$NAME.zip" > "$NAME.zip.sha256" )
cat "$PKG/MANIFEST.txt"
echo
echo "archive: $OUT/$NAME.zip ($(du -h "$OUT/$NAME.zip" | cut -f1))"
echo "sha256 : $(cut -d' ' -f1 "$OUT/$NAME.zip.sha256")"
