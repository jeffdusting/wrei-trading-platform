/**
 * WREI Export Utilities - Professional Reporting Capabilities
 *
 * Phase 6.2: Export capabilities for institutional reports
 * Supporting PDF and Excel generation for professional investors
 *
 * Features:
 * - PDF report generation with professional formatting
 * - Excel analytics workbooks with multiple sheets
 * - Institutional-grade presentation layouts
 * - Australian compliance reporting templates
 * - Automated chart and data visualization export
 * - Multi-format data serialization
 */

import type {
  WREITokenType,
  InvestorClassification,
  FinancialMetrics
} from './types';
import type {
  ProfessionalMetrics,
  ScenarioAnalysis,
  MonteCarloResults,
  PerformanceAttribution,
  ProfessionalChartData
} from './professional-analytics';

// =============================================================================
// EXPORT INTERFACES
// =============================================================================

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  template: 'executive_summary' | 'detailed_analysis' | 'compliance_report' | 'pitch_deck';
  includeCharts: boolean;
  includeRiskMetrics: boolean;
  includeScenarios: boolean;
  includeCompliance: boolean;
  branding: {
    logo?: string;
    companyName: string;
    reportTitle: string;
    confidential: boolean;
  };
  recipient: {
    name: string;
    organization: string;
    classification: InvestorClassification;
  };
}

export interface ReportData {
  // Investment Summary
  investmentSummary: {
    tokenType: WREITokenType;
    investmentAmount: number;
    timeHorizon: number;
    expectedReturn: number;
    riskLevel: string;
  };

  // Financial Analysis
  professionalMetrics: ProfessionalMetrics;
  scenarioAnalysis: ScenarioAnalysis;
  monteCarloResults?: MonteCarloResults;
  performanceAttribution?: PerformanceAttribution;

  // Charts and Visualizations
  chartData: ProfessionalChartData;

  // Compliance and Legal
  complianceData: {
    regulatoryStatus: string;
    disclosures: string[];
    riskWarnings: string[];
    taxImplications: string[];
  };

  // Market Intelligence
  marketData: {
    benchmarkComparisons: { [benchmark: string]: number };
    competitivePositioning: string[];
    marketTrends: string[];
  };

  // Metadata
  generatedAt: string;
  validUntil: string;
  reportVersion: string;
}

// =============================================================================
// PDF REPORT GENERATION
// =============================================================================

