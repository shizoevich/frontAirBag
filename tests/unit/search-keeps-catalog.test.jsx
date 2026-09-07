import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Поиск не выключает витрину.
 *
 * Раньше `/search` был отдельным видом: только сетка товаров. Введённый запрос
 * убирал со страницы баннер и все уровни категорий разом, и сузить выдачу было
 * нечем — приходилось возвращаться на главную и начинать заново.
 *
 * Теперь запрос — это ещё один фильтр витрины: категории на месте, запрос уходит
 * в тот же запрос к API, что и категория с фильтрами, и его видно на странице.
 */

let currentSearchParams = new URLSearchParams();
const pushed = [];
const productQueryArgs = { current: null };

vi.mock('next/navigation', () => ({
  useSearchParams: () => currentSearchParams,
  useRouter: () => ({ push: (url) => pushed.push(url), replace: (url) => pushed.push(url) }),
  usePathname: () => '/uk/search',
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key, values) =>
    values ? `${key}:${Object.values(values).join(',')}` : key,
  useLocale: () => 'uk',
}));

vi.mock('next/link', () => ({ default: ({ children, ...p }) => <a {...p}>{children}</a> }));
vi.mock('next/image', () => ({ default: ({ alt }) => <img alt={alt} /> }));

vi.mock('@/redux/features/productsApi', () => ({
  useGetAllProductsQuery: (args) => {
    productQueryArgs.current = args;
    return { data: { results: [], count: 0 }, isLoading: false, isError: false };
  },
}));

vi.mock('@/redux/features/categoryApi', () => ({
  useGetCategoryTreeQuery: () => ({
    data: [{ id: 7, title: 'Подушки безпеки', children: [] }],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/components/categories/parent-categories', () => ({
  default: ({ categories, onCategorySelect }) => (
    <div data-testid="parent-categories">
      {categories.map((c) => (
        <button key={c.id} type="button" onClick={() => onCategorySelect(c)}>
          {c.title}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/categories/category-carousel', () => ({ default: () => <div /> }));
vi.mock('@/components/products/products-filter-bar', () => ({ default: () => <div /> }));
vi.mock('@/components/loader/home/home-prd-loader', () => ({ default: () => <div /> }));
vi.mock('@/components/common/error-msg', () => ({ default: ({ msg }) => <p>{msg}</p> }));
vi.mock('@/components/products/electronics/product-item', () => ({
  default: () => <div data-testid="product" />,
}));
vi.mock('react-paginate', () => ({ default: () => <div /> }));

const CatalogArea = (await import('@/components/products/catalog-area')).default;

beforeEach(() => {
  pushed.length = 0;
  productQueryArgs.current = null;
});

function renderWithQuery(query) {
  currentSearchParams = new URLSearchParams(query);
  return render(<CatalogArea />);
}

describe('витрина с поисковым запросом', () => {
  it('оставляет блок категорий на месте', () => {
    renderWithQuery('searchText=подушка');

    expect(screen.getByTestId('parent-categories')).toBeInTheDocument();
    expect(screen.getByText('Подушки безпеки')).toBeInTheDocument();
  });

  it('передаёт запрос в выборку товаров', () => {
    renderWithQuery('searchText=подушка');

    expect(productQueryArgs.current.searchText).toBe('подушка');
  });

  it('показывает сам запрос заголовком', () => {
    renderWithQuery('searchText=подушка');

    expect(screen.getByText('searchResults: «подушка»')).toBeInTheDocument();
  });

  it('без выбранной категории заголовком страницы служит запрос', () => {
    renderWithQuery('searchText=подушка');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('подушка');
  });

  it('без запроса выдача не фильтруется по тексту', () => {
    renderWithQuery('');

    expect(productQueryArgs.current.searchText).toBe('');
  });

  it('запрос переживает выбор категории — иначе поиск внутри категории невозможен', () => {
    const { getByText } = renderWithQuery('searchText=подушка');

    getByText('Подушки безпеки').click();

    expect(pushed).toHaveLength(1);
    expect(pushed[0]).toContain('searchText=');
  });

  it('сброс запроса уводит на витрину без searchText', async () => {
    const { getByText } = renderWithQuery('searchText=подушка');

    getByText('clearSearch').click();

    expect(pushed).toHaveLength(1);
    expect(pushed[0]).not.toContain('searchText');
  });
});
