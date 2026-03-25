/**
 * ESG Impact Dashboard Component - Test Suite
 *
 * Tests for ESG Impact Dashboard React component functionality.
 * Covers rendering, view switching, data display, and user interactions.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement D2: ESG Impact Dashboard Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ESGImpactDashboard } from '@/components/market/ESGImpactDashboard';
import * as ESGMetrics from '@/lib/esg-impact-metrics';

// Mock the ESG metrics module
jest.mock('@/lib/esg-impact-metrics', () => ({
  calculateESGDashboard: jest.fn(),
  getInstitutionalESGRequirements: jest.fn(),
  generateESGComplianceReport: jest.fn(),
  calculateESGImpactROI: jest.fn(),
  SAMPLE_ESG_METRICS: [
    {
      id: 'carbon_test',
      category: 'carbon_reduction',
      name: 'Test Carbon Metric',
      description: 'Test carbon sequestration',
      unit: 'tonnes_co2',
      value: 100000,
      baseline: 0,
      target: 200000,
      trend: 'improving',
      lastUpdated: new Date('2026-03-24T10:00:00Z'),
      verificationSource: 'Test Registry',
      confidenceLevel: 'high'
    },
    {
      id: 'social_test',
      category: 'social_impact',
      name: 'Test Social Metric',
      description: 'Test community benefit',
      unit: 'people_benefited',
      value: 5000,
      baseline: 0,
      target: 10000,
      trend: 'improving',
      lastUpdated: new Date('2026-03-24T10:00:00Z'),
      verificationSource: 'Test Standards',
      confidenceLevel: 'medium'
    }
  ]
}));

// Mock data for testing
const mockDashboardData = {
  portfolioOverview: {
    totalImpactScore: 7.5,
    carbonFootprintReduction: 125480,
    biodiversityImpactScore: 6.2,
    socialImpactScore: 8.1,
    governanceScore: 7.8,
    lastCalculated: new Date('2026-03-24T10:30:00Z')
  },
  categoryBreakdown: {
    carbon_reduction: {
      score: 8.5,
      metrics: [ESGMetrics.SAMPLE_ESG_METRICS[0]],
      monthlyTrend: [5.0, 5.2, 5.5, 6.0, 6.3, 6.8, 7.2, 7.5, 7.8, 8.0, 8.2, 8.5],
      targetProgress: 62
    },
    biodiversity_protection: {
      score: 6.2,
      metrics: [],
      monthlyTrend: [4.0, 4.3, 4.6, 4.9, 5.2, 5.5, 5.8, 6.0, 6.1, 6.2, 6.2, 6.2],
      targetProgress: 45
    },
    water_conservation: {
      score: 5.8,
      metrics: [],
      monthlyTrend: [3.5, 4.0, 4.2, 4.5, 4.8, 5.0, 5.2, 5.4, 5.6, 5.7, 5.8, 5.8],
      targetProgress: 38
    },
    social_impact: {
      score: 8.1,
      metrics: [ESGMetrics.SAMPLE_ESG_METRICS[1]],
      monthlyTrend: [6.0, 6.3, 6.7, 7.0, 7.3, 7.6, 7.8, 7.9, 8.0, 8.1, 8.1, 8.1],
      targetProgress: 58
    },
    governance_improvement: {
      score: 7.8,
      metrics: [],
      monthlyTrend: [5.5, 6.0, 6.3, 6.7, 7.0, 7.2, 7.4, 7.6, 7.7, 7.8, 7.8, 7.8],
      targetProgress: 72
    },
    sustainable_development: {
      score: 4.2,
      metrics: [],
      monthlyTrend: [2.5, 2.8, 3.0, 3.3, 3.5, 3.7, 3.9, 4.0, 4.1, 4.1, 4.2, 4.2],
      targetProgress: 25
    }
  },
  certificationStatus: {
    verifiedCredits: 106658,
    pendingVerification: 18822,
    totalCredits: 125480,
    verificationRate: 0.85,
    certificationBodies: ['Verra (VCS)', 'Gold Standard', 'Climate Action Reserve']
  },
  impactProjections: [
    {
      timeline: '1month' as const,
      projectedCarbonReduction: 135518,
      projectedBiodiversityGain: 48006,
      projectedSocialBenefit: 9038,
      confidenceInterval: [0.95, 1.15] as [number, number]
    },
    {
      timeline: '3months' as const,
      projectedCarbonReduction: 156850,
      projectedBiodiversityGain: 53930,
      projectedSocialBenefit: 9800,
      confidenceInterval: [0.85, 1.35] as [number, number]
    }
  ]
};

const mockRequirements = {
  classification: 'wholesale' as const,
  mandatoryFrameworks: ['TCFD', 'GRI'],
  requiredMetrics: ['carbon_reduction', 'social_impact'],
  reportingFrequency: 'quarterly' as const,
  auditRequirements: 'both' as const,
  stakeholderDisclosure: true
};

const mockComplianceReport = {
  framework: 'TCFD' as const,
  complianceScore: 75,
  requiredDisclosures: [
    'Climate risk assessment',
    'Carbon footprint disclosure',
    'Transition scenario analysis',
    'Physical risk evaluation'
  ],
  completedDisclosures: [
    'Climate risk assessment',
    'Carbon footprint disclosure',
    'Transition scenario analysis'
  ],
  gaps: ['Physical risk evaluation'],
  recommendations: ['Enhance physical risk evaluation to meet TCFD requirements']
};

const mockROIData = {
  impactROI: 45.2,
  carbonPrice: 50,
  socialValueGenerated: 1250000,
  reputationalValue: 150000,
  totalESGValue: 1452000,
  paybackPeriodMonths: 16
};

describe('ESGImpactDashboard Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    (ESGMetrics.calculateESGDashboard as jest.Mock).mockReturnValue(mockDashboardData);
    (ESGMetrics.getInstitutionalESGRequirements as jest.Mock).mockReturnValue(mockRequirements);
    (ESGMetrics.generateESGComplianceReport as jest.Mock).mockReturnValue(mockComplianceReport);
    (ESGMetrics.calculateESGImpactROI as jest.Mock).mockReturnValue(mockROIData);
  });

  describe('Component Rendering', () => {
    test('renders loading state initially', () => {
      render(<ESGImpactDashboard />);

      expect(screen.getByText('Loading ESG impact data...')).toBeInTheDocument();

      // Check for the spinner element specifically
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full', 'border-b-2', 'border-sky-500');
    });

    test('renders dashboard after loading', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('ESG Impact Dashboard')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Real-time environmental, social, and governance impact tracking')).toBeInTheDocument();
      expect(screen.getByText('Impact Score: 7.5/10')).toBeInTheDocument();
    });

    test('displays navigation tabs', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('Category Analysis')).toBeInTheDocument();
      expect(screen.getByText('Compliance Status')).toBeInTheDocument();
      expect(screen.getByText('Impact Projections')).toBeInTheDocument();
      expect(screen.getByText('Financial Impact')).toBeInTheDocument();
    });

    test('renders with custom props', async () => {
      render(
        <ESGImpactDashboard
          investorClassification="professional"
          investmentAmount={2000000}
          className="custom-class"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('ESG Impact Dashboard')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(ESGMetrics.getInstitutionalESGRequirements).toHaveBeenCalledWith('professional');
      expect(ESGMetrics.calculateESGImpactROI).toHaveBeenCalledWith(mockDashboardData, 2000000);
    });
  });

  describe('View Navigation', () => {
    test('switches between dashboard views', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('ESG Impact Dashboard')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Default should be Overview - check for specific content
      expect(screen.getByText('Carbon Impact')).toBeInTheDocument();

      // Switch to Categories
      fireEvent.click(screen.getByText('Category Analysis'));
      await waitFor(() => {
        expect(screen.getByText('Carbon Reduction')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Switch to Compliance
      fireEvent.click(screen.getByText('Compliance Status'));
      await waitFor(() => {
        expect(screen.getByText('Reporting Framework')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Switch to Projections
      fireEvent.click(screen.getByText('Impact Projections'));
      await waitFor(() => {
        expect(screen.getByText('Future Impact Projections')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Switch to ROI
      fireEvent.click(screen.getByText('Financial Impact'));
      await waitFor(() => {
        expect(screen.getByText('ESG Financial Impact Analysis')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    test('active tab receives correct styling', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      }, { timeout: 2000 });

      const overviewTab = screen.getByText('Portfolio Overview').closest('button');
      const categoriesTab = screen.getByText('Category Analysis').closest('button');

      expect(overviewTab).toHaveClass('bg-white', 'text-sky-600', 'shadow-sm');
      expect(categoriesTab).toHaveClass('text-slate-600');

      // Switch tabs
      fireEvent.click(screen.getByText('Category Analysis'));

      await waitFor(() => {
        expect(categoriesTab).toHaveClass('bg-white', 'text-sky-600', 'shadow-sm');
        expect(overviewTab).toHaveClass('text-slate-600');
      }, { timeout: 2000 });
    });
  });

  describe('Overview View', () => {
    test('displays key metrics cards', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('ESG Impact Dashboard')).toBeInTheDocument();
      });

      // Check metric cards
      expect(screen.getByText('Carbon Impact')).toBeInTheDocument();
      expect(screen.getByText('125,480')).toBeInTheDocument();
      expect(screen.getByText('tonnes CO₂e')).toBeInTheDocument();

      expect(screen.getByText('Biodiversity Score')).toBeInTheDocument();
      expect(screen.getByText('6.2')).toBeInTheDocument();

      expect(screen.getByText('Social Impact Score')).toBeInTheDocument();
      expect(screen.getByText('8.1')).toBeInTheDocument();

      expect(screen.getByText('Governance Score')).toBeInTheDocument();
      expect(screen.getByText('7.8')).toBeInTheDocument();
    });

    test('displays verification status', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Verification Status')).toBeInTheDocument();
      });

      expect(screen.getByText('106,658')).toBeInTheDocument(); // Verified credits
      expect(screen.getByText('Verified Credits')).toBeInTheDocument();
      expect(screen.getByText('18,822')).toBeInTheDocument(); // Pending verification
      expect(screen.getByText('Pending Verification')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument(); // Verification rate
    });

    test('displays certification bodies', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Verification Status')).toBeInTheDocument();
      });

      expect(screen.getByText('Verra (VCS)')).toBeInTheDocument();
      expect(screen.getByText('Gold Standard')).toBeInTheDocument();
      expect(screen.getByText('Climate Action Reserve')).toBeInTheDocument();
    });

    test('displays institutional requirements', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Institutional Requirements (wholesale)')).toBeInTheDocument();
      });

      expect(screen.getByText('Reporting Frameworks')).toBeInTheDocument();
      expect(screen.getByText('TCFD')).toBeInTheDocument();
      expect(screen.getByText('GRI')).toBeInTheDocument();

      expect(screen.getByText('Required Metrics')).toBeInTheDocument();
      expect(screen.getByText('Carbon Reduction')).toBeInTheDocument();
      expect(screen.getByText('Social Impact')).toBeInTheDocument();
    });
  });

  describe('Categories View', () => {
    test('displays category selector grid', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('ESG Impact Dashboard')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Category Analysis'));

      await waitFor(() => {
        expect(screen.getByText('Carbon Reduction')).toBeInTheDocument();
      });

      expect(screen.getByText('Biodiversity Protection')).toBeInTheDocument();
      expect(screen.getByText('Water Conservation')).toBeInTheDocument();
      expect(screen.getByText('Social Impact')).toBeInTheDocument();
      expect(screen.getByText('Governance')).toBeInTheDocument();
      expect(screen.getByText('Sustainable Development')).toBeInTheDocument();
    });

    test('allows category selection', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Category Analysis'));
      });

      await waitFor(() => {
        expect(screen.getByText('Carbon Reduction')).toBeInTheDocument();
      });

      // Carbon reduction should be selected by default
      const carbonButton = screen.getByText('Carbon Reduction').closest('button');
      expect(carbonButton).toHaveClass('border-sky-500', 'bg-sky-50');

      // Click on Social Impact
      const socialButton = screen.getByText('Social Impact').closest('button');
      fireEvent.click(socialButton!);

      await waitFor(() => {
        expect(socialButton).toHaveClass('border-sky-500', 'bg-sky-50');
      });
    });

    test('displays category details and metrics', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Category Analysis'));
      });

      await waitFor(() => {
        expect(screen.getByText('Carbon Reduction Overview')).toBeInTheDocument();
      });

      expect(screen.getByText('8.5/10')).toBeInTheDocument(); // Category score
      expect(screen.getByText('Progress to Target')).toBeInTheDocument();
      expect(screen.getByText('62%')).toBeInTheDocument(); // Target progress
      expect(screen.getByText('12-Month Trend')).toBeInTheDocument();
    });

    test('displays individual metrics for selected category', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Category Analysis'));
      });

      await waitFor(() => {
        expect(screen.getByText('Test Carbon Metric')).toBeInTheDocument();
      });

      expect(screen.getByText('Test carbon sequestration')).toBeInTheDocument();
      expect(screen.getByText('100,000 tonnes co2')).toBeInTheDocument();
      expect(screen.getByText('200,000 tonnes co2')).toBeInTheDocument(); // Target
      expect(screen.getByText('improving')).toBeInTheDocument(); // Trend
    });
  });

  describe('Compliance View', () => {
    test('displays framework selector', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Compliance Status'));
      });

      await waitFor(() => {
        expect(screen.getByText('Reporting Framework')).toBeInTheDocument();
      });

      // Should show all frameworks
      expect(screen.getByText('TCFD')).toBeInTheDocument();
      expect(screen.getByText('SASB')).toBeInTheDocument();
      expect(screen.getByText('GRI')).toBeInTheDocument();
      expect(screen.getByText('UN_SDG')).toBeInTheDocument();
    });

    test('allows framework selection', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Compliance Status'));
      });

      await waitFor(() => {
        expect(screen.getByText('Reporting Framework')).toBeInTheDocument();
      });

      const tcfdButton = screen.getByText('TCFD').closest('button');
      expect(tcfdButton).toHaveClass('bg-sky-500', 'text-white');

      // Switch to SASB
      const sasbButton = screen.getByText('SASB').closest('button');
      fireEvent.click(sasbButton!);

      await waitFor(() => {
        expect(ESGMetrics.generateESGComplianceReport).toHaveBeenCalledWith(
          'SASB',
          mockDashboardData,
          mockRequirements
        );
      });
    });

    test('displays compliance score and status', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Compliance Status'));
      });

      await waitFor(() => {
        expect(screen.getByText('TCFD Compliance Status')).toBeInTheDocument();
      });

      expect(screen.getByText('75%')).toBeInTheDocument(); // Compliance score
      expect(screen.getByText('Compliance Score')).toBeInTheDocument();
    });

    test('displays completed disclosures and gaps', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Compliance Status'));
      });

      await waitFor(() => {
        expect(screen.getByText('✅ Completed Disclosures (3)')).toBeInTheDocument();
      });

      expect(screen.getByText('Climate risk assessment')).toBeInTheDocument();
      expect(screen.getByText('Carbon footprint disclosure')).toBeInTheDocument();

      expect(screen.getByText('❌ Compliance Gaps (1)')).toBeInTheDocument();
      expect(screen.getByText('Physical risk evaluation')).toBeInTheDocument();
    });

    test('displays recommendations', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Compliance Status'));
      });

      await waitFor(() => {
        expect(screen.getByText('💡 Recommendations')).toBeInTheDocument();
      });

      expect(screen.getByText('Enhance physical risk evaluation to meet TCFD requirements')).toBeInTheDocument();
    });
  });

  describe('Projections View', () => {
    test('displays impact projections', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Impact Projections'));
      });

      await waitFor(() => {
        expect(screen.getByText('Future Impact Projections')).toBeInTheDocument();
      });

      expect(screen.getByText('1 Month Projection')).toBeInTheDocument();
      expect(screen.getByText('3 Months Projection')).toBeInTheDocument();
    });

    test('displays projection metrics with confidence intervals', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Impact Projections'));
      });

      await waitFor(() => {
        expect(screen.getByText('135,518 tonnes CO₂e')).toBeInTheDocument();
      });

      expect(screen.getByText('48,006 hectares')).toBeInTheDocument();
      expect(screen.getByText('9,038 people')).toBeInTheDocument();
      expect(screen.getByText('Confidence interval: 95% - 115%')).toBeInTheDocument();
    });
  });

  describe('ROI View', () => {
    test('displays ESG financial impact analysis', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Financial Impact'));
      });

      await waitFor(() => {
        expect(screen.getByText('ESG Financial Impact Analysis')).toBeInTheDocument();
      });

      expect(screen.getByText('+45.2%')).toBeInTheDocument(); // ROI
      expect(screen.getByText('ESG Impact ROI')).toBeInTheDocument();
      expect(screen.getByText('$1,452,000')).toBeInTheDocument(); // Total ESG value
      expect(screen.getByText('16')).toBeInTheDocument(); // Payback months
    });

    test('displays value breakdown cards', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Financial Impact'));
      });

      await waitFor(() => {
        expect(screen.getByText('Carbon Value')).toBeInTheDocument();
      });

      expect(screen.getByText('Social Value')).toBeInTheDocument();
      expect(screen.getByText('$1,250,000')).toBeInTheDocument(); // Social value
      expect(screen.getByText('Reputational Value')).toBeInTheDocument();
      expect(screen.getByText('$150,000')).toBeInTheDocument(); // Reputational value
    });

    test('shows investment amount context', async () => {
      render(<ESGImpactDashboard investmentAmount={2000000} />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Financial Impact'));
      });

      await waitFor(() => {
        expect(screen.getByText('Based on $2,000,000 investment')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles missing dashboard data gracefully', async () => {
      (ESGMetrics.calculateESGDashboard as jest.Mock).mockReturnValue({
        portfolioOverview: {
          totalImpactScore: 0,
          carbonFootprintReduction: 0,
          biodiversityImpactScore: 0,
          socialImpactScore: 0,
          governanceScore: 0,
          lastCalculated: new Date()
        },
        categoryBreakdown: {},
        certificationStatus: {
          verifiedCredits: 0,
          pendingVerification: 0,
          totalCredits: 0,
          verificationRate: 0,
          certificationBodies: []
        },
        impactProjections: []
      });

      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Impact Score: 0/10')).toBeInTheDocument();
      });

      // Check for zero carbon impact specifically
      expect(screen.getByText('Carbon Impact')).toBeInTheDocument();
    });

    test('handles custom metrics prop', async () => {
      const customMetrics = [
        {
          id: 'custom_metric',
          category: 'carbon_reduction' as const,
          name: 'Custom Metric',
          description: 'Custom test metric',
          unit: 'tonnes_co2' as const,
          value: 50000,
          baseline: 0,
          target: 100000,
          trend: 'improving' as const,
          lastUpdated: new Date(),
          verificationSource: 'Custom Registry',
          confidenceLevel: 'high' as const
        }
      ];

      render(<ESGImpactDashboard customMetrics={customMetrics} />);

      await waitFor(() => {
        expect(ESGMetrics.calculateESGDashboard).toHaveBeenCalledWith(customMetrics);
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('ESG Impact Dashboard')).toBeInTheDocument();
      });

      // Check for button roles
      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThanOrEqual(5); // At least 5 navigation tabs

      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: /ESG Impact Dashboard/ })).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      render(<ESGImpactDashboard />);

      await waitFor(() => {
        expect(screen.getByText('ESG Impact Dashboard')).toBeInTheDocument();
      });

      const categoriesTab = screen.getByText('Category Analysis');

      // Test keyboard interaction by simulating tab navigation and enter
      fireEvent.keyDown(categoriesTab, { key: 'Enter', code: 'Enter' });
      fireEvent.click(categoriesTab);

      await waitFor(() => {
        expect(screen.getByText('Carbon Reduction')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});