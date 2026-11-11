# syntax=docker/dockerfile:1.7
# The web application is intentionally built from its own pnpm project context.
FROM node:26-bookworm-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH

# Corepack was removed from the Node 26 distribution, so install it explicitly.
RUN npm install --global corepack@0.34.6 \
    && corepack enable pnpm \
    && corepack install --global pnpm@11.25.0
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG CONTENT_SOURCE=strapi
ARG STRAPI_URL=http://127.0.0.1:9
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ARG NEXT_PUBLIC_SITE_URL=
ARG MEDIA_HOSTS=

ENV CONTENT_SOURCE=${CONTENT_SOURCE} \
    STRAPI_URL=${STRAPI_URL} \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    MEDIA_HOSTS=${MEDIA_HOSTS}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:26-bookworm-slim AS runtime

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

WORKDIR /app
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Next's standalone output contains the minimal server and production dependencies.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const http=require('http');const req=http.get('http://127.0.0.1:3000/api/health',res=>process.exit(res.statusCode===200?0:1));req.on('error',()=>process.exit(1));req.setTimeout(3000,()=>{req.destroy();process.exit(1)});"

CMD ["node", "server.js"]
