'use strict';

const TELEGRAM_WEBAPP_SRC = 'https://telegram.org/js/telegram-web-app.js';
const TELEGRAM_WEBAPP_SCRIPT_ID = 'telegram-webapp-sdk';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getTelegramWebApp() {
  if (!isBrowser()) return null;
  return window.Telegram?.WebApp ?? null;
}

export function readTelegramInitData() {
  return getTelegramWebApp()?.initData || '';
}

export function readTelegramInitDataUnsafe() {
  const unsafe = getTelegramWebApp()?.initDataUnsafe;
  return unsafe ?? {};
}

export function getTelegramUser() {
  const unsafe = readTelegramInitDataUnsafe();
  if (unsafe?.user) return unsafe.user;

  const raw = readTelegramInitData();
  if (!raw) return null;
  try {
    const params = new URLSearchParams(raw);
    const userStr = params.get('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to parse Telegram init data', error);
    }
    return null;
  }
}

export function hasTelegramInitData(rawInitData, unsafe = readTelegramInitDataUnsafe()) {
  if (rawInitData && String(rawInitData).trim().length > 0) {
    return true;
  }
  return Boolean(unsafe?.user);
}

export function buildTelegramInitPayload(source) {
  if (source && typeof source === 'object' && source.init_data) {
    const value = String(source.init_data || '').trim();
    return value ? { init_data: value } : null;
  }

  if (typeof source === 'string') {
    const value = source.trim();
    if (value) return { init_data: value };
  }

  if (source && typeof source === 'object' && source.rawInitData) {
    const value = String(source.rawInitData || '').trim();
    if (value) return { init_data: value };
  }

  const fallback = readTelegramInitData();
  return fallback ? { init_data: fallback } : null;
}

/**
 * Открыть страницу снаружи мини-аппа: в системном браузере (Safari/Chrome),
 * где работают Apple Pay и Google Pay. Внутри WebView Telegram они не
 * работают: Google Pay не может открыть окно, Apple Pay не проходит во
 * вложенном фрейме (ADR-0022). Вне Telegram — обычная новая вкладка.
 */
export function openExternalLink(url) {
  if (!url) return false;
  const webApp = getTelegramWebApp();
  if (webApp && typeof webApp.openLink === 'function') {
    webApp.openLink(url, { try_instant_view: false });
    return true;
  }
  if (isBrowser()) window.open(url, '_blank', 'noopener');
  return false;
}

export function ensureTelegramScript() {
  if (!isBrowser()) return Promise.resolve(false);

  const existing = document.getElementById(TELEGRAM_WEBAPP_SCRIPT_ID);
  if (existing) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = TELEGRAM_WEBAPP_SCRIPT_ID;
    script.src = TELEGRAM_WEBAPP_SRC;
    script.async = true;
    script.onload = () => {
      window.dispatchEvent(new Event('telegram-webapp-loaded'));
      resolve(true);
    };
    script.onerror = (error) => reject(error || new Error('Failed to load Telegram WebApp script'));
    document.head.appendChild(script);
  });
}

export { TELEGRAM_WEBAPP_SRC, TELEGRAM_WEBAPP_SCRIPT_ID };

// Вход по Telegram при открытии — один запрос на загрузку страницы, кто бы его
// ни запрашивал. React Strict Mode в dev запускает эффекты дважды: второй
// запуск должен дождаться того же запроса, а не считать вход завершённым.
// Истечение сессии в середине работы обрабатывает apiSlice отдельно.
let telegramAuthInFlight = null;

export function runTelegramAuthOnce(start) {
  if (!telegramAuthInFlight) {
    telegramAuthInFlight = Promise.resolve().then(start);
  }
  return telegramAuthInFlight;
}

export function resetTelegramAuthAttempt() {
  telegramAuthInFlight = null;
}
