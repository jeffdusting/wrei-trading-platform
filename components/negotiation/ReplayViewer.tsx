'use client';

import { useState, useEffect } from 'react';
import { NegotiationSession, NegotiationStateSnapshot } from '@/lib/negotiation-history';
import { ArgumentClassification, EmotionalState, Message } from '@/lib/types';

interface ReplayViewerProps {
  session: NegotiationSession;
  onClose?: () => void;
}

interface MessageHighlight {
  type: 'price_concession' | 'strategy_change' | 'emotional_shift';
  description: string;
}

const argumentColors: Record<ArgumentClassification, string> = {
  price_challenge: 'bg-red-100 text-red-700 border-red-200',
  fairness_appeal: 'bg-blue-100 text-blue-700 border-blue-200',
  time_pressure: 'bg-amber-100 text-amber-700 border-amber-200',
  information_request: 'bg-green-100 text-green-700 border-green-200',
  relationship_signal: 'bg-purple-100 text-purple-700 border-purple-200',
  authority_constraint: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  emotional_expression: 'bg-pink-100 text-pink-700 border-pink-200',
  general: 'bg-gray-100 text-gray-700 border-gray-200'
};

const emotionalColors: Record<EmotionalState, string> = {
  frustrated: 'bg-red-50 border-l-red-400',
  enthusiastic: 'bg-green-50 border-l-green-400',
  sceptical: 'bg-yellow-50 border-l-yellow-400',
  satisfied: 'bg-blue-50 border-l-blue-400',
  neutral: 'bg-gray-50 border-l-gray-400',
  pressured: 'bg-orange-50 border-l-orange-400'
};

const phaseIcons: Record<string, string> = {
  opening: '🤝',
  elicitation: '🔍',
  negotiation: '💬',
  closure: '✅',
  escalation: '⚡'
};

