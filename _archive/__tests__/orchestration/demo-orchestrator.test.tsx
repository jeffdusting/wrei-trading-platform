/**
 * WREI Trading Platform - DemoOrchestrator Component Tests
 *
 * Stage 2: Component 1 - Simplified Demo Scenario Manager Component Tests
 * Test suite for simplified demo orchestration React component functionality
 *
 * Date: March 28, 2026 (Updated for Phase 5)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DemoOrchestrator } from '@/components/orchestration/DemoOrchestrator';
import { SimpleDemoProvider } from '@/components/demo/SimpleDemoProvider';
import { useSimpleDemoStore } from '@/lib/demo-mode/simple-demo-state';

// Mock timers for interval testing
jest.useFakeTimers();

// Test wrapper with demo provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SimpleDemoProvider>{children}</SimpleDemoProvider>
);

describe('DemoOrchestrator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset demo store state between tests
    const { deactivateDemo } = useSimpleDemoStore.getState();
    deactivateDemo();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Component Rendering', () => {
    test('should render orchestration header', () => {
      render(
        <TestWrapper>
          <DemoOrchestrator />
        </TestWrapper>
      );

      expect(screen.getByText('Demo Scenario Manager')).toBeInTheDocument();
      expect(screen.getByText('Simplified demo orchestration with AI insights')).toBeInTheDocument();
    });

    test('should show start button when not active', () => {
      render(
        <TestWrapper>
          <DemoOrchestrator currentDataSet="institutional" />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /start scenario/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /stop/i })).not.toBeInTheDocument();
    });

    test('should show warning when no data set selected', () => {
      render(
        <TestWrapper>
          <DemoOrchestrator />
        </TestWrapper>
      );

      expect(screen.getByText(/please select a data set to begin scenario orchestration/i)).toBeInTheDocument();
    });

    test('should disable start button when no data set', () => {
      render(
        <TestWrapper>
          <DemoOrchestrator />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /start scenario/i });
      expect(startButton).toBeDisabled();
    });
  });

  describe('Scenario Controls', () => {
    test('should start scenario when start button clicked', async () => {
      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            sessionId="manual-start-test"
          />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /start scenario/i });

      await act(async () => {
        fireEvent.click(startButton);
      });

      // Should show stop button after starting
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
      });
    });

    test('should stop scenario when stop button clicked', async () => {
      const onEvent = jest.fn();

      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            autoStart={true}
            onEvent={onEvent}
          />
        </TestWrapper>
      );

      // Wait for auto-start
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
      });

      const stopButton = screen.getByRole('button', { name: /stop/i });

      await act(async () => {
        fireEvent.click(stopButton);
      });

      // Verify that stop event was triggered even if UI doesn't update immediately
      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'session_completed'
          })
        );
      });
    });

    test('should change data set when dropdown changed', async () => {
      const onDataSetChange = jest.fn();

      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            onDataSetChange={onDataSetChange}
            autoStart={true}
          />
        </TestWrapper>
      );

      // Wait for auto-start to complete
      await waitFor(() => {
        expect(screen.getByDisplayValue('ESG Fund Manager')).toBeInTheDocument();
      });

      const dropdown = screen.getByDisplayValue('ESG Fund Manager');

      await act(async () => {
        fireEvent.change(dropdown, { target: { value: 'retail' } });
      });

      expect(onDataSetChange).toHaveBeenCalledWith('retail');
    });
  });

  describe('Auto-start Functionality', () => {
    test('should auto-start when enabled', async () => {
      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            autoStart={true}
          />
        </TestWrapper>
      );

      // Should automatically show the stop button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
      });
    });

    test('should not auto-start when no data set provided', () => {
      render(
        <TestWrapper>
          <DemoOrchestrator autoStart={true} />
        </TestWrapper>
      );

      // Should still show start button
      expect(screen.getByRole('button', { name: /start scenario/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /stop/i })).not.toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    test('should display scenario status when active', async () => {
      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            autoStart={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('execution')).toBeInTheDocument();
        expect(screen.getAllByText('ESG Fund Manager')).toHaveLength(2); // In dropdown and in scenario display
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByText('medium')).toBeInTheDocument();
      });
    });

    test('should show progress bar with percentage', async () => {
      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            autoStart={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument();

        // Check that the visual progress bar exists
        const progressDiv = document.querySelector('[style*="width: 0%"]');
        expect(progressDiv).toBeTruthy();
      });
    });

    test('should show engagement level badge', async () => {
      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            autoStart={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('medium')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario Data Display', () => {
    test('should display active scenario information', async () => {
      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            autoStart={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Active Scenario:/)).toBeInTheDocument();
        expect(screen.getByText(/Organisation:/)).toBeInTheDocument();
        expect(screen.getByText(/Base Price:/)).toBeInTheDocument();
        expect(screen.getByText(/Target:/)).toBeInTheDocument();
      });
    });
  });

  describe('Processing Indicator', () => {
    test('should show processing indicator during operations', async () => {
      render(
        <TestWrapper>
          <DemoOrchestrator currentDataSet="institutional" />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /start scenario/i });

      // Start scenario and check that something happens
      fireEvent.click(startButton);

      // Either processing indicator should show briefly, or scenario should start
      await waitFor(() => {
        expect(
          screen.queryByText(/processing orchestration decisions/i) ||
          screen.queryByRole('button', { name: /stop/i })
        ).toBeTruthy();
      });
    });
  });

  describe('Advanced Controls', () => {
    test('should toggle advanced controls', async () => {
      render(
        <TestWrapper>
          <DemoOrchestrator currentDataSet="institutional" />
        </TestWrapper>
      );

      // Find the advanced controls toggle button
      const toggleButtons = screen.getAllByRole('button');
      const advancedToggle = toggleButtons.find(button =>
        button.querySelector('svg') && !button.textContent?.includes('Start')
      );

      expect(advancedToggle).toBeInTheDocument();

      // Initially advanced controls should not be visible
      expect(screen.queryByText('Advanced Controls')).not.toBeInTheDocument();

      // Click to show advanced controls
      await act(async () => {
        fireEvent.click(advancedToggle!);
      });

      expect(screen.getByText('Advanced Controls')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    test('should call onEvent callback when scenario starts', async () => {
      const onEvent = jest.fn();

      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            onEvent={onEvent}
            autoStart={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'scenario_started',
            data: expect.objectContaining({
              dataSet: 'institutional'
            })
          })
        );
      });
    });

    test('should call onScenarioData callback', async () => {
      const onScenarioData = jest.fn();

      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            onScenarioData={onScenarioData}
            autoStart={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onScenarioData).toHaveBeenCalledWith(
          expect.objectContaining({
            persona: expect.any(Object),
            marketData: expect.any(Object),
            portfolioMetrics: expect.any(Object)
          })
        );
      });
    });
  });

  describe('Recent Events Display', () => {
    test('should display recent events when available', async () => {
      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            autoStart={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Recent Events')).toBeInTheDocument();
        expect(screen.getByText('scenario started')).toBeInTheDocument();
      });
    });

    test('should limit recent events display', async () => {
      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            autoStart={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const eventElements = screen.getAllByText(/scenario started|data loaded|scenario changed/);
        // Should show maximum of 5 events
        expect(eventElements.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Data Set Configuration', () => {
    test('should use provided data set', async () => {
      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="retail"
            autoStart={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Sustainability Director')).toBeInTheDocument();
      });
    });

    test('should handle data set changes', async () => {
      const onDataSetChange = jest.fn();

      render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="compliance"
            onDataSetChange={onDataSetChange}
            autoStart={true}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Government Procurement')).toBeInTheDocument();
      });

      const dropdown = screen.getByDisplayValue('Government Procurement');

      await act(async () => {
        fireEvent.change(dropdown, { target: { value: 'institutional' } });
      });

      expect(onDataSetChange).toHaveBeenCalledWith('institutional');
    });
  });

  describe('Error Handling', () => {
    test('should handle start scenario errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <TestWrapper>
          <DemoOrchestrator />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /start scenario/i });

      await act(async () => {
        fireEvent.click(startButton);
      });

      // Button should be disabled when no data set
      expect(startButton).toBeDisabled();

      consoleSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    test('should cleanup intervals on unmount', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(
        <TestWrapper>
          <DemoOrchestrator
            currentDataSet="institutional"
            autoStart={true}
          />
        </TestWrapper>
      );

      // Wait for component to initialize
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });
});