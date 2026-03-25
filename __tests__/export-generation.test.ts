/**
 * B5: Professional Export Enhancement - Export Generation Tests
 *
 * Tests for enhanced CSV, JSON, and text report generation.
 * Verifies Australian formatting, correct data structure, and completeness.
 */

import {
  generateCSVData,
  generateEnhancedJSON,
  generateTextReport,
  exportReport,
  exportEnhancedReport,
  generateExportPreview,
  formatAUNumber,
  escapeCSVField,
  csvRow,
  formatCurrency,
  formatPercentage,
  triggerDownload,
} from '@/lib/export-utilities';
import type {
  ReportData,
  ExportOptions,
  CSVDataType,
  JSONExportTemplate,
  ExportResult,
} from '@/lib/export-utilities';

// =============================================================================
// TEST DATA FIXTURES
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
    benchmarkOutperformance: { 'ASX 200': 0.04, 'USYC': 0.07, 'BUIDL': 0.075 },
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
      performanceChart: [
        { date: '2026-01', value: 1000000, benchmark: 950000 },
        { date: '2026-02', value: 1050000, benchmark: 960000 },
        { date: '2026-03', value: 1100000, benchmark: 970000 },
      ],
      riskReturnScatter: [],
      allocationPie: [],
      drawdownChart: [],
      rollingReturns: [],
      correlationHeatmap: [],
    },
    complianceData: {
      regulatoryStatus: 'Australian AFSL 534187',
      disclosures: [
        'Investment values may fall as well as rise',
        'Past performance is not indicative of future results',
      ],
      riskWarnings: [
        'Technology and counterparty risks apply',
        'Liquidity may be limited in secondary markets',
      ],
      taxImplications: [
        'Income treatment for revenue share mechanism',
        'CGT treatment for NAV-accruing mechanism',
      ],
    },
    marketData: {
      benchmarkComparisons: { 'ASX 200': 0.04, 'USYC': 0.07 },
      competitivePositioning: [
        'Native digital carbon credits with T+0 settlement',
        'Asset-backed yield from real infrastructure',
      ],
      marketTrends: [
        'A$155B carbon market projected by 2030',
        'A$19B tokenised RWA market growth',
      ],
    },
    generatedAt: '2026-03-24T10:00:00.000Z',
    validUntil: '2026-04-23T10:00:00.000Z',
    reportVersion: '6.2.0',
  };
}

function createMockExportOptions(format: 'pdf' | 'excel' | 'csv' | 'json' = 'csv'): ExportOptions {
  return {
    format,
    template: 'detailed_analysis',
    includeCharts: true,
    includeRiskMetrics: true,
    includeScenarios: true,
    includeCompliance: true,
    branding: {
      companyName: 'Water Roads Pty Ltd',
      reportTitle: 'WREI Professional Investment Analysis',
      confidential: true,
    },
    recipient: {
      name: 'Test Investor',
      organization: 'Test Organisation',
      classification: 'professional',
    },
  };
}

// =============================================================================
// UTILITY FUNCTION TESTS
// =============================================================================

