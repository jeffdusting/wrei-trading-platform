'use client';

import { useState } from 'react';
import { NegotiationScorecard, getScoreDimensions, generateScoreSummary } from '@/lib/negotiation-scoring';
import { PersonaType } from '@/lib/types';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScorecardProps {
  scorecard: NegotiationScorecard;
  persona: PersonaType | 'freeplay';
  onClose?: () => void;
}

interface RadarDataPoint {
  dimension: string;
  score: number;
  benchmark: number;
  fullMark: number;
}

const gradeColors = {
  'A+': 'bg-gradient-to-br from-green-500 to-green-600 text-white',
  'A': 'bg-gradient-to-br from-green-400 to-green-500 text-white',
  'A-': 'bg-gradient-to-br from-green-300 to-green-400 text-white',
  'B+': 'bg-gradient-to-br from-blue-400 to-blue-500 text-white',
  'B': 'bg-gradient-to-br from-blue-300 to-blue-400 text-white',
  'B-': 'bg-gradient-to-br from-blue-200 to-blue-300 text-white',
  'C+': 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white',
  'C': 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-white',
  'C-': 'bg-gradient-to-br from-orange-300 to-orange-400 text-white',
  'D': 'bg-gradient-to-br from-red-400 to-red-500 text-white',
  'F': 'bg-gradient-to-br from-red-600 to-red-700 text-white'
} as const;

const performanceMessages = {
  'A+': '🏆 Outstanding performance! You\'ve mastered this negotiation type.',
  'A': '🎯 Excellent work! Your negotiation skills are very strong.',
  'A-': '👏 Great job! You\'re performing at a high level.',
  'B+': '✨ Good performance with room for refinement.',
  'B': '👍 Solid negotiation with some areas to improve.',
  'B-': '📈 Decent performance, focus on key improvement areas.',
  'C+': '⚡ Average performance, significant room for growth.',
  'C': '🔧 Below average, work on fundamental negotiation skills.',
  'C-': '📚 Consider reviewing negotiation strategies and techniques.',
  'D': '🎓 Needs improvement - focus on basic negotiation principles.',
  'F': '💪 Don\'t give up! Learn from this experience and try again.'
} as const;

