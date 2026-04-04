'use client';

/**
 * WREI Market Intelligence Dashboard
 * Phase 1 Milestone 1.3 - Advanced Analytics and Market Intelligence
 *
 * Real-time market analysis and competitive positioning for institutional investors
 * Integrates with existing journey workflows and AI negotiation system
 */

import { useState, useEffect, useMemo } from 'react';
import {
  getTokenizedRWAMarketContext,
  getCarbonMarketProjections,
  getCompetitiveAnalysis,
  getMarketSentimentAnalysis,
  type TokenizedRWAMarketContext,
  type CarbonMarketProjections,
  type CompetitorAnalysis,
  type MarketSentimentData
} from '@/lib/market-intelligence';
import {
  calculateProfessionalMetrics,
  calculatePersonaMetrics,
  generatePortfolioOptimization,
  calculateRiskAdjustedReturns,
  type ProfessionalMetrics,
  type PortfolioOptimization
} from '@/lib/professional-analytics';
import { PersonaType } from '@/lib/types';
import { WREIAreaChart } from '@/components/charts';
import CompetitivePositioning from '@/components/market/CompetitivePositioning';

interface MarketIntelligenceDashboardProps {
  persona?: PersonaType;
  portfolioValue?: number;
  timeHorizon?: number;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
}

interface MarketOpportunityScore {
  overall: number;
  carbonCredits: number;
  assetCo: number;
  marketTiming: number;
  competitivePosition: number;
}

interface MarketAlert {
  id: string;
  type: 'opportunity' | 'risk' | 'regulatory' | 'competitive';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: boolean;
  timestamp: Date;
}

