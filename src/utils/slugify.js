// src/utils/slugify.js

const LattinToCyrillic = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
  'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
  'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
  'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
  'я': 'ya', 'і': 'i', 'ї': 'yi', 'є': 'ye',
};

export function slugify(str) {
  if (typeof str !== 'string') {
    return '';
  }

  let slug = str.toLowerCase();

  // Transliterate Cyrillic to Latin
  slug = slug.replace(/[а-яёіїє]/g, (char) => LattinToCyrillic[char] || '');

  // Replace special characters with a space
  slug = slug.replace(/[^a-z0-9\s-]/g, ' ');

  // Replace spaces and multiple hyphens with a single hyphen
  slug = slug.trim().replace(/\s+/g, '-').replace(/-+/g, '-');

  return slug;
}
