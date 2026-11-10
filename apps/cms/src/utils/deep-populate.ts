import type { UID } from '@strapi/strapi';

type Populate = true | { populate?: Record<string, unknown>; on?: Record<string, unknown> };

/**
 * Builds a Strapi 5 `populate` object that walks every component, dynamic zone, media and
 * relation of a content type, so the website receives a page and all of its sections in one call.
 * Relations are populated one level deep (enough for the website, and safe from cycles).
 */
const SKIP = new Set(['localizations', 'createdBy', 'updatedBy']);

export function deepPopulate(uid: UID.Schema, depth = 0): Record<string, Populate> {
  const model = strapi.getModel(uid);
  const result: Record<string, Populate> = {};
  if (!model || depth > 8) return result;

  for (const [name, attr] of Object.entries(model.attributes) as [string, any][]) {
    // Internal/system attributes cannot be populated through the REST API (e.g. `localizations` when i18n is off).
    if (SKIP.has(name) || attr.private || attr.visible === false) continue;
    switch (attr.type) {
      case 'media':
        result[name] = true;
        break;
      case 'relation':
        if (!String(attr.target ?? '').startsWith('admin::')) result[name] = true;
        break;
      case 'component': {
        const nested = deepPopulate(attr.component, depth + 1);
        result[name] = Object.keys(nested).length ? { populate: nested } : true;
        break;
      }
      case 'dynamiczone': {
        const on: Record<string, unknown> = {};
        for (const component of attr.components as string[]) {
          const nested = deepPopulate(component as UID.Schema, depth + 1);
          on[component] = Object.keys(nested).length ? { populate: nested } : true;
        }
        result[name] = { on };
        break;
      }
      default:
        break;
    }
  }
  return result;
}
