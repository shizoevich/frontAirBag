import { slugify } from './slugify';

/**
 * Path of a category's own page, WITHOUT the locale prefix — pass it through
 * `getLocalizedLink` like any other link.
 *
 * This is the ONLY way a category is addressed anywhere in the app — menus, category
 * landings, the catalog rows and the sitemap all go through here. Earlier there were
 * three competing forms (`/shop?category=<id>`, `/search?category=<id>`, `?cats=<id>`),
 * which meant the same category had several URLs, none of them accumulating any SEO
 * weight, and the selection made in the catalog did not match the links in the menu.
 *
 * The readable part comes from the stored `slug` (the backend transliterates it the same
 * way `slugify` does) and falls back to the title for callers that only carry one. The
 * trailing id is what the page resolves by, so the readable part is cosmetic — which is
 * also why it may repeat: category titles are not unique across parents.
 */
export function categoryPath(category) {
  if (!category?.id) return '/';
  const readable = category.slug || slugify(category.title || '');
  return readable ? `/category/${readable}-${category.id}` : `/category/${category.id}`;
}

/**
 * The id a `<readable>-<id>` slug points at, or null when the slug carries none.
 * Kept next to `categoryPath` so the two halves of the format can never drift apart.
 */
export function categoryIdFromSlug(slug) {
  if (!slug || typeof slug !== 'string') return null;
  const id = Number.parseInt(slug.split('-').pop(), 10);
  return Number.isFinite(id) ? id : null;
}
