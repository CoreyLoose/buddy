import { test, expect } from '@playwright/test';

test('installable PWA with a linked manifest and icons', async ({ page }) => {
  await page.goto('/');

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toContain('manifest.webmanifest');

  const manifest = await page.evaluate(async (href) => {
    const res = await fetch(href!);
    return res.json();
  }, manifestHref);

  expect(manifest.name).toBe('Family Routines');
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.some((i: { sizes: string }) => i.sizes === '512x512')).toBe(true);
  expect(
    manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable'),
  ).toBe(true);
});

test('works offline from the precached app shell', async ({ page, context }) => {
  await page.goto('/');

  // Wait for the service worker to install + activate.
  await page.waitForFunction(
    async () => {
      const reg = await navigator.serviceWorker?.getRegistration();
      return !!reg?.active;
    },
    undefined,
    { timeout: 30_000 },
  );

  // Reload so the SW controls the page, then confirm the app renders online.
  await page.reload();
  await expect(page.getByTestId('panel-left')).toBeVisible();

  // Go fully offline and reload — the precached shell must still boot.
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId('panel-left')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Ozzy/ }).first()).toBeVisible();

  await context.setOffline(false);
});
