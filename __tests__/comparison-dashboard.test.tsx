import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComparisonDashboard from '@/components/negotiation/ComparisonDashboard';
import { NegotiationSession, SessionComparison } from '@/lib/negotiation-history';
import { NegotiationState } from '@/lib/types';

// Mock ResizeObserver for Recharts compatibility
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock URL.createObjectURL for file download tests
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

describe('ComparisonDashboard', () => {
  // Helper functions to create mock data
  const createMockSession = (overrides: Partial<NegotiationSession> = {}): NegotiationSession => ({
    id: `session_${Math.random()}`,
    persona: 'compliance_officer',
    startTime: '2026-03-24T10:00:00Z',
    endTime: '2026-03-24T10:15:00Z',
    messages: [
      {
        role: 'buyer',
        content: 'I need carbon credits',
        timestamp: '2026-03-24T10:00:00Z',
        argumentClassification: 'information_request',
        emotionalState: 'neutral'
      }
    ],
    finalState: {} as NegotiationState,
    outcome: 'agreed',
    metrics: {
      finalPrice: 135,
      anchorPrice: 150,
      priceFloor: 120,
      totalRounds: 4,
      concessionsMade: 2,
      totalConcessionPercentage: 10,
      averageConcessionPerRound: 5,
      roundsToFirstConcession: 2,
      argumentTypes: {
        price_challenge: 1,
        fairness_appeal: 0,
        time_pressure: 0,
        information_request: 1,
        relationship_signal: 0,
        authority_constraint: 0,
        emotional_expression: 0,
        general: 0
      },
      emotionalProgression: ['neutral', 'satisfied'],
      duration: 15,
      outcomeSuccess: true
    },
    stateHistory: [],
    ...overrides
  });

  const createMockComparison = (): SessionComparison => {
    const session1 = createMockSession({
      id: 'session_1',
      persona: 'compliance_officer',
      metrics: {
        finalPrice: 140,
        anchorPrice: 150,
        priceFloor: 120,
        totalRounds: 5,
        concessionsMade: 1,
        totalConcessionPercentage: 6.7,
        averageConcessionPerRound: 6.7,
        roundsToFirstConcession: 3,
        argumentTypes: {
          price_challenge: 2,
          fairness_appeal: 1,
          time_pressure: 0,
          information_request: 1,
          relationship_signal: 0,
          authority_constraint: 0,
          emotional_expression: 0,
          general: 0
        },
        emotionalProgression: ['neutral', 'frustrated', 'satisfied'],
        duration: 12,
        outcomeSuccess: true
      }
    });

    const session2 = createMockSession({
      id: 'session_2',
      persona: 'esg_fund_manager',
      metrics: {
        finalPrice: 130,
        anchorPrice: 150,
        priceFloor: 120,
        totalRounds: 7,
        concessionsMade: 3,
        totalConcessionPercentage: 13.3,
        averageConcessionPerRound: 4.4,
        roundsToFirstConcession: 2,
        argumentTypes: {
          price_challenge: 3,
          fairness_appeal: 0,
          time_pressure: 1,
          information_request: 2,
          relationship_signal: 1,
          authority_constraint: 0,
          emotional_expression: 0,
          general: 0
        },
        emotionalProgression: ['neutral', 'enthusiastic', 'frustrated'],
        duration: 18,
        outcomeSuccess: true
      }
    });

    return {
      session1,
      session2,
      priceComparison: {
        finalPriceDifference: 10, // 140 - 130
        concessionDifference: -6.6, // 6.7 - 13.3
        efficiencyDifference: 9.43 // (140/5) - (130/7)
      },
      strategyComparison: {
        roundsComparison: -2, // 5 - 7
        argumentDistribution1: session1.metrics.argumentTypes,
        argumentDistribution2: session2.metrics.argumentTypes,
        emotionalPatternSimilarity: 0.5
      },
      outcomeComparison: {
        bothSuccessful: true,
        winnerSession: 'session1',
        successFactors: [
          'Achieved 7.7% higher final price',
          'Closed deal 2 rounds faster',
          'Made fewer concessions overall'
        ]
      }
    };
  };

  let mockOnSelectSessions: jest.Mock;
  let mockOnClose: jest.Mock;

  beforeEach(() => {
    mockOnSelectSessions = jest.fn();
    mockOnClose = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Component Rendering', () => {
    test('renders with sessions list when no comparison provided', () => {
      const sessions = [createMockSession(), createMockSession({ persona: 'esg_fund_manager' })];

      render(
        <ComparisonDashboard
          sessions={sessions}
          onSelectSessions={mockOnSelectSessions}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Negotiation Comparison')).toBeInTheDocument();
      expect(screen.getByText('Select Two Sessions to Compare')).toBeInTheDocument();
      expect(screen.getByText('Compliance Officer')).toBeInTheDocument();
      expect(screen.getByText('Esg Fund Manager')).toBeInTheDocument();
    });

    test('renders comparison view when comparison provided', () => {
      const comparison = createMockComparison();

      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Negotiation Comparison')).toBeInTheDocument();
      expect(screen.getByText(/Session 1 Wins/)).toBeInTheDocument();
      expect(screen.getByText('Head-to-Head Comparison')).toBeInTheDocument();
    });

    test('renders close button when onClose provided', () => {
      const sessions = [createMockSession()];

      render(
        <ComparisonDashboard
          sessions={sessions}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: /✕/ });
      expect(closeButton).toBeInTheDocument();

      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('renders without close button when onClose not provided', () => {
      const sessions = [createMockSession()];

      render(<ComparisonDashboard sessions={sessions} />);

      expect(screen.queryByRole('button', { name: /✕/ })).not.toBeInTheDocument();
    });
  });

  describe('Session Selection', () => {
    test('allows selecting sessions for comparison', () => {
      const sessions = [
        createMockSession({ id: 'session_1' }),
        createMockSession({ id: 'session_2', persona: 'esg_fund_manager' })
      ];

      render(
        <ComparisonDashboard
          sessions={sessions}
          onSelectSessions={mockOnSelectSessions}
        />
      );

      // Click first session container (not the inner text div)
      const firstSession = screen.getByText('Compliance Officer').closest('.p-4');
      fireEvent.click(firstSession!);

      // Check if selection visual feedback appears on the session container
      expect(firstSession).toHaveClass('border-[#0EA5E9]');

      // Click second session
      const secondSession = screen.getByText('Esg Fund Manager').closest('.p-4');
      fireEvent.click(secondSession!);

      // Should call onSelectSessions with both IDs
      expect(mockOnSelectSessions).toHaveBeenCalledWith(['session_1', 'session_2']);
    });

    test('shows selection guidance when one session selected', () => {
      const sessions = [createMockSession(), createMockSession({ persona: 'esg_fund_manager' })];

      render(
        <ComparisonDashboard
          sessions={sessions}
          onSelectSessions={mockOnSelectSessions}
        />
      );

      // Select first session
      const firstSession = screen.getByText('Compliance Officer').closest('div');
      fireEvent.click(firstSession!);

      expect(screen.getByText('Select one more session to start the comparison.')).toBeInTheDocument();
    });

    test('replaces first selection when selecting third session', () => {
      const sessions = [
        createMockSession({ id: 'session_1' }),
        createMockSession({ id: 'session_2', persona: 'esg_fund_manager' }),
        createMockSession({ id: 'session_3', persona: 'trading_desk' })
      ];

      render(
        <ComparisonDashboard
          sessions={sessions}
          onSelectSessions={mockOnSelectSessions}
        />
      );

      // Select first two sessions
      fireEvent.click(screen.getByText('Compliance Officer').closest('div')!);
      fireEvent.click(screen.getByText('Esg Fund Manager').closest('div')!);

      // Select third session (should replace first)
      fireEvent.click(screen.getByText('Trading Desk').closest('div')!);

      expect(mockOnSelectSessions).toHaveBeenLastCalledWith(['session_2', 'session_3']);
    });

    test('displays session information correctly', () => {
      const session = createMockSession({
        startTime: '2026-03-24T14:30:00Z',
        metrics: {
          ...createMockSession().metrics,
          finalPrice: 125,
          totalRounds: 6
        },
        outcome: 'agreed'
      });

      render(<ComparisonDashboard sessions={[session]} />);

      expect(screen.getByText('USD 125')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('AGREED')).toBeInTheDocument();
      // Date rendered via toLocaleDateString('en-AU') — exact day depends on TZ
      const datePattern = /2[45]\/03\/2026/;
      expect(screen.getByText(datePattern)).toBeInTheDocument();
    });
  });

  describe('Comparison View', () => {
    const comparison = createMockComparison();

    test('displays winner information correctly', () => {
      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      expect(screen.getByText(/🏆Session 1 Wins/)).toBeInTheDocument();
    });

    test('displays tie scenario correctly', () => {
      const tieComparison = {
        ...comparison,
        outcomeComparison: {
          ...comparison.outcomeComparison,
          winnerSession: 'tie' as const,
          successFactors: ['Both sessions achieved similar outcomes']
        }
      };

      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={tieComparison}
        />
      );

      expect(screen.getByText(/🤝Tie/)).toBeInTheDocument();
    });

    test('displays session metrics side by side', () => {
      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      expect(screen.getByText('USD 140')).toBeInTheDocument(); // Session 1 final price
      expect(screen.getByText('USD 130')).toBeInTheDocument(); // Session 2 final price
      expect(screen.getByText('5')).toBeInTheDocument(); // Session 1 rounds
      expect(screen.getByText('7')).toBeInTheDocument(); // Session 2 rounds
    });

    test('shows correct outcome styling', () => {
      const failedComparison = {
        ...comparison,
        session2: {
          ...comparison.session2,
          outcome: 'deferred' as const,
          metrics: {
            ...comparison.session2.metrics,
            outcomeSuccess: false
          }
        }
      };

      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={failedComparison}
        />
      );

      expect(screen.getByText('AGREED ✓')).toBeInTheDocument();
      expect(screen.getByText('DEFERRED ✗')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    const comparison = createMockComparison();

    test('defaults to metrics tab', () => {
      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      const metricsTab = screen.getByRole('button', { name: /📊 Metrics Comparison/ });
      expect(metricsTab).toHaveClass('border-[#0EA5E9]');
    });

    test('switches to strategy tab', () => {
      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      const strategyTab = screen.getByRole('button', { name: /🎯 Strategy Analysis/ });
      fireEvent.click(strategyTab);

      expect(strategyTab).toHaveClass('border-[#0EA5E9]');
      expect(screen.getByText('Argument Strategy Distribution')).toBeInTheDocument();
    });

    test('switches to timeline tab', () => {
      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      const timelineTab = screen.getByRole('button', { name: /⏱️ Timeline View/ });
      fireEvent.click(timelineTab);

      expect(timelineTab).toHaveClass('border-[#0EA5E9]');
      expect(screen.getByText('Timeline Comparison')).toBeInTheDocument();
      expect(screen.getByText('Negotiation Timeline')).toBeInTheDocument();
    });
  });

  describe('Strategy Analysis Tab', () => {
    const comparison = createMockComparison();

    beforeEach(() => {
      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      const strategyTab = screen.getByRole('button', { name: /🎯 Strategy Analysis/ });
      fireEvent.click(strategyTab);
    });

    test('displays argument distribution correctly', () => {
      expect(screen.getByText('Argument Strategy Distribution')).toBeInTheDocument();
      expect(screen.getByText('Price Challenge')).toBeInTheDocument();
      expect(screen.getByText('Information Request')).toBeInTheDocument();
    });

    test('shows emotional pattern similarity', () => {
      expect(screen.getByText('Emotional Pattern Analysis')).toBeInTheDocument();
      expect(screen.getByText('50% Similar')).toBeInTheDocument();
    });

    test('displays emotional progressions for both sessions', () => {
      expect(screen.getByText('Compliance Officer Emotions')).toBeInTheDocument();
      expect(screen.getByText('Esg Fund Manager Emotions')).toBeInTheDocument();
      expect(screen.getAllByText('frustrated')).toHaveLength(2);
      expect(screen.getByText('enthusiastic')).toBeInTheDocument();
    });

    test('shows efficiency metrics', () => {
      expect(screen.getByText('Efficiency Comparison')).toBeInTheDocument();
      expect(screen.getByText('Round Difference')).toBeInTheDocument();
      expect(screen.getByText('Price/Round Difference')).toBeInTheDocument();
    });
  });

  describe('Timeline Tab', () => {
    const comparison = createMockComparison();

    beforeEach(() => {
      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      const timelineTab = screen.getByRole('button', { name: /⏱️ Timeline View/ });
      fireEvent.click(timelineTab);
    });

    test('displays timeline information for both sessions', () => {
      expect(screen.getByText('Timeline Comparison')).toBeInTheDocument();
      expect(screen.getAllByText('Start Time:')).toHaveLength(2);
      expect(screen.getAllByText('End Time:')).toHaveLength(2);
      expect(screen.getAllByText('Total Duration:')).toHaveLength(2);
    });

    test('shows pace analysis', () => {
      expect(screen.getByText('Negotiation Pace Analysis')).toBeInTheDocument();
      expect(screen.getAllByText('Average Time per Round')).toHaveLength(2);
    });

    test('calculates and displays correct pace metrics', () => {
      // Session 1: 12 min / 5 rounds = 2.4m per round
      // Session 2: 18 min / 7 rounds = 2.6m per round
      expect(screen.getByText('2.4m')).toBeInTheDocument();
      expect(screen.getByText('2.6m')).toBeInTheDocument();
    });
  });

  describe('Success Factors Display', () => {
    const comparison = createMockComparison();

    test('displays success factors when available', () => {
      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      expect(screen.getByText('Key Success Factors')).toBeInTheDocument();
      expect(screen.getByText('Achieved 7.7% higher final price')).toBeInTheDocument();
      expect(screen.getByText('Closed deal 2 rounds faster')).toBeInTheDocument();
      expect(screen.getByText('Made fewer concessions overall')).toBeInTheDocument();
    });

    test('shows message when no distinguishing factors', () => {
      const similarComparison = {
        ...comparison,
        outcomeComparison: {
          ...comparison.outcomeComparison,
          successFactors: []
        }
      };

      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={similarComparison}
        />
      );

      expect(screen.getByText('Both sessions performed similarly with no clear distinguishing factors.')).toBeInTheDocument();
    });

    test('displays financial impact information', () => {
      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      expect(screen.getByText('Financial Impact')).toBeInTheDocument();
      expect(screen.getByText('Price Difference:')).toBeInTheDocument();
      expect(screen.getByText('Concession Difference:')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    const comparison = createMockComparison();

    test('renders export button when comparison available', () => {
      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      const exportButton = screen.getByRole('button', { name: /📊 Export Report/ });
      expect(exportButton).toBeInTheDocument();
    });

    test('does not render export button when no comparison', () => {
      const sessions = [createMockSession()];

      render(<ComparisonDashboard sessions={sessions} />);

      expect(screen.queryByRole('button', { name: /📊 Export Report/ })).not.toBeInTheDocument();
    });

    test('triggers export when export button clicked', () => {
      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      const exportButton = screen.getByRole('button', { name: /📊 Export Report/ });

      // Test that the button exists and can be clicked without errors
      expect(exportButton).toBeInTheDocument();
      expect(() => fireEvent.click(exportButton)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty sessions list', () => {
      render(<ComparisonDashboard sessions={[]} />);

      expect(screen.getByText('Select Two Sessions to Compare')).toBeInTheDocument();
    });

    test('handles sessions with missing end times', () => {
      const session = createMockSession({
        endTime: undefined
      });

      render(<ComparisonDashboard sessions={[session]} />);

      // Should not crash and should still display the session
      expect(screen.getByText('Compliance Officer')).toBeInTheDocument();
    });

    test('handles comparison with zero differences', () => {
      const identicalComparison = {
        ...createMockComparison(),
        priceComparison: {
          finalPriceDifference: 0,
          concessionDifference: 0,
          efficiencyDifference: 0
        },
        strategyComparison: {
          ...createMockComparison().strategyComparison,
          roundsComparison: 0
        }
      };

      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={identicalComparison}
        />
      );

      // Test passes if component renders without crashing with identical comparison data
      expect(screen.getByText('Negotiation Comparison')).toBeInTheDocument();
    });

    test('handles freeplay persona display', () => {
      const session = createMockSession({
        persona: 'freeplay'
      });

      render(<ComparisonDashboard sessions={[session]} />);

      expect(screen.getByText('Freeplay')).toBeInTheDocument();
    });

    test('formats currency correctly across all components', () => {
      const comparison = createMockComparison();

      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      // Should display USD currency format
      expect(screen.getByText('USD 140')).toBeInTheDocument();
      expect(screen.getByText('USD 130')).toBeInTheDocument();
    });

    test('handles sessions with no arguments or emotions', () => {
      const minimalSession = createMockSession({
        metrics: {
          ...createMockSession().metrics,
          argumentTypes: {
            price_challenge: 0,
            fairness_appeal: 0,
            time_pressure: 0,
            information_request: 0,
            relationship_signal: 0,
            authority_constraint: 0,
            emotional_expression: 0,
            general: 0
          },
          emotionalProgression: []
        }
      });

      const comparison = {
        ...createMockComparison(),
        session1: minimalSession,
        session2: minimalSession
      };

      render(
        <ComparisonDashboard
          sessions={[]}
          comparison={comparison}
        />
      );

      // Should not crash
      expect(screen.getByText('Negotiation Comparison')).toBeInTheDocument();
    });
  });
});