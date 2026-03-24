'use client';

/**
 * WREI Core Investor Journeys Hub
 * Phase 1 Milestone 1.2 - Core Investor Journeys
 * Unified interface for three institutional investor journey workflows
 */

import { useState } from 'react';
import { InfrastructureFundJourney } from './InfrastructureFundJourney';
import { ESGFundJourney } from './ESGFundJourney';
import { FamilyOfficeJourney } from './FamilyOfficeJourney';

type JourneyType = 'overview' | 'infrastructure' | 'esg' | 'family_office';

interface InvestorPersona {
  id: JourneyType;
  name: string;
  role: string;
  organization: string;
  aum: string;
  focus: string;
  riskProfile: string;
  timeHorizon: string;
  primaryObjective: string;
  keyBenefits: string[];
  journey: React.ComponentType;
}

export const CoreInvestorJourneys: React.FC = () => {
  const [activeJourney, setActiveJourney] = useState<JourneyType>('overview');

  const investorPersonas: InvestorPersona[] = [
    {
      id: 'infrastructure',
      name: 'Sarah Chen',
      role: 'Chief Investment Officer',
      organization: 'Australian Infrastructure Fund',
      aum: 'A$15.2B',
      focus: 'Infrastructure Assets',
      riskProfile: 'Moderate',
      timeHorizon: '25+ Years',
      primaryObjective: 'Cross-collateral Asset Co token acquisition for enhanced capital efficiency',
      keyBenefits: [
        'A$50M Asset Co token acquisition with cross-collateral strategy',
        '+23% capital efficiency through strategic deployment',
        '+180bps yield enhancement across infrastructure portfolio',
        'Real-time operational data integration',
        'Enhanced portfolio diversification and risk management'
      ],
      journey: InfrastructureFundJourney
    },
    {
      id: 'esg',
      name: 'James Rodriguez',
      role: 'Portfolio Manager',
      organization: 'Sustainable Horizons ESG Fund',
      aum: 'A$8.5B',
      focus: 'ESG-Compliant Assets',
      riskProfile: 'Moderate',
      timeHorizon: '10-15 Years',
      primaryObjective: 'Premium dMRV carbon credits for carbon neutrality and ESG rating enhancement',
      keyBenefits: [
        '30,000 tCO2e premium WREI dMRV verified carbon credits',
        'Carbon neutrality achievement 6 months ahead of schedule',
        'ESG rating upgrade from AA to AAA',
        'Real-time ESG monitoring and automated compliance reporting',
        '+0.9 improvement in UN SDG alignment score'
      ],
      journey: ESGFundJourney
    },
    {
      id: 'family_office',
      name: 'Margaret Thompson',
      role: 'Chief Investment Officer',
      organization: 'Thompson Family Office',
      aum: 'A$2.5B',
      focus: 'Multi-Generational Wealth',
      riskProfile: 'Conservative',
      timeHorizon: '50+ Years',
      primaryObjective: 'Conservative infrastructure allocation with inflation protection and family governance',
      keyBenefits: [
        'A$75M Asset Co token allocation for generational wealth preservation',
        'Inflation-protected infrastructure exposure with 5.8% yield',
        'Multi-generational succession planning framework',
        'Family governance integration and oversight structures',
        'ESG alignment with Thompson family values and stewardship'
      ],
      journey: FamilyOfficeJourney
    }
  ];

  const renderJourneyContent = () => {
    const persona = investorPersonas.find(p => p.id === activeJourney);

    if (activeJourney === 'overview') {
      return (
        <div className="space-y-8">
          {/* Overview Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-bold mb-4">WREI Core Investor Journeys</h1>
              <p className="text-xl text-blue-100 mb-6">
                Experience comprehensive investor workflows tailored to institutional requirements.
                Each journey demonstrates the complete WREI platform capability from portfolio analysis through AI-powered negotiation to final execution.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🏗️ Infrastructure Focus</h3>
                  <p className="text-blue-100">Asset Co tokens, cross-collateral strategies, and capital efficiency optimization</p>
                </div>
                <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🌱 ESG Integration</h3>
                  <p className="text-blue-100">Premium carbon credits, impact measurement, and sustainability reporting</p>
                </div>
                <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">👨‍👩‍👧‍👦 Wealth Preservation</h3>
                  <p className="text-blue-100">Multi-generational planning, family governance, and conservative growth</p>
                </div>
              </div>
            </div>
          </div>

          {/* Journey Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {investorPersonas.map((persona) => (
              <div
                key={persona.id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Card Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{persona.name}</h3>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">{persona.role}</div>
                      <div className="text-lg font-semibold text-blue-600">{persona.aum}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Organization:</span>
                      <span className="font-medium text-slate-800">{persona.organization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Focus:</span>
                      <span className="font-medium text-slate-800">{persona.focus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Risk Profile:</span>
                      <span className="font-medium text-slate-800">{persona.riskProfile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Time Horizon:</span>
                      <span className="font-medium text-slate-800">{persona.timeHorizon}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Objective */}
                <div className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3">🎯 Primary Objective</h4>
                  <p className="text-slate-700 text-sm mb-4">{persona.primaryObjective}</p>

                  <h4 className="font-semibold text-slate-800 mb-3">✨ Key Journey Benefits</h4>
                  <ul className="space-y-2 mb-6">
                    {persona.keyBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start text-sm text-slate-600">
                        <span className="text-green-500 mr-2 mt-0.5">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setActiveJourney(persona.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Start {persona.name}&apos;s Journey →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Technology Integration */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">🚀 Integrated Platform Capabilities</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">AI Negotiation</h3>
                <p className="text-sm text-slate-600">Real-time strategy insights with institutional persona awareness and market context analysis</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Portfolio Analytics</h3>
                <p className="text-sm text-slate-600">Professional data grids with Bloomberg Terminal-style interface and comprehensive metrics</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Asset Tokenization</h3>
                <p className="text-sm text-slate-600">Real asset backing with dMRV verification and institutional-grade settlement infrastructure</p>
              </div>

              <div className="text-center">
                <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Impact Tracking</h3>
                <p className="text-sm text-slate-600">Real-time ESG monitoring with automated compliance reporting and stakeholder updates</p>
              </div>
            </div>
          </div>

          {/* Implementation Status */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">📋 Phase 1 Milestone 1.2 Implementation Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-700">✅ Milestone 1.1 Complete</h4>
                <p className="text-sm text-slate-600 mt-1">AI Negotiation Enhancement with real-time strategy explanations and institutional investor support</p>
                <div className="text-xs text-green-600 mt-2">Status: Production Ready • Test Coverage: 262/262 passing</div>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-blue-700">🚧 Milestone 1.2 Current</h4>
                <p className="text-sm text-slate-600 mt-1">Core Investor Journeys with comprehensive workflow implementation for three institutional personas</p>
                <div className="text-xs text-blue-600 mt-2">Status: Development Complete • Integration: Active</div>
              </div>

              <div className="border-l-4 border-slate-400 pl-4">
                <h4 className="font-semibold text-slate-600">⏳ Milestone 1.3 Planned</h4>
                <p className="text-sm text-slate-600 mt-1">Advanced Analytics and Market Intelligence integration with professional dashboard enhancements</p>
                <div className="text-xs text-slate-500 mt-2">Status: Planning Phase • Timeline: Q3 2026</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (persona) {
      const JourneyComponent = persona.journey;
      return <JourneyComponent />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveJourney('overview')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeJourney === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <span>🏠</span>
                <span>Overview</span>
              </button>

              <div className="h-6 w-px bg-slate-300"></div>

              {investorPersonas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => setActiveJourney(persona.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeJourney === persona.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <span>
                    {persona.id === 'infrastructure' ? '🏗️' :
                     persona.id === 'esg' ? '🌱' : '👨‍👩‍👧‍👦'}
                  </span>
                  <span>{persona.name}</span>
                </button>
              ))}
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-600">Phase 1 Milestone 1.2</div>
              <div className="text-lg font-semibold text-indigo-600">Core Investor Journeys</div>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Content */}
      <div className="py-8">
        {renderJourneyContent()}
      </div>
    </div>
  );
};