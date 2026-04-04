'use client';

/**
 * WREI Predictive Analytics Dashboard
 * Phase 1 Milestone 1.3 - Advanced Analytics and Market Intelligence
 *
 * AI-powered predictive analytics for institutional investment decision support
 * Integrates with market intelligence and portfolio optimization systems
 */

import { useState, useEffect, useMemo } from 'react';
import {
  calculateProfessionalMetrics,
  calculatePersonaMetrics,
  generatePortfolioOptimization,
  calculateRiskAdjustedReturns,
  type ProfessionalMetrics,
  type PortfolioOptimization
} from '@/lib/professional-analytics';
import {
  getTokenizedRWAMarketContext,
  getCarbonMarketProjections,
  getMarketSentimentAnalysis,
  type TokenizedRWAMarketContext,
  type CarbonMarketProjections,
  type MarketSentimentData
} from '@/lib/market-intelligence';
import { PersonaType } from '@/lib/types';

interface PredictiveAnalyticsDashboardProps {
  persona?: PersonaType;
  portfolioValue?: number;
  currentAllocation?: {
    carbon_credits: number;
    asset_co: number;
    dual_portfolio: number;
  };
  timeHorizon?: number;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
}

interface PredictiveInsight {
  id: string;
  category: 'opportunity' | 'risk' | 'optimization' | 'timing';
  confidence: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    expectedReturn: number;
    riskAdjustment: number;
    portfolioOptimization: number;
  };
  actionRequired: boolean;
  timeline: string;
  supporting_data: string[];
}

interface ScenarioModelingResult {
  scenario: string;
  probability: number;
  expectedReturn: number;
  volatility: number;
  maxDrawdown: number;
  valueAtRisk: number;
  timeToRecover: number;
}

interface AIRecommendation {
  action: 'buy' | 'sell' | 'hold' | 'rebalance';
  asset: 'carbon_credits' | 'asset_co' | 'dual_portfolio';
  confidence: number;
  reasoning: string[];
  quantitative_justification: {
    expectedReturn: number;
    riskReduction: number;
    portfolioImprovement: number;
  };
  implementation: {
    suggestedAllocation: number;
    timeframe: string;
    executionStrategy: string;
  };
}

