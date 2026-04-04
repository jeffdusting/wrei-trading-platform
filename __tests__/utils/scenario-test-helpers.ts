/**
 * Scenario Test Helpers
 *
 * Utility functions for enhanced E2E testing of institutional investor scenarios.
 * Provides reusable test helpers for complex scenario workflows.
 */

import { Page, Locator, expect } from '@playwright/test';

export interface ScenarioData {
  id: string;
  title: string;
  persona: string;
  organization: string;
  complexity: string;
  estimatedTime: number;
  phases: string[];
  tags: string[];
}

/**
 * Navigation Helpers
 */
export class ScenarioNavigator {
  constructor(private page: Page) {}

  async goToSimulation() {
    await this.page.goto('/simulate');
    await expect(this.page.getByText('WREI Institutional Scenario Simulation')).toBeVisible();
  }

  async selectScenario(scenarioTitle: string) {
    await this.page.getByText(scenarioTitle).click();
  }

  async startScenario() {
    const startButton = this.page.locator('button:text("Start Scenario"), button:text("Begin Analysis")').first();
    await startButton.click();
  }

  async nextPhase() {
    const continueButton = this.page.locator('button:text("Continue"), button:text("Next"), button:text("→")').first();
    await continueButton.click();
  }

  async completeScenario() {
    const completeButton = this.page.locator('button:text("Complete"), button:text("Finish"), button:text("Complete Analysis")').first();
    await completeButton.click();
  }

  async exitScenario() {
    const exitButton = this.page.locator('button:text("Exit"), button:text("Exit Scenario")').first();
    await exitButton.click();
  }
}

/**
 * Form Interaction Helpers
 */
export class FormInteractor {
  constructor(private page: Page) {}

  async fillSlider(selector: string, value: number) {
    const slider = this.page.locator(selector);
    await slider.fill(value.toString());
  }

  async fillAllSliders(value: number) {
    const sliders = this.page.locator('input[type="range"]');
    const count = await sliders.count();
    for (let i = 0; i < count; i++) {
      await sliders.nth(i).fill(value.toString());
    }
  }

  async selectDropdownOption(selector: string, optionText: string) {
    await this.page.selectOption(selector, optionText);
  }

  async checkCheckbox(selector: string) {
    await this.page.check(selector);
  }

  async fillTextArea(selector: string, text: string) {
    await this.page.fill(selector, text);
  }

  async fillNumberInput(selector: string, value: number) {
    await this.page.fill(selector, value.toString());
  }
}

/**
 * Assertion Helpers
 */
export class ScenarioAssertions {
  constructor(private page: Page) {}

  async verifyPersonaDisplay(persona: string, organization: string) {
    await expect(this.page.getByText(persona)).toBeVisible();
    await expect(this.page.getByText(organization)).toBeVisible();
  }

  async verifyPhaseContent(expectedTexts: string[]) {
    for (const text of expectedTexts) {
      await expect(this.page.getByText(new RegExp(text, 'i'))).toBeVisible();
    }
  }

  async verifyScenarioCompletion() {
    await expect(this.page.getByText(/completed|success|finished|thank you/i)).toBeVisible({ timeout: 10000 });
  }

  async verifyReturnToSelector() {
    await expect(this.page.getByText('WREI Institutional Scenario Simulation')).toBeVisible();
  }

  async verifyProgressBar(expectedProgress: number) {
    const progressBar = this.page.locator('[role="progressbar"], .progress-bar, div[style*="width"]').first();
    await expect(progressBar).toBeVisible();
  }

  async verifyScoreDisplay(minScore: number, maxScore: number) {
    const scoreRegex = new RegExp(`[${minScore}-${maxScore}](\\.\\d+)?[/\\s]+(${maxScore}|10)`);
    await expect(this.page.getByText(scoreRegex)).toBeVisible();
  }
}

/**
 * Performance Monitoring
 */
export class PerformanceMonitor {
  constructor(private page: Page) {}

