import { defineConfig, devices } from '@playwright/test';

// Separate config: PWA/offline behavior only exists in a production build served
// by `vite preview` (the SW is disabled in dev). Run with `npm run e2e:pwa`.
export default defineConfig({
  testDir: './e2e-pwa',
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