export const MarketIntelligenceDashboard: React.FC<MarketIntelligenceDashboardProps> = ({
  persona = 'esg_impact_investor',
  portfolioValue = 1000000000, // A$1B default
  timeHorizon = 10,
  riskTolerance = 'moderate'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'competitive' | 'opportunities' | 'alerts'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Market data state
  const [marketContext, setMarketContext] = useState<TokenizedRWAMarketContext | null>(null);
  const [carbonProjections, setCarbonProjections] = useState<CarbonMarketProjections | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<ProfessionalMetrics | null>(null);

  // Load market intelligence data
  useEffect(() => {
    const loadMarketData = async () => {
      setRefreshing(true);
      try {
        setMarketContext(getTokenizedRWAMarketContext());
        setCarbonProjections(getCarbonMarketProjections());
        setCompetitorAnalysis(getCompetitiveAnalysis());

        // Calculate portfolio metrics for the specific persona
        const metrics = calculatePersonaMetrics(
          portfolioValue,
          persona,
          timeHorizon,
          riskTolerance
        );
        setPortfolioMetrics(metrics);

        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error loading market data:', error);
      } finally {
        setRefreshing(false);
      }
    };

    loadMarketData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [persona, portfolioValue, timeHorizon, riskTolerance]);

  // Calculate market opportunity score
  const opportunityScore: MarketOpportunityScore = useMemo(() => {
    if (!marketContext || !carbonProjections) {
      return { overall: 0, carbonCredits: 0, assetCo: 0, marketTiming: 0, competitivePosition: 0 };
    }

    const carbonCreditsScore = Math.min(95, (carbonProjections.cagr * 10) + 25); // 25-95 range
    const assetCoScore = Math.min(90, (marketContext.growthRate * 0.6) + 10); // 10-90 range
    const marketTimingScore = marketContext.institutionalAdoption > 0.3 ? 85 : 65;
    const competitiveScore = competitorAnalysis.length < 5 ? 80 : 60; // Less competition = higher score

    const overall = (carbonCreditsScore + assetCoScore + marketTimingScore + competitiveScore) / 4;

    return {
      overall: Math.round(overall),
      carbonCredits: Math.round(carbonCreditsScore),
      assetCo: Math.round(assetCoScore),
      marketTiming: Math.round(marketTimingScore),
      competitivePosition: Math.round(competitiveScore)
    };
  }, [marketContext, carbonProjections, competitorAnalysis]);

  // Generate market alerts
  const marketAlerts: MarketAlert[] = useMemo(() => {
    const alerts: MarketAlert[] = [];

    if (opportunityScore.overall > 80) {
      alerts.push({
        id: 'high-opportunity',
        type: 'opportunity',
        severity: 'high',
        title: 'Exceptional Market Opportunity',
        description: `Market conditions highly favorable with ${opportunityScore.overall}/100 opportunity score`,
        actionRequired: true,
        timestamp: new Date()
      });
    }

    if (carbonProjections && carbonProjections.cagr > 0.3) {
      alerts.push({
        id: 'carbon-growth',
        type: 'opportunity',
        severity: 'medium',
        title: 'Carbon Credit Market Acceleration',
        description: `Carbon market projecting ${(carbonProjections.cagr * 100).toFixed(1)}% CAGR`,
        actionRequired: false,
        timestamp: new Date()
      });
    }

    if (marketContext && marketContext.growthRate > 1.2) {
      alerts.push({
        id: 'rwa-momentum',
        type: 'opportunity',
        severity: 'medium',
        title: 'Tokenized RWA Market Momentum',
        description: `RWA market growth at ${(marketContext.growthRate * 100).toFixed(0)}% over 15 months`,
        actionRequired: false,
        timestamp: new Date()
      });
    }

    return alerts;
  }, [opportunityScore, carbonProjections, marketContext]);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="bloomberg-small-text font-medium text-slate-600">RWA Market Size</h3>
          <p className="bloomberg-large-metric text-blue-600">
            {marketContext ? `A$${(marketContext.totalMarketValue / 1000000000).toFixed(1)}B` : '---'}
          </p>
          <p className="bloomberg-small-text text-green-600">
            +{marketContext ? `${(marketContext.growthRate * 100).toFixed(0)}%` : '0%'} growth
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="bloomberg-small-text font-medium text-slate-600">Carbon Market (2030)</h3>
          <p className="bloomberg-large-metric text-green-600">
            {carbonProjections ? `A$${(carbonProjections.projected2030Value / 1000000000).toFixed(0)}B` : '---'}
          </p>
          <p className="bloomberg-small-text text-green-600">
            {carbonProjections ? `${(carbonProjections.cagr * 100).toFixed(1)}%` : '0%'} CAGR
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="bloomberg-small-text font-medium text-slate-600">Opportunity Score</h3>
          <p className="bloomberg-large-metric text-purple-600">{opportunityScore.overall}/100</p>
          <p className="bloomberg-small-text text-slate-600">
            {opportunityScore.overall > 80 ? 'Exceptional' :
             opportunityScore.overall > 65 ? 'Strong' :
             opportunityScore.overall > 50 ? 'Moderate' : 'Limited'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="bloomberg-small-text font-medium text-slate-600">Active Alerts</h3>
          <p className="bloomberg-large-metric text-orange-600">{marketAlerts.length}</p>
          <p className="bloomberg-small-text text-slate-600">
            {marketAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length} high priority
          </p>
        </div>
      </div>

      {/* Market Segments Breakdown */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-4">Tokenized RWA Market Segments</h3>
        {marketContext && (
          <div className="space-y-3">
            {Object.entries(marketContext.marketSegments).map(([segment, value]) => {
              const percentage = (value / marketContext.totalMarketValue) * 100;
              const segmentName = segment.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

              return (
                <div key={segment} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: segment === 'infrastructure' ? '#3b82f6' :
                                       segment === 'treasuryTokens' ? '#10b981' :
                                       segment === 'privateCredit' ? '#8b5cf6' :
                                       segment === 'commodities' ? '#f59e0b' : '#ef4444'
                      }}
                    />
                    <span className="font-medium text-slate-700">{segmentName}</span>
                  </div>
                  <div className="text-right">
                    <span className=" text-slate-800">
                      A${(value / 1000000000).toFixed(1)}B
                    </span>
                    <span className="bloomberg-small-text text-slate-500 ml-2">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Competitive Landscape */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-4">Competitive Landscape</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 font-medium text-slate-600">Competitor</th>
                <th className="text-right py-3 px-2 font-medium text-slate-600">AUM</th>
                <th className="text-center py-3 px-2 font-medium text-slate-600">Focus</th>
                <th className="text-center py-3 px-2 font-medium text-slate-600">Differentiation</th>
                <th className="text-center py-3 px-2 font-medium text-slate-600">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {competitorAnalysis.slice(0, 5).map((competitor, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-3 px-2 font-medium text-slate-800">{competitor.name}</td>
                  <td className="py-3 px-2 text-right text-slate-700">
                    A${(competitor.aum / 1000000000).toFixed(1)}B
                  </td>
                  <td className="py-3 px-2 text-center bloomberg-small-text text-slate-600">
                    {competitor.primaryFocus}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-1 rounded-full bloomberg-section-label ${
                      competitor.differentiationStrength === 'strong' ? 'bg-green-100 text-green-800' :
                      competitor.differentiationStrength === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {competitor.differentiationStrength}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-1 rounded-full bloomberg-section-label ${
                      competitor.threatLevel === 'low' ? 'bg-green-100 text-green-800' :
                      competitor.threatLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {competitor.threatLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Portfolio Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-800 mb-4">Portfolio Performance</h3>
          {portfolioMetrics && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="bloomberg-small-text text-slate-600">IRR</p>
                <p className="bloomberg-metric-value text-blue-600">{(portfolioMetrics.irr * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="bloomberg-small-text text-slate-600">Sharpe Ratio</p>
                <p className="bloomberg-metric-value text-green-600">{portfolioMetrics.sharpeRatio.toFixed(2)}</p>
              </div>
              <div>
                <p className="bloomberg-small-text text-slate-600">NPV</p>
                <p className="bloomberg-metric-value text-purple-600">
                  A${(portfolioMetrics.npv / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="bloomberg-small-text text-slate-600">Max Drawdown</p>
                <p className="bloomberg-metric-value text-red-600">{(portfolioMetrics.maxDrawdown * 100).toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="bloomberg-card-title text-slate-800 mb-4">Optimized Allocation</h3>
          {portfolioMetrics && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Carbon Credits</span>
                <span className=" text-slate-800">
                  {(portfolioMetrics.optimizedAllocation.carbon_credits * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Asset Co Tokens</span>
                <span className=" text-slate-800">
                  {(portfolioMetrics.optimizedAllocation.asset_co * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Dual Portfolio</span>
                <span className=" text-slate-800">
                  {(portfolioMetrics.optimizedAllocation.dual_portfolio * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Market Trends Analysis */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-4">Market Trends</h3>
        <div className="h-80">
          <WREIAreaChart
            data={carbonProjections ? [
              { period: '2024', carbon: 8.45, dmrv: 15.2, wrei: 28.12 },
              { period: '2025', carbon: 9.1, dmrv: 16.8, wrei: 31.5 },
              { period: '2026', carbon: 10.2, dmrv: 19.2, wrei: 36.8 },
              { period: '2027', carbon: 11.8, dmrv: 22.5, wrei: 43.2 },
              { period: '2028', carbon: 13.9, dmrv: 27.1, wrei: 52.4 },
              { period: '2029', carbon: 16.7, dmrv: 33.2, wrei: 64.8 },
              { period: '2030', carbon: 20.4, dmrv: 41.1, wrei: 80.2 }
            ] : []}
            xDataKey="period"
            yDataKey="wrei"
            title="WREI Premium Pricing Trends"
            height={300}
            color="#0EA5E9"
            gradient={true}
            formatYLabel={(value) => `$${value.toFixed(1)}`}
            formatTooltip={(value, name) => [`$${value.toFixed(2)}/tonne`, 'WREI Premium Price']}
          />
        </div>
        <div className="mt-4 bloomberg-small-text text-slate-600">
          <p>Projected WREI carbon credit pricing based on market trends and dMRV premium expansion.
          Shows significant growth potential as institutional adoption of digital verification increases.</p>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-4">Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Market Risk Factors</h4>
            <ul className="space-y-2 bloomberg-small-text text-slate-600">
              <li>• Carbon price volatility (±15% monthly)</li>
              <li>• Regulatory policy changes</li>
              <li>• Technology disruption risk</li>
              <li>• Liquidity constraints in secondary markets</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Operational Risks</h4>
            <ul className="space-y-2 bloomberg-small-text text-slate-600">
              <li>• Vessel operational performance</li>
              <li>• Verification system reliability</li>
              <li>• Smart contract security</li>
              <li>• Counterparty credit risk</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Mitigation Strategies</h4>
            <ul className="space-y-2 bloomberg-small-text text-slate-600">
              <li>• Diversified asset allocation</li>
              <li>• Regular portfolio rebalancing</li>
              <li>• Comprehensive insurance coverage</li>
              <li>• Real-time monitoring systems</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompetitiveTab = () => (
    <div className="space-y-6">
      {/* Competitive Positioning Analysis */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="bloomberg-card-title text-slate-800 mb-2">Competitive Positioning Analysis</h3>
          <p className="text-slate-600 bloomberg-small-text">
            Interactive analysis of WREI&apos;s market position against key competitors in the carbon credit
            and tokenized asset marketplace.
          </p>
        </div>
        <CompetitivePositioning
          targetSegment={persona === 'infrastructure_fund' ? 'professional' :
                         persona === 'family_office' ? 'sophisticated' :
                         persona === 'sovereign_wealth' ? 'professional' : 'wholesale'}
          showDetailedView={true}
        />
      </div>
    </div>
  );

  const renderOpportunitiesTab = () => (
    <div className="space-y-6">
      {/* Opportunity Score Breakdown */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-4">Market Opportunity Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`bloomberg-page-heading mb-2 ${
              opportunityScore.carbonCredits > 80 ? 'text-green-600' :
              opportunityScore.carbonCredits > 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {opportunityScore.carbonCredits}
            </div>
            <p className="bloomberg-small-text font-medium text-slate-700">Carbon Credits</p>
            <p className="bloomberg-section-label text-slate-500 mt-1">Market growth potential</p>
          </div>
          <div className="text-center">
            <div className={`bloomberg-page-heading mb-2 ${
              opportunityScore.assetCo > 80 ? 'text-green-600' :
              opportunityScore.assetCo > 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {opportunityScore.assetCo}
            </div>
            <p className="bloomberg-small-text font-medium text-slate-700">Asset Co Tokens</p>
            <p className="bloomberg-section-label text-slate-500 mt-1">Infrastructure opportunity</p>
          </div>
          <div className="text-center">
            <div className={`bloomberg-page-heading mb-2 ${
              opportunityScore.marketTiming > 80 ? 'text-green-600' :
              opportunityScore.marketTiming > 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {opportunityScore.marketTiming}
            </div>
            <p className="bloomberg-small-text font-medium text-slate-700">Market Timing</p>
            <p className="bloomberg-section-label text-slate-500 mt-1">Entry point attractiveness</p>
          </div>
          <div className="text-center">
            <div className={`bloomberg-page-heading mb-2 ${
              opportunityScore.competitivePosition > 80 ? 'text-green-600' :
              opportunityScore.competitivePosition > 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {opportunityScore.competitivePosition}
            </div>
            <p className="bloomberg-small-text font-medium text-slate-700">Competitive Edge</p>
            <p className="bloomberg-section-label text-slate-500 mt-1">Differentiation strength</p>
          </div>
        </div>
      </div>

      {/* Investment Opportunities */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-4">Strategic Investment Opportunities</h3>
        <div className="space-y-4">
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex justify-between items-start mb-2">
              <h4 className=" text-green-800">Carbon Credit Portfolio Expansion</h4>
              <span className="px-2 py-1 bg-green-200 text-green-800 bloomberg-section-label rounded-full font-medium">
                HIGH PRIORITY
              </span>
            </div>
            <p className="text-green-700 bloomberg-small-text mb-3">
              Market projections indicate 34% CAGR in carbon credits through 2030. WREI&apos;s dMRV verification
              provides competitive advantage in institutional market.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bloomberg-small-text">
              <div>
                <span className="font-medium text-green-800">Target Allocation:</span>
                <p className="text-green-700">15-25% of portfolio</p>
              </div>
              <div>
                <span className="font-medium text-green-800">Expected Return:</span>
                <p className="text-green-700">28-35% IRR</p>
              </div>
              <div>
                <span className="font-medium text-green-800">Risk Level:</span>
                <p className="text-green-700">Medium</p>
              </div>
            </div>
          </div>

          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex justify-between items-start mb-2">
              <h4 className=" text-blue-800">Infrastructure Asset Co Exposure</h4>
              <span className="px-2 py-1 bg-blue-200 text-blue-800 bloomberg-section-label rounded-full font-medium">
                MODERATE PRIORITY
              </span>
            </div>
            <p className="text-blue-700 bloomberg-small-text mb-3">
              A$473M infrastructure portfolio with 28.3% yield provides stable income stream with
              inflation protection characteristics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bloomberg-small-text">
              <div>
                <span className="font-medium text-blue-800">Target Allocation:</span>
                <p className="text-blue-700">5-15% of portfolio</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Expected Return:</span>
                <p className="text-blue-700">22-28% IRR</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Risk Level:</span>
                <p className="text-blue-700">Low-Medium</p>
              </div>
            </div>
          </div>

          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex justify-between items-start mb-2">
              <h4 className=" text-purple-800">Cross-Collateral Strategy</h4>
              <span className="px-2 py-1 bg-purple-200 text-purple-800 bloomberg-section-label rounded-full font-medium">
                STRATEGIC OPTION
              </span>
            </div>
            <p className="text-purple-700 bloomberg-small-text mb-3">
              Dual token portfolio enables cross-collateralization for enhanced capital efficiency
              and risk-adjusted returns.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bloomberg-small-text">
              <div>
                <span className="font-medium text-purple-800">Capital Efficiency:</span>
                <p className="text-purple-700">+23% improvement</p>
              </div>
              <div>
                <span className="font-medium text-purple-800">Yield Enhancement:</span>
                <p className="text-purple-700">+180 basis points</p>
              </div>
              <div>
                <span className="font-medium text-purple-800">Complexity:</span>
                <p className="text-purple-700">Advanced</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-6">
      {/* Active Alerts */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-4">Market Alerts & Notifications</h3>
        {marketAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="bloomberg-large-metric">✅</span>
            </div>
            <p className="text-slate-600">No active alerts. Market conditions are stable.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {marketAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  alert.severity === 'critical' ? 'border-red-300 bg-red-50' :
                  alert.severity === 'high' ? 'border-orange-300 bg-orange-50' :
                  alert.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                  'border-blue-300 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`bloomberg-card-title ${
                        alert.type === 'opportunity' ? '📈' :
                        alert.type === 'risk' ? '⚠️' :
                        alert.type === 'regulatory' ? '📋' : '🏢'
                      }`} />
                      <h4 className={` ${
                        alert.severity === 'critical' ? 'text-red-800' :
                        alert.severity === 'high' ? 'text-orange-800' :
                        alert.severity === 'medium' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {alert.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${
                        alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className={`bloomberg-small-text ${
                      alert.severity === 'critical' ? 'text-red-700' :
                      alert.severity === 'high' ? 'text-orange-700' :
                      alert.severity === 'medium' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>
                      {alert.description}
                    </p>
                    <p className="bloomberg-section-label text-slate-500 mt-2">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                  {alert.actionRequired && (
                    <button className={`ml-4 px-3 py-1 rounded bloomberg-section-label font-medium ${
                      alert.severity === 'critical' ? 'bg-red-600 text-white hover:bg-red-700' :
                      alert.severity === 'high' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                      'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}>
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Configuration */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-4">Alert Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Market Thresholds</h4>
            <div className="space-y-3 bloomberg-small-text">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Carbon price volatility</span>
                <span className="font-medium text-slate-800">±15% daily</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Opportunity score</span>
                <span className="font-medium text-slate-800">&gt; 75/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Portfolio rebalancing</span>
                <span className="font-medium text-slate-800">±5% target allocation</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Risk level changes</span>
                <span className="font-medium text-slate-800">Tier upgrade/downgrade</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Notification Preferences</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="bloomberg-small-text text-slate-700">Real-time market alerts</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="bloomberg-small-text text-slate-700">Portfolio optimization suggestions</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="bloomberg-small-text text-slate-700">Regulatory updates</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span className="bloomberg-small-text text-slate-700">Competitive intelligence</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Market Overview', icon: '📊' },
    { id: 'analytics', label: 'Portfolio Analytics', icon: '📈' },
    { id: 'competitive', label: 'Competitive Analysis', icon: '⚔️' },
    { id: 'opportunities', label: 'Opportunities', icon: '🎯' },
    { id: 'alerts', label: 'Alerts & Monitoring', icon: '🔔' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Market Intelligence Dashboard</h1>
              <p className="text-slate-600 mt-2">
                Real-time analytics and competitive intelligence for institutional investors
              </p>
            </div>
            <div className="text-right">
              <div className="bloomberg-small-text text-slate-600">Phase 1 Milestone 1.3</div>
              <div className="bloomberg-card-title text-indigo-600">Advanced Analytics</div>
              <div className="bloomberg-section-label text-slate-500 mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
                {refreshing && <span className="ml-2 animate-pulse">🔄</span>}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-slate-200">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium bloomberg-small-text ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'competitive' && renderCompetitiveTab()}
          {activeTab === 'opportunities' && renderOpportunitiesTab()}
          {activeTab === 'alerts' && renderAlertsTab()}
        </div>
      </div>
    </div>
  );
};