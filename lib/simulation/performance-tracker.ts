/**
 * WREI Performance Tracking System
 * Monitors user engagement, completion metrics, and simulation effectiveness
 * Version: 6.3.0
 */

export interface PerformanceSession {
  sessionId: string;
  scenarioId: string;
  userId: string;
  persona: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'abandoned' | 'error';
  metrics: SessionMetrics;
  interactions: UserInteraction[];
  milestones: MilestoneEvent[];
  feedback?: UserFeedback;
}

export interface SessionMetrics {
  totalDuration: number;
  activeTime: number;
  idleTime: number;
  stepsCompleted: number;
  totalSteps: number;
  completionRate: number;
  errorCount: number;
  assistanceRequested: number;
  averageStepTime: number;
  engagementScore: number;
  satisfactionScore?: number;
  efficiency: EfficiencyMetrics;
  technical: TechnicalMetrics;
}

export interface EfficiencyMetrics {
  clicksPerStep: number;
  timeToFirstMeaningfulAction: number;
  backtrackCount: number;
  optimalPathDeviation: number;
  taskSwitchingFrequency: number;
}

export interface TechnicalMetrics {
  avgResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  apiCallCount: number;
  renderingPerformance: number;
}

export interface UserInteraction {
  timestamp: Date;
  type: 'click' | 'input' | 'navigation' | 'api_call' | 'export' | 'search';
  target: string;
  value?: any;
  context: {
    stepId: string;
    phase: string;
    timeFromStepStart: number;
  };
  metadata?: Record<string, any>;
}

export interface MilestoneEvent {
  id: string;
  name: string;
  timestamp: Date;
  timeFromStart: number;
  significance: 'minor' | 'major' | 'critical';
  data?: any;
}

export interface UserFeedback {
  overallSatisfaction: number; // 1-10
  difficultyRating: number;    // 1-10
  realismRating: number;       // 1-10
  usefulnessRating: number;    // 1-10
  comments?: string;
  improvements?: string[];
  likedFeatures?: string[];
}

export interface AggregateAnalytics {
  scenarioId: string;
  totalSessions: number;
  completionStats: {
    completed: number;
    abandoned: number;
    avgCompletionTime: number;
    completionRateByPersona: Record<string, number>;
  };
  performanceStats: {
    avgEngagementScore: number;
    avgSatisfactionScore: number;
    avgEfficiencyScore: number;
    commonDropOffPoints: Array<{
      stepId: string;
      abandonmentRate: number;
    }>;
  };
  usagePatterns: {
    peakUsageTimes: Array<{ hour: number; sessionCount: number }>;
    avgSessionsPerUser: number;
    returnUserRate: number;
  };
  technicalStats: {
    avgResponseTime: number;
    errorRate: number;
    mostUsedFeatures: Array<{ feature: string; usage: number }>;
  };
  improvements: {
    recommendedOptimizations: string[];
    userRequestedFeatures: string[];
    criticalIssues: string[];
  };
}

export class PerformanceTracker {
  private sessions: Map<string, PerformanceSession>;
  private aggregateData: Map<string, AggregateAnalytics>;
  private realTimeMetrics: Map<string, any>;

  constructor() {
    this.sessions = new Map();
    this.aggregateData = new Map();
    this.realTimeMetrics = new Map();
  }

  // Session Management
  public startSession(scenarioId: string, persona: string, userId?: string): string {
    const sessionId = this.generateSessionId();
    const session: PerformanceSession = {
      sessionId,
      scenarioId,
      userId: userId || `anon_${Date.now()}`,
      persona,
      startTime: new Date(),
      status: 'active',
      metrics: this.initializeMetrics(),
      interactions: [],
      milestones: []
    };

    this.sessions.set(sessionId, session);
    this.recordMilestone(sessionId, 'session_started', 'major');

    return sessionId;
  }

  public endSession(
    sessionId: string,
    status: 'completed' | 'abandoned' | 'error',
    feedback?: UserFeedback
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.endTime = new Date();
    session.status = status;
    session.feedback = feedback;

    // Calculate final metrics
    this.calculateFinalMetrics(session);
    this.recordMilestone(sessionId, 'session_ended', 'critical');

    // Update aggregate data
    this.updateAggregateAnalytics(session);

    console.log(`Session ${sessionId} ended with status: ${status}`);
  }

  // Interaction Tracking
  public recordInteraction(
    sessionId: string,
    type: UserInteraction['type'],
    target: string,
    value?: any,
    metadata?: Record<string, any>
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const currentStep = this.getCurrentStep(session);
    const interaction: UserInteraction = {
      timestamp: new Date(),
      type,
      target,
      value,
      context: {
        stepId: currentStep.id,
        phase: currentStep.phase,
        timeFromStepStart: Date.now() - currentStep.startTime
      },
      metadata
    };

    session.interactions.push(interaction);
    this.updateEngagementScore(session, interaction);
  }

