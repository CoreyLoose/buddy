import { test, expect, type Page } from '@playwright/test';

const SHOTS = '.context';

// Each Playwright test runs in a fresh browser context with empty localStorage,
// so seed data loads deterministically on first navigation — no manual clearing
// (an addInitScript clear would re-run on reload and wipe the persisted state).

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}

test('family dashboard: two kids at a glance, per-side pick, reward modal, persistence', async ({
  page,
}) => {
  // 1. Default landing is the two-kid dashboard: Ozzy (left) + Oren (right).
  await page.goto('/');
  const left = page.getByTestId('panel-left');
  const right = page.getByTestId('panel-right');
  await expect(left.getByRole('heading', { name: /Ozzy/ })).toBeVisible();
  await expect(right.getByRole('heading', { name: /Oren/ })).toBeVisible();
  await shot(page, '01-family-dashboard');

  // 2. Completing chores in Ozzy's panel doesn't touch Oren's panel.
  await left.getByRole('button', { name: /Brush teeth/ }).click();
  await left.getByRole('button', { name: /Make the bed/ }).click();
  await left.getByRole('button', { name: /Put on pajamas/ }).click();
  await expect(left.getByText('All done — amazing! 🎉')).toBeVisible();
  await expect(left.getByRole('button', { name: "Open Ozzy's reward store" })).toContainText('4');
  await expect(right.getByText('0 of 3 done. Keep going!')).toBeVisible();
  await expect(right.getByRole('button', { name: "Open Oren's reward store" })).toContainText('0');
  await shot(page, '02-ava-done-noah-untouched');

  // 3. Tapping Ozzy's stars opens her single-kid reward store in a modal.
  await left.getByRole('button', { name: "Open Ozzy's reward store" }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText("Ozzy's rewards")).toBeVisible();
  await expect(dialog.getByText('30 min screen time')).toBeVisible();
  await shot(page, '03-reward-modal');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();

  // 4. Re-pick each side (swap kids). Data follows the kid: Ozzy still shows 3/3.
  await left.getByLabel('Left panel kid').selectOption({ index: 1 }); // Oren
  await right.getByLabel('Right panel kid').selectOption({ index: 0 }); // Ozzy
  await expect(left.getByRole('heading', { name: /Oren/ })).toBeVisible();
  await expect(right.getByRole('heading', { name: /Ozzy/ })).toBeVisible();
  await expect(right.getByText('All done — amazing! 🎉')).toBeVisible();

  // 5. Reload — the dashboard is the default, the per-side pick persists, and
  //    the completed chores persist (localStorage). Left=Oren, Right=Ozzy remain.
  await page.reload();
  await expect(page.getByTestId('panel-left').getByRole('heading', { name: /Oren/ })).toBeVisible();
  const rightAfter = page.getByTestId('panel-right');
  await expect(rightAfter.getByRole('heading', { name: /Ozzy/ })).toBeVisible();
  await expect(rightAfter.getByText('All done — amazing! 🎉')).toBeVisible();
  await shot(page, '04-after-reload-persisted');
});

test('single-kid loop: earn stars, add a reward, redeem', async ({ page }) => {
  await page.goto('/');

  // Switch to the single Kid view and pick Ozzy.
  await page.getByRole('tab', { name: 'Kid' }).click();
  await page.getByRole('button', { name: 'Select Ozzy' }).click();

  // Earn 4 stars by finishing today's tasks.
  await page.getByRole('button', { name: /Brush teeth/ }).click();
  await page.getByRole('button', { name: /Make the bed/ }).click();
  await page.getByRole('button', { name: /Put on pajamas/ }).click();
  const store = page.getByRole('region', { name: 'Reward store' });
  await expect(store.getByLabel('Current balance')).toHaveText(/4/);

  // Add an affordable reward in the Grown-up view.
  await page.getByRole('tab', { name: /Grown-up/ }).click();
  const catalog = page.getByRole('region', { name: 'Reward catalog' });
  await catalog.getByLabel('Title').fill('Sticker');
  await catalog.getByLabel('Icon (emoji)').fill('⭐');
  await catalog.getByLabel('Cost (stars)').fill('3');
  await catalog.getByRole('button', { name: 'Add reward' }).click();

  // Redeem it back in the Kid view: 4 -> 1 stars.
  await page.getByRole('tab', { name: 'Kid' }).click();
  await store.getByRole('button', { name: 'Redeem Sticker' }).click();
  await expect(page.getByRole('status')).toHaveText(/Redeemed Sticker/);
  await expect(store.getByLabel('Current balance')).toHaveText(/1/);
  await shot(page, '05-single-kid-redeemed');
});
