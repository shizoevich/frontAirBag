/**
 * Сценарий 12 — оплата картой из мини-аппа (ADR-0022).
 *
 * Внутри WebView Telegram Apple Pay и Google Pay не работают, поэтому в
 * мини-аппе: нет нашей кнопки Google Pay, страница Monobank открывается
 * через Telegram.WebApp.openLink, в инвойс уходит возврат в бота
 * t.me/<бот>?start=order_<id>, а на месте iframe — экран ожидания с опросом.
 *
 * Инвойс Monobank создаётся в тестовом режиме; заказ уходит в общую CRM —
 * имя «НЕ ВІДПРАВЛЯТИ», номер +38044….
 */
import { test, expect } from '../fixtures';
import { BASE, firstGood, cartItemFor, freshPhoneDigits } from '../helpers/api';

const BOT = process.env.TELEGRAM_BOT_USERNAME ?? '';

test.describe('Scenario 12: card payment from the WebApp', () => {
  test('mono button opens the payment page outside and waits', async ({ linkedTelegramPage: page, request }) => {
    test.setTimeout(90_000);
    const good = await firstGood(request);
    await page.addInitScript((item) => {
      localStorage.setItem('cart_products', JSON.stringify([item]));
    }, cartItemFor(good));

    await page.goto(`${BASE}/checkout`);
    await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 20_000 });
    await page.locator('input[name="firstName"]').fill('НЕ ВІДПРАВЛЯТИ');
    await page.locator('input[name="lastName"]').fill('E2E');
    await page.getByTestId('phone-input').fill(freshPhoneDigits());
    for (const [name, value] of [['city', 'Київ'], ['warehouse', 'Відділення №1']]) {
      await page.locator(`input[name="${name}"]`).evaluate((el: any, v) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v);
        const propsKey = Object.keys(el).find((k) => k.startsWith('__reactProps'));
        if (propsKey && typeof el[propsKey].onChange === 'function') el[propsKey].onChange({ target: el, type: 'change' });
      }, value);
    }
    await page.locator('label[for="pay_now"]').click();

    // Нашей кнопки Google Pay в мини-аппе нет
    await expect(page.locator('#gpay-button-online-api-id, [aria-label*="Google Pay"], .gpay-button')).toHaveCount(0);

    const created = page.waitForResponse(
      (res) => res.url().includes('/api/v2/payments/create/') && res.request().method() === 'POST',
      { timeout: 45_000 }
    );
    await page.locator('button.monopay-btn').click();
    const res = await created;
    expect(res.status(), await res.text()).toBe(201);
    const body = res.request().postDataJSON();
    expect(body.redirect_url).toMatch(new RegExp(`^https://t\\.me/${BOT}\\?start=order_\\d+$`));
    expect(body.success_url).toBe(body.redirect_url);
    expect(body.fail_url).toBe(body.redirect_url);

    // Экран ожидания вместо iframe, страница Monobank ушла наружу
    await expect(page.getByTestId('payment-waiting')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('iframe[title="payment"]')).toHaveCount(0);
    const opened = await page.evaluate(() => (window as any).__telegramOpenedLinks || []);
    expect(opened.length).toBe(1);
    expect(opened[0]).toMatch(/monobank|mbnk/);
  });
});