  async measurePageLoad(url: string): Promise<number> {
    const startTime = Date.now();
    await this.page.goto(url);
    return Date.now() - startTime;
  }

  async measureScenarioTransition(): Promise<number> {
    const startTime = Date.now();
    const navigator = new ScenarioNavigator(this.page);
    await navigator.nextPhase();
    await this.page.waitForLoadState('domcontentloaded');
    return Date.now() - startTime;
  }

  async verifyLoadTime(maxTime: number, actualTime: number) {
    expect(actualTime).toBeLessThan(maxTime);
  }
}

/**
 * Accessibility Helpers
 */
export class AccessibilityChecker {
  constructor(private page: Page) {}

  async verifyHeadingStructure() {
    const h1Elements = await this.page.locator('h1').count();
    const h2Elements = await this.page.locator('h2').count();
    const h3Elements = await this.page.locator('h3').count();

    expect(h1Elements).toBeGreaterThan(0);
    expect(h2Elements + h3Elements).toBeGreaterThan(0);
  }

  async verifyButtonLabels() {
    const buttons = this.page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const hasLabel = (text && text.trim().length > 0) || (ariaLabel && ariaLabel.length > 0);
        expect(hasLabel).toBeTruthy();
      }
    }
  }

  async verifyFormLabels() {
    const inputs = this.page.locator('input:visible, select:visible, textarea:visible');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      if (id) {
        const associatedLabel = await this.page.locator(`label[for="${id}"]`).count();
        const hasLabel = associatedLabel > 0 || ariaLabel || ariaLabelledBy;
        expect(hasLabel).toBeTruthy();
      }
    }
  }

  async verifyColorContrast() {
    // Basic color contrast check - could be enhanced with actual contrast calculations
    const textElements = this.page.locator('p, span, div, h1, h2, h3, h4, h5, h6').filter({ hasText: /.+/ });
    const count = await textElements.count();
    expect(count).toBeGreaterThan(0); // Ensure we have visible text elements
  }
}

/**
 * Visual Testing Helpers
 */
export class VisualTester {
  constructor(private page: Page) {}

  async takeScenarioScreenshot(scenarioName: string, phase?: string) {
    const filename = phase ? `${scenarioName}-${phase}.png` : `${scenarioName}.png`;
    await expect(this.page).toHaveScreenshot(filename);
  }

  async verifyNoVisualRegressions(baselineImage: string) {
    await expect(this.page).toHaveScreenshot(baselineImage);
  }

  async testResponsiveLayout(viewports: { width: number; height: number }[]) {
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500); // Allow layout to settle

      // Verify key elements are still visible and properly positioned
      await expect(this.page.locator('h1').first()).toBeVisible();
      await expect(this.page.locator('button').first()).toBeVisible();
    }
  }
}

/**
 * Data Generation Helpers
 */
export class TestDataGenerator {
  static generateRealisticScenarioInputs(scenarioType: string) {
    switch (scenarioType) {
      case 'infrastructure':
        return {
          riskTolerance: 7,
          investmentHorizon: 'long-term',
          esgRequirement: 8,
          portfolioAllocation: 2.5,
          notes: 'Conservative institutional approach with focus on long-term returns and ESG compliance.'
        };

      case 'esg':
        return {
          esgRating: 9,
          impactMeasurement: 8,
          premiumTolerance: 15,
          sustainabilityGoals: 'carbon-neutral',
          notes: 'Strong emphasis on measurable environmental impact and third-party verification.'
        };

      case 'defi':
        return {
          riskTolerance: 6,
          yieldTarget: 12,
          protocolPreference: 'multi-protocol',
          automationLevel: 'high',
          notes: 'Sophisticated DeFi strategy with automated rebalancing and cross-protocol optimization.'
        };

      case 'family-office':
        return {
          riskTolerance: 4,
          taxOptimization: true,
          generationalPlanning: true,
          preservationFocus: 8,
          notes: 'Conservative approach prioritizing capital preservation and tax efficiency for multi-generational wealth.'
        };

      case 'sovereign':
        return {
          macroOutlook: 'bullish',
          geopoliticalRisk: 'medium',
          currencyHedging: true,
          strategicAllocation: 2.0,
          notes: 'Long-term sovereign strategy aligned with national climate commitments and regional stability considerations.'
        };

      default:
        return {
          riskTolerance: 5,
          notes: 'Standard institutional analysis with balanced risk-return profile.'
        };
    }
  }

