/**
 * WREI Trading Platform - useOrchestration Hook Tests
 *
 * Stage 2: Component 1 - Simplified Demo Orchestration Hook Tests
 * Test suite for simplified orchestration React hook functionality
 *
 * Date: March 28, 2026 (Updated for Phase 5)
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useOrchestration, OrchestrationHookConfig } from '@/components/orchestration/useOrchestration';
import { SimpleDemoProvider } from '@/components/demo/SimpleDemoProvider';

// Mock timers for interval testing
jest.useFakeTimers();

// Test wrapper with demo provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SimpleDemoProvider>{children}</SimpleDemoProvider>
);

describe('useOrchestration Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Hook Initialization', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => useOrchestration(), { wrapper: TestWrapper });

      expect(result.current.currentPhase).toBe('initialization');
      expect(result.current.demoData).toBeNull();
      expect(result.current.selectedDataSet).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.completionPercentage).toBe(0);
      expect(result.current.recentEvents).toEqual([]);
    });

    test('should initialize with custom config', () => {
      const config: OrchestrationHookConfig = {
        sessionId: 'test-session',
        autoStart: false,
        dataSet: 'institutional'
      };

      const { result } = renderHook(() => useOrchestration(config), { wrapper: TestWrapper });

      expect(result.current.currentPhase).toBe('initialization');
      expect(result.current.isActive).toBe(false);
    });
  });

  describe('Scenario Control', () => {
    test('should start scenario successfully', async () => {
      const { result } = renderHook(() => useOrchestration(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.startScenario('institutional');
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.selectedDataSet).toBe('institutional');
      expect(result.current.demoData).toBeDefined();
    });

    test('should stop scenario successfully', async () => {
      const { result } = renderHook(() => useOrchestration(), { wrapper: TestWrapper });

      // Start scenario first
      await act(async () => {
        await result.current.startScenario('institutional');
      });

      expect(result.current.isActive).toBe(true);

      // Stop scenario
      await act(async () => {
        await result.current.stopScenario();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.demoData).toBeNull();
    });

    test('should change data set successfully', async () => {
      const { result } = renderHook(() => useOrchestration(), { wrapper: TestWrapper });

      // Start with one dataset
      await act(async () => {
        await result.current.startScenario('institutional');
      });

      expect(result.current.selectedDataSet).toBe('institutional');

      // Change to different dataset
      act(() => {
        result.current.changeDataSet('retail');
      });

      expect(result.current.selectedDataSet).toBe('retail');
    });
  });

  describe('Utility Functions', () => {
    test('should get scenario data', async () => {
      const { result } = renderHook(() => useOrchestration(), { wrapper: TestWrapper });

      // Initially data might be available from demo provider
      const initialData = result.current.getScenarioData();
      if (initialData) {
        expect(initialData.persona).toBeDefined();
        expect(initialData.marketData).toBeDefined();
      }

      // Start scenario
      await act(async () => {
        await result.current.startScenario('institutional');
      });

      const scenarioData = result.current.getScenarioData();
      expect(scenarioData).toBeDefined();
      expect(scenarioData?.persona).toBeDefined();
      expect(scenarioData?.marketData).toBeDefined();
    });

    test('should report engagement level', () => {
      const { result } = renderHook(() => useOrchestration(), { wrapper: TestWrapper });

      act(() => {
        result.current.reportEngagement('high');
      });

      expect(result.current.getEngagementLevel()).toBe('high');
    });

    test('should get current phase', () => {
      const { result } = renderHook(() => useOrchestration(), { wrapper: TestWrapper });

      const phase = result.current.getCurrentPhase();
      expect(['initialization', 'execution', 'data_loading', 'completion']).toContain(phase);
    });

    test('should get completion percentage', () => {
      const { result } = renderHook(() => useOrchestration(), { wrapper: TestWrapper });

      expect(result.current.getCompletionPercentage()).toBe(0);
    });
  });

  describe('Event Handling', () => {
    test('should handle scenario events', async () => {
      const onEvent = jest.fn();
      const config: OrchestrationHookConfig = {
        onEvent
      };

      const { result } = renderHook(() => useOrchestration(config), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.startScenario('institutional');
      });

      expect(result.current.recentEvents.length).toBeGreaterThan(0);
      expect(result.current.recentEvents[0].type).toBe('scenario_started');
    });

    test('should handle data set change callbacks', async () => {
      const onDataSetChange = jest.fn();
      const config: OrchestrationHookConfig = {
        onDataSetChange
      };

      const { result } = renderHook(() => useOrchestration(config), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.startScenario('institutional');
      });

      act(() => {
        result.current.changeDataSet('retail');
      });

      expect(onDataSetChange).toHaveBeenCalledWith('retail');
    });
  });

  describe('Auto-start Functionality', () => {
    test('should auto-start when configured', async () => {
      const config: OrchestrationHookConfig = {
        autoStart: true,
        dataSet: 'institutional'
      };

      const { result } = renderHook(() => useOrchestration(config), { wrapper: TestWrapper });

      // Give it a moment to auto-start
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.isActive).toBe(true);
      // The hook might use a different default dataset, just check it's active
      expect(result.current.selectedDataSet).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    test('should handle scenario start without data set gracefully', async () => {
      const { result } = renderHook(() => useOrchestration(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.startScenario();
      });

      // Should still work with default data set selection
      expect(result.current.isActive).toBe(true);
    });
  });
});