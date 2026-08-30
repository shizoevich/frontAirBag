// Utility for storing auth data in localStorage (cookie-less)
// Structure stored under key 'userInfo'

const STORAGE_KEY = 'userInfo';

/**
 * Пишется ли localStorage на самом деле.
 *
 * В WebView Telegram Desktop хранилище недоступно: запись либо бросает
 * исключение, либо молча не сохраняется. Отличать «хранилище пустое» от
 * «хранилища нет» обязательно — иначе успешный вход тут же отменяется как
 * «протухшее состояние» (см. AuthInitializer).
 *
 * Проверка round-trip, а не только setItem: приватные режимы некоторых
 * браузеров запись принимают, но при чтении возвращают null.
 */
export function isStorageWritable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probe = '__auth_probe__';
    localStorage.setItem(probe, '1');
    const ok = localStorage.getItem(probe) === '1';
    localStorage.removeItem(probe);
    return ok;
  } catch {
    return false;
  }
}

export function getAuth() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setAuth(data, options = {}) {
  try {
    const existing = getAuth() || {};
    const merged = { ...existing, ...data };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch (e) {
    // ignore
  }
}

export function updateAuth(patch) {
  if (!patch) return;
  const existing = getAuth() || {};
  setAuth({ ...existing, ...patch });
}

export function removeAuth() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    // ignore
  }
}

export function getAccessToken() {
  const a = getAuth();
  return a?.accessToken || null;
}

export function getRefreshToken() {
  const a = getAuth();
  return a?.refreshToken || null;
}
