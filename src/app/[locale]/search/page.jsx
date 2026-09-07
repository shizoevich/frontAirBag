import { redirect } from 'next/navigation';

/**
 * Отдельной страницы поиска больше нет: запрос — это состояние витрины, `?searchText=`.
 *
 * Пока `/search` рендерил свой вид, у него был смысл. Когда вид стал общим с главной
 * и категорией, остались два адреса на одну страницу — а два адреса на одно состояние
 * рано или поздно расходятся. Тем же способом раньше свели `/category`.
 *
 * Адрес оставлен редиректом, а не удалён: на него ведут закладки, история браузера и
 * разметка `SearchAction`, которую сайт отдавал поисковикам.
 */
export default async function SearchPage({ params, searchParams }) {
  const { locale } = await params;
  const query = new URLSearchParams();

  Object.entries((await searchParams) || {}).forEach(([key, value]) => {
    if (value === undefined) return;
    // Старая разметка SearchAction слала запрос как `q` — параметр, которого не читал
    // никто. Раз уж адрес всё равно проходит через это место, приводим его к рабочему.
    const name = key === 'q' ? 'searchText' : key;
    (Array.isArray(value) ? value : [value]).forEach((v) => query.append(name, v));
  });

  const qs = query.toString();
  redirect(`/${locale}${qs ? `?${qs}` : ''}`);
}
