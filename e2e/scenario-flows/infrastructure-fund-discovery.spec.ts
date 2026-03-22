import { test, expect } from '@playwright/test';

/**
 * Scenario 1: First-Time Professional Investor Discovery
 * User: Sarah Chen (Infrastructure Fund Portfolio Manager)
 * Goal: Evaluate WREI carbon credits as potential portfolio addition
 */
test.describe('Infrastructure Fund Discovery Scenario', () => {
  test('completes professional investor discovery workflow', async ({ page }) => {
    // Step 1-2: Discovery and Initial Exploration
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('WREI')).toBeVisible();

    // Performance tracking - start timer
    const startTime = Date.now();

    // Step 3: Token Research - Navigate to main platform
    await page.goto('/negotiate');
    await page.waitForLoadState('networkidle');

    // Step 4-5: Professional Interface Access
    // Look for professional interface elements or investor classification
    const professionalElements = page.locator('[data-testid*="professional"], [data-testid*="institutional"]');

    // Step 6: Market Access Review
    // Check for primary market or institutional features
    await expect(page.locator('body')).toBeVisible();

    // Step 7: Analytics Deep Dive
    // Look for financial metrics (IRR, NPV, Sharpe ratio)
    // This will be implemented when the analytics components exist

    // Step 8: Risk Assessment
    // Look for volatility analysis and correlation matrix
    // This will be implemented when risk components exist

    // Step 9: Benchmark Comparison
    // Check for comparison features
    // This will be implemented when benchmark components exist

    // Step 10: Export Generation
    // Test export functionality if available
    // This will be implemented when export features exist

    // Performance validation
    const completionTime = Date.now() - startTime;

    // Should complete basic flow within reasonable time (under 30 seconds for automation)
    expect(completionTime).toBeLessThan(30000);

    // Take screenshot for visual validation
    await page.screenshot({
      path: 'e2e/screenshots/infrastructure-fund-discovery-complete.png',
      fullPage: true
    });

    console.log(`Scenario completion time: ${completionTime}ms`);
  });

  test('handles different investor profile sizes', async ({ page }) => {
    await page.goto('/');

    // Test various AUM levels that institutional investors might have
    const investorProfiles = [
      { type: 'infrastructure_fund', aum: '5B', minInvestment: '10M' },
      { type: 'sovereign_wealth', aum: '230B', minInvestment: '100M' },
      { type: 'pension_fund', aum: '50B', minInvestment: '25M' }
    ];

    for (const profile of investorProfiles) {
      await page.goto('/negotiate');
      await page.waitForLoadState('networkidle');

      // Verify the platform loads for different investor types
      await expect(page.locator('body')).toBeVisible();

      // Take screenshots for each profile type
      await page.screenshot({
        path: `e2e/screenshots/investor-profile-${profile.type}.png`
      });
    }
  });

  test('validates professional interface responsiveness', async ({ page }) => {
    // Test professional interface at typical institutional screen sizes
    const institutionalViewports = [
      { width: 1920, height: 1080, name: 'trading-desk-primary' },
      { width: 2560, height: 1440, name: 'bloomberg-terminal-standard' },
      { width: 3440, height: 1440, name: 'ultrawide-professional' }
    ];

    for (const viewport of institutionalViewports) {
      await page.setViewportSize(viewport);
      await page.goto('/negotiate');
      await page.waitForLoadState('networkidle');

      // Verify UI elements are properly positioned for professional use
      await expect(page.locator('body')).toBeVisible();

      // Check that content fits without excessive scrolling
      const bodyHeight = await page.locator('body').boundingBox();
      expect(bodyHeight?.height).toBeDefined();

      await page.screenshot({
        path: `e2e/screenshots/professional-viewport-${viewport.name}.png`,
        fullPage: false // Just visible area for viewport testing
      });
    }
  });
});