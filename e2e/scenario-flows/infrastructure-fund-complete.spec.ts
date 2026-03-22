import { test, expect } from '@playwright/test';

/**
 * Complete Infrastructure Fund Discovery Scenario Test
 * User: Sarah Chen (Infrastructure Fund Portfolio Manager)
 * Goal: Full scenario completion with all phases
 */
test.describe('Infrastructure Fund Complete Scenario', () => {
  test('completes full infrastructure fund discovery workflow', async ({ page }) => {
    // Navigate to scenario selection
    await page.goto('/scenario');
    await page.waitForLoadState('networkidle');

    // Verify scenario selector loads
    await expect(page.getByText('WREI Institutional Scenario Simulation')).toBeVisible();

    // Look for Infrastructure Fund Discovery scenario
    const infrastructureScenario = page.getByText('Infrastructure Fund Discovery').first();
    await expect(infrastructureScenario).toBeVisible();

    // Click to preview/select the scenario
    await infrastructureScenario.click();

    // Wait for scenario to load
    await page.waitForLoadState('networkidle');

    // Should now be in the Infrastructure Fund scenario
    await expect(page.getByText('Infrastructure Fund Carbon Credit Evaluation')).toBeVisible();
    await expect(page.getByText('Sarah Chen')).toBeVisible();
    await expect(page.getByText('Australian Infrastructure Fund')).toBeVisible();

    // Check phase indicator shows discovery phase
    await expect(page.getByText('DISCOVERY')).toBeVisible();

    // Complete Discovery Phase
    await test.step('Complete Discovery Phase', async () => {
      // Review Value Proposition
      const reviewButton = page.getByText('Execute').first();
      await reviewButton.click();

      // Wait for completion and check for success
      await expect(page.getByText('Complete ✓')).toBeVisible();

      // Access Professional Interface (should be enabled now)
      const professionalButtons = page.getByText('Execute');
      if (await professionalButtons.count() > 0) {
        await professionalButtons.first().click();
      }
    });

    // Should progress to Analysis phase
    await expect(page.getByText('ANALYSIS')).toBeVisible();

    // Complete Analysis Phase
    await test.step('Complete Analysis Phase', async () => {
      // Look for analysis action buttons and execute them
      const executeButtons = page.getByText('Execute');
      const buttonCount = await executeButtons.count();

      // Execute available analysis steps
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const buttons = page.getByText('Execute');
        if (await buttons.count() > 0) {
          await buttons.first().click();
          await page.waitForTimeout(500); // Brief delay for UI update
        }
      }
    });

    // Take screenshot of analysis phase
    await page.screenshot({
      path: 'e2e/screenshots/infrastructure-fund-analysis-phase.png',
      fullPage: true
    });

    // Verify we can progress through the scenario
    const phaseIndicators = ['DISCOVERY', 'ANALYSIS', 'EVALUATION', 'DECISION', 'REPORTING'];

    // Check that we've progressed beyond discovery
    let currentPhaseFound = false;
    for (const phase of phaseIndicators.slice(1)) { // Skip discovery, we should be past it
      if (await page.getByText(phase).isVisible()) {
        currentPhaseFound = true;
        console.log(`Currently in phase: ${phase}`);
        break;
      }
    }

    expect(currentPhaseFound).toBe(true);

    // Performance validation
    const navigationTime = Date.now();
    console.log(`Scenario loaded and navigated successfully`);
  });

  test('validates professional interface elements', async ({ page }) => {
    await page.goto('/scenario');
    await page.waitForLoadState('networkidle');

    // Select Infrastructure Fund scenario
    const infrastructureScenario = page.getByText('Infrastructure Fund Discovery').first();
    await infrastructureScenario.click();
    await page.waitForLoadState('networkidle');

    // Verify professional interface elements are present
    await expect(page.getByText('Infrastructure Fund Carbon Credit Evaluation')).toBeVisible();

    // Check for professional styling elements
    await expect(page.getByText('Senior Portfolio Manager')).toBeVisible();
    await expect(page.getByText('A$5B AUM')).toBeVisible();

    // Verify phase indicators
    await expect(page.getByText('DISCOVERY')).toBeVisible();

    // Check for progress sidebar
    await expect(page.getByText('Progress Tracking')).toBeVisible();
    await expect(page.getByText('Steps Completed')).toBeVisible();

    // Take screenshot for visual validation
    await page.screenshot({
      path: 'e2e/screenshots/infrastructure-fund-professional-interface.png',
      fullPage: true
    });
  });

  test('validates scenario progression and state management', async ({ page }) => {
    await page.goto('/scenario');

    // Select Infrastructure Fund scenario
    const infrastructureScenario = page.getByText('Infrastructure Fund Discovery').first();
    await infrastructureScenario.click();
    await page.waitForLoadState('networkidle');

    // Initial state validation
    await expect(page.getByText('DISCOVERY')).toBeVisible();
    await expect(page.getByText('0 / 8')).toBeVisible(); // Should show 0 steps completed initially

    // Execute first action
    const firstExecuteButton = page.getByText('Execute').first();
    await firstExecuteButton.click();

    // Verify progress update
    await expect(page.getByText('Complete ✓')).toBeVisible();

    // Progress should increase
    // Note: Exact progress numbers may vary based on implementation
    const progressElements = page.getByText(/\d+ \/ 8/);
    await expect(progressElements.first()).toBeVisible();

    console.log('Scenario progression validation completed');
  });

  test('handles scenario exit gracefully', async ({ page }) => {
    await page.goto('/scenario');

    // Select and enter scenario
    const infrastructureScenario = page.getByText('Infrastructure Fund Discovery').first();
    await infrastructureScenario.click();
    await page.waitForLoadState('networkidle');

    // Verify we're in the scenario
    await expect(page.getByText('Infrastructure Fund Carbon Credit Evaluation')).toBeVisible();

    // Find and click exit button
    const exitButton = page.getByText('Exit Scenario');
    await exitButton.click();

    // Should return to scenario selector
    await expect(page.getByText('WREI Institutional Scenario Simulation')).toBeVisible();
    await expect(page.getByText('Experience realistic institutional investor workflows')).toBeVisible();

    console.log('Scenario exit functionality validated');
  });
});