  // Performance Measurement
  public recordPerformanceMetric(
    sessionId: string,
    metric: keyof TechnicalMetrics,
    value: number
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.metrics.technical[metric] = value;
    this.updateRealTimeMetrics(sessionId, metric, value);
  }

  public recordStepCompletion(
    sessionId: string,
    stepId: string,
    duration: number,
    success: boolean
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (success) {
      session.metrics.stepsCompleted++;
      session.metrics.averageStepTime = this.calculateAverageStepTime(session);
      this.recordMilestone(sessionId, `step_completed_${stepId}`, 'minor', { duration });
    } else {
      session.metrics.errorCount++;
    }

    this.updateCompletionRate(session);
  }

  // Milestone Tracking
  public recordMilestone(
    sessionId: string,
    name: string,
    significance: MilestoneEvent['significance'],
    data?: any
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const milestone: MilestoneEvent = {
      id: `${sessionId}_${name}_${Date.now()}`,
      name,
      timestamp: new Date(),
      timeFromStart: Date.now() - session.startTime.getTime(),
      significance,
      data
    };

    session.milestones.push(milestone);

    // Log significant milestones
    if (significance === 'critical' || significance === 'major') {
      console.log(`Milestone reached: ${name} (${significance}) - Session: ${sessionId}`);
    }
  }

  // Analytics and Reporting
  public getSessionAnalytics(sessionId: string): PerformanceSession | null {
    return this.sessions.get(sessionId) || null;
  }

  public getAggregateAnalytics(scenarioId: string): AggregateAnalytics | null {
    return this.aggregateData.get(scenarioId) || null;
  }

  public generatePerformanceReport(scenarioId: string): PerformanceReport {
    const aggregate = this.aggregateData.get(scenarioId);
    const sessions = Array.from(this.sessions.values())
      .filter(s => s.scenarioId === scenarioId);

    return {
      scenarioId,
      reportDate: new Date(),
      summary: this.generateSummaryStats(sessions),
      detailedMetrics: aggregate,
      recommendations: this.generateRecommendations(sessions),
      trends: this.analyzeTrends(sessions),
      benchmarks: this.getBenchmarkComparisons(scenarioId)
    };
  }

  public getRealTimeMetrics(sessionId: string): RealTimeMetrics {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    const currentTime = Date.now();
    const sessionDuration = currentTime - session.startTime.getTime();

    return {
      sessionId,
      duration: sessionDuration,
      stepsCompleted: session.metrics.stepsCompleted,
      totalSteps: session.metrics.totalSteps,
      progressPercentage: (session.metrics.stepsCompleted / session.metrics.totalSteps) * 100,
      engagementScore: session.metrics.engagementScore,
      currentPhase: this.getCurrentPhase(session),
      recentInteractions: session.interactions.slice(-5),
      estimatedTimeRemaining: this.estimateTimeRemaining(session),
      performanceIndicators: {
        efficiency: this.calculateEfficiencyScore(session),
        accuracy: this.calculateAccuracyScore(session),
        engagement: session.metrics.engagementScore
      }
    };
  }

  // Optimization and Insights
  public getOptimizationSuggestions(scenarioId: string): OptimizationSuggestion[] {
    const aggregate = this.aggregateData.get(scenarioId);
    if (!aggregate) return [];

    const suggestions: OptimizationSuggestion[] = [];

    // Check completion rate
    const completionRate = aggregate.completionStats.completed / aggregate.totalSessions;
    if (completionRate < 0.8) {
      suggestions.push({
        type: 'completion_rate',
        priority: 'high',
        issue: `Low completion rate (${(completionRate * 100).toFixed(1)}%)`,
        recommendation: 'Review common drop-off points and simplify complex steps',
        expectedImpact: 'Increase completion rate by 15-20%'
      });
    }

    // Check average engagement
    if (aggregate.performanceStats.avgEngagementScore < 70) {
      suggestions.push({
        type: 'engagement',
        priority: 'medium',
        issue: 'Low user engagement scores',
        recommendation: 'Add more interactive elements and real-time feedback',
        expectedImpact: 'Improve user satisfaction and retention'
      });
    }

    // Check technical performance
    if (aggregate.technicalStats.avgResponseTime > 2000) {
      suggestions.push({
        type: 'performance',
        priority: 'high',
        issue: 'Slow API response times',
        recommendation: 'Optimize API calls and implement better caching',
        expectedImpact: 'Reduce response time by 40-50%'
      });
    }

    return suggestions;
  }

