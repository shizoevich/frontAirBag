import { describe, expect, it } from 'vitest';

import {
  PINNED_ROOT_CATEGORY_IDS,
  getChildrenAtLevel,
  sortAlphabetically,
  sortRootCategories,
} from '@/utils/categoryTreeHelpers';

/**
 * Порядок разделов каталога.
 *
 * Клиент попросил исключение для верхнего уровня: «Накладки», «Пиропатроны»,
 * «Комплектующие Airbag SRS» всегда идут в этом порядке, остальное — за ними по
 * алфавиту. По алфавиту эти три встали бы иначе: «Комплектующие, Накладки,
 * Пиропатроны». Внутри разделов порядок остаётся алфавитным.
 */

const NAKLADKI = { id: 754099, title: 'Накладки' };
const KOMPLEKT = { id: 754100, title: 'Комплектующие Airbag SRS' };
const PIRO = { id: 754101, title: 'Пиропатроны' };

const ROOT = [KOMPLEKT, NAKLADKI, PIRO];
const titles = (list) => list.map((c) => c.title);

describe('sortRootCategories', () => {
  it('ставит три закреплённых раздела в заданном порядке', () => {
    expect(titles(sortRootCategories(ROOT))).toEqual([
      'Накладки',
      'Пиропатроны',
      'Комплектующие Airbag SRS',
    ]);
  });

  it('порядок не зависит от того, как категории пришли из API', () => {
    const shuffled = [PIRO, KOMPLEKT, NAKLADKI];

    expect(titles(sortRootCategories(shuffled))).toEqual(titles(sortRootCategories(ROOT)));
  });

  it('новые разделы встают следом и между собой по алфавиту', () => {
    const withNew = [
      { id: 900002, title: 'Ремені' },
      ...ROOT,
      { id: 900001, title: 'Датчики' },
    ];

    expect(titles(sortRootCategories(withNew))).toEqual([
      'Накладки',
      'Пиропатроны',
      'Комплектующие Airbag SRS',
      'Датчики',
      'Ремені',
    ]);
  });

  it('закреплённый раздел находится по id, а не по названию', () => {
    const renamed = [{ id: 754101, title: 'Пиропатрони (нова назва)' }, KOMPLEKT, NAKLADKI];

    expect(titles(sortRootCategories(renamed))[1]).toBe('Пиропатрони (нова назва)');
  });

  it('исчезнувший из каталога раздел просто не мешает', () => {
    expect(titles(sortRootCategories([KOMPLEKT, NAKLADKI]))).toEqual([
      'Накладки',
      'Комплектующие Airbag SRS',
    ]);
  });

  it('без закреплённых остаётся чистый алфавит', () => {
    const others = [{ id: 1, title: 'Ремені' }, { id: 2, title: 'Датчики' }];

    expect(titles(sortRootCategories(others))).toEqual(titles(sortAlphabetically(others)));
  });

  it('пустой ввод не роняет', () => {
    expect(sortRootCategories([])).toEqual([]);
    expect(sortRootCategories(undefined)).toEqual([]);
    expect(sortRootCategories(null)).toEqual([]);
  });

  it('в списке ровно три закреплённых id', () => {
    expect(PINNED_ROOT_CATEGORY_IDS).toEqual([754099, 754101, 754100]);
  });
});

describe('уровни ниже корня остаются алфавитными', () => {
  const tree = [
    {
      ...NAKLADKI,
      children: [
        { id: 11, title: 'Toyota' },
        { id: 12, title: 'Acura' },
        { id: 13, title: 'BMW' },
      ],
    },
    PIRO,
    KOMPLEKT,
  ];

  it('корень каталога идёт по закреплённому порядку', () => {
    expect(titles(getChildrenAtLevel(tree, [], 0))).toEqual([
      'Накладки',
      'Пиропатроны',
      'Комплектующие Airbag SRS',
    ]);
  });

  it('марки внутри раздела — по алфавиту', () => {
    expect(titles(getChildrenAtLevel(tree, [754099], 1))).toEqual(['Acura', 'BMW', 'Toyota']);
  });
});
