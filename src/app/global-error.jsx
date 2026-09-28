'use client';

// Ловит падения корневого layout, когда [locale]/error.jsx уже не поможет.
// Полностью автономен: свои <html>/<body>, без стилей и провайдеров приложения.
export default function GlobalError({ error }) {
  console.error('Global error boundary:', error);

  return (
    <html lang="uk">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 16px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h2 style={{ marginBottom: 12 }}>Щось пішло не так</h2>
        <p style={{ marginBottom: 24, color: '#55585b', maxWidth: 420 }}>
          Сталася помилка під час показу сторінки. Спробуйте оновити її.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 28px',
            border: 'none',
            borderRadius: 6,
            background: '#0989ff',
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          Оновити сторінку
        </button>
      </body>
    </html>
  );
}
