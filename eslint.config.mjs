import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

// Next.js 16 ships flat-config presets.
// Importing them directly avoids legacy-compat and prevents circular plugin refs.
const config = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/coverage/**',
    ],
  },
  ...nextCoreWebVitals,

  // Project compatibility: this codebase was created before the newest
  // strict React Hooks rules shipped in Next 16's presets.
  // Keep lint useful (bugs + best practices) without blocking the build.
  {
    name: 'project/relax-react-hooks-strictness',
    rules: {
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/set-state-in-render': 'off',
    },
  },
];

export default config;
