/**
 * B5: Professional Export Enhancement - Export Modal Tests
 *
 * Tests for the ExportModal component including:
 * - Rendering and visibility
 * - Format selection
 * - Template selection
 * - Preview rendering
 * - Download triggers
 * - Error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportModal from '@/components/export/ExportModal';
import type { ReportData } from '@/lib/export-utilities';

// Mock the export utilities
jest.mock('@/lib/export-utilities', () => {
  const actual = jest.requireActual('@/lib/export-utilities');
  return {
    ...actual,
    exportEnhancedReport: jest.fn().mockResolvedValue({
      success: true,
      data: 'mock,csv,data',
      filename: 'WREI_test.csv',
      mimeType: 'text/csv',
      size: 100,
    }),
    triggerDownload: jest.fn().mockReturnValue(true),
    generateExportPreview: jest.fn().mockReturnValue('Preview content line 1\nPreview content line 2'),
  };
});

// =============================================================================
// TEST FIXTURES
// =============================================================================

function createMockReportData(): ReportData {
  const baseMetrics = {
    irr: 0.12,
    npv: 5_000_000,
    mirr: 0.108,
    cashOnCash: 0.08,
    cagr: 0.115,
    totalReturn: 0.75,
    sharpeRatio: 1.5,
    sortinoRatio: 2.0,
    calmarRatio: 0.8,
    treynorRatio: 0.1,
    informationRatio: 0.5,
    optimizedAllocation: { carbon_credits: 0.4, asset_co: 0.4, dual_portfolio: 0.2 },
    riskContribution: { carbon_credits: 0.35, asset_co: 0.35, dual_portfolio: 0.30 },
    diversificationRatio: 1.2,
    concentrationRisk: 0.4,
    frankingCreditValue: 0.0128,
    cgtDiscount: 0.5,
    negativeGearing: 0.02,
    effectiveTaxRate: 0.23,
    maxDrawdown: 0.15,
    volatility: 0.18,
    correlationScore: 0.3,
    benchmarkOutperformance: { 'ASX 200': 0.04, 'USYC': 0.07 },
    trackingError: 0.05,
    activeReturn: 0.04,
    betaToMarket: 0.8,
  };

  const buildCase = (mult: number) => ({
    ...baseMetrics,
    irr: baseMetrics.irr * mult,
    npv: baseMetrics.npv * mult,
    totalReturn: baseMetrics.totalReturn * mult,
  });

  return {
    investmentSummary: {
      tokenType: 'dual_portfolio',
      investmentAmount: 10_000_000,
      timeHorizon: 5,
      expectedReturn: 0.185,
      riskLevel: 'professional',
    },
    professionalMetrics: baseMetrics as any,
    scenarioAnalysis: {
      baseCase: buildCase(1.0) as any,
      bullCase: buildCase(1.5) as any,
      bearCase: buildCase(0.5) as any,
      stressCase: buildCase(0.2) as any,
      probabilityWeighted: buildCase(0.95) as any,
    },
    chartData: {
      performanceChart: [],
      riskReturnScatter: [],
      allocationPie: [],
      drawdownChart: [],
      rollingReturns: [],
      correlationHeatmap: [],
    },
    complianceData: {
      regulatoryStatus: 'Australian AFSL 534187',
      disclosures: ['Investment values may fall as well as rise'],
      riskWarnings: ['Technology risks apply'],
      taxImplications: ['Income treatment for revenue share'],
    },
    marketData: {
      benchmarkComparisons: { 'ASX 200': 0.04 },
      competitivePositioning: ['T+0 settlement'],
      marketTrends: ['Growing market'],
    },
    generatedAt: '2026-03-24T10:00:00.000Z',
    validUntil: '2026-04-23T10:00:00.000Z',
    reportVersion: '6.2.0',
  };
}

// =============================================================================
// RENDERING TESTS
// =============================================================================

describe('ExportModal Rendering', () => {
  test('does not render when isOpen is false', () => {
    render(
      <ExportModal
        isOpen={false}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
  });

  test('renders when isOpen is true', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    expect(screen.getByTestId('export-modal')).toBeInTheDocument();
    expect(screen.getByText('Export Professional Report')).toBeInTheDocument();
  });

  test('displays format selection options', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    expect(screen.getByTestId('format-csv')).toBeInTheDocument();
    expect(screen.getByTestId('format-json')).toBeInTheDocument();
    expect(screen.getByTestId('format-pdf')).toBeInTheDocument();
    // Text should appear (may appear in both button and summary)
    expect(screen.getAllByText('CSV Data').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('JSON API').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Text Report').length).toBeGreaterThanOrEqual(1);
  });

  test('displays template selection options', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    expect(screen.getByTestId('template-executive_summary')).toBeInTheDocument();
    expect(screen.getByTestId('template-detailed_analysis')).toBeInTheDocument();
    expect(screen.getByTestId('template-compliance_report')).toBeInTheDocument();
    // Text appears in both button and summary for selected template
    expect(screen.getAllByText('Detailed Analysis').length).toBeGreaterThanOrEqual(1);
  });

  test('displays download button', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    expect(screen.getByTestId('export-download-btn')).toBeInTheDocument();
    expect(screen.getByText('Download Report')).toBeInTheDocument();
  });

  test('displays recipient information in summary', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
        recipientName="John Smith"
        recipientClassification="professional"
      />
    );
    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
    expect(screen.getByText(/professional/)).toBeInTheDocument();
  });
});

// =============================================================================
// FORMAT SELECTION TESTS
// =============================================================================

describe('ExportModal Format Selection', () => {
  test('CSV format is selected by default', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    const csvBtn = screen.getByTestId('format-csv');
    expect(csvBtn.className).toContain('border-blue-500');
  });

  test('clicking JSON format updates selection', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    const jsonBtn = screen.getByTestId('format-json');
    fireEvent.click(jsonBtn);
    expect(jsonBtn.className).toContain('border-blue-500');
  });

  test('clicking Text Report format updates selection', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    const pdfBtn = screen.getByTestId('format-pdf');
    fireEvent.click(pdfBtn);
    expect(pdfBtn.className).toContain('border-blue-500');
  });

  test('summary shows selected format', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    // CSV Data appears in both the button and the summary
    expect(screen.getAllByText('CSV Data').length).toBe(2);

    // Change to JSON
    fireEvent.click(screen.getByTestId('format-json'));
    // The summary should now show JSON API (appears in button + summary)
    const summaryElements = screen.getAllByText('JSON API');
    expect(summaryElements.length).toBe(2);
    // CSV Data should now appear only once (in button, not summary)
    expect(screen.getAllByText('CSV Data').length).toBe(1);
  });
});

// =============================================================================
// TEMPLATE SELECTION TESTS
// =============================================================================

describe('ExportModal Template Selection', () => {
  test('Detailed Analysis is selected by default', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    const detailedBtn = screen.getByTestId('template-detailed_analysis');
    expect(detailedBtn.className).toContain('border-green-500');
  });

  test('clicking Executive Summary updates selection', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    const execBtn = screen.getByTestId('template-executive_summary');
    fireEvent.click(execBtn);
    expect(execBtn.className).toContain('border-green-500');
  });

  test('clicking Compliance Report updates selection', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    const complianceBtn = screen.getByTestId('template-compliance_report');
    fireEvent.click(complianceBtn);
    expect(complianceBtn.className).toContain('border-green-500');
  });
});

// =============================================================================
// PREVIEW TESTS
// =============================================================================

describe('ExportModal Preview', () => {
  test('preview is hidden by default', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    expect(screen.queryByTestId('preview-pane')).not.toBeInTheDocument();
  });

  test('clicking Show Preview reveals preview pane', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    fireEvent.click(screen.getByTestId('preview-toggle'));
    expect(screen.getByTestId('preview-pane')).toBeInTheDocument();
  });

  test('clicking Hide Preview hides preview pane', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    // Show preview
    fireEvent.click(screen.getByTestId('preview-toggle'));
    expect(screen.getByTestId('preview-pane')).toBeInTheDocument();

    // Hide preview
    fireEvent.click(screen.getByTestId('preview-toggle'));
    expect(screen.queryByTestId('preview-pane')).not.toBeInTheDocument();
  });

  test('preview contains content', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );
    fireEvent.click(screen.getByTestId('preview-toggle'));
    const pane = screen.getByTestId('preview-pane');
    expect(pane.textContent).toContain('Preview content');
  });
});

// =============================================================================
// CLOSE/CANCEL TESTS
// =============================================================================

describe('ExportModal Close Behaviour', () => {
  test('calls onClose when Cancel is clicked', () => {
    const onClose = jest.fn();
    render(
      <ExportModal
        isOpen={true}
        onClose={onClose}
        reportData={createMockReportData()}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <ExportModal
        isOpen={true}
        onClose={onClose}
        reportData={createMockReportData()}
      />
    );
    fireEvent.click(screen.getByTestId('export-modal-close'));
    expect(onClose).toHaveBeenCalled();
  });

  test('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(
      <ExportModal
        isOpen={true}
        onClose={onClose}
        reportData={createMockReportData()}
      />
    );
    // Click the backdrop (the outer div)
    fireEvent.click(screen.getByTestId('export-modal'));
    expect(onClose).toHaveBeenCalled();
  });
});

// =============================================================================
// DOWNLOAD TESTS
// =============================================================================

describe('ExportModal Download', () => {
  const { exportEnhancedReport, triggerDownload } = require('@/lib/export-utilities');

  beforeEach(() => {
    jest.clearAllMocks();
    exportEnhancedReport.mockResolvedValue({
      success: true,
      data: 'mock,csv,data',
      filename: 'WREI_test.csv',
      mimeType: 'text/csv',
      size: 100,
    });
    triggerDownload.mockReturnValue(true);
  });

  test('clicking Download Report triggers export', async () => {
    const onClose = jest.fn();
    render(
      <ExportModal
        isOpen={true}
        onClose={onClose}
        reportData={createMockReportData()}
      />
    );

    fireEvent.click(screen.getByTestId('export-download-btn'));

    await waitFor(() => {
      expect(exportEnhancedReport).toHaveBeenCalled();
    });
  });

  test('calls onClose after successful download', async () => {
    const onClose = jest.fn();
    render(
      <ExportModal
        isOpen={true}
        onClose={onClose}
        reportData={createMockReportData()}
      />
    );

    fireEvent.click(screen.getByTestId('export-download-btn'));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('shows error when export fails', async () => {
    exportEnhancedReport.mockResolvedValue({
      success: false,
      error: 'Test export error',
    });

    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );

    fireEvent.click(screen.getByTestId('export-download-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('export-error')).toBeInTheDocument();
      expect(screen.getByText(/Test export error/)).toBeInTheDocument();
    });
  });

  test('shows error when download trigger fails', async () => {
    triggerDownload.mockReturnValue(false);

    render(
      <ExportModal
        isOpen={true}
        onClose={jest.fn()}
        reportData={createMockReportData()}
      />
    );

    fireEvent.click(screen.getByTestId('export-download-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('export-error')).toBeInTheDocument();
    });
  });
});
