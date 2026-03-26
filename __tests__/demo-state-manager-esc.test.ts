/**
 * WREI Trading Platform - Demo State Manager NSW ESC Tests
 *
 * Unit tests for NSW ESC demo configuration and tour validation
 * Testing Step 1.1: NSW ESC Context Integration within demo state
 *
 * Date: March 25, 2026
 */

import { DEMO_TOURS } from '../lib/demo-mode/demo-state-manager';
import {
  NSW_ESC_MARKET_CONTEXT,
  ESC_DEMO_SCENARIOS,
  NORTHMORE_GORDON_CONTEXT,
} from '../lib/demo-mode/esc-market-context';

describe('Demo State Manager - NSW ESC Integration', () => {

  describe('NSW ESC Demo Tours', () => {
    test('should have NSW ESC executive tour configured', () => {
      const tour = DEMO_TOURS['nsw-esc-executive'];
      expect(tour).toBeDefined();
      expect(tour.name).toBe('NSW ESC Executive Overview');
      expect(tour.duration).toBe(14);
      expect(tour.track).toBe('executive');
      expect(tour.targetAudience).toContain('NSW ESC market');
      expect(tour.steps).toHaveLength(7);
    });

    test('should have NSW ESC technical tour configured', () => {
      const tour = DEMO_TOURS['nsw-esc-technical'];
      expect(tour).toBeDefined();
      expect(tour.name).toBe('NSW ESC Technical Integration');
      expect(tour.duration).toBe(16);
      expect(tour.track).toBe('technical');
      expect(tour.steps).toHaveLength(6);
    });

    test('should have NSW ESC compliance tour configured', () => {
      const tour = DEMO_TOURS['nsw-esc-compliance'];
      expect(tour).toBeDefined();
      expect(tour.name).toBe('NSW ESC Compliance Walkthrough');
      expect(tour.duration).toBe(18);
      expect(tour.track).toBe('compliance');
      expect(tour.steps).toHaveLength(6);
    });

    test('should have Northmore Gordon overview tour', () => {
      const tour = DEMO_TOURS['northmore-gordon-overview'];
      expect(tour).toBeDefined();
      expect(tour.name).toBe('Northmore Gordon Firm Overview');
      expect(tour.duration).toBe(12);
      expect(tour.steps).toHaveLength(6);
    });
  });

  describe('NSW ESC Tour Step Data Validation', () => {
    test('NSW ESC tour steps should contain required data', () => {
      const tour = DEMO_TOURS['nsw-esc-executive'];

      // Check that steps have NSW ESC-specific data
      const marketOverviewStep = tour.steps.find(s => s.id === 'nsw-esc-market-overview');
      expect(marketOverviewStep?.data?.market_size).toBeDefined();
      expect(marketOverviewStep?.data?.participants).toBeDefined();

      const firmPositionStep = tour.steps.find(s => s.id === 'northmore-gordon-position');
      expect(firmPositionStep?.data?.nsw_esc_market_share).toBe(0.12);

      const negotiationStep = tour.steps.find(s => s.id === 'executive-esc-negotiation');
      expect(negotiationStep?.data?.name).toBe('Large Portfolio ESC Acquisition');
    });
  });

  describe('Compliance Tour Data Validation', () => {
    test('compliance tour steps should have CER framework data', () => {
      const tour = DEMO_TOURS['nsw-esc-compliance'];

      const cerFrameworkStep = tour.steps.find(s => s.id === 'cer-regulatory-framework');
      expect(cerFrameworkStep?.data?.authority?.name).toBe('Clean Energy Regulator');
      expect(cerFrameworkStep?.data?.requirements).toBeDefined();

      const highRiskStep = tour.steps.find(s => s.id === 'high-risk-scenario');
      expect(highRiskStep?.data?.name).toBe('High-Risk Certificate Due Diligence');
      expect(highRiskStep?.data?.esc_details?.compliance_status).toBe('high_risk');
    });
  });

  describe('Technical Tour Data Validation', () => {
    test('technical tour steps should have API and integration data', () => {
      const tour = DEMO_TOURS['nsw-esc-technical'];

      const apiArchStep = tour.steps.find(s => s.id === 'esc-api-architecture');
      expect(apiArchStep?.data?.data_sources).toContain('AEMO');
      expect(apiArchStep?.data?.data_sources).toContain('CER');
      expect(apiArchStep?.data?.update_frequency).toBe('15-minute intervals');

      const integrationStep = tour.steps.find(s => s.id === 'live-technical-negotiation');
      expect(integrationStep?.data?.name).toBe('API-Driven ESC Trading Integration');
      expect(integrationStep?.data?.audience).toBe('technical');
    });
  });
});

