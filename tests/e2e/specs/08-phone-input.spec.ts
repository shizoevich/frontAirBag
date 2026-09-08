/**
 * Сценарий 8 — поле телефона везде одно: префикс +380 не стирается, буквы и
 * пробелы не вводятся, десятая цифра не принимается, на бэкенд уходит
 * +380XXXXXXXXX (в спеке 03 это проверено по телу запроса регистрации).
 */
import { test, expect, Page } from '../fixtures';
import { BASE } from '../helpers/api';

async function checkPhoneField(page: Page) {
  const input = page.getByTestId('phone-input').first();
  await expect(input).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.phone-input__prefix').first()).toHaveText('+380');

  await input.fill('abc 050 1234567');
  await expect(input).toHaveValue('501234567');

  await input.fill('5012345678');
  await expect(input).toHaveValue('501234567');

  await input.fill('');
  await input.pressSequentially('a b-5c0!1');
  await expect(input).toHaveValue('501');

  // Вставка полного номера в любом написании
  await input.fill('+38 (050) 123-45-67');
  await expect(input).toHaveValue('501234567');
}

test.describe('Scenario 8: phone input', () => {
  test('registration form', async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await checkPhoneField(page);
  });

  test('checkout form', async ({ linkedTelegramPage: page }) => {
    await page.goto(`${BASE}/checkout`);
    await checkPhoneField(page);
  });

  test('registration refuses a short number before sending', async ({ page }) => {
    const calls: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/register/')) calls.push(req.url());
    });
    await page.goto(`${BASE}/register`);
    await page.locator('input[name="email"]').fill('short@example.com');
    await page.getByTestId('phone-input').fill('50123');
    await page.locator('input[name="password"]').fill('E2ePass123');
    await page.locator('input[name="confirm_password"]').fill('E2ePass123');
    await page.locator('button[type="submit"]').click();

    await page.waitForTimeout(1_000);
    expect(calls).toHaveLength(0);
  });
});
