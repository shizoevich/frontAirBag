/**
 * Декодирует JWT токен и извлекает payload
 * @param {string} token - JWT токен
 * @returns {object|null} - Декодированный payload или null при ошибке
 */
export function decodeJWT(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    // JWT состоит из трех частей: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Декодируем payload (вторая часть)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Декодируем base64 в строку
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Извлекает user_id из JWT токена
 * @param {string} token - JWT токен
 * @returns {string|null} - user_id или null
 */
export function getUserIdFromToken(token) {
  const payload = decodeJWT(token);
  return payload?.user_id || null;
}

/**
 * Проверяет, истек ли токен
 * @param {string} token - JWT токен
 * @returns {boolean} - true если токен истек
 */
export function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // exp в секундах, Date.now() в миллисекундах
  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
}

/**
 * Получает время до истечения токена
 * @param {string} token - JWT токен
 * @returns {number} - Миллисекунды до истечения (или 0 если истек)
 */
export function getTokenTimeToExpire(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const expirationTime = payload.exp * 1000;
  const timeLeft = expirationTime - Date.now();
  return Math.max(0, timeLeft);
}