describe('NSW ESC Tour Step Data Integrity', () => {
  test('all NSW ESC tour steps should have valid target elements', () => {
    const escTours = [
      DEMO_TOURS['nsw-esc-executive'],
      DEMO_TOURS['nsw-esc-technical'],
      DEMO_TOURS['nsw-esc-compliance'],
      DEMO_TOURS['northmore-gordon-overview'],
    ];

    escTours.forEach(tour => {
      tour.steps.forEach(step => {
        expect(step.targetElement).toBeDefined();
        expect(step.targetElement).toMatch(/^\[data-demo=".+"\]$/);
        expect(step.duration).toBeGreaterThan(0);
        expect(step.description).toBeDefined();
        expect(step.description.length).toBeGreaterThan(10);
      });
    });
  });

  test('tour durations should match sum of step durations', () => {
    const tours = [
      DEMO_TOURS['nsw-esc-executive'],
      DEMO_TOURS['nsw-esc-technical'],
      DEMO_TOURS['nsw-esc-compliance'],
      DEMO_TOURS['northmore-gordon-overview'],
    ];

    tours.forEach(tour => {
      const stepDurationSum = tour.steps.reduce((sum, step) => sum + step.duration, 0);
      const tourDurationMinutes = tour.duration;
      const stepDurationMinutes = Math.round(stepDurationSum / 60);

      // Allow some variance for rounding
      expect(Math.abs(tourDurationMinutes - stepDurationMinutes)).toBeLessThanOrEqual(2);
    });
  });

  test('step data should be consistent with imported contexts', () => {
    // Check that step data references align with actual imported data
    const execTour = DEMO_TOURS['nsw-esc-executive'];

    const marketStep = execTour.steps.find(s => s.id === 'nsw-esc-market-overview');
    expect(marketStep?.data?.market_size?.ANNUAL_TRADING_VOLUME).toBe(200_000_000);

    const firmStep = execTour.steps.find(s => s.id === 'northmore-gordon-position');
    expect(firmStep?.data?.nsw_esc_market_share).toBe(0.12);
  });

  test('NSW ESC tour types should be included in DemoTourType', () => {
    // Verify that all new tour types are defined
    expect(DEMO_TOURS['nsw-esc-executive']).toBeDefined();
    expect(DEMO_TOURS['nsw-esc-technical']).toBeDefined();
    expect(DEMO_TOURS['nsw-esc-compliance']).toBeDefined();
    expect(DEMO_TOURS['northmore-gordon-overview']).toBeDefined();
  });

  test('all NSW ESC scenarios should be referenced in tours', () => {
    const allTourData = Object.values(DEMO_TOURS).flatMap(tour => tour.steps).map(step => step.data);

    // Executive scenario should be referenced
    const executiveScenario = allTourData.find(data =>
      data?.name === 'Large Portfolio ESC Acquisition'
    );
    expect(executiveScenario).toBeDefined();

    // Technical scenario should be referenced
    const technicalScenario = allTourData.find(data =>
      data?.name === 'API-Driven ESC Trading Integration'
    );
    expect(technicalScenario).toBeDefined();

    // Compliance scenario should be referenced
    const complianceScenario = allTourData.find(data =>
      data?.name === 'High-Risk Certificate Due Diligence'
    );
    expect(complianceScenario).toBeDefined();
  });
});

describe('NSW ESC Context Integration Validation', () => {
  test('tour step data should reference correct ESC market values', () => {
    const execTour = DEMO_TOURS['nsw-esc-executive'];

    // Market overview step should have correct market size data
    const marketStep = execTour.steps.find(s => s.id === 'nsw-esc-market-overview');
    expect(marketStep?.data?.market_size).toEqual(NSW_ESC_MARKET_CONTEXT.MARKET_SIZE);

    // Pricing step should reference live pricing
    const pricingStep = execTour.steps.find(s => s.id === 'live-esc-pricing');
    expect(pricingStep?.data?.SPOT_PRICE).toBe(47.80);
  });

  test('tour step data should include Northmore Gordon context', () => {
    const firmTour = DEMO_TOURS['northmore-gordon-overview'];

    // Firm profile step should have correct firm data
    const profileStep = firmTour.steps.find(s => s.id === 'firm-profile-overview');
    expect(profileStep?.data).toEqual(NORTHMORE_GORDON_CONTEXT.FIRM_PROFILE);

    // Market position step should have correct positioning data
    const positionStep = firmTour.steps.find(s => s.id === 'market-position-analysis');
    expect(positionStep?.data).toEqual(NORTHMORE_GORDON_CONTEXT.MARKET_POSITION);
  });

  test('tour outcomes should align with business objectives', () => {
    const escTours = [
      DEMO_TOURS['nsw-esc-executive'],
      DEMO_TOURS['nsw-esc-technical'],
      DEMO_TOURS['nsw-esc-compliance'],
    ];

    escTours.forEach(tour => {
      expect(tour.outcomes).toBeDefined();
      expect(tour.outcomes.length).toBeGreaterThan(0);
      const outcomesText = tour.outcomes.join(' ').toLowerCase();
      expect(
        outcomesText.includes('nsw esc') ||
        outcomesText.includes('compliance') ||
        outcomesText.includes('technical')
      ).toBe(true);
    });
  });
});