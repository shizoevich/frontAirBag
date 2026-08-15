import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  // @vitejs/plugin-react намеренно НЕ используется: он тянет vite 7 (esbuild 0.28),
  // а vitest 2 — vite 5 (esbuild 0.21). Рассинхрон версий ломал `npm ci` в
  // Dockerfile фронта. Для тестов достаточно JSX-трансформа самого esbuild —
  // Fast Refresh, ради которого нужен плагин, здесь не требуется.
  esbuild: {
    jsx: 'automatic',
    include: /\.[jt]sx?$/,
    loader: 'jsx',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/unit/setup.js'],
    // Playwright-спеки живут в tests/e2e и запускаются своим раннером.
    include: ['tests/unit/**/*.test.{js,jsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
});
