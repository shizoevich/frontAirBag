/**
 * Маппінг фільтрів кабінету на параметри бекенда.
 *
 * Фіксує два неочевидні рішення, які легко «спростити» і зламати:
 *  - скасовані відсіюються через canceled_at__isnull, а не cancel_state='':
 *    порожній рядок прибрав би і замовлення з активним запитом на скасування;
 *  - булеві йдуть як 1/0 — UniversalFieldFilterBackend передає значення в
 *    queryset.filter() як є, і 'true' там не спрацює.
 */
import { describe, expect, it } from 'vitest';

import { buildOrdersListQuery } from '@/redux/features/ordersApi';

const params = (args) => new URLSearchParams(buildOrdersListQuery(args).split('?')[1]);

describe('buildOrdersListQuery — статуси', () => {
  it('canceled показує лише скасовані', () => {
    const p = params({ status: 'canceled' });
    expect(p.get('canceled_at__isnull')).toBe('false');
    expect(p.has('is_completed')).toBe(false);
    expect(p.has('is_paid')).toBe(false);
  });

  it('pending виключає скасовані', () => {
    const p = params({ status: 'pending' });
    expect(p.get('canceled_at__isnull')).toBe('true');
    expect(p.get('is_completed')).toBe('0');
    expect(p.get('is_paid')).toBe('0');
  });

  it('paid виключає скасовані', () => {
    const p = params({ status: 'paid' });
    expect(p.get('canceled_at__isnull')).toBe('true');
    expect(p.get('is_completed')).toBe('0');
    expect(p.get('is_paid')).toBe('1');
  });

  it('completed виключає скасовані', () => {
    const p = params({ status: 'completed' });
    expect(p.get('canceled_at__isnull')).toBe('true');
    expect(p.get('is_completed')).toBe('1');
  });

  it('all не фільтрує за скасуванням зовсім', () => {
    const p = params({ status: 'all' });
    expect(p.has('canceled_at__isnull')).toBe(false);
    expect(p.has('is_completed')).toBe(false);
  });

  it('без статусу параметрів фільтрації немає', () => {
    const p = params({});
    expect(p.has('canceled_at__isnull')).toBe(false);
  });

  it('cancel_state як фільтр не використовується', () => {
    // Порожній cancel_state прибрав би замовлення в стані requested/rejected,
    // які насправді ще в роботі.
    ['pending', 'paid', 'completed', 'canceled'].forEach((status) => {
      expect(params({ status }).has('cancel_state')).toBe(false);
    });
  });
});

describe('buildOrdersListQuery — базові параметри', () => {
  it('дефолти пагінації та сортування', () => {
    const p = params({});
    expect(p.get('ordering')).toBe('-date');
    expect(p.get('limit')).toBe('20');
    expect(p.get('offset')).toBe('0');
  });

  it('client додається лише коли заданий', () => {
    expect(params({ client: 42 }).get('client')).toBe('42');
    expect(params({}).has('client')).toBe(false);
  });

  it('дата "до" розширюється до кінця доби', () => {
    // Інакше замовлення, створені в цей же день пізніше опівночі, випадають
    const p = params({ dateFrom: '2026-08-01', dateTo: '2026-08-16' });
    expect(p.get('date__gte')).toBe('2026-08-01');
    expect(p.get('date__lte')).toBe('2026-08-16T23:59:59');
  });

  it('викликається без аргументів і не падає', () => {
    expect(() => buildOrdersListQuery()).not.toThrow();
    expect(buildOrdersListQuery()).toContain('/orders/?');
  });
});
