import { factories } from '@strapi/strapi';
import { deepPopulate } from '../../../utils/deep-populate';

/** Read-only public API. Every response is deeply populated so the website needs a single request. */
export default factories.createCoreController('api::blog-post.blog-post', () => ({
  async find(ctx) {
    if (!ctx.query.fields) ctx.query = { ...ctx.query, populate: deepPopulate('api::blog-post.blog-post') };
    return super.find(ctx);
  },
  async findOne(ctx) {
    if (!ctx.query.fields) ctx.query = { ...ctx.query, populate: deepPopulate('api::blog-post.blog-post') };
    return super.findOne(ctx);
  },
}));
