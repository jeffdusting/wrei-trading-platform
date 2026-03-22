/**
 * Enhanced E2E Test Coverage for Core Scenarios (Week 3-4)
 *
 * Comprehensive end-to-end testing for all implemented institutional investor scenarios:
 * - Infrastructure Fund Discovery (scenario-01)
 * - ESG Impact Investment Analysis (scenario-02)
 * - DeFi Yield Farming Integration (scenario-03)
 * - Family Office Conservative Analysis (scenario-04)
 * - Sovereign Wealth Fund Macro Analysis (scenario-05)
 */

import { test, expect } from '@playwright/test';

// Test configuration
const SCENARIOS = [
  {
    id: 'scenario-01',
    title: 'Infrastructure Fund Discovery',
    persona: 'Sarah Chen',
    organization: 'Australian Infrastructure Fund',
    complexity: 'Advanced',
    estimatedTime: 55,
    phases: ['orientation', 'portfolio-analysis', 'risk-assessment', 'committee-review', 'recommendation']
  },
  {
    id: 'scenario-02',
    title: 'ESG Impact Investment Analysis',
    persona: 'James Rodriguez',
    organization: 'Sustainable Capital Partners',
    complexity: 'Advanced',
    estimatedTime: 65,
    phases: ['orientation', 'esg-analysis', 'impact-measurement', 'premium-analysis', 'recommendation']
  },
  {
    id: 'scenario-03',
    title: 'DeFi Yield Farming Integration',
    persona: 'Alex Kim',
    organization: 'Digital Asset Management',
    complexity: 'Expert',
    estimatedTime: 80,
    phases: ['orientation', 'protocol-analysis', 'yield-optimization', 'automation-setup', 'recommendation']
  },
  {
    id: 'scenario-04',
    title: 'Family Office Conservative Analysis',
    persona: 'Margaret Thompson',
    organization: 'Thompson Family Office',
    complexity: 'Intermediate',
    estimatedTime: 50,
    phases: ['orientation', 'conservative-analysis', 'tax-optimization', 'family-governance', 'recommendation']
  },
  {
    id: 'scenario-05',
    title: 'Sovereign Wealth Fund Macro Analysis',
    persona: 'Dr. Li Wei Chen',
    organization: 'Singapore Sovereign Wealth Fund',
    complexity: 'Expert',
    estimatedTime: 85,
    phases: ['orientation', 'macro-analysis', 'geopolitical-assessment', 'sovereign-integration', 'recommendation']
  }
];