export function generatePDFReport(
  reportData: ReportData,
  options: ExportOptions
): string {
  // This would integrate with a PDF generation library like jsPDF or Puppeteer
  // For now, returning formatted HTML that can be converted to PDF

  const { branding, recipient } = options;
  const { investmentSummary, professionalMetrics, scenarioAnalysis } = reportData;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${branding.reportTitle}</title>
        <style>
            body {
                font-family: 'Helvetica', Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #1e293b;
                line-height: 1.6;
            }
            .header {
                border-bottom: 3px solid #1B2A4A;
                padding-bottom: 20px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .logo { font-size: 28px; font-weight: bold; color: #1B2A4A; }
            .confidential {
                background: #ef4444;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            .executive-summary {
                background: linear-gradient(135deg, #1B2A4A 0%, #0EA5E9 100%);
                color: white;
                padding: 30px;
                border-radius: 12px;
                margin-bottom: 30px;
            }
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin: 30px 0;
            }
            .metric-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
            }
            .metric-value {
                font-size: 24px;
                font-weight: bold;
                color: #0EA5E9;
                margin-bottom: 5px;
            }
            .metric-label {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .section {
                margin-bottom: 40px;
                page-break-inside: avoid;
            }
            .section-title {
                font-size: 20px;
                font-weight: bold;
                color: #1B2A4A;
                border-bottom: 2px solid #0EA5E9;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .risk-warning {
                background: #fef2f2;
                border-left: 4px solid #ef4444;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .footer {
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
                margin-top: 40px;
                font-size: 12px;
                color: #64748b;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            th, td {
                border: 1px solid #e2e8f0;
                padding: 12px;
                text-align: left;
            }
            th {
                background: #f1f5f9;
                font-weight: bold;
                color: #1e293b;
            }
            .page-break { page-break-before: always; }
        </style>
    </head>
    <body>
        <!-- Header -->
        <div class="header">
            <div class="logo">WREI • ${branding.companyName}</div>
            ${options.branding.confidential ? '<div class="confidential">CONFIDENTIAL</div>' : ''}
        </div>

        <!-- Executive Summary -->
        <div class="executive-summary">
            <h1>${branding.reportTitle}</h1>
            <p><strong>Prepared for:</strong> ${recipient.name} • ${recipient.organization}</p>
            <p><strong>Classification:</strong> ${recipient.classification.toUpperCase()} Investor</p>
            <p><strong>Generated:</strong> ${new Date(reportData.generatedAt).toLocaleDateString('en-AU')}</p>
        </div>

        <!-- Investment Summary -->
        <div class="section">
            <h2 class="section-title">Investment Summary</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">A$${(investmentSummary.investmentAmount / 1_000_000).toFixed(1)}M</div>
                    <div class="metric-label">Investment Amount</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${(professionalMetrics.irr * 100).toFixed(1)}%</div>
                    <div class="metric-label">Expected IRR</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">A$${(professionalMetrics.npv / 1_000_000).toFixed(1)}M</div>
                    <div class="metric-label">Net Present Value</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${professionalMetrics.sharpeRatio.toFixed(2)}</div>
                    <div class="metric-label">Sharpe Ratio</div>
                </div>
            </div>
        </div>

        <!-- Financial Analysis -->
        <div class="section">
            <h2 class="section-title">Professional Financial Analysis</h2>

            <h3>Return Metrics</h3>
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td>Internal Rate of Return (IRR)</td>
                    <td>${(professionalMetrics.irr * 100).toFixed(2)}%</td>
                    <td>Annualised return rate considering time value of money</td>
                </tr>
                <tr>
                    <td>Net Present Value (NPV)</td>
                    <td>A$${(professionalMetrics.npv / 1_000_000).toFixed(2)}M</td>
                    <td>Present value of future cash flows minus initial investment</td>
                </tr>
                <tr>
                    <td>Cash-on-Cash Return</td>
                    <td>${(professionalMetrics.cashOnCash * 100).toFixed(2)}%</td>
                    <td>Annual cash flow as percentage of initial investment</td>
                </tr>
                <tr>
                    <td>Compound Annual Growth Rate (CAGR)</td>
                    <td>${(professionalMetrics.cagr * 100).toFixed(2)}%</td>
                    <td>Geometric progression ratio for investment returns</td>
                </tr>
            </table>

            <h3>Risk-Adjusted Metrics</h3>
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Benchmark</th>
                </tr>
                <tr>
                    <td>Sharpe Ratio</td>
                    <td>${professionalMetrics.sharpeRatio.toFixed(2)}</td>
                    <td>>1.0 (Excellent)</td>
                </tr>
                <tr>
                    <td>Sortino Ratio</td>
                    <td>${professionalMetrics.sortinoRatio.toFixed(2)}</td>
                    <td>>1.5 (Good)</td>
                </tr>
                <tr>
                    <td>Treynor Ratio</td>
                    <td>${professionalMetrics.treynorRatio.toFixed(2)}</td>
                    <td>Market Context</td>
                </tr>
            </table>
        </div>

        ${options.includeScenarios ? `
        <div class="section page-break">
            <h2 class="section-title">Scenario Analysis</h2>

            <table>
                <tr>
                    <th>Scenario</th>
                    <th>IRR</th>
                    <th>NPV (A$M)</th>
                    <th>Probability</th>
                </tr>
                <tr>
                    <td>Base Case</td>
                    <td>${(scenarioAnalysis.baseCase.irr * 100).toFixed(1)}%</td>
                    <td>${(scenarioAnalysis.baseCase.npv / 1_000_000).toFixed(1)}</td>
                    <td>40%</td>
                </tr>
                <tr>
                    <td>Bull Case</td>
                    <td>${(scenarioAnalysis.bullCase.irr * 100).toFixed(1)}%</td>
                    <td>${(scenarioAnalysis.bullCase.npv / 1_000_000).toFixed(1)}</td>
                    <td>25%</td>
                </tr>
                <tr>
                    <td>Bear Case</td>
                    <td>${(scenarioAnalysis.bearCase.irr * 100).toFixed(1)}%</td>
                    <td>${(scenarioAnalysis.bearCase.npv / 1_000_000).toFixed(1)}</td>
                    <td>25%</td>
                </tr>
                <tr>
                    <td>Stress Case</td>
                    <td>${(scenarioAnalysis.stressCase.irr * 100).toFixed(1)}%</td>
                    <td>${(scenarioAnalysis.stressCase.npv / 1_000_000).toFixed(1)}</td>
                    <td>10%</td>
                </tr>
            </table>
        </div>
        ` : ''}

        <!-- Australian Tax Considerations -->
        <div class="section">
            <h2 class="section-title">Australian Tax Implications</h2>

            <table>
                <tr>
                    <th>Tax Element</th>
                    <th>Treatment</th>
                    <th>Impact</th>
                </tr>
                <tr>
                    <td>Franking Credits</td>
                    <td>Full benefit if marginal rate < 30%</td>
                    <td>+${(professionalMetrics.frankingCreditValue * 100).toFixed(2)}% yield enhancement</td>
                </tr>
                <tr>
                    <td>CGT Discount</td>
                    <td>50% discount after 12 months</td>
                    <td>${(professionalMetrics.cgtDiscount * 100).toFixed(1)}% effective tax reduction</td>
                </tr>
                <tr>
                    <td>Effective Tax Rate</td>
                    <td>All-in tax on returns</td>
                    <td>${(professionalMetrics.effectiveTaxRate * 100).toFixed(1)}%</td>
                </tr>
            </table>
        </div>

        ${options.includeCompliance ? `
        <!-- Compliance and Disclosures -->
        <div class="section page-break">
            <h2 class="section-title">Regulatory Compliance & Disclosures</h2>

            <h3>Australian Financial Services Licence (AFSL)</h3>
            <p>Water Roads Pty Ltd holds AFSL 534187 authorising the provision of financial product advice
            and dealing services for managed investment schemes.</p>

            <h3>Sophisticated Investor Certification</h3>
            <p>This investment opportunity is available to ${recipient.classification} investors under
            s708 of the Corporations Act 2001 (Cth).</p>

            <div class="risk-warning">
                <h4>Important Risk Warnings</h4>
                <ul>
                    <li>Past performance is not indicative of future results</li>
                    <li>Investment values may fall as well as rise</li>
                    <li>Carbon credit values are subject to regulatory and market volatility</li>
                    <li>Tokenised assets carry technology and counterparty risks</li>
                    <li>Liquidity may be limited in secondary markets</li>
                </ul>
            </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
            <p><strong>WREI Tokenization Platform</strong> • Generated ${new Date().toLocaleString('en-AU')}
            • Valid until ${new Date(reportData.validUntil).toLocaleDateString('en-AU')}</p>
            <p>This document contains confidential and proprietary information.
            Unauthorised distribution is prohibited.</p>
            <p>© 2026 Water Roads Pty Ltd. All rights reserved. Australian AFSL 534187.</p>
        </div>
    </body>
    </html>
  `;

  return htmlTemplate;
}

// =============================================================================
// EXCEL WORKBOOK GENERATION
// =============================================================================

export function generateExcelReport(
  reportData: ReportData,
  options: ExportOptions
): any {
  // This would integrate with a library like ExcelJS or SheetJS
  // Returning structured data that can be converted to Excel format

  const workbookData = {
    metadata: {
      title: options.branding.reportTitle,
      subject: 'WREI Investment Analysis',
      creator: options.branding.companyName,
      created: new Date(),
      modified: new Date()
    },

    sheets: {
      // Executive Summary Sheet
      'Executive Summary': {
        data: [
          ['WREI Investment Analysis', '', '', ''],
          ['Generated', new Date().toLocaleDateString('en-AU'), '', ''],
          ['', '', '', ''],
          ['Investment Summary', '', '', ''],
          ['Token Type', reportData.investmentSummary.tokenType, '', ''],
          ['Investment Amount', `A$${(reportData.investmentSummary.investmentAmount / 1_000_000).toFixed(1)}M`, '', ''],
          ['Time Horizon', `${reportData.investmentSummary.timeHorizon} years`, '', ''],
          ['Expected Return', `${(reportData.investmentSummary.expectedReturn * 100).toFixed(1)}%`, '', ''],
          ['', '', '', ''],
          ['Key Metrics', 'Value', 'Description', ''],
          ['IRR', `${(reportData.professionalMetrics.irr * 100).toFixed(2)}%`, 'Internal Rate of Return', ''],
          ['NPV', `A$${(reportData.professionalMetrics.npv / 1_000_000).toFixed(2)}M`, 'Net Present Value', ''],
          ['Sharpe Ratio', reportData.professionalMetrics.sharpeRatio.toFixed(2), 'Risk-adjusted return', ''],
          ['Cash-on-Cash', `${(reportData.professionalMetrics.cashOnCash * 100).toFixed(2)}%`, 'Annual cash yield', '']
        ],
        formatting: {
          A1: { font: { bold: true, size: 16 } },
          'A4:D4': { font: { bold: true } },
          'A10:D10': { font: { bold: true } }
        }
      },

      // Financial Analysis Sheet
      'Financial Analysis': {
        data: [
          ['Comprehensive Financial Metrics', '', '', ''],
          ['', '', '', ''],
          ['Return Metrics', 'Value', 'Formula/Description', ''],
          ['IRR', reportData.professionalMetrics.irr, 'Internal Rate of Return', ''],
          ['NPV', reportData.professionalMetrics.npv, 'Net Present Value @ 4% discount', ''],
          ['MIRR', reportData.professionalMetrics.mirr, 'Modified IRR (reinvestment @ risk-free)', ''],
          ['CAGR', reportData.professionalMetrics.cagr, 'Compound Annual Growth Rate', ''],
          ['Cash-on-Cash', reportData.professionalMetrics.cashOnCash, 'Annual cash flow / initial investment', ''],
          ['', '', '', ''],
          ['Risk-Adjusted Metrics', '', '', ''],
          ['Sharpe Ratio', reportData.professionalMetrics.sharpeRatio, '(Return - Risk Free) / Volatility', ''],
          ['Sortino Ratio', reportData.professionalMetrics.sortinoRatio, 'Downside risk adjusted', ''],
          ['Calmar Ratio', reportData.professionalMetrics.calmarRatio, 'Return / Maximum Drawdown', ''],
          ['Treynor Ratio', reportData.professionalMetrics.treynorRatio, '(Return - Risk Free) / Beta', ''],
          ['', '', '', ''],
          ['Australian Tax Metrics', '', '', ''],
          ['Franking Credit Value', reportData.professionalMetrics.frankingCreditValue, 'Imputation credit benefit', ''],
          ['CGT Discount', reportData.professionalMetrics.cgtDiscount, '50% discount after 12 months', ''],
          ['Effective Tax Rate', reportData.professionalMetrics.effectiveTaxRate, 'All-in tax rate', '']
        ],
        formatting: {
          A1: { font: { bold: true, size: 14 } },
          'A3:C3': { font: { bold: true } },
          'A10:C10': { font: { bold: true } },
          'A16:C16': { font: { bold: true } }
        }
      },

      // Scenario Analysis Sheet
      'Scenario Analysis': {
        data: [
          ['Scenario Analysis Results', '', '', '', ''],
          ['', '', '', '', ''],
          ['Scenario', 'Probability', 'IRR', 'NPV (A$M)', 'Total Return'],
          ['Base Case', '40%', reportData.scenarioAnalysis.baseCase.irr, reportData.scenarioAnalysis.baseCase.npv / 1_000_000, reportData.scenarioAnalysis.baseCase.totalReturn],
          ['Bull Case', '25%', reportData.scenarioAnalysis.bullCase.irr, reportData.scenarioAnalysis.bullCase.npv / 1_000_000, reportData.scenarioAnalysis.bullCase.totalReturn],
          ['Bear Case', '25%', reportData.scenarioAnalysis.bearCase.irr, reportData.scenarioAnalysis.bearCase.npv / 1_000_000, reportData.scenarioAnalysis.bearCase.totalReturn],
          ['Stress Case', '10%', reportData.scenarioAnalysis.stressCase.irr, reportData.scenarioAnalysis.stressCase.npv / 1_000_000, reportData.scenarioAnalysis.stressCase.totalReturn],
          ['Probability Weighted', '100%', reportData.scenarioAnalysis.probabilityWeighted.irr, reportData.scenarioAnalysis.probabilityWeighted.npv / 1_000_000, reportData.scenarioAnalysis.probabilityWeighted.totalReturn],
          ['', '', '', '', ''],
          ['Scenario Assumptions', '', '', '', ''],
          ['Base Case: Expected market conditions', '', '', '', ''],
          ['Bull Case: 50% higher returns (strong carbon policy, asset appreciation)', '', '', '', ''],
          ['Bear Case: 50% lower returns (policy delays, market softness)', '', '', '', ''],
          ['Stress Case: Crisis scenario (80% return reduction)', '', '', '', '']
        ],
        formatting: {
          A1: { font: { bold: true, size: 14 } },
          'A3:E3': { font: { bold: true } },
          'A10:E10': { font: { bold: true } }
        }
      },

      // Benchmarks Sheet
      'Benchmark Comparison': {
        data: [
          ['Benchmark Analysis', '', '', ''],
          ['', '', '', ''],
          ['Benchmark', 'Return', 'WREI Outperformance', 'Notes'],
          ...Object.entries(reportData.professionalMetrics.benchmarkOutperformance).map(([benchmark, outperformance]) => [
            benchmark,
            benchmark === 'ASX 200' ? '8.0%' : benchmark === 'USYC' ? '5.0%' : benchmark === 'BUIDL' ? '4.5%' : '7.5%',
            `${(outperformance * 100).toFixed(1)}%`,
            benchmark === 'ASX 200' ? 'Australian equity market' :
            benchmark === 'USYC' ? 'US treasury token' :
            benchmark === 'BUIDL' ? 'BlackRock institutional token' :
            'Traditional infrastructure'
          ])
        ],
        formatting: {
          A1: { font: { bold: true, size: 14 } },
          'A3:D3': { font: { bold: true } }
        }
      },

      // Raw Data Sheet
      'Raw Data': {
        data: [
          ['Complete Dataset for Analysis', '', '', ''],
          ['', '', '', ''],
          ['Metric', 'Value', 'Formula/Source', ''],
          ...Object.entries(reportData.professionalMetrics).map(([key, value]) => [
            key.replace(/([A-Z])/g, ' $1').trim(),
            typeof value === 'object' ? JSON.stringify(value) : value,
            'Professional Analytics Library',
            ''
          ])
        ],
        formatting: {
          A1: { font: { bold: true, size: 14 } },
          'A3:C3': { font: { bold: true } }
        }
      }
    }
  };

  return workbookData;
}

// =============================================================================
// ENHANCED CSV EXPORT FUNCTIONS (B5: Professional Export Enhancement)
// =============================================================================

/**
 * Format a number using Australian conventions (commas for thousands)
 */
export function formatAUNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Escape a CSV field value (handles commas, quotes, newlines)
 */
export function escapeCSVField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate a CSV row from an array of values
 */
export function csvRow(values: (string | number | boolean | null | undefined)[]): string {
  return values.map(escapeCSVField).join(',');
}

export type CSVDataType = 'metrics' | 'scenarios' | 'charts' | 'comprehensive' | 'tax' | 'benchmarks' | 'risk' | 'compliance';

export function generateCSVData(reportData: ReportData, dataType: CSVDataType): string {
  const lines: string[] = [];

  switch (dataType) {
    case 'metrics':
      lines.push(csvRow(['Metric', 'Value', 'Formatted Value', 'Description']));
      lines.push(csvRow(['IRR', reportData.professionalMetrics.irr, formatAUNumber(reportData.professionalMetrics.irr * 100) + '%', 'Internal Rate of Return']));
      lines.push(csvRow(['NPV', reportData.professionalMetrics.npv, 'A$' + formatAUNumber(reportData.professionalMetrics.npv), 'Net Present Value']));
      lines.push(csvRow(['Sharpe Ratio', reportData.professionalMetrics.sharpeRatio, formatAUNumber(reportData.professionalMetrics.sharpeRatio), 'Risk-adjusted return']));
      lines.push(csvRow(['Sortino Ratio', reportData.professionalMetrics.sortinoRatio, formatAUNumber(reportData.professionalMetrics.sortinoRatio), 'Downside risk-adjusted return']));
      lines.push(csvRow(['Cash-on-Cash', reportData.professionalMetrics.cashOnCash, formatAUNumber(reportData.professionalMetrics.cashOnCash * 100) + '%', 'Annual cash yield']));
      lines.push(csvRow(['CAGR', reportData.professionalMetrics.cagr, formatAUNumber(reportData.professionalMetrics.cagr * 100) + '%', 'Compound Annual Growth Rate']));
      lines.push(csvRow(['MIRR', reportData.professionalMetrics.mirr, formatAUNumber(reportData.professionalMetrics.mirr * 100) + '%', 'Modified Internal Rate of Return']));
      lines.push(csvRow(['Total Return', reportData.professionalMetrics.totalReturn, formatAUNumber(reportData.professionalMetrics.totalReturn * 100) + '%', 'Total investment return']));
      lines.push(csvRow(['Calmar Ratio', reportData.professionalMetrics.calmarRatio, formatAUNumber(reportData.professionalMetrics.calmarRatio), 'Return / Maximum Drawdown']));
      lines.push(csvRow(['Treynor Ratio', reportData.professionalMetrics.treynorRatio, formatAUNumber(reportData.professionalMetrics.treynorRatio), 'Beta-adjusted return']));
      lines.push(csvRow(['Max Drawdown', reportData.professionalMetrics.maxDrawdown, formatAUNumber(reportData.professionalMetrics.maxDrawdown * 100) + '%', 'Maximum portfolio drawdown']));
      lines.push(csvRow(['Volatility', reportData.professionalMetrics.volatility, formatAUNumber(reportData.professionalMetrics.volatility * 100) + '%', 'Annualised volatility']));
      break;

    case 'scenarios':
      lines.push(csvRow(['Scenario', 'Probability', 'IRR', 'NPV (A$)', 'Total Return']));
      lines.push(csvRow(['Base Case', '40%', formatAUNumber(reportData.scenarioAnalysis.baseCase.irr * 100) + '%', formatAUNumber(reportData.scenarioAnalysis.baseCase.npv), formatAUNumber(reportData.scenarioAnalysis.baseCase.totalReturn * 100) + '%']));
      lines.push(csvRow(['Bull Case', '25%', formatAUNumber(reportData.scenarioAnalysis.bullCase.irr * 100) + '%', formatAUNumber(reportData.scenarioAnalysis.bullCase.npv), formatAUNumber(reportData.scenarioAnalysis.bullCase.totalReturn * 100) + '%']));
      lines.push(csvRow(['Bear Case', '25%', formatAUNumber(reportData.scenarioAnalysis.bearCase.irr * 100) + '%', formatAUNumber(reportData.scenarioAnalysis.bearCase.npv), formatAUNumber(reportData.scenarioAnalysis.bearCase.totalReturn * 100) + '%']));
      lines.push(csvRow(['Stress Case', '10%', formatAUNumber(reportData.scenarioAnalysis.stressCase.irr * 100) + '%', formatAUNumber(reportData.scenarioAnalysis.stressCase.npv), formatAUNumber(reportData.scenarioAnalysis.stressCase.totalReturn * 100) + '%']));
      if (reportData.scenarioAnalysis.probabilityWeighted) {
        lines.push(csvRow(['Probability Weighted', '100%', formatAUNumber(reportData.scenarioAnalysis.probabilityWeighted.irr * 100) + '%', formatAUNumber(reportData.scenarioAnalysis.probabilityWeighted.npv), formatAUNumber(reportData.scenarioAnalysis.probabilityWeighted.totalReturn * 100) + '%']));
      }
      break;

    case 'charts':
      lines.push(csvRow(['Date', 'Portfolio Value', 'Benchmark Value']));
      reportData.chartData.performanceChart.forEach(point => {
        lines.push(csvRow([point.date, formatAUNumber(point.value), point.benchmark !== undefined ? formatAUNumber(point.benchmark) : '']));
      });
      break;

    case 'tax':
      lines.push(csvRow(['Tax Element', 'Value', 'Description']));
      lines.push(csvRow(['Franking Credit Value', formatAUNumber(reportData.professionalMetrics.frankingCreditValue * 100) + '%', 'Imputation credit benefit']));
      lines.push(csvRow(['CGT Discount', formatAUNumber(reportData.professionalMetrics.cgtDiscount * 100) + '%', '50% discount after 12 months']));
      lines.push(csvRow(['Effective Tax Rate', formatAUNumber(reportData.professionalMetrics.effectiveTaxRate * 100) + '%', 'All-in tax rate on returns']));
      lines.push(csvRow(['Negative Gearing', formatAUNumber(reportData.professionalMetrics.negativeGearing * 100) + '%', 'Negative gearing benefit']));
      break;

    case 'benchmarks':
      lines.push(csvRow(['Benchmark', 'Outperformance', 'Notes']));
      Object.entries(reportData.professionalMetrics.benchmarkOutperformance).forEach(([benchmark, outperformance]) => {
        lines.push(csvRow([benchmark, formatAUNumber(outperformance * 100) + '%', `WREI outperformance vs ${benchmark}`]));
      });
      break;

    case 'risk':
      lines.push(csvRow(['Risk Metric', 'Value', 'Description']));
      lines.push(csvRow(['Max Drawdown', formatAUNumber(reportData.professionalMetrics.maxDrawdown * 100) + '%', 'Maximum portfolio drawdown']));
      lines.push(csvRow(['Volatility', formatAUNumber(reportData.professionalMetrics.volatility * 100) + '%', 'Annualised volatility']));
      lines.push(csvRow(['Correlation Score', formatAUNumber(reportData.professionalMetrics.correlationScore), 'Portfolio correlation']));
      lines.push(csvRow(['Beta to Market', formatAUNumber(reportData.professionalMetrics.betaToMarket), 'Market sensitivity']));
      lines.push(csvRow(['Tracking Error', formatAUNumber(reportData.professionalMetrics.trackingError * 100) + '%', 'Benchmark deviation']));
      break;

    case 'compliance':
      lines.push(csvRow(['Compliance Element', 'Details']));
      lines.push(csvRow(['Regulatory Status', reportData.complianceData.regulatoryStatus]));
      lines.push(csvRow(['Report Generated', reportData.generatedAt]));
      lines.push(csvRow(['Valid Until', reportData.validUntil]));
      lines.push(csvRow(['Report Version', reportData.reportVersion]));
      lines.push(csvRow([]));
      lines.push(csvRow(['Disclosures', '']));
      reportData.complianceData.disclosures.forEach(d => {
        lines.push(csvRow(['', d]));
      });
      lines.push(csvRow([]));
      lines.push(csvRow(['Risk Warnings', '']));
      reportData.complianceData.riskWarnings.forEach(w => {
        lines.push(csvRow(['', w]));
      });
      break;

    case 'comprehensive':
      // Multi-section comprehensive CSV export
      lines.push(csvRow(['WREI Professional Investment Analysis']));
      lines.push(csvRow(['Generated', reportData.generatedAt]));
      lines.push(csvRow(['Valid Until', reportData.validUntil]));
      lines.push(csvRow([]));

      // Investment summary
      lines.push(csvRow(['INVESTMENT SUMMARY']));
      lines.push(csvRow(['Token Type', reportData.investmentSummary.tokenType]));
      lines.push(csvRow(['Investment Amount', 'A$' + formatAUNumber(reportData.investmentSummary.investmentAmount)]));
      lines.push(csvRow(['Time Horizon', reportData.investmentSummary.timeHorizon + ' years']));
      lines.push(csvRow(['Expected Return', formatAUNumber(reportData.investmentSummary.expectedReturn * 100) + '%']));
      lines.push(csvRow([]));

      // Core metrics
      lines.push(csvRow(['RETURN METRICS', 'Value', 'Description']));
      lines.push(csvRow(['IRR', formatAUNumber(reportData.professionalMetrics.irr * 100) + '%', 'Internal Rate of Return']));
      lines.push(csvRow(['NPV', 'A$' + formatAUNumber(reportData.professionalMetrics.npv), 'Net Present Value']));
      lines.push(csvRow(['MIRR', formatAUNumber(reportData.professionalMetrics.mirr * 100) + '%', 'Modified IRR']));
      lines.push(csvRow(['CAGR', formatAUNumber(reportData.professionalMetrics.cagr * 100) + '%', 'Compound Annual Growth Rate']));
      lines.push(csvRow(['Cash-on-Cash', formatAUNumber(reportData.professionalMetrics.cashOnCash * 100) + '%', 'Annual cash yield']));
      lines.push(csvRow(['Total Return', formatAUNumber(reportData.professionalMetrics.totalReturn * 100) + '%', 'Total return']));
      lines.push(csvRow([]));

      // Risk metrics
      lines.push(csvRow(['RISK-ADJUSTED METRICS', 'Value']));
      lines.push(csvRow(['Sharpe Ratio', formatAUNumber(reportData.professionalMetrics.sharpeRatio)]));
      lines.push(csvRow(['Sortino Ratio', formatAUNumber(reportData.professionalMetrics.sortinoRatio)]));
      lines.push(csvRow(['Calmar Ratio', formatAUNumber(reportData.professionalMetrics.calmarRatio)]));
      lines.push(csvRow(['Treynor Ratio', formatAUNumber(reportData.professionalMetrics.treynorRatio)]));
      lines.push(csvRow(['Max Drawdown', formatAUNumber(reportData.professionalMetrics.maxDrawdown * 100) + '%']));
      lines.push(csvRow(['Volatility', formatAUNumber(reportData.professionalMetrics.volatility * 100) + '%']));
      lines.push(csvRow([]));

      // Tax
      lines.push(csvRow(['AUSTRALIAN TAX TREATMENT', 'Value']));
      lines.push(csvRow(['Franking Credit Value', formatAUNumber(reportData.professionalMetrics.frankingCreditValue * 100) + '%']));
      lines.push(csvRow(['CGT Discount', formatAUNumber(reportData.professionalMetrics.cgtDiscount * 100) + '%']));
      lines.push(csvRow(['Effective Tax Rate', formatAUNumber(reportData.professionalMetrics.effectiveTaxRate * 100) + '%']));
      lines.push(csvRow([]));

      // Benchmarks
      lines.push(csvRow(['BENCHMARK OUTPERFORMANCE', 'Value']));
      Object.entries(reportData.professionalMetrics.benchmarkOutperformance).forEach(([b, v]) => {
        lines.push(csvRow([b, formatAUNumber(v * 100) + '%']));
      });
      lines.push(csvRow([]));

      // Scenarios
      lines.push(csvRow(['SCENARIO ANALYSIS', 'Probability', 'IRR', 'NPV']));
      lines.push(csvRow(['Base Case', '40%', formatAUNumber(reportData.scenarioAnalysis.baseCase.irr * 100) + '%', 'A$' + formatAUNumber(reportData.scenarioAnalysis.baseCase.npv)]));
      lines.push(csvRow(['Bull Case', '25%', formatAUNumber(reportData.scenarioAnalysis.bullCase.irr * 100) + '%', 'A$' + formatAUNumber(reportData.scenarioAnalysis.bullCase.npv)]));
      lines.push(csvRow(['Bear Case', '25%', formatAUNumber(reportData.scenarioAnalysis.bearCase.irr * 100) + '%', 'A$' + formatAUNumber(reportData.scenarioAnalysis.bearCase.npv)]));
      lines.push(csvRow(['Stress Case', '10%', formatAUNumber(reportData.scenarioAnalysis.stressCase.irr * 100) + '%', 'A$' + formatAUNumber(reportData.scenarioAnalysis.stressCase.npv)]));
      break;
  }

  return lines.join('\n');
}

// =============================================================================
// ENHANCED JSON EXPORT (B5: Professional Export Enhancement)
// =============================================================================

export type JSONExportTemplate = 'full' | 'api_compatible' | 'summary' | 'compliance_only';

export interface EnhancedJSONExport {
  metadata: {
    exportVersion: string;
    generatedAt: string;
    generatedBy: string;
    template: JSONExportTemplate;
    validUntil: string;
    classification: string;
  };
  data: Record<string, unknown>;
}

export function generateEnhancedJSON(
  reportData: ReportData,
  options: ExportOptions,
  template: JSONExportTemplate = 'full'
): string {
  const metadata = {
    exportVersion: '2.0.0',
    generatedAt: new Date().toISOString(),
    generatedBy: 'WREI Professional Analytics Platform',
    template,
    validUntil: reportData.validUntil,
    classification: options.recipient.classification,
  };

  let data: Record<string, unknown>;

  switch (template) {
    case 'api_compatible':
      data = {
        investmentSummary: reportData.investmentSummary,
        metrics: {
          irr: reportData.professionalMetrics.irr,
          npv: reportData.professionalMetrics.npv,
          sharpeRatio: reportData.professionalMetrics.sharpeRatio,
          sortinoRatio: reportData.professionalMetrics.sortinoRatio,
          cashOnCash: reportData.professionalMetrics.cashOnCash,
          cagr: reportData.professionalMetrics.cagr,
          totalReturn: reportData.professionalMetrics.totalReturn,
          maxDrawdown: reportData.professionalMetrics.maxDrawdown,
          volatility: reportData.professionalMetrics.volatility,
        },
        scenarios: {
          baseCase: { irr: reportData.scenarioAnalysis.baseCase.irr, npv: reportData.scenarioAnalysis.baseCase.npv },
          bullCase: { irr: reportData.scenarioAnalysis.bullCase.irr, npv: reportData.scenarioAnalysis.bullCase.npv },
          bearCase: { irr: reportData.scenarioAnalysis.bearCase.irr, npv: reportData.scenarioAnalysis.bearCase.npv },
          stressCase: { irr: reportData.scenarioAnalysis.stressCase.irr, npv: reportData.scenarioAnalysis.stressCase.npv },
        },
        benchmarks: reportData.professionalMetrics.benchmarkOutperformance,
      };
      break;

    case 'summary':
      data = {
        tokenType: reportData.investmentSummary.tokenType,
        investmentAmount: reportData.investmentSummary.investmentAmount,
        timeHorizon: reportData.investmentSummary.timeHorizon,
        irr: reportData.professionalMetrics.irr,
        npv: reportData.professionalMetrics.npv,
        sharpeRatio: reportData.professionalMetrics.sharpeRatio,
        totalReturn: reportData.professionalMetrics.totalReturn,
        riskLevel: reportData.investmentSummary.riskLevel,
      };
      break;

    case 'compliance_only':
      data = {
        regulatoryStatus: reportData.complianceData.regulatoryStatus,
        disclosures: reportData.complianceData.disclosures,
        riskWarnings: reportData.complianceData.riskWarnings,
        taxImplications: reportData.complianceData.taxImplications,
        reportVersion: reportData.reportVersion,
        generatedAt: reportData.generatedAt,
        validUntil: reportData.validUntil,
        recipientClassification: options.recipient.classification,
      };
      break;

    case 'full':
    default:
      data = {
        investmentSummary: reportData.investmentSummary,
        professionalMetrics: reportData.professionalMetrics,
        scenarioAnalysis: reportData.scenarioAnalysis,
        complianceData: reportData.complianceData,
        marketData: reportData.marketData,
      };
      break;
  }

  const exportPayload: EnhancedJSONExport = { metadata, data };
  return JSON.stringify(exportPayload, null, 2);
}

// =============================================================================
// TEXT-BASED REPORT GENERATION (B5: Professional Export Enhancement)
// =============================================================================

/**
 * Generate a formatted text report suitable for print-to-PDF or copy-paste.
 * Avoids heavy PDF library dependencies while providing professional output.
 */
export function generateTextReport(
  reportData: ReportData,
  options: ExportOptions
): string {
  const { branding, recipient } = options;
  const { investmentSummary, professionalMetrics, scenarioAnalysis } = reportData;
  const divider = '='.repeat(72);
  const thinDivider = '-'.repeat(72);
  const now = new Date();

  const lines: string[] = [];

  // Header
  lines.push(divider);
  lines.push(`  WREI PROFESSIONAL INVESTMENT ANALYSIS`);
  lines.push(`  ${branding.reportTitle}`);
  lines.push(divider);
  if (branding.confidential) {
    lines.push('  *** CONFIDENTIAL - RESTRICTED DISTRIBUTION ***');
    lines.push('');
  }
  lines.push(`  Prepared for:    ${recipient.name}`);
  lines.push(`  Organisation:    ${recipient.organization}`);
  lines.push(`  Classification:  ${recipient.classification.toUpperCase()}`);
  lines.push(`  Generated:       ${now.toLocaleDateString('en-AU')} ${now.toLocaleTimeString('en-AU')}`);
  lines.push(`  Valid until:     ${new Date(reportData.validUntil).toLocaleDateString('en-AU')}`);
  lines.push(`  Report version:  ${reportData.reportVersion}`);
  lines.push('');

  // Investment Summary
  lines.push(divider);
  lines.push('  1. INVESTMENT SUMMARY');
  lines.push(divider);
  lines.push('');
  lines.push(`  Token Type:          ${investmentSummary.tokenType.replace(/_/g, ' ').toUpperCase()}`);
  lines.push(`  Investment Amount:   A$${formatAUNumber(investmentSummary.investmentAmount)}`);
  lines.push(`  Time Horizon:        ${investmentSummary.timeHorizon} years`);
  lines.push(`  Expected Return:     ${formatAUNumber(investmentSummary.expectedReturn * 100)}%`);
  lines.push(`  Risk Level:          ${investmentSummary.riskLevel.toUpperCase()}`);
  lines.push('');

  // Return Metrics
  lines.push(divider);
  lines.push('  2. RETURN METRICS');
  lines.push(divider);
  lines.push('');
  lines.push(padTableRow('  Metric', 'Value', 40));
  lines.push(`  ${thinDivider.slice(0, 56)}`);
  lines.push(padTableRow('  Internal Rate of Return (IRR)', formatAUNumber(professionalMetrics.irr * 100) + '%', 40));
  lines.push(padTableRow('  Net Present Value (NPV)', 'A$' + formatAUNumber(professionalMetrics.npv), 40));
  lines.push(padTableRow('  Modified IRR (MIRR)', formatAUNumber(professionalMetrics.mirr * 100) + '%', 40));
  lines.push(padTableRow('  Cash-on-Cash Return', formatAUNumber(professionalMetrics.cashOnCash * 100) + '%', 40));
  lines.push(padTableRow('  CAGR', formatAUNumber(professionalMetrics.cagr * 100) + '%', 40));
  lines.push(padTableRow('  Total Return', formatAUNumber(professionalMetrics.totalReturn * 100) + '%', 40));
  lines.push('');

  // Risk-Adjusted Metrics
  lines.push(divider);
  lines.push('  3. RISK-ADJUSTED METRICS');
  lines.push(divider);
  lines.push('');
  lines.push(padTableRow('  Metric', 'Value', 40));
  lines.push(`  ${thinDivider.slice(0, 56)}`);
  lines.push(padTableRow('  Sharpe Ratio', formatAUNumber(professionalMetrics.sharpeRatio), 40));
  lines.push(padTableRow('  Sortino Ratio', formatAUNumber(professionalMetrics.sortinoRatio), 40));
  lines.push(padTableRow('  Calmar Ratio', formatAUNumber(professionalMetrics.calmarRatio), 40));
  lines.push(padTableRow('  Treynor Ratio', formatAUNumber(professionalMetrics.treynorRatio), 40));
  lines.push(padTableRow('  Information Ratio', formatAUNumber(professionalMetrics.informationRatio), 40));
  lines.push(padTableRow('  Maximum Drawdown', formatAUNumber(professionalMetrics.maxDrawdown * 100) + '%', 40));
  lines.push(padTableRow('  Annualised Volatility', formatAUNumber(professionalMetrics.volatility * 100) + '%', 40));
  lines.push(padTableRow('  Beta to Market', formatAUNumber(professionalMetrics.betaToMarket), 40));
  lines.push('');

  // Scenario Analysis
  if (options.includeScenarios) {
    lines.push(divider);
    lines.push('  4. SCENARIO ANALYSIS');
    lines.push(divider);
    lines.push('');
    lines.push(padTableRow4('  Scenario', 'Prob.', 'IRR', 'NPV (A$)'));
    lines.push(`  ${thinDivider.slice(0, 64)}`);
    lines.push(padTableRow4('  Base Case', '40%', formatAUNumber(scenarioAnalysis.baseCase.irr * 100) + '%', formatAUNumber(scenarioAnalysis.baseCase.npv)));
    lines.push(padTableRow4('  Bull Case', '25%', formatAUNumber(scenarioAnalysis.bullCase.irr * 100) + '%', formatAUNumber(scenarioAnalysis.bullCase.npv)));
    lines.push(padTableRow4('  Bear Case', '25%', formatAUNumber(scenarioAnalysis.bearCase.irr * 100) + '%', formatAUNumber(scenarioAnalysis.bearCase.npv)));
    lines.push(padTableRow4('  Stress Case', '10%', formatAUNumber(scenarioAnalysis.stressCase.irr * 100) + '%', formatAUNumber(scenarioAnalysis.stressCase.npv)));
    lines.push('');
  }

  // Australian Tax
  lines.push(divider);
  lines.push('  5. AUSTRALIAN TAX IMPLICATIONS');
  lines.push(divider);
  lines.push('');
  lines.push(padTableRow('  Franking Credit Value', '+' + formatAUNumber(professionalMetrics.frankingCreditValue * 100) + '% yield enhancement', 40));
  lines.push(padTableRow('  CGT Discount', formatAUNumber(professionalMetrics.cgtDiscount * 100) + '% effective reduction', 40));
  lines.push(padTableRow('  Effective Tax Rate', formatAUNumber(professionalMetrics.effectiveTaxRate * 100) + '%', 40));
  lines.push('');

  // Benchmarks
  if (options.includeRiskMetrics) {
    lines.push(divider);
    lines.push('  6. BENCHMARK COMPARISON');
    lines.push(divider);
    lines.push('');
    lines.push(padTableRow('  Benchmark', 'WREI Outperformance', 40));
    lines.push(`  ${thinDivider.slice(0, 56)}`);
    Object.entries(professionalMetrics.benchmarkOutperformance).forEach(([benchmark, value]) => {
      lines.push(padTableRow(`  ${benchmark}`, '+' + formatAUNumber(value * 100) + '%', 40));
    });
    lines.push('');
  }

  // Market Data
  lines.push(divider);
  lines.push('  7. MARKET INTELLIGENCE');
  lines.push(divider);
  lines.push('');
  lines.push('  Competitive Positioning:');
  reportData.marketData.competitivePositioning.forEach(item => {
    lines.push(`    - ${item}`);
  });
  lines.push('');
  lines.push('  Market Trends:');
  reportData.marketData.marketTrends.forEach(item => {
    lines.push(`    - ${item}`);
  });
  lines.push('');

  // Compliance
  if (options.includeCompliance) {
    lines.push(divider);
    lines.push('  8. REGULATORY COMPLIANCE & DISCLOSURES');
    lines.push(divider);
    lines.push('');
    lines.push(`  Regulatory Status: ${reportData.complianceData.regulatoryStatus}`);
    lines.push('');
    lines.push('  Important Disclosures:');
    reportData.complianceData.disclosures.forEach(d => {
      lines.push(`    - ${d}`);
    });
    lines.push('');
    lines.push('  Risk Warnings:');
    reportData.complianceData.riskWarnings.forEach(w => {
      lines.push(`    - ${w}`);
    });
    lines.push('');
    lines.push('  Tax Implications:');
    reportData.complianceData.taxImplications.forEach(t => {
      lines.push(`    - ${t}`);
    });
    lines.push('');
  }

  // Footer
  lines.push(divider);
  lines.push(`  WREI Tokenisation Platform`);
  lines.push(`  Generated: ${now.toLocaleString('en-AU')}`);
  lines.push(`  This document contains confidential and proprietary information.`);
  lines.push(`  Unauthorised distribution is prohibited.`);
  lines.push(`  (c) 2026 Water Roads Pty Ltd. All rights reserved. Australian AFSL 534187.`);
  lines.push(divider);

  return lines.join('\n');
}

/**
 * Pad a two-column table row for text alignment
 */
function padTableRow(left: string, right: string, padTo: number): string {
  const paddedLeft = left.padEnd(padTo);
  return `${paddedLeft}${right}`;
}

/**
 * Pad a four-column table row for text alignment
 */
function padTableRow4(col1: string, col2: string, col3: string, col4: string): string {
  return `${col1.padEnd(20)}${col2.padEnd(10)}${col3.padEnd(16)}${col4}`;
}

// =============================================================================
// ENHANCED EXPORT RESULT INTERFACE (B5: Professional Export Enhancement)
// =============================================================================

export interface ExportResult {
  success: boolean;
  data?: string;
  error?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
}

// =============================================================================
// MAIN EXPORT FUNCTIONS (B5 Enhanced)
// =============================================================================

export async function exportReport(
  reportData: ReportData,
  options: ExportOptions
): Promise<{ success: boolean; data?: any; error?: string; downloadUrl?: string }> {
  try {
    switch (options.format) {
      case 'pdf':
        const pdfHtml = generatePDFReport(reportData, options);
        return {
          success: true,
          data: pdfHtml,
          downloadUrl: `data:text/html;base64,${btoa(unescape(encodeURIComponent(pdfHtml)))}`
        };

      case 'excel':
        const excelData = generateExcelReport(reportData, options);
        return {
          success: true,
          data: excelData,
          downloadUrl: 'excel-data-generated' // Would be actual Excel file in production
        };

      case 'csv':
        const csvData = generateCSVData(reportData, 'comprehensive');
        return {
          success: true,
          data: csvData,
          downloadUrl: `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`
        };

      case 'json':
        const jsonData = generateEnhancedJSON(reportData, options, 'full');
        return {
          success: true,
          data: jsonData,
          downloadUrl: `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`
        };

      default:
        return {
          success: false,
          error: 'Unsupported export format'
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed'
    };
  }
}

/**
 * Enhanced export function that returns ExportResult with detailed metadata.
 * Supports template selection for CSV and JSON formats.
 */
export async function exportEnhancedReport(
  reportData: ReportData,
  options: ExportOptions,
  csvDataType: CSVDataType = 'comprehensive',
  jsonTemplate: JSONExportTemplate = 'full'
): Promise<ExportResult> {
  try {
    let data: string;
    let mimeType: string;
    let extension: string;

    switch (options.format) {
      case 'pdf': {
        // Generate text-based report (avoids heavy PDF dependency)
        data = generateTextReport(reportData, options);
        mimeType = 'text/plain;charset=utf-8';
        extension = 'txt';
        break;
      }

      case 'excel': {
        // Generate comprehensive CSV as Excel-compatible format
        data = generateCSVData(reportData, 'comprehensive');
        mimeType = 'text/csv;charset=utf-8';
        extension = 'csv';
        break;
      }

      case 'csv': {
        data = generateCSVData(reportData, csvDataType);
        mimeType = 'text/csv;charset=utf-8';
        extension = 'csv';
        break;
      }

      case 'json': {
        data = generateEnhancedJSON(reportData, options, jsonTemplate);
        mimeType = 'application/json;charset=utf-8';
        extension = 'json';
        break;
      }

      default:
        return { success: false, error: 'Unsupported export format' };
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const templateStr = options.template.replace(/_/g, '-');
    const filename = `WREI_${templateStr}_${dateStr}.${extension}`;

    return {
      success: true,
      data,
      filename,
      mimeType,
      size: new Blob([data]).size,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}

/**
 * Trigger a browser download for the given export result.
 * Returns true if the download was triggered successfully.
 */
export function triggerDownload(result: ExportResult): boolean {
  if (!result.success || !result.data || !result.filename || !result.mimeType) {
    return false;
  }

  try {
    const blob = new Blob([result.data], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a preview string for the export content.
 * Returns the first N lines of the export data.
 */
export function generateExportPreview(
  reportData: ReportData,
  options: ExportOptions,
  maxLines: number = 25
): string {
  let content: string;

  switch (options.format) {
    case 'pdf':
      content = generateTextReport(reportData, options);
      break;
    case 'csv':
      content = generateCSVData(reportData, 'comprehensive');
      break;
    case 'json':
      content = generateEnhancedJSON(reportData, options, 'summary');
      break;
    default:
      content = generateCSVData(reportData, 'metrics');
      break;
  }

  const allLines = content.split('\n');
  const previewLines = allLines.slice(0, maxLines);
  if (allLines.length > maxLines) {
    previewLines.push(`\n... (${allLines.length - maxLines} more lines)`);
  }
  return previewLines.join('\n');
}

// =============================================================================
// PROFESSIONAL REPORT TEMPLATES
// =============================================================================

export function generateExecutiveSummaryTemplate(reportData: ReportData): string {
  const { investmentSummary, professionalMetrics } = reportData;

  return `
# WREI Investment Executive Summary

## Investment Overview
- **Token Type**: ${investmentSummary.tokenType.replace('_', ' ').toUpperCase()}
- **Investment Amount**: A$${(investmentSummary.investmentAmount / 1_000_000).toFixed(1)}M
- **Expected IRR**: ${(professionalMetrics.irr * 100).toFixed(1)}%
- **Risk-Adjusted Return**: ${professionalMetrics.sharpeRatio.toFixed(2)} Sharpe Ratio

## Key Financial Metrics
- **NPV**: A$${(professionalMetrics.npv / 1_000_000).toFixed(2)}M
- **Cash-on-Cash Return**: ${(professionalMetrics.cashOnCash * 100).toFixed(1)}%
- **Total Return**: ${(professionalMetrics.totalReturn * 100).toFixed(1)}%

## Competitive Advantage
- **Outperformance vs ASX 200**: +${(professionalMetrics.benchmarkOutperformance['ASX 200'] * 100).toFixed(1)}%
- **Outperformance vs USYC**: +${(professionalMetrics.benchmarkOutperformance['USYC'] * 100).toFixed(1)}%

## Australian Tax Benefits
- **Franking Credit Enhancement**: +${(professionalMetrics.frankingCreditValue * 100).toFixed(2)}%
- **CGT Discount Benefit**: ${(professionalMetrics.cgtDiscount * 100).toFixed(1)}%

## Recommendation
Based on the comprehensive analysis, this investment presents an attractive
risk-adjusted return opportunity for ${reportData.generatedAt} sophisticated investors.

---
*This summary is generated by WREI Professional Analytics Platform*
  `;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function formatCurrency(amount: number, currency: string = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function createDownloadLink(data: string, filename: string, mimeType: string): string {
  const blob = new Blob([data], { type: mimeType });
  return URL.createObjectURL(blob);
}

// =============================================================================
// EXPORTS
// =============================================================================

// All exports are already declared inline above
// Type exports for external use:
// - ExportOptions, ReportData (interfaces)
// - ExportResult, EnhancedJSONExport (B5 interfaces)
// - CSVDataType, JSONExportTemplate (B5 type aliases)
// - generatePDFReport, generateExcelReport, generateCSVData (original generators)
// - generateEnhancedJSON, generateTextReport (B5 generators)
// - exportReport, exportEnhancedReport, triggerDownload (export executors)
// - generateExportPreview (B5 preview)
// - formatCurrency, formatPercentage, formatAUNumber (formatters)
// - escapeCSVField, csvRow, createDownloadLink (utilities)