  // Private Helper Methods
  private generateSessionId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private initializeMetrics(): SessionMetrics {
    return {
      totalDuration: 0,
      activeTime: 0,
      idleTime: 0,
      stepsCompleted: 0,
      totalSteps: 10, // Default, will be updated
      completionRate: 0,
      errorCount: 0,
      assistanceRequested: 0,
      averageStepTime: 0,
      engagementScore: 100,
      efficiency: {
        clicksPerStep: 0,
        timeToFirstMeaningfulAction: 0,
        backtrackCount: 0,
        optimalPathDeviation: 0,
        taskSwitchingFrequency: 0
      },
      technical: {
        avgResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
        apiCallCount: 0,
        renderingPerformance: 0
      }
    };
  }

  private calculateFinalMetrics(session: PerformanceSession): void {
    if (!session.endTime) return;

    session.metrics.totalDuration = session.endTime.getTime() - session.startTime.getTime();
    session.metrics.completionRate = session.metrics.stepsCompleted / session.metrics.totalSteps;

    // Calculate efficiency metrics
    const totalClicks = session.interactions.filter(i => i.type === 'click').length;
    session.metrics.efficiency.clicksPerStep = totalClicks / Math.max(1, session.metrics.stepsCompleted);

    // Calculate first meaningful action time
    const firstMeaningfulAction = session.interactions.find(i =>
      i.type === 'click' || i.type === 'input' || i.type === 'navigation'
    );
    if (firstMeaningfulAction) {
      session.metrics.efficiency.timeToFirstMeaningfulAction =
        firstMeaningfulAction.timestamp.getTime() - session.startTime.getTime();
    }
  }

  private updateEngagementScore(session: PerformanceSession, interaction: UserInteraction): void {
    // Positive engagement indicators
    if (interaction.type === 'input' || interaction.type === 'search') {
      session.metrics.engagementScore = Math.min(100, session.metrics.engagementScore + 1);
    }

    // Negative engagement indicators
    if (interaction.context.timeFromStepStart > 300000) { // 5 minutes on one step
      session.metrics.engagementScore = Math.max(0, session.metrics.engagementScore - 5);
    }
  }

  private getCurrentStep(session: PerformanceSession): any {
    // Mock current step - in real implementation, this would come from ScenarioEngine
    return {
      id: `step_${session.metrics.stepsCompleted}`,
      phase: 'analysis',
      startTime: Date.now() - 60000 // 1 minute ago
    };
  }

  private getCurrentPhase(session: PerformanceSession): string {
    return this.getCurrentStep(session).phase;
  }

  private calculateAverageStepTime(session: PerformanceSession): number {
    const completedSteps = session.milestones.filter(m => m.name.startsWith('step_completed_'));
    if (completedSteps.length === 0) return 0;

    const totalTime = completedSteps.reduce((sum, step) => sum + (step.data?.duration || 0), 0);
    return totalTime / completedSteps.length;
  }

  private updateCompletionRate(session: PerformanceSession): void {
    session.metrics.completionRate = session.metrics.stepsCompleted / session.metrics.totalSteps;
  }

  private updateRealTimeMetrics(sessionId: string, metric: string, value: number): void {
    if (!this.realTimeMetrics.has(sessionId)) {
      this.realTimeMetrics.set(sessionId, {});
    }

    const metrics = this.realTimeMetrics.get(sessionId);
    metrics[metric] = value;
    metrics.lastUpdated = Date.now();
  }

  private updateAggregateAnalytics(session: PerformanceSession): void {
    const scenarioId = session.scenarioId;
    let aggregate = this.aggregateData.get(scenarioId);

    if (!aggregate) {
      aggregate = this.initializeAggregateAnalytics(scenarioId);
    }

    // Update stats
    aggregate.totalSessions++;

    if (session.status === 'completed') {
      aggregate.completionStats.completed++;
    } else if (session.status === 'abandoned') {
      aggregate.completionStats.abandoned++;
    }

    // Update averages
    this.updateAverageMetrics(aggregate, session);

    this.aggregateData.set(scenarioId, aggregate);
  }

  private initializeAggregateAnalytics(scenarioId: string): AggregateAnalytics {
    return {
      scenarioId,
      totalSessions: 0,
      completionStats: {
        completed: 0,
        abandoned: 0,
        avgCompletionTime: 0,
        completionRateByPersona: {}
      },
      performanceStats: {
        avgEngagementScore: 0,
        avgSatisfactionScore: 0,
        avgEfficiencyScore: 0,
        commonDropOffPoints: []
      },
      usagePatterns: {
        peakUsageTimes: [],
        avgSessionsPerUser: 0,
        returnUserRate: 0
      },
      technicalStats: {
        avgResponseTime: 0,
        errorRate: 0,
        mostUsedFeatures: []
      },
      improvements: {
        recommendedOptimizations: [],
        userRequestedFeatures: [],
        criticalIssues: []
      }
    };
  }

