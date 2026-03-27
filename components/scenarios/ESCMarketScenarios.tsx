/**
 * WREI Trading Platform - NSW ESC Market Scenarios
 *
 * Step 1.3: Scenario Library & Templates - ESC Market Trading Scenarios
 * Realistic NSW Energy Savings Certificate trading scenarios with market dynamics
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import {
  ESCScenarioTemplate,
  TradingSimulation,
  MarketParticipant,
  ScenarioOutcome,
  SimulationMetrics
} from './types';
import { AudienceType } from '../audience';
import { useDemoMode } from '../../lib/demo-mode/demo-state-manager';
import { getCurrentESCMarketContext } from '../../lib/demo-mode/esc-market-context';

interface ESCMarketScenariosProps {
  scenarioId?: string;
  selectedAudience?: AudienceType;
  onComplete?: (results: SimulationMetrics) => void;
  onBack?: () => void;
}

const ESCMarketScenarios: React.FC<ESCMarketScenariosProps> = ({
  scenarioId,
  selectedAudience,
  onComplete,
  onBack
}) => {
  const [currentSimulation, setCurrentSimulation] = useState<TradingSimulation | null>(null);
  const [simulationStep, setSimulationStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [metrics, setMetrics] = useState<SimulationMetrics | null>(null);
  const [marketData, setMarketData] = useState<any>(null);

  const demoMode = useDemoMode();

  // NSW ESC Scenario Templates
  const escScenarios: Record<string, ESCScenarioTemplate> = {
    'esc-basic-trading': {
      id: 'esc-basic-trading',
      name: 'NSW ESC Basic Trading Scenario',
      description: 'Simple ESC trading scenario demonstrating price negotiation and settlement',
      type: 'esc-market-trading',
      complexity: 'basic',
      duration: 'quick',
      targetAudience: ['executive', 'technical', 'compliance'],

      marketContext: {
        spot_price: 47.80,
        volume_available: 5000,
        participant_count: 12,
        market_volatility: 'medium',
        time_of_day: 'midday',
        seasonal_factor: 1.15 // Spring demand increase
      },

      tradingParameters: {
        volume_tonnes: 1000,
        max_price: 52.00,
        min_price: 44.00,
        urgency_level: 'medium',
        quality_requirements: {
          vintage_year: 2025,
          verification_standard: 'WREI',
          additionality_proof: true,
          co_benefits: true
        },
        settlement_preference: 'T+0',
        payment_terms: 'immediate'
      },

      expectedOutcomes: {
        price_range: [46.20, 49.40],
        success_probability: 0.95,
        time_to_completion: 8,
        key_metrics: {
          price_improvement: 0.185, // 18.5% vs traditional
          execution_speed: 0.340, // 340ms avg
          compliance_score: 0.98
        }
      },

      scenarioSteps: [
        {
          id: 'market-analysis',
          name: 'Market Analysis & Price Discovery',
          description: 'AI analyzes current market conditions and identifies optimal entry points',
          type: 'system-event',
          duration_seconds: 15,
          triggers: {
            automatic: true,
            manual_triggers: [],
            condition_triggers: []
          },
          actions: [
            {
              type: 'market-event',
              target: 'price-discovery',
              parameters: { analysis_depth: 'comprehensive' },
              expected_outcome: 'Optimal price range identified'
            }
          ],
          validation: {
            required_metrics: ['spot_price', 'volume_available'],
            success_criteria: [],
            failure_conditions: []
          }
        },
        {
          id: 'participant-matching',
          name: 'Participant Matching & Initial Contact',
          description: 'System matches with suitable ESC sellers based on criteria',
          type: 'market-action',
          duration_seconds: 20,
          triggers: {
            automatic: true,
            manual_triggers: [],
            condition_triggers: []
          },
          actions: [
            {
              type: 'participant-action',
              target: 'seller-matching',
              parameters: { criteria: 'volume_price_quality' },
              expected_outcome: '3-5 qualified sellers identified'
            }
          ],
          validation: {
            required_metrics: ['matched_participants'],
            success_criteria: [],
            failure_conditions: []
          }
        },
        {
          id: 'ai-negotiation',
          name: 'AI-Powered Price Negotiation',
          description: 'Claude AI negotiates pricing terms with selected participants',
          type: 'participant-decision',
          duration_seconds: 45,
          triggers: {
            automatic: true,
            manual_triggers: [],
            condition_triggers: []
          },
          actions: [
            {
              type: 'participant-action',
              target: 'negotiation-engine',
              parameters: { strategy: 'collaborative_optimization' },
              expected_outcome: 'Agreed price within target range'
            }
          ],
          validation: {
            required_metrics: ['final_price', 'negotiation_rounds'],
            success_criteria: [],
            failure_conditions: []
          }
        },
        {
          id: 'compliance-validation',
          name: 'CER Compliance Validation',
          description: 'Automated validation of ESC certificates and compliance requirements',
          type: 'validation-check',
          duration_seconds: 30,
          triggers: {
            automatic: true,
            manual_triggers: [],
            condition_triggers: []
          },
          actions: [
            {
              type: 'compliance-check',
              target: 'cer-validation',
              parameters: { validation_type: 'comprehensive' },
              expected_outcome: 'All compliance requirements satisfied'
            }
          ],
          validation: {
            required_metrics: ['compliance_score'],
            success_criteria: [],
            failure_conditions: []
          }
        },
        {
          id: 'atomic-settlement',
          name: 'T+0 Atomic Settlement',
          description: 'Zoniqx blockchain settlement with instant transfer of ESCs and payment',
          type: 'system-event',
          duration_seconds: 10,
          triggers: {
            automatic: true,
            manual_triggers: [],
            condition_triggers: []
          },
          actions: [
            {
              type: 'market-event',
              target: 'blockchain-settlement',
              parameters: { settlement_type: 'atomic' },
              expected_outcome: 'Transaction completed and recorded'
            }
          ],
          validation: {
            required_metrics: ['settlement_time', 'transaction_hash'],
            success_criteria: [],
            failure_conditions: []
          }
        }
      ],

      validationRules: [
        {
          id: 'price-range-check',
          type: 'price-range',
          condition: {
            metric: 'final_price',
            operator: '>=',
            value: 44.00,
            description: 'Final price must be above minimum threshold'
          },
          severity: 'error',
          message: 'Price below acceptable minimum'
        }
      ]
    }
  };

  // Market Participants
  const marketParticipants: MarketParticipant[] = [
    {
      id: 'northmore-gordon',
      type: 'buyer',
      name: 'Northmore Gordon Pty Ltd',
      profile: {
        risk_tolerance: 'medium',
        experience_level: 'expert',
        preferred_price_range: [44.00, 52.00],
        volume_capacity: 10000,
        response_speed: 'fast',
        negotiation_style: 'balanced'
      },
      strategy: {
        approach: 'balanced',
        concession_rate: 0.02,
        max_rounds: 8,
        break_points: [46.00, 48.50, 51.00]
      },
      current_position: {
        volume_held: 0,
        cash_available: 500000,
        open_orders: []
      }
    },
    {
      id: 'greentech-solutions',
      type: 'seller',
      name: 'GreenTech Solutions',
      profile: {
        risk_tolerance: 'low',
        experience_level: 'experienced',
        preferred_price_range: [46.00, 50.00],
        volume_capacity: 3000,
        response_speed: 'medium',
        negotiation_style: 'conservative'
      },
      strategy: {
        approach: 'price-focused',
        concession_rate: 0.015,
        max_rounds: 6,
        break_points: [47.00, 48.50]
      },
      current_position: {
        volume_held: 2800,
        cash_available: 0,
        open_orders: []
      }
    },
    {
      id: 'esc-trading-corp',
      type: 'seller',
      name: 'ESC Trading Corp',
      profile: {
        risk_tolerance: 'high',
        experience_level: 'expert',
        preferred_price_range: [45.00, 49.00],
        volume_capacity: 5000,
        response_speed: 'fast',
        negotiation_style: 'aggressive'
      },
      strategy: {
        approach: 'volume-focused',
        concession_rate: 0.025,
        max_rounds: 5,
        break_points: [46.50, 48.00]
      },
      current_position: {
        volume_held: 4200,
        cash_available: 0,
        open_orders: []
      }
    }
  ];

  useEffect(() => {
    const context = getCurrentESCMarketContext();
    setMarketData(context);
  }, []);

  const startSimulation = () => {
    if (!scenarioId || !escScenarios[scenarioId]) return;

    const template = escScenarios[scenarioId];
    const simulation: TradingSimulation = {
      id: `sim-${Date.now()}`,
      template,
      status: 'running',
      startTime: new Date(),
      participants: marketParticipants,
      currentStep: 0,
      stepResults: [],
      metrics: {
        performance: {
          execution_time: 0,
          price_improvement: 0,
          volume_efficiency: 0,
          success_rate: 0
        },
        market_impact: {
          price_movement: 0,
          volume_traded: 0,
          participant_satisfaction: 0,
          market_efficiency: 0
        },
        risk_metrics: {
          counterparty_risk: 0,
          settlement_risk: 0,
          price_volatility: 0,
          liquidity_risk: 0
        },
        compliance_metrics: {
          validation_time: 0,
          compliance_score: 0,
          audit_readiness: 0,
          regulatory_risk: 0
        }
      }
    };

    setCurrentSimulation(simulation);
    setIsRunning(true);
    setSimulationStep(0);

    demoMode.trackInteraction({
      type: 'click',
      data: { action: 'simulation_start', scenario_id: scenarioId, audience: selectedAudience }
    });

    // Start step execution
    executeNextStep(simulation, 0);
  };

  const executeNextStep = async (simulation: TradingSimulation, stepIndex: number) => {
    if (stepIndex >= simulation.template.scenarioSteps.length) {
      // Simulation complete
      completeSimulation(simulation);
      return;
    }

    const step = simulation.template.scenarioSteps[stepIndex];

    // Simulate step execution
    await new Promise(resolve => setTimeout(resolve, step.duration_seconds * 100)); // Accelerated for demo

    // Generate realistic step results
    const stepResult = {
      stepId: step.id,
      status: 'success' as ScenarioOutcome,
      startTime: new Date(),
      endTime: new Date(),
      actions_taken: step.actions,
      metrics_captured: generateStepMetrics(step, stepIndex),
      participant_responses: generateParticipantResponses(step),
      validation_results: []
    };

    // Update simulation
    const updatedSimulation = {
      ...simulation,
      currentStep: stepIndex + 1,
      stepResults: [...simulation.stepResults, stepResult]
    };

    setCurrentSimulation(updatedSimulation);
    setSimulationStep(stepIndex + 1);

    // Continue to next step if not paused
    if (isRunning && !isPaused) {
      setTimeout(() => {
        executeNextStep(updatedSimulation, stepIndex + 1);
      }, 1000);
    }
  };

  const generateStepMetrics = (step: any, stepIndex: number): Record<string, number> => {
    const baseMetrics = {
      execution_time: step.duration_seconds,
      timestamp: Date.now()
    };

    switch (step.id) {
      case 'market-analysis':
        return {
          ...baseMetrics,
          spot_price: 47.80,
          volume_available: 5000,
          market_volatility: 0.12,
          optimal_entry_price: 46.85
        };
      case 'participant-matching':
        return {
          ...baseMetrics,
          matched_participants: 3,
          response_rate: 0.85,
          qualification_score: 0.92
        };
      case 'ai-negotiation':
        return {
          ...baseMetrics,
          final_price: 47.15,
          negotiation_rounds: 4,
          price_improvement: 0.185,
          participant_satisfaction: 0.89
        };
      case 'compliance-validation':
        return {
          ...baseMetrics,
          compliance_score: 0.98,
          validation_time: 28,
          risk_assessment: 0.15
        };
      case 'atomic-settlement':
        return {
          ...baseMetrics,
          settlement_time: 8.2,
          transaction_hash: Math.floor(Math.random() * 1000000),
          gas_cost: 0.0045
        };
      default:
        return baseMetrics;
    }
  };

  const generateParticipantResponses = (step: any): Record<string, any> => {
    return {
      'greentech-solutions': {
        response_time: Math.random() * 10 + 5,
        satisfaction_score: 0.85 + Math.random() * 0.1,
        price_acceptance: step.id === 'ai-negotiation' ? 0.92 : null
      },
      'esc-trading-corp': {
        response_time: Math.random() * 8 + 3,
        satisfaction_score: 0.78 + Math.random() * 0.15,
        price_acceptance: step.id === 'ai-negotiation' ? 0.88 : null
      }
    };
  };

  const completeSimulation = (simulation: TradingSimulation) => {
    const finalMetrics: SimulationMetrics = {
      performance: {
        execution_time: 120, // seconds
        price_improvement: 0.185,
        volume_efficiency: 0.95,
        success_rate: 1.0
      },
      market_impact: {
        price_movement: 0.35,
        volume_traded: 1000,
        participant_satisfaction: 0.87,
        market_efficiency: 0.93
      },
      risk_metrics: {
        counterparty_risk: 1.2,
        settlement_risk: 0.8,
        price_volatility: 0.12,
        liquidity_risk: 2.1
      },
      compliance_metrics: {
        validation_time: 28,
        compliance_score: 98,
        audit_readiness: 96,
        regulatory_risk: 1.5
      }
    };

    setMetrics(finalMetrics);
    setIsRunning(false);
    setCurrentSimulation(prev => prev ? { ...prev, status: 'completed' } : null);

    demoMode.trackInteraction({
      type: 'step_complete',
      data: {
        scenario_id: simulation.template.id,
        final_metrics: finalMetrics,
        audience: selectedAudience
      }
    });

    if (onComplete) {
      onComplete(finalMetrics);
    }
  };

  const pauseSimulation = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const resumeSimulation = () => {
    setIsPaused(false);
    setIsRunning(true);

    if (currentSimulation) {
      executeNextStep(currentSimulation, simulationStep);
    }
  };

  const stopSimulation = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentSimulation(null);
    setSimulationStep(0);
    setMetrics(null);
  };

  if (!scenarioId || !escScenarios[scenarioId]) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Scenario Not Found</h3>
          <p className="text-gray-600 mb-6">The requested ESC scenario could not be loaded.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Scenario Library
            </button>
          )}
        </div>
      </div>
    );
  }

  const scenario = escScenarios[scenarioId];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{scenario.name}</h1>
            <p className="text-gray-600 mt-1">{scenario.description}</p>
          </div>
          <div className="flex gap-2">
            {!isRunning && !currentSimulation && (
              <button
                onClick={startSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlayIcon className="w-5 h-5" />
                Start Simulation
              </button>
            )}
            {isRunning && !isPaused && (
              <button
                onClick={pauseSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <PauseIcon className="w-5 h-5" />
                Pause
              </button>
            )}
            {!isRunning && isPaused && (
              <button
                onClick={resumeSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlayIcon className="w-5 h-5" />
                Resume
              </button>
            )}
            {currentSimulation && (
              <button
                onClick={stopSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <StopIcon className="w-5 h-5" />
                Stop
              </button>
            )}
          </div>
        </div>

        {/* Market Context */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Market Context</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                A${scenario.marketContext.spot_price}
              </div>
              <div className="text-sm text-gray-600">ESC Spot Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {scenario.marketContext.volume_available.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Volume Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {scenario.marketContext.participant_count}
              </div>
              <div className="text-sm text-gray-600">Active Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {scenario.marketContext.market_volatility}
              </div>
              <div className="text-sm text-gray-600">Market Volatility</div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Progress */}
      {currentSimulation && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Simulation Progress</h3>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{simulationStep}/{scenario.scenarioSteps.length} steps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(simulationStep / scenario.scenarioSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Step */}
          {simulationStep > 0 && simulationStep <= scenario.scenarioSteps.length && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  {isRunning ? (
                    <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">
                    {scenario.scenarioSteps[simulationStep - 1]?.name}
                  </h4>
                  <p className="text-blue-700 text-sm">
                    {scenario.scenarioSteps[simulationStep - 1]?.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step Results */}
          {currentSimulation.stepResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Completed Steps</h4>
              {currentSimulation.stepResults.map((result, index) => (
                <div key={result.stepId} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {scenario.scenarioSteps[index]?.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">
                        {'Completed'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.entries(result.metrics_captured).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded p-2">
                        <div className="font-medium text-gray-700">{key.replace(/_/g, ' ')}</div>
                        <div className="text-gray-900">
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Final Results */}
      {metrics && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Simulation Completed Successfully</h3>
              <p className="text-gray-600">All trading objectives achieved within expected parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Performance Metrics */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Price Improvement:</span>
                  <span className="font-medium text-blue-900">
                    {(metrics.performance.price_improvement * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Execution Time:</span>
                  <span className="font-medium text-blue-900">
                    {metrics.performance.execution_time}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Success Rate:</span>
                  <span className="font-medium text-blue-900">
                    {(metrics.performance.success_rate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Market Impact */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3">Market Impact</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Volume Traded:</span>
                  <span className="font-medium text-green-900">
                    {metrics.market_impact.volume_traded.toLocaleString()}t
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Price Movement:</span>
                  <span className="font-medium text-green-900">
                    A${metrics.market_impact.price_movement}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Efficiency:</span>
                  <span className="font-medium text-green-900">
                    {(metrics.market_impact.market_efficiency * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-3">Risk Assessment</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Settlement Risk:</span>
                  <span className="font-medium text-yellow-900">
                    {metrics.risk_metrics.settlement_risk}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Counterparty Risk:</span>
                  <span className="font-medium text-yellow-900">
                    {metrics.risk_metrics.counterparty_risk}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Price Volatility:</span>
                  <span className="font-medium text-yellow-900">
                    {(metrics.risk_metrics.price_volatility * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-3">Compliance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-700">CER Score:</span>
                  <span className="font-medium text-purple-900">
                    {metrics.compliance_metrics.compliance_score}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Audit Readiness:</span>
                  <span className="font-medium text-purple-900">
                    {metrics.compliance_metrics.audit_readiness}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Validation Time:</span>
                  <span className="font-medium text-purple-900">
                    {metrics.compliance_metrics.validation_time}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ESCMarketScenarios;