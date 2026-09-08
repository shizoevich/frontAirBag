/**
 * Сессия истекла внутри мини-аппа — вход по Telegram заново, запрос повторяется.
 *
 * Инцидент 05.09.2026 (Сидоренко): refresh отвергнут → разлогин → чекаут завёл
 * гостя → 403 на заказе, четыре круга. Теперь между refresh и разлогином стоит
 * POST /telegram/auth с initData, который лежит рядом.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('js-cookie', () => ({
  default: { get: () => undefined, set: vi.fn(), remove: vi.fn() },
}));

vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.example.com/api/v2');
const { baseQueryWithReauth } = await import('@/redux/api/apiSlice');

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function makeApi() {
  return {
    signal: new AbortController().signal,
    abort: () => {},
    dispatch: vi.fn(),
    getState: () => ({ auth: { accessToken: null } }),
    extra: undefined,
    endpoint: 'createOrder',
    type: 'mutation',
    forced: false,
  };
}

const calledUrls = () => fetch.mock.calls.map(([req]) => (typeof req === 'string' ? req : req.url));

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('userInfo', JSON.stringify({ accessToken: 'stale', refreshToken: 'dead' }));
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete window.Telegram;
});

describe('истёкшая сессия в мини-аппе', () => {
  it('refresh отвергнут → вход по Telegram → исходный запрос повторён', async () => {
    window.Telegram = { WebApp: { initData: 'auth_date=1&user=%7B%7D&hash=abc' } };
    fetch
      .mockResolvedValueOnce(jsonResponse(401, { code: 'token_not_valid' }))
      .mockResolvedValueOnce(jsonResponse(401, { code: 'token_not_valid' }))
      .mockResolvedValueOnce(jsonResponse(200, { access: 'fresh', refresh: 'fresh-r', user: { id: 7, telegram_ids: [1] } }))
      .mockResolvedValueOnce(jsonResponse(201, { id: 100 }));
    const api = makeApi();

    const result = await baseQueryWithReauth({ url: '/orders/', method: 'POST', body: {} }, api, {});

    expect(result.data).toEqual({ id: 100 });
    expect(calledUrls()).toEqual([
      'https://api.example.com/api/v2/orders/',
      'https://api.example.com/api/v2/auth/token/refresh/',
      'https://api.example.com/api/v2/telegram/auth',
      'https://api.example.com/api/v2/orders/',
    ]);
    // Вход по Telegram уходит без мёртвого Bearer
    const telegramReq = fetch.mock.calls[2][0];
    expect(telegramReq.headers.get('authorization')).toBeNull();
    // Сессия сохранена, Redux оповещён, разлогина нет
    expect(JSON.parse(localStorage.getItem('userInfo')).accessToken).toBe('fresh');
    const types = api.dispatch.mock.calls.map(([a]) => a.type);
    expect(types).toContain('auth/userLoggedIn');
    expect(types).not.toContain('auth/userLoggedOut');
    // Повтор идёт уже с новым токеном
    expect(fetch.mock.calls[3][0].headers.get('authorization')).toBe('Bearer fresh');
  });

  it('неизвестный Telegram (404) — честный разлогин', async () => {
    window.Telegram = { WebApp: { initData: 'auth_date=1&user=%7B%7D&hash=abc' } };
    fetch
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(404, { code: 'telegram_unknown' }));
    const api = makeApi();

    const result = await baseQueryWithReauth({ url: '/orders/', method: 'POST', body: {} }, api, {});

    expect(result.error?.status).toBe(401);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(api.dispatch.mock.calls.map(([a]) => a.type)).toContain('auth/userLoggedOut');
  });
});

describe('сайт без Telegram', () => {
  it('refresh отвергнут — разлогин, /telegram/auth не вызывается', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(401, {}));
    const api = makeApi();

    await baseQueryWithReauth({ url: '/orders/' }, api, {});

    expect(calledUrls()).not.toContain('https://api.example.com/api/v2/telegram/auth');
    expect(api.dispatch.mock.calls.map(([a]) => a.type)).toContain('auth/userLoggedOut');
  });

  it('удачный refresh обходится без Telegram', async () => {
    window.Telegram = { WebApp: { initData: 'auth_date=1&user=%7B%7D&hash=abc' } };
    fetch
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(200, { access: 'renewed' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const api = makeApi();

    const result = await baseQueryWithReauth({ url: '/orders/' }, api, {});

    expect(result.data).toEqual({ ok: true });
    expect(calledUrls()).not.toContain('https://api.example.com/api/v2/telegram/auth');
  });
});

describe('защита от цикла', () => {
  it('401 на самом /telegram/auth не запускает повторный вход', async () => {
    window.Telegram = { WebApp: { initData: 'auth_date=1&user=%7B%7D&hash=abc' } };
    fetch.mockResolvedValueOnce(jsonResponse(401, {}));
    const api = makeApi();

    await baseQueryWithReauth({ url: '/telegram/auth', method: 'POST', body: {} }, api, {});

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
