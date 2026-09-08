/**
 * Сценарий 7 — сессия истекла посреди чекаута в мини-аппе (инцидент Сидоренко,
 * 05.09.2026): раньше — разлогин, гость, 403 на заказе, четыре круга.
 *
 * Теперь: POST /orders/ 401 → refresh отвергнут → POST /telegram/auth 200 →
 * заказ повторён и создан. Ни одного /auth/guest/. Хранилища портятся через
 * page.evaluate без перезагрузки — как и бывает у клиента.
 *
 * Заказ уходит в общую с продом CRM: имя «НЕ ВІДПРАВЛЯТИ», номер +38044….
 */
import { test, expect } from '../fixtures';
import { BASE, firstGood, cartItemFor, freshPhoneDigits } from '../helpers/api';

async function fillCheckout(page, phoneDigits: string) {
  await page.locator('input[name="firstName"]').fill('НЕ ВІДПРАВЛЯТИ');
  await page.locator('input[name="lastName"]').fill('E2E');
  await page.getByTestId('phone-input').fill(phoneDigits);
  await page.locator('label[for="cash_on_delivery"]').click();
  // Скрытые поля адреса заполняет выпадашка Новой Почты — внешний API в E2E не дёргаем
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
}

test.describe('Scenario 7: expired session inside the WebApp', () => {
  test('order survives an expired session via Telegram re-auth', async ({ linkedTelegramPage: page, request }) => {
    const good = await firstGood(request);
    await page.addInitScript((item) => {
      localStorage.setItem('cart_products', JSON.stringify([item]));
    }, cartItemFor(good));
    const guestCalls: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/guest')) guestCalls.push(req.url());
    });

    await page.goto(`${BASE}/checkout`);
    await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 20_000 });

    // Сессия умирает: оба хранилища держат мёртвые токены, страница не перезагружается
    await page.evaluate(() => {
      const raw = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const dead = { ...raw, accessToken: 'expired.access.token', refreshToken: 'dead.refresh.token' };
      localStorage.setItem('userInfo', JSON.stringify(dead));
      document.cookie = `userInfo=${encodeURIComponent(JSON.stringify(dead))}; path=/`;
    });

    await fillCheckout(page, freshPhoneDigits());

    const reauth = page.waitForResponse(
      (res) => res.url().includes('/api/v2/telegram/auth') && res.request().method() === 'POST',
      { timeout: 30_000 }
    );
    const created = page.waitForResponse(
      (res) => res.url().includes('/api/v2/orders/') && res.request().method() === 'POST' && res.status() === 201,
      { timeout: 30_000 }
    );
    await page.locator('button.tp-checkout-btn[type="submit"]').click();

    expect((await reauth).status()).toBe(200);
    const orderRes = await created;
    expect(orderRes.request().postDataJSON().init_data).toBeTruthy();
    expect(guestCalls).toHaveLength(0);
    await expect(page).toHaveURL(/order-success/, { timeout: 20_000 });
  });
});