describe('Export Utilities - Formatting Functions', () => {
  test('formatAUNumber formats with Australian conventions', () => {
    expect(formatAUNumber(1234567.89)).toMatch(/1.*234.*567.*89/);
    expect(formatAUNumber(0.5, 1)).toBe('0.5');
    expect(formatAUNumber(1000, 0)).toMatch(/1.*000/);
  });

  test('formatAUNumber handles negative numbers', () => {
    const result = formatAUNumber(-1234.56);
    expect(result).toContain('1');
    expect(result).toContain('234');
  });

  test('formatAUNumber handles zero', () => {
    expect(formatAUNumber(0)).toBe('0.00');
  });

  test('escapeCSVField handles normal values', () => {
    expect(escapeCSVField('hello')).toBe('hello');
    expect(escapeCSVField(42)).toBe('42');
    expect(escapeCSVField(true)).toBe('true');
  });

  test('escapeCSVField escapes commas', () => {
    expect(escapeCSVField('hello, world')).toBe('"hello, world"');
  });

  test('escapeCSVField escapes double quotes', () => {
    expect(escapeCSVField('say "hello"')).toBe('"say ""hello"""');
  });

  test('escapeCSVField escapes newlines', () => {
    expect(escapeCSVField('line1\nline2')).toBe('"line1\nline2"');
  });

  test('escapeCSVField handles null and undefined', () => {
    expect(escapeCSVField(null)).toBe('');
    expect(escapeCSVField(undefined)).toBe('');
  });

  test('csvRow joins values with commas', () => {
    const row = csvRow(['Name', 100, 'Description']);
    expect(row).toBe('Name,100,Description');
  });

  test('csvRow escapes values that need it', () => {
    const row = csvRow(['Hello, world', 'normal', '"quoted"']);
    expect(row).toContain('"Hello, world"');
    expect(row).toContain('normal');
  });

  test('formatCurrency formats as Australian dollars', () => {
    const result = formatCurrency(1234567);
    expect(result).toContain('1');
    expect(result).toContain('234');
    expect(result).toContain('567');
  });

  test('formatPercentage formats correctly', () => {
    expect(formatPercentage(0.1234)).toBe('12.34%');
    expect(formatPercentage(0.5, 1)).toBe('50.0%');
    expect(formatPercentage(1.0, 0)).toBe('100%');
  });
});

// =============================================================================
// CSV GENERATION TESTS
// =============================================================================

describe('CSV Generation', () => {
  const reportData = createMockReportData();

  test('generates metrics CSV with header row', () => {
    const csv = generateCSVData(reportData, 'metrics');
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Metric');
    expect(lines[0]).toContain('Value');
    expect(lines[0]).toContain('Description');
  });

  test('metrics CSV contains all key financial metrics', () => {
    const csv = generateCSVData(reportData, 'metrics');
    expect(csv).toContain('IRR');
    expect(csv).toContain('NPV');
    expect(csv).toContain('Sharpe Ratio');
    expect(csv).toContain('Sortino Ratio');
    expect(csv).toContain('Cash-on-Cash');
    expect(csv).toContain('CAGR');
    expect(csv).toContain('Total Return');
    expect(csv).toContain('Calmar Ratio');
    expect(csv).toContain('Volatility');
  });

  test('metrics CSV has formatted values', () => {
    const csv = generateCSVData(reportData, 'metrics');
    expect(csv).toContain('%');
    expect(csv).toContain('A$');
  });

  test('generates scenario CSV with all cases', () => {
    const csv = generateCSVData(reportData, 'scenarios');
    expect(csv).toContain('Base Case');
    expect(csv).toContain('Bull Case');
    expect(csv).toContain('Bear Case');
    expect(csv).toContain('Stress Case');
    expect(csv).toContain('Probability Weighted');
  });

  test('scenarios CSV includes probability column', () => {
    const csv = generateCSVData(reportData, 'scenarios');
    expect(csv).toContain('40%');
    expect(csv).toContain('25%');
    expect(csv).toContain('10%');
  });

  test('generates charts CSV with performance data', () => {
    const csv = generateCSVData(reportData, 'charts');
    expect(csv).toContain('Date');
    expect(csv).toContain('Portfolio Value');
    expect(csv).toContain('2026-01');
    expect(csv).toContain('2026-02');
    expect(csv).toContain('2026-03');
  });

  test('generates tax CSV with Australian tax elements', () => {
    const csv = generateCSVData(reportData, 'tax');
    expect(csv).toContain('Franking Credit Value');
    expect(csv).toContain('CGT Discount');
    expect(csv).toContain('Effective Tax Rate');
    expect(csv).toContain('Negative Gearing');
  });

  test('generates benchmark CSV', () => {
    const csv = generateCSVData(reportData, 'benchmarks');
    expect(csv).toContain('ASX 200');
    expect(csv).toContain('USYC');
    expect(csv).toContain('BUIDL');
    expect(csv).toContain('Outperformance');
  });

  test('generates risk CSV with risk metrics', () => {
    const csv = generateCSVData(reportData, 'risk');
    expect(csv).toContain('Max Drawdown');
    expect(csv).toContain('Volatility');
    expect(csv).toContain('Beta to Market');
    expect(csv).toContain('Tracking Error');
  });

  test('generates compliance CSV with regulatory info', () => {
    const csv = generateCSVData(reportData, 'compliance');
    expect(csv).toContain('AFSL 534187');
    expect(csv).toContain('Disclosures');
    expect(csv).toContain('Risk Warnings');
    expect(csv).toContain('Investment values may fall');
  });

  test('generates comprehensive CSV with all sections', () => {
    const csv = generateCSVData(reportData, 'comprehensive');
    expect(csv).toContain('INVESTMENT SUMMARY');
    expect(csv).toContain('RETURN METRICS');
    expect(csv).toContain('RISK-ADJUSTED METRICS');
    expect(csv).toContain('AUSTRALIAN TAX TREATMENT');
    expect(csv).toContain('BENCHMARK OUTPERFORMANCE');
    expect(csv).toContain('SCENARIO ANALYSIS');
  });

  test('comprehensive CSV includes investment amount', () => {
    const csv = generateCSVData(reportData, 'comprehensive');
    // 10,000,000 formatted
    expect(csv).toContain('10');
    expect(csv).toContain('000');
  });

  test('CSV output has consistent structure', () => {
    const csv = generateCSVData(reportData, 'metrics');
    const lines = csv.split('\n');
    // First line is the header with 4 columns
    expect(lines[0]).toBe('Metric,Value,Formatted Value,Description');
    // Each data line should start with a recognisable metric name
    const dataLines = lines.slice(1).filter(l => l.trim());
    expect(dataLines.length).toBeGreaterThan(0);
    dataLines.forEach(line => {
      // Each line should contain at least a metric name and a value
      expect(line.length).toBeGreaterThan(5);
    });
  });
});

