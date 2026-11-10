import { factories } from '@strapi/strapi';
import { deepPopulate } from '../../../utils/deep-populate';

/** Read-only public API. Every response is deeply populated so the website needs a single request. */
export default factories.createCoreController('api::news-article.news-article', () => ({
  async find(ctx) {
    if (!ctx.query.fields) ctx.query = { ...ctx.query, populate: deepPopulate('api::news-article.news-article') };
    return super.find(ctx);
  },
  async findOne(ctx) {
    if (!ctx.query.fields) ctx.query = { ...ctx.query, populate: deepPopulate('api::news-article.news-article') };
    return super.findOne(ctx);
  },
}));
