/**
 * Сценарий 1 — мини-апп открыт Telegram-аккаунтом, которого нет в системе.
 *
 * Гостей больше нет (ADR-0021): бэкенд отвечает 404 telegram_unknown, сайт
 * остаётся анонимным — каталог и корзина открыты, страница не заперта
 * лоадером, кабинет и чекаут уводят на вход. Запроса /auth/guest/ в сети нет.
 */
import { test, expect } from '../fixtures';
import { BASE } from '../helpers/api';

test.describe('Scenario 1: unknown Telegram browses as anonymous', () => {
  test('backend answers 404, the page renders, no guest is created', async ({ unknownTelegramPage: page }) => {
    const guestCalls: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/guest')) guestCalls.push(req.url());
    });
    const authResponse = page.waitForResponse(
      (res) => res.url().includes('/api/v2/telegram/auth') && res.request().method() === 'POST'
    );

    await page.goto(BASE);

    const res = await authResponse;
    expect(res.status()).toBe(404);
    expect((await res.json()).code).toBe('telegram_unknown');

    // Лоадер снят, страница живая
    await expect(page.locator('#wrapper')).toBeVisible({ timeout: 10_000 });
    await expect(page).not.toHaveURL(/\/login/);
    expect(guestCalls).toHaveLength(0);
  });

  test('header offers to sign in', async ({ unknownTelegramPage: page }) => {
    await page.goto(BASE);
    await expect(page.locator('#wrapper')).toBeVisible({ timeout: 10_000 });

    const loginLink = page.getByRole('link', { name: /sign in|войти|увійти/i }).first();
    await expect(loginLink).toBeVisible({ timeout: 10_000 });
  });

  test('cabinet and checkout redirect to login', async ({ unknownTelegramPage: page }) => {
    await page.goto(`${BASE}/cabinet`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

    await page.goto(`${BASE}/checkout`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
