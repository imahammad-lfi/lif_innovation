import { factories } from '@strapi/strapi';

/**
 * Leads can only be created, and only with an API token that has the `lead.create` permission
 * (used server-side by the website). They are never readable through the public API.
 */
export default factories.createCoreRouter('api::lead.lead', { only: ['create'] });
