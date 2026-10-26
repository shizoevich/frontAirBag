/**
 * Seed перемешивания витрины: один на загрузку страницы.
 *
 * Бэкенд перемешивает каталог хешем от id товара и этого seed, поэтому пока
 * seed не меняется, страницы, поиск и фильтры согласованы между собой: товар
 * не повторяется на второй странице и не пропадает между первой и третьей.
 *
 * Seed живёт в памяти модуля, а не в sessionStorage, намеренно: переходы
 * внутри приложения (категории, страницы, карточка товара и назад) его
 * сохраняют, а перезагрузка или новый заход дают новую раскладку. Так и
 * просил владелец: каждый визит — другие товары на витрине.
 *
 * На сервере seed пустой: SSR каталог не запрашивает, а одинаковое значение
 * на сервере и клиенте нам не нужно — в разметку оно не попадает.
 */
let seed = null;

function makeSeed() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID().replace(/-/g, '');
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getVisitSeed() {
  if (typeof window === 'undefined') return '';
  if (!seed) seed = makeSeed();
  return seed;
}

/** Только для тестов: имитирует новую загрузку страницы. */
export function resetVisitSeed() {
  seed = null;
}