// =============================================================================
// ENHANCED JSON GENERATION TESTS
// =============================================================================

describe('Enhanced JSON Generation', () => {
  const reportData = createMockReportData();
  const options = createMockExportOptions('json');

  test('generates full JSON with metadata', () => {
    const json = generateEnhancedJSON(reportData, options, 'full');
    const parsed = JSON.parse(json);
    expect(parsed.metadata).toBeDefined();
    expect(parsed.metadata.exportVersion).toBe('2.0.0');
    expect(parsed.metadata.generatedBy).toContain('WREI');
    expect(parsed.metadata.template).toBe('full');
    expect(parsed.metadata.classification).toBe('professional');
  });

  test('full template contains all data sections', () => {
    const json = generateEnhancedJSON(reportData, options, 'full');
    const parsed = JSON.parse(json);
    expect(parsed.data.investmentSummary).toBeDefined();
    expect(parsed.data.professionalMetrics).toBeDefined();
    expect(parsed.data.scenarioAnalysis).toBeDefined();
    expect(parsed.data.complianceData).toBeDefined();
    expect(parsed.data.marketData).toBeDefined();
  });

  test('api_compatible template has streamlined structure', () => {
    const json = generateEnhancedJSON(reportData, options, 'api_compatible');
    const parsed = JSON.parse(json);
    expect(parsed.data.metrics).toBeDefined();
    expect(parsed.data.metrics.irr).toBe(0.12);
    expect(parsed.data.metrics.npv).toBe(5_000_000);
    expect(parsed.data.scenarios).toBeDefined();
    expect(parsed.data.benchmarks).toBeDefined();
  });

  test('summary template contains key fields only', () => {
    const json = generateEnhancedJSON(reportData, options, 'summary');
    const parsed = JSON.parse(json);
    expect(parsed.data.tokenType).toBe('dual_portfolio');
    expect(parsed.data.investmentAmount).toBe(10_000_000);
    expect(parsed.data.irr).toBe(0.12);
    expect(parsed.data.npv).toBe(5_000_000);
    expect(parsed.data.sharpeRatio).toBe(1.5);
    // Should not contain deep nested structures
    expect(parsed.data.professionalMetrics).toBeUndefined();
  });

  test('compliance_only template contains only compliance data', () => {
    const json = generateEnhancedJSON(reportData, options, 'compliance_only');
    const parsed = JSON.parse(json);
    expect(parsed.data.regulatoryStatus).toContain('AFSL');
    expect(parsed.data.disclosures).toBeDefined();
    expect(Array.isArray(parsed.data.disclosures)).toBe(true);
    expect(parsed.data.riskWarnings).toBeDefined();
    expect(parsed.data.taxImplications).toBeDefined();
    // Should not contain financial metrics
    expect(parsed.data.professionalMetrics).toBeUndefined();
    expect(parsed.data.investmentSummary).toBeUndefined();
  });

  test('JSON output is valid and parseable', () => {
    const templates: JSONExportTemplate[] = ['full', 'api_compatible', 'summary', 'compliance_only'];
    templates.forEach(template => {
      const json = generateEnhancedJSON(reportData, options, template);
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  test('metadata includes valid ISO date', () => {
    const json = generateEnhancedJSON(reportData, options);
    const parsed = JSON.parse(json);
    const date = new Date(parsed.metadata.generatedAt);
    expect(date.getTime()).not.toBeNaN();
  });
});

// =============================================================================
// TEXT REPORT GENERATION TESTS
// =============================================================================

describe('Text Report Generation', () => {
  const reportData = createMockReportData();
  const options = createMockExportOptions('pdf');

  test('generates report with professional header', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('WREI PROFESSIONAL INVESTMENT ANALYSIS');
    expect(report).toContain('Water Roads Pty Ltd');
  });

  test('includes confidential notice when flagged', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('CONFIDENTIAL');
  });

  test('omits confidential notice when not flagged', () => {
    const nonConfOptions = {
      ...options,
      branding: { ...options.branding, confidential: false },
    };
    const report = generateTextReport(reportData, nonConfOptions);
    expect(report).not.toContain('CONFIDENTIAL');
  });

  test('includes recipient information', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('Test Investor');
    expect(report).toContain('Test Organisation');
    expect(report).toContain('PROFESSIONAL');
  });

  test('includes investment summary section', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('INVESTMENT SUMMARY');
    expect(report).toContain('DUAL PORTFOLIO');
    expect(report).toContain('5 years');
  });

  test('includes return metrics section', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('RETURN METRICS');
    expect(report).toContain('Internal Rate of Return');
    expect(report).toContain('Net Present Value');
    expect(report).toContain('Cash-on-Cash Return');
    expect(report).toContain('CAGR');
  });

  test('includes risk-adjusted metrics section', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('RISK-ADJUSTED METRICS');
    expect(report).toContain('Sharpe Ratio');
    expect(report).toContain('Sortino Ratio');
    expect(report).toContain('Maximum Drawdown');
  });

  test('includes scenario analysis when enabled', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('SCENARIO ANALYSIS');
    expect(report).toContain('Base Case');
    expect(report).toContain('Bull Case');
    expect(report).toContain('Bear Case');
    expect(report).toContain('Stress Case');
  });

  test('omits scenario analysis when disabled', () => {
    const noScenarioOptions = { ...options, includeScenarios: false };
    const report = generateTextReport(reportData, noScenarioOptions);
    expect(report).not.toContain('SCENARIO ANALYSIS');
  });

  test('includes Australian tax section', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('AUSTRALIAN TAX IMPLICATIONS');
    expect(report).toContain('Franking Credit Value');
    expect(report).toContain('CGT Discount');
    expect(report).toContain('Effective Tax Rate');
  });

  test('includes benchmark comparison when risk metrics enabled', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('BENCHMARK COMPARISON');
    expect(report).toContain('ASX 200');
    expect(report).toContain('USYC');
  });

  test('includes market intelligence', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('MARKET INTELLIGENCE');
    expect(report).toContain('T+0 settlement');
    expect(report).toContain('carbon market projected');
  });

  test('includes compliance section when enabled', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('REGULATORY COMPLIANCE');
    expect(report).toContain('AFSL 534187');
    expect(report).toContain('Investment values may fall');
    expect(report).toContain('Technology and counterparty risks');
  });

  test('omits compliance section when disabled', () => {
    const noComplianceOptions = { ...options, includeCompliance: false };
    const report = generateTextReport(reportData, noComplianceOptions);
    expect(report).not.toContain('REGULATORY COMPLIANCE');
  });

  test('includes proper footer with copyright', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('Water Roads Pty Ltd');
    expect(report).toContain('AFSL 534187');
    expect(report).toContain('Unauthorised distribution is prohibited');
  });

  test('uses Australian spelling', () => {
    const report = generateTextReport(reportData, options);
    expect(report).toContain('Unauthorised');
    expect(report).toContain('Tokenisation');
    expect(report).toContain('Annualised');
  });
});

