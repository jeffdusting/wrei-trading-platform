'use client';

/**
 * WREI Negotiation Strategy Panel
 * Real-time AI strategy explanations for institutional investors
 * Phase 1 Milestone 1.1 - AI Negotiation Enhancement
 */

import { useState } from 'react';
import { NegotiationStrategyExplanation } from '@/lib/negotiation-strategy';

interface NegotiationStrategyPanelProps {
  explanation: NegotiationStrategyExplanation | null;
  isVisible: boolean;
  onToggle: () => void;
}

export const NegotiationStrategyPanel: React.FC<NegotiationStrategyPanelProps> = ({
  explanation,
  isVisible,
  onToggle
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('rationale');

  if (!explanation) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="bloomberg-card-title text-slate-800">AI Strategy Analysis</h3>
          <button
            onClick={onToggle}
            className="text-slate-500 hover:text-slate-700 transition-colors"
            title="Toggle strategy panel"
          >
            {isVisible ? '📊' : '📈'}
          </button>
        </div>
        <p className="text-slate-600 mt-2">No active negotiation - start a negotiation to see AI strategy insights</p>
      </div>
    );
  }

  const sections = [
    {
      key: 'rationale',
      title: 'AI Reasoning',
      content: explanation.rationale,
      icon: '🧠',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      key: 'market',
      title: 'Market Context',
      content: explanation.marketContext,
      icon: '📊',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      key: 'risk',
      title: 'Risk Assessment',
      content: explanation.riskAssessment,
      icon: '⚠️',
      color: 'bg-amber-50 border-amber-200 text-amber-800'
    },
    {
      key: 'alternatives',
      title: 'Alternative Options',
      content: explanation.alternativeOptions.join(' • '),
      icon: '🔄',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      key: 'outcome',
      title: 'Expected Outcome',
      content: explanation.expectedOutcome,
      icon: '🎯',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    }
  ];

  const confidenceColors = {
    high: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-red-100 text-red-800 border-red-300'
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
          title="Show AI strategy insights"
        >
          <span>🧠</span>
          <span>AI Strategy</span>
          <div className={`px-2 py-1 rounded-full bloomberg-section-label ${confidenceColors[explanation.confidenceLevel]}`}>
            {explanation.confidenceLevel.toUpperCase()}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-slate-100 border-b border-slate-300 px-4 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="bloomberg-card-title text-slate-800">AI Negotiation Strategy</h3>
            <div className={`px-3 py-1 rounded-full bloomberg-small-text font-medium border ${confidenceColors[explanation.confidenceLevel]}`}>
              {explanation.confidenceLevel.toUpperCase()} CONFIDENCE
            </div>
          </div>
          <button
            onClick={onToggle}
            className="text-slate-500 hover:text-slate-700 transition-colors bloomberg-metric-value"
            title="Hide strategy panel"
          >
            ✕
          </button>
        </div>

        {/* Current Decision */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 bloomberg-card-title">🎯</span>
            <div>
              <p className=" text-blue-800">Current AI Decision:</p>
              <p className="text-blue-700">{explanation.decision}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Sections */}
      <div className="p-4 space-y-3">
        {sections.map((section) => (
          <div key={section.key} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSection(
                expandedSection === section.key ? null : section.key
              )}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="bloomberg-card-title">{section.icon}</span>
                <span className=" text-slate-800">{section.title}</span>
              </div>
              <span className="text-slate-500 bloomberg-metric-value">
                {expandedSection === section.key ? '▲' : '▼'}
              </span>
            </button>

            {expandedSection === section.key && (
              <div className={`p-4 border-t border-slate-200 ${section.color} bg-opacity-30`}>
                <p className="text-slate-700 leading-relaxed">{section.content}</p>
              </div>
            )}
          </div>
        ))}

        {/* Institutional Factors */}
        {explanation.institutionalFactors && explanation.institutionalFactors.length > 0 && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSection(
                expandedSection === 'institutional' ? null : 'institutional'
              )}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="bloomberg-card-title">🏛️</span>
                <span className=" text-slate-800">Institutional Factors</span>
              </div>
              <span className="text-slate-500 bloomberg-metric-value">
                {expandedSection === 'institutional' ? '▲' : '▼'}
              </span>
            </button>

            {expandedSection === 'institutional' && (
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <ul className="space-y-2">
                  {explanation.institutionalFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-slate-400 mt-1">•</span>
                      <span className="text-slate-700">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 rounded-b-lg">
        <p className="bloomberg-section-label text-slate-600">
          💡 <strong>Pro Tip:</strong> These insights help you understand the AI&apos;s negotiation approach and can inform your response strategy.
          The AI considers market conditions, your investor profile, and institutional requirements when making decisions.
        </p>
      </div>
    </div>
  );
};

export default NegotiationStrategyPanel;