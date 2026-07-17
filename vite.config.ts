/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    // Engine/lib tests are pure and run in node. UI/store tests opt into jsdom
    // via a `// @vitest-environment jsdom` pragma or the *.dom.test.ts glob.
    environment: 'node',
    environmentMatchGlobs: [['**/*.dom.test.{ts,tsx}', 'jsdom']],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
