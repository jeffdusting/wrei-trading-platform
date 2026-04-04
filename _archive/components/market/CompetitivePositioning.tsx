/**
 * Competitive Positioning Component
 *
 * Interactive visualization of WREI's competitive position in the carbon credit
 * and tokenized asset marketplace. Provides strategic insights and market analysis.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement D1: Competitive Positioning Visualisation
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  analyzeCompetitivePosition,
  generateStrategicRecommendations,
  calculateMarketOpportunity,
  benchmarkPerformance,
  WREI_PROFILE,
  COMPETITOR_PROFILES,
  type PositioningDimension,
  type CompetitorProfile
} from '@/lib/competitive-analysis';
import type { InvestorClassification } from '@/lib/types';

interface CompetitivePositioningProps {
  /** Target investor segment for strategic analysis */
  targetSegment?: InvestorClassification;

  /** Whether to show detailed competitor information */
  showDetailedView?: boolean;

  /** Callback when user selects a competitor for detailed analysis */
  onCompetitorSelect?: (competitor: CompetitorProfile) => void;
}

type ViewMode = 'matrix' | 'dimension' | 'recommendations' | 'benchmarks';

const DIMENSION_LABELS: Record<PositioningDimension, { label: string; description: string }> = {
  price: {
    label: 'Price Competitiveness',
    description: 'Cost-effectiveness and pricing strategy'
  },
  verification_quality: {
    label: 'Verification Quality',
    description: 'Accuracy and comprehensiveness of asset verification'
  },
  liquidity: {
    label: 'Market Liquidity',
    description: 'Availability of buyers and sellers'
  },
  transaction_speed: {
    label: 'Settlement Speed',
    description: 'Time from trade execution to settlement'
  },
  regulatory_compliance: {
    label: 'Regulatory Compliance',
    description: 'Adherence to financial and environmental regulations'
  },
  market_coverage: {
    label: 'Market Coverage',
    description: 'Geographic and asset class coverage'
  },
  technology_innovation: {
    label: 'Technology Innovation',
    description: 'Advanced features and technical capabilities'
  },
  institutional_focus: {
    label: 'Institutional Focus',
    description: 'Specialization in institutional client needs'
  }
};

const CATEGORY_COLORS = {
  traditional_exchange: 'bg-slate-500',
  digital_marketplace: 'bg-blue-500',
  blockchain_native: 'bg-green-500',
  compliance_focused: 'bg-purple-500',
  wrei: 'bg-sky-500'
};

