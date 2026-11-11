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

/**
 * Lead list in Content Manager: newest enquiry first, with the submission time as a column.
 * Applied once per version (core-store flag), so later changes editors make in "Configure the view" are kept.
 */
const LEAD_LIST_VIEW_VERSION = 1;

async function configureLeadListView(strapi: Core.Strapi) {
  const flags = strapi.store({ type: 'plugin', name: 'linkfields-admin' });
  if (((await flags.get({ key: 'lead-list-view' })) as number | null) === LEAD_LIST_VIEW_VERSION) return;

  const service = strapi.plugin('content-manager').service('content-types');
  const contentType = strapi.contentType('api::lead.lead');
  const current = await service.findConfiguration(contentType);
  const list: string[] = current.layouts?.list ?? ['id', 'reference', 'name', 'email'];
  const withoutTime = list.filter((field) => field !== 'createdAt');
  const afterRef = withoutTime.indexOf('reference') + 1;
  const columns = [...withoutTime.slice(0, afterRef), 'createdAt', ...withoutTime.slice(afterRef)];

  await service.updateConfiguration(contentType, {
    settings: { ...current.settings, defaultSortBy: 'createdAt', defaultSortOrder: 'DESC' },
    layouts: { ...current.layouts, list: columns },
    metadatas: {
      ...current.metadatas,
      createdAt: {
        ...current.metadatas?.createdAt,
        list: { ...current.metadatas?.createdAt?.list, label: 'Submitted', sortable: true },
      },
    },
  });
  await flags.set({ key: 'lead-list-view', value: LEAD_LIST_VIEW_VERSION });
  strapi.log.info('[bootstrap] lead list view: newest first, "Submitted" column');
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicRead(strapi);
    try {
      await configureLeadListView(strapi);
    } catch (error) {
      strapi.log.warn(`[bootstrap] could not configure the lead list view: ${(error as Error).message}`);
    }
    try {
      await ensureRevalidationWebhook(strapi);
    } catch (error) {
      strapi.log.warn(`[bootstrap] could not configure revalidation webhook: ${(error as Error).message}`);
    }
  },
};
