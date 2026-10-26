/**
 * Запрос списка товаров витрины: seed перемешивания едет во все комбинации
 * параметров, а без него URL прежний — старые тесты и бот ничего не замечают.
 */
import { describe, expect, it } from 'vitest';

import { buildGoodsListQuery } from '@/redux/features/productsApi';

const params = (args) => new URLSearchParams(buildGoodsListQuery(args).split('?')[1]);

describe('buildGoodsListQuery — seed', () => {
  it('без seed параметра нет', () => {
    expect(params({}).has('seed')).toBe(false);
    expect(params({ seed: '' }).has('seed')).toBe(false);
  });

  it('seed добавляется и экранируется', () => {
    const p = params({ seed: 'a b&c' });
    expect(p.get('seed')).toBe('a b&c');
    expect(p.get('limit')).toBe('12');
    expect(p.get('offset')).toBe('0');
  });

  it('seed сохраняется вместе с поиском, категорией и фильтрами', () => {
    const p = params({
      seed: 'visit', searchText: 'штора', categoryId: 7, priceMin: '10', priceMax: '20.5',
      inStock: true, offset: 24,
    });
    expect(p.get('seed')).toBe('visit');
    expect(p.get('title__icontains')).toBe('штора');
    expect(p.get('category_id')).toBe('7');
    expect(p.get('price_minor__gte')).toBe('1000');
    expect(p.get('price_minor__lte')).toBe('2050');
    expect(p.get('residue__gt')).toBe('0');
    expect(p.get('offset')).toBe('24');
  });

  it('с явной сортировкой seed всё равно уходит — решает бэкенд', () => {
    const p = params({ seed: 'visit', ordering: '-price_minor' });
    expect(p.get('ordering')).toBe('-price_minor');
    expect(p.get('seed')).toBe('visit');
  });
});
