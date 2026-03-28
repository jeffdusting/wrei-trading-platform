'use client';

/**
 * WREI Family Office Journey
 * Margaret Thompson - Family Office CIO
 * Phase 1 Milestone 1.2 - Core Investor Journeys
 */

import { useState, useEffect } from 'react';
import { PortfolioManager } from './PortfolioManager';
import { NegotiationStrategyPanel } from './NegotiationStrategyPanel';
import { NegotiationStrategyExplanation, createMockPortfolioContext } from '@/lib/negotiation-strategy';
import { PersonaType, NegotiationState } from '@/lib/types';

interface APIResponse {
  success: boolean;
  response?: string;
  strategyExplanation?: any;
  data?: any;
  error?: string;
}

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

interface WealthPreservation {
  assetClass: string;
  currentAllocation: number;
  recommendedAllocation: number;
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive';
  inflationHedge: boolean;
  generationalWealth: boolean;
}

interface SuccessionPlanning {
  generationLevel: string;
  currentAge: string;
  wealthTransferGoal: number;
  timeHorizon: number;
  riskTolerance: string;
  priorities: string[];
}

export const FamilyOfficeJourney: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wealthAssessmentComplete, setWealthAssessmentComplete] = useState(false);
  const [successionPlanningComplete, setSuccessionPlanningComplete] = useState(false);
  const [negotiationActive, setNegotiationActive] = useState(false);
  const [strategyExplanation, setStrategyExplanation] = useState<NegotiationStrategyExplanation | null>(null);
  const [strategyPanelVisible, setStrategyPanelVisible] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Margaret Thompson's Family Office Portfolio Context
  const portfolioContext = createMockPortfolioContext('family_office');

  const mockWealthPreservation: WealthPreservation[] = [
    {
      assetClass: 'Real Estate (Global)',
      currentAllocation: 35.2,
      recommendedAllocation: 32.0,
      riskLevel: 'Conservative',
      inflationHedge: true,
      generationalWealth: true
    },
    {
      assetClass: 'Public Equities',
      currentAllocation: 28.5,
      recommendedAllocation: 25.0,
      riskLevel: 'Moderate',
      inflationHedge: false,
      generationalWealth: true
    },
    {
      assetClass: 'Fixed Income',
      currentAllocation: 15.8,
      recommendedAllocation: 18.0,
      riskLevel: 'Conservative',
      inflationHedge: false,
      generationalWealth: false
    },
    {
      assetClass: 'Alternative Assets',
      currentAllocation: 12.3,
      recommendedAllocation: 15.0,
      riskLevel: 'Moderate',
      inflationHedge: true,
      generationalWealth: true
    },
    {
      assetClass: 'WREI Asset Co Tokens',
      currentAllocation: 1.2,
      recommendedAllocation: 3.0,
      riskLevel: 'Conservative',
      inflationHedge: true,
      generationalWealth: true
    },
    {
      assetClass: 'Cash & Liquidity',
      currentAllocation: 7.0,
      recommendedAllocation: 7.0,
      riskLevel: 'Conservative',
      inflationHedge: false,
      generationalWealth: false
    }
  ];

  const mockSuccessionPlanning: SuccessionPlanning[] = [
    {
      generationLevel: 'Generation 2 (Children)',
      currentAge: '35-42 years',
      wealthTransferGoal: 1200000000, // A$1.2B
      timeHorizon: 25,
      riskTolerance: 'Moderate to Conservative',
      priorities: ['Education funding', 'Career development', 'Family governance training']
    },
    {
      generationLevel: 'Generation 3 (Grandchildren)',
      currentAge: '8-16 years',
      wealthTransferGoal: 800000000, // A$800M
      timeHorizon: 45,
      riskTolerance: 'Moderate to Aggressive',
      priorities: ['Long-term growth', 'Educational trusts', 'Sustainable investing']
    },
    {
      generationLevel: 'Philanthropic Foundation',
      currentAge: 'Perpetual',
      wealthTransferGoal: 500000000, // A$500M
      timeHorizon: 100,
      riskTolerance: 'Conservative',
      priorities: ['ESG alignment', 'Sustainable impact', 'Long-term preservation']
    }
  ];

  const journeySteps: JourneyStep[] = [
    {
      id: 'wealth_assessment',
      title: 'Wealth Preservation Assessment',
      description: 'Comprehensive multi-generational wealth preservation analysis',
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending'
    },
    {
      id: 'succession_planning',
      title: 'Succession & Legacy Planning',
      description: 'Long-term wealth transfer and family governance strategy',
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 'asset_allocation',
      title: 'Alternative Asset Allocation',
      description: 'Strategic allocation to WREI Asset Co tokens for diversification',
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      id: 'wrei_acquisition',
      title: 'WREI Asset Co Acquisition',
      description: 'Conservative acquisition of asset-backed tokens with family governance',
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending'
    },
    {
      id: 'governance_setup',
      title: 'Family Governance Integration',
      description: 'Configure family investment committee oversight and reporting',
      status: currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'pending'
    }
  ];

  const handleWealthAssessment = () => {
    setWealthAssessmentComplete(true);
    setTimeout(() => setCurrentStep(1), 1000);
  };

  const handleSuccessionPlanning = () => {
    setSuccessionPlanningComplete(true);
    setTimeout(() => setCurrentStep(2), 1000);
  };

  const handleStartNegotiation = async () => {
    setNegotiationActive(true);
    setCurrentStep(3);
    setStrategyPanelVisible(true);

    // Initialize negotiation with AI explanation
    const initialMessage = {
      role: 'user' as const,
      content: 'I am Margaret Thompson, CIO of the Thompson Family Office managing A$2.5B in multi-generational wealth. We are seeking to allocate 3% (A$75M) to WREI Asset Co tokens as a conservative infrastructure investment with inflation protection characteristics. Our investment committee prioritises capital preservation, steady income, and alignment with family values of environmental stewardship.'
    };

    setMessages([initialMessage]);
    await handleNegotiation(initialMessage.content);
  };

  const handleNegotiation = async (userMessage: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          persona: 'family_office',
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      });

      const data: APIResponse = await response.json();

      if (data.success) {
        setMessages(prev => [...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: data.response || 'No response received' }
        ]);

        if (data.strategyExplanation) {
          setStrategyExplanation(data.strategyExplanation);
        }
      }
    } catch (error) {
      console.error('Negotiation error:', error);
    } finally {
      setIsLoading(false);
      setCurrentInput('');
    }
  };

  const handleSendMessage = () => {
    if (currentInput.trim() && !isLoading) {
      handleNegotiation(currentInput.trim());
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-blue-900 mb-4">
                🏛️ Wealth Preservation Assessment
              </h3>
              <p className="text-blue-800 mb-6">
                Comprehensive analysis of the Thompson Family Office portfolio with focus on multi-generational wealth preservation and inflation protection.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className=" text-slate-800">Total Family Wealth</h4>
                  <p className="bloomberg-large-metric text-blue-600">A$2.5B</p>
                  <p className="bloomberg-small-text text-slate-600">Multi-generational assets</p>
                </div>
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className=" text-slate-800">Investment Horizon</h4>
                  <p className="bloomberg-large-metric text-green-600">50+ Years</p>
                  <p className="bloomberg-small-text text-slate-600">Generational wealth transfer</p>
                </div>
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className=" text-slate-800">Risk Profile</h4>
                  <p className="bloomberg-large-metric text-amber-600">Conservative</p>
                  <p className="bloomberg-small-text text-slate-600">Capital preservation focus</p>
                </div>
              </div>

              {/* Wealth Preservation Analysis */}
              <div className="mb-6">
                <h4 className=" text-slate-800 mb-3">📊 Asset Allocation Analysis</h4>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg border border-blue-200">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-4 py-3 text-left  text-blue-900">Asset Class</th>
                        <th className="px-4 py-3 text-center  text-blue-900">Current %</th>
                        <th className="px-4 py-3 text-center  text-blue-900">Target %</th>
                        <th className="px-4 py-3 text-center  text-blue-900">Risk Level</th>
                        <th className="px-4 py-3 text-center  text-blue-900">Inflation Hedge</th>
                        <th className="px-4 py-3 text-center  text-blue-900">Generational</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockWealthPreservation.map((allocation, index) => {
                        const allocationGap = allocation.recommendedAllocation - allocation.currentAllocation;
                        const isRebalanceNeeded = Math.abs(allocationGap) > 1.0;

                        return (
                          <tr key={index} className="border-t border-blue-100">
                            <td className="px-4 py-3 font-medium text-slate-800">{allocation.assetClass}</td>
                            <td className="px-4 py-3 text-center text-slate-700">
                              {allocation.currentAllocation.toFixed(1)}%
                            </td>
                            <td className="px-4 py-3 text-center ">
                              <span className={isRebalanceNeeded ? 'text-blue-600' : 'text-slate-700'}>
                                {allocation.recommendedAllocation.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full bloomberg-small-text ${
                                allocation.riskLevel === 'Conservative' ? 'bg-green-100 text-green-800' :
                                allocation.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {allocation.riskLevel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {allocation.inflationHedge ? (
                                <span className="text-green-600">✅</span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {allocation.generationalWealth ? (
                                <span className="text-blue-600">👨‍👩‍👧‍👦</span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-white border border-blue-200 rounded-lg">
                <h4 className=" text-slate-800 mb-2">🎯 Key Recommendations</h4>
                <ul className="bloomberg-small-text text-slate-600 space-y-1">
                  <li>• Increase alternative asset allocation to 15% for enhanced diversification</li>
                  <li>• Add 3% allocation to WREI Asset Co tokens for infrastructure exposure</li>
                  <li>• Reduce real estate concentration by 3.2% to optimise geographical diversification</li>
                  <li>• Maintain conservative risk profile while enhancing inflation protection</li>
                  <li>• Focus on assets suitable for multi-generational wealth transfer</li>
                </ul>
              </div>

              <button
                onClick={handleWealthAssessment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg  transition-colors mt-4"
                disabled={wealthAssessmentComplete}
              >
                {wealthAssessmentComplete ? '✅ Assessment Complete' : 'Complete Wealth Assessment'}
              </button>
            </div>

            <PortfolioManager persona="family_office" />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-purple-900 mb-4">
                👨‍👩‍👧‍👦 Succession & Legacy Planning
              </h3>
              <p className="text-purple-800 mb-6">
                Strategic planning for multi-generational wealth transfer, family governance, and philanthropic legacy aligned with Thompson family values.
              </p>

              {/* Succession Planning Timeline */}
              <div className="mb-6">
                <h4 className=" text-slate-800 mb-3">📅 Generational Wealth Transfer Plan</h4>
                <div className="space-y-4">
                  {mockSuccessionPlanning.map((plan, index) => (
                    <div key={index} className="bg-white border border-purple-200 rounded-lg p-5">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                          <h5 className=" text-slate-800 mb-2">{plan.generationLevel}</h5>
                          <div className="space-y-1 bloomberg-small-text">
                            <p><span className="text-slate-600">Age Range:</span> {plan.currentAge}</p>
                            <p><span className="text-slate-600">Time Horizon:</span> {plan.timeHorizon} years</p>
                            <p><span className="text-slate-600">Risk Tolerance:</span> {plan.riskTolerance}</p>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="bloomberg-small-text text-slate-600 mb-1">Wealth Transfer Target</p>
                          <p className="bloomberg-large-metric text-purple-600">
                            A${(plan.wealthTransferGoal / 1000000000).toFixed(1)}B
                          </p>
                          <p className="bloomberg-section-label text-slate-500">
                            {((plan.wealthTransferGoal / 2500000000) * 100).toFixed(1)}% of total wealth
                          </p>
                        </div>

                        <div>
                          <p className="font-medium text-slate-800 mb-2">Key Priorities</p>
                          <ul className="bloomberg-small-text text-slate-600 space-y-1">
                            {plan.priorities.map((priority, idx) => (
                              <li key={idx}>• {priority}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Family Governance Structure */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-purple-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">🏛️ Family Governance Structure</h4>

                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <h5 className="font-medium text-blue-900">Family Investment Committee</h5>
                      <p className="bloomberg-small-text text-blue-800 mt-1">
                        Strategic investment decisions and policy governance
                      </p>
                      <div className="bloomberg-section-label text-blue-600 mt-2">
                        Meeting Frequency: Quarterly • Members: 5 family members
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <h5 className="font-medium text-green-900">Next Generation Advisory Board</h5>
                      <p className="bloomberg-small-text text-green-800 mt-1">
                        Education and training for wealth management responsibility
                      </p>
                      <div className="bloomberg-section-label text-green-600 mt-2">
                        Meeting Frequency: Monthly • Members: 8 next-gen family members
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                      <h5 className="font-medium text-amber-900">Philanthropic Foundation Board</h5>
                      <p className="bloomberg-small-text text-amber-800 mt-1">
                        ESG and impact investment oversight
                      </p>
                      <div className="bloomberg-section-label text-amber-600 mt-2">
                        Meeting Frequency: Bi-annually • Members: 3 family + 2 external
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-purple-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">🌱 ESG & Impact Alignment</h4>

                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-slate-800">Environmental Stewardship</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Focus on sustainable infrastructure and renewable energy investments
                      </p>
                      <div className="bloomberg-section-label text-green-600 mt-2 font-medium">Target: 25% of alternatives allocation</div>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-slate-800">Social Responsibility</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Education, healthcare, and community development initiatives
                      </p>
                      <div className="bloomberg-section-label text-blue-600 mt-2 font-medium">Foundation allocation: A$500M</div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-medium text-slate-800">Governance Excellence</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Transparent reporting and family engagement in investment decisions
                      </p>
                      <div className="bloomberg-section-label text-purple-600 mt-2 font-medium">Quarterly family impact reports</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white border border-purple-200 rounded-lg">
                <h4 className=" text-slate-800 mb-2">📋 Implementation Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="text-center">
                    <div className="bloomberg-card-title text-purple-600">2026-2030</div>
                    <div className="bloomberg-small-text font-medium text-slate-800">Foundation Phase</div>
                    <div className="bloomberg-section-label text-slate-600">Governance setup & education</div>
                  </div>
                  <div className="text-center">
                    <div className="bloomberg-card-title text-blue-600">2030-2045</div>
                    <div className="bloomberg-small-text font-medium text-slate-800">Transition Phase</div>
                    <div className="bloomberg-section-label text-slate-600">Gradual wealth transfer</div>
                  </div>
                  <div className="text-center">
                    <div className="bloomberg-card-title text-green-600">2045-2075</div>
                    <div className="bloomberg-small-text font-medium text-slate-800">Legacy Phase</div>
                    <div className="bloomberg-section-label text-slate-600">Next generation leadership</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSuccessionPlanning}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg  transition-colors mt-4"
                disabled={successionPlanningComplete}
              >
                {successionPlanningComplete ? '✅ Planning Complete' : 'Complete Succession Planning'}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-green-900 mb-4">
                🏗️ Alternative Asset Allocation Strategy
              </h3>
              <p className="text-green-800 mb-6">
                Strategic allocation to WREI Asset Co tokens as part of alternative assets portfolio, providing infrastructure exposure with inflation protection characteristics.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* WREI Asset Co Token Benefits */}
                <div className="bg-white border border-green-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">💎 WREI Asset Co Token Benefits</h4>

                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-slate-800">Real Asset Backing</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Tokens backed by Australian water infrastructure with stable revenue streams
                      </p>
                      <div className="bloomberg-section-label text-blue-600 mt-2 font-medium">
                        Asset Class: Water Infrastructure • Location: Murray-Darling Basin
                      </div>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-slate-800">Inflation Protection</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Infrastructure assets with regulated returns and inflation indexation
                      </p>
                      <div className="bloomberg-section-label text-green-600 mt-2 font-medium">
                        Historical correlation: 0.85 with CPI • Revenue escalation: CPI + 2%
                      </div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-medium text-slate-800">Generational Suitability</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        50+ year asset life with sustainable revenue model
                      </p>
                      <div className="bloomberg-section-label text-purple-600 mt-2 font-medium">
                        Asset Life: 75+ years • Revenue Visibility: 25+ years
                      </div>
                    </div>

                    <div className="border-l-4 border-amber-500 pl-4">
                      <h5 className="font-medium text-slate-800">ESG Alignment</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Water infrastructure supports SDG 6 (Clean Water) and environmental stewardship
                      </p>
                      <div className="bloomberg-section-label text-amber-600 mt-2 font-medium">
                        ESG Score: AA+ • SDG Impact: High • Carbon Footprint: Net Negative
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investment Structure */}
                <div className="bg-white border border-green-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">📊 Proposed Investment Structure</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Target Allocation</span>
                      <span className=" text-green-600">3.0% of Portfolio</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Investment Amount</span>
                      <span className="">A$75,000,000</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Token Quantity</span>
                      <span className="">750,000 ACO-WTR</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Expected Yield</span>
                      <span className=" text-green-600">5.8% p.a.</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Investment Horizon</span>
                      <span className="">25+ years</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Liquidity Profile</span>
                      <span className="">Quarterly redemptions</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <h5 className="font-medium text-green-900">Family Office Benefits</h5>
                    <ul className="bloomberg-small-text text-green-800 mt-1 space-y-1">
                      <li>• Conservative risk profile suitable for preservation capital</li>
                      <li>• Quarterly income distributions for family distributions</li>
                      <li>• Infrastructure exposure without direct asset management</li>
                      <li>• ESG credentials align with family values</li>
                      <li>• Tokenised structure enables flexible succession planning</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="mt-6 p-4 bg-white border border-green-200 rounded-lg">
                <h4 className=" text-slate-800 mb-3">⚖️ Risk Assessment & Mitigation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">Key Risks</h5>
                    <ul className="bloomberg-small-text text-slate-600 space-y-1">
                      <li>• Regulatory changes affecting water infrastructure</li>
                      <li>• Climate impact on water availability and demand</li>
                      <li>• Technology risk in tokenisation platform</li>
                      <li>• Liquidity constraints in secondary market</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Mitigation Strategies</h5>
                    <ul className="bloomberg-small-text text-slate-600 space-y-1">
                      <li>• Diversification across multiple water assets</li>
                      <li>• Insurance coverage for climate-related events</li>
                      <li>• Staged investment approach over 12 months</li>
                      <li>• Quarterly liquidity windows for portfolio rebalancing</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white border border-green-200 rounded-lg">
                <h4 className=" text-slate-800 mb-2">🎯 Next Step: Family Investment Committee Approval</h4>
                <p className="text-slate-700 mb-3">
                  Present WREI Asset Co token allocation proposal to Family Investment Committee with comprehensive due diligence documentation.
                </p>
                <div className="bloomberg-small-text text-slate-600">
                  <strong>Committee Meeting:</strong> April 15, 2026 •
                  <strong>Required Documentation:</strong> Investment memo, risk assessment, ESG report •
                  <strong>Implementation Timeline:</strong> Q2-Q3 2026
                </div>
              </div>

              <button
                onClick={handleStartNegotiation}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg  transition-colors mt-4"
              >
                Proceed to WREI Acquisition
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-indigo-900 mb-4">
                🤝 WREI Asset Co Token Acquisition
              </h3>
              <p className="text-indigo-800 mb-4">
                Conservative acquisition of WREI Asset Co tokens with family governance oversight and long-term wealth preservation focus.
              </p>

              <div className="bg-white border border-indigo-200 rounded-lg p-4 mb-4">
                <h4 className=" text-slate-800 mb-2">🏛️ Family Office Context</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bloomberg-small-text">
                  <div>
                    <span className="text-slate-600">Office Type:</span>
                    <p className="font-medium">Multi-Generational</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Target Investment:</span>
                    <p className="font-medium">A$75M Asset Co</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Risk Profile:</span>
                    <p className="font-medium">Conservative</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Time Horizon:</span>
                    <p className="font-medium">25+ Years</p>
                  </div>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="bg-white border border-indigo-200 rounded-lg">
                <div className="border-b border-indigo-200 p-4">
                  <h4 className=" text-slate-800">💬 Acquisition Negotiation</h4>
                </div>

                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      <p>Negotiation will begin when you start the process above.</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="bloomberg-section-label opacity-70 mb-1">
                            {message.role === 'user' ? 'Margaret Thompson (You)' : 'WREI AI Agent'}
                          </div>
                          {message.content}
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 p-3 rounded-lg">
                        <div className="bloomberg-section-label text-slate-500 mb-1">WREI AI Agent</div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-indigo-200 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={!negotiationActive || isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!currentInput.trim() || isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy Panel Integration */}
            {negotiationActive && (
              <div className="fixed bottom-4 right-4 max-w-md z-50">
                <NegotiationStrategyPanel
                  explanation={strategyExplanation}
                  isVisible={strategyPanelVisible}
                  onToggle={() => setStrategyPanelVisible(!strategyPanelVisible)}
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-blue-900 mb-4">
                🏛️ Family Governance Integration
              </h3>
              <p className="text-blue-800 mb-6">
                Configure family investment committee oversight, reporting structures, and governance frameworks for WREI Asset Co token holdings.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Governance Structure */}
                <div className="bg-white border border-blue-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">📋 Investment Committee Oversight</h4>

                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <h5 className="font-medium text-blue-900">Quarterly Review Process</h5>
                      <ul className="bloomberg-small-text text-blue-800 mt-1 space-y-1">
                        <li>• Asset performance and yield analysis</li>
                        <li>• ESG impact measurement and reporting</li>
                        <li>• Liquidity and risk assessment</li>
                        <li>• Strategic allocation review</li>
                      </ul>
                      <div className="bloomberg-section-label text-blue-600 mt-2">Next Review: July 15, 2026</div>
                    </div>

                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <h5 className="font-medium text-green-900">Investment Decision Authority</h5>
                      <ul className="bloomberg-small-text text-green-800 mt-1 space-y-1">
                        <li>• &lt; A$25M: CIO discretionary authority</li>
                        <li>• A$25M-75M: Investment committee approval</li>
                        <li>• &gt; A$75M: Full family council approval</li>
                        <li>• Exit decisions: Always require committee approval</li>
                      </ul>
                      <div className="bloomberg-section-label text-green-600 mt-2">Current Investment: Committee Approved</div>
                    </div>

                    <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                      <h5 className="font-medium text-purple-900">Next Generation Engagement</h5>
                      <ul className="bloomberg-small-text text-purple-800 mt-1 space-y-1">
                        <li>• Monthly education sessions on infrastructure investing</li>
                        <li>• Participation in ESG impact assessment</li>
                        <li>• Advisory role in sustainability initiatives</li>
                        <li>• Voting rights on values-based investments</li>
                      </ul>
                      <div className="bloomberg-section-label text-purple-600 mt-2">8 family members actively engaged</div>
                    </div>
                  </div>
                </div>

                {/* Reporting Framework */}
                <div className="bg-white border border-blue-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">📊 Family Reporting Framework</h4>

                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-slate-800">Monthly Performance Reports</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Asset performance, income distributions, and portfolio impact
                      </p>
                      <div className="bloomberg-section-label text-blue-600 mt-2">Distribution: All family stakeholders</div>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-slate-800">Quarterly ESG Impact Reports</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Environmental stewardship metrics and social impact measurement
                      </p>
                      <div className="bloomberg-section-label text-green-600 mt-2">Format: Executive summary + detailed analysis</div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-medium text-slate-800">Annual Wealth Transfer Planning</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Long-term strategy review and succession planning updates
                      </p>
                      <div className="bloomberg-section-label text-purple-600 mt-2">Focus: Multi-generational impact</div>
                    </div>

                    <div className="border-l-4 border-amber-500 pl-4">
                      <h5 className="font-medium text-slate-800">Special Situation Updates</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Material events, regulatory changes, and strategic opportunities
                      </p>
                      <div className="bloomberg-section-label text-amber-600 mt-2">Delivery: As required</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white border border-blue-200 rounded-lg">
                <h4 className=" text-slate-800 mb-2">✅ Journey Complete</h4>
                <p className="text-slate-700 mb-3">
                  The Thompson Family Office WREI investment journey is now complete. You have successfully implemented a conservative, multi-generational infrastructure investment strategy:
                </p>
                <ul className="bloomberg-small-text text-slate-600 space-y-1 mb-4">
                  <li>✓ Completed comprehensive wealth preservation assessment</li>
                  <li>✓ Developed multi-generational succession and legacy planning framework</li>
                  <li>✓ Strategic allocation of 3% (A$75M) to WREI Asset Co tokens</li>
                  <li>✓ Negotiated conservative infrastructure investment with family governance</li>
                  <li>✓ Configured family investment committee oversight and reporting</li>
                  <li>✓ Aligned investment with Thompson family values and ESG objectives</li>
                  <li>✓ Enhanced portfolio inflation protection and diversification</li>
                </ul>

                <div className="flex gap-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Generate Family Report
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Schedule Committee Review
                  </button>
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Restart Journey
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Family Office Journey</h1>
              <p className="text-slate-600 mt-2">Margaret Thompson • Thompson Family Office • A$2.5B AUM</p>
            </div>
            <div className="text-right">
              <div className="bloomberg-small-text text-slate-600">Phase 1 Milestone 1.2</div>
              <div className="bloomberg-card-title text-blue-600">Core Investor Journeys</div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex flex-wrap items-center gap-4">
            {journeySteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : step.status === 'active'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {step.status === 'completed' ? '✓' : index + 1}
                </div>
                <div className="ml-3">
                  <div className={` ${
                    step.status === 'active' ? 'text-blue-600' :
                    step.status === 'completed' ? 'text-green-600' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="bloomberg-small-text text-slate-600">{step.description}</div>
                </div>
                {index < journeySteps.length - 1 && (
                  <div className="mx-6 w-8 h-0.5 bg-slate-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
};