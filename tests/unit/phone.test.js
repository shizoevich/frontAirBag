/**
 * Один формат телефона: `+380` и девять цифр (ADR-0021).
 *
 * На бою `0958398519` и `+380958398519` были двумя клиентами (записи 86 и 208);
 * фронт обязан сводить любое написание к одному значению ещё до отправки.
 */
import { describe, expect, it } from 'vitest';
import { composePhone, normalizeUaPhone, phoneDigits, isNormalizedPhone } from '@/utils/phone';

describe('phoneDigits', () => {
  it('сводит все привычные написания к девяти цифрам', () => {
    for (const raw of [
      '+380501234567', '380501234567', '0501234567', '501234567',
      '+38 (050) 123-45-67', ' 050 123 45 67 ',
    ]) {
      expect(phoneDigits(raw), raw).toBe('501234567');
    }
  });

  it('буквы и символы не становятся цифрами', () => {
    expect(phoneDigits('a5b0c1')).toBe('501');
  });

  it('десятая цифра отбрасывается', () => {
    expect(phoneDigits('5012345678')).toBe('501234567');
  });

  it('ведущий ноль местного номера не считается', () => {
    expect(phoneDigits('0')).toBe('');
    expect(phoneDigits('05')).toBe('5');
  });

  it('пусто остаётся пустым', () => {
    expect(phoneDigits('')).toBe('');
    expect(phoneDigits(null)).toBe('');
    expect(phoneDigits(undefined)).toBe('');
  });
});

describe('normalizeUaPhone', () => {
  it('полный номер — только при девяти цифрах', () => {
    expect(normalizeUaPhone('0501234567')).toBe('+380501234567');
    expect(normalizeUaPhone('050123456')).toBeNull();
    expect(normalizeUaPhone('')).toBeNull();
  });

  it('composePhone: пустые цифры — пустая строка, чтобы сработал required', () => {
    expect(composePhone('')).toBe('');
    expect(composePhone('501')).toBe('+380501');
  });

  it('isNormalizedPhone', () => {
    expect(isNormalizedPhone('+380501234567')).toBe(true);
    expect(isNormalizedPhone('0501234567')).toBe(false);
    expect(isNormalizedPhone('+3805012345678')).toBe(false);
  });
});
