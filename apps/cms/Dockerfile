# syntax=docker/dockerfile:1.7
# Debian/glibc is used so sharp can use its supported prebuilt binary.
FROM node:26-bookworm-slim AS base

ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false
WORKDIR /opt/app

FROM base AS build
# These are build-only dependencies for native Node modules when a prebuild is unavailable.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ libvips-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# Local packages referenced as file: dependencies (the Microsoft Graph email provider).
COPY providers ./providers
RUN npm ci
COPY . .
RUN npm run build \
    && npm prune --omit=dev \
    && npm cache clean --force

FROM base AS runtime
# sharp dynamically links to libvips when it cannot use its bundled binary.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libvips42 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 strapi \
    && useradd --system --uid 1001 --gid strapi strapi

COPY --from=build --chown=strapi:strapi /opt/app /opt/app
RUN mkdir -p /opt/app/public/uploads /opt/app/.tmp \
    && chown -R strapi:strapi /opt/app/public /opt/app/.tmp

USER strapi
EXPOSE 1337

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "const http=require('http');const req=http.get('http://127.0.0.1:1337/_health',res=>process.exit(res.statusCode===204?0:1));req.on('error',()=>process.exit(1));req.setTimeout(3000,()=>{req.destroy();process.exit(1)});"

CMD ["npm", "run", "start"]
