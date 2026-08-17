/**
 * Scenario 6 — Скасування замовлення в кабінеті.
 *
 * Матриця прав (джерело — backend/core/services/order_cancel.py):
 *  - не оплачене, без ТТН  → клієнт скасовує сам
 *  - оплачене, без ТТН     → лише запит, підтверджує адмін
 *  - є ТТН                 → клієнту недоступно
 *  - завершене             → недоступно нікому
 *
 * Замовлення сідаються через API перед кожним тестом — покладатись на те, що
 * лишилось у базі від попередніх прогонів, не можна.
 *
 * Потрібні змінні (tests/e2e/.env): SITE_URL, LOCALE, SITE_TEST_EMAIL,
 * SITE_TEST_PASSWORD, API_URL. Без них спека скіпається.
 */
import { test, expect, APIRequestContext } from '@playwright/test';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const LOCALE = process.env.LOCALE ?? 'uk';
const BASE = `${SITE_URL}/${LOCALE}`;
const API_URL = process.env.API_URL ?? 'http://localhost:8000';
const EMAIL = process.env.SITE_TEST_EMAIL ?? '';
const PASSWORD = process.env.SITE_TEST_PASSWORD ?? '';

type OrderState = {
  description: string;
  prepayment?: boolean;
  is_paid?: boolean;
  is_completed?: boolean;
  ttn?: string;
};

async function apiLogin(request: APIRequestContext): Promise<string> {
  const resp = await request.post(`${API_URL}/api/v2/auth/login/`, {
    data: { email: EMAIL, password: PASSWORD },
  });
  expect(resp.ok(), `login failed: ${resp.status()}`).toBeTruthy();
  return (await resp.json()).access;
}

/**
 * Створює замовлення й доводить його до потрібного стану.
 * is_paid/ttn/is_completed виставляються PATCH-ем — звичайним шляхом їх ставить
 * вебхук Monobank або адмін, що в E2E недосяжно.
 */
async function seedOrder(
  request: APIRequestContext,
  token: string,
  state: OrderState,
): Promise<number> {
  const headers = { Authorization: `Bearer ${token}` };

  const created = await request.post(`${API_URL}/api/v2/orders/`, {
    headers,
    data: {
      name: 'E2E',
      last_name: 'Cancel',
      phone: '+380991110001',
      nova_post_address: 'Київ, відділення 1',
      description: state.description,
      prepayment: state.prepayment ?? true,
      items: [],
    },
  });
  expect(created.ok(), `order create failed: ${created.status()} ${await created.text()}`)
    .toBeTruthy();
  const orderId = (await created.json()).id;

  const patch: Record<string, unknown> = {};
  if (state.is_paid) patch.is_paid = true;
  if (state.ttn) patch.ttn = state.ttn;
  if (state.is_completed) patch.is_completed = true;
  if (Object.keys(patch).length) {
    const updated = await request.patch(`${API_URL}/api/v2/orders/${orderId}/`, {
      headers,
      data: patch,
    });
    expect(updated.ok(), `order patch failed: ${updated.status()}`).toBeTruthy();
  }

  return orderId;
}