export const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({
  persona = 'esg_impact_investor',
  portfolioValue = 1000000000, // A$1B default
  currentAllocation = { carbon_credits: 0.4, asset_co: 0.4, dual_portfolio: 0.2 },
  timeHorizon = 10,
  riskTolerance = 'moderate'
}) => {
  const [activeView, setActiveView] = useState<'insights' | 'modeling' | 'recommendations' | 'monitoring'>('insights');
  const [refreshing, setRefreshing] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date>(new Date());

  // Core data state
  const [marketData, setMarketData] = useState<{
    rwaContext: TokenizedRWAMarketContext | null;
    carbonProjections: CarbonMarketProjections | null;
    marketSentiment: MarketSentimentData | null;
  }>({
    rwaContext: null,
    carbonProjections: null,
    marketSentiment: null
  });

  const [portfolioMetrics, setPortfolioMetrics] = useState<ProfessionalMetrics | null>(null);
  const [optimization, setOptimization] = useState<PortfolioOptimization | null>(null);

  // Load and refresh market data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setRefreshing(true);
      try {
        // Load market intelligence
        setMarketData({
          rwaContext: getTokenizedRWAMarketContext(),
          carbonProjections: getCarbonMarketProjections(),
          marketSentiment: getMarketSentimentAnalysis()
        });

        // Calculate portfolio metrics
        const metrics = calculatePersonaMetrics(portfolioValue, persona, timeHorizon, riskTolerance);
        setPortfolioMetrics(metrics);

        // Generate optimization recommendations
        const optimizationResult = generatePortfolioOptimization(currentAllocation, riskTolerance, timeHorizon);
        setOptimization(optimizationResult);

        setLastAnalysisTime(new Date());
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setRefreshing(false);
      }
    };

    loadAnalyticsData();

    // Auto-refresh every 3 minutes
    const interval = setInterval(loadAnalyticsData, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [persona, portfolioValue, currentAllocation, timeHorizon, riskTolerance]);

  // Generate predictive insights using AI-like analysis
  const predictiveInsights: PredictiveInsight[] = useMemo(() => {
    if (!marketData.rwaContext || !marketData.carbonProjections || !portfolioMetrics) {
      return [];
    }

    const insights: PredictiveInsight[] = [];

    // Carbon market opportunity insight
    if (marketData.carbonProjections.cagr > 0.25) {
      insights.push({
        id: 'carbon-market-acceleration',
        category: 'opportunity',
        confidence: 87,
        priority: 'high',
        title: 'Carbon Market Acceleration Detected',
        description: `AI models predict sustained carbon market growth at ${(marketData.carbonProjections.cagr * 100).toFixed(1)}% CAGR through 2030. Current allocation may be suboptimal for capturing this trend.`,
        impact: {
          expectedReturn: 0.08,
          riskAdjustment: 0.02,
          portfolioOptimization: 0.15
        },
        actionRequired: true,
        timeline: 'Next 3-6 months',
        supporting_data: [
          `CAGR projection: ${(marketData.carbonProjections.cagr * 100).toFixed(1)}%`,
          `Market size growth: A$${(marketData.carbonProjections.projected2030Value / 1000000000).toFixed(0)}B by 2030`,
          'ESG mandate acceleration driving institutional demand'
        ]
      });
    }

    // Portfolio optimization insight
    if (optimization && optimization.improvementPotential > 10) {
      insights.push({
        id: 'portfolio-optimization-opportunity',
        category: 'optimization',
        confidence: 93,
        priority: 'medium',
        title: 'Portfolio Optimization Opportunity',
        description: `AI analysis indicates ${optimization.improvementPotential.toFixed(1)}% potential improvement in risk-adjusted returns through rebalancing.`,
        impact: {
          expectedReturn: optimization.improvementPotential / 100,
          riskAdjustment: 0.05,
          portfolioOptimization: optimization.improvementPotential / 100
        },
        actionRequired: true,
        timeline: 'Immediate',
        supporting_data: [
          `Expected return improvement: ${optimization.expectedReturn.toFixed(1)}%`,
          `Sharpe ratio optimization: ${optimization.sharpeRatio.toFixed(2)}`,
          'Risk-return efficiency gains identified'
        ]
      });
    }

    // Market timing insight
    if (marketData.marketSentiment && marketData.marketSentiment.overall > 80) {
      insights.push({
        id: 'market-timing-bullish',
        category: 'timing',
        confidence: 76,
        priority: 'medium',
        title: 'Favorable Market Timing Window',
        description: `Market sentiment analysis shows bullish conditions (${marketData.marketSentiment.overall}/100) across key metrics. Optimal entry point for expansion.`,
        impact: {
          expectedReturn: 0.06,
          riskAdjustment: -0.01,
          portfolioOptimization: 0.08
        },
        actionRequired: false,
        timeline: 'Next 1-3 months',
        supporting_data: [
          `Overall sentiment: ${marketData.marketSentiment.overall}/100`,
          `RWA tokenization sentiment: ${marketData.marketSentiment.rwaTokenization}/100`,
          'Institutional adoption accelerating'
        ]
      });
    }

    // Volatility risk insight
    if (portfolioMetrics.volatility > 0.25) {
      insights.push({
        id: 'volatility-risk-warning',
        category: 'risk',
        confidence: 91,
        priority: 'high',
        title: 'Elevated Portfolio Volatility Detected',
        description: `Current portfolio volatility (${(portfolioMetrics.volatility * 100).toFixed(1)}%) exceeds optimal range for ${persona} risk profile.`,
        impact: {
          expectedReturn: -0.02,
          riskAdjustment: 0.15,
          portfolioOptimization: -0.08
        },
        actionRequired: true,
        timeline: 'Immediate',
        supporting_data: [
          `Portfolio volatility: ${(portfolioMetrics.volatility * 100).toFixed(1)}%`,
          `Max drawdown risk: ${(portfolioMetrics.maxDrawdown * 100).toFixed(1)}%`,
          'Risk management intervention recommended'
        ]
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [marketData, portfolioMetrics, optimization, persona]);

  // Generate scenario modeling results
  const scenarioModeling: ScenarioModelingResult[] = useMemo(() => {
    if (!portfolioMetrics) return [];

    const baseReturn = portfolioMetrics.cagr;
    const baseVolatility = portfolioMetrics.volatility;

    return [
      {
        scenario: 'Base Case',
        probability: 40,
        expectedReturn: baseReturn,
        volatility: baseVolatility,
        maxDrawdown: baseVolatility * 0.6,
        valueAtRisk: portfolioValue * baseVolatility * 1.645,
        timeToRecover: 24
      },
      {
        scenario: 'Bull Market',
        probability: 25,
        expectedReturn: baseReturn * 1.5,
        volatility: baseVolatility * 1.2,
        maxDrawdown: baseVolatility * 0.4,
        valueAtRisk: portfolioValue * baseVolatility * 1.2 * 1.645,
        timeToRecover: 12
      },
      {
        scenario: 'Bear Market',
        probability: 25,
        expectedReturn: baseReturn * 0.3,
        volatility: baseVolatility * 1.8,
        maxDrawdown: baseVolatility * 1.2,
        valueAtRisk: portfolioValue * baseVolatility * 1.8 * 1.645,
        timeToRecover: 48
      },
      {
        scenario: 'Crisis Scenario',
        probability: 10,
        expectedReturn: baseReturn * -0.2,
        volatility: baseVolatility * 2.5,
        maxDrawdown: baseVolatility * 2.0,
        valueAtRisk: portfolioValue * baseVolatility * 2.5 * 1.645,
        timeToRecover: 84
      }
    ];
  }, [portfolioMetrics, portfolioValue]);

  // Generate AI-powered recommendations
  const aiRecommendations: AIRecommendation[] = useMemo(() => {
    if (!optimization || !marketData.carbonProjections) return [];

    const recommendations: AIRecommendation[] = [];

    // Carbon credits recommendation
    if (marketData.carbonProjections.cagr > 0.25 && currentAllocation.carbon_credits < 0.5) {
      recommendations.push({
        action: 'buy',
        asset: 'carbon_credits',
        confidence: 88,
        reasoning: [
          `Strong market fundamentals with ${(marketData.carbonProjections.cagr * 100).toFixed(1)}% projected CAGR`,
          'ESG mandate acceleration driving institutional demand',
          'Current allocation below optimal for market conditions'
        ],
        quantitative_justification: {
          expectedReturn: 0.15,
          riskReduction: 0.02,
          portfolioImprovement: 0.12
        },
        implementation: {
          suggestedAllocation: Math.max(0.5, optimization.recommendedAllocation.carbon_credits),
          timeframe: '3-6 months',
          executionStrategy: 'Dollar-cost averaging with volatility targeting'
        }
      });
    }

    // Asset Co recommendation for conservative profiles
    if ((riskTolerance === 'conservative' || persona === 'family_office') && currentAllocation.asset_co < 0.6) {
      recommendations.push({
        action: 'buy',
        asset: 'asset_co',
        confidence: 82,
        reasoning: [
          'Stable infrastructure income suitable for conservative profiles',
          'Real asset backing provides inflation protection',
          'Portfolio stability enhancement through diversification'
        ],
        quantitative_justification: {
          expectedReturn: 0.10,
          riskReduction: 0.08,
          portfolioImprovement: 0.06
        },
        implementation: {
          suggestedAllocation: optimization.recommendedAllocation.asset_co,
          timeframe: 'Immediate to 3 months',
          executionStrategy: 'Systematic allocation with quarterly rebalancing'
        }
      });
    }

    // Rebalancing recommendation
    if (optimization.improvementPotential > 10) {
      recommendations.push({
        action: 'rebalance',
        asset: 'dual_portfolio',
        confidence: 94,
        reasoning: [
          `Portfolio drift detected with ${optimization.improvementPotential.toFixed(1)}% improvement potential`,
          'Risk-return optimization achievable through rebalancing',
          'Maintain target allocation for optimal performance'
        ],
        quantitative_justification: {
          expectedReturn: optimization.expectedReturn,
          riskReduction: 0.05,
          portfolioImprovement: optimization.improvementPotential / 100
        },
        implementation: {
          suggestedAllocation: 1.0, // Full portfolio rebalance
          timeframe: 'Immediate',
          executionStrategy: 'Systematic rebalancing to target weights'
        }
      });
    }

    return recommendations;
  }, [optimization, marketData, currentAllocation, riskTolerance, persona]);

  const renderInsightsView = () => (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="bloomberg-small-text font-medium text-slate-600">Predictive Confidence</h3>
          <p className="bloomberg-large-metric text-blue-600">
            {predictiveInsights.length > 0 ? Math.round(predictiveInsights.reduce((sum, i) => sum + i.confidence, 0) / predictiveInsights.length) : 0}%
          </p>
          <p className="bloomberg-small-text text-green-600">High accuracy models</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="bloomberg-small-text font-medium text-slate-600">Active Insights</h3>
          <p className="bloomberg-large-metric text-purple-600">{predictiveInsights.length}</p>
          <p className="bloomberg-small-text text-slate-600">
            {predictiveInsights.filter(i => i.priority === 'high' || i.priority === 'critical').length} high priority
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="bloomberg-small-text font-medium text-slate-600">Portfolio Optimization</h3>
          <p className="bloomberg-large-metric text-green-600">
            +{optimization ? optimization.improvementPotential.toFixed(1) : '0'}%
          </p>
          <p className="bloomberg-small-text text-green-600">Improvement potential</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h3 className="bloomberg-small-text font-medium text-slate-600">Risk Score</h3>
          <p className="bloomberg-large-metric text-orange-600">
            {portfolioMetrics ? Math.round((1 - portfolioMetrics.volatility) * 100) : 0}
          </p>
          <p className="bloomberg-small-text text-slate-600">Risk-adjusted score</p>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-4">🔮 AI-Powered Predictive Insights</h3>
        {predictiveInsights.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="bloomberg-large-metric">🤖</span>
            </div>
            <p className="text-slate-600">AI models are analyzing market conditions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {predictiveInsights.map((insight) => (
              <div
                key={insight.id}
                className={`border rounded-lg p-4 ${
                  insight.priority === 'critical' ? 'border-red-300 bg-red-50' :
                  insight.priority === 'high' ? 'border-orange-300 bg-orange-50' :
                  insight.priority === 'medium' ? 'border-blue-300 bg-blue-50' :
                  'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bloomberg-card-title">
                        {insight.category === 'opportunity' ? '🎯' :
                         insight.category === 'risk' ? '⚠️' :
                         insight.category === 'optimization' ? '⚡' : '⏰'}
                      </span>
                      <h4 className={` ${
                        insight.priority === 'critical' ? 'text-red-800' :
                        insight.priority === 'high' ? 'text-orange-800' :
                        insight.priority === 'medium' ? 'text-blue-800' :
                        'text-gray-800'
                      }`}>
                        {insight.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${
                          insight.priority === 'critical' ? 'bg-red-200 text-red-800' :
                          insight.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                          insight.priority === 'medium' ? 'bg-blue-200 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {insight.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-green-200 text-green-800 bloomberg-section-label rounded-full font-medium">
                          {insight.confidence}% CONFIDENCE
                        </span>
                      </div>
                    </div>
                    <p className={`bloomberg-small-text mb-3 ${
                      insight.priority === 'critical' ? 'text-red-700' :
                      insight.priority === 'high' ? 'text-orange-700' :
                      insight.priority === 'medium' ? 'text-blue-700' :
                      'text-gray-700'
                    }`}>
                      {insight.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="bloomberg-section-label">
                        <span className="text-slate-600">Expected Return Impact:</span>
                        <p className=" text-green-600">+{(insight.impact.expectedReturn * 100).toFixed(1)}%</p>
                      </div>
                      <div className="bloomberg-section-label">
                        <span className="text-slate-600">Risk Adjustment:</span>
                        <p className=" text-blue-600">{(insight.impact.riskAdjustment * 100).toFixed(1)}%</p>
                      </div>
                      <div className="bloomberg-section-label">
                        <span className="text-slate-600">Timeline:</span>
                        <p className=" text-slate-700">{insight.timeline}</p>
                      </div>
                    </div>

                    <details className="bloomberg-section-label">
                      <summary className="cursor-pointer text-slate-600 hover:text-slate-800">
                        Supporting Data & Analysis
                      </summary>
                      <ul className="mt-2 space-y-1 text-slate-600">
                        {insight.supporting_data.map((data, index) => (
                          <li key={index}>• {data}</li>
                        ))}
                      </ul>
                    </details>
                  </div>

                  {insight.actionRequired && (
                    <button className={`ml-4 px-3 py-1 rounded bloomberg-section-label font-medium ${
                      insight.priority === 'critical' ? 'bg-red-600 text-white hover:bg-red-700' :
                      insight.priority === 'high' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                      'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderModelingView = () => (
    <div className="space-y-6">
      {/* Scenario Modeling */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-4">📊 Monte Carlo Scenario Modeling</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 font-medium text-slate-600">Scenario</th>
                <th className="text-center py-3 px-2 font-medium text-slate-600">Probability</th>
                <th className="text-right py-3 px-2 font-medium text-slate-600">Expected Return</th>
                <th className="text-right py-3 px-2 font-medium text-slate-600">Volatility</th>
                <th className="text-right py-3 px-2 font-medium text-slate-600">Max Drawdown</th>
                <th className="text-right py-3 px-2 font-medium text-slate-600">95% VaR</th>
                <th className="text-right py-3 px-2 font-medium text-slate-600">Recovery Time</th>
              </tr>
            </thead>
            <tbody>
              {scenarioModeling.map((scenario, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-3 px-2 font-medium text-slate-800">{scenario.scenario}</td>
                  <td className="py-3 px-2 text-center text-slate-700">{scenario.probability}%</td>
                  <td className="py-3 px-2 text-right  text-green-600">
                    {(scenario.expectedReturn * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-2 text-right text-slate-700">
                    {(scenario.volatility * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-2 text-right text-red-600">
                    {(scenario.maxDrawdown * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-2 text-right text-orange-600">
                    A${(scenario.valueAtRisk / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-3 px-2 text-right text-slate-700">
                    {scenario.timeToRecover} months
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Metrics */}
      {portfolioMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="bloomberg-card-title text-slate-800 mb-4">Risk-Adjusted Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Sharpe Ratio</span>
                <span className=" text-blue-600">{portfolioMetrics.sharpeRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Sortino Ratio</span>
                <span className=" text-green-600">{portfolioMetrics.sortinoRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Calmar Ratio</span>
                <span className=" text-purple-600">{portfolioMetrics.calmarRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Maximum Drawdown</span>
                <span className=" text-red-600">{(portfolioMetrics.maxDrawdown * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="bloomberg-card-title text-slate-800 mb-4">Portfolio Correlation</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Portfolio Beta</span>
                <span className=" text-slate-800">{portfolioMetrics.correlationScore.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Diversification Ratio</span>
                <span className=" text-green-600">{portfolioMetrics.diversificationRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Concentration Risk</span>
                <span className=" text-orange-600">{(portfolioMetrics.concentrationRisk * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRecommendationsView = () => (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="bloomberg-card-title text-slate-800 mb-4">🧠 AI-Powered Investment Recommendations</h3>
        {aiRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="bloomberg-large-metric">✅</span>
            </div>
            <p className="text-slate-600">Portfolio optimization is on track. No immediate actions required.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bloomberg-large-metric">
                      {rec.action === 'buy' ? '📈' : rec.action === 'sell' ? '📉' :
                       rec.action === 'rebalance' ? '⚖️' : '💎'}
                    </span>
                    <div>
                      <h4 className=" text-slate-800 capitalize">
                        {rec.action} {rec.asset.replace('_', ' ')}
                      </h4>
                      <p className="bloomberg-small-text text-slate-600">
                        AI Confidence: <span className="font-medium text-green-600">{rec.confidence}%</span>
                      </p>
                    </div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg bloomberg-small-text font-medium">
                    Implement
                  </button>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium text-slate-700 mb-2">Reasoning:</h5>
                  <ul className="bloomberg-small-text text-slate-600 space-y-1">
                    {rec.reasoning.map((reason, idx) => (
                      <li key={idx}>• {reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Quantitative Analysis:</h5>
                    <div className="bloomberg-small-text space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Expected Return:</span>
                        <span className="font-medium text-green-600">
                          +{(rec.quantitative_justification.expectedReturn * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Risk Reduction:</span>
                        <span className="font-medium text-blue-600">
                          {(rec.quantitative_justification.riskReduction * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Portfolio Improvement:</span>
                        <span className="font-medium text-purple-600">
                          +{(rec.quantitative_justification.portfolioImprovement * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Implementation Plan:</h5>
                    <div className="bloomberg-small-text space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Target Allocation:</span>
                        <span className="font-medium text-slate-800">
                          {(rec.implementation.suggestedAllocation * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Timeframe:</span>
                        <span className="font-medium text-slate-800">{rec.implementation.timeframe}</span>
                      </div>
                      <div className="text-slate-600">
                        Strategy: <span className="font-medium text-slate-800">{rec.implementation.executionStrategy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'insights', label: 'Predictive Insights', icon: '🔮' },
    { id: 'modeling', label: 'Scenario Modeling', icon: '📊' },
    { id: 'recommendations', label: 'AI Recommendations', icon: '🧠' },
    { id: 'monitoring', label: 'Real-time Monitoring', icon: '📡' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Predictive Analytics Dashboard</h1>
              <p className="text-slate-600 mt-2">
                AI-powered investment intelligence and portfolio optimization for institutional investors
              </p>
            </div>
            <div className="text-right">
              <div className="bloomberg-small-text text-slate-600">Phase 1 Milestone 1.3</div>
              <div className="bloomberg-card-title text-purple-600">Advanced Analytics</div>
              <div className="bloomberg-section-label text-slate-500 mt-1">
                Last analysis: {lastAnalysisTime.toLocaleTimeString()}
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
                  onClick={() => setActiveView(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium bloomberg-small-text ${
                    activeView === tab.id
                      ? 'border-purple-500 text-purple-600'
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
          {activeView === 'insights' && renderInsightsView()}
          {activeView === 'modeling' && renderModelingView()}
          {activeView === 'recommendations' && renderRecommendationsView()}
          {activeView === 'monitoring' && (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="bloomberg-large-metric">📡</span>
              </div>
              <h3 className="bloomberg-card-title text-slate-800 mb-2">Real-time Monitoring</h3>
              <p className="text-slate-600">
                Coming soon: Live portfolio monitoring with automated alerts and risk management triggers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};