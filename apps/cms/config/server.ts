import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Required for absolute URLs generated behind Cloudflare and the ALB.
  url: env('PUBLIC_URL', undefined),
  // Trust only the bounded reverse-proxy chain, never an unbounded client-supplied X-Forwarded-For.
  proxy: {
    koa: env.bool('IS_PROXIED', false),
    ipHeader: env('PROXY_IP_HEADER', 'X-Forwarded-For'),
    maxIpsCount: env.int('PROXY_MAX_IPS_COUNT', 2),
  },
  app: {
    keys: env.array('APP_KEYS')!,
  },
});

export default config;
