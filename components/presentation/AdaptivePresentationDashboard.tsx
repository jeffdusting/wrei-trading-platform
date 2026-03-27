/**
 * WREI Trading Platform - Stage 2 Component 4 Dashboard
 * Adaptive Presentation Dashboard Component
 *
 * Comprehensive dashboard for AI-powered presentation adaptation and monitoring.
 * Provides real-time engagement tracking, content adaptation recommendations,
 * and audience-specific personalisation for multi-stakeholder demonstrations.
 *
 * Features:
 * - Real-time engagement monitoring and visualisation
 * - AI-powered content adaptation with audience personalisation
 * - Presentation flow optimisation and pacing controls
 * - Interactive engagement tools and feedback integration
 * - Performance analytics and continuous improvement tracking
 * - Australian market context integration (NSW ESC trading)
 *
 * @version 1.0.0
 * @author Claude Sonnet 4 (Stage 2 Component 4 Dashboard Implementation)
 * @date 2026-03-26
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  useAdaptivePresentation,
  useEngagementMonitoring
} from './useAdaptivePresentation';
import {
  PlayIcon,
  StopIcon,
  UsersIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  CogIcon,
  PresentationChartBarIcon,
  BoltIcon,
  StarIcon,
  ArrowRightIcon,
  CloudArrowDownIcon,
  ArrowPathIcon,
  LightBulbIcon,
  HeartIcon,
  ClockIcon as TimerIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

/**
 * Props interface for the dashboard
 */
interface AdaptivePresentationDashboardProps {
  initialAudience?: 'executive' | 'technical' | 'compliance';
  autoStart?: boolean;
  showAdvancedMetrics?: boolean;
  className?: string;
}

/**
 * Engagement level indicator component
 */
const EngagementIndicator: React.FC<{
  level: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  className?: string;
}> = ({ level, trend, className = '' }) => {
  const getColour = (level: number) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default: return <HeartIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`text-2xl font-bold ${getColour(level)}`}>
        {level.toFixed(1)}%
      </div>
      {getTrendIcon(trend)}
    </div>
  );
};

/**
 * Adaptation suggestion card component
 */
const AdaptationCard: React.FC<{
  title: string;
  suggestions: string[];
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
}> = ({ title, suggestions, icon, priority }) => {
  const getPriorityColour = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-green-200 bg-green-50';
    }
  };

  const getBadgeColour = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className={`bg-white rounded-lg border p-6 ${getPriorityColour(priority)}`}>
      <div className="pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2 text-base font-semibold">
          {icon}
          {title}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColour(priority)}`}>
            {priority.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <ArrowRightIcon className="w-3 h-3 mt-1 text-slate-500 flex-shrink-0" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * Real-time metrics panel component
 */
const MetricsPanel: React.FC<{
  metrics: any;
  className?: string;
}> = ({ metrics, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Attention</p>
            <p className="text-2xl font-bold">{metrics?.attentionLevel?.toFixed(1) || '0.0'}%</p>
          </div>
          <EyeIcon className="w-8 h-8 text-blue-500" />
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${metrics?.attentionLevel || 0}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Interaction</p>
            <p className="text-2xl font-bold">{metrics?.interactionRate?.toFixed(1) || '0.0'}/min</p>
          </div>
          <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-500" />
        </div>
        <div className="mt-2 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            (metrics?.interactionRate || 0) > 1 ? 'bg-green-500' : 'bg-slate-300'
          }`} />
          <span className="text-xs text-slate-600">
            {(metrics?.interactionRate || 0) > 1 ? 'Active' : 'Low'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Comprehension</p>
            <p className="text-2xl font-bold">{metrics?.comprehensionScore?.toFixed(1) || '0.0'}%</p>
          </div>
          <CpuChipIcon className="w-8 h-8 text-purple-500" />
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${metrics?.comprehensionScore || 0}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Questions</p>
            <p className="text-2xl font-bold">{metrics?.questionFrequency?.toFixed(1) || '0.0'}</p>
          </div>
          <SpeakerWaveIcon className="w-8 h-8 text-orange-500" />
        </div>
        <div className="mt-2 text-xs text-slate-600">
          per 5-minute window
        </div>
      </div>
    </div>
  );
};

/**
 * Audience selector component
 */
