'use client';

/**
 * WREI ESG Fund Manager Journey
 * James Rodriguez - ESG Fund Manager
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

interface ESGMetric {
  category: string;
  current: number;
  target: number;
  unit: string;
  impact: 'positive' | 'neutral' | 'negative';
}

interface CarbonCreditPortfolio {
  region: string;
  creditType: string;
  vintage: number;
  quantity: number;
  price: number;
  verification: string;
  impactScore: number;
}

export const ESGFundJourney: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [esgAnalysisComplete, setEsgAnalysisComplete] = useState(false);
  const [impactModelingComplete, setImpactModelingComplete] = useState(false);
  const [negotiationActive, setNegotiationActive] = useState(false);
  const [strategyExplanation, setStrategyExplanation] = useState<NegotiationStrategyExplanation | null>(null);
  const [strategyPanelVisible, setStrategyPanelVisible] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // James Rodriguez's ESG Fund Portfolio Context
  const portfolioContext = createMockPortfolioContext('esg_impact_investor');

  const mockESGMetrics: ESGMetric[] = [
    {
      category: 'Carbon Intensity',
      current: 147.2,
      target: 85.0,
      unit: 'tCO2e/A$M revenue',
      impact: 'negative'
    },
    {
      category: 'ESG Score (MSCI)',
      current: 7.8,
      target: 8.5,
      unit: '/10',
      impact: 'positive'
    },
    {
      category: 'SDG Alignment',
      current: 68,
      target: 85,
      unit: '% portfolio',
      impact: 'positive'
    },
    {
      category: 'Green Revenue',
      current: 42,
      target: 60,
      unit: '% portfolio',
      impact: 'positive'
    }
  ];

  const mockCarbonPortfolio: CarbonCreditPortfolio[] = [
    {
      region: 'Brazil (Amazon)',
      creditType: 'REDD+ Forest Protection',
      vintage: 2024,
      quantity: 125000,
      price: 28.50,
      verification: 'VCS + CCBS',
      impactScore: 9.2
    },
    {
      region: 'Australia (Queensland)',
      creditType: 'Reforestation',
      vintage: 2025,
      quantity: 75000,
      price: 35.20,
      verification: 'Gold Standard',
      impactScore: 8.7
    },
    {
      region: 'Kenya',
      creditType: 'Clean Cookstoves',
      vintage: 2024,
      quantity: 50000,
      price: 22.80,
      verification: 'VCS + SDGs',
      impactScore: 9.5
    }
  ];

  const journeySteps: JourneyStep[] = [
    {
      id: 'esg_analysis',
      title: 'ESG Portfolio Analysis',
      description: 'Comprehensive ESG metrics review and carbon footprint assessment',
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending'
    },
    {
      id: 'impact_modeling',
      title: 'Impact Modeling & Forecasting',
      description: 'Model environmental impact and SDG alignment improvements',
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 'carbon_strategy',
      title: 'Carbon Credit Strategy',
      description: 'Develop high-quality carbon credit acquisition strategy',
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      id: 'wrei_negotiation',
      title: 'WREI Carbon Credit Negotiation',
      description: 'Negotiate premium dMRV-verified carbon credits with AI assistance',
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending'
    },
    {
      id: 'impact_tracking',
      title: 'Impact Tracking Setup',
      description: 'Configure ESG reporting and impact measurement systems',
      status: currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'pending'
    }
  ];

  const handleESGAnalysis = () => {
    setEsgAnalysisComplete(true);
    setTimeout(() => setCurrentStep(1), 1000);
  };

  const handleImpactModeling = () => {
    setImpactModelingComplete(true);
    setTimeout(() => setCurrentStep(2), 1000);
  };

  const handleStartNegotiation = async () => {
    setNegotiationActive(true);
    setCurrentStep(3);
    setStrategyPanelVisible(true);

    // Initialize negotiation with AI explanation
    const initialMessage = {
      role: 'user' as const,
      content: 'I am James Rodriguez, Portfolio Manager at Sustainable Horizons ESG Fund. We manage A$8.5B in ESG-compliant assets with a strong focus on measurable environmental impact. We require 50,000 tonnes of premium dMRV-verified carbon credits to achieve our 2026 carbon neutrality targets and SDG alignment goals.'
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
          persona: 'esg_impact_investor',
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-green-900 mb-4">
                📊 ESG Portfolio Analysis
              </h3>
              <p className="text-green-800 mb-6">
                Comprehensive analysis of your ESG portfolio performance against sustainability targets and environmental impact metrics.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <h4 className=" text-slate-800">ESG Fund AUM</h4>
                  <p className="bloomberg-large-metric text-green-600">A$8.5B</p>
                  <p className="bloomberg-small-text text-slate-600">ESG-Compliant Assets</p>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <h4 className=" text-slate-800">MSCI ESG Rating</h4>
                  <p className="bloomberg-large-metric text-blue-600">AA</p>
                  <p className="bloomberg-small-text text-slate-600">Industry Leading</p>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <h4 className=" text-slate-800">Carbon Intensity</h4>
                  <p className="bloomberg-large-metric text-orange-600">147.2</p>
                  <p className="bloomberg-small-text text-slate-600">tCO2e/A$M revenue</p>
                </div>
              </div>

              {/* ESG Metrics Table */}
              <div className="mb-6">
                <h4 className=" text-slate-800 mb-3">🎯 ESG Performance Metrics</h4>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg border border-green-200">
                    <thead className="bg-green-100">
                      <tr>
                        <th className="px-4 py-3 text-left  text-green-900">Metric</th>
                        <th className="px-4 py-3 text-center  text-green-900">Current</th>
                        <th className="px-4 py-3 text-center  text-green-900">Target</th>
                        <th className="px-4 py-3 text-center  text-green-900">Gap</th>
                        <th className="px-4 py-3 text-center  text-green-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockESGMetrics.map((metric, index) => {
                        const gap = metric.category === 'Carbon Intensity'
                          ? ((metric.current - metric.target) / metric.target * 100).toFixed(1)
                          : ((metric.target - metric.current) / metric.target * 100).toFixed(1);
                        const isOnTrack = metric.category === 'Carbon Intensity'
                          ? metric.current > metric.target
                          : metric.current >= metric.target * 0.8;

                        return (
                          <tr key={index} className="border-t border-green-100">
                            <td className="px-4 py-3 font-medium text-slate-800">{metric.category}</td>
                            <td className="px-4 py-3 text-center text-slate-700">
                              {metric.current} {metric.unit}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-700">
                              {metric.target} {metric.unit}
                            </td>
                            <td className="px-4 py-3 text-center font-medium">
                              <span className={
                                metric.category === 'Carbon Intensity'
                                  ? metric.current > metric.target ? 'text-red-600' : 'text-green-600'
                                  : metric.current >= metric.target * 0.8 ? 'text-green-600' : 'text-orange-600'
                              }>
                                {gap}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full bloomberg-small-text ${
                                isOnTrack
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {isOnTrack ? 'On Track' : 'Needs Improvement'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-white border border-green-200 rounded-lg">
                <h4 className=" text-slate-800 mb-2">🌱 Key Insights</h4>
                <ul className="bloomberg-small-text text-slate-600 space-y-1">
                  <li>• Carbon intensity 73% above target - requires immediate offset strategy</li>
                  <li>• SDG alignment strong but needs 17% improvement to reach targets</li>
                  <li>• ESG score well-positioned for premium carbon credit investments</li>
                  <li>• Green revenue exposure provides foundation for impact-focused growth</li>
                </ul>
              </div>

              <button
                onClick={handleESGAnalysis}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg  transition-colors mt-4"
                disabled={esgAnalysisComplete}
              >
                {esgAnalysisComplete ? '✅ Analysis Complete' : 'Complete ESG Analysis'}
              </button>
            </div>

            <PortfolioManager persona="esg_fund_manager" />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-blue-900 mb-4">
                🔮 Impact Modeling & Forecasting
              </h3>
              <p className="text-blue-800 mb-6">
                Model the environmental impact and SDG alignment improvements from strategic carbon credit investments and portfolio optimisation.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current vs Projected Impact */}
                <div className="bg-white border border-blue-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">📈 Impact Projection (12 months)</h4>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <div>
                        <p className="font-medium text-slate-800">Carbon Neutrality Achievement</p>
                        <p className="bloomberg-small-text text-slate-600">Net Zero + 25% offset buffer</p>
                      </div>
                      <div className="text-right">
                        <p className="bloomberg-large-metric text-green-600">Q3 2026</p>
                        <p className="bloomberg-small-text text-green-700">6 months early</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <div>
                        <p className="font-medium text-slate-800">SDG Impact Score</p>
                        <p className="bloomberg-small-text text-slate-600">UN SDG alignment metric</p>
                      </div>
                      <div className="text-right">
                        <p className="bloomberg-large-metric text-blue-600">8.7/10</p>
                        <p className="bloomberg-small-text text-blue-700">+0.9 improvement</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <div>
                        <p className="font-medium text-slate-800">Portfolio ESG Rating</p>
                        <p className="bloomberg-small-text text-slate-600">MSCI ESG Fund Rating</p>
                      </div>
                      <div className="text-right">
                        <p className="bloomberg-large-metric text-purple-600">AAA</p>
                        <p className="bloomberg-small-text text-purple-700">Rating upgrade</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800">Green Revenue Exposure</p>
                        <p className="bloomberg-small-text text-slate-600">% portfolio in green activities</p>
                      </div>
                      <div className="text-right">
                        <p className="bloomberg-large-metric text-emerald-600">67%</p>
                        <p className="bloomberg-small-text text-emerald-700">+25% increase</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investment Requirements */}
                <div className="bg-white border border-blue-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">💰 Investment Requirements</h4>

                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <h5 className="font-medium text-green-900">Premium Carbon Credits</h5>
                      <p className="bloomberg-small-text text-green-800 mt-1">
                        High-quality dMRV verified credits for immediate offset
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="bloomberg-section-label text-green-600">50,000 tCO2e</span>
                        <span className=" text-green-700">A$7.5M</span>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <h5 className="font-medium text-blue-900">Green Infrastructure Bonds</h5>
                      <p className="bloomberg-small-text text-blue-800 mt-1">
                        ESG-compliant infrastructure for portfolio rebalancing
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="bloomberg-section-label text-blue-600">8% allocation</span>
                        <span className=" text-blue-700">A$680M</span>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                      <h5 className="font-medium text-purple-900">ESG Technology Investments</h5>
                      <p className="bloomberg-small-text text-purple-800 mt-1">
                        Climate tech and sustainability solutions
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="bloomberg-section-label text-purple-600">5% allocation</span>
                        <span className=" text-purple-700">A$425M</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-800">Total Investment Required</span>
                        <span className="bloomberg-metric-value text-slate-800">A$1.11B</span>
                      </div>
                      <p className="bloomberg-small-text text-slate-600 mt-1">13% of current AUM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white border border-blue-200 rounded-lg">
                <h4 className=" text-slate-800 mb-2">🎯 Strategic Priorities</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="text-center">
                    <div className="bloomberg-large-metric text-green-600">1st Priority</div>
                    <div className="bloomberg-small-text font-medium text-slate-800">Carbon Credits</div>
                    <div className="bloomberg-section-label text-slate-600">Immediate impact</div>
                  </div>
                  <div className="text-center">
                    <div className="bloomberg-large-metric text-blue-600">2nd Priority</div>
                    <div className="bloomberg-small-text font-medium text-slate-800">Green Infrastructure</div>
                    <div className="bloomberg-section-label text-slate-600">Long-term growth</div>
                  </div>
                  <div className="text-center">
                    <div className="bloomberg-large-metric text-purple-600">3rd Priority</div>
                    <div className="bloomberg-small-text font-medium text-slate-800">Climate Tech</div>
                    <div className="bloomberg-section-label text-slate-600">Innovation exposure</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleImpactModeling}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg  transition-colors mt-4"
                disabled={impactModelingComplete}
              >
                {impactModelingComplete ? '✅ Modeling Complete' : 'Complete Impact Modeling'}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-purple-900 mb-4">
                🌿 Carbon Credit Strategy Development
              </h3>
              <p className="text-purple-800 mb-6">
                Develop a comprehensive carbon credit acquisition strategy focused on high-quality, verified credits that align with ESG objectives and deliver measurable impact.
              </p>

              {/* Current Carbon Portfolio */}
              <div className="mb-6">
                <h4 className=" text-slate-800 mb-3">📋 Current Carbon Credit Portfolio</h4>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg border border-purple-200">
                    <thead className="bg-purple-100">
                      <tr>
                        <th className="px-4 py-3 text-left  text-purple-900">Region/Project</th>
                        <th className="px-4 py-3 text-left  text-purple-900">Credit Type</th>
                        <th className="px-4 py-3 text-center  text-purple-900">Vintage</th>
                        <th className="px-4 py-3 text-right  text-purple-900">Quantity</th>
                        <th className="px-4 py-3 text-right  text-purple-900">Price</th>
                        <th className="px-4 py-3 text-center  text-purple-900">Impact Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCarbonPortfolio.map((credit, index) => (
                        <tr key={index} className="border-t border-purple-100">
                          <td className="px-4 py-3 font-medium text-slate-800">{credit.region}</td>
                          <td className="px-4 py-3 text-slate-700">{credit.creditType}</td>
                          <td className="px-4 py-3 text-center text-slate-700">{credit.vintage}</td>
                          <td className="px-4 py-3 text-right text-slate-700">
                            {credit.quantity.toLocaleString()} tCO2e
                          </td>
                          <td className="px-4 py-3 text-right  text-slate-700">
                            A${credit.price}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full bloomberg-small-text ${
                              credit.impactScore >= 9 ? 'bg-green-100 text-green-800' :
                              credit.impactScore >= 8.5 ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {credit.impactScore}/10
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strategy Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-purple-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">🔍 WREI vs Traditional Credits</h4>

                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-slate-800">WREI dMRV Credits</h5>
                      <ul className="bloomberg-small-text text-slate-600 mt-1 space-y-1">
                        <li>• Real-time verification and monitoring</li>
                        <li>• Blockchain-based transparency and auditability</li>
                        <li>• Premium quality with institutional-grade reporting</li>
                        <li>• Direct infrastructure project backing</li>
                        <li>• T+0 settlement and liquidity</li>
                      </ul>
                      <div className="bloomberg-section-label text-green-600 mt-2 font-medium">
                        Price Premium: 45-60% • Impact Score: 9.5/10
                      </div>
                    </div>

                    <div className="border-l-4 border-amber-500 pl-4">
                      <h5 className="font-medium text-slate-800">Traditional VCS Credits</h5>
                      <ul className="bloomberg-small-text text-slate-600 mt-1 space-y-1">
                        <li>• Annual verification cycles</li>
                        <li>• Registry-based tracking</li>
                        <li>• Standard market pricing</li>
                        <li>• Variable project quality</li>
                        <li>• T+3 to T+7 settlement</li>
                      </ul>
                      <div className="bloomberg-section-label text-amber-600 mt-2 font-medium">
                        Base Market Price • Impact Score: 6.5-8.5/10
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-purple-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">📊 Strategic Allocation Recommendation</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">WREI dMRV Credits (Premium)</span>
                      <span className=" text-purple-600">30,000 tCO2e</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Traditional High-Quality VCS</span>
                      <span className=" text-blue-600">15,000 tCO2e</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Nature-Based Solutions</span>
                      <span className=" text-green-600">5,000 tCO2e</span>
                    </div>
                    <div className="flex justify-between items-center ">
                      <span className="text-slate-800">Total Acquisition Target</span>
                      <span className="text-slate-800">50,000 tCO2e</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
                    <h5 className="font-medium text-purple-900">Portfolio Benefits</h5>
                    <ul className="bloomberg-small-text text-purple-800 mt-1 space-y-1">
                      <li>• Immediate carbon neutrality achievement</li>
                      <li>• Enhanced ESG reporting and transparency</li>
                      <li>• Premium quality supports rating upgrades</li>
                      <li>• Diversified risk across verification standards</li>
                      <li>• Strong alignment with UN SDGs</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white border border-purple-200 rounded-lg">
                <h4 className=" text-slate-800 mb-2">🎯 Next Step: WREI Negotiation</h4>
                <p className="text-slate-700 mb-3">
                  Ready to negotiate the acquisition of 30,000 tonnes of premium WREI dMRV-verified carbon credits.
                  Our AI negotiation system will provide ESG-focused strategy insights.
                </p>
                <div className="bloomberg-small-text text-slate-600">
                  <strong>Target Investment:</strong> A$4.5M (30,000 tCO2e @ A$150/tonne) •
                  <strong>Premium Justification:</strong> dMRV verification and real-time monitoring •
                  <strong>Timeline:</strong> Q2 2026 delivery
                </div>
              </div>

              <button
                onClick={handleStartNegotiation}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg  transition-colors mt-4"
              >
                Begin WREI Carbon Credit Negotiation
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-indigo-900 mb-4">
                🤖 WREI Carbon Credit Negotiation
              </h3>
              <p className="text-indigo-800 mb-4">
                Negotiate premium dMRV-verified carbon credits with AI-powered strategy insights tailored to ESG fund requirements and impact objectives.
              </p>

              <div className="bg-white border border-indigo-200 rounded-lg p-4 mb-4">
                <h4 className=" text-slate-800 mb-2">💼 Negotiation Context</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bloomberg-small-text">
                  <div>
                    <span className="text-slate-600">Fund Type:</span>
                    <p className="font-medium">ESG Impact Fund</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Target Volume:</span>
                    <p className="font-medium">30,000 tCO2e</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Credit Type:</span>
                    <p className="font-medium">dMRV Premium</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Budget Range:</span>
                    <p className="font-medium">A$4.5M target</p>
                  </div>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="bg-white border border-indigo-200 rounded-lg">
                <div className="border-b border-indigo-200 p-4">
                  <h4 className=" text-slate-800">💬 Negotiation Chat</h4>
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
                            {message.role === 'user' ? 'James Rodriguez (You)' : 'WREI AI Agent'}
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
                      placeholder="Type your negotiation message..."
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-green-900 mb-4">
                📊 ESG Impact Tracking Setup
              </h3>
              <p className="text-green-800 mb-6">
                Configure comprehensive ESG reporting and impact measurement systems to track progress against sustainability targets and demonstrate portfolio impact.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Real-time ESG Dashboard */}
                <div className="bg-white border border-green-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">📈 Real-time ESG Monitoring</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
                      <span className="font-medium text-slate-800">Carbon Footprint Tracking</span>
                      <span className="text-green-600 ">Active ✅</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded">
                      <span className="font-medium text-slate-800">ESG Score Monitoring</span>
                      <span className="text-blue-600 ">Active ✅</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-purple-50 border border-purple-200 rounded">
                      <span className="font-medium text-slate-800">SDG Impact Measurement</span>
                      <span className="text-purple-600 ">Active ✅</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-200 rounded">
                      <span className="font-medium text-slate-800">Regulatory Compliance</span>
                      <span className="text-amber-600 ">Active ✅</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded">
                    <h5 className="font-medium text-slate-800">Integration Status</h5>
                    <ul className="bloomberg-small-text text-slate-600 mt-1 space-y-1">
                      <li>✓ WREI dMRV verification system connected</li>
                      <li>✓ MSCI ESG rating feed integrated</li>
                      <li>✓ UN SDG impact scoring automated</li>
                      <li>✓ TCFD reporting framework configured</li>
                      <li>✓ Real-time portfolio monitoring active</li>
                    </ul>
                  </div>
                </div>

                {/* Reporting Capabilities */}
                <div className="bg-white border border-green-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">📋 Automated Reporting</h4>

                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-slate-800">Monthly ESG Reports</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Comprehensive portfolio ESG performance and impact metrics
                      </p>
                      <div className="bloomberg-section-label text-green-600 mt-2">Next report: April 1, 2026</div>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-slate-800">Quarterly Impact Assessment</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Detailed analysis of environmental and social impact progress
                      </p>
                      <div className="bloomberg-section-label text-blue-600 mt-2">Next report: June 30, 2026</div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-medium text-slate-800">Annual Sustainability Report</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Comprehensive sustainability disclosure and target progress
                      </p>
                      <div className="bloomberg-section-label text-purple-600 mt-2">Next report: December 31, 2026</div>
                    </div>

                    <div className="border-l-4 border-amber-500 pl-4">
                      <h5 className="font-medium text-slate-800">Regulatory Submissions</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Automated compliance reporting for TCFD, SFDR, and local requirements
                      </p>
                      <div className="bloomberg-section-label text-amber-600 mt-2">Ongoing automated submission</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white border border-green-200 rounded-lg">
                <h4 className=" text-slate-800 mb-2">✅ Journey Complete</h4>
                <p className="text-slate-700 mb-3">
                  Your ESG fund journey is now complete. You have successfully achieved comprehensive carbon credit portfolio optimisation with impact tracking:
                </p>
                <ul className="bloomberg-small-text text-slate-600 space-y-1 mb-4">
                  <li>✓ Completed comprehensive ESG portfolio analysis and gap identification</li>
                  <li>✓ Modeled environmental impact and SDG alignment improvements</li>
                  <li>✓ Developed strategic carbon credit acquisition plan</li>
                  <li>✓ Negotiated 30,000 tCO2e premium WREI dMRV credits</li>
                  <li>✓ Configured real-time ESG monitoring and automated reporting</li>
                  <li>✓ Achieved carbon neutrality 6 months ahead of schedule</li>
                  <li>✓ Enhanced portfolio ESG rating from AA to AAA</li>
                </ul>

                <div className="flex gap-3">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Download Impact Report
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Schedule ESG Review
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
              <h1 className="bloomberg-page-heading text-slate-800">ESG Fund Manager Journey</h1>
              <p className="text-slate-600 mt-2">James Rodriguez • Sustainable Horizons ESG Fund • A$8.5B AUM</p>
            </div>
            <div className="text-right">
              <div className="bloomberg-small-text text-slate-600">Phase 1 Milestone 1.2</div>
              <div className="bloomberg-card-title text-green-600">Core Investor Journeys</div>
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