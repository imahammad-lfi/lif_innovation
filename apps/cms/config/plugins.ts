import type { Core } from '@strapi/strapi';

/**
 * Media types editors may upload. SVG is allowed because the brand logos, partner logos and
 * certification badges are vector files; uploads are restricted to authenticated admin users and
 * the website renders them through <img>/next/image (scripts inside SVGs never execute there).
 */
const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

/**
 * Media storage
 * - Local development / docker-compose: files are stored in ./public/uploads (default provider).
 * - AWS: set UPLOAD_PROVIDER=aws-s3. Credentials come from the ECS task role (default AWS SDK
 *   credential chain), so no static keys are required. Files are served through CDN_URL
 *   (the Cloudflare-proxied media domain in front of the S3 bucket).
 */
const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const useS3 = env('UPLOAD_PROVIDER', 'local') === 'aws-s3';
  const security = { allowedTypes: allowedMediaTypes, deniedTypes };
  const sizeLimit = env.int('UPLOAD_SIZE_LIMIT', 50 * 1024 * 1024);

  // Enquiry emails (thank-you to the visitor + alert to sales).
  // - EMAIL_PROVIDER=graph: Microsoft 365 via Microsoft Graph sendMail (app registration with the
  //   Mail.Send application permission; MS_GRAPH_* in .env). Provider: the local package
  //   strapi-provider-email-graph (providers/email-graph, file: dependency in package.json).
  // - otherwise (default "nodemailer"): SMTP_* in .env (see docs/CMS-BRANDING-AND-EMAIL.md). Without
  //   SMTP_USERNAME the connection is unauthenticated (used for the local Mailpit test inbox).
  const smtpUser = env('SMTP_USERNAME', '');
  const useGraph = env('EMAIL_PROVIDER', 'nodemailer').toLowerCase() === 'graph';
  const email = {
    config: {
      provider: useGraph ? 'strapi-provider-email-graph' : 'nodemailer',
      providerOptions: useGraph
        ? {
            tenantId: env('MS_GRAPH_TENANT_ID', ''),
            clientId: env('MS_GRAPH_CLIENT_ID', ''),
            clientSecret: env('MS_GRAPH_CLIENT_SECRET', ''),
            sender: env('MS_GRAPH_SENDER', ''),
          }
        : {
            host: env('SMTP_HOST', '127.0.0.1'),
            port: env.int('SMTP_PORT', 1025),
            secure: env.bool('SMTP_SECURE', false),
            requireTLS: env.bool('SMTP_REQUIRE_TLS', false),
            ...(smtpUser ? { auth: { user: smtpUser, pass: env('SMTP_PASSWORD', '') } } : {}),
            connectionTimeout: 15_000,
            greetingTimeout: 10_000,
          },
      settings: {
        defaultFrom: env('EMAIL_FROM', 'Linkfields Sales <sales@linkfields.com>'),
        defaultReplyTo: env('EMAIL_REPLY_TO', 'sales@linkfields.com'),
        testAddress: env('EMAIL_TEST_ADDRESS', 'sales@linkfields.com'),
      },
    },
  };
  return {
    email,
    'users-permissions': {
      config: {
        jwtManagement: 'refresh',
        sessions: {
          httpOnly: true,
        },
      },
    },
    upload: {
      config: useS3
        ? {
            security,
            sizeLimit,
            provider: 'aws-s3',
            providerOptions: {
              baseUrl: env('CDN_URL'),
              rootPath: env('CDN_ROOT_PATH', ''),
              s3Options: {
                region: env('AWS_REGION', 'eu-west-2'),
                params: {
                  ACL: env('AWS_ACL', 'private'),
                  signedUrlExpires: env.int('AWS_SIGNED_URL_EXPIRES', 15 * 60),
                  Bucket: env('AWS_BUCKET'),
                },
              },
            },
            actionOptions: {
              upload: {},
              uploadStream: {},
              delete: {},
            },
          }
        : { security, sizeLimit },
    },
  };
};

export default config;
