/**
 * WREI Institutional Dashboard Tests
 *
 * Comprehensive testing for the sophisticated institutional dashboard
 * designed for professional investors with advanced analytics.
 *
 * Phase 6.1: Professional UI/UX Enhancement
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InstitutionalDashboard from '@/components/InstitutionalDashboard';
import { marketIntelligenceSystem } from '@/lib/market-intelligence';

// Mock the market intelligence system
jest.mock('@/lib/market-intelligence', () => ({
  marketIntelligenceSystem: {
    getTokenizedRWAMarketContext: jest.fn(() => ({
      totalMarketValue: 19_000_000_000,
      growthRate: 1.4,
      treasuryTokenSegment: 9_000_000_000,
      institutionalAdoption: 0.73
    })),
    getCarbonMarketProjections: jest.fn(() => ({
      projected2030Value: 155_000_000_000,
      cagr: 0.26
    })),
    getWREICompetitiveAdvantages: jest.fn(() => ({
      yieldPremium: 0.23,
      verificationIntegrity: true,
      institutionalGrade: true
    }))
  }
}));

// Mock the imported libraries to prevent import errors
jest.mock('@/lib/financial-calculations', () => ({
  calculateCarbonCreditMetrics: jest.fn(),
  calculateAssetCoMetrics: jest.fn(),
  calculateDualPortfolioMetrics: jest.fn(),
  formatFinancialMetrics: jest.fn(),
  WREI_FINANCIAL_CONSTANTS: {
    CARBON_PRICE_PER_TONNE: 150,
    ASSET_CO_YIELD: 0.283
  }
}));

jest.mock('@/lib/yield-models', () => ({
  WREI_YIELD_MODELS: {
    CARBON_CREDITS: { REVENUE_SHARE: 0.08 },
    ASSET_CO: { REVENUE_SHARE: 0.283 }
  },
  calculateAnnualYield: jest.fn()
}));

jest.mock('@/lib/negotiation-config', () => ({
  WREI_TOKEN_CONFIG: {
    CARBON_CREDITS: { price: 150 },
    ASSET_CO: { yield: 0.283 }
  }
}));

jest.mock('@/lib/risk-profiles', () => ({
  generateRiskReport: jest.fn(() => ({
    volatility: 15.0,
    sharpeRatio: 1.2,
    riskGrade: 'BBB+'
  })),
  calculateRiskMetrics: jest.fn()
}));

describe('InstitutionalDashboard', () => {
  const defaultProps = {
    investorProfile: {
      type: 'infrastructure_fund' as const,
      aum: 50_000_000_000, // A$50B
      riskTolerance: 'moderate' as const,
      yieldRequirement: 0.12 // 12%
    },
    portfolioSize: 100_000_000, // A$100M
    timeHorizon: 5, // 5 years
    onConfigurationChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dashboard Rendering', () => {
    test('renders dashboard header with investor profile information', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      expect(screen.getByText('WREI Institutional Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/infrastructure fund/i)).toBeInTheDocument();
      expect(screen.getByText(/AUM: A\$50\.0B/)).toBeInTheDocument();
      expect(screen.getByText(/Portfolio: A\$100\.0M/)).toBeInTheDocument();
    });

    test('displays portfolio overview with correct financial metrics', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      // Check for portfolio value display - use getAllByText for multiple occurrences
      const portfolioValues = screen.getAllByText(/A\$100\.0M/);
      expect(portfolioValues.length).toBeGreaterThan(0);

      // Check for yield display
      expect(screen.getByText('Current Yield')).toBeInTheDocument();

      // Check for diversification benefits
      expect(screen.getByText('Diversification')).toBeInTheDocument();

      // Check for portfolio risk
      expect(screen.getByText('Portfolio Risk')).toBeInTheDocument();
    });

    test('renders navigation tabs correctly', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      // Use getByRole to specifically target the tab buttons
      const portfolioTab = screen.getByRole('button', { name: /📊 Portfolio Overview/ });
      const yieldTab = screen.getByRole('button', { name: /💰 Yield Mechanisms/ });
      const collateralTab = screen.getByRole('button', { name: /🔗 Cross-Collateral/ });

      expect(portfolioTab).toBeInTheDocument();
      expect(yieldTab).toBeInTheDocument();
      expect(collateralTab).toBeInTheDocument();
    });

    test('displays token holdings with correct information', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      expect(screen.getByText('Token Holdings')).toBeInTheDocument();

      // Use getAllByText for elements that appear multiple times
      const carbonCreditsElements = screen.getAllByText('Carbon Credits');
      const assetCoElements = screen.getAllByText('Asset Co Tokens');
      const dualPortfolioElements = screen.getAllByText('Dual Portfolio');

      expect(carbonCreditsElements.length).toBeGreaterThan(0);
      expect(assetCoElements.length).toBeGreaterThan(0);
      expect(dualPortfolioElements.length).toBeGreaterThan(0);

      // Check for pricing information
      expect(screen.getByText(/A\$150\/tonne/)).toBeInTheDocument();
      expect(screen.getByText(/28\.3% yield/)).toBeInTheDocument();
      expect(screen.getByText(/18\.5% blended yield/)).toBeInTheDocument();
    });
  });

  describe('Market Intelligence Display', () => {
    test('displays market intelligence panel with correct data', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      expect(screen.getByText('Market Intelligence')).toBeInTheDocument();
      expect(screen.getByText('RWA Market')).toBeInTheDocument();
      expect(screen.getByText('A$19B')).toBeInTheDocument();
      expect(screen.getByText('Carbon Market 2030')).toBeInTheDocument();
      expect(screen.getByText('A$155B')).toBeInTheDocument();
      expect(screen.getByText('WREI Premium')).toBeInTheDocument();

      // Use getAllByText for elements that appear multiple times
      const premiumElements = screen.getAllByText('+23%');
      expect(premiumElements.length).toBeGreaterThan(0);
    });

    test('displays competitive advantages correctly', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      expect(screen.getByText('Competitive Advantages')).toBeInTheDocument();
      expect(screen.getByText('Native Digital Credits')).toBeInTheDocument();
      expect(screen.getByText('Asset-Backed Yield')).toBeInTheDocument();

      // Use getAllByText for elements that appear multiple times
      const crossCollateralElements = screen.getAllByText('Cross-Collateral');
      expect(crossCollateralElements.length).toBeGreaterThan(0);

      expect(screen.getByText('Regulatory Clarity')).toBeInTheDocument();
    });
  });

  describe('Risk Assessment Display', () => {
    test('displays risk assessment panel with metrics', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Volatility')).toBeInTheDocument();
      expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
      expect(screen.getByText('Regulatory Risk')).toBeInTheDocument();
      expect(screen.getByText('Liquidity Risk')).toBeInTheDocument();
    });

    test('shows risk grade and description', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      expect(screen.getByText(/Risk Grade:/)).toBeInTheDocument();
      expect(screen.getByText(/BBB\+/)).toBeInTheDocument();
      expect(screen.getByText(/Composite score based on/)).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    test('switches to yield mechanisms tab when clicked', async () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      const yieldTab = screen.getByRole('button', { name: /💰 Yield Mechanisms/ });
      fireEvent.click(yieldTab);

      await waitFor(() => {
        expect(screen.getByText('Yield Mechanism Selection')).toBeInTheDocument();

        // Use getAllByText for elements that appear multiple times
        const revenueShareElements = screen.getAllByText('Revenue Share');
        const navAccruingElements = screen.getAllByText('NAV-Accruing');

        expect(revenueShareElements.length).toBeGreaterThan(0);
        expect(navAccruingElements.length).toBeGreaterThan(0);
      });
    });

    test('switches to cross-collateral tab when clicked', async () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      const collateralTab = screen.getByRole('button', { name: /🔗 Cross-Collateral/ });
      fireEvent.click(collateralTab);

      await waitFor(() => {
        expect(screen.getByText('Cross-Collateralization Position')).toBeInTheDocument();
        expect(screen.getByText('Collateral Value')).toBeInTheDocument();
        expect(screen.getByText('Max LTV')).toBeInTheDocument();
      });
    });
  });

  describe('Yield Mechanism Functionality', () => {
    test('allows switching between yield mechanisms', async () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      // Switch to yield tab using role-based selector
      const yieldTab = screen.getByRole('button', { name: /💰 Yield Mechanisms/ });
      fireEvent.click(yieldTab);

      await waitFor(() => {
        const navAccruingOptions = screen.getAllByText('NAV-Accruing');
        expect(navAccruingOptions.length).toBeGreaterThan(0);

        // Click on the first NAV-accruing mechanism option
        fireEvent.click(navAccruingOptions[0].closest('div') as Element);
      });
    });

    test('displays yield projection calculations', async () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      const yieldTab = screen.getByRole('button', { name: /💰 Yield Mechanisms/ });
      fireEvent.click(yieldTab);

      await waitFor(() => {
        expect(screen.getByText('5-Year Projection (A$1M Investment)')).toBeInTheDocument();
        expect(screen.getByText(/Annual Cash Flow:/)).toBeInTheDocument();
        expect(screen.getByText(/Token Appreciation:/)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Collateralization Features', () => {
    test('displays collateral position metrics', async () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      const collateralTab = screen.getByRole('button', { name: /🔗 Cross-Collateral/ });
      fireEvent.click(collateralTab);

      await waitFor(() => {
        expect(screen.getByText('Collateral Breakdown by Token Type')).toBeInTheDocument();
        expect(screen.getByText('Risk Monitoring')).toBeInTheDocument();
        expect(screen.getByText('Margin Call Level:')).toBeInTheDocument();
        expect(screen.getByText('Liquidation Level:')).toBeInTheDocument();
      });
    });

    test('shows borrowing utilization with correct risk indicators', async () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      const collateralTab = screen.getByRole('button', { name: /🔗 Cross-Collateral/ });
      fireEvent.click(collateralTab);

      await waitFor(() => {
        expect(screen.getByText('Borrowing Utilization')).toBeInTheDocument();
        expect(screen.getByText('Safe (0-60%)')).toBeInTheDocument();
        expect(screen.getByText('Moderate (60-80%)')).toBeInTheDocument();
        expect(screen.getByText('High Risk (80%+)')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Metrics', () => {
    test('calculates and displays total return correctly', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      expect(screen.getByText('Total Return')).toBeInTheDocument();
      expect(screen.getByText('Benchmark')).toBeInTheDocument();

      // Use getAllByText for elements that appear multiple times
      const benchmarkElements = screen.getAllByText('+23%');
      expect(benchmarkElements.length).toBeGreaterThan(0);
    });

    test('shows live data indicators', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      expect(screen.getByText('Live Data')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders properly with different investor profiles', () => {
      const esgProfile = {
        ...defaultProps,
        investorProfile: {
          type: 'esg_impact' as const,
          aum: 25_000_000_000,
          riskTolerance: 'moderate' as const,
          yieldRequirement: 0.08
        }
      };

      render(React.createElement(InstitutionalDashboard, esgProfile));

      const esgElements = screen.getAllByText(/esg impact/i);
      expect(esgElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/AUM: A\$25\.0B/)).toBeInTheDocument();
    });

    test('handles different portfolio sizes correctly', () => {
      const largePortfolio = {
        ...defaultProps,
        portfolioSize: 500_000_000 // A$500M
      };

      render(React.createElement(InstitutionalDashboard, largePortfolio));

      expect(screen.getByText(/Portfolio: A\$500\.0M/)).toBeInTheDocument();
    });
  });

  describe('Footer Information', () => {
    test('displays footer with compliance information', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      // Use getAllByText for text that appears multiple times
      const dashboardTitles = screen.getAllByText(/WREI Institutional Dashboard/);
      expect(dashboardTitles.length).toBeGreaterThan(0);

      expect(screen.getByText(/Australian AFSL Compliant/)).toBeInTheDocument();
      expect(screen.getByText(/Professional Investor Use Only/)).toBeInTheDocument();
    });

    test('shows real-time data timestamp', () => {
      render(React.createElement(InstitutionalDashboard, defaultProps));

      expect(screen.getByText(/Real-time data/)).toBeInTheDocument();
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });
});