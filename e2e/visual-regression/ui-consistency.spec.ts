import { test, expect } from '@playwright/test';

test.describe('UI Visual Consistency', () => {
  test('institutional dashboard maintains professional styling', async ({ page }) => {
    await page.goto('/negotiate');

    // Wait for dynamic content to load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot for visual regression
    await expect(page).toHaveScreenshot('institutional-dashboard.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.2 // Allow 20% pixel difference for dynamic content
    });
  });

  test('landing page maintains consistent branding', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('landing-page-branding.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.1
    });
  });

  test('responsive design across device sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-hd' },
      { width: 1366, height: 768, name: 'desktop-standard' },
      { width: 1024, height: 768, name: 'tablet-landscape' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/negotiate');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`responsive-${viewport.name}.png`, {
        threshold: 0.3
      });
    }
  });
});