/**
 * Прямой доступ к бэкенду из спек: сидирование заказов, привязка Telegram,
 * проверка профиля. Всё, что руками через UI делать долго или невозможно.
 */
import { APIRequestContext, expect } from '@playwright/test';
import { generateInitData, TelegramUser } from './init-data';

export const API_URL = process.env.API_URL ?? 'http://localhost:8000';
export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
export const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
export const LOCALE = process.env.LOCALE ?? 'ru';
export const BASE = `${SITE_URL}/${LOCALE}`;

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function apiLogin(request: APIRequestContext, email: string, password: string): Promise<string> {
  const resp = await request.post(`${API_URL}/api/v2/auth/login/`, { data: { email, password } });
  expect(resp.ok(), `login failed for ${email}: ${resp.status()} ${await resp.text()}`).toBeTruthy();
  return (await resp.json()).access;
}

export async function apiMe(request: APIRequestContext, token: string) {
  const resp = await request.get(`${API_URL}/api/v2/auth/me/`, { headers: auth(token) });
  expect(resp.ok(), `/auth/me failed: ${resp.status()}`).toBeTruthy();
  return resp.json();
}

/** Вход по Telegram напрямую — тот же запрос, что делает мини-апп. */
export async function apiTelegramAuth(request: APIRequestContext, user: TelegramUser) {
  return request.post(`${API_URL}/api/v2/telegram/auth`, {
    data: { init_data: generateInitData(BOT_TOKEN, user) },
  });
}

/**
 * Привязывает Telegram к аккаунту токена. Повторный вызов идемпотентен;
 * 409 означает, что этот Telegram уже за другим аккаунтом — тестовые данные
 * в базе разошлись с .env, и спека честно падает.
 */
export async function ensureTelegramLinked(request: APIRequestContext, token: string, user: TelegramUser) {
  const resp = await request.post(`${API_URL}/api/v2/telegram/auto-link`, {
    headers: auth(token),
    data: { init_data: generateInitData(BOT_TOKEN, user) },
  });
  expect(resp.status(), `auto-link ${user.id}: ${resp.status()} ${await resp.text()}`).toBe(200);
  return resp.json();
}

/** Любой товар из каталога — чтобы положить в корзину. */
export async function firstGood(request: APIRequestContext) {
  const resp = await request.get(`${API_URL}/api/v2/goods/?limit=1`);
  expect(resp.ok(), `goods failed: ${resp.status()}`).toBeTruthy();
  const body = await resp.json();
  const good = body?.results?.[0] ?? body?.[0];
  expect(good, 'каталог пуст — нечего класть в корзину').toBeTruthy();
  return good;
}

/** Корзина живёт в localStorage под ключом cart_products (cartSlice). */
export function cartItemFor(good: any) {
  return { ...good, orderQuantity: 1 };
}

export async function createOrder(request: APIRequestContext, token: string, data: Record<string, unknown>) {
  return request.post(`${API_URL}/api/v2/orders/`, {
    headers: auth(token),
    data: {
      name: 'E2E',
      last_name: 'Test',
      nova_post_address: 'Київ, відділення 1',
      prepayment: false,
      items: [],
      ...data,
    },
  });
}

/** Свежие реквизиты на каждый прогон — регистрация не должна упираться в прошлые. */
export function freshSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function freshEmail() {
  return `e2e+${freshSuffix()}@example.com`;
}

/** Девять цифр, начинающихся с 44 — вымышленный оператор, в CRM такого клиента нет. */
export function freshPhoneDigits() {
  return `44${String(Date.now()).slice(-7)}`;
}

export function freshTelegramUser(): TelegramUser {
  return {
    id: Number(`9${String(Date.now()).slice(-9)}`),
    first_name: 'E2E',
    last_name: 'Fresh',
    username: `e2e_fresh_${freshSuffix()}`,
    language_code: LOCALE,
  };
}
