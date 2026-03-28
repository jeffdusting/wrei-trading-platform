'use client';

import { useState } from 'react';
import { NegotiationSession, SessionComparison } from '@/lib/negotiation-history';
import { ArgumentClassification, PersonaType } from '@/lib/types';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';

interface ComparisonDashboardProps {
  sessions: NegotiationSession[];
  comparison?: SessionComparison | null;
  onSelectSessions?: (sessionIds: string[]) => void;
  onClose?: () => void;
}

interface RadarMetric {
  metric: string;
  session1: number;
  session2: number;
  fullMark: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes.toFixed(0)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};

const formatPersona = (persona: PersonaType | 'freeplay') => {
  return persona.replace(/_/g, ' ').split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const getOutcomeColor = (outcome: string, success: boolean) => {
  if (success) return 'text-[#10B981] bg-green-50';
  return outcome === 'deferred' ? 'text-[#F59E0B] bg-yellow-50' : 'text-[#EF4444] bg-red-50';
};

export default function ComparisonDashboard({
  sessions,
  comparison,
  onSelectSessions,
  onClose
}: ComparisonDashboardProps) {
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'metrics' | 'strategy' | 'timeline'>('metrics');

  const handleSessionSelection = (sessionId: string) => {
    const newSelection = selectedSessionIds.includes(sessionId)
      ? selectedSessionIds.filter(id => id !== sessionId)
      : selectedSessionIds.length < 2
        ? [...selectedSessionIds, sessionId]
        : [selectedSessionIds[1], sessionId]; // Replace first with new selection

    setSelectedSessionIds(newSelection);

    if (onSelectSessions && newSelection.length === 2) {
      onSelectSessions(newSelection);
    }
  };

  // Prepare radar chart data if we have a comparison
  const radarData: RadarMetric[] = comparison ? [
    {
      metric: 'Final Price',
      session1: (comparison.session1.metrics.finalPrice / comparison.session1.metrics.anchorPrice) * 100,
      session2: (comparison.session2.metrics.finalPrice / comparison.session2.metrics.anchorPrice) * 100,
      fullMark: 100
    },
    {
      metric: 'Efficiency',
      session1: Math.max(0, 100 - (comparison.session1.metrics.totalRounds * 10)), // Fewer rounds = higher efficiency
      session2: Math.max(0, 100 - (comparison.session2.metrics.totalRounds * 10)),
      fullMark: 100
    },
    {
      metric: 'Speed',
      session1: Math.max(0, 100 - (comparison.session1.metrics.duration * 2)), // Shorter duration = higher speed
      session2: Math.max(0, 100 - (comparison.session2.metrics.duration * 2)),
      fullMark: 100
    },
    {
      metric: 'Concession Control',
      session1: Math.max(0, 100 - comparison.session1.metrics.totalConcessionPercentage * 5), // Fewer concessions = better control
      session2: Math.max(0, 100 - comparison.session2.metrics.totalConcessionPercentage * 5),
      fullMark: 100
    },
    {
      metric: 'Argument Diversity',
      session1: Object.keys(comparison.session1.metrics.argumentTypes).filter(
        key => comparison.session1.metrics.argumentTypes[key as ArgumentClassification] > 0
      ).length * 12.5, // Max 8 argument types * 12.5 = 100
      session2: Object.keys(comparison.session2.metrics.argumentTypes).filter(
        key => comparison.session2.metrics.argumentTypes[key as ArgumentClassification] > 0
      ).length * 12.5,
      fullMark: 100
    }
  ] : [];

  const exportComparison = () => {
    if (!comparison) return;

    const reportData = {
      comparisonDate: new Date().toISOString(),
      sessions: {
        session1: {
          id: comparison.session1.id,
          persona: comparison.session1.persona,
          outcome: comparison.session1.outcome,
          metrics: comparison.session1.metrics
        },
        session2: {
          id: comparison.session2.id,
          persona: comparison.session2.persona,
          outcome: comparison.session2.outcome,
          metrics: comparison.session2.metrics
        }
      },
      analysis: {
        winner: comparison.outcomeComparison.winnerSession,
        successFactors: comparison.outcomeComparison.successFactors,
        priceComparison: comparison.priceComparison,
        strategyComparison: comparison.strategyComparison
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `negotiation-comparison-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#1B2A4A] text-white">
        <div className="flex items-center space-x-4">
          <h2 className="bloomberg-metric-value ">Negotiation Comparison</h2>
          {comparison && (
            <div className="flex items-center space-x-2 bloomberg-small-text">
              <span className="bg-[#0EA5E9] px-3 py-1 rounded-full">
                {comparison.outcomeComparison.winnerSession === 'tie' ? '🤝' : '🏆'}
                {comparison.outcomeComparison.winnerSession === 'tie' ? 'Tie' : `Session ${comparison.outcomeComparison.winnerSession.slice(-1)} Wins`}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {comparison && (
            <button
              onClick={exportComparison}
              className="flex items-center px-3 py-2 bg-[#10B981] text-white rounded-lg hover:bg-green-600 transition-colors bloomberg-small-text"
            >
              📊 Export Report
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {!comparison ? (
          /* Session Selection */
          <div className="p-6">
            <div className="mb-6">
              <h3 className="bloomberg-card-title text-gray-800 mb-2">Select Two Sessions to Compare</h3>
              <p className="text-gray-600">Choose 2 negotiation sessions to analyse their performance and strategies.</p>
            </div>

            <div className="grid gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionSelection(session.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedSessionIds.includes(session.id)
                      ? 'border-[#0EA5E9] bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selectedSessionIds.includes(session.id)
                          ? 'border-[#0EA5E9] bg-[#0EA5E9]'
                          : 'border-gray-300'
                      }`}>
                        {selectedSessionIds.includes(session.id) && (
                          <span className="text-white bloomberg-section-label">✓</span>
                        )}
                      </div>

                      <div>
                        <div className="font-medium text-gray-800">
                          {formatPersona(session.persona)}
                        </div>
                        <div className="bloomberg-small-text text-gray-600">
                          {new Date(session.startTime).toLocaleDateString('en-AU')} at {' '}
                          {new Date(session.startTime).toLocaleTimeString('en-AU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 bloomberg-small-text">
                      <div className="text-center">
                        <div className="text-gray-600">Final Price</div>
                        <div className=" text-[#10B981]">
                          {formatCurrency(session.metrics.finalPrice)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Rounds</div>
                        <div className=" text-gray-800">
                          {session.metrics.totalRounds}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Outcome</div>
                        <div className={`px-2 py-1 rounded bloomberg-section-label font-medium ${getOutcomeColor(session.outcome || 'unknown', session.metrics.outcomeSuccess)}`}>
                          {session.outcome?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedSessionIds.length === 1 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 bloomberg-small-text">
                  Select one more session to start the comparison.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Comparison View */
          <div className="flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              {[
                { key: 'metrics', label: 'Metrics Comparison', icon: '📊' },
                { key: 'strategy', label: 'Strategy Analysis', icon: '🎯' },
                { key: 'timeline', label: 'Timeline View', icon: '⏱️' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`flex items-center px-6 py-3 bloomberg-small-text font-medium transition-colors ${
                    selectedTab === tab.key
                      ? 'border-b-2 border-[#0EA5E9] text-[#0EA5E9] bg-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedTab === 'metrics' && (
                <div className="p-6 grid lg:grid-cols-2 gap-8">
                  {/* Side-by-side Comparison */}
                  <div className="lg:col-span-2">
                    <h3 className="bloomberg-card-title mb-4">Head-to-Head Comparison</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Session 1 */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-[#1B2A4A] text-white p-4">
                          <h4 className="">{formatPersona(comparison.session1.persona)}</h4>
                          <p className="bloomberg-small-text text-white/70">
                            {new Date(comparison.session1.startTime).toLocaleDateString('en-AU')}
                          </p>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 bloomberg-small-text">
                            <div>
                              <div className="text-gray-600">Final Price</div>
                              <div className=" bloomberg-card-title text-[#10B981]">
                                {formatCurrency(comparison.session1.metrics.finalPrice)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Total Rounds</div>
                              <div className=" bloomberg-card-title text-gray-800">
                                {comparison.session1.metrics.totalRounds}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Duration</div>
                              <div className=" text-gray-800">
                                {formatDuration(comparison.session1.metrics.duration)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Concessions</div>
                              <div className=" text-[#F59E0B]">
                                {comparison.session1.metrics.totalConcessionPercentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 bloomberg-small-text mb-2">Outcome</div>
                            <div className={`inline-block px-3 py-1 rounded-full bloomberg-small-text font-medium ${getOutcomeColor(comparison.session1.outcome || 'unknown', comparison.session1.metrics.outcomeSuccess)}`}>
                              {comparison.session1.outcome?.toUpperCase()} {comparison.session1.metrics.outcomeSuccess ? '✓' : '✗'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Session 2 */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-[#0EA5E9] text-white p-4">
                          <h4 className="">{formatPersona(comparison.session2.persona)}</h4>
                          <p className="bloomberg-small-text text-white/70">
                            {new Date(comparison.session2.startTime).toLocaleDateString('en-AU')}
                          </p>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 bloomberg-small-text">
                            <div>
                              <div className="text-gray-600">Final Price</div>
                              <div className=" bloomberg-card-title text-[#10B981]">
                                {formatCurrency(comparison.session2.metrics.finalPrice)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Total Rounds</div>
                              <div className=" bloomberg-card-title text-gray-800">
                                {comparison.session2.metrics.totalRounds}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Duration</div>
                              <div className=" text-gray-800">
                                {formatDuration(comparison.session2.metrics.duration)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Concessions</div>
                              <div className=" text-[#F59E0B]">
                                {comparison.session2.metrics.totalConcessionPercentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 bloomberg-small-text mb-2">Outcome</div>
                            <div className={`inline-block px-3 py-1 rounded-full bloomberg-small-text font-medium ${getOutcomeColor(comparison.session2.outcome || 'unknown', comparison.session2.metrics.outcomeSuccess)}`}>
                              {comparison.session2.outcome?.toUpperCase()} {comparison.session2.metrics.outcomeSuccess ? '✓' : '✗'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Radar Chart */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="bloomberg-card-title mb-4">Performance Radar</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid gridType="polygon" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                          <Radar
                            name={formatPersona(comparison.session1.persona)}
                            dataKey="session1"
                            stroke="#1B2A4A"
                            fill="#1B2A4A"
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                          <Radar
                            name={formatPersona(comparison.session2.persona)}
                            dataKey="session2"
                            stroke="#0EA5E9"
                            fill="#0EA5E9"
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="bloomberg-card-title mb-4">Key Success Factors</h4>
                    {comparison.outcomeComparison.successFactors.length > 0 ? (
                      <ul className="space-y-2">
                        {comparison.outcomeComparison.successFactors.map((factor, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-[#10B981] mr-2 mt-1">✓</span>
                            <span className="text-gray-800">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 italic">Both sessions performed similarly with no clear distinguishing factors.</p>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bloomberg-small-text text-gray-600 mb-2">Financial Impact</div>
                      {comparison.priceComparison.finalPriceDifference !== 0 && (
                        <div className="text-gray-800">
                          <strong>Price Difference:</strong> {formatCurrency(Math.abs(comparison.priceComparison.finalPriceDifference))}
                          ({comparison.priceComparison.finalPriceDifference > 0 ? 'Session 1 higher' : 'Session 2 higher'})
                        </div>
                      )}
                      {comparison.priceComparison.concessionDifference !== 0 && (
                        <div className="text-gray-800 mt-1">
                          <strong>Concession Difference:</strong> {Math.abs(comparison.priceComparison.concessionDifference).toFixed(1)}%
                          ({comparison.priceComparison.concessionDifference > 0 ? 'Session 1 gave more' : 'Session 2 gave more'})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'strategy' && (
                <div className="p-6">
                  <h3 className="bloomberg-card-title mb-6">Strategy Analysis</h3>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Argument Distribution */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className=" mb-4">Argument Strategy Distribution</h4>
                      <div className="space-y-4">
                        {Object.keys(comparison.strategyComparison.argumentDistribution1).map((argType) => {
                          const count1 = comparison.strategyComparison.argumentDistribution1[argType as ArgumentClassification];
                          const count2 = comparison.strategyComparison.argumentDistribution2[argType as ArgumentClassification];
                          const maxCount = Math.max(count1, count2, 1);

                          return (
                            <div key={argType} className="space-y-2">
                              <div className="flex justify-between bloomberg-small-text">
                                <span className="font-medium">{argType.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                                <span className="text-gray-600">{count1} vs {count2}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-200 rounded-full h-2 relative">
                                  <div
                                    className="bg-[#1B2A4A] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(count1 / maxCount) * 100}%` }}
                                  />
                                </div>
                                <div className="bg-gray-200 rounded-full h-2 relative">
                                  <div
                                    className="bg-[#0EA5E9] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(count2 / maxCount) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Emotional Progression */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className=" mb-4">Emotional Pattern Analysis</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="bloomberg-small-text text-gray-600 mb-2">Emotional Pattern Similarity</div>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                              <div
                                className="bg-gradient-to-r from-[#EF4444] via-[#F59E0B] to-[#10B981] h-3 rounded-full transition-all duration-300"
                                style={{ width: `${comparison.strategyComparison.emotionalPatternSimilarity * 100}%` }}
                              />
                            </div>
                            <span className="bloomberg-small-text font-medium">
                              {(comparison.strategyComparison.emotionalPatternSimilarity * 100).toFixed(0)}% Similar
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bloomberg-small-text">
                          <div>
                            <div className="font-medium text-gray-800 mb-2">
                              {formatPersona(comparison.session1.persona)} Emotions
                            </div>
                            <div className="space-y-1">
                              {comparison.session1.metrics.emotionalProgression.map((emotion, idx) => (
                                <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded bloomberg-section-label mr-1 mb-1 capitalize">
                                  {emotion.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 mb-2">
                              {formatPersona(comparison.session2.persona)} Emotions
                            </div>
                            <div className="space-y-1">
                              {comparison.session2.metrics.emotionalProgression.map((emotion, idx) => (
                                <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded bloomberg-section-label mr-1 mb-1 capitalize">
                                  {emotion.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Efficiency Metrics */}
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className=" mb-4">Efficiency Comparison</h4>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="bloomberg-large-metric text-[#0EA5E9] mb-2">
                            {comparison.strategyComparison.roundsComparison > 0 ? '+' : ''}{comparison.strategyComparison.roundsComparison}
                          </div>
                          <div className="bloomberg-small-text text-gray-600">Round Difference</div>
                          <div className="bloomberg-section-label text-gray-500 mt-1">
                            {comparison.strategyComparison.roundsComparison === 0
                              ? 'Same number of rounds'
                              : comparison.strategyComparison.roundsComparison > 0
                                ? 'Session 1 took more rounds'
                                : 'Session 2 took more rounds'
                            }
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bloomberg-large-metric text-[#F59E0B] mb-2">
                            {Math.abs(comparison.priceComparison.efficiencyDifference).toFixed(0)}
                          </div>
                          <div className="bloomberg-small-text text-gray-600">Price/Round Difference</div>
                          <div className="bloomberg-section-label text-gray-500 mt-1">
                            {comparison.priceComparison.efficiencyDifference > 0
                              ? 'Session 1 more efficient'
                              : 'Session 2 more efficient'
                            }
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bloomberg-large-metric text-[#10B981] mb-2">
                            {comparison.outcomeComparison.bothSuccessful ? 'Both' : 'One'}
                          </div>
                          <div className="bloomberg-small-text text-gray-600">Successful Outcomes</div>
                          <div className="bloomberg-section-label text-gray-500 mt-1">
                            {comparison.outcomeComparison.bothSuccessful
                              ? 'Both reached agreement'
                              : 'Only one reached agreement'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'timeline' && (
                <div className="p-6">
                  <h3 className="bloomberg-card-title mb-6">Timeline Comparison</h3>

                  <div className="space-y-8">
                    {/* Timeline visualization would go here */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className=" mb-4">Negotiation Timeline</h4>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <div className="font-medium text-gray-800 mb-3">{formatPersona(comparison.session1.persona)}</div>
                          <div className="space-y-3">
                            <div className="flex justify-between bloomberg-small-text">
                              <span className="text-gray-600">Start Time:</span>
                              <span className="font-medium">
                                {new Date(comparison.session1.startTime).toLocaleString('en-AU')}
                              </span>
                            </div>
                            <div className="flex justify-between bloomberg-small-text">
                              <span className="text-gray-600">End Time:</span>
                              <span className="font-medium">
                                {comparison.session1.endTime
                                  ? new Date(comparison.session1.endTime).toLocaleString('en-AU')
                                  : 'In Progress'
                                }
                              </span>
                            </div>
                            <div className="flex justify-between bloomberg-small-text">
                              <span className="text-gray-600">Total Duration:</span>
                              <span className="font-medium">
                                {formatDuration(comparison.session1.metrics.duration)}
                              </span>
                            </div>
                            <div className="flex justify-between bloomberg-small-text">
                              <span className="text-gray-600">Messages Exchanged:</span>
                              <span className="font-medium">
                                {comparison.session1.messages.length}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-gray-800 mb-3">{formatPersona(comparison.session2.persona)}</div>
                          <div className="space-y-3">
                            <div className="flex justify-between bloomberg-small-text">
                              <span className="text-gray-600">Start Time:</span>
                              <span className="font-medium">
                                {new Date(comparison.session2.startTime).toLocaleString('en-AU')}
                              </span>
                            </div>
                            <div className="flex justify-between bloomberg-small-text">
                              <span className="text-gray-600">End Time:</span>
                              <span className="font-medium">
                                {comparison.session2.endTime
                                  ? new Date(comparison.session2.endTime).toLocaleString('en-AU')
                                  : 'In Progress'
                                }
                              </span>
                            </div>
                            <div className="flex justify-between bloomberg-small-text">
                              <span className="text-gray-600">Total Duration:</span>
                              <span className="font-medium">
                                {formatDuration(comparison.session2.metrics.duration)}
                              </span>
                            </div>
                            <div className="flex justify-between bloomberg-small-text">
                              <span className="text-gray-600">Messages Exchanged:</span>
                              <span className="font-medium">
                                {comparison.session2.messages.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pace Analysis */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className=" mb-4">Negotiation Pace Analysis</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="bloomberg-small-text text-gray-600 mb-2">Average Time per Round</div>
                          <div className="bloomberg-large-metric text-[#1B2A4A]">
                            {(comparison.session1.metrics.duration / comparison.session1.metrics.totalRounds).toFixed(1)}m
                          </div>
                          <div className="bloomberg-small-text text-gray-500">
                            {formatPersona(comparison.session1.persona)}
                          </div>
                        </div>
                        <div>
                          <div className="bloomberg-small-text text-gray-600 mb-2">Average Time per Round</div>
                          <div className="bloomberg-large-metric text-[#0EA5E9]">
                            {(comparison.session2.metrics.duration / comparison.session2.metrics.totalRounds).toFixed(1)}m
                          </div>
                          <div className="bloomberg-small-text text-gray-500">
                            {formatPersona(comparison.session2.persona)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}