export default function ReplayViewer({ session, onClose }: ReplayViewerProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);

  const messages = session.messages;
  const stateHistory = session.stateHistory;
  const currentSnapshot = stateHistory[currentMessageIndex] || null;
  const currentMessage = messages[currentMessageIndex] || null;

  // Calculate highlights for each message
  const messageHighlights = messages.map((message, index): MessageHighlight[] => {
    const highlights: MessageHighlight[] = [];

    // Check for price concessions (simplified approximation)
    if (index > 0 && stateHistory[index] && stateHistory[index - 1]) {
      const prevPrice = stateHistory[index - 1].currentPrice;
      const currentPrice = stateHistory[index].currentPrice;
      if (currentPrice < prevPrice) {
        const concession = ((prevPrice - currentPrice) / prevPrice * 100).toFixed(1);
        highlights.push({
          type: 'price_concession',
          description: `Price concession: ${concession}% (A$${prevPrice.toFixed(0)} → A$${currentPrice.toFixed(0)})`
        });
      }
    }

    // Check for emotional shifts
    if (index > 0 && message.emotionalState && messages[index - 1].emotionalState) {
      const prevEmotion = messages[index - 1].emotionalState;
      const currentEmotion = message.emotionalState;
      if (prevEmotion !== currentEmotion) {
        highlights.push({
          type: 'emotional_shift',
          description: `Emotional shift: ${prevEmotion} → ${currentEmotion}`
        });
      }
    }

    // Check for strategy changes (argument type changes)
    if (index > 0 && message.argumentClassification && messages[index - 1].argumentClassification) {
      const prevArg = messages[index - 1].argumentClassification!;
      const currentArg = message.argumentClassification;
      if (prevArg !== currentArg) {
        highlights.push({
          type: 'strategy_change',
          description: `Strategy shift: ${prevArg.replace(/_/g, ' ')} → ${currentArg.replace(/_/g, ' ')}`
        });
      }
    }

    return highlights;
  });

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || currentMessageIndex >= messages.length - 1) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        if (prev >= messages.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000 / playSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentMessageIndex, messages.length, playSpeed]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getHighlightIcon = (type: MessageHighlight['type']) => {
    switch (type) {
      case 'price_concession': return '💰';
      case 'emotional_shift': return '😊';
      case 'strategy_change': return '🔄';
      default: return '💡';
    }
  };

  const getHighlightColor = (type: MessageHighlight['type']) => {
    switch (type) {
      case 'price_concession': return 'bg-green-50 border-green-200 text-green-800';
      case 'emotional_shift': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'strategy_change': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#1B2A4A] text-white">
        <div className="flex items-center space-x-4">
          <h2 className="bloomberg-metric-value ">Negotiation Replay</h2>
          <div className="flex items-center space-x-2 bloomberg-small-text bg-[#0EA5E9] px-3 py-1 rounded-full">
            <span>📋</span>
            <span>{session.persona.replace(/_/g, ' ').split(' ').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}</span>
          </div>
          <div className="flex items-center space-x-2 bloomberg-small-text">
            {session.outcome === 'agreed' ? (
              <span className="bg-[#10B981] px-3 py-1 rounded-full flex items-center">
                ✅ Agreed ({formatCurrency(session.metrics.finalPrice)})
              </span>
            ) : (
              <span className="bg-[#EF4444] px-3 py-1 rounded-full flex items-center">
                ❌ {(session.outcome || 'Unknown').charAt(0).toUpperCase() + (session.outcome || 'unknown').slice(1)}
              </span>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Replay Area */}
        <div className="flex-1 flex flex-col">
          {/* Timeline Controls */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={currentMessageIndex >= messages.length - 1}
                className="flex items-center px-4 py-2 bg-[#1B2A4A] text-white rounded-lg hover:bg-[#0EA5E9] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isPlaying ? '⏸️' : '▶️'}
                <span className="ml-2">{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="bloomberg-small-text text-gray-600">Speed:</span>
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaySpeed(speed)}
                    className={`px-2 py-1 rounded bloomberg-small-text ${
                      playSpeed === speed
                        ? 'bg-[#0EA5E9] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 bloomberg-small-text text-gray-600">
                <span>Message {currentMessageIndex + 1} of {messages.length}</span>
              </div>
            </div>

            {/* Timeline Slider */}
            <div className="w-full">
              <input
                type="range"
                min="0"
                max={Math.max(0, messages.length - 1)}
                value={currentMessageIndex}
                onChange={(e) => setCurrentMessageIndex(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #0EA5E9 0%, #0EA5E9 ${(currentMessageIndex / (messages.length - 1)) * 100}%, #e5e7eb ${(currentMessageIndex / (messages.length - 1)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between bloomberg-section-label text-gray-500 mt-1">
                <span>Start</span>
                <span>{formatTimestamp(session.startTime)}</span>
                <span>{session.endTime && formatTimestamp(session.endTime)}</span>
                <span>End</span>
              </div>
            </div>
          </div>

          {/* Message Display */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentMessage && (
              <div className="max-w-4xl mx-auto">
                {/* Message Highlights */}
                {messageHighlights[currentMessageIndex].length > 0 && (
                  <div className="mb-6 space-y-2">
                    {messageHighlights[currentMessageIndex].map((highlight, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center p-3 rounded-lg border ${getHighlightColor(highlight.type)}`}
                      >
                        <span className="bloomberg-metric-value mr-3">{getHighlightIcon(highlight.type)}</span>
                        <span className="font-medium">{highlight.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Current Message */}
                <div className={`p-6 rounded-lg border-l-4 ${emotionalColors[currentMessage.emotionalState || 'neutral']}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full bloomberg-small-text font-medium ${
                        currentMessage.role === 'agent'
                          ? 'bg-[#0EA5E9] text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {currentMessage.role === 'agent' ? '🤖 WREI Agent' : '👤 Buyer'}
                      </div>
                      {currentMessage.argumentClassification && (
                        <div className={`px-2 py-1 rounded bloomberg-section-label border ${argumentColors[currentMessage.argumentClassification]}`}>
                          {currentMessage.argumentClassification.replace(/_/g, ' ').toUpperCase()}
                        </div>
                      )}
                      {currentMessage.emotionalState && (
                        <div className="px-2 py-1 rounded bloomberg-section-label bg-gray-100 text-gray-600 border border-gray-300">
                          😊 {currentMessage.emotionalState.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="bloomberg-section-label text-gray-500">
                      {formatTimestamp(currentMessage.timestamp)}
                    </div>
                  </div>

                  <div className="text-gray-800 leading-relaxed">
                    {currentMessage.content}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentMessageIndex(Math.max(0, currentMessageIndex - 1))}
                    disabled={currentMessageIndex === 0}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  <button
                    onClick={() => setCurrentMessageIndex(Math.min(messages.length - 1, currentMessageIndex + 1))}
                    disabled={currentMessageIndex >= messages.length - 1}
                    className="flex items-center px-4 py-2 bg-[#1B2A4A] text-white rounded-lg hover:bg-[#0EA5E9] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* State Panel */}
        <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <h3 className="bloomberg-card-title text-gray-800 mb-4">State at This Point</h3>

            {currentSnapshot && (
              <div className="space-y-4">
                {/* Round & Phase */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bloomberg-small-text font-medium text-gray-600">Round & Phase</span>
                    <span className="bloomberg-large-metric">{phaseIcons[currentSnapshot.phase] || '📊'}</span>
                  </div>
                  <div className="bloomberg-card-title text-[#1B2A4A]">
                    Round {currentSnapshot.round}
                  </div>
                  <div className="bloomberg-small-text text-gray-600 capitalize">
                    {currentSnapshot.phase.replace(/_/g, ' ')} Phase
                  </div>
                </div>

                {/* Price Information */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bloomberg-small-text font-medium text-gray-600">Current Offer</span>
                    <span className="bloomberg-large-metric">💰</span>
                  </div>
                  <div className="bloomberg-metric-value text-[#10B981]">
                    {formatCurrency(currentSnapshot.currentPrice)}
                  </div>
                  <div className="bloomberg-section-label text-gray-500 mt-1">
                    Anchor: {formatCurrency(session.metrics.anchorPrice)}
                  </div>
                  <div className="bloomberg-section-label text-gray-500">
                    Floor: {formatCurrency(session.metrics.priceFloor)}
                  </div>
                </div>

                {/* Concession Progress */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bloomberg-small-text font-medium text-gray-600">Concessions Made</span>
                    <span className="bloomberg-large-metric">📈</span>
                  </div>
                  <div className="bloomberg-card-title text-[#F59E0B]">
                    {currentSnapshot.totalConcessionSoFar.toFixed(1)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, currentSnapshot.totalConcessionSoFar)}%` }}
                    ></div>
                  </div>
                  <div className="bloomberg-section-label text-gray-500 mt-1">
                    of {session.metrics.totalConcessionPercentage.toFixed(1)}% total
                  </div>
                </div>

                {/* Emotional State */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bloomberg-small-text font-medium text-gray-600">Emotional State</span>
                    <span className="bloomberg-large-metric">😊</span>
                  </div>
                  <div className="bloomberg-card-title text-gray-800">
                    {currentSnapshot.emotionalState.replace(/_/g, ' ').split(' ').map(word =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </div>
                  <div className={`inline-block px-2 py-1 rounded bloomberg-section-label mt-2 ${emotionalColors[currentSnapshot.emotionalState]} border-l-0 border`}>
                    {currentSnapshot.emotionalState.toUpperCase()}
                  </div>
                </div>

                {/* Message Count */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bloomberg-small-text font-medium text-gray-600">Progress</span>
                    <span className="bloomberg-large-metric">💬</span>
                  </div>
                  <div className="bloomberg-card-title text-[#0EA5E9]">
                    {currentSnapshot.messageCount} / {messages.length}
                  </div>
                  <div className="bloomberg-small-text text-gray-600">
                    messages exchanged
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-[#0EA5E9] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentSnapshot.messageCount / messages.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Session Summary at Bottom */}
            <div className="mt-6 pt-4 border-t border-gray-300">
              <h4 className="bloomberg-small-text font-medium text-gray-600 mb-3">Final Outcome</h4>
              <div className="space-y-2 bloomberg-small-text">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rounds:</span>
                  <span className="font-medium">{session.metrics.totalRounds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Final Price:</span>
                  <span className="font-medium text-[#10B981]">{formatCurrency(session.metrics.finalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{session.metrics.duration.toFixed(1)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success:</span>
                  <span className={`font-medium ${session.metrics.outcomeSuccess ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {session.metrics.outcomeSuccess ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}