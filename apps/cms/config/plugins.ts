import path from 'node:path';
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
 * - DigitalOcean Spaces (or any S3-compatible store): UPLOAD_PROVIDER=aws-s3 plus AWS_ENDPOINT
 *   (e.g. https://lon1.digitaloceanspaces.com), AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (a Spaces key),
 *   AWS_ACL=public-read and CDN_URL=https://<bucket>.lon1.cdn.digitaloceanspaces.com. See docs/DEPLOY-DIGITALOCEAN.md.
 */
const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const useS3 = env('UPLOAD_PROVIDER', 'local') === 'aws-s3';
  const s3Endpoint = env('AWS_ENDPOINT', '');
  const s3AccessKeyId = env('AWS_ACCESS_KEY_ID', '');
  const security = { allowedTypes: allowedMediaTypes, deniedTypes };
  const sizeLimit = env.int('UPLOAD_SIZE_LIMIT', 50 * 1024 * 1024);

  // Enquiry emails (thank-you to the visitor + alert to sales).
  // - EMAIL_PROVIDER=graph (default): Microsoft 365 through the Microsoft Graph API with an Entra ID app
  //   registration (application permission Mail.Send). Provider: providers/email-graph. Configure MS_GRAPH_*.
  // - EMAIL_PROVIDER=nodemailer (or smtp): Nodemailer over SMTP, kept for the local Mailpit test inbox only. Without
  //   SMTP_USERNAME the connection is unauthenticated.
  // See docs/CMS-BRANDING-AND-EMAIL.md.
  const useSmtp = ['nodemailer', 'smtp'].includes(env('EMAIL_PROVIDER', 'graph').toLowerCase());
  const smtpUser = env('SMTP_USERNAME', '');
  const email = {
    config: {
      ...(useSmtp
        ? {
            provider: 'nodemailer',
            providerOptions: {
              host: env('SMTP_HOST', '127.0.0.1'),
              port: env.int('SMTP_PORT', 1025),
              secure: env.bool('SMTP_SECURE', false),
              requireTLS: env.bool('SMTP_REQUIRE_TLS', false),
              ...(smtpUser ? { auth: { user: smtpUser, pass: env('SMTP_PASSWORD', '') } } : {}),
              connectionTimeout: 15_000,
              greetingTimeout: 10_000,
            },
          }
        : {
            // Loaded by absolute path (Strapi falls back to require(provider) when no
            // @strapi/provider-email-* package matches). Strapi always runs with the app root as cwd.
            provider: path.join(process.cwd(), 'providers', 'email-graph'),
            providerOptions: {
              tenantId: env('MS_GRAPH_TENANT_ID', ''),
              clientId: env('MS_GRAPH_CLIENT_ID', ''),
              clientSecret: env('MS_GRAPH_CLIENT_SECRET', ''),
              // Mailbox the app sends as (UPN or shared mailbox); defaults to the EMAIL_FROM address.
              sender: env('MS_GRAPH_SENDER', ''),
              saveToSentItems: env.bool('MS_GRAPH_SAVE_TO_SENT_ITEMS', true),
            },
          }),
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
                // S3-compatible stores (DigitalOcean Spaces) need their endpoint and a static key pair.
                ...(s3Endpoint ? { endpoint: s3Endpoint } : {}),
                ...(s3AccessKeyId
                  ? { credentials: { accessKeyId: s3AccessKeyId, secretAccessKey: env('AWS_SECRET_ACCESS_KEY', '') } }
                  : {}),
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
