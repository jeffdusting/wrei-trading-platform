import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReplayViewer from '@/components/negotiation/ReplayViewer';
import { NegotiationSession } from '@/lib/negotiation-history';
import { NegotiationState, ArgumentClassification, EmotionalState } from '@/lib/types';

// Mock ResizeObserver for Recharts compatibility
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('ReplayViewer', () => {
  // Helper function to create mock session
  const createMockSession = (overrides: Partial<NegotiationSession> = {}): NegotiationSession => ({
    id: 'session_123',
    persona: 'compliance_officer',
    startTime: '2026-03-24T10:00:00Z',
    endTime: '2026-03-24T10:15:00Z',
    messages: [
      {
        role: 'buyer',
        content: 'I need carbon credits for compliance',
        timestamp: '2026-03-24T10:00:00Z',
        argumentClassification: 'information_request',
        emotionalState: 'neutral'
      },
      {
        role: 'agent',
        content: 'I can offer WREI-verified credits at competitive rates',
        timestamp: '2026-03-24T10:02:00Z',
        argumentClassification: 'information_request',
        emotionalState: 'neutral'
      },
      {
        role: 'buyer',
        content: 'Your price is too high, I need a better deal',
        timestamp: '2026-03-24T10:04:00Z',
        argumentClassification: 'price_challenge',
        emotionalState: 'frustrated'
      },
      {
        role: 'agent',
        content: 'Let me see what I can do for you',
        timestamp: '2026-03-24T10:06:00Z',
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
      emotionalProgression: ['neutral', 'frustrated'],
      duration: 15,
      outcomeSuccess: true
    },
    stateHistory: [
      {
        round: 1,
        timestamp: '2026-03-24T10:00:00Z',
        currentPrice: 150,
        phase: 'opening',
        emotionalState: 'neutral',
        messageCount: 1,
        totalConcessionSoFar: 0
      },
      {
        round: 1,
        timestamp: '2026-03-24T10:02:00Z',
        currentPrice: 145,
        phase: 'negotiation',
        emotionalState: 'neutral',
        messageCount: 2,
        totalConcessionSoFar: 3.3
      },
      {
        round: 2,
        timestamp: '2026-03-24T10:04:00Z',
        currentPrice: 140,
        phase: 'negotiation',
        emotionalState: 'frustrated',
        messageCount: 3,
        totalConcessionSoFar: 6.7
      },
      {
        round: 2,
        timestamp: '2026-03-24T10:06:00Z',
        currentPrice: 135,
        phase: 'closure',
        emotionalState: 'neutral',
        messageCount: 4,
        totalConcessionSoFar: 10
      }
    ],
    ...overrides
  });

  let mockOnClose: jest.Mock;

  beforeEach(() => {
    mockOnClose = jest.fn();
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders replay viewer with session information', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} onClose={mockOnClose} />);

      expect(screen.getByText('Negotiation Replay')).toBeInTheDocument();
      expect(screen.getByText('Compliance Officer')).toBeInTheDocument();
      expect(screen.getByText(/Agreed \(USD 135\)/)).toBeInTheDocument();
    });

    test('renders without close button when onClose not provided', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      expect(screen.queryByRole('button', { name: /✕/ })).not.toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /✕/ });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('renders failed negotiation outcome correctly', () => {
      const session = createMockSession({
        outcome: 'deferred',
        metrics: { ...createMockSession().metrics, outcomeSuccess: false }
      });
      render(<ReplayViewer session={session} />);

      expect(screen.getByText(/❌ Deferred/)).toBeInTheDocument();
    });
  });

  describe('Message Timeline Display', () => {
    test('displays first message by default', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      expect(screen.getByText('I need carbon credits for compliance')).toBeInTheDocument();
      expect(screen.getByText('👤 Buyer')).toBeInTheDocument();
      expect(screen.getByText('INFORMATION REQUEST')).toBeInTheDocument();
      expect(screen.getByText('NEUTRAL')).toBeInTheDocument();
    });

    test('shows message counter correctly', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      expect(screen.getByText('Message 1 of 4')).toBeInTheDocument();
    });

    test('displays agent messages with correct styling', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      // Navigate to second message (agent message)
      const nextButton = screen.getByRole('button', { name: /Next →/ });
      fireEvent.click(nextButton);

      expect(screen.getByText('I can offer WREI-verified credits at competitive rates')).toBeInTheDocument();
      expect(screen.getByText('🤖 WREI Agent')).toBeInTheDocument();
    });

    test('displays argument classification and emotional state correctly', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      // Navigate to third message (price challenge)
      const nextButton = screen.getByRole('button', { name: /Next →/ });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(screen.getByText('Your price is too high, I need a better deal')).toBeInTheDocument();
      expect(screen.getByText('PRICE CHALLENGE')).toBeInTheDocument();
      expect(screen.getByText('FRUSTRATED')).toBeInTheDocument();
    });

    test('formats timestamp correctly', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      // Check if timestamp is formatted - look for the specific message timestamp
      expect(screen.getAllByText(/\d{2}:\d{2}:\d{2}/)).toHaveLength(3); // Should find timestamps in multiple places
    });
  });

  describe('Navigation Controls', () => {
    test('previous button is disabled at first message', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      const prevButton = screen.getByRole('button', { name: /Previous/ });
      expect(prevButton).toBeDisabled();
    });

    test('next button is disabled at last message', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      // Navigate to last message
      const nextButton = screen.getByRole('button', { name: /Next →/ });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      expect(nextButton).toBeDisabled();
      expect(screen.getByText('Message 4 of 4')).toBeInTheDocument();
    });

    test('can navigate forward and backward through messages', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      const nextButton = screen.getByRole('button', { name: /Next →/ });
      const prevButton = screen.getByRole('button', { name: /Previous/ });

      // Navigate forward
      fireEvent.click(nextButton);
      expect(screen.getByText('Message 2 of 4')).toBeInTheDocument();
      expect(screen.getByText('I can offer WREI-verified credits at competitive rates')).toBeInTheDocument();

      // Navigate backward
      fireEvent.click(prevButton);
      expect(screen.getByText('Message 1 of 4')).toBeInTheDocument();
      expect(screen.getByText('I need carbon credits for compliance')).toBeInTheDocument();
    });

    test('timeline slider updates message index correctly', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      const slider = screen.getByRole('slider');

      // Move slider to second message
      fireEvent.change(slider, { target: { value: '1' } });

      expect(screen.getByText('Message 2 of 4')).toBeInTheDocument();
      expect(screen.getByText('I can offer WREI-verified credits at competitive rates')).toBeInTheDocument();
    });

    test('play button functionality works', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      const playButton = screen.getByRole('button', { name: /Play/ });

      fireEvent.click(playButton);
      expect(screen.getByText('⏸️')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();

      // Click again to pause
      fireEvent.click(playButton);
      expect(screen.getByText('▶️')).toBeInTheDocument();
      expect(screen.getByText('Play')).toBeInTheDocument();
    });

    test('play speed controls update speed correctly', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      const speed2xButton = screen.getByRole('button', { name: '2x' });
      fireEvent.click(speed2xButton);

      expect(speed2xButton).toHaveClass('bg-[#0EA5E9]');
      expect(speed2xButton).toHaveClass('text-white');
    });

    test('play is disabled at last message', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      // Navigate to last message
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '3' } }); // Last message (0-indexed)

      const playButton = screen.getByRole('button', { name: /Play/ });
      expect(playButton).toBeDisabled();
    });
  });

  describe('State Panel Display', () => {
    test('displays correct state information at each point', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      // Check initial state elements exist
      expect(screen.getByText('Round 1')).toBeInTheDocument();
      expect(screen.getByText('USD 150')).toBeInTheDocument(); // Current offer
      expect(screen.getByText('Neutral')).toBeInTheDocument(); // Emotional state

      // Navigate to next message and check updated state
      const nextButton = screen.getByRole('button', { name: /Next →/ });
      fireEvent.click(nextButton);

      // Check that price updates (should be different from initial)
      expect(screen.getByText('USD 145')).toBeInTheDocument(); // Updated current offer
    });

    test('displays concession progress correctly', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      expect(screen.getByText('0.0%')).toBeInTheDocument(); // No concessions initially

      // Navigate forward to see concessions
      const nextButton = screen.getByRole('button', { name: /Next →/ });
      fireEvent.click(nextButton);

      expect(screen.getByText('3.3%')).toBeInTheDocument(); // Concession made
    });

    test('displays session summary information', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      expect(screen.getByText('4')).toBeInTheDocument(); // Total rounds
      expect(screen.getByText('USD 135')).toBeInTheDocument(); // Final price
      expect(screen.getByText('15.0 min')).toBeInTheDocument(); // Duration
      expect(screen.getByText('Yes')).toBeInTheDocument(); // Success
    });

    test('formats currency correctly in state panel', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      // Should display anchor price and floor price
      expect(screen.getByText('Anchor: USD 150')).toBeInTheDocument();
      expect(screen.getByText('Floor: USD 120')).toBeInTheDocument();
    });

    test('displays progress bars correctly', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      const progressBars = document.querySelectorAll('.bg-gray-200');
      expect(progressBars.length).toBeGreaterThan(0);

      // Check if progress bars have proper styling
      const concessionBar = document.querySelector('.bg-\\[\\#F59E0B\\]');
      expect(concessionBar).toBeInTheDocument();
    });
  });

  describe('Message Highlights', () => {
    test('displays price concession highlights', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      // Navigate to a message where price concession occurred
      const nextButton = screen.getByRole('button', { name: /Next →/ });
      fireEvent.click(nextButton); // Should show price concession

      // Look for concession highlight
      expect(screen.getByText(/Price concession/)).toBeInTheDocument();
    });

    test('displays emotional shift highlights', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      // Navigate to message with emotional shift
      const nextButton = screen.getByRole('button', { name: /Next →/ });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton); // Third message has frustrated state

      expect(screen.getByText(/Emotional shift/)).toBeInTheDocument();
    });

    test('displays strategy change highlights', () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      // Navigate to message with argument type change
      const nextButton = screen.getByRole('button', { name: /Next →/ });
      fireEvent.click(nextButton);
      fireEvent.click(nextButton); // From information_request to price_challenge

      expect(screen.getByText(/Strategy shift/)).toBeInTheDocument();
    });
  });

  describe('Auto-play Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('auto-play advances messages at correct intervals', async () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      const playButton = screen.getByRole('button', { name: /Play/ });
      fireEvent.click(playButton);

      expect(screen.getByText('Message 1 of 4')).toBeInTheDocument();

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText('Message 2 of 4')).toBeInTheDocument();
      });
    });

    test.skip('auto-play stops at last message', async () => {
      const session = createMockSession();
      render(<ReplayViewer session={session} />);

      // Start at second-to-last message
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '2' } });

      const playButton = screen.getByRole('button', { name: /Play/ });
      fireEvent.click(playButton);

      // Advance timer and let React update
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Wait for the final state with more time
      await waitFor(() => {
        expect(screen.getByText('Message 4 of 4')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Check that auto-play stopped
      await waitFor(() => {
        expect(screen.getByText('▶️')).toBeInTheDocument(); // Should revert to play button
        expect(screen.getByText('Play')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Edge Cases', () => {
    test('handles session with no messages gracefully', () => {
      const session = createMockSession({
        messages: [],
        stateHistory: []
      });

      render(<ReplayViewer session={session} />);

      expect(screen.getByText('Negotiation Replay')).toBeInTheDocument();
      expect(screen.getByText('Message 1 of 0')).toBeInTheDocument();
    });

    test('handles messages without emotional state or argument classification', () => {
      const session = createMockSession({
        messages: [
          {
            role: 'buyer',
            content: 'Simple message',
            timestamp: '2026-03-24T10:00:00Z'
          }
        ],
        stateHistory: [
          {
            round: 1,
            timestamp: '2026-03-24T10:00:00Z',
            currentPrice: 150,
            phase: 'opening',
            emotionalState: 'neutral',
            messageCount: 1,
            totalConcessionSoFar: 0
          }
        ]
      });

      render(<ReplayViewer session={session} />);

      expect(screen.getByText('Simple message')).toBeInTheDocument();
      expect(screen.queryByText(/INFORMATION REQUEST/)).not.toBeInTheDocument();
    });

    test('handles freeplay persona correctly', () => {
      const session = createMockSession({
        persona: 'freeplay'
      });

      render(<ReplayViewer session={session} />);

      expect(screen.getByText('Freeplay')).toBeInTheDocument();
    });
  });
});