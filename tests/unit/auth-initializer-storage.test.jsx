/**
 * Инициализация авторизации не должна отменять только что выполненный вход.
 *
 * Эффект читает токен из хранилища и, не найдя его, раньше делал userLoggedOut.
 * Зависимость у эффекта — сам accessToken, поэтому он срабатывал ровно в момент
 * появления токена после успешного входа. Там, где хранилище недоступно
 * (WebView Telegram Desktop), вход снимался сам собой: тост показан, редиректа
 * нет, следующий запрос уходит без заголовка.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const dispatch = vi.fn();
let authState = { accessToken: null };

vi.mock('react-redux', () => ({
  useDispatch: () => dispatch,
  useSelector: (selector) => selector({ auth: authState }),
}));

vi.mock('@/redux/features/auth/authApi', () => ({
  useTelegramAuthMutation: () => [vi.fn()],
  useTelegramAutoLinkMutation: () => [vi.fn()],
}));

vi.mock('js-cookie', () => ({
  default: { get: () => undefined, set: vi.fn(), remove: vi.fn() },
}));

vi.mock('@/utils/telegram', () => ({
  readTelegramInitData: () => '',
  readTelegramInitDataUnsafe: () => null,
  hasTelegramInitData: () => false,
  buildTelegramInitPayload: () => null,
}));

const storage = { writable: true, data: null };
vi.mock('@/utils/authStorage', () => ({
  getAuth: () => storage.data,
  isStorageWritable: () => storage.writable,
}));

vi.mock('@/redux/features/auth/authSlice', () => ({
  userLoggedIn: (p) => ({ type: 'auth/userLoggedIn', payload: p }),
  userLoggedOut: () => ({ type: 'auth/userLoggedOut' }),
}));

const AuthInitializer = (await import('@/components/auth/auth-initializer')).default;

const types = () => dispatch.mock.calls.map(([a]) => a?.type);

beforeEach(() => {
  dispatch.mockClear();
  storage.writable = true;
  storage.data = null;
  authState = { accessToken: null };
});

describe('хранилище недоступно', () => {
  it('вход не отменяется', () => {
    // Токен уже в Redux — его положил успешный вход. Хранилище мёртвое.
    storage.writable = false;
    authState = { accessToken: 'fresh-token' };

    render(<AuthInitializer><div /></AuthInitializer>);

    expect(types()).not.toContain('auth/userLoggedOut');
  });

  it('и без токена ничего не диспатчится', () => {
    storage.writable = false;

    render(<AuthInitializer><div /></AuthInitializer>);

    expect(types()).not.toContain('auth/userLoggedOut');
  });
});

describe('хранилище рабочее', () => {
  it('пустое хранилище при токене в Redux — разлогин, как и раньше', () => {
    // Смысл ветки сохраняется: пользователь вышел в другой вкладке.
    storage.writable = true;
    storage.data = null;
    authState = { accessToken: 'stale-token' };

    render(<AuthInitializer><div /></AuthInitializer>);

    expect(types()).toContain('auth/userLoggedOut');
  });

  it('найденный токен восстанавливает сессию', () => {
    storage.data = { accessToken: 'stored', user: { id: 3 }, isGuest: false };

    render(<AuthInitializer><div /></AuthInitializer>);

    expect(types()).toContain('auth/userLoggedIn');
    expect(types()).not.toContain('auth/userLoggedOut');
  });

  it('без токена нигде разлогин не нужен', () => {
    render(<AuthInitializer><div /></AuthInitializer>);

    expect(types()).not.toContain('auth/userLoggedOut');
    expect(types()).not.toContain('auth/userLoggedIn');
  });
});

describe('синхронизация между вкладками', () => {
  it('событие storage при мёртвом хранилище не разлогинивает', () => {
    storage.writable = false;
    authState = { accessToken: 'fresh-token' };
    render(<AuthInitializer><div /></AuthInitializer>);
    dispatch.mockClear();

    window.dispatchEvent(new Event('storage'));

    expect(types()).not.toContain('auth/userLoggedOut');
  });

  it('выход в другой вкладке по-прежнему разлогинивает', () => {
    storage.writable = true;
    storage.data = null;
    authState = { accessToken: 'token-from-other-tab' };
    render(<AuthInitializer><div /></AuthInitializer>);
    dispatch.mockClear();

    window.dispatchEvent(new Event('storage'));

    expect(types()).toContain('auth/userLoggedOut');
  });
});
