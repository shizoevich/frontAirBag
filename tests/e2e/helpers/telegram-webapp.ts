/**
 * Injects window.Telegram.WebApp into the page BEFORE any script runs.
 * The site reads window.Telegram?.WebApp?.initData, so the injection must
 * happen via page.addInitScript (executed before page JS).
 */
import { Page } from '@playwright/test';
import { generateInitData, TelegramUser } from './init-data';

export async function injectTelegramWebApp(
  page: Page,
  opts: { botToken: string; user: TelegramUser }
): Promise<void> {
  const initData = generateInitData(opts.botToken, opts.user);

  await page.addInitScript(
    ({ initData, user }) => {
      // Сайт грузит настоящий telegram-web-app.js, и тот присваивает
      // window.Telegram.WebApp заново — с пустым initData, ведь мы не в Telegram.
      // Подделка должна пережить это: свойство неперезаписываемое.
      const fakeWebApp = {
          initData,
          initDataUnsafe: {
            user,
            auth_date: Math.floor(Date.now() / 1000),
            hash: new URLSearchParams(initData).get('hash') ?? '',
          },
          version: '7.0',
          platform: 'android',
          colorScheme: 'light',
          themeParams: {},
          isExpanded: true,
          viewportHeight: 720,
          viewportStableHeight: 720,
          ready: () => {},
          expand: () => {},
          // Ссылки наружу (страница оплаты) — записываем, чтобы спека их проверила
          openLink: (url: string) => {
            (window as any).__telegramOpenedLinks = [...((window as any).__telegramOpenedLinks || []), url];
          },
          close: () => {},
          MainButton: { show: () => {}, hide: () => {}, setText: () => {}, onClick: () => {} },
          BackButton: { isVisible: false, show: () => {}, hide: () => {}, onClick: () => {} },
          HapticFeedback: {
            impactOccurred: () => {},
            notificationOccurred: () => {},
            selectionChanged: () => {},
          },
      };
      const telegram = {};
      Object.defineProperty(telegram, 'WebApp', { value: fakeWebApp, writable: false, configurable: false });
      Object.defineProperty(window, 'Telegram', { value: telegram, writable: false, configurable: false });
    },
    { initData, user: opts.user }
  );
}
