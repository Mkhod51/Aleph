import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },

  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Allow intentionally-unused args/vars prefixed with `_` (e.g. generator
      // signatures that don't read their config).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  /**
   * Engine boundary (doc 08 §2, doc 09 M0 DoD): `src/engine/` is pure TypeScript.
   * It must import nothing from other layers (store/ui/pages/content) and no
   * React/DOM — only pure `lib/` utilities. Enforced here instead of pulling in
   * eslint-plugin-boundaries, keeping the dependency surface minimal.
   */
  {
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'engine is pure TS — no React.' },
            { name: 'react-dom', message: 'engine is pure TS — no React DOM.' },
            { name: 'react-router-dom', message: 'engine must not import routing.' },
            { name: 'zustand', message: 'engine must not import state stores.' },
            { name: 'dexie', message: 'engine must not import persistence.' },
            { name: 'recharts', message: 'engine must not import charts.' },
          ],
          patterns: [
            {
              group: [
                '@/store',
                '@/store/**',
                '@/ui',
                '@/ui/**',
                '@/pages',
                '@/pages/**',
                '@/content',
                '@/content/**',
                '**/store/**',
                '**/ui/**',
                '**/pages/**',
                '**/content/**',
              ],
              message:
                'engine must not import from other layers (store/ui/pages/content). It may import only pure lib/ utilities.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'document', message: 'engine is pure TS — no DOM.' },
        { name: 'window', message: 'engine is pure TS — no DOM.' },
        { name: 'localStorage', message: 'engine is pure TS — no browser storage.' },
      ],
    },
  },

  // Config files run in Node.
  {
    files: ['*.{js,ts}', 'vite.config.ts', 'tailwind.config.ts'],
    languageOptions: { globals: globals.node },
  },
);
