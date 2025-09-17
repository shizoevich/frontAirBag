// Utility for storing auth data in localStorage (cookie-less)
// Structure stored under key 'userInfo'

const STORAGE_KEY = 'userInfo';

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
