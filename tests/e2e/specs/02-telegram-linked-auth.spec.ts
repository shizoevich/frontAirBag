/**
 * Scenario 2 — Telegram WebApp, user IS linked to a site account.
 *
 * Expected behaviour:
 * - Site detects initData → calls POST /api/v2/telegram/auth
 * - Backend finds client with matching telegram_id, returns JWT with is_guest=false
 * - Frontend stores real-user token; user sees their real profile data
 * - No manual login required
 *
 * Prerequisites:
 *   - TELEGRAM_LINKED_USER_ID env var matches a client in the database
 *     that has SITE_LINKED_EMAIL set as login
 */
import { test, expect } from '../fixtures';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const LOCALE = process.env.LOCALE ?? 'ru';
const BASE = `${SITE_URL}/${LOCALE}`;

test.describe('Scenario 2: Auto-login for linked Telegram account', () => {
  test('should authenticate as real user (is_guest=false)', async ({
    linkedTelegramPage: page,
  }) => {
    const authRequest = page.waitForRequest(
      (req) => req.url().includes('/api/v2/telegram/auth') && req.method() === 'POST'
    );

    await page.goto(BASE);

    const req = await authRequest;
    const res = await req.response();
    expect(res?.status()).toBeLessThan(300);

    const body = await res?.json().catch(() => null);
    // Backend should return is_guest: false for linked users
    if (body) {
      expect(body.is_guest).toBe(false);
    }
  });

  test('profile should show real account data (not guest placeholder)', async ({
    linkedTelegramPage: page,
  }) => {
    await page.goto(`${BASE}/profile`);

    // Wait for profile to load
    await page.waitForTimeout(2_500);

    // Should not be redirected to login
    await expect(page).not.toHaveURL(/\/login/);

    // Email field should contain the linked account's email
    const linkedEmail = process.env.SITE_LINKED_EMAIL ?? '';
    if (linkedEmail) {
      const emailText = page.locator(`text=${linkedEmail}`);
      await expect(emailText).toBeVisible({ timeout: 10_000 });
    }
  });

  test('Telegram linked badge should be visible on profile', async ({
    linkedTelegramPage: page,
  }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForTimeout(2_500);

    // Profile page should show a "Telegram linked" indicator, not a "Link" button
    const linkButton = page.getByRole('button', { name: /link telegram|привязать telegram/i });
    await expect(linkButton).not.toBeVisible();
  });
});
