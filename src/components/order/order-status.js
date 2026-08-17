/**
 * Похідні стани замовлення для списку та картки в кабінеті.
 *
 * Функції повертають КЛЮЧІ i18n, а не готовий текст: так вони не залежать від
 * `t`/локалі й перевіряються юніт-тестами без рендера всієї сторінки з redux,
 * next-intl і RTK Query.
 *
 * Джерело правди щодо станів — backend/core/services/order_cancel.py.
 */

export const STATUS_CANCELED = 'canceled';
export const STATUS_CANCEL_REQUESTED = 'cancel_requested';
export const STATUS_COMPLETED = 'completed';
export const STATUS_PAID = 'paid';
export const STATUS_PENDING = 'pending';

/**
 * Скасування важливіше за оплату/виконання: скасоване замовлення не має
 * показуватись як «Оплачено» чи «Виконано».
 */
export function statusOf(order) {
  if (order?.cancel_state === 'canceled') return STATUS_CANCELED;
  if (order?.cancel_state === 'requested') return STATUS_CANCEL_REQUESTED;
  if (order?.is_completed) return STATUS_COMPLETED;
  if (order?.is_paid) return STATUS_PAID;
  return STATUS_PENDING;
}

export const STATUS_BADGE_CLASS = {
  [STATUS_CANCELED]: 'bg-danger',
  [STATUS_CANCEL_REQUESTED]: 'bg-warning text-dark',
  [STATUS_COMPLETED]: 'bg-success',
  [STATUS_PAID]: 'bg-info',
  [STATUS_PENDING]: 'bg-secondary',
};

export function statusBadgeClass(order) {
  return STATUS_BADGE_CLASS[statusOf(order)];
}

/**
 * Стан повернення коштів. `manual` (адмін повернув поза Monobank) для клієнта
 * нічим не відрізняється від `done` — гроші повернуто в обох випадках.
 */
export function refundStateKey(order) {
  const state = order?.refund_state;
  if (state === 'done' || state === 'manual') return 'refund_done';
  if (state === 'pending') return 'refund_processing';
  return null;
}

/**
 * Причини, які показуємо клієнту. Адмінські (no_contact, out_of_stock,
 * removed_in_remonline) сюди не входять: перекладів для них немає, та й
 * внутрішня кухня клієнта не стосується.
 */
export const CLIENT_CANCEL_REASONS = [
  'changed_mind',
  'found_cheaper',
  'wrong_items',
  'delivery_too_long',
  'duplicate',
  'payment_failed',
  'other',
];

export function cancelReasonKey(code) {
  return CLIENT_CANCEL_REASONS.includes(code) ? `cancel_reason_${code}` : null;
}
