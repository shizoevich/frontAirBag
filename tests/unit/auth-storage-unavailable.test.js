/**
 * Хранилище может быть недоступно — так ведёт себя WebView Telegram Desktop.
 *
 * Симптом, который это ломало: вход проходит, зелёный тост показан, а редиректа
 * нет. Редирект завязан на появление accessToken в Redux, а эффект инициализации
 * снимал его как «протухшее состояние», потому что в хранилище пусто. В обычном
 * браузере и на телефоне не воспроизводилось: там хранилище живое.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAuth, isStorageWritable, setAuth } from '@/utils/authStorage';

/** Подменяет localStorage на такой, который бросает на любой операции. */
function breakStorage() {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => { throw new DOMException('denied'); },
      setItem: () => { throw new DOMException('denied'); },
      removeItem: () => { throw new DOMException('denied'); },
    },
  });
}

/** Хранилище, которое запись принимает, но ничего не сохраняет. */
function silentStorage() {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  });
}

function realStorage() {
  const data = new Map();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k) => (data.has(k) ? data.get(k) : null),
      setItem: (k, v) => data.set(k, String(v)),
      removeItem: (k) => data.delete(k),
    },
  });
  return data;
}

describe('isStorageWritable', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('рабочее хранилище распознаётся', () => {
    realStorage();
    expect(isStorageWritable()).toBe(true);
  });

  it('бросающее хранилище — недоступно', () => {
    breakStorage();
    expect(isStorageWritable()).toBe(false);
  });

  it('молча не сохраняющее хранилище тоже недоступно', () => {
    // Проверка round-trip, а не только setItem: приватные режимы некоторых
    // браузеров запись принимают, но при чтении отдают null.
    silentStorage();
    expect(isStorageWritable()).toBe(false);
  });

  it('после проверки в хранилище не остаётся мусора', () => {
    const data = realStorage();
    isStorageWritable();
    expect(data.size).toBe(0);
  });
});

describe('чтение и запись при недоступном хранилище', () => {
  it('getAuth не бросает, а возвращает null', () => {
    breakStorage();
    expect(getAuth()).toBeNull();
  });

  it('setAuth не бросает', () => {
    breakStorage();
    expect(() => setAuth({ accessToken: 'x' })).not.toThrow();
  });

  it('при рабочем хранилище запись и чтение сходятся', () => {
    realStorage();
    setAuth({ accessToken: 'token-1', user: { id: 7 } });
    expect(getAuth()).toEqual({ accessToken: 'token-1', user: { id: 7 } });
  });
});
