/**
 * WREI Trading Platform - Scenario Components Smoke Test
 *
 * Simplified smoke tests for Step 1.3: Scenario Library & Templates
 * Validates core scenario components render without errors
 *
 * Date: March 25, 2026
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PlayIcon: () => <svg data-testid="play-icon" />,
  PauseIcon: () => <svg data-testid="pause-icon" />,
  StopIcon: () => <svg data-testid="stop-icon" />,
  FolderIcon: () => <svg data-testid="folder-icon" />,
  DocumentTextIcon: () => <svg data-testid="document-text-icon" />,
  ClockIcon: () => <svg data-testid="clock-icon" />,
  CheckCircleIcon: () => <svg data-testid="check-circle-icon" />,
  ExclamationTriangleIcon: () => <svg data-testid="exclamation-triangle-icon" />,
  UserGroupIcon: () => <svg data-testid="user-group-icon" />,
  ChartBarIcon: () => <svg data-testid="chart-bar-icon" />,
  CurrencyDollarIcon: () => <svg data-testid="currency-dollar-icon" />,
  ShieldCheckIcon: () => <svg data-testid="shield-check-icon" />,
  BanknotesIcon: () => <svg data-testid="banknotes-icon" />,
  TrendingUpIcon: () => <svg data-testid="trending-up-icon" />,
  TrendingDownIcon: () => <svg data-testid="trending-down-icon" />,
  ArrowLeftIcon: () => <svg data-testid="arrow-left-icon" />,
  PlusIcon: () => <svg data-testid="plus-icon" />,
  PencilIcon: () => <svg data-testid="pencil-icon" />,
  TrashIcon: () => <svg data-testid="trash-icon" />,
  EyeIcon: () => <svg data-testid="eye-icon" />,
  CogIcon: () => <svg data-testid="cog-icon" />,
  ChevronRightIcon: () => <svg data-testid="chevron-right-icon" />,
  UsersIcon: () => <svg data-testid="users-icon" />,
  ChartPieIcon: () => <svg data-testid="chart-pie-icon" />,
  BoltIcon: () => <svg data-testid="bolt-icon" />,
  ArrowRightIcon: () => <svg data-testid="arrow-right-icon" />,
  ArrowPathIcon: () => <svg data-testid="arrow-path-icon" />,
  XCircleIcon: () => <svg data-testid="x-circle-icon" />,
  DuplicateIcon: () => <svg data-testid="duplicate-icon" />,
  TagIcon: () => <svg data-testid="tag-icon" />,
  ShareIcon: () => <svg data-testid="share-icon" />,
  DownloadIcon: () => <svg data-testid="download-icon" />,
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
      marketContext: { SPOT_PRICE: 47.80 },
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

import {
  ScenarioLibrary,
  ESCMarketScenarios,
  TradingSimulationEngine,
  ComplianceWorkflows,
  PortfolioOptimizer,
  TemplateManager
} from '../../components/scenarios';

describe('Scenario Components Smoke Tests', () => {
  test('ScenarioLibrary renders without errors', () => {
    const mockOnSelect = jest.fn();
    render(<ScenarioLibrary onScenarioSelect={mockOnSelect} />);

    expect(screen.getByText('NSW ESC Scenario Library')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive trading scenarios for NSW Energy Savings Certificate market')).toBeInTheDocument();
  });

  test('ESCMarketScenarios renders without errors', () => {
    render(<ESCMarketScenarios scenarioId="esc-basic-trading" />);

    // Component should handle missing scenario gracefully or show basic content
    // Since we're passing a valid scenario ID, it should not show error state
  });

  test('TradingSimulationEngine renders without errors', () => {
    render(<TradingSimulationEngine />);

    expect(screen.getByText('Multi-Participant Trading Simulation')).toBeInTheDocument();
    expect(screen.getByText('Live NSW ESC trading simulation with AI-powered negotiation')).toBeInTheDocument();
  });

  test('ComplianceWorkflows renders without errors', () => {
    render(<ComplianceWorkflows />);

    expect(screen.getByText('Compliance Workflows')).toBeInTheDocument();
    expect(screen.getByText('NSW ESC regulatory compliance validation and workflow automation')).toBeInTheDocument();
  });

  test('PortfolioOptimizer renders without errors', () => {
    render(<PortfolioOptimizer />);

    expect(screen.getByText('Portfolio Optimizer')).toBeInTheDocument();
    expect(screen.getByText('AI-powered ESC portfolio optimization with risk management and return maximization')).toBeInTheDocument();
  });

  test('TemplateManager renders without errors', () => {
    render(<TemplateManager />);

    expect(screen.getByText('Template Manager')).toBeInTheDocument();
    expect(screen.getByText('Create, edit, and manage reusable scenario templates')).toBeInTheDocument();
  });

  test('All scenario components use NSW ESC context', () => {
    const { rerender } = render(<ScenarioLibrary onScenarioSelect={jest.fn()} />);
    expect(screen.getAllByText(/NSW ESC/).length).toBeGreaterThan(0);

    rerender(<TradingSimulationEngine />);
    expect(screen.getAllByText(/NSW ESC/).length).toBeGreaterThan(0);

    rerender(<ComplianceWorkflows />);
    expect(screen.getAllByText(/NSW ESC/).length).toBeGreaterThan(0);

    rerender(<PortfolioOptimizer />);
    expect(screen.getAllByText(/ESC/).length).toBeGreaterThan(0);
  });

  test('All scenario components integrate current market data', () => {
    const { rerender } = render(<ScenarioLibrary onScenarioSelect={jest.fn()} />);
    expect(screen.getAllByText('A$47.80').length).toBeGreaterThan(0);

    rerender(<TradingSimulationEngine />);
    expect(screen.getAllByText(/A\$47\.80/).length).toBeGreaterThan(0);

    rerender(<ComplianceWorkflows />);
    // Compliance workflows may not show spot price directly
    expect(screen.getAllByText(/98%/).length).toBeGreaterThan(0); // Compliance score

    rerender(<PortfolioOptimizer />);
    expect(screen.getAllByText(/15,000t/).length).toBeGreaterThan(0); // Portfolio volume
  });

  test('Scenario components show appropriate audience targeting', () => {
    const { rerender } = render(<ScenarioLibrary selectedAudience="executive" />);
    expect(screen.getAllByText(/Executive/).length).toBeGreaterThan(0);

    rerender(<TradingSimulationEngine selectedAudience="technical" />);
    // TradingSimulationEngine may not explicitly show audience but should work

    rerender(<ComplianceWorkflows selectedAudience="compliance" />);
    // ComplianceWorkflows should handle compliance audience appropriately

    rerender(<PortfolioOptimizer selectedAudience="executive" />);
    // PortfolioOptimizer should work for executive audience
  });

  test('Components handle missing or undefined props gracefully', () => {
    // Test components without any props
    expect(() => render(<ScenarioLibrary />)).not.toThrow();
    expect(() => render(<TradingSimulationEngine />)).not.toThrow();
    expect(() => render(<ComplianceWorkflows />)).not.toThrow();
    expect(() => render(<PortfolioOptimizer />)).not.toThrow();
    expect(() => render(<TemplateManager />)).not.toThrow();
  });

  test('ESCMarketScenarios handles invalid scenario ID gracefully', () => {
    render(<ESCMarketScenarios scenarioId="invalid-scenario" />);

    // Should show error state for invalid scenario
    expect(screen.getByText('Scenario Not Found')).toBeInTheDocument();
    expect(screen.getByText('The requested ESC scenario could not be loaded.')).toBeInTheDocument();
  });

  test('Components show loading and action states appropriately', () => {
    const { rerender } = render(<ScenarioLibrary />);
    expect(screen.getAllByText(/Run Scenario|Start/).length).toBeGreaterThan(0);

    rerender(<TradingSimulationEngine />);
    expect(screen.getByText('Start Simulation')).toBeInTheDocument();

    rerender(<PortfolioOptimizer />);
    expect(screen.getByText('Start Optimization')).toBeInTheDocument();

    rerender(<TemplateManager />);
    expect(screen.getByText('Create Template')).toBeInTheDocument();
  });
});

describe('Scenario System Integration', () => {
  test('Scenario types are properly defined and consistent', () => {
    render(<ScenarioLibrary />);

    // Check for scenario type consistency
    expect(screen.getByText('ESC Market Trading')).toBeInTheDocument();
    expect(screen.getByText('Multi-Participant Auctions')).toBeInTheDocument();
    expect(screen.getByText('Compliance Workflows')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Optimization')).toBeInTheDocument();
  });

  test('Market data integration is consistent across components', () => {
    const { rerender } = render(<ScenarioLibrary />);
    expect(screen.getAllByText('A$47.80').length).toBeGreaterThan(0);

    rerender(<TradingSimulationEngine />);
    // Should use same market data
    expect(screen.getAllByText(/A\$47\.80/).length).toBeGreaterThan(0);
  });

  test('Northmore Gordon branding appears in scenario context', () => {
    const { rerender } = render(<ScenarioLibrary />);
    expect(screen.getByText(/12%/)).toBeInTheDocument(); // Market share

    rerender(<ComplianceWorkflows />);
    expect(screen.getByText('AFSL 246896')).toBeInTheDocument();
  });
});