  private updateAverageMetrics(aggregate: AggregateAnalytics, session: PerformanceSession): void {
    const currentAvgEngagement = aggregate.performanceStats.avgEngagementScore;
    const newAvgEngagement = (currentAvgEngagement * (aggregate.totalSessions - 1) + session.metrics.engagementScore) / aggregate.totalSessions;
    aggregate.performanceStats.avgEngagementScore = Number(newAvgEngagement.toFixed(2));

    if (session.feedback?.overallSatisfaction) {
      const currentAvgSatisfaction = aggregate.performanceStats.avgSatisfactionScore;
      const newAvgSatisfaction = (currentAvgSatisfaction * (aggregate.totalSessions - 1) + session.feedback.overallSatisfaction) / aggregate.totalSessions;
      aggregate.performanceStats.avgSatisfactionScore = Number(newAvgSatisfaction.toFixed(2));
    }
  }

  private generateSummaryStats(sessions: PerformanceSession[]): any {
    return {
      totalSessions: sessions.length,
      completionRate: sessions.filter(s => s.status === 'completed').length / sessions.length,
      averageDuration: sessions.reduce((sum, s) => sum + (s.metrics.totalDuration || 0), 0) / sessions.length,
      averageEngagement: sessions.reduce((sum, s) => sum + s.metrics.engagementScore, 0) / sessions.length
    };
  }

  private generateRecommendations(sessions: PerformanceSession[]): string[] {
    const recommendations: string[] = [];

    const completionRate = sessions.filter(s => s.status === 'completed').length / sessions.length;
    if (completionRate < 0.7) {
      recommendations.push('Improve onboarding flow to reduce early abandonment');
    }

    const avgEngagement = sessions.reduce((sum, s) => sum + s.metrics.engagementScore, 0) / sessions.length;
    if (avgEngagement < 70) {
      recommendations.push('Add more interactive elements to maintain user engagement');
    }

    return recommendations;
  }

  private analyzeTrends(sessions: PerformanceSession[]): any {
    // Simple trend analysis - in production, this would be more sophisticated
    return {
      completionRateTrend: 'stable',
      engagementTrend: 'improving',
      technicalPerformanceTrend: 'stable'
    };
  }

  private getBenchmarkComparisons(scenarioId: string): any {
    // Industry benchmarks - would come from external sources in production
    return {
      industryAverageCompletion: 0.75,
      industryAverageEngagement: 72,
      industryAverageSatisfaction: 7.2
    };
  }

  private estimateTimeRemaining(session: PerformanceSession): number {
    const avgStepTime = session.metrics.averageStepTime || 120000; // 2 minutes default
    const remainingSteps = session.metrics.totalSteps - session.metrics.stepsCompleted;
    return remainingSteps * avgStepTime;
  }

  private calculateEfficiencyScore(session: PerformanceSession): number {
    const baseScore = 100;
    const penalty = session.metrics.efficiency.backtrackCount * 5 +
                   (session.metrics.efficiency.clicksPerStep - 5) * 2;
    return Math.max(0, baseScore - penalty);
  }

  private calculateAccuracyScore(session: PerformanceSession): number {
    const totalActions = session.interactions.length;
    const errorRate = session.metrics.errorCount / Math.max(1, totalActions);
    return Math.max(0, 100 - (errorRate * 100));
  }
}

// Supporting interfaces
export interface PerformanceReport {
  scenarioId: string;
  reportDate: Date;
  summary: any;
  detailedMetrics?: AggregateAnalytics;
  recommendations: string[];
  trends: any;
  benchmarks: any;
}

export interface RealTimeMetrics {
  sessionId?: string;
  duration?: number;
  stepsCompleted?: number;
  totalSteps?: number;
  progressPercentage?: number;
  engagementScore?: number;
  currentPhase?: string;
  recentInteractions?: UserInteraction[];
  estimatedTimeRemaining?: number;
  performanceIndicators?: {
    efficiency: number;
    accuracy: number;
    engagement: number;
  };
  error?: string;
}

export interface OptimizationSuggestion {
  type: 'completion_rate' | 'engagement' | 'performance' | 'usability';
  priority: 'low' | 'medium' | 'high';
  issue: string;
  recommendation: string;
  expectedImpact: string;
}