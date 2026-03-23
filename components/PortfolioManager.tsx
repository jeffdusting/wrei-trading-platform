'use client';

/**
 * WREI Portfolio Manager
 * Core portfolio management interface for institutional investors
 * Phase 1 Milestone 1.2 - Core Investor Journeys
 */

import { useState, useEffect } from 'react';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';
import { PersonaType } from '@/lib/types';
import { ProfessionalDataGrid } from '@/components/professional/ProfessionalDataGrid';

interface PortfolioHolding {
  id: string;
  assetType: 'carbon_credits' | 'asset_co_tokens' | 'infrastructure_asset' | 'cash';
  name: string;
  quantity: number;
  currentValue: number; // A$ value
  bookValue: number; // Original purchase value
  unrealizedPnL: number;
  lastUpdated: string;
  riskRating: 'Low' | 'Medium' | 'High';
  esgScore?: number; // 1-10 ESG rating
}

interface PortfolioSummary {
  totalValue: number; // A$ total portfolio value
  totalPnL: number; // Unrealized P&L
  totalPnLPercentage: number;
  assetAllocation: {
    carbonCredits: number; // % allocation
    assetCoTokens: number;
    infrastructureAssets: number;
    cash: number;
  };
  riskMetrics: {
    portfolioVar: number; // Value at Risk
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

interface PortfolioManagerProps {
  persona: PersonaType;
  onAssetSelect?: (asset: PortfolioHolding) => void;
  onTokenizeAsset?: (asset: PortfolioHolding) => void;
  onNegotiateAsset?: (asset: PortfolioHolding) => void;
  showTokenizationOptions?: boolean;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  persona,
  onAssetSelect,
  onTokenizeAsset,
  onNegotiateAsset,
  showTokenizationOptions = true
}) => {
  const tokens = useDesignTokens('institutional');
  const [portfolioData, setPortfolioData] = useState<PortfolioHolding[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [selectedView, setSelectedView] = useState<'holdings' | 'allocation' | 'performance'>('holdings');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate mock portfolio data based on persona
    const mockData = generateMockPortfolioData(persona);
    setPortfolioData(mockData.holdings);
    setPortfolioSummary(mockData.summary);
    setIsLoading(false);
  }, [persona]);

  const holdingsColumns = [
    { key: 'name', header: 'Asset Name', type: 'text' as const, width: '200px' },
    { key: 'assetType', header: 'Type', type: 'text' as const, width: '120px' },
    { key: 'quantity', header: 'Quantity', type: 'number' as const, width: '100px' },
    { key: 'currentValue', header: 'Market Value', type: 'currency' as const, width: '120px' },
    { key: 'unrealizedPnL', header: 'Unrealized P&L', type: 'currency' as const, width: '120px' },
    { key: 'unrealizedPnLPercentage', header: 'P&L %', type: 'percentage' as const, width: '80px' },
    { key: 'riskRating', header: 'Risk', type: 'status' as const, width: '80px' },
    { key: 'esgScore', header: 'ESG Score', type: 'number' as const, width: '80px' },
    { key: 'actions', header: 'Actions', type: 'text' as const, width: '150px' }
  ];

  // Add calculated fields to portfolio data for display
  const enhancedPortfolioData = portfolioData.map(holding => ({
    ...holding,
    unrealizedPnLPercentage: ((holding.currentValue - holding.bookValue) / holding.bookValue) * 100,
    actions: 'View • Tokenize • Trade'
  }));

  const getPersonaDisplayInfo = (persona: PersonaType) => {
    switch (persona) {
      case 'infrastructure_fund':
        return {
          name: 'Sarah Chen',
          title: 'Infrastructure Fund Manager',
          organization: 'AustralianSuper Infrastructure',
          aum: 'A$45B',
          focus: 'Long-term infrastructure assets with sustainable returns'
        };
      case 'esg_impact_investor':
        return {
          name: 'James Rodriguez',
          title: 'ESG Fund Manager',
          organization: 'Generation Investment Management',
          aum: 'A$25B',
          focus: 'Impact investing with measurable environmental outcomes'
        };
      case 'family_office':
        return {
          name: 'Margaret Thompson',
          title: 'Family Office CIO',
          organization: 'Thompson Family Office',
          aum: 'A$2.5B',
          focus: 'Conservative wealth preservation with ESG alignment'
        };
      default:
        return {
          name: 'Professional Investor',
          title: 'Portfolio Manager',
          organization: 'Investment Management',
          aum: 'A$1B+',
          focus: 'Institutional investment management'
        };
    }
  };