async function loginViaUi(page) {
  await page.goto(`${BASE}/login`);
  await page.getByRole('textbox', { name: /email|пошт|почт/i }).fill(EMAIL);
  await page.getByRole('textbox', { name: /password|пароль/i }).fill(PASSWORD);
  await page.getByRole('button', { name: /sign in|войти|увійти|login/i }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
}

/** Відкриває картку конкретного замовлення в списку. */
async function openOrder(page, orderId: number) {
  await page.goto(`${BASE}/orders`);
  const row = page.locator(`tr:has(td:text-is("#${orderId}"))`);
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.getByRole('button').click();
}

function rowStatus(page, orderId: number) {
  return page.locator(`tr:has(td:text-is("#${orderId}")) .badge`);
}

test.describe('Scenario 6: order cancellation', () => {
  test.skip(!EMAIL || !PASSWORD, 'SITE_TEST_EMAIL / SITE_TEST_PASSWORD not configured');

  let token: string;

  test.beforeEach(async ({ request, page }) => {
    token = await apiLogin(request);
    await loginViaUi(page);
  });

  test('unpaid order can be cancelled by the client', async ({ page, request }) => {
    const orderId = await seedOrder(request, token, { description: 'E2E unpaid' });

    await openOrder(page, orderId);
    await page.getByRole('button', { name: /скасувати замовлення|отменить заказ|cancel order/i })
      .click();

    // Причина обовʼязкова — модалка не має скасовувати з першого кліку
    const dialog = page.locator('form.p-3');
    await expect(dialog).toBeVisible();
    await dialog.locator('select').selectOption('found_cheaper');
    await dialog.locator('textarea').fill('E2E');
    await dialog.locator('button[type="submit"]').click();

    await expect(rowStatus(page, orderId)).toHaveText(/скасовано|отменён|canceled/i, {
      timeout: 15_000,
    });
  });

  test('paid order offers a cancellation request, not a direct cancel', async ({ page, request }) => {
    const orderId = await seedOrder(request, token, { description: 'E2E paid', is_paid: true });

    await openOrder(page, orderId);
    await expect(
      page.getByRole('button', { name: /запит на скасування|запрос на отмену|request cancel/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^\s*(скасувати замовлення|отменить заказ|cancel order)/i }),
    ).toHaveCount(0);
  });

  test('cancellation request moves the order to pending state', async ({ page, request }) => {
    const orderId = await seedOrder(request, token, { description: 'E2E request', is_paid: true });

    await openOrder(page, orderId);
    await page.getByRole('button', { name: /запит на скасування|запрос на отмену|request cancel/i })
      .click();
    await page.locator('form.p-3 button[type="submit"]').click();

    await expect(rowStatus(page, orderId)).toHaveText(
      /очікує скасування|ожидает отмены|cancellation pending/i,
      { timeout: 15_000 },
    );

    // Повторний запит неможливий — кнопки більше немає
    await openOrder(page, orderId);
    await expect(
      page.getByRole('button', { name: /запит на скасування|запрос на отмену|request cancel/i }),
    ).toHaveCount(0);
  });

  test('shipped order cannot be cancelled by the client', async ({ page, request }) => {
    const orderId = await seedOrder(request, token, {
      description: 'E2E shipped', is_paid: true, ttn: '59000123456789',
    });

    await openOrder(page, orderId);

    await expect(page.locator('form.p-3')).toHaveCount(0);
    await expect(
      page.getByText(/вже відправлено|уже отправлен|already been shipped/i),
    ).toBeVisible();
  });

  test('completed order cannot be cancelled', async ({ page, request }) => {
    const orderId = await seedOrder(request, token, {
      description: 'E2E completed', is_paid: true, is_completed: true,
    });

    await openOrder(page, orderId);

    await expect(page.getByText(/вже виконано|уже выполнен|already completed/i)).toBeVisible();
  });

  test('status filter separates cancelled orders from active ones', async ({ page, request }) => {
    const cancelled = await seedOrder(request, token, { description: 'E2E filter cancelled' });
    const active = await seedOrder(request, token, { description: 'E2E filter active' });

    await request.post(`${API_URL}/api/v2/orders/${cancelled}/cancel/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { reason: 'changed_mind' },
    });

    await page.goto(`${BASE}/orders`);
    const statusFilter = page.locator('select.form-select-sm').first();

    await statusFilter.selectOption('canceled');
    await expect(page.locator(`tr:has(td:text-is("#${cancelled}"))`)).toBeVisible();
    await expect(page.locator(`tr:has(td:text-is("#${active}"))`)).toHaveCount(0);

    // Регрес: скасоване замовлення не має лишатись у «В обробці»
    await statusFilter.selectOption('pending');
    await expect(page.locator(`tr:has(td:text-is("#${active}"))`)).toBeVisible();
    await expect(page.locator(`tr:has(td:text-is("#${cancelled}"))`)).toHaveCount(0);
  });
});
