import { factories } from '@strapi/strapi';
import { deepPopulate } from '../../../utils/deep-populate';
/** Read-only public API for /events, the footer event card and the site-wide pop-up. Deeply populated. */
export default factories.createCoreController('api::event.event', () => ({
  async find(ctx) {
    if (!ctx.query.fields) ctx.query = { ...ctx.query, populate: deepPopulate('api::event.event') };
    return super.find(ctx);
  },
  async findOne(ctx) {
    if (!ctx.query.fields) ctx.query = { ...ctx.query, populate: deepPopulate('api::event.event') };
    return super.findOne(ctx);
  },
}));