const AudienceSelector: React.FC<{
  currentAudience: 'executive' | 'technical' | 'compliance';
  onAudienceChange: (audience: 'executive' | 'technical' | 'compliance') => void;
  disabled?: boolean;
}> = ({ currentAudience, onAudienceChange, disabled = false }) => {
  const audiences = [
    { id: 'executive', label: 'Executive', icon: <StarIcon className="w-4 h-4" />, colour: 'bg-blue-100 text-blue-700' },
    { id: 'technical', label: 'Technical', icon: <CogIcon className="w-4 h-4" />, colour: 'bg-green-100 text-green-700' },
    { id: 'compliance', label: 'Compliance', icon: <CheckCircleIcon className="w-4 h-4" />, colour: 'bg-purple-100 text-purple-700' }
  ];

  return (
    <div className="flex gap-2">
      {audiences.map((audience) => (
        <button
          key={audience.id}
          onClick={() => onAudienceChange(audience.id as any)}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
            currentAudience === audience.id
              ? 'bg-blue-600 text-white border-blue-600'
              : `${audience.colour} border-gray-300 hover:bg-gray-50`
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
        >
          {audience.icon}
          {audience.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Main Adaptive Presentation Dashboard Component
 */
export const AdaptivePresentationDashboard: React.FC<AdaptivePresentationDashboardProps> = ({
  initialAudience = 'executive',
  autoStart = false,
  showAdvancedMetrics = true,
  className = ''
}) => {
  // Hooks
  const adaptivePresentation = useAdaptivePresentation(initialAudience, true);
  const engagementMonitoring = useEngagementMonitoring(adaptivePresentation);

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Effects
  useEffect(() => {
    if (autoStart && !adaptivePresentation.isSessionActive) {
      adaptivePresentation.startSession(initialAudience);
    }
  }, [autoStart, initialAudience, adaptivePresentation]);

  // Update engagement monitoring when presentation state changes
  useEffect(() => {
    if (adaptivePresentation.presentationState?.engagementMetrics) {
      engagementMonitoring.recordEngagement(adaptivePresentation.presentationState.engagementMetrics);
    }
  }, [adaptivePresentation.presentationState?.engagementMetrics, engagementMonitoring]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await adaptivePresentation.analyzeEngagement(
        adaptivePresentation.presentationState?.engagementMetrics || {}
      );
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, adaptivePresentation]);

  /**
   * Handle question recording
   */
  const handleRecordQuestion = useCallback(async (
    question: string,
    complexity: 'basic' | 'intermediate' | 'advanced' = 'intermediate'
  ) => {
    await adaptivePresentation.recordQuestion(question, complexity);
  }, [adaptivePresentation]);

  /**
   * Handle engagement signal recording
   */
  const handleEngagementSignal = useCallback(async (
    signal: 'attention_drop' | 'interest_spike' | 'confusion' | 'approval'
  ) => {
    await adaptivePresentation.recordEngagementSignal(signal, activeTab);
  }, [adaptivePresentation, activeTab]);

  /**
   * Export session data
   */
  const handleExport = useCallback(() => {
    const exportData = {
      sessionState: adaptivePresentation.presentationState,
      adaptations: adaptivePresentation.currentAdaptation,
      analysis: adaptivePresentation.engagementAnalysis,
      optimization: adaptivePresentation.flowOptimization,
      engagementHistory: engagementMonitoring.engagementHistory,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adaptive-presentation-${adaptivePresentation.currentAudience}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [adaptivePresentation, engagementMonitoring]);

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Adaptive Presentation Control
          </h1>
          <p className="text-slate-600 mt-1">
            AI-powered presentation adaptation for NSW ESC trading demonstrations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AudienceSelector
            currentAudience={adaptivePresentation.currentAudience}
            onAudienceChange={adaptivePresentation.switchAudience}
            disabled={adaptivePresentation.isLoading}
          />

          {adaptivePresentation.isSessionActive ? (
            <button
              onClick={adaptivePresentation.endSession}
              disabled={adaptivePresentation.isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <StopIcon className="w-4 h-4" />
              End Session
            </button>
          ) : (
            <button
              onClick={() => adaptivePresentation.startSession()}
              disabled={adaptivePresentation.isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlayIcon className="w-4 h-4" />
              Start Session
            </button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-lg border">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  adaptivePresentation.isSessionActive ? 'bg-green-500' : 'bg-slate-400'
                }`} />
                <span className="text-sm font-medium">
                  {adaptivePresentation.isSessionActive ? 'Session Active' : 'Session Inactive'}
                </span>
              </div>

              {adaptivePresentation.isSessionActive && (
                <>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">
                      {Math.floor(adaptivePresentation.presentationState?.elapsedTime || 0)}m
                    </span>
                  </div>
                </>
              )}

              {adaptivePresentation.apiResponseTime > 0 && (
                <>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <BoltIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">
                      {adaptivePresentation.apiResponseTime.toFixed(0)}ms
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || !adaptivePresentation.isSessionActive}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={handleExport}
                disabled={!adaptivePresentation.presentationState}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CloudArrowDownIcon className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {adaptivePresentation.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg">
          <div className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{adaptivePresentation.error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {adaptivePresentation.isLoading && (
        <div className="bg-white border rounded-lg">
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-slate-600">Processing adaptive presentation data...</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      {adaptivePresentation.presentationState && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-6 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <PresentationChartBarIcon className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'engagement'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <HeartIcon className="w-4 h-4" />
              Engagement
            </button>
            <button
              onClick={() => setActiveTab('adaptation')}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'adaptation'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <CpuChipIcon className="w-4 h-4" />
              Adaptation
            </button>
            <button
              onClick={() => setActiveTab('flow')}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'flow'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <TimerIcon className="w-4 h-4" />
              Flow
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'insights'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LightBulbIcon className="w-4 h-4" />
              Insights
            </button>
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'controls'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <CogIcon className="w-4 h-4" />
              Controls
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <MetricsPanel metrics={adaptivePresentation.presentationState.engagementMetrics} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Status */}
                <div className="bg-white rounded-lg border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CpuChipIcon className="w-5 h-5" />
                      Current Status
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Audience Type</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {adaptivePresentation.currentAudience.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">System Health</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          adaptivePresentation.systemHealth === 'excellent' ? 'bg-green-500' :
                          adaptivePresentation.systemHealth === 'good' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm capitalize">{adaptivePresentation.systemHealth}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Engagement Level</span>
                      <EngagementIndicator
                        level={adaptivePresentation.engagementLevel}
                        trend={adaptivePresentation.presentationState.engagementMetrics.engagementTrend}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Adaptation Effectiveness</span>
                      <span className="text-sm font-medium">
                        {adaptivePresentation.presentationState.adaptationEffectiveness.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BoltIcon className="w-5 h-5" />
                      Quick Actions
                    </h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <button
                      onClick={() => handleEngagementSignal('attention_drop')}
                      className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <ArrowTrendingDownIcon className="w-4 h-4" />
                      Record Attention Drop
                    </button>

                    <button
                      onClick={() => handleEngagementSignal('interest_spike')}
                      className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <ArrowTrendingUpIcon className="w-4 h-4" />
                      Record Interest Spike
                    </button>

                    <button
                      onClick={() => handleEngagementSignal('confusion')}
                      className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Record Confusion
                    </button>

                    <button
                      onClick={() => handleEngagementSignal('approval')}
                      className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Record Approval
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Engagement Tab */}
          {activeTab === 'engagement' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Engagement Trends</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {engagementMonitoring.engagementHistory.slice(-5).map((entry, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="text-xs text-slate-500 w-16">
                            {entry.timestamp.toLocaleTimeString()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">Attention</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${entry.attentionLevel}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-600 w-10">
                                {entry.attentionLevel.toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Comprehension</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${entry.comprehensionScore}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-600 w-10">
                                {entry.comprehensionScore.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Engagement Summary</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="text-sm text-slate-600">Average Attention</div>
                      <div className="text-2xl font-bold">
                        {engagementMonitoring.averageAttention.toFixed(1)}%
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-600">Trend</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        engagementMonitoring.getEngagementTrend() === 'improving' ? 'bg-green-100 text-green-800' :
                        engagementMonitoring.getEngagementTrend() === 'declining' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {engagementMonitoring.getEngagementTrend()}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm text-slate-600">Data Points</div>
                      <div className="text-lg font-semibold">
                        {engagementMonitoring.engagementHistory.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Adaptation Tab */}
          {activeTab === 'adaptation' && (
            <div className="space-y-6">
              {adaptivePresentation.currentAdaptation && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AdaptationCard
                    title="Content Adaptations"
                    suggestions={adaptivePresentation.currentAdaptation.adaptationSuggestions}
                    icon={<CpuChipIcon className="w-5 h-5" />}
                    priority="high"
                  />

                  <AdaptationCard
                    title="Content Modifications"
                    suggestions={adaptivePresentation.currentAdaptation.contentModifications}
                    icon={<CogIcon className="w-5 h-5" />}
                    priority="medium"
                  />

                  <AdaptationCard
                    title="Pace Adjustments"
                    suggestions={adaptivePresentation.currentAdaptation.paceAdjustments}
                    icon={<TimerIcon className="w-5 h-5" />}
                    priority="medium"
                  />

                  <AdaptationCard
                    title="Interaction Recommendations"
                    suggestions={adaptivePresentation.currentAdaptation.interactionRecommendations}
                    icon={<UsersIcon className="w-5 h-5" />}
                    priority="low"
                  />
                </div>
              )}

              {!adaptivePresentation.currentAdaptation && (
                <div className="bg-white rounded-lg border">
                  <div className="p-8 text-center text-slate-600">
                    <CpuChipIcon className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p>No adaptation recommendations available.</p>
                    <p className="text-sm">Start generating adaptations to see AI-powered suggestions.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flow Tab */}
          {activeTab === 'flow' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">Presentation Flow Status</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Current Section</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {adaptivePresentation.presentationState?.presentationFlow?.currentSection || 'Unknown'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Flow Health</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        adaptivePresentation.presentationState?.presentationFlow?.flowHealth === 'excellent' ? 'bg-green-100 text-green-800' :
                        adaptivePresentation.presentationState?.presentationFlow?.flowHealth === 'good' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {adaptivePresentation.presentationState?.presentationFlow?.flowHealth || 'Unknown'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Estimated Time Remaining</span>
                      <span className="text-sm font-medium">
                        {adaptivePresentation.presentationState?.presentationFlow?.estimatedTimeRemaining || 0} minutes
                      </span>
                    </div>
                  </div>

                  {adaptivePresentation.presentationState?.presentationFlow?.optimisationSuggestions?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-slate-900 mb-3">Optimisation Suggestions</h4>
                      <ul className="space-y-2">
                        {adaptivePresentation.presentationState.presentationFlow.optimisationSuggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <LightBulbIcon className="w-3 h-3 mt-1 text-yellow-500 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {adaptivePresentation.engagementAnalysis && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-2">
                        {adaptivePresentation.engagementAnalysis.insights?.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <EyeIcon className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Recommendations</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-2">
                        {adaptivePresentation.engagementAnalysis.recommendations?.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <ArrowRightIcon className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Next Actions</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-2">
                        {adaptivePresentation.engagementAnalysis.nextActions?.map((action, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <StarIcon className="w-4 h-4 mt-1 text-orange-500 flex-shrink-0" />
                            <span className="text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {!adaptivePresentation.engagementAnalysis && (
                <div className="bg-white rounded-lg border">
                  <div className="p-8 text-center text-slate-600">
                    <LightBulbIcon className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p>No insights available.</p>
                    <p className="text-sm">Generate engagement analysis to see AI-powered insights.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controls Tab */}
          {activeTab === 'controls' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Manual Controls</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <button
                      onClick={() => adaptivePresentation.generateAdaptation({
                        currentSection: 'manual_trigger',
                        timeRemaining: 30,
                        engagementData: adaptivePresentation.presentationState?.engagementMetrics
                      })}
                      disabled={adaptivePresentation.isLoading}
                      className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CpuChipIcon className="w-4 h-4" />
                      Generate Adaptation
                    </button>

                    <button
                      onClick={() => adaptivePresentation.analyzeEngagement(
                        adaptivePresentation.presentationState?.engagementMetrics || {}
                      )}
                      disabled={adaptivePresentation.isLoading}
                      className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PresentationChartBarIcon className="w-4 h-4" />
                      Analyze Engagement
                    </button>

                    <button
                      onClick={() => adaptivePresentation.optimizeFlow({
                        currentSection: 'manual_optimization',
                        sectionProgress: 50,
                        totalSections: 5,
                        timeRemaining: 30
                      })}
                      disabled={adaptivePresentation.isLoading}
                      className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <TimerIcon className="w-4 h-4" />
                      Optimize Flow
                    </button>

                    <button
                      onClick={() => adaptivePresentation.generateInsights({
                        currentSection: 'manual_insights',
                        engagementData: adaptivePresentation.presentationState?.engagementMetrics
                      })}
                      disabled={adaptivePresentation.isLoading}
                      className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <LightBulbIcon className="w-4 h-4" />
                      Generate Insights
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Cache Management</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cache Status</span>
                        <span className={adaptivePresentation.cacheAge > 0 ? 'text-green-600' : 'text-slate-600'}>
                          {adaptivePresentation.cacheAge > 0 ? 'Active' : 'Empty'}
                        </span>
                      </div>

                      {adaptivePresentation.cacheAge > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Cache Age</span>
                          <span className="text-slate-600">
                            {Math.floor(adaptivePresentation.cacheAge / 1000)}s
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={adaptivePresentation.clearCache}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdaptivePresentationDashboard;