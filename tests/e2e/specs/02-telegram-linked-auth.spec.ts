/**
 * Сценарий 2 — Telegram привязан к аккаунту: вход бесшовный.
 *
 * Один аккаунт — много Telegram (ADR-0021): второй привязанный Telegram
 * открывает тот же аккаунт. Гостевого флага в ответе больше нет.
 *
 * Требуется: TELEGRAM_LINKED_USER_ID привязан к SITE_LINKED_EMAIL;
 * TELEGRAM_SECOND_USER_ID свободен или уже за тем же аккаунтом.
 */
import { test, expect, linkedTelegramUser, secondTelegramUser } from '../fixtures';
import { BASE, apiLogin, ensureTelegramLinked } from '../helpers/api';

const LINKED_EMAIL = process.env.SITE_LINKED_EMAIL ?? '';
const LINKED_PASSWORD = process.env.SITE_LINKED_PASSWORD ?? '';

test.describe('Scenario 2: seamless login for a linked Telegram', () => {
  test('backend returns tokens and the account with its telegram_ids', async ({ linkedTelegramPage: page }) => {
    const authResponse = page.waitForResponse(
      (res) => res.url().includes('/api/v2/telegram/auth') && res.request().method() === 'POST'
    );

    await page.goto(BASE);

    const res = await authResponse;
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.access).toBeTruthy();
    expect(body.user.telegram_ids).toContain(linkedTelegramUser.id);
    expect(body.user.is_guest).toBeUndefined();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('profile shows the linked account', async ({ linkedTelegramPage: page }) => {
    await page.goto(`${BASE}/profile`);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
    if (LINKED_EMAIL) {
      await expect(page.getByText(LINKED_EMAIL).first()).toBeVisible({ timeout: 15_000 });
    }
  });

  test.describe('second Telegram of the same account', () => {
    test.skip(!LINKED_EMAIL || !LINKED_PASSWORD, 'SITE_LINKED_EMAIL / SITE_LINKED_PASSWORD not configured');

    test.beforeAll(async ({ request }) => {
      const token = await apiLogin(request, LINKED_EMAIL, LINKED_PASSWORD);
      await ensureTelegramLinked(request, token, secondTelegramUser);
    });

    test('opens the same account', async ({ secondTelegramPage: page }) => {
      const authResponse = page.waitForResponse(
        (res) => res.url().includes('/api/v2/telegram/auth') && res.request().method() === 'POST'
      );

      await page.goto(BASE);

      const body = await (await authResponse).json();
      expect(body.user.email).toBe(LINKED_EMAIL);
      expect(body.user.telegram_ids).toEqual(
        expect.arrayContaining([linkedTelegramUser.id, secondTelegramUser.id])
      );
    });
  });
});
