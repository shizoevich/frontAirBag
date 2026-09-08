/**
 * Один формат телефона на всю систему: `+380` и ровно девять цифр (ADR-0021).
 *
 * Бэкенд держит такой же CheckConstraint, так что любой другой вид номера в базу
 * не попадёт — здесь мы лишь не даём пользователю его набрать.
 */
export const PHONE_PREFIX = '+380';
export const PHONE_RE = /^\+380\d{9}$/;
export const PHONE_LOCAL_LENGTH = 9;

/**
 * Девять «местных» цифр из любой записи: `+380501234567`, `0501234567`,
 * `501234567`, `+38 (050) 123-45-67`. Лишнее отбрасывается, буквы игнорируются.
 */
export function phoneDigits(raw) {
  if (raw === null || raw === undefined) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('380')) {
    // Код страны — набранный или вставленный целиком. Оператора «38» не
    // существует, так что это не начало местного номера.
    digits = digits.slice(3);
  }
  // Местный номер без кода всегда начинается с 0 — это тоже не цифра номера.
  digits = digits.replace(/^0+/, '');
  return digits.slice(0, PHONE_LOCAL_LENGTH);
}

/** `+380` + цифры; пустые цифры — пустая строка, чтобы `required` сработал. */
export function composePhone(digits) {
  return digits ? PHONE_PREFIX + digits : '';
}

/** Полный номер или `null`, если цифр не девять. */
export function normalizeUaPhone(raw) {
  const digits = phoneDigits(raw);
  return digits.length === PHONE_LOCAL_LENGTH ? PHONE_PREFIX + digits : null;
}

export function isNormalizedPhone(value) {
  return PHONE_RE.test(String(value ?? ''));
}
