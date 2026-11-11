#!/usr/bin/env bash
# Package the repository for hand-over.
#   tools/package.sh [out_dir]
# Produces:
#   linkfields-source.zip       – all source (apps, infra, seed transformers + seed JSON, docs, CI), honouring .gitignore
#   linkfields-seed-assets.zip  – seed/assets (original media used by `npm run seed` to populate Strapi)
# Secrets (.env*, except *.env.example), node_modules, build output, Terraform state/providers and Strapi uploads
# are never included because they are covered by .gitignore.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/../lf-deliver}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"

TMP_GIT="$(mktemp -d)"
trap 'rm -rf "$TMP_GIT"' EXIT
git init -q "$TMP_GIT"

# Internal working notes that are not part of the deliverable.
EXCLUDE_RE='^(docs/(research-notes\.md|POLISH-BRIEF\.md|PORTFOLIO-BRIEF\.md|PRODUCTS-BRIEF\.md|site_audit_full\.json|content_diff_all\.txt|hero-measurements\.txt))$'

cd "$ROOT"
GIT_DIR="$TMP_GIT/.git" GIT_WORK_TREE="$ROOT" git ls-files -co --exclude-standard \
  | grep -Ev "$EXCLUDE_RE" > "$TMP_GIT/all.txt"

grep -v '^seed/assets/' "$TMP_GIT/all.txt" > "$TMP_GIT/source.txt"
grep '^seed/assets/' "$TMP_GIT/all.txt" > "$TMP_GIT/assets.txt" || true

# Never ship secrets, even if a .gitignore rule is changed later.
if grep -E '(^|/)\.env($|\.)' "$TMP_GIT/source.txt" | grep -v '\.env\.example$'; then
  echo "refusing to package: environment files found in the list above" >&2
  exit 1
fi

rm -f "$OUT/linkfields-source.zip" "$OUT/linkfields-seed-assets.zip"
zip -q -X "$OUT/linkfields-source.zip" -@ < "$TMP_GIT/source.txt"
if [ -s "$TMP_GIT/assets.txt" ]; then
  zip -q -X -0 "$OUT/linkfields-seed-assets.zip" -@ < "$TMP_GIT/assets.txt"
fi

echo "source files: $(wc -l < "$TMP_GIT/source.txt")  -> $OUT/linkfields-source.zip ($(du -h "$OUT/linkfields-source.zip" | cut -f1))"
if [ -f "$OUT/linkfields-seed-assets.zip" ]; then
  echo "seed assets : $(wc -l < "$TMP_GIT/assets.txt")  -> $OUT/linkfields-seed-assets.zip ($(du -h "$OUT/linkfields-seed-assets.zip" | cut -f1))"
fi
