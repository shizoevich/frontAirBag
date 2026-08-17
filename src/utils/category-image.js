const FALLBACK_CATEGORY_IMAGE = '/assets/img/category/noimage.png';

/**
 * Picture for a category card.
 *
 * The API stores an absolute media URL, while the old template kept file names inside
 * `public/assets/img/category/`. Both still occur, so the two cases are resolved here
 * instead of in every component that draws a category.
 */
export function categoryImage(category) {
  const image = category?.image;
  if (!image) return FALLBACK_CATEGORY_IMAGE;
  return image.startsWith('http') ? image : `/assets/img/category/${image}`;
}

export { FALLBACK_CATEGORY_IMAGE };