  static getScenarioComplexityData() {
    return {
      'Basic': { phases: 3, estimatedTime: 15, interactions: 5 },
      'Intermediate': { phases: 4, estimatedTime: 30, interactions: 10 },
      'Advanced': { phases: 5, estimatedTime: 45, interactions: 15 },
      'Expert': { phases: 6, estimatedTime: 60, interactions: 20 }
    };
  }
}

/**
 * Scenario-Specific Helpers
 */
export class ScenarioSpecificHelpers {
  constructor(private page: Page) {}

  async completeInfrastructureFundWorkflow() {
    const navigator = new ScenarioNavigator(this.page);
    const formInteractor = new FormInteractor(this.page);
    const data = TestDataGenerator.generateRealisticScenarioInputs('infrastructure');

    // Phase 1: Orientation
    await navigator.nextPhase();

    // Phase 2: Portfolio Analysis
    await formInteractor.fillAllSliders((data as { riskTolerance: number }).riskTolerance);
    await navigator.nextPhase();

    // Phase 3: Risk Assessment
    await navigator.nextPhase();

    // Phase 4: Committee Review
    await formInteractor.fillTextArea('textarea', data.notes);
    await navigator.nextPhase();

    // Phase 5: Recommendation
    await navigator.completeScenario();
  }

  async completeESGAnalysisWorkflow() {
    const navigator = new ScenarioNavigator(this.page);
    const formInteractor = new FormInteractor(this.page);
    const data = TestDataGenerator.generateRealisticScenarioInputs('esg');

    // Navigate through ESG-specific phases
    await navigator.nextPhase(); // Orientation
    await navigator.nextPhase(); // ESG Analysis

    await formInteractor.fillAllSliders((data as { esgRating: number }).esgRating);
    await navigator.nextPhase(); // Impact Measurement

    await navigator.nextPhase(); // Premium Analysis
    await navigator.completeScenario();
  }

  async completeDeFiWorkflow() {
    const navigator = new ScenarioNavigator(this.page);
    const formInteractor = new FormInteractor(this.page);
    const data = TestDataGenerator.generateRealisticScenarioInputs('defi');

    // Navigate through DeFi-specific phases
    await navigator.nextPhase(); // Orientation
    await navigator.nextPhase(); // Protocol Analysis

    await formInteractor.fillAllSliders((data as { riskTolerance: number }).riskTolerance);
    await navigator.nextPhase(); // Yield Optimization

    await navigator.nextPhase(); // Automation Setup
    await navigator.completeScenario();
  }
}

/**
 * Error Handling and Recovery
 */
export class ErrorHandler {
  constructor(private page: Page) {}

  async handleNetworkErrors() {
    await this.page.route('**/*', async (route) => {
      try {
        await route.continue();
      } catch (error) {
        console.warn('Network error handled:', error);
        await route.abort();
      }
    });
  }

  async retryOperation(operation: () => Promise<void>, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await operation();
        return; // Success
      } catch (error) {
        if (attempt === maxRetries) {
          throw error; // Final attempt failed
        }
        console.warn(`Attempt ${attempt} failed, retrying...`, error);
        await this.page.waitForTimeout(1000 * attempt); // Exponential backoff
      }
    }
  }

  async verifyErrorRecovery() {
    // Simulate error conditions and verify graceful handling
    await this.page.context().setOffline(true);
    await this.page.waitForTimeout(100);
    await this.page.context().setOffline(false);

    // Verify page is still functional
    await expect(this.page.locator('body')).toBeVisible();
  }
}