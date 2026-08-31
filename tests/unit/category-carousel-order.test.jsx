import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/**
 * Порядок категорий в карусели.
 *
 * Категории приходят уже отсортированными по алфавиту, а компонент
 * переставлял их вручную под сетку из двух рядов: [1-й, 3-й, 5-й, …, 2-й, 4-й].
 * На десктопе Swiper с `fill: 'row'` возвращал это обратно в читаемый вид, но в
 * брейкпоинтах ниже 992px ряд один — перестановка оставалась как есть, и на
 * телефоне выходило «сначала верхний ряд, следом нижний»: алфавит начинался
 * заново с середины списка.
 *
 * Теперь раскладку делает сам Swiper (`fill: 'column'`), а порядок слайдов
 * равен порядку входных данных на любом экране.
 */

const swiperProps = { current: null };

vi.mock('swiper/react', () => ({
  Swiper: ({ children, ...props }) => {
    swiperProps.current = props;
    return <div data-testid="swiper">{children}</div>;
  },
  SwiperSlide: ({ children }) => <div data-testid="slide">{children}</div>,
}));

vi.mock('swiper/modules', () => ({ Navigation: {}, Grid: {} }));
vi.mock('swiper/css', () => ({}));
vi.mock('swiper/css/grid', () => ({}));
vi.mock('swiper/css/navigation', () => ({}));

vi.mock('next-intl', () => ({ useTranslations: () => (key) => key }));

vi.mock('next/image', () => ({
  default: ({ alt }) => <img alt={alt} />,
}));

const carouselModule = await import('@/components/categories/category-carousel');
const CategoryCarousel = carouselModule.default;
const { orderForGrid, effectiveRows } = carouselModule;

const LETTERS = ['Audi', 'BMW', 'Chevrolet', 'Dodge', 'Ford', 'GMC', 'Honda'];
const CATEGORIES = LETTERS.map((title, i) => ({ id: i + 1, title, image: null }));

function renderCarousel(categories = CATEGORIES) {
  return render(
    <CategoryCarousel
      categories={categories}
      isLoading={false}
      isError={false}
      selectedCategory={null}
      onCategorySelect={() => {}}
    />
  );
}

describe('orderForGrid: порядок под сетку', () => {
  const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  it('один ряд — порядок не трогаем', () => {
    expect(orderForGrid(items, 1)).toEqual(items);
  });

  it('два ряда — транспонируем, чтобы читалось колонками', () => {
    // Swiper с fill: 'row' сначала заполняет верхний ряд, поэтому в него должны
    // попасть 1-й, 3-й, 5-й, 7-й элементы, а в нижний — 2-й, 4-й, 6-й.
    expect(orderForGrid(items, 2)).toEqual(['A', 'C', 'E', 'G', 'B', 'D', 'F']);
  });

  it('пустой список', () => {
    expect(orderForGrid([], 2)).toEqual([]);
    expect(orderForGrid(undefined, 2)).toEqual([]);
  });
});

describe('effectiveRows: сколько рядов построит Swiper', () => {
  const desktop = { slidesPerView: 6, rows: 2 };
  const mobile = { slidesPerView: 4, rows: 1 };

  it('на телефоне ряд один при любой длине', () => {
    expect(effectiveRows(31, mobile)).toBe(1);
    expect(effectiveRows(3, mobile)).toBe(1);
  });

  it('на десктопе два ряда, когда список не помещается в видимую часть', () => {
    expect(effectiveRows(31, desktop)).toBe(2);
  });

  it('короткий список Swiper кладёт в одну строку — транспонировать нельзя', () => {
    // Замерено на живой странице: шесть категорий при slidesPerView=6 идут
    // одной строкой, и перестановка под две строки просто мешает алфавит.
    expect(effectiveRows(6, desktop)).toBe(1);
  });
});

describe('CategoryCarousel: порядок слайдов', () => {
  it('на узком экране слайды идут ровно как пришли', () => {
    window.innerWidth = 486;
    renderCarousel();

    const titles = screen.getAllByTestId('slide').map((s) => s.textContent.trim());
    expect(titles).toEqual(LETTERS);
  });

  it('на узком экране не остаётся перестановки под два ряда', () => {
    window.innerWidth = 486;
    renderCarousel();

    const titles = screen.getAllByTestId('slide').map((s) => s.textContent.trim());
    // Старое поведение, из-за которого алфавит начинался заново с середины.
    expect(titles).not.toEqual(['Audi', 'Chevrolet', 'Ford', 'Honda', 'BMW', 'Dodge', 'GMC']);
  });

  it('на широком экране длинный список раскладывается колонками', () => {
    window.innerWidth = 1440;
    const many = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, title: `Cat${String(i).padStart(2, '0')}` }));
    renderCarousel(many);

    const titles = screen.getAllByTestId('slide').map((s) => s.textContent.trim());
    const half = Math.ceil(many.length / 2);
    // Верхний ряд Swiper заполнит первыми half слайдами — это чётные позиции.
    expect(titles.slice(0, half)).toEqual(many.filter((_, i) => i % 2 === 0).map((c) => c.title));
  });

  it('breakpoints строятся из того же списка, что и перестановка', () => {
    renderCarousel();

    const points = swiperProps.current.breakpoints;
    expect(points[0].grid.rows).toBe(1);
    expect(points[992].grid.rows).toBe(2);
    expect(points[1400].slidesPerView).toBe(6);
  });

  it('пустой список не рисует карусель', () => {
    renderCarousel([]);

    expect(screen.queryByTestId('swiper')).toBeNull();
  });
});
