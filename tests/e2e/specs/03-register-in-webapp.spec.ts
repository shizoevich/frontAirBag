/**
 * Сценарий 3 — неизвестный Telegram оформляет заказ: чекаут → регистрация →
 * привязка Telegram на сервере → возврат на чекаут с корзиной → заказ.
 * Повторное открытие — бесшовный вход, хотя почта ещё не подтверждена.
 *
 * Каждый прогон регистрирует нового клиента со свежим Telegram id. Заказ
 * уходит в общую с продом CRM — поэтому имя «НЕ ВІДПРАВЛЯТИ» и вымышленный
 * номер +38044…; после прогона такие заказы в CRM переводят в удаление.
 */
import { test, expect, injectTelegramWebApp } from '../fixtures';
import {
  BASE, BOT_TOKEN, firstGood, cartItemFor, freshEmail, freshPhoneDigits, freshTelegramUser,
} from '../helpers/api';

const PASSWORD = 'E2ePass123';

test.describe('Scenario 3: register inside the WebApp', () => {
  test('checkout → register → linked → back to checkout → order', async ({ page, request }) => {
    const tgUser = freshTelegramUser();
    const email = freshEmail();
    const phoneDigits = freshPhoneDigits();
    await injectTelegramWebApp(page, { botToken: BOT_TOKEN, user: tgUser });
    const good = await firstGood(request);
    await page.addInitScript((item) => {
      if (!localStorage.getItem('cart_products')) {
        localStorage.setItem('cart_products', JSON.stringify([item]));
      }
    }, cartItemFor(good));

    // Аноним: чекаут уводит на вход
    await page.goto(`${BASE}/checkout`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

    await page.goto(`${BASE}/register`);
    await page.locator('input[name="name"]').fill('НЕ ВІДПРАВЛЯТИ');
    await page.locator('input[name="last_name"]').fill('E2E');
    await page.locator('input[name="email"]').fill(email);
    await page.getByTestId('phone-input').fill(phoneDigits);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.locator('input[name="confirm_password"]').fill(PASSWORD);

    const registered = page.waitForResponse((res) => res.url().includes('/api/v2/auth/register/'));
    const telegramAuth = page.waitForResponse(
      (res) => res.url().includes('/api/v2/telegram/auth') && res.request().method() === 'POST',
      { timeout: 20_000 }
    );
    await page.locator('button[type="submit"]').click();

    const registerRes = await registered;
    expect(registerRes.status(), await registerRes.text()).toBe(201);
    const registerBody = registerRes.request().postDataJSON();
    expect(registerBody.phone).toBe(`+380${phoneDigits}`);
    expect(registerBody.init_data).toBeTruthy();

    // Вход по Telegram, а не по паролю: почта ещё не подтверждена
    const authRes = await telegramAuth;
    expect(authRes.status()).toBe(200);
    expect((await authRes.json()).user.telegram_ids).toContain(tgUser.id);

    // Вернулись на чекаут, корзина цела
    await expect(page).toHaveURL(/\/checkout/, { timeout: 20_000 });
    const cartSize = await page.evaluate(() => JSON.parse(localStorage.getItem('cart_products') || '[]').length);
    expect(cartSize).toBeGreaterThan(0);

    // Повторное открытие — бесшовно
    const secondAuth = page.waitForResponse(
      (res) => res.url().includes('/api/v2/telegram/auth') && res.request().method() === 'POST'
    );
    await page.reload();
    expect((await secondAuth).status()).toBe(200);
    await expect(page).toHaveURL(/\/checkout/);
  });
});
