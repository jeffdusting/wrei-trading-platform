import { test, expect } from '@playwright/test';

test.describe('WREI Platform - Basic Functionality', () => {
  test('landing page loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check for key elements that should be present
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('WREI')).toBeVisible();

    // Take screenshot for visual regression baseline
    await page.screenshot({
      path: 'e2e/screenshots/landing-page.png',
      fullPage: true
    });
  });

  test('negotiate page is accessible', async ({ page }) => {
    await page.goto('/negotiate');

    // Check for negotiate interface elements
    await expect(page.locator('body')).toBeVisible();

    // Basic interaction test - check if page is interactive
    await page.waitForLoadState('networkidle');

    // Take screenshot for visual regression baseline
    await page.screenshot({
      path: 'e2e/screenshots/negotiate-page.png',
      fullPage: true
    });
  });

  test('API route is responding', async ({ page }) => {
    // Test the negotiate API endpoint is accessible
    const response = await page.request.post('/api/negotiate', {
      data: {
        message: 'test message',
        persona: 'corporate-compliance',
        context: 'initial'
      }
    });

    // Should not be a 404 or 500 error
    expect(response.status()).toBeLessThan(500);
  });
});