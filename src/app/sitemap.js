import { locales, defaultLocale, getServerApiBase, localeUrl } from '@/utils/seo';
import { slugify } from '@/utils/slugify';
import { categoryPath } from '@/utils/category-link';

// Regenerate at most once per hour.
export const revalidate = 3600;

const API_BASE = getServerApiBase();

// Static, indexable routes (path WITHOUT locale prefix).
const STATIC_PATHS = [
  '',
  'discounts',
  'pyrotechnics',
  'airbag-components',
  'car-brands',
  'contact',
  'about',
  'returns',
  'terms',
  'privacy-policy',
];

// Build a single sitemap entry with hreflang alternates for every locale.
function entry(path, { lastModified, changeFrequency, priority } = {}) {
  // `localeUrl` appends the trailing slash the site actually serves — building URLs by
  // hand here is what made every single sitemap entry answer with a 308 redirect.
  const languages = {};
  for (const l of locales) languages[l] = localeUrl(path, l);
  languages['x-default'] = localeUrl(path, defaultLocale);
  return {
    url: localeUrl(path, defaultLocale),
    lastModified: lastModified || new Date(),
    changeFrequency: changeFrequency || 'weekly',
    priority: priority ?? 0.6,
    alternates: { languages },
  };
}

// Fetch every page of a paginated DRF (LimitOffset) endpoint.
async function fetchAll(resource) {
  if (!API_BASE) return [];
  const out = [];
  let url = `${API_BASE}/${resource}/?limit=100&offset=0`;
  try {
    while (url) {
      const res = await fetch(url, { next: { revalidate } });
      if (!res.ok) break;
      const data = await res.json();
      const results = Array.isArray(data) ? data : data.results || [];
      out.push(...results);
      url = Array.isArray(data) ? null : data.next;
    }
  } catch (e) {
    console.error(`sitemap: failed to fetch ${resource}`, e);
  }
  return out;
}

export default async function sitemap() {
  const staticEntries = STATIC_PATHS.map((p) =>
    entry(p, { priority: p === '' ? 1.0 : 0.7, changeFrequency: p === '' ? 'daily' : 'weekly' })
  );

  const [goods, categories] = await Promise.all([
    fetchAll('goods'),
    fetchAll('good-categories'),
  ]);

  // `categoryPath` is the single source of truth for the category URL format, so the
  // sitemap cannot drift away from what the site actually links to.
  const categoryEntries = categories.map((c) =>
    entry(categoryPath(c).replace(/^\//, ''), { changeFrequency: 'weekly', priority: 0.6 })
  );

  const productEntries = goods.map((g) =>
    entry(`product/${slugify(g.title)}-${g.id}`, { changeFrequency: 'weekly', priority: 0.8 })
  );

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