export default function Scorecard({ scorecard, persona, onClose }: ScorecardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied'>('idle');

  const dimensions = getScoreDimensions(scorecard);
  const personaName = persona.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Prepare data for radar chart
  const radarData: RadarDataPoint[] = [
    {
      dimension: 'Price',
      score: scorecard.priceScore,
      benchmark: scorecard.benchmarkData.expectedPriceAchievement,
      fullMark: 100
    },
    {
      dimension: 'Efficiency',
      score: scorecard.efficiencyScore,
      benchmark: 80, // Generally expect 80% efficiency
      fullMark: 100
    },
    {
      dimension: 'Strategy',
      score: scorecard.strategyScore,
      benchmark: 75, // Generally expect 75% strategy score
      fullMark: 100
    },
    {
      dimension: 'Emotional IQ',
      score: scorecard.emotionalIntelligenceScore,
      benchmark: 70, // Generally expect 70% emotional intelligence
      fullMark: 100
    },
    {
      dimension: 'Information',
      score: scorecard.informationExtractionScore,
      benchmark: 65, // Generally expect 65% information extraction
      fullMark: 100
    }
  ];

  const handleShare = async () => {
    setShareStatus('copying');
    try {
      const summary = generateScoreSummary(scorecard, persona);
      await navigator.clipboard.writeText(summary);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = generateScoreSummary(scorecard, persona);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '🎯';
    if (score >= 70) return '👍';
    if (score >= 60) return '📈';
    return '📚';
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0EA5E9] text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bloomberg-large-metric font-black shadow-lg ${gradeColors[scorecard.letterGrade]}`}>
                {scorecard.letterGrade}
              </div>
              <div className="bloomberg-small-text mt-2 opacity-90">Overall Grade</div>
            </div>

            <div>
              <h1 className="bloomberg-page-heading mb-2">Negotiation Scorecard</h1>
              <div className="flex items-center space-x-4 bloomberg-card-title">
                <span className="opacity-90">Persona:</span>
                <span className="">{personaName}</span>
              </div>
              <div className="flex items-center space-x-4 bloomberg-card-title mt-1">
                <span className="opacity-90">Score:</span>
                <span className="bloomberg-large-metric">{scorecard.overallScore}/100</span>
                {scorecard.personaOptimal && (
                  <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full bloomberg-small-text font-medium">
                    🌟 Persona Optimal
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              disabled={shareStatus === 'copying'}
              className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm border border-white/20"
            >
              {shareStatus === 'copying' && '⏳'}
              {shareStatus === 'copied' && '✅'}
              {shareStatus === 'idle' && '📤'}
              <span className="ml-2">
                {shareStatus === 'copying' && 'Copying...'}
                {shareStatus === 'copied' && 'Copied!'}
                {shareStatus === 'idle' && 'Share Results'}
              </span>
            </button>

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

        {/* Performance message */}
        <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
          <p className="text-white/90">{performanceMessages[scorecard.letterGrade]}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Performance Radar Chart */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="bloomberg-metric-value text-gray-800 mb-4 text-center">
              Performance Breakdown
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                  <Radar
                    name="Your Score"
                    dataKey="score"
                    stroke="#0EA5E9"
                    fill="#0EA5E9"
                    fillOpacity={0.3}
                    strokeWidth={3}
                    dot={{ fill: '#0EA5E9', r: 4 }}
                  />
                  <Radar
                    name="Expected"
                    dataKey="benchmark"
                    stroke="#10B981"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#10B981', r: 2 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4 bloomberg-small-text">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#0EA5E9] rounded-full mr-2 opacity-60"></div>
                <span>Your Performance</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-2 border-2 border-[#10B981] border-dashed mr-2"></div>
                <span>Expected Level</span>
              </div>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="space-y-4">
            <h3 className="bloomberg-metric-value text-gray-800 mb-4">
              Score Breakdown
            </h3>

            {dimensions.map((dimension, index) => (
              <div key={dimension.name} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="bloomberg-large-metric">{getScoreIcon(dimension.score)}</span>
                    <div>
                      <h4 className=" text-gray-800">{dimension.name}</h4>
                      <p className="bloomberg-small-text text-gray-600">{dimension.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`bloomberg-large-metric ${getScoreColor(dimension.score)}`}>
                      {dimension.score}
                    </div>
                    <div className="bloomberg-section-label text-gray-500">/ {dimension.maxPoints}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        dimension.score >= 90 ? 'bg-green-500' :
                        dimension.score >= 80 ? 'bg-blue-500' :
                        dimension.score >= 70 ? 'bg-yellow-500' :
                        dimension.score >= 60 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${dimension.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Suggestions */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="bloomberg-metric-value text-blue-900 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Personalised Improvement Tips
          </h3>

          {scorecard.improvementSuggestions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {scorecard.improvementSuggestions.map((suggestion, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600  bloomberg-small-text">#{index + 1}</span>
                    <p className="text-gray-800 bloomberg-small-text leading-relaxed">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-blue-700">
              <div className="text-6xl mb-4">🎉</div>
              <p className="bloomberg-card-title font-medium">Perfect performance!</p>
              <p className="bloomberg-small-text opacity-75">You&apos;ve mastered this negotiation scenario.</p>
            </div>
          )}
        </div>

        {/* Benchmark Context */}
        <div className="mt-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <h3 className="bloomberg-card-title text-gray-800 flex items-center">
              <span className="mr-2">📊</span>
              Persona Benchmark Details
            </h3>
            <span className="text-gray-500">
              {showDetails ? '▲' : '▼'}
            </span>
          </button>

          {showDetails && (
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className=" text-gray-800 mb-3">Expected Performance</h4>
                  <div className="space-y-2 bloomberg-small-text">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price Achievement:</span>
                      <span className="font-medium">{scorecard.benchmarkData.expectedPriceAchievement}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Typical Rounds:</span>
                      <span className="font-medium">{scorecard.benchmarkData.expectedRounds}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-medium">{scorecard.benchmarkData.expectedSuccessRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty Level:</span>
                      <span className="font-medium">
                        {scorecard.benchmarkData.difficultyMultiplier < 1.0 ? 'Easy' :
                         scorecard.benchmarkData.difficultyMultiplier > 1.2 ? 'Hard' : 'Moderate'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className=" text-gray-800 mb-3">Effective Arguments</h4>
                  <div className="space-y-1">
                    {scorecard.benchmarkData.strongestArguments.map((arg, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 bloomberg-section-label px-2 py-1 rounded mr-1 mb-1 capitalize">
                        {arg.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className=" text-gray-800 mb-3">Emotional Profile</h4>
                  <div className="space-y-2 bloomberg-small-text">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starting Emotion:</span>
                      <span className="font-medium capitalize">{scorecard.benchmarkData.emotionalProfile.startingEmotion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volatility:</span>
                      <span className="font-medium">
                        {scorecard.benchmarkData.emotionalProfile.volatility < 0.3 ? 'Low' :
                         scorecard.benchmarkData.emotionalProfile.volatility > 0.5 ? 'High' : 'Moderate'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 bloomberg-small-text">Concession Triggers:</span>
                      <div className="mt-1">
                        {scorecard.benchmarkData.emotionalProfile.concessionTriggers.map((emotion, index) => (
                          <span key={index} className="inline-block bg-green-100 text-green-800 bloomberg-section-label px-2 py-1 rounded mr-1 mb-1 capitalize">
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0EA5E9] rounded-xl p-6 text-white">
            <h3 className="bloomberg-metric-value mb-2">Ready for Another Challenge?</h3>
            <p className="opacity-90 mb-4">
              Try negotiating with different personas to master various trading scenarios.
            </p>
            <button className="bg-white text-[#1B2A4A] px-6 py-3 rounded-lg  hover:bg-gray-100 transition-colors">
              🚀 Start New Negotiation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}