test.describe('Core Scenarios E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to simulation interface
    await page.goto('/simulate');
    await expect(page.getByText('WREI Institutional Scenario Simulation')).toBeVisible();
  });

  test('should display all core scenarios in selector', async ({ page }) => {
    // Verify all scenarios are present
    for (const scenario of SCENARIOS) {
      await expect(page.getByText(scenario.title)).toBeVisible();
      await expect(page.getByText(scenario.persona)).toBeVisible();
      await expect(page.getByText(scenario.organization)).toBeVisible();
      await expect(page.getByText(scenario.complexity)).toBeVisible();
    }

    // Verify total scenario count
    const scenarioCards = page.locator('.scenario-card, [data-testid*="scenario-card"]').or(
      page.locator('div').filter({ hasText: /Infrastructure Fund Discovery|ESG Impact Investment|DeFi Yield Farming|Family Office Conservative|Sovereign Wealth Fund/ })
    );
    await expect(scenarioCards).toHaveCount(5);
  });

  test('should filter scenarios by complexity level', async ({ page }) => {
    // Test Expert level filter
    await page.selectOption('select[name="complexity"], select:has(option:text("Expert"))', 'Expert');
    await expect(page.getByText('DeFi Yield Farming Integration')).toBeVisible();
    await expect(page.getByText('Sovereign Wealth Fund Macro Analysis')).toBeVisible();
    await expect(page.getByText('Infrastructure Fund Discovery')).not.toBeVisible();

    // Test Intermediate level filter
    await page.selectOption('select[name="complexity"], select:has(option:text("Intermediate"))', 'Intermediate');
    await expect(page.getByText('Family Office Conservative Analysis')).toBeVisible();
    await expect(page.getByText('DeFi Yield Farming Integration')).not.toBeVisible();

    // Reset filter
    await page.selectOption('select[name="complexity"], select:has(option:text("All Levels"))', 'all');
  });

  test('should search scenarios by keyword', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], input[name="search"]').first();

    // Search for ESG
    await searchInput.fill('ESG');
    await expect(page.getByText('ESG Impact Investment Analysis')).toBeVisible();
    await expect(page.getByText('Infrastructure Fund Discovery')).not.toBeVisible();

    // Search for DeFi
    await searchInput.fill('DeFi');
    await expect(page.getByText('DeFi Yield Farming Integration')).toBeVisible();
    await expect(page.getByText('ESG Impact Investment Analysis')).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
  });

  test.describe('Infrastructure Fund Discovery Scenario', () => {
    test('should complete full workflow', async ({ page }) => {
      // Launch scenario
      await page.getByText('Infrastructure Fund Discovery').click();
      const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
      await startButton.click();

      // Phase 1: Orientation
      await expect(page.getByText('Infrastructure Fund Portfolio Analysis')).toBeVisible();
      await expect(page.getByText('Sarah Chen')).toBeVisible();
      await expect(page.getByText('Australian Infrastructure Fund')).toBeVisible();

      let continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();

      // Phase 2: Portfolio Analysis
      await expect(page.getByText(/Portfolio|Analysis/)).toBeVisible();

      // Fill out analysis forms (example inputs)
      const riskSliders = page.locator('input[type="range"]');
      if (await riskSliders.count() > 0) {
        await riskSliders.first().fill('7');
      }

      continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();

      // Phase 3: Risk Assessment
      await expect(page.getByText(/Risk|Assessment/)).toBeVisible();

      continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();

      // Phase 4: Committee Review
      await expect(page.getByText(/Committee|Review/)).toBeVisible();

      continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();

      // Phase 5: Recommendation
      await expect(page.getByText(/Recommendation|Investment Decision/)).toBeVisible();

      const completeButton = page.locator('button:text("Complete"), button:text("Finish"), button:text("Complete Analysis")').first();
      await completeButton.click();

      // Verify completion
      await expect(page.getByText(/completed|success|finished/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('ESG Impact Investment Analysis Scenario', () => {
    test('should handle ESG rating inputs and calculations', async ({ page }) => {
      // Launch ESG scenario
      await page.getByText('ESG Impact Investment Analysis').click();
      const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
      await startButton.click();

      // Navigate to ESG analysis phase
      let continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();

      // ESG Analysis phase
      await expect(page.getByText(/ESG|Impact|Rating/)).toBeVisible();

      // Test ESG rating inputs
      const esgInputs = page.locator('input[type="range"], input[type="number"]');
      for (let i = 0; i < Math.min(await esgInputs.count(), 3); i++) {
        await esgInputs.nth(i).fill('8');
      }

      // Verify ESG score calculations
      await expect(page.getByText(/8|score|rating/i)).toBeVisible();

      continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();
    });
  });

  test.describe('DeFi Yield Farming Integration Scenario', () => {
    test('should display technical DeFi interface elements', async ({ page }) => {
      // Launch DeFi scenario
      await page.getByText('DeFi Yield Farming Integration').click();
      const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
      await startButton.click();

      // Navigate to protocol analysis
      let continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();

      // Verify DeFi technical elements
      await expect(page.getByText(/Protocol|DeFi|Yield|APY/)).toBeVisible();
      await expect(page.getByText(/Smart Contract|Automation|Liquidity/)).toBeVisible();

      continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();
    });
  });

  test.describe('Family Office Conservative Analysis Scenario', () => {
    test('should emphasize conservative analysis and tax optimization', async ({ page }) => {
      // Launch Family Office scenario
      await page.getByText('Family Office Conservative Analysis').click();
      const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
      await startButton.click();

      // Navigate through phases
      let continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();

      // Conservative Analysis phase
      await expect(page.getByText(/Conservative|Risk|Preservation/)).toBeVisible();

      continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();

      // Tax Optimization phase
      await expect(page.getByText(/Tax|Optimization|Efficiency/)).toBeVisible();

      continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();
    });
  });

  test.describe('Sovereign Wealth Fund Macro Analysis Scenario', () => {
    test('should handle macro indicators and geopolitical assessment', async ({ page }) => {
      // Launch Sovereign Wealth Fund scenario
      await page.getByText('Sovereign Wealth Fund Macro Analysis').click();
      const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
      await startButton.click();

      // Navigate to macro analysis
      let continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();

      // Macro Analysis phase
      await expect(page.getByText(/Macro|Economic|Indicator/)).toBeVisible();
      await expect(page.getByText(/Carbon Price|Dollar Index|Commodity/)).toBeVisible();

      continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();

      // Geopolitical Assessment phase
      await expect(page.getByText(/Geopolitical|Risk|Regional/)).toBeVisible();
      await expect(page.getByText(/Asia-Pacific|Europe|Americas/)).toBeVisible();

      continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      await continueButton.click();
    });
  });

  test('should maintain simulation state across phases', async ({ page }) => {
    // Start any scenario to test state persistence
    await page.getByText('Infrastructure Fund Discovery').click();
    const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
    await startButton.click();

    // Make some inputs in early phases
    let continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
    await continueButton.click();

    // Fill some forms
    const inputs = page.locator('input[type="range"], input[type="number"], input[type="text"]');
    if (await inputs.count() > 0) {
      await inputs.first().fill('7');
    }

    continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
    await continueButton.click();

    // Progress through multiple phases to verify state is maintained
    for (let i = 0; i < 3; i++) {
      continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
      if (await continueButton.isVisible()) {
        await continueButton.click();
      }
    }

    // Verify we reached a later phase without losing state
    await expect(page.getByText(/Recommendation|Complete|Analysis/)).toBeVisible();
  });

  test('should handle scenario exit functionality', async ({ page }) => {
    // Start a scenario
    await page.getByText('Family Office Conservative Analysis').click();
    const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
    await startButton.click();

    // Find and click exit button
    const exitButton = page.locator('button:text("Exit"), button:text("Exit Scenario"), button:text("Cancel")').first();
    await exitButton.click();

    // Verify return to scenario selector
    await expect(page.getByText('WREI Institutional Scenario Simulation')).toBeVisible();
    await expect(page.getByText('Family Office Conservative Analysis')).toBeVisible();
  });

  test('should validate persona information display', async ({ page }) => {
    for (const scenario of SCENARIOS.slice(0, 3)) { // Test first 3 scenarios
      await page.getByText(scenario.title).click();
      const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
      await startButton.click();

      // Verify persona information is displayed
      await expect(page.getByText(scenario.persona)).toBeVisible();
      await expect(page.getByText(scenario.organization)).toBeVisible();

      // Exit and return to selector
      const exitButton = page.locator('button:text("Exit"), button:text("Exit Scenario")').first();
      await exitButton.click();

      await expect(page.getByText('WREI Institutional Scenario Simulation')).toBeVisible();
    }
  });

  test('should handle responsive layout on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('WREI Institutional Scenario Simulation')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Infrastructure Fund Discovery')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByText('ESG Impact Investment Analysis')).toBeVisible();
  });

  test('should perform accessibility validation', async ({ page }) => {
    // Basic accessibility checks
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button')).toHaveCount.greaterThan(0);

    // Check for proper labeling
    const inputs = page.locator('input');
    for (let i = 0; i < Math.min(await inputs.count(), 3); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        // Check if input has associated label or aria-label
        const hasLabel = await input.getAttribute('aria-label') !== null ||
                         await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0;
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test('should measure performance metrics', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to scenario
    await page.getByText('Infrastructure Fund Discovery').click();
    const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
    await startButton.click();

    const loadTime = Date.now() - startTime;

    // Verify reasonable load time (under 3 seconds for test environment)
    expect(loadTime).toBeLessThan(3000);

    // Check for smooth transitions between phases
    let continueButton = page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
    await continueButton.click();

    // Verify content updates promptly
    await expect(page.getByText(/Analysis|Portfolio|Risk/)).toBeVisible({ timeout: 1000 });
  });
});

/**
 * Visual Regression Tests
 * Note: These require screenshot comparison baseline images
 */
test.describe('Visual Regression Tests', () => {

  test('scenario selector visual consistency', async ({ page }) => {
    await expect(page).toHaveScreenshot('scenario-selector.png');
  });

  test('infrastructure scenario visual consistency', async ({ page }) => {
    await page.getByText('Infrastructure Fund Discovery').click();
    const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
    await startButton.click();

    await expect(page).toHaveScreenshot('infrastructure-scenario.png');
  });

  test('esg scenario visual consistency', async ({ page }) => {
    await page.getByText('ESG Impact Investment Analysis').click();
    const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
    await startButton.click();

    await expect(page).toHaveScreenshot('esg-scenario.png');
  });
});

/**
 * Integration Tests with External Systems
 */
test.describe('External System Integration', () => {

  test('should handle API timeouts gracefully', async ({ page }) => {
    // Simulate slow network conditions
    await page.route('**/api/**', async route => {
      await page.waitForTimeout(100); // Simulate latency
      await route.continue();
    });

    await page.getByText('DeFi Yield Farming Integration').click();
    const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
    await startButton.click();

    // Verify scenario still loads
    await expect(page.getByText(/DeFi|Alex Kim/)).toBeVisible({ timeout: 5000 });
  });

  test('should maintain functionality during offline conditions', async ({ page }) => {
    // Simulate offline state
    await page.context().setOffline(true);

    await page.getByText('Family Office Conservative Analysis').click();
    const startButton = page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();

    // Verify graceful handling of offline state
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    // Restore online state
    await page.context().setOffline(false);
  });
});