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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  useAdaptivePresentation,
  useEngagementMonitoring
} from './useAdaptivePresentation';
import {
  Play,
  Square,
  Users,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Eye,
  Settings,
  BarChart3,
  Zap,
  Target,
  ArrowRight,
  Download,
  RefreshCw,
  Lightbulb,
  Activity,
  Gauge,
  Timer,
  Volume2
} from 'lucide-react';

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
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
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

  return (
    <Card className={`${getPriorityColour(priority)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          <Badge variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'secondary'}>
            {priority.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <ArrowRight className="w-3 h-3 mt-1 text-slate-500 flex-shrink-0" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
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
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Attention</p>
              <p className="text-2xl font-bold">{metrics?.attentionLevel?.toFixed(1) || '0.0'}%</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
          <Progress value={metrics?.attentionLevel || 0} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Interaction</p>
              <p className="text-2xl font-bold">{metrics?.interactionRate?.toFixed(1) || '0.0'}/min</p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-2 flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              (metrics?.interactionRate || 0) > 1 ? 'bg-green-500' : 'bg-slate-300'
            }`} />
            <span className="text-xs text-slate-600">
              {(metrics?.interactionRate || 0) > 1 ? 'Active' : 'Low'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Comprehension</p>
              <p className="text-2xl font-bold">{metrics?.comprehensionScore?.toFixed(1) || '0.0'}%</p>
            </div>
            <Brain className="w-8 h-8 text-purple-500" />
          </div>
          <Progress value={metrics?.comprehensionScore || 0} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Questions</p>
              <p className="text-2xl font-bold">{metrics?.questionFrequency?.toFixed(1) || '0.0'}</p>
            </div>
            <Volume2 className="w-8 h-8 text-orange-500" />
          </div>
          <div className="mt-2 text-xs text-slate-600">
            per 5-minute window
          </div>
        </CardContent>
      </Card>
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
    { id: 'executive', label: 'Executive', icon: <Target className="w-4 h-4" />, colour: 'bg-blue-100 text-blue-700' },
    { id: 'technical', label: 'Technical', icon: <Settings className="w-4 h-4" />, colour: 'bg-green-100 text-green-700' },
    { id: 'compliance', label: 'Compliance', icon: <CheckCircle2 className="w-4 h-4" />, colour: 'bg-purple-100 text-purple-700' }
  ];

  return (
    <div className="flex gap-2">
      {audiences.map((audience) => (
        <Button
          key={audience.id}
          variant={currentAudience === audience.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onAudienceChange(audience.id as any)}
          disabled={disabled}
          className={`flex items-center gap-2 ${
            currentAudience === audience.id ? '' : audience.colour
          }`}
        >
          {audience.icon}
          {audience.label}
        </Button>
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
            <Button
              onClick={adaptivePresentation.endSession}
              variant="destructive"
              className="flex items-center gap-2"
              disabled={adaptivePresentation.isLoading}
            >
              <Square className="w-4 h-4" />
              End Session
            </Button>
          ) : (
            <Button
              onClick={() => adaptivePresentation.startSession()}
              className="flex items-center gap-2"
              disabled={adaptivePresentation.isLoading}
            >
              <Play className="w-4 h-4" />
              Start Session
            </Button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <Card>
        <CardContent className="p-4">
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
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">
                      {Math.floor(adaptivePresentation.presentationState?.elapsedTime || 0)}m
                    </span>
                  </div>
                </>
              )}

              {adaptivePresentation.apiResponseTime > 0 && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">
                      {adaptivePresentation.apiResponseTime.toFixed(0)}ms
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing || !adaptivePresentation.isSessionActive}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                disabled={!adaptivePresentation.presentationState}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {adaptivePresentation.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{adaptivePresentation.error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {adaptivePresentation.isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-slate-600">Processing adaptive presentation data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Content */}
      {adaptivePresentation.presentationState && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="adaptation" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Adaptation
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Flow
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Controls
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <MetricsPanel metrics={adaptivePresentation.presentationState.engagementMetrics} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Audience Type</span>
                    <Badge variant="secondary">
                      {adaptivePresentation.currentAudience.toUpperCase()}
                    </Badge>
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
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => handleEngagementSignal('attention_drop')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Record Attention Drop
                  </Button>

                  <Button
                    onClick={() => handleEngagementSignal('interest_spike')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Record Interest Spike
                  </Button>

                  <Button
                    onClick={() => handleEngagementSignal('confusion')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Record Confusion
                  </Button>

                  <Button
                    onClick={() => handleEngagementSignal('approval')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Record Approval
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {engagementMonitoring.engagementHistory.slice(-5).map((entry, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="text-xs text-slate-500 w-16">
                          {entry.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">Attention</span>
                            <Progress value={entry.attentionLevel} className="flex-1 h-2" />
                            <span className="text-xs text-slate-600 w-10">
                              {entry.attentionLevel.toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Comprehension</span>
                            <Progress value={entry.comprehensionScore} className="flex-1 h-2" />
                            <span className="text-xs text-slate-600 w-10">
                              {entry.comprehensionScore.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-600">Average Attention</div>
                    <div className="text-2xl font-bold">
                      {engagementMonitoring.averageAttention.toFixed(1)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-600">Trend</div>
                    <Badge variant={
                      engagementMonitoring.getEngagementTrend() === 'improving' ? 'default' :
                      engagementMonitoring.getEngagementTrend() === 'declining' ? 'destructive' : 'secondary'
                    }>
                      {engagementMonitoring.getEngagementTrend()}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-sm text-slate-600">Data Points</div>
                    <div className="text-lg font-semibold">
                      {engagementMonitoring.engagementHistory.length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Adaptation Tab */}
          <TabsContent value="adaptation" className="space-y-6">
            {adaptivePresentation.currentAdaptation && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdaptationCard
                  title="Content Adaptations"
                  suggestions={adaptivePresentation.currentAdaptation.adaptationSuggestions}
                  icon={<Brain className="w-5 h-5" />}
                  priority="high"
                />

                <AdaptationCard
                  title="Content Modifications"
                  suggestions={adaptivePresentation.currentAdaptation.contentModifications}
                  icon={<Settings className="w-5 h-5" />}
                  priority="medium"
                />

                <AdaptationCard
                  title="Pace Adjustments"
                  suggestions={adaptivePresentation.currentAdaptation.paceAdjustments}
                  icon={<Timer className="w-5 h-5" />}
                  priority="medium"
                />

                <AdaptationCard
                  title="Interaction Recommendations"
                  suggestions={adaptivePresentation.currentAdaptation.interactionRecommendations}
                  icon={<Users className="w-5 h-5" />}
                  priority="low"
                />
              </div>
            )}

            {!adaptivePresentation.currentAdaptation && (
              <Card>
                <CardContent className="p-8 text-center text-slate-600">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p>No adaptation recommendations available.</p>
                  <p className="text-sm">Start generating adaptations to see AI-powered suggestions.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Flow Tab */}
          <TabsContent value="flow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Presentation Flow Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Current Section</span>
                    <Badge variant="secondary">
                      {adaptivePresentation.presentationState.presentationFlow.currentSection}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Flow Health</span>
                    <Badge variant={
                      adaptivePresentation.presentationState.presentationFlow.flowHealth === 'excellent' ? 'default' :
                      adaptivePresentation.presentationState.presentationFlow.flowHealth === 'good' ? 'secondary' :
                      'destructive'
                    }>
                      {adaptivePresentation.presentationState.presentationFlow.flowHealth}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Estimated Time Remaining</span>
                    <span className="text-sm font-medium">
                      {adaptivePresentation.presentationState.presentationFlow.estimatedTimeRemaining} minutes
                    </span>
                  </div>
                </div>

                {adaptivePresentation.presentationState.presentationFlow.optimisationSuggestions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-slate-900 mb-3">Optimisation Suggestions</h4>
                    <ul className="space-y-2">
                      {adaptivePresentation.presentationState.presentationFlow.optimisationSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Lightbulb className="w-3 h-3 mt-1 text-yellow-500 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {adaptivePresentation.engagementAnalysis && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Generated Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {adaptivePresentation.engagementAnalysis.insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Eye className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
                          <span className="text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {adaptivePresentation.engagementAnalysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Next Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {adaptivePresentation.engagementAnalysis.nextActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="w-4 h-4 mt-1 text-orange-500 flex-shrink-0" />
                          <span className="text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {!adaptivePresentation.engagementAnalysis && (
              <Card>
                <CardContent className="p-8 text-center text-slate-600">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p>No insights available.</p>
                  <p className="text-sm">Generate engagement analysis to see AI-powered insights.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manual Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => adaptivePresentation.generateAdaptation({
                      currentSection: 'manual_trigger',
                      timeRemaining: 30,
                      engagementData: adaptivePresentation.presentationState?.engagementMetrics
                    })}
                    className="w-full justify-start"
                    disabled={adaptivePresentation.isLoading}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Adaptation
                  </Button>

                  <Button
                    onClick={() => adaptivePresentation.analyzeEngagement(
                      adaptivePresentation.presentationState?.engagementMetrics || {}
                    )}
                    className="w-full justify-start"
                    disabled={adaptivePresentation.isLoading}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyze Engagement
                  </Button>

                  <Button
                    onClick={() => adaptivePresentation.optimizeFlow({
                      currentSection: 'manual_optimization',
                      sectionProgress: 50,
                      totalSections: 5,
                      timeRemaining: 30
                    })}
                    className="w-full justify-start"
                    disabled={adaptivePresentation.isLoading}
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    Optimize Flow
                  </Button>

                  <Button
                    onClick={() => adaptivePresentation.generateInsights({
                      currentSection: 'manual_insights',
                      engagementData: adaptivePresentation.presentationState?.engagementMetrics
                    })}
                    className="w-full justify-start"
                    disabled={adaptivePresentation.isLoading}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Generate Insights
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cache Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  <Button
                    onClick={adaptivePresentation.clearCache}
                    variant="outline"
                    className="w-full"
                  >
                    Clear Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdaptivePresentationDashboard;