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
// CSV EXPORT FUNCTIONS
// =============================================================================

export function generateCSVData(reportData: ReportData, dataType: 'metrics' | 'scenarios' | 'charts'): string {
  let csvContent = '';

  switch (dataType) {
    case 'metrics':
      csvContent = [
        'Metric,Value,Description',
        `IRR,${reportData.professionalMetrics.irr},Internal Rate of Return`,
        `NPV,${reportData.professionalMetrics.npv},Net Present Value`,
        `Sharpe Ratio,${reportData.professionalMetrics.sharpeRatio},Risk-adjusted return`,
        `Cash-on-Cash,${reportData.professionalMetrics.cashOnCash},Annual cash yield`,
        `CAGR,${reportData.professionalMetrics.cagr},Compound Annual Growth Rate`,
        `Total Return,${reportData.professionalMetrics.totalReturn},Total investment return`
      ].join('\n');
      break;

    case 'scenarios':
      csvContent = [
        'Scenario,Probability,IRR,NPV,Total Return',
        `Base Case,40%,${reportData.scenarioAnalysis.baseCase.irr},${reportData.scenarioAnalysis.baseCase.npv},${reportData.scenarioAnalysis.baseCase.totalReturn}`,
        `Bull Case,25%,${reportData.scenarioAnalysis.bullCase.irr},${reportData.scenarioAnalysis.bullCase.npv},${reportData.scenarioAnalysis.bullCase.totalReturn}`,
        `Bear Case,25%,${reportData.scenarioAnalysis.bearCase.irr},${reportData.scenarioAnalysis.bearCase.npv},${reportData.scenarioAnalysis.bearCase.totalReturn}`,
        `Stress Case,10%,${reportData.scenarioAnalysis.stressCase.irr},${reportData.scenarioAnalysis.stressCase.npv},${reportData.scenarioAnalysis.stressCase.totalReturn}`
      ].join('\n');
      break;

    case 'charts':
      csvContent = [
        'Date,Portfolio Value,Benchmark Value',
        ...reportData.chartData.performanceChart.map(point =>
          `${point.date},${point.value},${point.benchmark || ''}`
        )
      ].join('\n');
      break;
  }

  return csvContent;
}

// =============================================================================
// MAIN EXPORT FUNCTIONS
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
          downloadUrl: `data:text/html;base64,${btoa(pdfHtml)}`
        };

      case 'excel':
        const excelData = generateExcelReport(reportData, options);
        return {
          success: true,
          data: excelData,
          downloadUrl: 'excel-data-generated' // Would be actual Excel file in production
        };

      case 'csv':
        const csvData = generateCSVData(reportData, 'metrics');
        return {
          success: true,
          data: csvData,
          downloadUrl: `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`
        };

      case 'json':
        const jsonData = JSON.stringify(reportData, null, 2);
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
// Type exports for external use