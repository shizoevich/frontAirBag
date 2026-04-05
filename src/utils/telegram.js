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
