/**
 * Scenario 4 — Regular browser (no Telegram WebApp) email/password login.
 *
 * Expected behaviour:
 * - No Telegram initData available → no guest session created
 * - User logs in normally; redirected to home/profile after success
 * - isGuest is false; no auto-link request fires (no initData)
 * - Profile accessible; no Telegram badge shown (account has none linked)
 */
import { test, expect } from '@playwright/test';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const LOCALE = process.env.LOCALE ?? 'ru';
const BASE = `${SITE_URL}/${LOCALE}`;
const EMAIL = process.env.SITE_TEST_EMAIL ?? '';
const PASSWORD = process.env.SITE_TEST_PASSWORD ?? '';

test.describe('Scenario 4: Regular email/password login (no Telegram)', () => {
  test.skip(!EMAIL || !PASSWORD, 'SITE_TEST_EMAIL / SITE_TEST_PASSWORD not configured');

  test('should log in and redirect away from /login', async ({ page }) => {
    await page.goto(`${BASE}/login`);

    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|пароль/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in|войти|увійти|login/i }).click();

    await page.waitForTimeout(2_500);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should NOT fire telegram/auth request (no initData)', async ({ page }) => {
    const telegramRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/v2/telegram/')) {
        telegramRequests.push(req.url());
      }
    });

    await page.goto(BASE);
    await page.waitForTimeout(2_000);

    expect(telegramRequests.filter((u) => u.includes('/telegram/auth'))).toHaveLength(0);
  });

  test('should NOT fire auto-link after regular login', async ({ page }) => {
    const autoLinkRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/v2/telegram/auto-link')) {
        autoLinkRequests.push(req.url());
      }
    });

    await page.goto(`${BASE}/login`);
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|пароль/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in|войти|увійти|login/i }).click();

    await page.waitForTimeout(3_000);
    expect(autoLinkRequests).toHaveLength(0);
  });

  test('profile is accessible after regular login', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|пароль/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in|войти|увійти|login/i }).click();
    await page.waitForTimeout(2_500);

    await page.goto(`${BASE}/profile`);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 });
  });
});
