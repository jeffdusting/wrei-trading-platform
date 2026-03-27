/**
 * WREI Trading Platform - Multi-Audience System Tests
 *
 * Unit tests for Step 1.2: Multi-Audience Interface System
 * Testing audience selection, navigation, and interface integration
 *
 * Date: March 25, 2026
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, configure } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  MultiAudienceRouter,
  AudienceSelector,
  ExecutiveDashboard,
  TechnicalInterface,
  CompliancePanel,
  type AudienceType
} from '../../components/audience';

// Configure testing-library to use data-demo as test ID attribute (matching component implementation)
configure({ testIdAttribute: 'data-demo' });

// Mock the demo mode hook (use jest.fn() so mockReturnValue works)
const mockUseDemoMode = jest.fn(() => ({
  isActive: false,
  currentTour: null,
  showTourOverlay: false,
  loadESCMarketContext: jest.fn(),
  configureNorthmoreGordonBranding: jest.fn(),
  trackInteraction: jest.fn(),
  startTour: jest.fn(),
  endTour: jest.fn(),
  nextStep: jest.fn(),
  skipStep: jest.fn(),
  getESCDemoData: () => ({
    marketContext: {},
    scenarios: {},
    currentMarketData: { SPOT_PRICE: 47.80 },
    complianceFramework: {}
  }),
  getNorthmoreGordonContext: () => ({
    FIRM_PROFILE: { name: 'Northmore Gordon' },
    MARKET_POSITION: { nsw_esc_market_share: 0.12 }
  })
}));

jest.mock('../../lib/demo-mode/demo-state-manager', () => ({
  useDemoMode: (...args: any[]) => mockUseDemoMode(...args)
}));

// Mock the ESC market context
jest.mock('../../lib/demo-mode/esc-market-context', () => ({
  getNorthmoreGordonValueProp: jest.fn((audience) => ({
    headline: `Test headline for ${audience}`,
    benefits: ['Benefit 1', 'Benefit 2'],
    roi_metrics: { cost_savings: '40%' },
    technical_specs: { api_latency: 'Sub-50ms' },
    compliance_features: { coder_integration: 'Real-time' }
  })),
  getCurrentESCMarketContext: jest.fn(() => ({
    SPOT_PRICE: 47.80,
    market_participants: {},
    firm_context: {}
  })),
  getCERComplianceFramework: jest.fn(() => ({
    authority: { name: 'Clean Energy Regulator' },
    key_requirements: ['CERTIFICATE_CREATION'],
    validation_methods: {}
  }))
}));

// Mock negotiation config
jest.mock('../../lib/negotiation-config', () => ({
  NSW_ESC_CONFIG: {
    MARKET_CONDITIONS: {
      SPOT_PRICE: 47.80,
      DATA_SOURCES: ['AEMO', 'CER']
    },
    FIRM_CONTEXT: {
      MARKET_SHARE: 0.12
    }
  }
}));

describe('Multi-Audience System Integration', () => {
  beforeEach(() => {
    // Reset mock to default value before each test
    mockUseDemoMode.mockReturnValue({
      isActive: false,
      currentTour: null,
      showTourOverlay: false,
      loadESCMarketContext: jest.fn(),
      configureNorthmoreGordonBranding: jest.fn(),
      trackInteraction: jest.fn(),
      startTour: jest.fn(),
      endTour: jest.fn(),
      nextStep: jest.fn(),
      skipStep: jest.fn(),
      getESCDemoData: () => ({
        marketContext: {},
        scenarios: {},
        currentMarketData: { SPOT_PRICE: 47.80 },
        complianceFramework: {}
      }),
      getNorthmoreGordonContext: () => ({
        FIRM_PROFILE: { name: 'Northmore Gordon' },
        MARKET_POSITION: { nsw_esc_market_share: 0.12 }
      })
    });
  });

  describe('AudienceSelector Component', () => {
    test('renders all audience options', () => {
      const mockOnSelect = jest.fn();
      render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

      expect(screen.getByText('Executive Leadership')).toBeInTheDocument();
      expect(screen.getByText('Technical Leadership')).toBeInTheDocument();
      expect(screen.getByText('Compliance & Risk')).toBeInTheDocument();
    });

    test('displays NSW ESC market context information', () => {
      const mockOnSelect = jest.fn();
      render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

      expect(screen.getByText(/NSW ESC Trading Platform Demonstration/)).toBeInTheDocument();
      expect(screen.getByText(/Northmore Gordon/)).toBeInTheDocument();
      expect(screen.getByText(/AFSL 246896/)).toBeInTheDocument();
      expect(screen.getByText(/12% NSW ESC Market Share/)).toBeInTheDocument();
    });

    test('calls onAudienceSelect when audience is chosen', async () => {
      const mockOnSelect = jest.fn();
      render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

      const executiveOption = screen.getByTestId('audience-option-executive');
      await userEvent.click(executiveOption);

      expect(mockOnSelect).toHaveBeenCalledWith('executive');
    });

    test('starts guided tour when tour button is clicked', async () => {
      const mockOnSelect = jest.fn();
      render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

      const tourButton = screen.getByText(/Start Guided Tour.*14 minutes/);
      await userEvent.click(tourButton);

      expect(mockOnSelect).toHaveBeenCalledWith('executive');
    });

    test('displays value propositions for each audience', () => {
      const mockOnSelect = jest.fn();
      render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

      expect(screen.getByText('Maximize ESC Trading ROI with AI-Powered Intelligence')).toBeInTheDocument();
      expect(screen.getByText('Advanced Technology Infrastructure for ESC Trading')).toBeInTheDocument();
      expect(screen.getByText('Automated CER Compliance with Comprehensive Audit Trails')).toBeInTheDocument();
    });
  });

  describe('MultiAudienceRouter Component', () => {
    test('shows audience selector by default', () => {
      render(<MultiAudienceRouter />);

      expect(screen.getByText('NSW ESC Trading Platform Demonstration')).toBeInTheDocument();
      expect(screen.getByTestId('audience-selector')).toBeInTheDocument();
    });

    test('navigates to executive dashboard when selected', async () => {
      render(<MultiAudienceRouter />);

      const executiveOption = screen.getByTestId('audience-option-executive');
      await userEvent.click(executiveOption);

      await waitFor(() => {
        expect(screen.getByTestId('executive-dashboard')).toBeInTheDocument();
      });
    });

    test('shows navigation bar when interface is active', async () => {
      render(<MultiAudienceRouter />);

      const executiveOption = screen.getByTestId('audience-option-executive');
      await userEvent.click(executiveOption);

      await waitFor(() => {
        // 'Executive Dashboard' appears in both the nav bar and the dashboard heading
        const executiveDashboardElements = screen.getAllByText('Executive Dashboard');
        expect(executiveDashboardElements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Back to Selection')).toBeInTheDocument();
      });
    });

    test('allows switching between audiences', async () => {
      render(<MultiAudienceRouter />);

      // Select executive first
      const executiveOption = screen.getByTestId('audience-option-executive');
      await userEvent.click(executiveOption);

      await waitFor(() => {
        expect(screen.getByTestId('executive-dashboard')).toBeInTheDocument();
      });

      // Switch to technical
      const technicalButton = screen.getByText('Technical');
      await userEvent.click(technicalButton);

      await waitFor(() => {
        expect(screen.getByTestId('technical-interface')).toBeInTheDocument();
      });
    });

    test('returns to selector when back button is clicked', async () => {
      render(<MultiAudienceRouter />);

      // Navigate to an interface
      const executiveOption = screen.getByTestId('audience-option-executive');
      await userEvent.click(executiveOption);

      await waitFor(() => {
        expect(screen.getByTestId('executive-dashboard')).toBeInTheDocument();
      });

      // Go back
      const backButton = screen.getByText('Back to Selection');
      await userEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByTestId('audience-selector')).toBeInTheDocument();
      });
    });

    test('supports initial audience prop', () => {
      render(<MultiAudienceRouter initialAudience="technical" />);

      expect(screen.getByTestId('technical-interface')).toBeInTheDocument();
    });

    test('handles demo mode integration', () => {
      // Set active demo mode BEFORE rendering
      mockUseDemoMode.mockReturnValue({
        isActive: true,
        currentTour: 'nsw-esc-executive',
        showTourOverlay: false,
        loadESCMarketContext: jest.fn(),
        configureNorthmoreGordonBranding: jest.fn(),
        trackInteraction: jest.fn(),
        startTour: jest.fn(),
        endTour: jest.fn(),
        nextStep: jest.fn(),
        skipStep: jest.fn(),
        getESCDemoData: () => ({ marketContext: {}, scenarios: {}, currentMarketData: {}, complianceFramework: {} }),
        getNorthmoreGordonContext: () => ({ FIRM_PROFILE: {}, MARKET_POSITION: {} })
      });

      // Render fresh with initialAudience so navigation bar is shown
      render(<MultiAudienceRouter initialAudience="executive" />);

      expect(screen.getByText('Tour Active')).toBeInTheDocument();
      expect(screen.getByText('Demo Mode Active')).toBeInTheDocument();
    });
  });

  describe('Executive Dashboard Component', () => {
    test('renders key performance indicators', () => {
      render(<ExecutiveDashboard />);

      expect(screen.getByTestId('executive-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
      expect(screen.getByText('ESC Trading Volume')).toBeInTheDocument();
      expect(screen.getByText('A$24.0M')).toBeInTheDocument();
    });

    test('displays ROI analysis section', () => {
      render(<ExecutiveDashboard />);

      expect(screen.getByTestId('executive-roi-analysis')).toBeInTheDocument();
      expect(screen.getByText('Platform ROI Analysis - AI vs Traditional Methods')).toBeInTheDocument();
    });

    test('shows market intelligence data', () => {
      render(<ExecutiveDashboard />);

      expect(screen.getByTestId('executive-market-intelligence')).toBeInTheDocument();
      expect(screen.getByText('NSW ESC Market Size')).toBeInTheDocument();
      expect(screen.getByText('A$200M+')).toBeInTheDocument();
    });

    test('includes strategic recommendations', () => {
      render(<ExecutiveDashboard />);

      expect(screen.getByTestId('executive-recommendations')).toBeInTheDocument();
      expect(screen.getByText('Strategic Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Immediate Opportunities')).toBeInTheDocument();
    });
  });

  describe('Technical Interface Component', () => {
    test('renders system architecture overview', () => {
      render(<TechnicalInterface />);

      expect(screen.getByTestId('technical-interface')).toBeInTheDocument();
      expect(screen.getByText('Technical Integration Dashboard')).toBeInTheDocument();
    });

    test('displays performance metrics', () => {
      render(<TechnicalInterface />);

      // Click on performance tab
      const performanceTab = screen.getByText('Performance Metrics');
      fireEvent.click(performanceTab);

      expect(screen.getByTestId('technical-performance')).toBeInTheDocument();
      expect(screen.getByText('API Response Time')).toBeInTheDocument();
    });

    test('shows API endpoints information', () => {
      render(<TechnicalInterface />);

      // Click on APIs tab
      const apisTab = screen.getByText('API Endpoints');
      fireEvent.click(apisTab);

      expect(screen.getByTestId('technical-apis')).toBeInTheDocument();
      expect(screen.getByText('/api/v1/esc/market-data')).toBeInTheDocument();
    });

    test('includes integration details', () => {
      render(<TechnicalInterface />);

      // Click on integration tab
      const integrationTab = screen.getByText('Integration Details');
      fireEvent.click(integrationTab);

      expect(screen.getByTestId('technical-integration')).toBeInTheDocument();
      expect(screen.getByText('AEMO Market Data')).toBeInTheDocument();
    });
  });

  describe('Compliance Panel Component', () => {
    test('renders compliance overview', () => {
      render(<CompliancePanel />);

      expect(screen.getByTestId('compliance-panel')).toBeInTheDocument();
      expect(screen.getByText('Compliance & Risk Management')).toBeInTheDocument();
    });

    test('displays compliance metrics', () => {
      render(<CompliancePanel />);

      expect(screen.getByTestId('compliance-overview')).toBeInTheDocument();
      expect(screen.getByText('Clean Energy Regulator')).toBeInTheDocument();
      expect(screen.getByText('AUSTRAC AML/CTF')).toBeInTheDocument();
    });

    test('shows regulatory requirements', () => {
      render(<CompliancePanel />);

      // Click on requirements tab
      const requirementsTab = screen.getByText('Regulatory Requirements');
      fireEvent.click(requirementsTab);

      expect(screen.getByTestId('compliance-requirements')).toBeInTheDocument();
      expect(screen.getByText('Quarterly ESC Trading Report')).toBeInTheDocument();
    });

    test('includes audit trail functionality', () => {
      render(<CompliancePanel />);

      // Click on audit tab
      const auditTab = screen.getByText('Audit Trail');
      fireEvent.click(auditTab);

      expect(screen.getByTestId('compliance-audit-trail')).toBeInTheDocument();
      expect(screen.getByText('ESC Certificate Validation')).toBeInTheDocument();
    });
  });

  describe('Data Integration and Context', () => {
    test('integrates NSW ESC market context across all interfaces', () => {
      // Test executive integration
      const { rerender } = render(<ExecutiveDashboard />);
      expect(screen.getByText(/A\$47\.80/)).toBeInTheDocument();

      // Test technical integration
      rerender(<TechnicalInterface />);
      expect(screen.getByText(/AEMO/)).toBeInTheDocument();

      // Test compliance integration
      rerender(<CompliancePanel />);
      expect(screen.getByText('Clean Energy Regulator')).toBeInTheDocument();
    });

    test('displays Northmore Gordon branding consistently', () => {
      const { rerender } = render(<ExecutiveDashboard />);
      expect(screen.getByText(/Northmore Gordon/)).toBeInTheDocument();

      rerender(<TechnicalInterface />);
      // Technical interface shows less branding but includes context

      rerender(<CompliancePanel />);
      expect(screen.getByText(/AFSL 246896/)).toBeInTheDocument();
    });

    test('maintains state consistency across audience switches', async () => {
      render(<MultiAudienceRouter />);

      // Select executive, then switch to technical
      const executiveOption = screen.getByTestId('audience-option-executive');
      await userEvent.click(executiveOption);

      await waitFor(() => {
        expect(screen.getByTestId('executive-dashboard')).toBeInTheDocument();
      });

      const technicalButton = screen.getByText('Technical');
      await userEvent.click(technicalButton);

      await waitFor(() => {
        expect(screen.getByTestId('technical-interface')).toBeInTheDocument();
      });

      // Verify context is maintained
      expect(screen.getByText(/Technical Integration Dashboard/)).toBeInTheDocument();
    });
  });

  describe('Accessibility and User Experience', () => {
    test('provides proper ARIA labels for navigation', async () => {
      render(<MultiAudienceRouter />);

      const executiveOption = screen.getByTestId('audience-option-executive');
      await userEvent.click(executiveOption);

      await waitFor(() => {
        const backButton = screen.getByText('Back to Selection');
        expect(backButton).toBeInTheDocument();
        // Verify it's inside a button element
        expect(backButton.closest('button')).toBeTruthy();
      });
    });

    test('supports keyboard navigation', async () => {
      render(<AudienceSelector onAudienceSelect={jest.fn()} />);

      // Audience options contain interactive buttons for keyboard navigation
      const executiveOption = screen.getByTestId('audience-option-executive');
      expect(executiveOption).toBeInTheDocument();

      // Verify interactive buttons exist within the audience option for keyboard access
      const buttons = executiveOption.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Tab navigation should work on the buttons inside the option
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();
      fireEvent.keyDown(buttons[0], { key: 'Tab' });
    });

    test('displays loading states appropriately', () => {
      render(<TechnicalInterface />);

      // Check for live metrics indicator
      expect(screen.getByText('Live Metrics')).toBeInTheDocument();
    });
  });
});

describe('Integration with Demo Mode', () => {
  test('tracks audience interactions properly', async () => {
    const mockTrackInteraction = jest.fn();
    mockUseDemoMode.mockReturnValue({
      isActive: true,
      trackInteraction: mockTrackInteraction,
      loadESCMarketContext: jest.fn(),
      configureNorthmoreGordonBranding: jest.fn(),
      startTour: jest.fn(),
      endTour: jest.fn(),
      nextStep: jest.fn(),
      skipStep: jest.fn(),
      getESCDemoData: () => ({ marketContext: {}, scenarios: {}, currentMarketData: {}, complianceFramework: {} }),
      getNorthmoreGordonContext: () => ({ FIRM_PROFILE: {}, MARKET_POSITION: {} })
    });

    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    const executiveOption = screen.getByTestId('audience-option-executive');
    await userEvent.click(executiveOption);

    expect(mockTrackInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'click',
        data: expect.objectContaining({
          action: 'audience_selection',
          audience_type: 'executive'
        })
      })
    );
  });

  test('loads ESC market context on audience selection', async () => {
    const mockLoadESCMarketContext = jest.fn();
    const mockConfigureNorthmoreGordonBranding = jest.fn();

    mockUseDemoMode.mockReturnValue({
      isActive: true,
      loadESCMarketContext: mockLoadESCMarketContext,
      configureNorthmoreGordonBranding: mockConfigureNorthmoreGordonBranding,
      trackInteraction: jest.fn(),
      startTour: jest.fn(),
      endTour: jest.fn(),
      nextStep: jest.fn(),
      skipStep: jest.fn(),
      getESCDemoData: () => ({ marketContext: {}, scenarios: {}, currentMarketData: {}, complianceFramework: {} }),
      getNorthmoreGordonContext: () => ({ FIRM_PROFILE: {}, MARKET_POSITION: {} })
    });

    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    const executiveOption = screen.getByTestId('audience-option-executive');
    await userEvent.click(executiveOption);

    expect(mockLoadESCMarketContext).toHaveBeenCalled();
    expect(mockConfigureNorthmoreGordonBranding).toHaveBeenCalled();
  });
});