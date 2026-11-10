import { factories } from '@strapi/strapi';
import { deepPopulate } from '../../../utils/deep-populate';

/** Read-only public API. Every response is deeply populated so the website needs a single request. */
export default factories.createCoreController('api::global.global', () => ({
  async find(ctx) {
    if (!ctx.query.fields) ctx.query = { ...ctx.query, populate: deepPopulate('api::global.global') };
    return super.find(ctx);
  },
}));
