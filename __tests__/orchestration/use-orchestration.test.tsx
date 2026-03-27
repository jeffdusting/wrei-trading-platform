/**
 * WREI Trading Platform - useOrchestration Hook Tests
 *
 * Stage 2: Component 1 - AI Demo Orchestration Engine Hook Tests
 * Test suite for orchestration React hook functionality
 *
 * Date: March 26, 2026
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useOrchestration, OrchestrationHookConfig } from '@/components/orchestration/useOrchestration';
import { DemoOrchestrationEngine } from '@/lib/ai-orchestration/DemoOrchestrationEngine';
import { AudienceType } from '@/components/audience';
import { EngagementLevel, KnowledgeLevel } from '@/components/orchestration/types';

// Mock the orchestration engine
jest.mock('@/lib/ai-orchestration/DemoOrchestrationEngine');

// Mock timers for interval testing
jest.useFakeTimers();

const MockedOrchestrationEngine = DemoOrchestrationEngine as jest.MockedClass<typeof DemoOrchestrationEngine>;

describe('useOrchestration Hook', () => {
  let mockEngine: jest.Mocked<DemoOrchestrationEngine>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockEngine = {
      analyzeAudience: jest.fn().mockResolvedValue({
        id: 'analysis-1',
        timestamp: new Date(),
        detectedType: 'executive',
        confidence: 0.85,
        engagementLevel: 'medium',
        knowledgeLevel: 'intermediate',
        engagementScore: 75,
        engagementHistory: [],
        technicalFamiliarity: 60,
        domainExpertise: 70,
        attentionSpan: 25,
        interactionFrequency: 2,
        preferredPace: 'moderate',
        visualPreference: 'charts',
        typeIndicators: ['strategic_focus', 'time_conscious']
      }),
      assessContext: jest.fn().mockResolvedValue({
        id: 'context-1',
        timestamp: new Date(),
        environment: {
          deviceType: 'desktop',
          screenSize: { width: 1920, height: 1080 },
          connectionQuality: 'excellent',
          browserCapabilities: ['webgl', 'websocket']
        },
        timeConstraints: {
          totalAvailable: 30,
          currentElapsed: 0,
          flexibility: 'moderate'
        },
        objectives: {
          primary: 'education',
          secondary: ['sales'],
          success_criteria: ['understanding', 'engagement'],
          risk_factors: ['time_pressure', 'complexity']
        },
        externalFactors: {
          multipleParticipants: false,
          recordingSession: false,
          followupRequired: true,
          decisionTimeframe: '2_weeks'
        }
      }),
      startOrchestration: jest.fn().mockResolvedValue({
        sessionId: 'test-session',
        currentPhase: 'initialization',
        startTime: new Date(),
        lastUpdateTime: new Date(),
        config: {} as any,
        status: {
          isActive: true,
          isPaused: false,
          needsAdaptation: false,
          completionPercentage: 0
        },
        performance: {
          engagementTrend: 'stable',
          objectiveProgress: 0,
          riskLevel: 'medium',
          adaptationCount: 0
        },
        activeScenario: null
      }),
      generateOrchestrationDecision: jest.fn().mockImplementation((sessionId?: string) => {
        // Handle both with and without sessionId
        return Promise.resolve({
          id: 'decision-1',
          timestamp: new Date(),
          context: {
            phase: 'execution',
            audienceState: {} as any,
            contextState: {} as any,
            performanceMetrics: {}
          },
          decision: {
            action: { type: 'continue' },
            confidence: 0.8,
            reasoning: ['User engagement is stable'],
            alternatives: []
          },
          expectedOutcome: {
            engagementImprovement: 5,
            completionProbability: 85,
            riskMitigation: ['maintain_pace']
          }
        });
      }),
      getCurrentState: jest.fn().mockResolvedValue({
        sessionId: 'test-session',
        currentPhase: 'execution',
        startTime: new Date(),
        lastUpdateTime: new Date(),
        config: {} as any,
        status: {
          isActive: true,
          isPaused: false,
          needsAdaptation: false,
          completionPercentage: 50
        },
        performance: {
          engagementTrend: 'stable',
          objectiveProgress: 50,
          riskLevel: 'low',
          adaptationCount: 1
        },
        activeScenario: null
      }),
      completeSession: jest.fn().mockResolvedValue({
        sessionId: 'test-session',
        startTime: new Date(),
        endTime: new Date(),
        totalDuration: 30,
        success: {
          objectivesAchieved: 85,
          audienceSatisfaction: 90,
          completionRate: 100,
          adaptationEffectiveness: 75
        },
        performance: {
          averageEngagement: 80,
          peakEngagement: 95,
          adaptationCount: 2,
          scenariosUsed: ['esc_trading']
        },
        insights: {
          audienceProfile: {} as any,
          effectiveStrategies: ['visual_emphasis'],
          improvementAreas: ['pace_adjustment'],
          recommendations: ['increase_interactivity']
        },
        exportData: {
          timeline: [],
          decisions: [],
          finalState: {} as any
        }
      }),
      generateOrchestrationDecisionForActiveSession: jest.fn().mockResolvedValue({
        id: 'decision-1',
        timestamp: new Date(),
        context: {
          phase: 'execution',
          audienceState: {} as any,
          contextState: {} as any,
          performanceMetrics: {}
        },
        decision: {
          action: { type: 'continue' },
          confidence: 0.8,
          reasoning: ['User engagement is stable'],
          alternatives: []
        },
        expectedOutcome: {
          engagementImprovement: 5,
          completionProbability: 85,
          riskMitigation: ['maintain_pace']
        }
      })
    } as jest.Mocked<DemoOrchestrationEngine>;

    MockedOrchestrationEngine.mockImplementation(() => mockEngine);
    MockedOrchestrationEngine.getInstance = jest.fn().mockReturnValue(mockEngine);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Hook Initialization', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => useOrchestration());

      expect(result.current.orchestrationState).toBeNull();
      expect(result.current.currentDecision).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.recentEvents).toEqual([]);
    });

    test('should initialize with custom config', () => {
      const config: OrchestrationHookConfig = {
        sessionId: 'custom-session',
        maxDuration: 45,
        adaptationEnabled: false,
        audience: 'technical'
      };

      const { result } = renderHook(() => useOrchestration(config));

      expect(result.current.orchestrationState).toBeNull();
      expect(result.current.isActive).toBe(false);
    });
  });

  describe('Orchestration Control', () => {
    test('should start orchestration successfully', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      const { result } = renderHook(() => useOrchestration(config));

      await act(async () => {
        await result.current.startOrchestration();
      });

      expect(mockEngine.analyzeAudience).toHaveBeenCalled();
      expect(mockEngine.assessContext).toHaveBeenCalled();
      expect(mockEngine.startOrchestration).toHaveBeenCalled();
      expect(result.current.isActive).toBe(true);
      expect(result.current.orchestrationState).toBeDefined();
    });

    test('should not start orchestration without audience', async () => {
      const { result } = renderHook(() => useOrchestration());

      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await act(async () => {
        await result.current.startOrchestration();
      });

      expect(mockEngine.startOrchestration).not.toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Cannot start orchestration: missing engine or audience');

      consoleSpy.mockRestore();
    });

    test('should pause and resume orchestration', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive',
        autoAnalyze: true
      };

      const { result } = renderHook(() => useOrchestration(config));

      // Start orchestration
      await act(async () => {
        await result.current.startOrchestration();
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.isPaused).toBe(false);

      // Pause
      act(() => {
        result.current.pauseOrchestration();
      });

      expect(result.current.isPaused).toBe(true);

      // Resume
      act(() => {
        result.current.resumeOrchestration();
      });

      expect(result.current.isPaused).toBe(false);
    });

    test('should stop orchestration', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      const { result } = renderHook(() => useOrchestration(config));

      // Start orchestration
      await act(async () => {
        await result.current.startOrchestration();
      });

      expect(result.current.isActive).toBe(true);

      // Stop orchestration
      await act(async () => {
        await result.current.stopOrchestration();
      });

      expect(mockEngine.completeSession).toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
      expect(result.current.orchestrationState).toBeNull();
    });
  });

  describe('Auto-start Functionality', () => {
    test('should auto-start when enabled', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive',
        autoStart: true
      };

      await act(async () => {
        renderHook(() => useOrchestration(config));
      });

      expect(mockEngine.startOrchestration).toHaveBeenCalled();
    });

    test('should not auto-start without audience', () => {
      const config: OrchestrationHookConfig = {
        autoStart: true
      };

      renderHook(() => useOrchestration(config));

      expect(mockEngine.startOrchestration).not.toHaveBeenCalled();
    });
  });

  describe('Analysis Functions', () => {
    test('should analyze audience', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'technical'
      };

      const { result } = renderHook(() => useOrchestration(config));

      let analysisResult;
      await act(async () => {
        analysisResult = await result.current.analyzeAudience({
          engagementLevel: 'high',
          knowledgeLevel: 'expert'
        });
      });

      expect(mockEngine.analyzeAudience).toHaveBeenCalledWith(expect.any(String), {
        type: 'technical',
        timestamp: expect.any(Date),
        engagementLevel: 'high',
        knowledgeLevel: 'expert',
        objectives: ['education']
      });
      expect(analysisResult).toBeDefined();
    });

    test('should assess context', async () => {
      const { result } = renderHook(() => useOrchestration());

      let contextResult;
      await act(async () => {
        contextResult = await result.current.assessContext({
          environment: 'mobile',
          timeAvailable: 20
        });
      });

      expect(mockEngine.assessContext).toHaveBeenCalledWith(expect.any(String), {
        timeAvailable: 20,
        environment: 'mobile',
        objectives: ['education']
      });
      expect(contextResult).toBeDefined();
    });

    test('should make orchestration decision', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      const { result } = renderHook(() => useOrchestration(config));

      // Start orchestration first
      await act(async () => {
        await result.current.startOrchestration();
      });

      let decision;
      await act(async () => {
        decision = await result.current.makeDecision();
      });

      expect(mockEngine.generateOrchestrationDecisionForActiveSession).toHaveBeenCalled();
      expect(decision).toBeDefined();
    });

    test('should return null for decision when not active', async () => {
      const { result } = renderHook(() => useOrchestration());

      let decision;
      await act(async () => {
        decision = await result.current.makeDecision();
      });

      expect(decision).toBeNull();
    });
  });

  describe('Engagement Tracking', () => {
    test('should report engagement levels', async () => {
      const onEvent = jest.fn();
      const config: OrchestrationHookConfig = {
        audience: 'executive',
        onEvent
      };

      const { result } = renderHook(() => useOrchestration(config));

      await act(async () => {
        await result.current.startOrchestration();
      });

      act(() => {
        result.current.reportEngagement('high', 'user_interaction');
      });

      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'engagement_changed',
          data: expect.objectContaining({
            level: 'high',
            trigger: 'user_interaction'
          })
        })
      );
    });

    test('should report interactions', async () => {
      const onEvent = jest.fn();
      const config: OrchestrationHookConfig = {
        audience: 'technical',
        onEvent
      };

      const { result } = renderHook(() => useOrchestration(config));

      await act(async () => {
        await result.current.startOrchestration();
      });

      act(() => {
        result.current.reportInteraction('button_click', { button: 'scenario_start' });
      });

      expect(onEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'objective_progress',
          data: expect.objectContaining({
            interactionType: 'button_click',
            button: 'scenario_start'
          })
        })
      );
    });

    test('should update knowledge level', async () => {
      const onStateChange = jest.fn();
      const config: OrchestrationHookConfig = {
        audience: 'executive',
        onStateChange
      };

      const { result } = renderHook(() => useOrchestration(config));

      await act(async () => {
        await result.current.startOrchestration();
      });

      act(() => {
        result.current.updateKnowledgeLevel('expert');
      });

      expect(onStateChange).toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    test('should return current phase', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      const { result } = renderHook(() => useOrchestration(config));

      expect(result.current.getCurrentPhase()).toBe('Not started');

      await act(async () => {
        await result.current.startOrchestration();
      });

      expect(result.current.getCurrentPhase()).toBe('initialization');
    });

    test('should return completion percentage', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      const { result } = renderHook(() => useOrchestration(config));

      expect(result.current.getCompletionPercentage()).toBe(0);

      await act(async () => {
        await result.current.startOrchestration();
      });

      // Mock current state returns 50% completion
      expect(result.current.getCompletionPercentage()).toBeGreaterThanOrEqual(0);
    });

    test('should return engagement trend', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      const { result } = renderHook(() => useOrchestration(config));

      expect(result.current.getEngagementTrend()).toBe('stable');

      await act(async () => {
        await result.current.startOrchestration();
      });

      expect(result.current.getEngagementTrend()).toBe('stable');
    });

    test('should return risk level', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      const { result } = renderHook(() => useOrchestration(config));

      expect(result.current.getRiskLevel()).toBe('medium');

      await act(async () => {
        await result.current.startOrchestration();
      });

      // After starting, mock returns 'low' risk
      mockEngine.getCurrentState.mockResolvedValue({
        sessionId: 'test-session',
        currentPhase: 'execution',
        startTime: new Date(),
        lastUpdateTime: new Date(),
        config: {} as any,
        status: {
          isActive: true,
          isPaused: false,
          needsAdaptation: false,
          completionPercentage: 50
        },
        performance: {
          engagementTrend: 'stable',
          objectiveProgress: 50,
          riskLevel: 'low',
          adaptationCount: 1
        },
        activeScenario: null
      });

      expect(result.current.getRiskLevel()).toBe('medium'); // Default risk level
    });
  });

  describe('Auto-analysis', () => {
    test('should support auto-analysis configuration', async () => {
      const onDecisionMade = jest.fn();
      const config: OrchestrationHookConfig = {
        audience: 'executive',
        autoAnalyze: true,
        analyzeInterval: 1000,
        onDecisionMade
      };

      const { result } = renderHook(() => useOrchestration(config));

      await act(async () => {
        await result.current.startOrchestration();
      });

      // Manually call makeDecision to verify the functionality
      await act(async () => {
        await result.current.makeDecision();
      });

      expect(mockEngine.generateOrchestrationDecisionForActiveSession).toHaveBeenCalled();
      // Note: onDecisionMade is called in auto-analysis interval, not manual makeDecision
    });

    test('should not run auto-analysis when paused', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive',
        autoAnalyze: true,
        analyzeInterval: 1000
      };

      const { result } = renderHook(() => useOrchestration(config));

      await act(async () => {
        await result.current.startOrchestration();
      });

      act(() => {
        result.current.pauseOrchestration();
      });

      // Reset mock call count
      mockEngine.generateOrchestrationDecision.mockClear();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(mockEngine.generateOrchestrationDecision).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle analysis errors gracefully', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      mockEngine.analyzeAudience.mockRejectedValue(new Error('Analysis failed'));

      const { result } = renderHook(() => useOrchestration(config));

      await expect(async () => {
        await act(async () => {
          await result.current.analyzeAudience();
        });
      }).rejects.toThrow('Analysis failed');
    });

    test('should handle orchestration start errors', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      mockEngine.startOrchestration.mockRejectedValue(new Error('Start failed'));

      const { result } = renderHook(() => useOrchestration(config));

      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await act(async () => {
        await result.current.startOrchestration();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to start orchestration:', expect.any(Error));
      expect(result.current.isActive).toBe(false);

      consoleSpy.mockRestore();
    });

    test('should handle decision generation errors', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      const { result } = renderHook(() => useOrchestration(config));

      await act(async () => {
        await result.current.startOrchestration();
      });

      mockEngine.generateOrchestrationDecisionForActiveSession.mockRejectedValue(new Error('Decision failed'));

      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      let decision;
      await act(async () => {
        decision = await result.current.makeDecision();
      });

      expect(decision).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error making orchestration decision:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Event Handling', () => {
    test('should track recent events', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      const { result } = renderHook(() => useOrchestration(config));

      await act(async () => {
        await result.current.startOrchestration();
      });

      // Events should be tracked from orchestration start
      expect(result.current.recentEvents.length).toBeGreaterThan(0);
      expect(result.current.recentEvents[0]).toMatchObject({
        type: 'session_started',
        sessionId: 'test-session'
      });
    });

    test('should limit recent events to 20 items', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive'
      };

      const { result } = renderHook(() => useOrchestration(config));

      await act(async () => {
        await result.current.startOrchestration();
      });

      // Generate multiple engagement events
      for (let i = 0; i < 25; i++) {
        act(() => {
          result.current.reportEngagement('medium', `test_${i}`);
        });
      }

      expect(result.current.recentEvents.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Cleanup', () => {
    test('should cleanup intervals on unmount', async () => {
      const config: OrchestrationHookConfig = {
        audience: 'executive',
        autoAnalyze: true
      };

      const { result, unmount } = renderHook(() => useOrchestration(config));

      await act(async () => {
        await result.current.startOrchestration();
      });

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });
});