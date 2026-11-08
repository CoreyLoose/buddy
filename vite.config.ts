/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// Skip the PWA/service-worker plugin under Vitest (jsdom) — it's irrelevant to
// unit tests and keeps the test environment clean.
const isTest = process.env.VITEST === 'true';

// Served at the root in local dev / preview / e2e, but under `/buddy/` on
// GitHub Pages (project sites live at coreyloose.github.io/buddy/). The deploy
// workflow sets GITHUB_PAGES=true so only that build gets the sub-path base.
const base = process.env.GITHUB_PAGES === 'true' ? '/buddy/' : '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    ...(isTest
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            base,
            includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
            manifest: {
              name: 'Family Routines',
              short_name: 'Routines',
              description: 'Chore & routine tracker for kids, with star rewards.',
              theme_color: '#6366f1',
              background_color: '#f8fafc',
              display: 'standalone',
              start_url: base,
              scope: base,
              icons: [
                { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                {
                  src: 'maskable-icon-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'maskable',
                },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
              navigateFallback: `${base}index.html`,
              cleanupOutdatedCaches: true,
            },
            devOptions: { enabled: false },
          }),
        ]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['e2e/**', 'e2e-pwa/**', 'node_modules/**', 'dist/**'],
  },
});
