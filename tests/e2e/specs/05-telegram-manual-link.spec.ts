/**
 * Scenario 5 — Manual Telegram linking via "Link Telegram" button on profile.
 *
 * Steps:
 * 1. Log in with email/password in a regular browser (no WebApp)
 * 2. Navigate to /profile
 * 3. Click "Link Telegram" button
 * 4. Backend returns a t.me link with a one-time code
 * 5. The frontend opens the link (or shows it in a toast/modal)
 * 6. Test verifies the link format and that the UI updates
 *
 * Note: actually consuming the code via the bot requires a real Telegram session
 * (see setup/telegram-login.setup.ts). This spec only verifies the frontend flow
 * up to the point where the link is generated.
 */
import { test, expect } from '@playwright/test';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const LOCALE = process.env.LOCALE ?? 'ru';
const BASE = `${SITE_URL}/${LOCALE}`;
const EMAIL = process.env.SITE_TEST_EMAIL ?? '';
const PASSWORD = process.env.SITE_TEST_PASSWORD ?? '';
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME ?? '';

test.describe('Scenario 5: Manual Telegram link via profile button', () => {
  test.skip(!EMAIL || !PASSWORD, 'SITE_TEST_EMAIL / SITE_TEST_PASSWORD not configured');

  test.beforeEach(async ({ page }) => {
    // Log in first (regular browser, no WebApp)
    await page.goto(`${BASE}/login`);
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password|пароль/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in|войти|увійти|login/i }).click();
    await page.waitForTimeout(2_500);
  });

  test('profile page should have a "Link Telegram" button', async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForTimeout(2_000);

    const linkButton = page.getByRole('button', {
      name: /link telegram|привязать telegram|прив'язати telegram/i,
    });
    await expect(linkButton).toBeVisible({ timeout: 10_000 });
  });

  test('clicking "Link Telegram" should call POST /api/v2/telegram/link', async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForTimeout(2_000);

    const linkRequest = page.waitForRequest(
      (req) =>
        req.url().includes('/api/v2/telegram/link') &&
        !req.url().includes('consume') &&
        !req.url().includes('auto') &&
        req.method() === 'POST',
      { timeout: 15_000 }
    );

    const linkButton = page.getByRole('button', {
      name: /link telegram|привязать telegram|прив'язати telegram/i,
    });
    await linkButton.click();

    const req = await linkRequest;
    const res = await req.response();
    expect(res?.status()).toBeLessThan(300);
  });

  test('link response should contain a valid t.me URL', async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForTimeout(2_000);

    const linkResponse = page.waitForResponse(
      (res) =>
        res.url().includes('/api/v2/telegram/link') &&
        !res.url().includes('consume') &&
        !res.url().includes('auto'),
      { timeout: 15_000 }
    );

    const linkButton = page.getByRole('button', {
      name: /link telegram|привязать telegram|прив'язати telegram/i,
    });
    await linkButton.click();

    const res = await linkResponse;
    const body = await res.json().catch(() => null);

    expect(body).not.toBeNull();
    expect(body.link).toMatch(/^https:\/\/t\.me\//);

    if (BOT_USERNAME) {
      expect(body.link).toContain(BOT_USERNAME);
    }

    // Code must be embedded as ?start=link_<code>
    expect(body.link).toMatch(/\?start=link_/);
  });

  test('profile page should be accessible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/profile`);
    await page.waitForTimeout(1_500);

    // Should not redirect to login on mobile
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10_000 });
  });

  test('mobile hamburger menu should contain a "My Profile" link', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE);
    await page.waitForTimeout(1_500);

    // Open the hamburger menu
    const hamburger = page.locator(
      'button.side-menu-btn, button[data-testid="hamburger"], .mobile-offcanvas .sidebar-toggle, .hamburger-btn'
    );
    if (await hamburger.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await hamburger.click();
      await page.waitForTimeout(500);
    }

    // Profile link should now be reachable in the nav
    const profileLink = page.getByRole('link', { name: /my profile|мой профиль|мій профіль/i });
    await expect(profileLink).toBeVisible({ timeout: 8_000 });
  });
});
