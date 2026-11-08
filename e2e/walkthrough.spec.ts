import { test, expect, type Page } from '@playwright/test';

const SHOTS = '.context';

// Each Playwright test runs in a fresh browser context with empty localStorage,
// so seed data loads deterministically on first navigation — no manual clearing
// (an addInitScript clear would re-run on reload and wipe the persisted state).

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}

test('full loop: pick kid, complete chores, earn & redeem stars, persist, switch kids', async ({
  page,
}) => {
  // 1. Landing — "who's using the app?" with seed kids.
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Select Ava' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select Noah' })).toBeVisible();
  await shot(page, '01-landing');

  // 2. Pick Ava -> Kid view with today's tasks grouped by part of day.
  await page.getByRole('button', { name: 'Select Ava' }).click();
  const brush = page.getByRole('button', { name: /Brush teeth/ });
  const bed = page.getByRole('button', { name: /Make the bed/ });
  const pajamas = page.getByRole('button', { name: /Put on pajamas/ });
  await expect(brush).toBeVisible();
  // "Do homework" is weekday-only; today (2026-11-08) is Saturday, so it should be hidden.
  await expect(page.getByRole('button', { name: /Do homework/ })).toHaveCount(0);
  await shot(page, '02-kid-view-initial');

  // Reward store starts at 0 stars; the 5-star reward is unaffordable.
  const store = page.getByRole('region', { name: 'Reward store' });
  await expect(store.getByLabel('Current balance')).toHaveText(/0/);
  await expect(store.getByText('Need 5 more ⭐ to redeem this.')).toBeVisible();
  await expect(store.getByRole('button', { name: 'Redeem 30 min screen time' })).toBeDisabled();

  // 3. Complete all of Ava's tasks (1 + 2 + 1 = 4 stars).
  await brush.click();
  await bed.click();
  await pajamas.click();
  await expect(brush).toHaveAttribute('aria-pressed', 'true');
  await expect(store.getByLabel('Current balance')).toHaveText(/4/);
  await shot(page, '03-tasks-completed');

  // 4 stars still can't afford the 5-star reward, but the shortfall shrank to 1.
  await expect(store.getByText('Need 1 more ⭐ to redeem this.')).toBeVisible();

  // 4. Grown-up view: add a cheap reward to exercise CRUD + an affordable redeem.
  await page.getByRole('tab', { name: /Grown-up/ }).click();
  const catalog = page.getByRole('region', { name: 'Reward catalog' });
  await catalog.getByLabel('Title').fill('Sticker');
  await catalog.getByLabel('Icon (emoji)').fill('⭐');
  await catalog.getByLabel('Cost (stars)').fill('3');
  await catalog.getByRole('button', { name: 'Add reward' }).click();
  await expect(catalog.getByText('Sticker')).toBeVisible();
  await shot(page, '04-manage-add-reward');

  // 5. Back to Kid view and redeem the affordable reward (4 -> 1 stars).
  await page.getByRole('tab', { name: /Kid/ }).click();
  await store.getByRole('button', { name: 'Redeem Sticker' }).click();
  await expect(page.getByRole('status')).toHaveText(/Redeemed Sticker/);
  await expect(store.getByLabel('Current balance')).toHaveText(/1/);
  await shot(page, '05-redeemed');

  // 6. Reload -> DATA persists via localStorage. Note: the active-kid *selection*
  //    is intentionally in-memory (session store), so a reload returns to the
  //    landing screen; re-selecting Ava shows her retained progress + balance.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Select Ava' })).toBeVisible();
  await shot(page, '06a-after-reload-landing');
  await page.getByRole('button', { name: 'Select Ava' }).click();
  await expect(page.getByRole('button', { name: /Brush teeth/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(
    page.getByRole('region', { name: 'Reward store' }).getByLabel('Current balance'),
  ).toHaveText(/1/);
  await shot(page, '06b-after-reload-reselected');

  // 7. Switch to Noah -> independent state (his tasks un-done, 0 stars).
  await page.getByRole('button', { name: 'Switch to Noah' }).click();
  await expect(page.getByRole('button', { name: /Brush teeth/ })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(
    page.getByRole('region', { name: 'Reward store' }).getByLabel('Current balance'),
  ).toHaveText(/0/);
  await shot(page, '07-switched-to-noah');
});
