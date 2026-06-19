import { test, expect } from '@playwright/test';

test.describe('Status dashboard', () => {
  test('renders the hero verdict, summary, a service, and footer', async ({ page }) => {
    await page.goto('/');
    // Hero verdict (h1).
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Summary strip.
    await expect(page.getByRole('button', { name: /All services/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Operational/ })).toBeVisible();
    // A known service card.
    await expect(page.getByRole('heading', { name: 'Netlify' })).toBeVisible();
    // Footer link.
    await expect(page.getByRole('link', { name: 'Status API' })).toBeVisible();
  });

  test('search narrows the service grid', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Netlify' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Search services' }).fill('vercel');
    await expect(page.getByRole('heading', { name: 'Vercel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Netlify' })).toHaveCount(0);
  });

  test('empty state shows when no services match', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Search services' }).fill('zzzznomatch');
    await expect(page.getByText('No services match your filters')).toBeVisible();
  });

  test('clicking a status tile toggles the filter', async ({ page }) => {
    await page.goto('/');
    const tile = page.getByRole('button', { name: /Operational/ });
    await tile.click();
    await expect(tile).toHaveAttribute('aria-pressed', 'true');
  });

  test('a skip-to-content link is present for accessibility', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeAttached();
  });
});

test('GET /api/status returns a snapshot', async ({ request }) => {
  const res = await request.get('/api/status');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(Array.isArray(json.services)).toBe(true);
  expect(json.summary).toBeTruthy();
});

test('Studio renders its login screen', async ({ page }) => {
  await page.goto('/studio');
  await expect(page.getByText('Choose login provider')).toBeVisible({ timeout: 30_000 });
});