export default function CompetitivePositioning({
  targetSegment = 'wholesale',
  showDetailedView = false,
  onCompetitorSelect
}: CompetitivePositioningProps) {
  const [selectedView, setSelectedView] = useState<ViewMode>('matrix');
  const [selectedDimension, setSelectedDimension] = useState<PositioningDimension>('verification_quality');
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorProfile | null>(null);

  // Competitive analysis data
  const dimensionAnalysis = useMemo(() =>
    analyzeCompetitivePosition(selectedDimension, true),
    [selectedDimension]
  );

  const strategicRecommendations = useMemo(() =>
    generateStrategicRecommendations(targetSegment),
    [targetSegment]
  );

  const marketOpportunity = useMemo(() =>
    calculateMarketOpportunity(),
    []
  );

  const performanceBenchmarks = useMemo(() => ({
    volume: benchmarkPerformance('volume'),
    transaction_size: benchmarkPerformance('transaction_size'),
    user_growth: benchmarkPerformance('user_growth'),
    institutional_penetration: benchmarkPerformance('institutional_penetration')
  }), []);

  const handleCompetitorClick = (competitor: CompetitorProfile) => {
    setSelectedCompetitor(competitor);
    onCompetitorSelect?.(competitor);
  };

  const renderCompetitiveMatrix = () => {
    const dimensions: PositioningDimension[] = Object.keys(DIMENSION_LABELS) as PositioningDimension[];
    const allProfiles = [WREI_PROFILE, ...COMPETITOR_PROFILES];

    return (
      <div className="space-y-6">
        {/* Matrix Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Competitive Positioning Matrix</h3>

          {/* Dimension Headers */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-9 gap-2 mb-4">
                <div className="font-medium bloomberg-small-text text-slate-700">Competitor</div>
                {dimensions.map(dim => (
                  <div key={dim} className="text-center">
                    <div className="font-medium bloomberg-section-label text-slate-700 mb-1">
                      {DIMENSION_LABELS[dim].label.split(' ')[0]}
                    </div>
                    <div className="bloomberg-section-label text-slate-500">
                      {DIMENSION_LABELS[dim].label.split(' ').slice(1).join(' ')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Competitor Rows */}
              {allProfiles.map(profile => (
                <div
                  key={profile.id}
                  className={`grid grid-cols-9 gap-2 py-3 rounded-lg border transition-all cursor-pointer hover:bg-slate-50 ${
                    profile.id === 'wrei' ? 'bg-sky-50 border-sky-200' : 'border-slate-100'
                  }`}
                  onClick={() => handleCompetitorClick(profile)}
                >
                  {/* Competitor Name */}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        profile.id === 'wrei' ? CATEGORY_COLORS.wrei : CATEGORY_COLORS[profile.category]
                      }`}
                    ></div>
                    <div>
                      <div className="font-medium bloomberg-small-text text-slate-900">{profile.name}</div>
                      <div className="bloomberg-section-label text-slate-500">{profile.marketShare.toFixed(1)}% share</div>
                    </div>
                  </div>

                  {/* Dimension Scores */}
                  {dimensions.map(dim => (
                    <div key={dim} className="text-center">
                      <div className="relative h-8 w-8 mx-auto mb-1">
                        <svg className="w-8 h-8 transform -rotate-90">
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-slate-200"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 12}`}
                            strokeDashoffset={`${2 * Math.PI * 12 * (1 - profile.positioning[dim] / 100)}`}
                            className={profile.positioning[dim] >= 80 ? 'text-green-500' :
                                     profile.positioning[dim] >= 60 ? 'text-amber-500' : 'text-red-500'}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bloomberg-section-label font-medium">{profile.positioning[dim]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDimensionAnalysis = () => {
    return (
      <div className="space-y-6">
        {/* Dimension Selector */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Detailed Dimension Analysis</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {Object.entries(DIMENSION_LABELS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setSelectedDimension(key as PositioningDimension)}
                className={`p-3 rounded-lg border bloomberg-small-text font-medium transition-all ${
                  selectedDimension === key
                    ? 'bg-sky-100 border-sky-300 text-sky-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Analysis Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competitive Ranking */}
            <div>
              <h4 className=" text-slate-900 mb-3">Market Ranking</h4>
              <div className="space-y-3">
                {dimensionAnalysis.competitors.slice(0, 5).map((competitor, index) => (
                  <div
                    key={competitor.profile.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      competitor.profile.id === 'wrei' ? 'bg-sky-50 border border-sky-200' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 bloomberg-section-label">
                        {competitor.rank}
                      </div>
                      <div>
                        <div className="font-medium bloomberg-small-text">{competitor.profile.name}</div>
                        <div className="bloomberg-section-label text-slate-500">{competitor.marketShare.toFixed(1)}% market share</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className=" bloomberg-card-title">{competitor.score}</div>
                      <div className="bloomberg-section-label text-slate-500">score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WREI Performance */}
            <div>
              <h4 className=" text-slate-900 mb-3">WREI Performance</h4>
              <div className="space-y-4">
                <div className="bg-sky-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bloomberg-small-text font-medium text-slate-700">Current Score</span>
                    <span className="bloomberg-large-metric text-sky-600">{dimensionAnalysis.wreiBenchmark.score}</span>
                  </div>
                  <div className="bloomberg-section-label text-slate-600">
                    Rank #{dimensionAnalysis.wreiBenchmark.rank} of {dimensionAnalysis.competitors.length}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="bloomberg-card-title text-slate-900">
                      {dimensionAnalysis.wreiBenchmark.strengthVsAverage > 0 ? '+' : ''}
                      {dimensionAnalysis.wreiBenchmark.strengthVsAverage.toFixed(1)}%
                    </div>
                    <div className="bloomberg-section-label text-slate-600">vs Average</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="bloomberg-card-title text-slate-900">
                      {dimensionAnalysis.wreiBenchmark.topCompetitorGap > 0 ? '+' : ''}
                      {dimensionAnalysis.wreiBenchmark.topCompetitorGap}
                    </div>
                    <div className="bloomberg-section-label text-slate-600">vs Leader</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">
            Strategic Recommendations for {targetSegment.charAt(0).toUpperCase() + targetSegment.slice(1)} Segment
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Opportunities */}
            <div>
              <h4 className=" text-green-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Key Opportunities
              </h4>
              <ul className="space-y-2">
                {strategicRecommendations.keyOpportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start space-x-2 bloomberg-small-text">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Competitive Threats */}
            <div>
              <h4 className=" text-red-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Competitive Threats
              </h4>
              <ul className="space-y-2">
                {strategicRecommendations.competitiveThreats.map((threat, index) => (
                  <li key={index} className="flex items-start space-x-2 bloomberg-small-text">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                    <span>{threat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Moves */}
            <div>
              <h4 className=" text-blue-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Strategic Moves
              </h4>
              <ul className="space-y-2">
                {strategicRecommendations.strategicMoves.map((move, index) => (
                  <li key={index} className="flex items-start space-x-2 bloomberg-small-text">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span>{move}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Positioning Advice */}
            <div>
              <h4 className=" text-purple-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Positioning Advice
              </h4>
              <ul className="space-y-2">
                {strategicRecommendations.positioningAdvice.map((advice, index) => (
                  <li key={index} className="flex items-start space-x-2 bloomberg-small-text">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Market Opportunity */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Market Opportunity Analysis</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="bloomberg-large-metric text-slate-900">
                ${marketOpportunity.totalMarketSize.toLocaleString()}M
              </div>
              <div className="bloomberg-small-text text-slate-600">Total Market Size</div>
            </div>
            <div className="text-center p-4 bg-sky-50 rounded-lg">
              <div className="bloomberg-large-metric text-sky-600">
                ${marketOpportunity.addressableMarket.toLocaleString()}M
              </div>
              <div className="bloomberg-small-text text-slate-600">Addressable Market</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="bloomberg-large-metric text-green-600">
                ${marketOpportunity.competitorGap.toLocaleString()}M
              </div>
              <div className="bloomberg-small-text text-slate-600">Opportunity Gap</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBenchmarks = () => {
    const benchmarks = [
      { key: 'volume', label: 'Daily Volume', unit: 'M USD' },
      { key: 'transaction_size', label: 'Avg Transaction', unit: 'USD' },
      { key: 'user_growth', label: 'Active Users', unit: 'users' },
      { key: 'institutional_penetration', label: 'Institutional %', unit: '%' }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="bloomberg-card-title text-slate-900 mb-4">Performance Benchmarks</h3>

          <div className="space-y-6">
            {benchmarks.map(({ key, label, unit }) => {
              const benchmark = performanceBenchmarks[key as keyof typeof performanceBenchmarks];
              return (
                <div key={key} className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{label}</h4>
                    <div className="bloomberg-small-text text-slate-500">
                      Percentile: {benchmark.percentileRank.toFixed(0)}th
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-sky-50 rounded-lg">
                      <div className="bloomberg-card-title text-sky-600">
                        {key === 'volume' ? benchmark.wreiBenchmark.toFixed(1) :
                         key === 'institutional_penetration' ? benchmark.wreiBenchmark.toFixed(1) :
                         benchmark.wreiBenchmark.toLocaleString()}
                      </div>
                      <div className="bloomberg-section-label text-slate-600">WREI Current</div>
                    </div>

                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="bloomberg-card-title text-slate-700">
                        {key === 'volume' ? benchmark.competitorAverage.toFixed(1) :
                         key === 'institutional_penetration' ? benchmark.competitorAverage.toFixed(1) :
                         benchmark.competitorAverage.toLocaleString()}
                      </div>
                      <div className="bloomberg-section-label text-slate-600">Market Average</div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="bloomberg-card-title text-green-600">
                        {key === 'volume' ? benchmark.topPerformer.value.toFixed(1) :
                         key === 'institutional_penetration' ? benchmark.topPerformer.value.toFixed(1) :
                         benchmark.topPerformer.value.toLocaleString()}
                      </div>
                      <div className="bloomberg-section-label text-slate-600">{benchmark.topPerformer.name}</div>
                    </div>

                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="bloomberg-card-title text-amber-600">
                        {key === 'volume' ? benchmark.improvementTarget.toFixed(1) :
                         key === 'institutional_penetration' ? benchmark.improvementTarget.toFixed(1) :
                         benchmark.improvementTarget.toLocaleString()}
                      </div>
                      <div className="bloomberg-section-label text-slate-600">Target ({unit})</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="bloomberg-metric-value text-slate-900">Competitive Positioning</h2>
          <p className="text-slate-600 bloomberg-small-text">Strategic market analysis and competitive intelligence</p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 rounded-lg p-1 mt-4 sm:mt-0">
          {[
            { key: 'matrix', label: 'Matrix', icon: '⊞' },
            { key: 'dimension', label: 'Analysis', icon: '📊' },
            { key: 'recommendations', label: 'Strategy', icon: '💡' },
            { key: 'benchmarks', label: 'Metrics', icon: '📈' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setSelectedView(key as ViewMode)}
              className={`px-3 py-2 rounded-md bloomberg-small-text font-medium transition-all ${
                selectedView === key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="mr-1">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Render Selected View */}
      {selectedView === 'matrix' && renderCompetitiveMatrix()}
      {selectedView === 'dimension' && renderDimensionAnalysis()}
      {selectedView === 'recommendations' && renderRecommendations()}
      {selectedView === 'benchmarks' && renderBenchmarks()}

      {/* Competitor Detail Modal */}
      {selectedCompetitor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="bloomberg-metric-value text-slate-900">{selectedCompetitor.name}</h3>
                <button
                  onClick={() => setSelectedCompetitor(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-slate-600">{selectedCompetitor.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className=" text-green-700 mb-2">Strengths</h4>
                    <ul className="bloomberg-small-text space-y-1">
                      {selectedCompetitor.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500">+</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className=" text-red-700 mb-2">Weaknesses</h4>
                    <ul className="bloomberg-small-text space-y-1">
                      {selectedCompetitor.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-red-500">-</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}