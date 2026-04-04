'use client';

/**
 * WREI Infrastructure Fund Manager Journey
 * Sarah Chen - Infrastructure Fund Manager
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
  component?: React.ReactNode;
}

interface AssetAnalysis {
  assetClass: string;
  currentValue: number;
  tokenizationPotential: number;
  liquidityScore: number;
  riskRating: string;
  yieldProjection: number;
}

export const InfrastructureFundJourney: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [portfolioImported, setPortfolioImported] = useState(false);
  const [assetAnalysisComplete, setAssetAnalysisComplete] = useState(false);
  const [negotiationActive, setNegotiationActive] = useState(false);
  const [strategyExplanation, setStrategyExplanation] = useState<NegotiationStrategyExplanation | null>(null);
  const [strategyPanelVisible, setStrategyPanelVisible] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sarah Chen's Infrastructure Fund Portfolio Context
  const portfolioContext = createMockPortfolioContext('esg_impact_investor'); // Using ESG investor as base for infrastructure focus

  const mockAssetAnalysis: AssetAnalysis[] = [
    {
      assetClass: 'Water Infrastructure',
      currentValue: 125000000, // A$125M
      tokenizationPotential: 95000000, // A$95M (76% eligible)
      liquidityScore: 7.8,
      riskRating: 'Low-Medium',
      yieldProjection: 6.2
    },
    {
      assetClass: 'Renewable Energy',
      currentValue: 180000000, // A$180M
      tokenizationPotential: 144000000, // A$144M (80% eligible)
      liquidityScore: 8.5,
      riskRating: 'Medium',
      yieldProjection: 8.4
    },
    {
      assetClass: 'Transport Infrastructure',
      currentValue: 220000000, // A$220M
      tokenizationPotential: 154000000, // A$154M (70% eligible)
      liquidityScore: 6.9,
      riskRating: 'Low',
      yieldProjection: 5.8
    }
  ];

  const journeySteps: JourneyStep[] = [
    {
      id: 'portfolio_import',
      title: 'Portfolio Import & Analysis',
      description: 'Import current infrastructure holdings and generate tokenization analysis',
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending'
    },
    {
      id: 'asset_analysis',
      title: 'Asset Tokenization Assessment',
      description: 'Evaluate infrastructure assets for WREI Asset Co token potential',
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 'tokenization_demo',
      title: 'Tokenization Demonstration',
      description: 'Preview Asset Co token structure and cross-collateral opportunities',
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      id: 'ai_negotiation',
      title: 'AI-Powered Negotiation',
      description: 'Negotiate Asset Co token acquisition with real-time AI strategy insights',
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending'
    },
    {
      id: 'cross_collateral',
      title: 'Cross-Collateral Setup',
      description: 'Configure cross-collateral strategies for enhanced portfolio efficiency',
      status: currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'pending'
    }
  ];

  const handlePortfolioImport = () => {
    setPortfolioImported(true);
    setTimeout(() => setCurrentStep(1), 1000);
  };

  const handleAssetAnalysis = () => {
    setAssetAnalysisComplete(true);
    setTimeout(() => setCurrentStep(2), 1000);
  };

  const handleStartNegotiation = async () => {
    setNegotiationActive(true);
    setCurrentStep(3);
    setStrategyPanelVisible(true);

    // Initialize negotiation with AI explanation
    const initialMessage = {
      role: 'user' as const,
      content: 'I am Sarah Chen, CIO at Australian Infrastructure Fund. We manage A$15B in infrastructure assets and are interested in Asset Co tokens for our water infrastructure holdings. We are looking to acquire A$50M in Asset Co tokens with cross-collateral opportunities.'
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
          persona: 'esg_impact_investor', // Using ESG as closest match for infrastructure focus
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
                📊 Portfolio Import & Analysis
              </h3>
              <p className="text-blue-800 mb-6">
                Import your current infrastructure portfolio to identify tokenization opportunities with WREI Asset Co tokens.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className=" text-slate-800">Current AUM</h4>
                  <p className="bloomberg-large-metric text-blue-600">A$15.2B</p>
                  <p className="bloomberg-small-text text-slate-600">Infrastructure Assets</p>
                </div>
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className=" text-slate-800">Tokenizable Assets</h4>
                  <p className="bloomberg-large-metric text-green-600">A$11.8B</p>
                  <p className="bloomberg-small-text text-slate-600">77% of Portfolio</p>
                </div>
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className=" text-slate-800">Target Allocation</h4>
                  <p className="bloomberg-large-metric text-purple-600">A$750M</p>
                  <p className="bloomberg-small-text text-slate-600">5% Asset Co Tokens</p>
                </div>
              </div>

              <button
                onClick={handlePortfolioImport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg  transition-colors"
                disabled={portfolioImported}
              >
                {portfolioImported ? '✅ Portfolio Imported' : 'Import Portfolio Data'}
              </button>
            </div>

            <PortfolioManager persona="infrastructure_fund" />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-green-900 mb-4">
                🏗️ Asset Tokenization Assessment
              </h3>
              <p className="text-green-800 mb-6">
                Detailed analysis of your infrastructure assets for WREI Asset Co tokenization potential and yield optimization.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg border border-green-200">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-4 py-3 text-left  text-green-900">Asset Class</th>
                      <th className="px-4 py-3 text-right  text-green-900">Current Value</th>
                      <th className="px-4 py-3 text-right  text-green-900">Tokenization Potential</th>
                      <th className="px-4 py-3 text-center  text-green-900">Liquidity Score</th>
                      <th className="px-4 py-3 text-center  text-green-900">Risk Rating</th>
                      <th className="px-4 py-3 text-right  text-green-900">Yield Projection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAssetAnalysis.map((asset, index) => (
                      <tr key={index} className="border-t border-green-100">
                        <td className="px-4 py-3 font-medium text-slate-800">{asset.assetClass}</td>
                        <td className="px-4 py-3 text-right text-slate-700">
                          A${(asset.currentValue / 1000000).toFixed(0)}M
                        </td>
                        <td className="px-4 py-3 text-right  text-green-700">
                          A${(asset.tokenizationPotential / 1000000).toFixed(0)}M
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 bloomberg-small-text">
                            {asset.liquidityScore}/10
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full bloomberg-small-text ${
                            asset.riskRating === 'Low' ? 'bg-green-100 text-green-800' :
                            asset.riskRating === 'Low-Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {asset.riskRating}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right  text-green-700">
                          {asset.yieldProjection}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-white border border-green-200 rounded-lg">
                <h4 className=" text-slate-800 mb-2">💡 Tokenization Opportunity Summary</h4>
                <p className="text-slate-700 mb-3">
                  Your infrastructure portfolio shows strong tokenization potential with A$393M eligible for Asset Co token conversion.
                  Water infrastructure assets offer the highest risk-adjusted returns with established revenue streams.
                </p>
                <ul className="bloomberg-small-text text-slate-600 space-y-1">
                  <li>• Cross-collateral opportunities with existing renewable energy portfolio</li>
                  <li>• Enhanced liquidity through WREI tokenization while maintaining operational control</li>
                  <li>• Diversification benefits across water infrastructure and transport sectors</li>
                  <li>• Potential 12-18% yield enhancement through strategic Asset Co allocation</li>
                </ul>
              </div>

              <button
                onClick={handleAssetAnalysis}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg  transition-colors mt-4"
                disabled={assetAnalysisComplete}
              >
                {assetAnalysisComplete ? '✅ Analysis Complete' : 'Complete Asset Analysis'}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-purple-900 mb-4">
                🔗 Asset Co Tokenization Demonstration
              </h3>
              <p className="text-purple-800 mb-6">
                Preview how your water infrastructure assets would be structured as WREI Asset Co tokens with cross-collateral capabilities.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Token Structure */}
                <div className="bg-white border border-purple-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">🏗️ Token Structure: Murray River Water Treatment</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Asset Value</span>
                      <span className="">A$125,000,000</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Tokenized Portion</span>
                      <span className=" text-purple-600">A$95,000,000 (76%)</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Token Supply</span>
                      <span className="">950,000 ACO-WTR tokens</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Token Price</span>
                      <span className="">A$100/token</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Annual Yield</span>
                      <span className=" text-green-600">6.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Revenue Source</span>
                      <span className="">Water treatment contracts</span>
                    </div>
                  </div>
                </div>

                {/* Cross-Collateral Benefits */}
                <div className="bg-white border border-purple-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">⚡ Cross-Collateral Opportunities</h4>

                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <h5 className="font-medium text-blue-900">Renewable Energy Synergy</h5>
                      <p className="bloomberg-small-text text-blue-800 mt-1">
                        Use Asset Co tokens as collateral for renewable energy expansion projects
                      </p>
                      <div className="bloomberg-section-label text-blue-600 mt-2">
                        LTV Ratio: 75% • Cost of Capital: 4.8%
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <h5 className="font-medium text-green-900">Portfolio Efficiency</h5>
                      <p className="bloomberg-small-text text-green-800 mt-1">
                        Increase capital deployment while maintaining infrastructure exposure
                      </p>
                      <div className="bloomberg-section-label text-green-600 mt-2">
                        Capital Efficiency: +23% • Risk-Adjusted Return: +15%
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                      <h5 className="font-medium text-amber-900">Liquidity Enhancement</h5>
                      <p className="bloomberg-small-text text-amber-800 mt-1">
                        Access to secondary markets while retaining operational control
                      </p>
                      <div className="bloomberg-section-label text-amber-600 mt-2">
                        Liquidity Premium: 180bps • Settlement: T+0
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white border border-purple-200 rounded-lg">
                <h4 className=" text-slate-800 mb-2">📋 Next Steps: Asset Co Token Acquisition</h4>
                <p className="text-slate-700 mb-3">
                  Ready to proceed with Asset Co token negotiation? Our AI-powered negotiation system will provide
                  real-time strategy insights tailored to infrastructure fund requirements.
                </p>
                <div className="bloomberg-small-text text-slate-600">
                  <strong>Target Acquisition:</strong> A$50M Asset Co tokens (500,000 tokens) •
                  <strong>Strategy:</strong> Cross-collateral optimization •
                  <strong>Timeline:</strong> Q2 2026 deployment
                </div>
              </div>

              <button
                onClick={handleStartNegotiation}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg  transition-colors mt-4"
              >
                Begin AI Negotiation Process
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="bloomberg-metric-value text-indigo-900 mb-4">
                🤖 AI-Powered Asset Co Token Negotiation
              </h3>
              <p className="text-indigo-800 mb-4">
                Negotiate Asset Co token acquisition with real-time AI strategy insights. The AI understands your infrastructure fund profile and provides strategic guidance.
              </p>

              <div className="bg-white border border-indigo-200 rounded-lg p-4 mb-4">
                <h4 className=" text-slate-800 mb-2">💼 Negotiation Context</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bloomberg-small-text">
                  <div>
                    <span className="text-slate-600">Fund Type:</span>
                    <p className="font-medium">Infrastructure Fund</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Target Investment:</span>
                    <p className="font-medium">A$50M Asset Co</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Strategy Focus:</span>
                    <p className="font-medium">Cross-Collateral</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Timeline:</span>
                    <p className="font-medium">Q2 2026</p>
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
                            {message.role === 'user' ? 'Sarah Chen (You)' : 'WREI AI Agent'}
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
                🔗 Cross-Collateral Strategy Configuration
              </h3>
              <p className="text-green-800 mb-6">
                Configure cross-collateral strategies to maximize capital efficiency across your infrastructure portfolio.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Collateral Configuration */}
                <div className="bg-white border border-green-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">⚙️ Collateral Configuration</h4>

                  <div className="space-y-4">
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Asset Co Tokens (Primary)</span>
                        <span className="text-green-600 ">A$50M</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <div className="bloomberg-small-text text-slate-600 mt-1">LTV: 75% • Available: A$37.5M</div>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Water Infrastructure (Backup)</span>
                        <span className="text-blue-600 ">A$125M</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <div className="bloomberg-small-text text-slate-600 mt-1">LTV: 60% • Available: A$75M</div>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Total Collateral Capacity</span>
                        <span className="text-purple-600 ">A$112.5M</span>
                      </div>
                      <div className="bloomberg-small-text text-slate-600">Combined cross-collateral borrowing power</div>
                    </div>
                  </div>
                </div>

                {/* Strategy Benefits */}
                <div className="bg-white border border-green-200 rounded-lg p-5">
                  <h4 className=" text-slate-800 mb-4">📈 Strategy Benefits</h4>

                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium text-slate-800">Capital Efficiency</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Increase deployment capacity by 23% while maintaining infrastructure exposure
                      </p>
                      <div className="bloomberg-section-label text-green-600 mt-2 font-medium">+A$25M additional capacity</div>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-slate-800">Risk Management</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Diversified collateral base reduces concentration risk
                      </p>
                      <div className="bloomberg-section-label text-blue-600 mt-2 font-medium">Risk reduction: 18%</div>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-medium text-slate-800">Yield Enhancement</h5>
                      <p className="bloomberg-small-text text-slate-600 mt-1">
                        Cross-collateral strategies unlock additional yield opportunities
                      </p>
                      <div className="bloomberg-section-label text-purple-600 mt-2 font-medium">Portfolio yield: +180bps</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white border border-green-200 rounded-lg">
                <h4 className=" text-slate-800 mb-2">✅ Journey Complete</h4>
                <p className="text-slate-700 mb-3">
                  Your infrastructure fund journey is now complete. You have successfully:
                </p>
                <ul className="bloomberg-small-text text-slate-600 space-y-1 mb-4">
                  <li>✓ Imported and analysed A$15.2B infrastructure portfolio</li>
                  <li>✓ Identified A$393M in tokenization opportunities</li>
                  <li>✓ Acquired A$50M in Asset Co tokens through AI negotiation</li>
                  <li>✓ Configured cross-collateral strategies for enhanced efficiency</li>
                  <li>✓ Achieved +23% capital efficiency and +180bps yield enhancement</li>
                </ul>

                <div className="flex gap-3">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Download Portfolio Report
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Schedule Follow-up Review
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
              <h1 className="bloomberg-page-heading text-slate-800">Infrastructure Fund Manager Journey</h1>
              <p className="text-slate-600 mt-2">Sarah Chen • Australian Infrastructure Fund • A$15.2B AUM</p>
            </div>
            <div className="text-right">
              <div className="bloomberg-small-text text-slate-600">Phase 1 Milestone 1.2</div>
              <div className="bloomberg-card-title text-indigo-600">Core Investor Journeys</div>
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