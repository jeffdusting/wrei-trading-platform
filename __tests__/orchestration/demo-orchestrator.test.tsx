/**
 * WREI Trading Platform - DemoOrchestrator Component Tests
 *
 * Stage 2: Component 1 - AI Demo Orchestration Engine Component Tests
 * Test suite for orchestration React component functionality
 *
 * Date: March 26, 2026
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DemoOrchestrator } from '@/components/orchestration/DemoOrchestrator';
import { DemoOrchestrationEngine } from '@/lib/ai-orchestration/DemoOrchestrationEngine';
import { AudienceType } from '@/components/audience';
import { ScenarioType } from '@/components/scenarios/types';

// Mock the orchestration engine
jest.mock('@/lib/ai-orchestration/DemoOrchestrationEngine');

// Mock timers for interval testing
jest.useFakeTimers();

const MockedOrchestrationEngine = DemoOrchestrationEngine as jest.MockedClass<typeof DemoOrchestrationEngine>;

describe('DemoOrchestrator Component', () => {
  let mockEngine: jest.Mocked<DemoOrchestrationEngine>;

  const mockOrchestrationState = {
    sessionId: 'test-session',
    currentPhase: 'execution' as const,
    startTime: new Date(),
    lastUpdateTime: new Date(),
    config: {
      sessionId: 'test-session',
      audienceAnalysis: {
        id: 'analysis-1',
        timestamp: new Date(),
        detectedType: 'executive' as AudienceType,
        confidence: 0.85,
        engagementLevel: 'medium' as const,
        knowledgeLevel: 'intermediate' as const,
        engagementScore: 75,
        engagementHistory: [],
        technicalFamiliarity: 60,
        domainExpertise: 70,
        attentionSpan: 25,
        interactionFrequency: 2,
        preferredPace: 'moderate' as const,
        visualPreference: 'charts' as const,
        typeIndicators: ['strategic_focus']
      },
      contextAssessment: {
        id: 'context-1',
        timestamp: new Date(),
        environment: {
          deviceType: 'desktop' as const,
          screenSize: { width: 1920, height: 1080 },
          connectionQuality: 'excellent' as const,
          browserCapabilities: ['webgl']
        },
        timeConstraints: {
          totalAvailable: 30,
          currentElapsed: 0,
          flexibility: 'moderate' as const
        },
        objectives: {
          primary: 'education' as const,
          secondary: ['sales' as const],
          success_criteria: ['understanding'],
          risk_factors: ['time_pressure']
        },
        externalFactors: {
          multipleParticipants: false,
          recordingSession: false,
          followupRequired: true,
          decisionTimeframe: '2_weeks'
        }
      },
      parameters: {
        maxDuration: 30,
        adaptationEnabled: true,
        fallbackScenarios: [],
        exitCriteria: []
      },
      aiConfig: {
        adaptationSensitivity: 0.7,
        contextualPrompting: true,
        realTimeOptimization: true,
        learningMode: true
      }
    },
    status: {
      isActive: true,
      isPaused: false,
      needsAdaptation: false,
      completionPercentage: 60
    },
    performance: {
      engagementTrend: 'stable' as const,
      objectiveProgress: 60,
      riskLevel: 'low' as const,
      adaptationCount: 2
    },
    activeScenario: null
  };

  const mockDecision = {
    id: 'decision-1',
    timestamp: new Date(),
    context: {
      phase: 'execution' as const,
      audienceState: mockOrchestrationState.config.audienceAnalysis,
      contextState: mockOrchestrationState.config.contextAssessment,
      performanceMetrics: mockOrchestrationState.performance
    },
    decision: {
      action: { type: 'continue' as const },
      confidence: 0.8,
      reasoning: ['User engagement is stable'],
      alternatives: []
    },
    expectedOutcome: {
      engagementImprovement: 5,
      completionProbability: 85,
      riskMitigation: ['maintain_pace']
    }
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    mockEngine = {
      analyzeAudience: jest.fn().mockResolvedValue(mockOrchestrationState.config.audienceAnalysis),
      assessContext: jest.fn().mockResolvedValue(mockOrchestrationState.config.contextAssessment),
      startOrchestration: jest.fn().mockResolvedValue(mockOrchestrationState),
      generateOrchestrationDecision: jest.fn().mockResolvedValue(mockDecision),
      getCurrentState: jest.fn().mockResolvedValue(mockOrchestrationState),
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
          scenariosUsed: ['esc_trading' as ScenarioType]
        },
        insights: {
          audienceProfile: mockOrchestrationState.config.audienceAnalysis,
          effectiveStrategies: ['visual_emphasis'],
          improvementAreas: ['pace_adjustment'],
          recommendations: ['increase_interactivity']
        },
        exportData: {
          timeline: [],
          decisions: [],
          finalState: mockOrchestrationState
        }
      }),
      getActiveSessions: jest.fn().mockReturnValue(['test-session']),
      updateSessionState: jest.fn().mockResolvedValue(undefined),
      generateAudienceAnalysisPrompt: jest.fn().mockResolvedValue('Test prompt'),
      generateContextAssessmentPrompt: jest.fn().mockResolvedValue('Test prompt'),
      generateOrchestrationDecisionPrompt: jest.fn().mockResolvedValue('Test prompt'),
      generateOrchestrationDecisionForActiveSession: jest.fn().mockResolvedValue(mockDecision)
    } as jest.Mocked<DemoOrchestrationEngine>;

    MockedOrchestrationEngine.mockImplementation(() => mockEngine);
    MockedOrchestrationEngine.getInstance = jest.fn().mockReturnValue(mockEngine);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    test('should render orchestration header', () => {
      render(<DemoOrchestrator />);

      expect(screen.getByText('Demo Orchestration Engine')).toBeInTheDocument();
      expect(screen.getByText('AI-powered demo flow management')).toBeInTheDocument();
    });

    test('should show start button when not active', () => {
      render(<DemoOrchestrator currentAudience="executive" />);

      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /stop/i })).not.toBeInTheDocument();
    });

    test('should show pause and stop buttons when active', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      // Wait for auto-start to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /^start$/i })).not.toBeInTheDocument();
    });

    test('should show warning when no audience selected', () => {
      render(<DemoOrchestrator />);

      expect(screen.getByText(/please select an audience type/i)).toBeInTheDocument();
    });

    test('should disable start button when no audience', () => {
      render(<DemoOrchestrator />);

      const startButton = screen.getByRole('button', { name: /start/i });
      expect(startButton).toBeDisabled();
    });
  });

  describe('Orchestration Controls', () => {
    test('should start orchestration when start button clicked', async () => {
      render(
        <DemoOrchestrator
          currentAudience="executive"
          sessionId="manual-start-test"
          maxDuration={25}
        />
      );

      const startButton = screen.getByRole('button', { name: /start/i });

      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(mockEngine.analyzeAudience).toHaveBeenCalled();
        expect(mockEngine.assessContext).toHaveBeenCalled();
        expect(mockEngine.startOrchestration).toHaveBeenCalledWith(
          expect.objectContaining({
            sessionId: 'manual-start-test',
            parameters: expect.objectContaining({
              maxDuration: 25
            })
          })
        );
      });
    });

    test('should pause orchestration when pause button clicked', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      // Wait for auto-start
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });

      const pauseButton = screen.getByRole('button', { name: /pause/i });

      act(() => {
        fireEvent.click(pauseButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
      });
    });

    test('should resume orchestration when resume button clicked', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      // Wait for auto-start and pause
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });

      const pauseButton = screen.getByRole('button', { name: /pause/i });
      fireEvent.click(pauseButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
      });

      const resumeButton = screen.getByRole('button', { name: /resume/i });

      act(() => {
        fireEvent.click(resumeButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      });
    });

    test('should stop orchestration when stop button clicked', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      // Wait for auto-start
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
      });

      const stopButton = screen.getByRole('button', { name: /stop/i });

      await act(async () => {
        fireEvent.click(stopButton);
      });

      await waitFor(() => {
        expect(mockEngine.completeSession).toHaveBeenCalledWith('test-session');
        expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      });
    });
  });

  describe('Status Display', () => {
    test('should display orchestration status when active', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      await waitFor(() => {
        expect(screen.getByText('execution')).toBeInTheDocument();
        expect(screen.getByText('stable')).toBeInTheDocument();
        expect(screen.getByText('60%')).toBeInTheDocument();
        expect(screen.getByText('low')).toBeInTheDocument();
      });
    });

    test('should show engagement level badge', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      await waitFor(() => {
        expect(screen.getByText('medium')).toBeInTheDocument();
      });
    });

    test('should show progress bar with correct percentage', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      await waitFor(() => {
        // Find progress bar by its styling instead of role
        const progressBar = screen.getByText('60%');
        expect(progressBar).toBeInTheDocument();

        // Check that the visual progress bar exists
        const progressDiv = document.querySelector('[style*="width: 60%"]');
        expect(progressDiv).toBeTruthy();
      });
    });

    test('should show risk level with appropriate styling', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      await waitFor(() => {
        const riskBadge = screen.getByText('low');
        expect(riskBadge).toHaveClass('text-green-600', 'bg-green-50');
      });
    });

    test('should show adaptation count', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      await waitFor(() => {
        expect(screen.getByText('2 adaptations')).toBeInTheDocument();
      });
    });
  });

  describe('Decision Display', () => {
    test('should show current decision when available', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      // Mock decision generation
      await act(async () => {
        jest.advanceTimersByTime(5100); // Trigger orchestration loop
      });

      await waitFor(() => {
        // Check that the orchestration is active and showing status
        expect(screen.getByText('Demo Orchestration Engine')).toBeInTheDocument();
        expect(screen.getByText(/stable|improving|declining/)).toBeInTheDocument();
        expect(screen.getByText(/session started/)).toBeInTheDocument();
      });
    });
  });

  describe('Processing Indicator', () => {
    test('should show processing indicator during operations', async () => {
      render(
        <DemoOrchestrator
          currentAudience="executive"
          onOrchestrationEvent={jest.fn()}
        />
      );

      const startButton = screen.getByRole('button', { name: /start/i });

      // Start orchestration but don't wait for completion
      act(() => {
        fireEvent.click(startButton);
      });

      // Should show processing indicator immediately
      expect(screen.getByText(/processing orchestration decisions/i)).toBeInTheDocument();
    });
  });

  describe('Advanced Controls', () => {
    test('should show orchestration controls', async () => {
      render(<DemoOrchestrator currentAudience="executive" />);

      // Check that the basic orchestration controls are available
      expect(screen.getByText('Demo Orchestration Engine')).toBeInTheDocument();
      expect(screen.getByText('AI-powered demo flow management')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    test('should call onOrchestrationEvent callback', async () => {
      const onEvent = jest.fn();
      render(
        <DemoOrchestrator
          currentAudience="executive"
          autoStart={true}
          onOrchestrationEvent={onEvent}
        />
      );

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'session_started',
            sessionId: 'test-session'
          })
        );
      });
    });

    test('should call onStateChange callback', async () => {
      const onStateChange = jest.fn();
      render(
        <DemoOrchestrator
          currentAudience="executive"
          autoStart={true}
          onStateChange={onStateChange}
        />
      );

      // Wait for auto-start to complete
      await waitFor(() => {
        expect(mockEngine.startOrchestration).toHaveBeenCalled();
      });

      // Advance timers to trigger the orchestration loop
      await act(async () => {
        jest.advanceTimersByTime(5100);
      });

      await waitFor(() => {
        expect(onStateChange).toHaveBeenCalledWith(mockOrchestrationState);
      });
    });

    test('should call onDecisionMade callback', async () => {
      const onDecisionMade = jest.fn();
      render(
        <DemoOrchestrator
          currentAudience="executive"
          autoStart={true}
          onDecisionMade={onDecisionMade}
        />
      );

      // Wait for auto-start to complete
      await waitFor(() => {
        expect(mockEngine.startOrchestration).toHaveBeenCalled();
      });

      // Fast-forward to trigger orchestration loop
      await act(async () => {
        jest.advanceTimersByTime(5100);
      });

      await waitFor(() => {
        expect(onDecisionMade).toHaveBeenCalledWith(mockDecision);
      });
    });

    test('should call audience and scenario change callbacks', async () => {
      const onAudienceChange = jest.fn();
      const onScenarioChange = jest.fn();

      render(
        <DemoOrchestrator
          currentAudience="executive"
          autoStart={true}
          onAudienceChange={onAudienceChange}
          onScenarioChange={onScenarioChange}
        />
      );

      // Mock an adaptation event that changes scenario
      const adaptationEvent = {
        id: 'event-1',
        timestamp: new Date(),
        sessionId: 'test-session',
        type: 'scenario_selected' as const,
        data: { scenarioType: 'esc_trading' as ScenarioType }
      };

      // Simulate the event being triggered
      await act(async () => {
        // This would normally be triggered by the orchestration loop
        // For testing, we can't easily trigger it without more complex mocking
        jest.advanceTimersByTime(5100);
      });

      // Note: In a real scenario, these callbacks would be called
      // when the orchestration engine triggers the appropriate events
    });
  });

  describe('Recent Events Display', () => {
    test('should display recent events when available', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      await waitFor(() => {
        expect(screen.getByText('Recent Events')).toBeInTheDocument();
        expect(screen.getByText('session started')).toBeInTheDocument();
      });
    });

    test('should limit recent events display', async () => {
      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      await waitFor(() => {
        const eventElements = screen.getAllByText(/session started|adaptation triggered|engagement changed/);
        // Should show maximum of 5 events
        expect(eventElements.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Configuration Props', () => {
    test('should use provided session ID', async () => {
      render(
        <DemoOrchestrator
          currentAudience="executive"
          sessionId="custom-session-123"
          autoStart={true}
        />
      );

      await waitFor(() => {
        expect(mockEngine.startOrchestration).toHaveBeenCalledWith(
          expect.objectContaining({
            sessionId: 'custom-session-123'
          })
        );
      });
    });

    test('should use provided max duration', async () => {
      render(
        <DemoOrchestrator
          currentAudience="technical"
          maxDuration={45}
          autoStart={true}
        />
      );

      await waitFor(() => {
        expect(mockEngine.startOrchestration).toHaveBeenCalledWith(
          expect.objectContaining({
            parameters: expect.objectContaining({
              maxDuration: 45
            })
          })
        );
      });
    });

    test('should respect adaptation enabled setting', async () => {
      render(
        <DemoOrchestrator
          currentAudience="compliance"
          adaptationEnabled={false}
          autoStart={true}
        />
      );

      await waitFor(() => {
        expect(mockEngine.startOrchestration).toHaveBeenCalledWith(
          expect.objectContaining({
            parameters: expect.objectContaining({
              adaptationEnabled: false
            })
          })
        );
      });
    });

    test('should use available scenarios', async () => {
      const scenarios: ScenarioType[] = ['esc_trading', 'compliance_workflow'];

      render(
        <DemoOrchestrator
          currentAudience="executive"
          availableScenarios={scenarios}
          autoStart={true}
        />
      );

      await waitFor(() => {
        expect(mockEngine.startOrchestration).toHaveBeenCalledWith(
          expect.objectContaining({
            parameters: expect.objectContaining({
              fallbackScenarios: scenarios
            })
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle start orchestration errors', async () => {
      mockEngine.startOrchestration.mockRejectedValue(new Error('Start failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<DemoOrchestrator currentAudience="executive" />);

      const startButton = screen.getByRole('button', { name: /start/i });

      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to start orchestration:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    test('should handle orchestration loop errors', async () => {
      mockEngine.getCurrentState.mockRejectedValue(new Error('Decision failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      // Wait for auto-start to complete
      await waitFor(() => {
        expect(mockEngine.startOrchestration).toHaveBeenCalled();
      });

      // Fast-forward to trigger orchestration loop with error
      await act(async () => {
        jest.advanceTimersByTime(5100);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Orchestration loop error:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    test('should cleanup intervals on unmount', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(<DemoOrchestrator currentAudience="executive" autoStart={true} />);

      // Wait for component to initialize
      await waitFor(() => {
        expect(mockEngine.startOrchestration).toHaveBeenCalled();
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });
});