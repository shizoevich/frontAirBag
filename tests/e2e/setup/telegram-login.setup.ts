/**
 * One-time setup: logs in to web.telegram.org and saves the browser session
 * so the link-consume test can interact with the real Telegram web client.
 *
 * Run once (headed) before the full suite:
 *   npx playwright test --project=chromium --headed tests/e2e/setup/telegram-login.setup.ts
 *
 * The resulting storageState is saved to tests/e2e/.telegram-session.json
 * and is read by tests that need a real Telegram session.
 *
 * Prerequisites: TELEGRAM_PHONE and TELEGRAM_CLOUD_PASSWORD in tests/e2e/.env
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SESSION_PATH = path.resolve(__dirname, '../.telegram-session.json');

setup('log in to web.telegram.org', async ({ page }) => {
  const phone = process.env.TELEGRAM_PHONE;
  if (!phone) {
    console.warn('TELEGRAM_PHONE not set — skipping Telegram session setup');
    return;
  }

  await page.goto('https://web.telegram.org/k/');

  // Click "Log in by phone number"
  await page.getByText(/log in by phone|войти по номеру/i).click();

  // Enter phone number
  await page.getByPlaceholder(/phone number|номер телефона/i).fill(phone);
  await page.keyboard.press('Enter');

  // Wait for code input
  await page.waitForSelector('input[type="text"], input[autocomplete="one-time-code"]', {
    timeout: 30_000,
  });

  // Pause so the tester can manually enter the SMS / app code
  // (Playwright has no API to intercept Telegram OTP automatically)
  console.log('⏸  Enter the Telegram login code in the browser window, then press Enter here…');
  await page.pause();

  // If a cloud password is configured, enter it
  const cloudPassword = process.env.TELEGRAM_CLOUD_PASSWORD;
  if (cloudPassword) {
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await passwordInput.fill(cloudPassword);
      await page.keyboard.press('Enter');
    }
  }

  // Wait until the main chat list is visible
  await expect(page.locator('.chatlist-top, .chats-container')).toBeVisible({ timeout: 30_000 });

  await page.context().storageState({ path: SESSION_PATH });
  console.log(`✅  Telegram session saved to ${SESSION_PATH}`);
});
