/**
 * ESG Impact Metrics - Test Suite
 *
 * Tests for ESG impact measurement, dashboard calculations, and reporting logic.
 * Covers impact metrics, compliance requirements, ROI calculations, and projections.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement D2: ESG Impact Dashboard Tests
 */

import {
  calculateESGDashboard,
  getInstitutionalESGRequirements,
  generateESGComplianceReport,
  calculateESGImpactROI,
  SAMPLE_ESG_METRICS,
  type ESGImpactMetric,
  type ESGCategory,
  type ReportingFramework,
  type InstitutionalESGRequirements
} from '@/lib/esg-impact-metrics';
import type { InvestorClassification } from '@/lib/types';

describe('ESG Impact Metrics', () => {
  describe('Sample Data Integrity', () => {
    test('sample ESG metrics have complete data structure', () => {
      expect(SAMPLE_ESG_METRICS.length).toBeGreaterThan(0);

      SAMPLE_ESG_METRICS.forEach(metric => {
        expect(metric).toHaveProperty('id');
        expect(metric).toHaveProperty('category');
        expect(metric).toHaveProperty('name');
        expect(metric).toHaveProperty('description');
        expect(metric).toHaveProperty('unit');
        expect(metric).toHaveProperty('value');
        expect(metric).toHaveProperty('baseline');
        expect(metric).toHaveProperty('target');
        expect(metric).toHaveProperty('trend');
        expect(metric).toHaveProperty('lastUpdated');
        expect(metric).toHaveProperty('verificationSource');
        expect(metric).toHaveProperty('confidenceLevel');

        // Validate data types and ranges
        expect(typeof metric.id).toBe('string');
        expect(typeof metric.name).toBe('string');
        expect(typeof metric.description).toBe('string');
        expect(typeof metric.value).toBe('number');
        expect(typeof metric.baseline).toBe('number');
        expect(typeof metric.target).toBe('number');
        expect(metric.value).toBeGreaterThanOrEqual(metric.baseline);
        expect(metric.target).toBeGreaterThan(metric.baseline);
        expect(['improving', 'stable', 'declining']).toContain(metric.trend);
        expect(['high', 'medium', 'low']).toContain(metric.confidenceLevel);
        expect(metric.lastUpdated).toBeInstanceOf(Date);
      });
    });

    test('metrics cover all major ESG categories', () => {
      // First check that we have sample data
      expect(SAMPLE_ESG_METRICS.length).toBeGreaterThan(0);

      // Check that we have metrics from different categories
      const carbonMetrics = SAMPLE_ESG_METRICS.filter(m => m.category === 'carbon_reduction');
      const biodiversityMetrics = SAMPLE_ESG_METRICS.filter(m => m.category === 'biodiversity_protection');
      const socialMetrics = SAMPLE_ESG_METRICS.filter(m => m.category === 'social_impact');
      const governanceMetrics = SAMPLE_ESG_METRICS.filter(m => m.category === 'governance_improvement');

      expect(carbonMetrics.length).toBeGreaterThan(0);
      expect(biodiversityMetrics.length).toBeGreaterThan(0);
      expect(socialMetrics.length).toBeGreaterThan(0);
      expect(governanceMetrics.length).toBeGreaterThan(0);
    });

    test('metric units are appropriate for categories', () => {
      const categoryUnitMap: Record<ESGCategory, string[]> = {
        carbon_reduction: ['tonnes_co2'],
        biodiversity_protection: ['hectares_protected'],
        water_conservation: ['litres_water_saved'],
        social_impact: ['people_benefited', 'jobs_created'],
        governance_improvement: ['sdg_score'],
        sustainable_development: ['sdg_score', 'people_benefited']
      };

      SAMPLE_ESG_METRICS.forEach(metric => {
        const expectedUnits = categoryUnitMap[metric.category];
        expect(expectedUnits).toContain(metric.unit);
      });
    });
  });

  describe('calculateESGDashboard', () => {
    test('calculates dashboard data correctly', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);

      expect(dashboard).toHaveProperty('portfolioOverview');
      expect(dashboard).toHaveProperty('categoryBreakdown');
      expect(dashboard).toHaveProperty('certificationStatus');
      expect(dashboard).toHaveProperty('impactProjections');

      // Portfolio overview should have all required fields
      expect(dashboard.portfolioOverview).toHaveProperty('totalImpactScore');
      expect(dashboard.portfolioOverview).toHaveProperty('carbonFootprintReduction');
      expect(dashboard.portfolioOverview).toHaveProperty('biodiversityImpactScore');
      expect(dashboard.portfolioOverview).toHaveProperty('socialImpactScore');
      expect(dashboard.portfolioOverview).toHaveProperty('governanceScore');
      expect(dashboard.portfolioOverview).toHaveProperty('lastCalculated');

      // Scores should be in valid ranges
      expect(dashboard.portfolioOverview.totalImpactScore).toBeGreaterThanOrEqual(0);
      expect(dashboard.portfolioOverview.totalImpactScore).toBeLessThanOrEqual(10);
      expect(dashboard.portfolioOverview.carbonFootprintReduction).toBeGreaterThan(0);
    });

    test('category breakdown includes all categories', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);

      const expectedCategories: ESGCategory[] = [
        'carbon_reduction',
        'biodiversity_protection',
        'water_conservation',
        'social_impact',
        'governance_improvement',
        'sustainable_development'
      ];

      expectedCategories.forEach(category => {
        expect(dashboard.categoryBreakdown).toHaveProperty(category);
        expect(dashboard.categoryBreakdown[category]).toHaveProperty('score');
        expect(dashboard.categoryBreakdown[category]).toHaveProperty('metrics');
        expect(dashboard.categoryBreakdown[category]).toHaveProperty('monthlyTrend');
        expect(dashboard.categoryBreakdown[category]).toHaveProperty('targetProgress');

        // Scores should be valid
        const categoryData = dashboard.categoryBreakdown[category];
        expect(categoryData.score).toBeGreaterThanOrEqual(0);
        expect(categoryData.score).toBeLessThanOrEqual(10);
        expect(categoryData.targetProgress).toBeGreaterThanOrEqual(0);
        expect(categoryData.targetProgress).toBeLessThanOrEqual(100);

        // Monthly trend should have 12 data points
        expect(categoryData.monthlyTrend).toHaveLength(12);
        categoryData.monthlyTrend.forEach(value => {
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThanOrEqual(0);
        });
      });
    });

    test('certification status is calculated correctly', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);
      const { certificationStatus } = dashboard;

      expect(certificationStatus.verifiedCredits).toBeGreaterThan(0);
      expect(certificationStatus.pendingVerification).toBeGreaterThan(0);
      expect(certificationStatus.totalCredits).toBe(
        certificationStatus.verifiedCredits + certificationStatus.pendingVerification
      );
      expect(certificationStatus.verificationRate).toBeGreaterThan(0);
      expect(certificationStatus.verificationRate).toBeLessThanOrEqual(1);
      expect(certificationStatus.certificationBodies.length).toBeGreaterThan(0);
    });

    test('impact projections cover multiple timeframes', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);
      const { impactProjections } = dashboard;

      const expectedTimeframes = ['1month', '3months', '6months', '1year'];
      expect(impactProjections).toHaveLength(expectedTimeframes.length);

      impactProjections.forEach((projection, index) => {
        expect(projection.timeline).toBe(expectedTimeframes[index]);
        expect(projection.projectedCarbonReduction).toBeGreaterThan(0);
        expect(projection.projectedBiodiversityGain).toBeGreaterThan(0);
        expect(projection.projectedSocialBenefit).toBeGreaterThan(0);
        expect(projection.confidenceInterval).toHaveLength(2);
        expect(projection.confidenceInterval[0]).toBeLessThan(projection.confidenceInterval[1]);
      });

      // Longer timeframes should have higher projections
      for (let i = 1; i < impactProjections.length; i++) {
        expect(impactProjections[i].projectedCarbonReduction).toBeGreaterThanOrEqual(
          impactProjections[i - 1].projectedCarbonReduction
        );
      }
    });

    test('handles empty metrics gracefully', () => {
      const dashboard = calculateESGDashboard([]);

      expect(dashboard.portfolioOverview.totalImpactScore).toBe(0);
      expect(dashboard.portfolioOverview.carbonFootprintReduction).toBe(0);
      expect(dashboard.certificationStatus.totalCredits).toBe(0);
      expect(dashboard.impactProjections).toHaveLength(4);
    });
  });

  describe('getInstitutionalESGRequirements', () => {
    test('returns requirements for all investor classifications', () => {
      const classifications: InvestorClassification[] = ['retail', 'wholesale', 'sophisticated', 'professional'];

      classifications.forEach(classification => {
        const requirements = getInstitutionalESGRequirements(classification);

        expect(requirements.classification).toBe(classification);
        expect(requirements.mandatoryFrameworks.length).toBeGreaterThan(0);
        expect(requirements.requiredMetrics.length).toBeGreaterThan(0);
        expect(['daily', 'weekly', 'monthly', 'quarterly']).toContain(requirements.reportingFrequency);
        expect(['internal', 'external', 'both']).toContain(requirements.auditRequirements);
        expect(typeof requirements.stakeholderDisclosure).toBe('boolean');
      });
    });

    test('sophisticated investors have most stringent requirements', () => {
      const sophisticatedReq = getInstitutionalESGRequirements('sophisticated');
      const retailReq = getInstitutionalESGRequirements('retail');

      expect(sophisticatedReq.mandatoryFrameworks.length).toBeGreaterThanOrEqual(retailReq.mandatoryFrameworks.length);
      expect(sophisticatedReq.requiredMetrics.length).toBeGreaterThanOrEqual(retailReq.requiredMetrics.length);
    });

    test('professional classification has comprehensive requirements', () => {
      const professionalReq = getInstitutionalESGRequirements('professional');

      expect(professionalReq.mandatoryFrameworks).toContain('TCFD');
      expect(professionalReq.mandatoryFrameworks).toContain('EU_TAXONOMY');
      expect(professionalReq.mandatoryFrameworks).toContain('CSRD');
      expect(professionalReq.requiredMetrics).toContain('carbon_reduction');
      expect(professionalReq.reportingFrequency).toBe('monthly');
      expect(professionalReq.auditRequirements).toBe('both');
      expect(professionalReq.stakeholderDisclosure).toBe(true);
    });
  });

  describe('generateESGComplianceReport', () => {
    test('generates compliance report for all frameworks', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);
      const requirements = getInstitutionalESGRequirements('sophisticated');
      const frameworks: ReportingFramework[] = ['TCFD', 'SASB', 'GRI', 'UN_SDG', 'EU_TAXONOMY', 'CSRD', 'ISSB'];

      frameworks.forEach(framework => {
        const report = generateESGComplianceReport(framework, dashboard, requirements);

        expect(report.framework).toBe(framework);
        expect(report.complianceScore).toBeGreaterThanOrEqual(0);
        expect(report.complianceScore).toBeLessThanOrEqual(100);
        expect(report.requiredDisclosures.length).toBeGreaterThan(0);
        expect(Array.isArray(report.completedDisclosures)).toBe(true);
        expect(Array.isArray(report.gaps)).toBe(true);
        expect(Array.isArray(report.recommendations)).toBe(true);

        // Completed + gaps should equal required disclosures
        expect(report.completedDisclosures.length + report.gaps.length).toBe(report.requiredDisclosures.length);

        // Compliance score should reflect completion rate
        const expectedScore = Math.round((report.completedDisclosures.length / report.requiredDisclosures.length) * 100);
        expect(report.complianceScore).toBe(expectedScore);
      });
    });

    test('TCFD framework has climate-specific requirements', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);
      const requirements = getInstitutionalESGRequirements('professional');
      const report = generateESGComplianceReport('TCFD', dashboard, requirements);

      const tcfdRequirements = report.requiredDisclosures.join(' ').toLowerCase();
      expect(tcfdRequirements).toMatch(/climate|risk|carbon|transition/);
    });

    test('UN_SDG framework focuses on sustainable development', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);
      const requirements = getInstitutionalESGRequirements('wholesale');
      const report = generateESGComplianceReport('UN_SDG', dashboard, requirements);

      const sdgRequirements = report.requiredDisclosures.join(' ').toLowerCase();
      expect(sdgRequirements).toMatch(/sdg|target|impact|progress/);
    });

    test('generates appropriate recommendations based on gaps', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);
      const requirements = getInstitutionalESGRequirements('sophisticated');
      const report = generateESGComplianceReport('SASB', dashboard, requirements);

      report.recommendations.forEach(recommendation => {
        expect(recommendation.toLowerCase()).toMatch(/enhance|improve|sasb/);
      });

      // Should have recommendations for each gap
      expect(report.recommendations.length).toBe(report.gaps.length);
    });
  });

  describe('calculateESGImpactROI', () => {
    test('calculates ROI metrics correctly', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);
      const investmentAmount = 1000000;
      const roi = calculateESGImpactROI(dashboard, investmentAmount);

      expect(roi).toHaveProperty('impactROI');
      expect(roi).toHaveProperty('carbonPrice');
      expect(roi).toHaveProperty('socialValueGenerated');
      expect(roi).toHaveProperty('reputationalValue');
      expect(roi).toHaveProperty('totalESGValue');
      expect(roi).toHaveProperty('paybackPeriodMonths');

      // Values should be realistic
      expect(roi.carbonPrice).toBeGreaterThan(0);
      expect(roi.socialValueGenerated).toBeGreaterThanOrEqual(0);
      expect(roi.reputationalValue).toBeGreaterThan(0);
      expect(roi.totalESGValue).toBeGreaterThan(0);
      expect(roi.paybackPeriodMonths).toBeGreaterThan(0);

      // Impact ROI calculation
      const expectedROI = ((roi.totalESGValue - investmentAmount) / investmentAmount) * 100;
      expect(roi.impactROI).toBeCloseTo(expectedROI, 2);
    });

    test('carbon value scales with carbon footprint reduction', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);
      const roi1M = calculateESGImpactROI(dashboard, 1000000);
      const roi2M = calculateESGImpactROI(dashboard, 2000000);

      // Carbon value should be the same regardless of investment amount
      const carbonValue1M = dashboard.portfolioOverview.carbonFootprintReduction * roi1M.carbonPrice;
      const carbonValue2M = dashboard.portfolioOverview.carbonFootprintReduction * roi2M.carbonPrice;
      expect(carbonValue1M).toBe(carbonValue2M);

      // Reputational value should scale with investment
      expect(roi2M.reputationalValue).toBeCloseTo(roi1M.reputationalValue * 2, -2);
    });

    test('payback period is inversely related to total ESG value', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);
      const investmentAmount = 500000;
      const roi = calculateESGImpactROI(dashboard, investmentAmount);

      const monthlyValue = roi.totalESGValue / 12;
      const expectedPayback = Math.ceil(investmentAmount / monthlyValue);
      expect(roi.paybackPeriodMonths).toBe(expectedPayback);
    });

    test('handles zero carbon footprint gracefully', () => {
      const emptyDashboard = calculateESGDashboard([]);
      const roi = calculateESGImpactROI(emptyDashboard, 1000000);

      expect(roi.impactROI).toBeLessThan(0); // Negative ROI expected with no impact
      expect(roi.totalESGValue).toBeGreaterThan(0); // Still has reputational value
      expect(roi.paybackPeriodMonths).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Integration', () => {
    test('dashboard calculation is deterministic', () => {
      const dashboard1 = calculateESGDashboard(SAMPLE_ESG_METRICS);
      const dashboard2 = calculateESGDashboard(SAMPLE_ESG_METRICS);

      expect(dashboard1.portfolioOverview.totalImpactScore).toBe(
        dashboard2.portfolioOverview.totalImpactScore
      );
      expect(dashboard1.portfolioOverview.carbonFootprintReduction).toBe(
        dashboard2.portfolioOverview.carbonFootprintReduction
      );
    });

    test('metric filtering by category works correctly', () => {
      const carbonMetrics = SAMPLE_ESG_METRICS.filter(m => m.category === 'carbon_reduction');
      const socialMetrics = SAMPLE_ESG_METRICS.filter(m => m.category === 'social_impact');

      expect(carbonMetrics.length).toBeGreaterThan(0);
      expect(socialMetrics.length).toBeGreaterThan(0);

      carbonMetrics.forEach(metric => {
        expect(metric.category).toBe('carbon_reduction');
        expect(metric.unit).toBe('tonnes_co2');
      });
    });

    test('compliance requirements validation', () => {
      const allClassifications: InvestorClassification[] = ['retail', 'wholesale', 'sophisticated', 'professional'];

      allClassifications.forEach(classification => {
        const requirements = getInstitutionalESGRequirements(classification);
        const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);

        requirements.mandatoryFrameworks.forEach(framework => {
          const report = generateESGComplianceReport(framework, dashboard, requirements);
          expect(report.complianceScore).toBeGreaterThanOrEqual(0);
          expect(report.complianceScore).toBeLessThanOrEqual(100);
        });
      });
    });

    test('impact projections maintain logical progression', () => {
      const dashboard = calculateESGDashboard(SAMPLE_ESG_METRICS);
      const { impactProjections } = dashboard;

      // Each subsequent timeframe should have equal or higher projections
      for (let i = 1; i < impactProjections.length; i++) {
        const current = impactProjections[i];
        const previous = impactProjections[i - 1];

        expect(current.projectedCarbonReduction).toBeGreaterThanOrEqual(previous.projectedCarbonReduction);
        expect(current.projectedBiodiversityGain).toBeGreaterThanOrEqual(previous.projectedBiodiversityGain);
        expect(current.projectedSocialBenefit).toBeGreaterThanOrEqual(previous.projectedSocialBenefit);

        // Confidence intervals should generally widen over time
        const currentWidth = current.confidenceInterval[1] - current.confidenceInterval[0];
        const previousWidth = previous.confidenceInterval[1] - previous.confidenceInterval[0];
        expect(currentWidth).toBeGreaterThanOrEqual(previousWidth);
      }
    });

    test('ROI calculation handles extreme values', () => {
      const highImpactMetrics: ESGImpactMetric[] = SAMPLE_ESG_METRICS.map(metric => ({
        ...metric,
        value: metric.target * 2 // Double the target values
      }));

      const dashboard = calculateESGDashboard(highImpactMetrics);
      const roi = calculateESGImpactROI(dashboard, 1000000);

      expect(roi.impactROI).toBeGreaterThan(0); // Should be profitable
      expect(roi.totalESGValue).toBeGreaterThan(1000000); // Should exceed investment
      expect(roi.paybackPeriodMonths).toBeLessThan(60); // Reasonable payback period
    });
  });
});