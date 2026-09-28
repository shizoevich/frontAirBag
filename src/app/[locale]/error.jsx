'use client';

import { useEffect } from 'react';

// Тексты захардкожены сознательно: error boundary должен рендериться даже когда
// i18n-контекст (или любой другой провайдер) — сам источник падения.
const RELOAD_FLAG = 'app-error-auto-reload';

function isStaleChunkError(error) {
  const msg = String(error?.message || error || '');
  return (
    error?.name === 'ChunkLoadError' ||
    /Loading chunk .* failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg)
  );
}

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App error boundary:', error);
    // Устаревшая сборка в кэше WebView: чанков старой версии больше нет на
    // сервере. Одна автоматическая перезагрузка подтягивает свежий HTML.
    if (isStaleChunkError(error)) {
      let alreadyReloaded = false;
      try {
        alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === '1';
        if (!alreadyReloaded) sessionStorage.setItem(RELOAD_FLAG, '1');
      } catch {
        // приватный режим / заблокированное хранилище — просто не авторелоадим
        alreadyReloaded = true;
      }
      if (!alreadyReloaded) {
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 16px',
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Щось пішло не так</h2>
      <p style={{ marginBottom: 24, color: '#55585b' }}>
        Сталася помилка під час показу сторінки. Спробуйте оновити її — це
        зазвичай допомагає.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button type="button" className="tp-btn" onClick={() => window.location.reload()}>
          Оновити сторінку
        </button>
        <button type="button" className="tp-btn tp-btn-border" onClick={() => reset()}>
          Спробувати ще раз
        </button>
      </div>
    </div>
  );
}
