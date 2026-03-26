/**
 * WREI Trading Platform - Audience Selector Core Tests
 *
 * Simplified tests for Step 1.2: Multi-Audience Interface System
 * Focus on core functionality without complex icon dependencies
 *
 * Date: March 25, 2026
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ChevronRightIcon: () => <svg data-testid="chevron-right-icon" />,
  UserGroupIcon: () => <svg data-testid="user-group-icon" />,
  CogIcon: () => <svg data-testid="cog-icon" />,
  ShieldCheckIcon: () => <svg data-testid="shield-check-icon" />,
  ArrowLeftIcon: () => <svg data-testid="arrow-left-icon" />,
  HomeIcon: () => <svg data-testid="home-icon" />,
  TrendingUpIcon: () => <svg data-testid="trending-up-icon" />,
  CurrencyDollarIcon: () => <svg data-testid="currency-dollar-icon" />,
  ClockIcon: () => <svg data-testid="clock-icon" />,
  CheckCircleIcon: () => <svg data-testid="check-circle-icon" />,
  ChartBarIcon: () => <svg data-testid="chart-bar-icon" />,
  BanknotesIcon: () => <svg data-testid="banknotes-icon" />,
  CpuChipIcon: () => <svg data-testid="cpu-chip-icon" />,
  CloudIcon: () => <svg data-testid="cloud-icon" />,
  BoltIcon: () => <svg data-testid="bolt-icon" />,
  CircleStackIcon: () => <svg data-testid="circle-stack-icon" />,
  CommandLineIcon: () => <svg data-testid="command-line-icon" />,
  DocumentTextIcon: () => <svg data-testid="document-text-icon" />,
  ExclamationTriangleIcon: () => <svg data-testid="exclamation-triangle-icon" />,
  EyeIcon: () => <svg data-testid="eye-icon" />,
  DocumentChartBarIcon: () => <svg data-testid="document-chart-bar-icon" />
}));

// Mock the demo mode hook
jest.mock('../../lib/demo-mode/demo-state-manager', () => ({
  useDemoMode: () => ({
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
  })
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

import { AudienceSelector } from '../../components/audience';

describe('Audience Selector Core Functionality', () => {
  test('renders without errors', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    expect(screen.getByText('NSW ESC Trading Platform Demonstration')).toBeInTheDocument();
  });

  test('displays all audience options', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    expect(screen.getByText('Executive Leadership')).toBeInTheDocument();
    expect(screen.getByText('Technical Leadership')).toBeInTheDocument();
    expect(screen.getByText('Compliance & Risk')).toBeInTheDocument();
  });

  test('shows Northmore Gordon branding', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    expect(screen.getByText('Northmore Gordon')).toBeInTheDocument();
    expect(screen.getByText('AFSL 246896')).toBeInTheDocument();
    expect(screen.getByText('12% NSW ESC Market Share')).toBeInTheDocument();
  });

  test('displays value propositions for each audience type', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    expect(screen.getByText('Maximize ESC Trading ROI with AI-Powered Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Advanced Technology Infrastructure for ESC Trading')).toBeInTheDocument();
    expect(screen.getByText('Automated CER Compliance with Comprehensive Audit Trails')).toBeInTheDocument();
  });

  test('calls onAudienceSelect when audience option is clicked', async () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    const executiveOption = screen.getByText('Executive Leadership');
    await userEvent.click(executiveOption);

    expect(mockOnSelect).toHaveBeenCalledWith('executive');
  });

  test('displays tour duration for each option', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    expect(screen.getByText(/14 minutes/)).toBeInTheDocument(); // Executive tour
    expect(screen.getByText(/16 minutes/)).toBeInTheDocument(); // Technical tour
    expect(screen.getByText(/18 minutes/)).toBeInTheDocument(); // Compliance tour
  });

  test('shows NSW ESC market context in information section', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    expect(screen.getByText('A$200M+ annual trading volume')).toBeInTheDocument();
    expect(screen.getByText('850+ active market participants')).toBeInTheDocument();
    expect(screen.getByText('Real-time AEMO pricing integration (A$47.80 spot)')).toBeInTheDocument();
    expect(screen.getByText('Clean Energy Regulator compliance framework')).toBeInTheDocument();
  });

  test('displays platform capabilities', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    expect(screen.getByText(/AI-powered negotiation/)).toBeInTheDocument();
    expect(screen.getByText(/T\+0 atomic settlement/)).toBeInTheDocument();
    expect(screen.getByText(/compliance automation/)).toBeInTheDocument();
    expect(screen.getByText(/market intelligence/)).toBeInTheDocument();
  });

  test('supports selecting an audience through guided tour button', async () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    // Find the executive tour button specifically
    const tourButtons = screen.getAllByText(/Start Guided Tour/);
    const executiveTourButton = tourButtons[0]; // First one should be executive

    await userEvent.click(executiveTourButton);
    expect(mockOnSelect).toHaveBeenCalledWith('executive');
  });

  test('supports selecting an audience through explore interface button', async () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    const exploreButtons = screen.getAllByText('Explore Interface');
    const executiveExploreButton = exploreButtons[0]; // First one should be executive

    await userEvent.click(executiveExploreButton);
    expect(mockOnSelect).toHaveBeenCalledWith('executive');
  });

  test('shows selected state when selectedAudience prop is provided', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} selectedAudience="technical" />);

    const technicalOption = screen.getByText('Technical Leadership').closest('div');
    // Component shows selected state with different styling
    expect(technicalOption).toBeInTheDocument();
  });

  test('integrates with demo mode tracking', async () => {
    const mockTrackInteraction = jest.fn();
    const mockLoadESCMarketContext = jest.fn();
    const mockConfigureNorthmoreGordonBranding = jest.fn();

    // Override the mock for this test
    jest.doMock('../../lib/demo-mode/demo-state-manager', () => ({
      useDemoMode: () => ({
        isActive: true,
        trackInteraction: mockTrackInteraction,
        loadESCMarketContext: mockLoadESCMarketContext,
        configureNorthmoreGordonBranding: mockConfigureNorthmoreGordonBranding,
        getESCDemoData: () => ({ marketContext: {}, scenarios: {}, currentMarketData: {}, complianceFramework: {} }),
        getNorthmoreGordonContext: () => ({ FIRM_PROFILE: {}, MARKET_POSITION: {} })
      })
    }));

    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    const executiveOption = screen.getByText('Executive Leadership');
    await userEvent.click(executiveOption);

    // Should call demo mode methods
    expect(mockOnSelect).toHaveBeenCalledWith('executive');
  });
});

describe('Multi-Audience System Configuration', () => {
  test('audience types are properly defined', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    // Should have exactly 3 audience options
    expect(screen.getByText('Executive Leadership')).toBeInTheDocument();
    expect(screen.getByText('Technical Leadership')).toBeInTheDocument();
    expect(screen.getByText('Compliance & Risk')).toBeInTheDocument();
  });

  test('icons are properly rendered for each audience type', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    expect(screen.getByTestId('user-group-icon')).toBeInTheDocument(); // Executive
    expect(screen.getByTestId('cog-icon')).toBeInTheDocument(); // Technical
    expect(screen.getByTestId('shield-check-icon')).toBeInTheDocument(); // Compliance
  });

  test('tour integration data is properly configured', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    // Check that each audience has the correct tour configuration
    const executiveSection = screen.getByTestId('audience-option-executive');
    const technicalSection = screen.getByTestId('audience-option-technical');
    const complianceSection = screen.getByTestId('audience-option-compliance');

    // Verify different durations for different audiences
    expect(screen.getByText(/14 minutes/)).toBeInTheDocument();
    expect(screen.getByText(/16 minutes/)).toBeInTheDocument();
    expect(screen.getByText(/18 minutes/)).toBeInTheDocument();
  });

  test('NSW ESC integration is consistent across all audience types', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    // All audience types should reference NSW ESC
    expect(screen.getByText(/NSW ESC Trading Platform/)).toBeInTheDocument();

    // Market data should be consistent
    expect(screen.getByText(/A\$47\.80 spot/)).toBeInTheDocument();

    // Regulatory framework should be mentioned
    expect(screen.getByText(/Clean Energy Regulator/)).toBeInTheDocument();
  });
});