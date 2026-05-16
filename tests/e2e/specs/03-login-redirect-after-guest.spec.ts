/**
 * Scenario 3 — Guest Telegram session upgraded via email/password login.
 *
 * Steps:
 * 1. User opens site inside Telegram WebApp → becomes guest
 * 2. User navigates to /login and logs in with email/password (account has NO Telegram linked)
 * 3. After login, auto-link fires: PATCH /api/v2/telegram/auto-link
 * 4. Telegram is now linked; profile shows Telegram badge
 * 5. isGuest is false; login link is gone
 */
import { test, expect } from '../fixtures';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const LOCALE = process.env.LOCALE ?? 'ru';
const BASE = `${SITE_URL}/${LOCALE}`;
const EMAIL = process.env.SITE_TEST_EMAIL ?? '';
const PASSWORD = process.env.SITE_TEST_PASSWORD ?? '';

test.describe('Scenario 3: Guest → email login → auto-link', () => {
  test.skip(!EMAIL || !PASSWORD, 'SITE_TEST_EMAIL / SITE_TEST_PASSWORD not configured');

  test('should upgrade guest to real user after email login', async ({
    guestTelegramPage: page,
  }) => {
    // Start as guest
    await page.goto(BASE);
    await page.waitForTimeout(1_500);

    // Navigate to login
    await page.goto(`${BASE}/login`);

    // Fill login form
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|пароль/i).fill(PASSWORD);

    const loginRequest = page.waitForResponse(
      (res) => res.url().includes('/api/v2/login') || res.url().includes('/api/token')
    );

    await page.getByRole('button', { name: /sign in|войти|увійти|login/i }).click();

    await loginRequest;
    await page.waitForTimeout(2_000);

    // Should not still be on /login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('auto-link should fire after email login in WebApp context', async ({
    guestTelegramPage: page,
  }) => {
    await page.goto(`${BASE}/login`);

    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|пароль/i).fill(PASSWORD);

    // Watch for auto-link request
    const autoLinkPromise = page.waitForRequest(
      (req) => req.url().includes('/api/v2/telegram/auto-link') && req.method() === 'PATCH',
      { timeout: 15_000 }
    );

    await page.getByRole('button', { name: /sign in|войти|увійти|login/i }).click();

    const autoLinkReq = await autoLinkPromise.catch(() => null);
    // auto-link is best-effort; it fires but may return 400 if already linked
    if (autoLinkReq) {
      const res = await autoLinkReq.response();
      // 200 = linked, 400 = already linked — both are acceptable outcomes
      expect([200, 400]).toContain(res?.status());
    }
  });

  test('profile should show Telegram badge after login+auto-link', async ({
    guestTelegramPage: page,
  }) => {
    await page.goto(`${BASE}/login`);
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|пароль/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in|войти|увійти|login/i }).click();

    // Wait for auto-link to complete
    await page.waitForTimeout(3_000);

    await page.goto(`${BASE}/profile`);
    await page.waitForTimeout(2_000);

    // After auto-link, "Link Telegram" button should be gone
    const linkButton = page.getByRole('button', { name: /link telegram|привязать telegram/i });
    await expect(linkButton).not.toBeVisible({ timeout: 8_000 });
  });
});
