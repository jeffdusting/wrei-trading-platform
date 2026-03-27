/**
 * WREI Trading Platform - Portfolio Optimizer
 *
 * Step 1.3: Scenario Library & Templates - Portfolio Optimization Demonstrations
 * AI-powered ESC portfolio optimization with risk assessment and ROI maximization
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ClockIcon,
  CogIcon,
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

import {
  PortfolioOptimizationScenario,
  CarbonPortfolio,
  CarbonCredit,
  OptimizationObjective,
  PortfolioConstraint,
  PortfolioVariant
} from './types';
import { AudienceType } from '../audience';
import { useDemoMode } from '../../lib/demo-mode/demo-state-manager';

interface PortfolioOptimizerProps {
  selectedAudience?: AudienceType;
  onComplete?: (results: any) => void;
  onBack?: () => void;
}

interface OptimizationResult {
  original_portfolio: CarbonPortfolio;
  optimized_portfolio: CarbonPortfolio;
  improvements: {
    return_increase: number; // Percentage
    risk_reduction: number; // Percentage
    liquidity_improvement: number; // Percentage
    cost_savings: number; // Dollar amount
  };
  recommendations: Array<{
    type: 'buy' | 'sell' | 'rebalance' | 'hedge';
    asset: string;
    quantity: number;
    rationale: string;
    impact: number; // Score 0-10
  }>;
  risk_analysis: {
    var_95: number; // Value at Risk
    expected_return: number; // Percentage
    sharpe_ratio: number;
    max_drawdown: number; // Percentage
  };
  execution_plan: Array<{
    step: number;
    action: string;
    timeline: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

const PortfolioOptimizer: React.FC<PortfolioOptimizerProps> = ({
  selectedAudience,
  onComplete,
  onBack
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('balanced-growth');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState(12); // months

  const demoMode = useDemoMode();

  // Portfolio Optimization Scenarios
  const scenarios: Record<string, PortfolioOptimizationScenario> = {
    'balanced-growth': {
      id: 'balanced-growth',
      name: 'Balanced Growth Strategy',
      description: 'Optimize for balanced return and risk with focus on ESC diversification',
      portfolio: {
        id: 'current-portfolio',
        name: 'Northmore Gordon ESC Portfolio',
        total_volume: 15000, // tonnes
        cash_position: 180000,
        target_allocations: {
          'NSW_ESC': 0.60,
          'ACCU': 0.25,
          'VCS': 0.10,
          'WREI': 0.05
        },
        credits: [
          {
            id: 'esc-batch-1',
            type: 'ESC',
            volume: 8000,
            purchase_price: 46.50,
            current_value: 47.80,
            vintage_year: 2025,
            project_type: 'Commercial HVAC Efficiency',
            verification_status: 'verified',
            risk_rating: 'low'
          },
          {
            id: 'accu-batch-1',
            type: 'ACCU',
            volume: 4000,
            purchase_price: 28.75,
            current_value: 31.20,
            vintage_year: 2024,
            project_type: 'Reforestation',
            verification_status: 'verified',
            risk_rating: 'medium'
          },
          {
            id: 'vcs-batch-1',
            type: 'VCS',
            volume: 2000,
            purchase_price: 12.40,
            current_value: 14.80,
            vintage_year: 2024,
            project_type: 'Renewable Energy',
            verification_status: 'verified',
            risk_rating: 'medium'
          },
          {
            id: 'wrei-batch-1',
            type: 'WREI',
            volume: 1000,
            purchase_price: 95.00,
            current_value: 108.50,
            vintage_year: 2025,
            project_type: 'Enhanced Rock Weathering',
            verification_status: 'verified',
            risk_rating: 'high'
          }
        ]
      },
      objectives: [
        {
          type: 'maximize-return',
          weight: 0.4,
          target_value: 0.15 // 15% annual return
        },
        {
          type: 'minimize-risk',
          weight: 0.3
        },
        {
          type: 'maximize-liquidity',
          weight: 0.2
        },
        {
          type: 'minimize-cost',
          weight: 0.1
        }
      ],
      constraints: [
        {
          type: 'max-exposure',
          parameters: { 'single_asset': 0.65 },
          enforcement: 'hard'
        },
        {
          type: 'min-liquidity',
          parameters: { 'minimum_percentage': 0.15 },
          enforcement: 'hard'
        },
        {
          type: 'vintage-limit',
          parameters: { 'min_year': 2023 },
          enforcement: 'soft'
        }
      ],
      time_horizon: 12,
      scenario_variants: [
        {
          id: 'conservative',
          name: 'Conservative Approach',
          description: 'Lower risk with steady returns',
          modifications: [
            {
              type: 'rebalance',
              parameters: { 'increase_esc': 0.1, 'decrease_wrei': 0.1 },
              rationale: 'Reduce high-risk WREI exposure'
            }
          ],
          expected_metrics: {
            'expected_return': 0.12,
            'risk_score': 3.2,
            'liquidity_score': 8.5
          }
        },
        {
          id: 'aggressive',
          name: 'Aggressive Growth',
          description: 'Higher risk for maximum returns',
          modifications: [
            {
              type: 'add-credits',
              parameters: { 'wrei_volume': 2000, 'vcs_volume': 1000 },
              rationale: 'Increase exposure to high-growth potential assets'
            }
          ],
          expected_metrics: {
            'expected_return': 0.22,
            'risk_score': 7.1,
            'liquidity_score': 6.8
          }
        }
      ]
    },

    'risk-minimization': {
      id: 'risk-minimization',
      name: 'Risk Minimization Strategy',
      description: 'Minimize portfolio risk while maintaining adequate returns',
      portfolio: {
        id: 'current-portfolio',
        name: 'Northmore Gordon ESC Portfolio',
        total_volume: 15000,
        cash_position: 180000,
        target_allocations: {
          'NSW_ESC': 0.80,
          'ACCU': 0.15,
          'VCS': 0.05,
          'WREI': 0.00
        },
        credits: []
      },
      objectives: [
        {
          type: 'minimize-risk',
          weight: 0.6
        },
        {
          type: 'maximize-return',
          weight: 0.25,
          target_value: 0.08
        },
        {
          type: 'maximize-liquidity',
          weight: 0.15
        }
      ],
      constraints: [],
      time_horizon: 18,
      scenario_variants: []
    },

    'return-maximization': {
      id: 'return-maximization',
      name: 'Return Maximization Strategy',
      description: 'Maximize returns with acceptable risk tolerance',
      portfolio: {
        id: 'current-portfolio',
        name: 'Northmore Gordon ESC Portfolio',
        total_volume: 15000,
        cash_position: 180000,
        target_allocations: {
          'NSW_ESC': 0.40,
          'ACCU': 0.20,
          'VCS': 0.20,
          'WREI': 0.20
        },
        credits: []
      },
      objectives: [
        {
          type: 'maximize-return',
          weight: 0.7,
          target_value: 0.25
        },
        {
          type: 'minimize-risk',
          weight: 0.2
        },
        {
          type: 'maximize-liquidity',
          weight: 0.1
        }
      ],
      constraints: [],
      time_horizon: 24,
      scenario_variants: []
    }
  };

  const startOptimization = () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setOptimizationResult(null);

    demoMode.trackInteraction({
      type: 'click',
      data: { action: 'portfolio_optimization_start', scenario: selectedScenario, audience: selectedAudience }
    });

    // Simulate optimization process
    const progressInterval = setInterval(() => {
      setOptimizationProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5; // 5-20% increments
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            completeOptimization();
          }, 1000);
          return 100;
        }
        return newProgress;
      });
    }, 800);
  };

  const completeOptimization = () => {
    const scenario = scenarios[selectedScenario];
    if (!scenario) return;

    // Generate realistic optimization results
    const result: OptimizationResult = {
      original_portfolio: scenario.portfolio,
      optimized_portfolio: generateOptimizedPortfolio(scenario),
      improvements: {
        return_increase: 18.5, // 18.5% improvement
        risk_reduction: 12.3,
        liquidity_improvement: 8.7,
        cost_savings: 45000
      },
      recommendations: generateRecommendations(scenario),
      risk_analysis: {
        var_95: 0.08, // 8% VaR at 95% confidence
        expected_return: 0.165, // 16.5% expected annual return
        sharpe_ratio: 1.42,
        max_drawdown: 0.15 // 15% maximum drawdown
      },
      execution_plan: generateExecutionPlan()
    };

    setOptimizationResult(result);
    setIsOptimizing(false);

    demoMode.trackInteraction({
      type: 'step_complete',
      data: {
        scenario: selectedScenario,
        improvements: result.improvements,
        audience: selectedAudience
      }
    });

    if (onComplete) {
      onComplete(result);
    }
  };

  const generateOptimizedPortfolio = (scenario: PortfolioOptimizationScenario): CarbonPortfolio => {
    return {
      ...scenario.portfolio,
      credits: scenario.portfolio.credits.map(credit => ({
        ...credit,
        volume: credit.volume * (1 + (Math.random() - 0.5) * 0.3), // ±15% adjustment
        current_value: credit.current_value * (1 + Math.random() * 0.1 + 0.05) // 5-15% improvement
      }))
    };
  };

  const generateRecommendations = (scenario: PortfolioOptimizationScenario) => [
    {
      type: 'sell' as const,
      asset: 'VCS Renewable Energy Credits',
      quantity: 500,
      rationale: 'Reduce exposure to lower-performing VCS credits in favor of higher-yield ESC opportunities',
      impact: 7.2
    },
    {
      type: 'buy' as const,
      asset: 'NSW ESC Commercial Building Efficiency',
      quantity: 1200,
      rationale: 'Increase allocation to high-performing ESC sector with strong regulatory support',
      impact: 8.7
    },
    {
      type: 'rebalance' as const,
      asset: 'ACCU Reforestation Credits',
      quantity: 800,
      rationale: 'Optimize ACCU allocation for better risk-return balance',
      impact: 6.5
    },
    {
      type: 'hedge' as const,
      asset: 'ESC Price Volatility Hedge',
      quantity: 300,
      rationale: 'Add hedging position to protect against ESC price volatility',
      impact: 5.8
    }
  ];

  const generateExecutionPlan = () => [
    {
      step: 1,
      action: 'Liquidate 500 tonnes VCS renewable energy credits',
      timeline: 'Week 1-2',
      priority: 'high' as const
    },
    {
      step: 2,
      action: 'Acquire 1,200 tonnes NSW ESC commercial building efficiency credits',
      timeline: 'Week 2-3',
      priority: 'high' as const
    },
    {
      step: 3,
      action: 'Rebalance ACCU allocation across 3 geographic regions',
      timeline: 'Week 3-4',
      priority: 'medium' as const
    },
    {
      step: 4,
      action: 'Implement ESC price volatility hedging strategy',
      timeline: 'Week 4-5',
      priority: 'medium' as const
    },
    {
      step: 5,
      action: 'Monitor and adjust allocations based on market conditions',
      timeline: 'Ongoing',
      priority: 'low' as const
    }
  ];

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'ESC':
        return 'bg-blue-500';
      case 'ACCU':
        return 'bg-green-500';
      case 'VCS':
        return 'bg-purple-500';
      case 'WREI':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskColor = (rating: string) => {
    switch (rating) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Optimizer</h1>
            <p className="text-gray-600 mt-1">
              AI-powered ESC portfolio optimization with risk management and return maximization
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back
            </button>
          )}
        </div>

        {/* Portfolio Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Current Portfolio Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">15,000t</div>
              <div className="text-sm text-gray-600">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">A$735k</div>
              <div className="text-sm text-gray-600">Current Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12.8%</div>
              <div className="text-sm text-gray-600">YTD Return</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">6.2</div>
              <div className="text-sm text-gray-600">Risk Score (1-10)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">A$180k</div>
              <div className="text-sm text-gray-600">Available Cash</div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration or Results */}
      {!optimizationResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strategy Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Optimization Strategy</h3>
            <div className="space-y-3">
              {Object.values(scenarios).map((scenario) => (
                <div
                  key={scenario.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedScenario === scenario.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ChartPieIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                      <p className="text-sm text-gray-600">{scenario.time_horizon} months</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{scenario.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {scenario.objectives.map((obj, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {obj.type.replace('-', ' ')} ({(obj.weight * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Portfolio Composition */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Portfolio Composition</h3>
            <div className="space-y-4">
              {scenarios[selectedScenario].portfolio.credits.map((credit) => (
                <div key={credit.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getAssetTypeColor(credit.type)}`} />
                    <div>
                      <div className="font-medium text-gray-900">{credit.project_type}</div>
                      <div className="text-sm text-gray-600">{credit.type} • {credit.vintage_year}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{credit.volume.toLocaleString()}t</div>
                    <div className="text-sm text-gray-600">A${credit.current_value.toFixed(2)}/t</div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(credit.risk_rating)}`}>
                      {credit.risk_rating} risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Controls */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Optimization Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Horizon
                </label>
                <select
                  value={selectedTimeHorizon}
                  onChange={(e) => setSelectedTimeHorizon(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                  <option value={18}>18 months</option>
                  <option value={24}>24 months</option>
                  <option value={36}>36 months</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={startOptimization}
                  disabled={isOptimizing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isOptimizing ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Optimizing Portfolio...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-5 h-5" />
                      Start Optimization
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optimization Progress */}
            {isOptimizing && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Optimization Progress</span>
                  <span>{optimizationProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${optimizationProgress}%` }}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Analyzing market conditions, calculating optimal allocations, and evaluating risk factors...
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Optimization Results */
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Optimization Complete</h2>
                <p className="text-gray-600">Portfolio optimization completed successfully with significant improvements</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                  <div className="text-2xl font-bold text-green-600">
                    +{optimizationResult.improvements.return_increase.toFixed(1)}%
                  </div>
                </div>
                <div className="text-sm text-gray-600">Return Increase</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
                  <div className="text-2xl font-bold text-blue-600">
                    -{optimizationResult.improvements.risk_reduction.toFixed(1)}%
                  </div>
                </div>
                <div className="text-sm text-gray-600">Risk Reduction</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BanknotesIcon className="w-5 h-5 text-purple-500" />
                  <div className="text-2xl font-bold text-purple-600">
                    A${(optimizationResult.improvements.cost_savings / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="text-sm text-gray-600">Cost Savings</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ClockIcon className="w-5 h-5 text-orange-500" />
                  <div className="text-2xl font-bold text-orange-600">
                    {optimizationResult.risk_analysis.sharpe_ratio.toFixed(2)}
                  </div>
                </div>
                <div className="text-sm text-gray-600">Sharpe Ratio</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
              <div className="space-y-4">
                {optimizationResult.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rec.type === 'buy' ? 'bg-green-100 text-green-800' :
                          rec.type === 'sell' ? 'bg-red-100 text-red-800' :
                          rec.type === 'rebalance' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rec.type.toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-900">{rec.quantity.toLocaleString()}t</span>
                      </div>
                      <div className="text-sm text-gray-600">Impact: {rec.impact.toFixed(1)}/10</div>
                    </div>
                    <div className="text-sm text-gray-900 mb-1">{rec.asset}</div>
                    <div className="text-xs text-gray-600">{rec.rationale}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Execution Plan</h3>
              <div className="space-y-3">
                {optimizationResult.execution_plan.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{step.action}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {step.timeline} •
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getPriorityColor(step.priority)}`}>
                          {step.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Risk Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {(optimizationResult.risk_analysis.expected_return * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Expected Return</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {(optimizationResult.risk_analysis.var_95 * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Value at Risk (95%)</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {(optimizationResult.risk_analysis.max_drawdown * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Max Drawdown</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {optimizationResult.risk_analysis.sharpe_ratio.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Sharpe Ratio</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setOptimizationResult(null);
                setOptimizationProgress(0);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              New Optimization
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <DocumentChartBarIcon className="w-4 h-4" />
              Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <CheckCircleIcon className="w-4 h-4" />
              Implement Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioOptimizer;