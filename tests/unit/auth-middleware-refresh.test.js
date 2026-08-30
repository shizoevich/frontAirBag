/**
 * Слушатель обновления токена не должен выкидывать пользователя.
 *
 * Он срабатывает на любое изменение auth.accessToken — в том числе в момент
 * успешного входа. Раньше первым делом читался cookie, и при его отсутствии
 * сразу шёл userLoggedOut. В WebView Telegram Desktop cookie не ставятся,
 * поэтому вход снимался мгновенно: тост показан, сессии нет, следующий запрос
 * уходит без заголовка авторизации.
 *
 * Теперь разлогин наступает, только если сервер отверг обновление токена.
 */
import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const cookieStore = { value: undefined };
vi.mock('js-cookie', () => ({
  default: {
    get: () => cookieStore.value,
    set: (_k, v) => { cookieStore.value = v; },
    remove: () => { cookieStore.value = undefined; },
  },
}));

const { authMiddleware } = await import('@/redux/middleware/authMiddleware');
const authReducer = (await import('@/redux/features/auth/authSlice')).default;
const { userLoggedIn } = await import('@/redux/features/auth/authSlice');

/** JWT с заданным сроком жизни. Подпись не проверяется — код только парсит payload. */
function makeToken(secondsUntilExpiry) {
  const payload = { user_id: 1, exp: Math.floor(Date.now() / 1000) + secondsUntilExpiry };
  return `h.${btoa(JSON.stringify(payload))}.s`;
}

function makeStore() {
  return configureStore({
    reducer: { auth: authReducer },
    middleware: (gdm) => gdm({ serializableCheck: false }).prepend(authMiddleware.middleware),
  });
}

/** Ждём, пока отработает асинхронный эффект слушателя. */
const settle = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  cookieStore.value = undefined;
  localStorage.clear();
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com/api/v2');
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('хранилище недоступно', () => {
  it('вход не отменяется, когда нет ни cookie, ни localStorage', async () => {
    // Ровно случай Telegram Desktop: токен только в памяти.
    const store = makeStore();

    store.dispatch(userLoggedIn({ accessToken: makeToken(3600) }));
    await settle();

    expect(store.getState().auth.accessToken).not.toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('свежий токен', () => {
  it('обновление не запрашивается', async () => {
    localStorage.setItem('userInfo', JSON.stringify({
      accessToken: makeToken(3600), refreshToken: 'r',
    }));
    const store = makeStore();

    store.dispatch(userLoggedIn({ accessToken: makeToken(3600) }));
    await settle();

    expect(fetch).not.toHaveBeenCalled();
    expect(store.getState().auth.accessToken).not.toBeNull();
  });
});

describe('токен на исходе', () => {
  it('успешное обновление меняет токен и не разлогинивает', async () => {
    localStorage.setItem('userInfo', JSON.stringify({
      accessToken: makeToken(60), refreshToken: 'r',
    }));
    fetch.mockResolvedValue({ ok: true, json: async () => ({ access: 'обновлённый' }) });
    const store = makeStore();

    store.dispatch(userLoggedIn({ accessToken: makeToken(60) }));
    await settle();
    await settle();

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toBe('https://api.example.com/api/v2/auth/token/refresh/');
    expect(store.getState().auth.accessToken).toBe('обновлённый');
  });

  it('отказ сервера — законный разлогин', async () => {
    localStorage.setItem('userInfo', JSON.stringify({
      accessToken: makeToken(60), refreshToken: 'r',
    }));
    fetch.mockResolvedValue({ ok: false, json: async () => ({}) });
    const store = makeStore();

    store.dispatch(userLoggedIn({ accessToken: makeToken(60) }));
    await settle();
    await settle();

    expect(store.getState().auth.accessToken).toBeNull();
  });

  it('обрыв сети не выкидывает пользователя', async () => {
    localStorage.setItem('userInfo', JSON.stringify({
      accessToken: makeToken(60), refreshToken: 'r',
    }));
    fetch.mockRejectedValue(new TypeError('network'));
    const store = makeStore();

    store.dispatch(userLoggedIn({ accessToken: makeToken(60) }));
    await settle();
    await settle();

    expect(store.getState().auth.accessToken).not.toBeNull();
  });

  it('без refresh-токена ничего не запрашивается и не разлогинивает', async () => {
    const store = makeStore();

    store.dispatch(userLoggedIn({ accessToken: makeToken(60) }));
    await settle();

    expect(fetch).not.toHaveBeenCalled();
    expect(store.getState().auth.accessToken).not.toBeNull();
  });
});

describe('переменная окружения', () => {
  it('без NEXT_PUBLIC_API_BASE_URL запрос не уходит и разлогина нет', async () => {
    // Раньше здесь стояла несуществующая NEXT_PUBLIC_API_URL: fetch уходил на
    // «undefined/auth/token/refresh/», падал и разлогинивал всех подряд.
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    localStorage.setItem('userInfo', JSON.stringify({
      accessToken: makeToken(60), refreshToken: 'r',
    }));
    const store = makeStore();

    store.dispatch(userLoggedIn({ accessToken: makeToken(60) }));
    await settle();

    expect(fetch).not.toHaveBeenCalled();
    expect(store.getState().auth.accessToken).not.toBeNull();
  });
});
