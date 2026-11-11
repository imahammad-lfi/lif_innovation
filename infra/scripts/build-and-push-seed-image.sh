#!/usr/bin/env bash
# Build a one-off seed image from the already-published CMS image and push it to ECR.
# Usage: infra/scripts/build-and-push-seed-image.sh <cms-image> <seed-image>
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <cms-image> <seed-image>" >&2
  exit 64
fi

cms_image="$1"
seed_image="$2"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
tmp_dockerfile="$(mktemp)"
trap 'rm -f "$tmp_dockerfile"' EXIT

cat >"$tmp_dockerfile" <<'DOCKERFILE'
ARG CMS_IMAGE
FROM ${CMS_IMAGE}
COPY --chown=strapi:strapi seed /seed
ENV SEED_DIR=/seed
CMD ["npm", "run", "seed"]
DOCKERFILE

docker build \
  --file "$tmp_dockerfile" \
  --build-arg "CMS_IMAGE=${cms_image}" \
  --tag "$seed_image" \
  "$repo_root"
docker push "$seed_image"

echo "Pushed seed image: $seed_image"
