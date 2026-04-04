/**
 * WREI Trading Platform - Multi-Audience System Smoke Test
 *
 * Simplified smoke tests for Step 1.2: Multi-Audience Interface System
 * Validates core components render without errors
 *
 * Date: March 25, 2026
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
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
  ArrowTrendingUpIcon: () => <svg data-testid="arrow-trending-up-icon" />,
  ArrowTrendingDownIcon: () => <svg data-testid="arrow-trending-down-icon" />,
  PresentationChartBarIcon: () => <svg data-testid="presentation-chart-bar-icon" />,
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

// Add global mocks for removed esc-market-context functions
(globalThis as any).getNorthmoreGordonValueProp = jest.fn((audience: string) => ({
  headline: `Test headline for ${audience}`,
  benefits: ['Benefit 1', 'Benefit 2'],
  roi_metrics: { cost_savings: '40%' },
  technical_specs: { api_latency: 'Sub-50ms' },
  compliance_features: { coder_integration: 'Real-time' }
}));

(globalThis as any).getCurrentESCMarketContext = jest.fn(() => ({
  SPOT_PRICE: 47.80,
  market_participants: {},
  firm_context: {}
}));

(globalThis as any).getCERComplianceFramework = jest.fn(() => ({
  authority: { name: 'Clean Energy Regulator' },
  key_requirements: ['CERTIFICATE_CREATION'],
  validation_methods: {}
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

import {
  AudienceSelector,
  ExecutiveDashboard,
  TechnicalInterface,
  CompliancePanel,
  MultiAudienceRouter
} from '../../components/audience';

describe('Multi-Audience System Smoke Tests', () => {
  test('AudienceSelector renders without errors', () => {
    const mockOnSelect = jest.fn();
    render(<AudienceSelector onAudienceSelect={mockOnSelect} />);

    expect(screen.getByText('NSW ESC Trading Platform Demonstration')).toBeInTheDocument();
    expect(screen.getByText('Executive Leadership')).toBeInTheDocument();
  });

  test('ExecutiveDashboard renders without errors', () => {
    render(<ExecutiveDashboard />);

    expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
  });

  test('TechnicalInterface renders without errors', () => {
    render(<TechnicalInterface />);

    expect(screen.getByText('Technical Integration Dashboard')).toBeInTheDocument();
  });

  test('CompliancePanel renders without errors', () => {
    render(<CompliancePanel />);

    expect(screen.getByText('Compliance & Risk Management')).toBeInTheDocument();
  });

  test('MultiAudienceRouter renders without errors', () => {
    render(<MultiAudienceRouter />);

    expect(screen.getByText('NSW ESC Trading Platform Demonstration')).toBeInTheDocument();
  });

  test('All components use NSW ESC context', () => {
    const { rerender } = render(<AudienceSelector onAudienceSelect={jest.fn()} />);
    expect(screen.getByText('NSW ESC Trading Platform Demonstration')).toBeInTheDocument();

    rerender(<ExecutiveDashboard />);
    expect(screen.getAllByText(/ESC/).length).toBeGreaterThan(0);

    rerender(<TechnicalInterface />);
    expect(screen.getAllByText(/ESC/).length).toBeGreaterThan(0);

    rerender(<CompliancePanel />);
    expect(screen.getAllByText(/AFSL/).length).toBeGreaterThan(0);
  });

  test('All components integrate Northmore Gordon branding', () => {
    const { rerender } = render(<AudienceSelector onAudienceSelect={jest.fn()} />);
    expect(screen.getByText('Northmore Gordon')).toBeInTheDocument();

    rerender(<ExecutiveDashboard />);
    expect(screen.getByText('Northmore Gordon')).toBeInTheDocument();

    rerender(<CompliancePanel />);
    expect(screen.getAllByText(/AFSL/).length).toBeGreaterThan(0);
  });
});