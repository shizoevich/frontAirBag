import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, 'tests/e2e/.env') });

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const LOCALE = process.env.LOCALE ?? 'ru';
// Стенд через Tailscale Funnel: локальный 443 может держать чужой nginx, а
// Funnel слушает tailscale-адрес. Правило вида
// «MAP fedora.tail0b397f.ts.net [fd7a:…]» направляет Chromium мимо nginx.
const resolverRules = process.env.LOCAL_HOST_RESOLVER_RULES ?? '';
// Адрес получается «локальным», и Chrome блокирует его во фрейме публичного
// web.telegram.org (Local Network Access) — снимаем проверку только в этом режиме.
const launchOptions = resolverRules
  ? { args: [`--host-resolver-rules=${resolverRules}`, '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessRespectPreflightResults'] }
  : {};

export default defineConfig({
  testDir: './tests/e2e/specs',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],

  use: {
    baseURL: `${SITE_URL}/${LOCALE}`,
    locale: LOCALE,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      // Разовый вход в web.telegram.org (сессия для спеки 10): npm run test:e2e:setup
      name: 'setup',
      testDir: './tests/e2e/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], launchOptions },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], launchOptions },
    },
  ],
});
