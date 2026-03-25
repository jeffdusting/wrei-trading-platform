/**
 * WREI Institutional Dashboard Simple Tests
 *
 * Simplified testing for institutional dashboard functionality
 * with basic component validation and integration checks.
 *
 * Phase 6.1: Professional UI/UX Enhancement
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InstitutionalDashboard from '@/components/InstitutionalDashboard';

// Comprehensive mocking for all dependencies
jest.mock('@/lib/market-intelligence', () => ({
  marketIntelligenceSystem: {
    getTokenizedRWAMarketContext: () => ({
      totalMarketValue: 19_000_000_000,
      growthRate: 1.4,
      treasuryTokenSegment: 9_000_000_000,
      institutionalAdoption: 0.73
    }),
    getCarbonMarketProjections: () => ({
      projected2030Value: 155_000_000_000,
      cagr: 0.26
    }),
    getWREICompetitiveAdvantages: () => ({
      yieldPremium: 0.23,
      verificationIntegrity: true,
      institutionalGrade: true
    })
  }
}));

jest.mock('@/lib/financial-calculations', () => ({
  calculateCarbonCreditMetrics: () => ({}),
  calculateAssetCoMetrics: () => ({}),
  calculateDualPortfolioMetrics: () => ({}),
  formatFinancialMetrics: () => ({}),
  WREI_FINANCIAL_CONSTANTS: {
    CARBON_PRICE_PER_TONNE: 150,
    ASSET_CO_YIELD: 0.283,
    BASE_PORTFOLIO_SIZE: 100_000_000
  }
}));

jest.mock('@/lib/yield-models', () => ({
  WREI_YIELD_MODELS: {
    CARBON_CREDITS: {
      REVENUE_SHARE: 0.08,
      NAV_ACCRUING: 0.12
    },
    ASSET_CO: {
      REVENUE_SHARE: 0.283,
      NAV_ACCRUING: 0.283
    },
    DUAL_PORTFOLIO: {
      REVENUE_SHARE: 0.185,
      NAV_ACCRUING: 0.185
    }
  },
  calculateAnnualYield: () => 0.185
}));

jest.mock('@/lib/negotiation-config', () => ({
  WREI_TOKEN_CONFIG: {
    CARBON_CREDITS: {
      price: 150,
      yield: 0.08
    },
    ASSET_CO: {
      price: 1000,
      yield: 0.283
    },
    DUAL_PORTFOLIO: {
      price: 500,
      yield: 0.185
    }
  }
}));

jest.mock('@/lib/risk-profiles', () => ({
  generateRiskReport: () => ({
    volatility: 15.0,
    sharpeRatio: 1.2,
    riskGrade: 'BBB+',
    correlation: {
      carbon: 0.3,
      traditional: 0.1,
      crypto: 0.4
    }
  }),
  calculateRiskMetrics: () => ({
    portfolioVolatility: 15.0,
    sharpeRatio: 1.2,
    maxDrawdown: 0.08
  })
}));

jest.mock('@/lib/types', () => ({
  // Mock types as needed for TypeScript compatibility
}));

describe('InstitutionalDashboard - Simple Integration Tests', () => {
  const baseProps = {
    investorProfile: {
      type: 'infrastructure_fund' as const,
      aum: 50_000_000_000,
      riskTolerance: 'moderate' as const,
      yieldRequirement: 0.12
    },
    portfolioSize: 100_000_000,
    timeHorizon: 5
  };

  describe('Basic Component Rendering', () => {
    test('dashboard renders without crashing', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      // Use getAllByText for text that appears multiple times
      const dashboardTitles = screen.getAllByText('WREI Institutional Dashboard');
      expect(dashboardTitles.length).toBeGreaterThan(0);
    });

    test('displays investor profile type correctly', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));
      expect(screen.getByText(/infrastructure fund/i)).toBeInTheDocument();
    });

    test('shows portfolio size in header', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));
      expect(screen.getByText(/Portfolio: A\$100\.0M/)).toBeInTheDocument();
    });

    test('displays AUM in header', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));
      expect(screen.getByText(/AUM: A\$50\.0B/)).toBeInTheDocument();
    });
  });

  describe('Tab Navigation Structure', () => {
    test('renders all three main tabs', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      // Use role-based selectors for tab buttons
      const portfolioTab = screen.getByRole('button', { name: /📊 Portfolio Overview/ });
      const yieldTab = screen.getByRole('button', { name: /💰 Yield Mechanisms/ });
      const collateralTab = screen.getByRole('button', { name: /🔗 Cross-Collateral/ });

      expect(portfolioTab).toBeInTheDocument();
      expect(yieldTab).toBeInTheDocument();
      expect(collateralTab).toBeInTheDocument();
    });

    test('default tab shows portfolio overview content', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      // Use getAllByText for text that appears multiple times
      const portfolioOverviewElements = screen.getAllByText('Portfolio Overview');
      expect(portfolioOverviewElements.length).toBeGreaterThan(0);

      expect(screen.getByText('Total Value')).toBeInTheDocument();
      expect(screen.getByText('Current Yield')).toBeInTheDocument();
    });
  });

  describe('Financial Metrics Display', () => {
    test('shows portfolio value metrics', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      expect(screen.getByText('Total Value')).toBeInTheDocument();
      expect(screen.getByText('Current Yield')).toBeInTheDocument();
      expect(screen.getByText('Diversification')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Risk')).toBeInTheDocument();
    });

    test('displays token holding sections', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      expect(screen.getByText('Token Holdings')).toBeInTheDocument();

      // Use getAllByText for token names that appear multiple times
      const carbonCreditElements = screen.getAllByText('Carbon Credits');
      const assetCoElements = screen.getAllByText('Asset Co Tokens');
      const dualPortfolioElements = screen.getAllByText('Dual Portfolio');

      expect(carbonCreditElements.length).toBeGreaterThan(0);
      expect(assetCoElements.length).toBeGreaterThan(0);
      expect(dualPortfolioElements.length).toBeGreaterThan(0);
    });
  });

  describe('Market Intelligence Panel', () => {
    test('renders market intelligence section', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      expect(screen.getByText('Market Intelligence')).toBeInTheDocument();
      expect(screen.getByText('RWA Market')).toBeInTheDocument();
      expect(screen.getByText('Carbon Market 2030')).toBeInTheDocument();
      expect(screen.getByText('WREI Premium')).toBeInTheDocument();
    });

    test('shows competitive advantages', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      expect(screen.getByText('Competitive Advantages')).toBeInTheDocument();
      expect(screen.getByText('Native Digital Credits')).toBeInTheDocument();
      expect(screen.getByText('Asset-Backed Yield')).toBeInTheDocument();

      // Use getAllByText for text that appears multiple times
      const crossCollateralElements = screen.getAllByText('Cross-Collateral');
      expect(crossCollateralElements.length).toBeGreaterThan(0);

      expect(screen.getByText('Regulatory Clarity')).toBeInTheDocument();
    });
  });

  describe('Risk Assessment Panel', () => {
    test('displays risk assessment section', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Volatility')).toBeInTheDocument();
      expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
      expect(screen.getByText('Regulatory Risk')).toBeInTheDocument();
      expect(screen.getByText('Liquidity Risk')).toBeInTheDocument();
    });
  });

  describe('Different Investor Profile Types', () => {
    test('renders correctly for ESG impact investor', () => {
      const esgProps = {
        ...baseProps,
        investorProfile: {
          type: 'esg_impact' as const,
          aum: 25_000_000_000,
          riskTolerance: 'aggressive' as const,
          yieldRequirement: 0.15
        }
      };

      render(React.createElement(InstitutionalDashboard, esgProps));
      const esgElements = screen.getAllByText(/esg impact/i);
      expect(esgElements.length).toBeGreaterThan(0);
    });

    test('renders correctly for DeFi yield farmer', () => {
      const defiProps = {
        ...baseProps,
        investorProfile: {
          type: 'defi_farmer' as const,
          aum: 10_000_000_000,
          riskTolerance: 'aggressive' as const,
          yieldRequirement: 0.20
        }
      };

      render(React.createElement(InstitutionalDashboard, defiProps));
      expect(screen.getByText(/defi farmer/i)).toBeInTheDocument();
    });

    test('renders correctly for family office', () => {
      const familyProps = {
        ...baseProps,
        investorProfile: {
          type: 'family_office' as const,
          aum: 5_000_000_000,
          riskTolerance: 'conservative' as const,
          yieldRequirement: 0.10
        }
      };

      render(React.createElement(InstitutionalDashboard, familyProps));
      expect(screen.getByText(/family office/i)).toBeInTheDocument();
    });

    test('renders correctly for sovereign wealth fund', () => {
      const sovereignProps = {
        ...baseProps,
        investorProfile: {
          type: 'sovereign_wealth' as const,
          aum: 300_000_000_000,
          riskTolerance: 'moderate' as const,
          yieldRequirement: 0.08
        }
      };

      render(React.createElement(InstitutionalDashboard, sovereignProps));
      expect(screen.getByText(/sovereign wealth/i)).toBeInTheDocument();
    });

    test('renders correctly for pension fund', () => {
      const pensionProps = {
        ...baseProps,
        investorProfile: {
          type: 'pension_fund' as const,
          aum: 100_000_000_000,
          riskTolerance: 'conservative' as const,
          yieldRequirement: 0.07
        }
      };

      render(React.createElement(InstitutionalDashboard, pensionProps));
      expect(screen.getByText(/pension fund/i)).toBeInTheDocument();
    });
  });

  describe('Portfolio Size Variations', () => {
    test('handles small portfolio size (A$10M)', () => {
      const smallProps = {
        ...baseProps,
        portfolioSize: 10_000_000
      };

      render(React.createElement(InstitutionalDashboard, smallProps));
      expect(screen.getByText(/Portfolio: A\$10\.0M/)).toBeInTheDocument();
    });

    test('handles large portfolio size (A$1B)', () => {
      const largeProps = {
        ...baseProps,
        portfolioSize: 1_000_000_000
      };

      render(React.createElement(InstitutionalDashboard, largeProps));
      expect(screen.getByText(/Portfolio: A\$1000\.0M/)).toBeInTheDocument();
    });
  });

  describe('Dashboard Footer', () => {
    test('displays institutional compliance footer', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      expect(screen.getByText(/Australian AFSL Compliant/)).toBeInTheDocument();
      expect(screen.getByText(/Professional Investor Use Only/)).toBeInTheDocument();
    });

    test('shows real-time data indicator', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      expect(screen.getByText(/Real-time data/)).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    test('dashboard integrates with market intelligence', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      // Verify market intelligence data is displayed
      expect(screen.getByText('A$19B')).toBeInTheDocument();
      expect(screen.getByText('A$155B')).toBeInTheDocument();

      // Use getAllByText for elements that appear multiple times
      const premiumElements = screen.getAllByText('+23%');
      expect(premiumElements.length).toBeGreaterThan(0);
    });

    test('dashboard integrates with risk assessment', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      // Verify risk data is displayed - use getAllByText for elements that appear multiple times
      const volatilityElements = screen.getAllByText(/15\.0%/);
      expect(volatilityElements.length).toBeGreaterThan(0);

      const sharpeElements = screen.getAllByText(/1\.2/);
      expect(sharpeElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/BBB\+/)).toBeInTheDocument();
    });

    test('dashboard displays token pricing correctly', () => {
      render(React.createElement(InstitutionalDashboard, baseProps));

      expect(screen.getByText(/A\$150\/tonne/)).toBeInTheDocument();
      expect(screen.getByText(/28\.3% yield/)).toBeInTheDocument();
      expect(screen.getByText(/18\.5% blended yield/)).toBeInTheDocument();
    });
  });
});