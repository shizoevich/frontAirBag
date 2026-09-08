/**
 * Сценарий 9 — телефон в заказе: чужой номер — отказ с понятным текстом,
 * свободный — просто контакт получателя, телефон аккаунта не меняется.
 *
 * Чужой номер берётся у SITE_LINKED_EMAIL, заказ делает SITE_TEST_EMAIL.
 * Заказы уходят в общую с продом CRM: имя «НЕ ВІДПРАВЛЯТИ», номер +38044….
 */
import { test, expect } from '@playwright/test';
import { BASE, apiLogin, apiMe, createOrder, firstGood, cartItemFor, freshPhoneDigits } from '../helpers/api';

const EMAIL = process.env.SITE_TEST_EMAIL ?? '';
const PASSWORD = process.env.SITE_TEST_PASSWORD ?? '';
const LINKED_EMAIL = process.env.SITE_LINKED_EMAIL ?? '';
const LINKED_PASSWORD = process.env.SITE_LINKED_PASSWORD ?? '';

test.describe('Scenario 9: order phone rule', () => {
  test.skip(!EMAIL || !PASSWORD || !LINKED_EMAIL || !LINKED_PASSWORD, 'test accounts not configured');

  let token: string;
  let foreignPhone: string;

  test.beforeAll(async ({ request }) => {
    token = await apiLogin(request, EMAIL, PASSWORD);
    const linkedToken = await apiLogin(request, LINKED_EMAIL, LINKED_PASSWORD);
    foreignPhone = (await apiMe(request, linkedToken)).phone;
    expect(foreignPhone, 'у SITE_LINKED_EMAIL должен быть телефон').toMatch(/^\+380\d{9}$/);
  });

  test('API: a phone of another account is refused with a code', async ({ request }) => {
    const resp = await createOrder(request, token, { name: 'НЕ ВІДПРАВЛЯТИ', phone: foreignPhone });

    expect(resp.status()).toBe(400);
    const body = await resp.json();
    expect([].concat(body.phone)).toContain('phone_belongs_to_other_account');
  });

  test('API: a free phone is accepted and does not replace the account phone', async ({ request }) => {
    const before = (await apiMe(request, token)).phone;
    const phone = `+380${freshPhoneDigits()}`;

    const resp = await createOrder(request, token, { name: 'НЕ ВІДПРАВЛЯТИ', phone });

    expect(resp.status(), await resp.text()).toBe(201);
    const after = (await apiMe(request, token)).phone;
    // Аккаунт без телефона забирает номер себе; с телефоном — остаётся при своём
    expect(after).toBe(before ?? phone);
  });

  test('UI: checkout shows the explanation', async ({ page, request }) => {
    const good = await firstGood(request);
    await page.addInitScript((item) => {
      localStorage.setItem('cart_products', JSON.stringify([item]));
    }, cartItemFor(good));

    await page.goto(`${BASE}/login`);
    await page.locator('input[name="email"]').fill(EMAIL);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in|войти|увійти|login/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });

    await page.goto(`${BASE}/checkout`);
    await page.locator('input[name="firstName"]').fill('НЕ ВІДПРАВЛЯТИ');
    await page.locator('input[name="lastName"]').fill('E2E');
    await page.getByTestId('phone-input').fill(foreignPhone.slice(4));
      await page.locator('label[for="cash_on_delivery"]').click();
    // Скрытые поля адреса заполняет выпадашка Новой Почты через setValue; React
    // на input[type=hidden] onChange не шлёт, поэтому дёргаем обработчик RHF напрямую.
    for (const [name, value] of [['city', 'Київ'], ['warehouse', 'Відділення №1']]) {
      await page.locator(`input[name="${name}"]`).evaluate((el: any, v) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v);
        const propsKey = Object.keys(el).find((k) => k.startsWith('__reactProps'));
        if (propsKey && typeof el[propsKey].onChange === 'function') {
          el[propsKey].onChange({ target: el, type: 'change' });
        }
      }, value);
    }

    const refused = page.waitForResponse(
      (res) => res.url().includes('/api/v2/orders/') && res.request().method() === 'POST'
    );
    await page.locator('button.tp-checkout-btn[type="submit"]').click();
    expect((await refused).status()).toBe(400);

    await expect(
      page.getByText(/іншого акаунта|другому аккаунту|another account/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
