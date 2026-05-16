/**
 * Scenario 1 — Telegram WebApp, user NOT linked to any site account.
 *
 * Expected behaviour:
 * - Site detects initData → calls POST /api/v2/telegram/auth
 * - Backend creates a guest client and returns JWT with is_guest=true
 * - Frontend stores the token; user is considered logged-in as guest
 * - Cart / wishlist work (no redirect to login page)
 * - Header shows user icon (not a "login" link)
 */
import { test, expect } from '../fixtures';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const LOCALE = process.env.LOCALE ?? 'ru';
const BASE = `${SITE_URL}/${LOCALE}`;

test.describe('Scenario 1: Telegram guest auth', () => {
  test('should authenticate as guest when opening the site in Telegram WebApp', async ({
    guestTelegramPage: page,
  }) => {
    // Intercept the telegram/auth call so we can assert it was made
    const authRequest = page.waitForRequest(
      (req) => req.url().includes('/api/v2/telegram/auth') && req.method() === 'POST'
    );

    await page.goto(BASE);

    const req = await authRequest;
    expect(req).toBeTruthy();

    // Wait for the auth response — should be 200/201
    const authResponse = await req.response();
    expect(authResponse?.status()).toBeLessThan(300);

    // The site should NOT redirect to /login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should show authenticated header state (no login link visible)', async ({
    guestTelegramPage: page,
  }) => {
    await page.goto(BASE);

    // Give React time to restore the session
    await page.waitForTimeout(2_000);

    // The "Sign In" / "Войти" link should not be visible once logged in as guest
    const loginLink = page.getByRole('link', { name: /sign in|войти|увійти/i });
    await expect(loginLink).not.toBeVisible();
  });

  test('profile page should be reachable as guest', async ({ guestTelegramPage: page }) => {
    await page.goto(`${BASE}/profile`);
    // Should not bounce to login
    await expect(page).not.toHaveURL(/\/login/);
    // Some user-specific element should appear
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 });
  });
});