// =============================================================================
// MAIN EXPORT FUNCTION TESTS
// =============================================================================

describe('exportReport Function', () => {
  const reportData = createMockReportData();

  test('exports CSV format successfully', async () => {
    const options = createMockExportOptions('csv');
    const result = await exportReport(reportData, options);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.downloadUrl).toContain('data:text/csv');
  });

  test('exports JSON format successfully', async () => {
    const options = createMockExportOptions('json');
    const result = await exportReport(reportData, options);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    // Verify the JSON is parseable
    expect(() => JSON.parse(result.data)).not.toThrow();
  });

  test('exports PDF format as HTML successfully', async () => {
    const options = createMockExportOptions('pdf');
    const result = await exportReport(reportData, options);
    expect(result.success).toBe(true);
    expect(result.data).toContain('<!DOCTYPE html>');
  });

  test('returns error for unsupported format', async () => {
    const options = createMockExportOptions('csv');
    (options as any).format = 'unsupported';
    const result = await exportReport(reportData, options);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unsupported');
  });
});

// =============================================================================
// ENHANCED EXPORT FUNCTION TESTS
// =============================================================================

describe('exportEnhancedReport Function', () => {
  const reportData = createMockReportData();

  test('returns ExportResult with metadata for CSV', async () => {
    const options = createMockExportOptions('csv');
    const result = await exportEnhancedReport(reportData, options, 'comprehensive');
    expect(result.success).toBe(true);
    expect(result.filename).toBeDefined();
    expect(result.filename).toContain('WREI');
    expect(result.filename).toContain('.csv');
    expect(result.mimeType).toContain('text/csv');
    expect(result.size).toBeGreaterThan(0);
  });

  test('returns ExportResult with metadata for JSON', async () => {
    const options = createMockExportOptions('json');
    const result = await exportEnhancedReport(reportData, options, 'comprehensive', 'full');
    expect(result.success).toBe(true);
    expect(result.filename).toContain('.json');
    expect(result.mimeType).toContain('application/json');
  });

  test('returns ExportResult with metadata for text report', async () => {
    const options = createMockExportOptions('pdf');
    const result = await exportEnhancedReport(reportData, options);
    expect(result.success).toBe(true);
    expect(result.filename).toContain('.txt');
    expect(result.mimeType).toContain('text/plain');
  });

  test('filename includes template name and date', async () => {
    const options = createMockExportOptions('csv');
    const result = await exportEnhancedReport(reportData, options);
    expect(result.filename).toContain('detailed-analysis');
    // Should contain date in YYYY-MM-DD format
    expect(result.filename).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('handles different CSV data types', async () => {
    const options = createMockExportOptions('csv');
    const types: CSVDataType[] = ['metrics', 'scenarios', 'tax', 'benchmarks', 'risk', 'compliance'];

    for (const dataType of types) {
      const result = await exportEnhancedReport(reportData, options, dataType);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThan(0);
    }
  });

  test('handles different JSON templates', async () => {
    const options = createMockExportOptions('json');
    const templates: JSONExportTemplate[] = ['full', 'api_compatible', 'summary', 'compliance_only'];

    for (const template of templates) {
      const result = await exportEnhancedReport(reportData, options, 'comprehensive', template);
      expect(result.success).toBe(true);
      expect(() => JSON.parse(result.data!)).not.toThrow();
    }
  });
});

// =============================================================================
// EXPORT PREVIEW TESTS
// =============================================================================

describe('Export Preview', () => {
  const reportData = createMockReportData();

  test('generates CSV preview', () => {
    const options = createMockExportOptions('csv');
    const preview = generateExportPreview(reportData, options, 10);
    expect(preview.split('\n').length).toBeLessThanOrEqual(12); // 10 lines + possible truncation message
    expect(preview.length).toBeGreaterThan(0);
  });

  test('generates JSON preview', () => {
    const options = createMockExportOptions('json');
    const preview = generateExportPreview(reportData, options, 10);
    expect(preview.length).toBeGreaterThan(0);
  });

  test('generates text report preview', () => {
    const options = createMockExportOptions('pdf');
    const preview = generateExportPreview(reportData, options, 10);
    expect(preview).toContain('WREI');
  });

  test('truncates long content with message', () => {
    const options = createMockExportOptions('csv');
    const preview = generateExportPreview(reportData, options, 5);
    if (preview.includes('more lines')) {
      expect(preview).toContain('...');
    }
  });
});

// =============================================================================
// DOWNLOAD TRIGGER TESTS
// =============================================================================

describe('triggerDownload', () => {
  beforeEach(() => {
    // Mock DOM methods
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    document.createElement = jest.fn().mockReturnValue(mockLink);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
    global.URL.revokeObjectURL = jest.fn();
  });

  test('returns false for failed result', () => {
    const result: ExportResult = { success: false, error: 'test error' };
    expect(triggerDownload(result)).toBe(false);
  });

  test('returns false for result without data', () => {
    const result: ExportResult = { success: true, filename: 'test.csv', mimeType: 'text/csv' };
    expect(triggerDownload(result)).toBe(false);
  });

  test('returns true for valid result', () => {
    const result: ExportResult = {
      success: true,
      data: 'test,data',
      filename: 'test.csv',
      mimeType: 'text/csv',
    };
    expect(triggerDownload(result)).toBe(true);
  });

  test('creates blob and triggers click', () => {
    const result: ExportResult = {
      success: true,
      data: 'test,data',
      filename: 'test.csv',
      mimeType: 'text/csv',
    };
    triggerDownload(result);
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});

// =============================================================================
// LARGE DATASET HANDLING TESTS
// =============================================================================

describe('Large Dataset Handling', () => {
  test('handles report with many chart data points', () => {
    const reportData = createMockReportData();
    reportData.chartData.performanceChart = Array.from({ length: 1000 }, (_, i) => ({
      date: `2026-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
      value: 1000000 + i * 1000,
      benchmark: 950000 + i * 800,
    }));

    const csv = generateCSVData(reportData, 'charts');
    const lines = csv.split('\n');
    expect(lines.length).toBe(1001); // header + 1000 data rows
  });

  test('handles report with many benchmarks', () => {
    const reportData = createMockReportData();
    for (let i = 0; i < 50; i++) {
      reportData.professionalMetrics.benchmarkOutperformance[`Benchmark_${i}`] = Math.random() * 0.2;
    }

    const csv = generateCSVData(reportData, 'benchmarks');
    const lines = csv.split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(51); // header + at least 50 benchmarks
  });

  test('comprehensive CSV handles full dataset without errors', () => {
    const reportData = createMockReportData();
    reportData.chartData.performanceChart = Array.from({ length: 500 }, (_, i) => ({
      date: `2026-${String(Math.floor(i / 30) + 1).padStart(2, '0')}`,
      value: 1000000 + i * 1000,
    }));

    expect(() => generateCSVData(reportData, 'comprehensive')).not.toThrow();
  });
});
