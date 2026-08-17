/**
 * Похідні стани замовлення в кабінеті.
 *
 * Головний регрес, який тут зафіксовано: скасування має перебивати
 * is_paid/is_completed. Інакше скасоване замовлення знову показується як
 * «Оплачено», і клієнт вважає, що воно в роботі.
 */
import { describe, expect, it } from 'vitest';

import {
  CLIENT_CANCEL_REASONS,
  STATUS_BADGE_CLASS,
  cancelReasonKey,
  refundStateKey,
  statusBadgeClass,
  statusOf,
} from '@/components/order/order-status';

const order = (overrides = {}) => ({
  id: 1,
  is_paid: false,
  is_completed: false,
  cancel_state: '',
  refund_state: '',
  ...overrides,
});

describe('statusOf', () => {
  it('нове замовлення без оплати — pending', () => {
    expect(statusOf(order())).toBe('pending');
  });

  it('оплачене — paid', () => {
    expect(statusOf(order({ is_paid: true }))).toBe('paid');
  });

  it('завершене — completed', () => {
    expect(statusOf(order({ is_paid: true, is_completed: true }))).toBe('completed');
  });

  it('скасування перебиває і оплату, і завершення', () => {
    const canceled = order({ is_paid: true, is_completed: true, cancel_state: 'canceled' });
    expect(statusOf(canceled)).toBe('canceled');
  });

  it('запит на скасування перебиває оплату', () => {
    expect(statusOf(order({ is_paid: true, cancel_state: 'requested' }))).toBe('cancel_requested');
  });

  it('відхилений запит повертає замовлення до звичайного статусу', () => {
    // rejected — замовлення знову в роботі, окремого статусу для нього немає
    expect(statusOf(order({ is_paid: true, cancel_state: 'rejected' }))).toBe('paid');
  });

  it('не падає на undefined', () => {
    expect(statusOf(undefined)).toBe('pending');
  });
});

describe('statusBadgeClass', () => {
  it('скасоване — червоне, очікує — жовте', () => {
    expect(statusBadgeClass(order({ cancel_state: 'canceled' }))).toBe('bg-danger');
    expect(statusBadgeClass(order({ cancel_state: 'requested' }))).toContain('bg-warning');
  });

  it('кожен статус має свій клас', () => {
    const statuses = ['canceled', 'cancel_requested', 'completed', 'paid', 'pending'];
    statuses.forEach((s) => expect(STATUS_BADGE_CLASS[s]).toBeTruthy());
  });
});

describe('refundStateKey', () => {
  it('done і manual для клієнта однакові — кошти повернуто', () => {
    expect(refundStateKey(order({ refund_state: 'done' }))).toBe('refund_done');
    expect(refundStateKey(order({ refund_state: 'manual' }))).toBe('refund_done');
  });

  it('pending — повернення в обробці', () => {
    expect(refundStateKey(order({ refund_state: 'pending' }))).toBe('refund_processing');
  });

  it('порожній стан і failed нічого не показують', () => {
    expect(refundStateKey(order())).toBeNull();
    // failed — це проблема адміна, клієнту показувати «помилка повернення» не варто
    expect(refundStateKey(order({ refund_state: 'failed' }))).toBeNull();
  });

  it('не падає на undefined', () => {
    expect(refundStateKey(undefined)).toBeNull();
  });
});

describe('cancelReasonKey', () => {
  it('клієнтські причини мають ключ перекладу', () => {
    CLIENT_CANCEL_REASONS.forEach((code) => {
      expect(cancelReasonKey(code)).toBe(`cancel_reason_${code}`);
    });
  });

  it('адмінські причини клієнту не показуємо', () => {
    // Перекладів для них немає — інакше next-intl впаде або віддасть сирий ключ
    ['no_contact', 'out_of_stock', 'removed_in_remonline'].forEach((code) => {
      expect(cancelReasonKey(code)).toBeNull();
    });
  });

  it('невідомий код і порожнє значення — null', () => {
    expect(cancelReasonKey('whatever')).toBeNull();
    expect(cancelReasonKey(null)).toBeNull();
    expect(cancelReasonKey(undefined)).toBeNull();
  });
});
