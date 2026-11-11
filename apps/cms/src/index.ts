import type { Core } from '@strapi/strapi';

/** Content the website reads anonymously through the REST API. */
const PUBLIC_READ: Record<string, string[]> = {
  'api::page.page': ['find', 'findOne'],
  'api::global.global': ['find'],
  'api::blog-post.blog-post': ['find', 'findOne'],
  'api::news-article.news-article': ['find', 'findOne'],
  'api::event.event': ['find', 'findOne'],
};

async function grantPublicRead(strapi: Core.Strapi) {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!role) return;

  for (const [uid, actions] of Object.entries(PUBLIC_READ)) {
    for (const action of actions) {
      const name = `${uid}.${action}`;
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: name, role: role.id } });
      if (!existing) {
        await strapi.db.query('plugin::users-permissions.permission').create({ data: { action: name, role: role.id } });
        strapi.log.info(`[bootstrap] granted public ${name}`);
      }
    }
  }
}

/** Registers the website's on-demand revalidation webhook when WEBSITE_REVALIDATE_URL is set. */
async function ensureRevalidationWebhook(strapi: Core.Strapi) {
  const url = process.env.WEBSITE_REVALIDATE_URL;
  const secret = process.env.WEBSITE_REVALIDATE_SECRET;
  if (!url || !secret) return;

  const store = strapi.get('webhookStore');
  const hooks = await store.findWebhooks();
  const payload = {
    name: 'Website revalidation',
    url,
    headers: { 'x-revalidate-secret': secret },
    events: ['entry.create', 'entry.update', 'entry.delete', 'entry.publish', 'entry.unpublish', 'media.update', 'media.delete'],
    isEnabled: true,
  };
  const existing = hooks.find((h: { name: string }) => h.name === payload.name);
  if (existing) {
    await store.updateWebhook(existing.id, { ...existing, ...payload });
  } else {
    await store.createWebhook(payload);
    strapi.log.info('[bootstrap] website revalidation webhook created');
  }
  // make the running webhook runner aware of the change
  const hooksNow = await store.findWebhooks();
  const runner = strapi.get('webhookRunner');
  for (const hook of hooksNow) runner.update?.(hook);
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicRead(strapi);
    try {
      await ensureRevalidationWebhook(strapi);
    } catch (error) {
      strapi.log.warn(`[bootstrap] could not configure revalidation webhook: ${(error as Error).message}`);
    }
  },
};
