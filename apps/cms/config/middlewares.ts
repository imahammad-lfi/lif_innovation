import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  // Extra hosts allowed to serve media in the admin panel (e.g. the S3 bucket / Cloudflare media domain).
  const mediaHosts = env.array('CSP_MEDIA_HOSTS', []);
  // Browser origins allowed to call the CMS API directly (the website calls it server-side).
  const corsOrigins = env.array('CORS_ORIGINS', ['http://localhost:3000', 'http://localhost:1337']);

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', ...mediaHosts],
            'media-src': ["'self'", 'data:', 'blob:', ...mediaHosts],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    {
      name: 'strapi::cors',
      config: {
        origin: corsOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
        keepHeaderOnError: true,
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

export default config;
