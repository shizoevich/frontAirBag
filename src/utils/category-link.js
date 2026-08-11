import { slugify } from './slugify';

/**
 * Path of a category's own page, WITHOUT the locale prefix — pass it through
 * `getLocalizedLink` like any other link.
 *
 * Navigation must point here rather than at `/shop?category=<id>`: the shop page
 * canonicalises every `?category=` variant to plain `/shop/`, so those links pass no
 * weight on to the category and its real page ends up with zero internal links.
 * `?category=` stays valid as filter state inside the shop, it just isn't a link target.
 *
 * The page resolves the category by the id at the end of the slug, so the readable part
 * is cosmetic and never has to match the stored slug exactly.
 */
export function categoryPath(category) {
  if (!category?.id) return '/shop';
  return `/category/${slugify(category.title || '')}-${category.id}`;
}