  const personaInfo = getPersonaDisplayInfo(persona);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Portfolio Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{personaInfo.name} - Portfolio Overview</h1>
            <p className="text-slate-600 mt-1">{personaInfo.title}, {personaInfo.organization}</p>
            <p className="text-sm text-slate-500 mt-1">AUM: {personaInfo.aum} • Focus: {personaInfo.focus}</p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-slate-800">
              {portfolioSummary ? `A$${(portfolioSummary.totalValue / 1000000).toFixed(1)}M` : 'Loading...'}
            </div>
            <div className={`text-lg font-semibold ${
              portfolioSummary && portfolioSummary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {portfolioSummary ? `${portfolioSummary.totalPnL >= 0 ? '+' : ''}A$${(portfolioSummary.totalPnL / 1000000).toFixed(2)}M` : ''}
              {portfolioSummary ? ` (${portfolioSummary.totalPnLPercentage >= 0 ? '+' : ''}${portfolioSummary.totalPnLPercentage.toFixed(2)}%)` : ''}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Import Assets
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Tokenize Asset
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Start Negotiation
          </button>
          <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      {portfolioSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600">Carbon Credits</div>
            <div className="text-xl font-semibold text-slate-800">
              {portfolioSummary.assetAllocation.carbonCredits.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600">Asset Co Tokens</div>
            <div className="text-xl font-semibold text-slate-800">
              {portfolioSummary.assetAllocation.assetCoTokens.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600">Infrastructure</div>
            <div className="text-xl font-semibold text-slate-800">
              {portfolioSummary.assetAllocation.infrastructureAssets.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="text-sm text-slate-600">Cash</div>
            <div className="text-xl font-semibold text-slate-800">
              {portfolioSummary.assetAllocation.cash.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* View Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex space-x-1">
            {[
              { key: 'holdings', label: 'Holdings' },
              { key: 'allocation', label: 'Asset Allocation' },
              { key: 'performance', label: 'Performance' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedView(tab.key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedView === tab.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {selectedView === 'holdings' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Portfolio Holdings</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50">
                    Filter
                  </button>
                  <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50">
                    Export
                  </button>
                </div>
              </div>

              <ProfessionalDataGrid
                columns={holdingsColumns}
                data={enhancedPortfolioData}
                title="Current Holdings"
                loading={isLoading}
                className="portfolio-holdings-grid"
              />
            </div>
          )}

          {selectedView === 'allocation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Asset Allocation Analysis</h3>

              {portfolioSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Allocation */}
                  <div>
                    <h4 className="text-md font-medium text-slate-700 mb-3">Current Allocation</h4>
                    <div className="space-y-3">
                      {Object.entries(portfolioSummary.assetAllocation).map(([asset, percentage]) => (
                        <div key={asset} className="flex items-center">
                          <div className="w-32 text-sm text-slate-600 capitalize">
                            {asset.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </div>
                          <div className="flex-1 mx-3 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                          <div className="text-sm font-medium text-slate-800 w-12 text-right">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Metrics */}
                  <div>
                    <h4 className="text-md font-medium text-slate-700 mb-3">Risk Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Portfolio VaR (95%)</span>
                        <span className="text-sm font-medium">A$${(portfolioSummary.riskMetrics.portfolioVar / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Sharpe Ratio</span>
                        <span className="text-sm font-medium">{portfolioSummary.riskMetrics.sharpeRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Max Drawdown</span>
                        <span className="text-sm font-medium">{(portfolioSummary.riskMetrics.maxDrawdown * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedView === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Performance Analytics</h3>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                <div className="text-slate-600 mb-2">📊</div>
                <h4 className="text-md font-medium text-slate-700 mb-2">Advanced Performance Analytics</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Detailed performance attribution, benchmark comparison, and risk-adjusted returns
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Generate Performance Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Generate mock portfolio data based on investor persona
 */
function generateMockPortfolioData(persona: PersonaType): {
  holdings: PortfolioHolding[];
  summary: PortfolioSummary;
} {
  const baseDate = new Date();

  switch (persona) {
    case 'infrastructure_fund':
      return {
        holdings: [
          {
            id: 'if-001',
            assetType: 'infrastructure_asset',
            name: 'Sydney Water Infrastructure Fund',
            quantity: 15000,
            currentValue: 18750000, // A$18.75M
            bookValue: 15000000,
            unrealizedPnL: 3750000,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Low',
            esgScore: 8.5
          },
          {
            id: 'if-002',
            assetType: 'asset_co_tokens',
            name: 'WREI Asset Co Tokens - Series A',
            quantity: 25000,
            currentValue: 12500000, // A$12.5M
            bookValue: 10000000,
            unrealizedPnL: 2500000,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Medium',
            esgScore: 9.2
          },
          {
            id: 'if-003',
            assetType: 'carbon_credits',
            name: 'WREI Verified Carbon Credits',
            quantity: 50000, // 50k tCO2e
            currentValue: 7500000, // A$7.5M
            bookValue: 6000000,
            unrealizedPnL: 1500000,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Medium',
            esgScore: 9.5
          },
          {
            id: 'if-004',
            assetType: 'cash',
            name: 'Cash & Cash Equivalents',
            quantity: 1,
            currentValue: 6250000, // A$6.25M
            bookValue: 6250000,
            unrealizedPnL: 0,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Low'
          }
        ],
        summary: {
          totalValue: 45000000, // A$45M
          totalPnL: 7750000,
          totalPnLPercentage: 20.8,
          assetAllocation: {
            carbonCredits: 16.7,
            assetCoTokens: 27.8,
            infrastructureAssets: 41.7,
            cash: 13.9
          },
          riskMetrics: {
            portfolioVar: 4500000, // A$4.5M
            sharpeRatio: 1.85,
            maxDrawdown: 0.08
          }
        }
      };

    case 'esg_impact_investor':
      return {
        holdings: [
          {
            id: 'esg-001',
            assetType: 'carbon_credits',
            name: 'WREI Premium dMRV Carbon Credits',
            quantity: 150000, // 150k tCO2e
            currentValue: 22500000, // A$22.5M
            bookValue: 18000000,
            unrealizedPnL: 4500000,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Medium',
            esgScore: 9.8
          },
          {
            id: 'esg-002',
            assetType: 'asset_co_tokens',
            name: 'WREI Asset Co Tokens - ESG Series',
            quantity: 20000,
            currentValue: 10000000, // A$10M
            bookValue: 8500000,
            unrealizedPnL: 1500000,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Medium',
            esgScore: 9.3
          },
          {
            id: 'esg-003',
            assetType: 'infrastructure_asset',
            name: 'Renewable Water Infrastructure',
            quantity: 5000,
            currentValue: 8750000, // A$8.75M
            bookValue: 7500000,
            unrealizedPnL: 1250000,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Low',
            esgScore: 9.6
          },
          {
            id: 'esg-004',
            assetType: 'cash',
            name: 'ESG Investment Fund Cash',
            quantity: 1,
            currentValue: 3750000, // A$3.75M
            bookValue: 3750000,
            unrealizedPnL: 0,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Low'
          }
        ],
        summary: {
          totalValue: 45000000, // A$45M
          totalPnL: 7250000,
          totalPnLPercentage: 19.2,
          assetAllocation: {
            carbonCredits: 50.0,
            assetCoTokens: 22.2,
            infrastructureAssets: 19.4,
            cash: 8.3
          },
          riskMetrics: {
            portfolioVar: 5400000, // A$5.4M
            sharpeRatio: 1.92,
            maxDrawdown: 0.12
          }
        }
      };

    case 'family_office':
      return {
        holdings: [
          {
            id: 'fo-001',
            assetType: 'asset_co_tokens',
            name: 'WREI Conservative Asset Co Tokens',
            quantity: 30000,
            currentValue: 15000000, // A$15M
            bookValue: 12500000,
            unrealizedPnL: 2500000,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Low',
            esgScore: 8.8
          },
          {
            id: 'fo-002',
            assetType: 'infrastructure_asset',
            name: 'Australian Water Utility Stakes',
            quantity: 8000,
            currentValue: 12000000, // A$12M
            bookValue: 10000000,
            unrealizedPnL: 2000000,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Low',
            esgScore: 8.5
          },
          {
            id: 'fo-003',
            assetType: 'carbon_credits',
            name: 'WREI Family Office Carbon Portfolio',
            quantity: 30000, // 30k tCO2e
            currentValue: 4500000, // A$4.5M
            bookValue: 3600000,
            unrealizedPnL: 900000,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Medium',
            esgScore: 9.1
          },
          {
            id: 'fo-004',
            assetType: 'cash',
            name: 'Family Office Reserve Fund',
            quantity: 1,
            currentValue: 13500000, // A$13.5M
            bookValue: 13500000,
            unrealizedPnL: 0,
            lastUpdated: baseDate.toISOString(),
            riskRating: 'Low'
          }
        ],
        summary: {
          totalValue: 45000000, // A$45M
          totalPnL: 5400000,
          totalPnLPercentage: 13.6,
          assetAllocation: {
            carbonCredits: 10.0,
            assetCoTokens: 33.3,
            infrastructureAssets: 26.7,
            cash: 30.0
          },
          riskMetrics: {
            portfolioVar: 2700000, // A$2.7M
            sharpeRatio: 1.45,
            maxDrawdown: 0.05
          }
        }
      };

    default:
      return {
        holdings: [],
        summary: {
          totalValue: 0,
          totalPnL: 0,
          totalPnLPercentage: 0,
          assetAllocation: {
            carbonCredits: 0,
            assetCoTokens: 0,
            infrastructureAssets: 0,
            cash: 0
          },
          riskMetrics: {
            portfolioVar: 0,
            sharpeRatio: 0,
            maxDrawdown: 0
          }
        }
      };
  }
}

export default PortfolioManager;