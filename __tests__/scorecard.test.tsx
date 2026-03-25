import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Scorecard from '@/components/negotiation/Scorecard';
import { NegotiationScorecard } from '@/lib/negotiation-scoring';

// Mock ResizeObserver for Recharts compatibility
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

describe('Scorecard', () => {
  // Helper to create mock scorecard
  const createMockScorecard = (overrides: Partial<NegotiationScorecard> = {}): NegotiationScorecard => ({
    priceScore: 75,
    efficiencyScore: 80,
    strategyScore: 70,
    emotionalIntelligenceScore: 85,
    informationExtractionScore: 65,
    overallScore: 76,
    letterGrade: 'B+',
    personaOptimal: false,
    improvementSuggestions: [
      'Try holding firm longer - compliance officers typically accept higher prices',
      'Diversify your negotiation tactics with more argument types'
    ],
    benchmarkData: {
      expectedPriceAchievement: 75,
      expectedRounds: 4,
      expectedStrategyDiversity: 3,
      expectedSuccessRate: 85,
      difficultyMultiplier: 0.9,
      strongestArguments: ['authority_constraint', 'information_request'],
      emotionalProfile: {
        startingEmotion: 'neutral',
        volatility: 0.3,
        concessionTriggers: ['pressured', 'frustrated']
      }
    },
    ...overrides
  });

  let mockOnClose: jest.Mock;

  beforeEach(() => {
    mockOnClose = jest.fn();
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders scorecard with basic information', () => {
      const scorecard = createMockScorecard();
      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      expect(screen.getByText('Negotiation Scorecard')).toBeInTheDocument();
      expect(screen.getByText('Compliance Officer')).toBeInTheDocument();
      expect(screen.getByText('B+')).toBeInTheDocument();
      expect(screen.getByText('76/100')).toBeInTheDocument();
    });

    test('renders close button when onClose provided', () => {
      const scorecard = createMockScorecard();
      render(<Scorecard scorecard={scorecard} persona="compliance_officer" onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /✕/ });
      expect(closeButton).toBeInTheDocument();

      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not render close button when onClose not provided', () => {
      const scorecard = createMockScorecard();
      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      expect(screen.queryByRole('button', { name: /✕/ })).not.toBeInTheDocument();
    });

    test('displays persona optimal badge when applicable', () => {
      const scorecard = createMockScorecard({
        personaOptimal: true,
        overallScore: 92,
        letterGrade: 'A'
      });

      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      expect(screen.getByText(/🌟 Persona Optimal/)).toBeInTheDocument();
    });

    test('does not display persona optimal badge when not applicable', () => {
      const scorecard = createMockScorecard({ personaOptimal: false });
      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      expect(screen.queryByText(/🌟 Persona Optimal/)).not.toBeInTheDocument();
    });
  });

  describe('Grade Display', () => {
    test('displays correct grade badge for different letter grades', () => {
      const grades: Array<NegotiationScorecard['letterGrade']> = ['A+', 'B', 'C-', 'D', 'F'];

      grades.forEach(grade => {
        const scorecard = createMockScorecard({ letterGrade: grade });
        const { rerender } = render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

        expect(screen.getByText(grade)).toBeInTheDocument();

        rerender(<div />); // Clear for next iteration
      });
    });

    test('displays appropriate performance messages for different grades', () => {
      const aGradeScorecard = createMockScorecard({ letterGrade: 'A', overallScore: 93 });
      const { rerender } = render(<Scorecard scorecard={aGradeScorecard} persona="compliance_officer" />);

      expect(screen.getByText(/Excellent work! Your negotiation skills are very strong./)).toBeInTheDocument();

      const fGradeScorecard = createMockScorecard({ letterGrade: 'F', overallScore: 45 });
      rerender(<Scorecard scorecard={fGradeScorecard} persona="compliance_officer" />);

      expect(screen.getByText(/Don't give up! Learn from this experience and try again./)).toBeInTheDocument();
    });
  });

  describe('Score Dimensions Display', () => {
    test('renders all score dimensions correctly', () => {
      const scorecard = createMockScorecard({
        priceScore: 85,
        efficiencyScore: 78,
        strategyScore: 92,
        emotionalIntelligenceScore: 67,
        informationExtractionScore: 74
      });

      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      expect(screen.getByText('Price Achievement')).toBeInTheDocument();
      expect(screen.getByText('Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Strategy Diversity')).toBeInTheDocument();
      expect(screen.getByText('Emotional Intelligence')).toBeInTheDocument();
      expect(screen.getByText('Information Extraction')).toBeInTheDocument();

      // Check that scores are displayed
      expect(screen.getByText('85')).toBeInTheDocument(); // Price score
      expect(screen.getByText('78')).toBeInTheDocument(); // Efficiency score
      expect(screen.getByText('92')).toBeInTheDocument(); // Strategy score
      expect(screen.getByText('67')).toBeInTheDocument(); // EI score
      expect(screen.getByText('74')).toBeInTheDocument(); // Information score
    });

    test('displays score icons based on performance level', () => {
      const scorecard = createMockScorecard({
        priceScore: 95, // Should show trophy icon
        efficiencyScore: 85, // Should show target icon
        strategyScore: 75, // Should show thumbs up
        emotionalIntelligenceScore: 65, // Should show chart icon
        informationExtractionScore: 50  // Should show books icon
      });

      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      // Check for various score icons (emoji presence)
      expect(screen.getByText('🏆')).toBeInTheDocument(); // Trophy for 95
      expect(screen.getByText('🎯')).toBeInTheDocument(); // Target for 85
      expect(screen.getByText('👍')).toBeInTheDocument(); // Thumbs up for 75
      expect(screen.getByText('📈')).toBeInTheDocument(); // Chart for 65
      expect(screen.getByText('📚')).toBeInTheDocument(); // Books for 50
    });
  });

  describe('Improvement Suggestions', () => {
    test('displays improvement suggestions when available', () => {
      const scorecard = createMockScorecard({
        improvementSuggestions: [
          'Focus on price negotiation techniques',
          'Try using more diverse argument types',
          'Work on emotional intelligence in negotiations'
        ]
      });

      render(<Scorecard scorecard={scorecard} persona="trading_desk" />);

      expect(screen.getByText('Personalised Improvement Tips')).toBeInTheDocument();
      expect(screen.getByText('Focus on price negotiation techniques')).toBeInTheDocument();
      expect(screen.getByText('Try using more diverse argument types')).toBeInTheDocument();
      expect(screen.getByText('Work on emotional intelligence in negotiations')).toBeInTheDocument();
    });

    test('displays perfect performance message when no suggestions', () => {
      const scorecard = createMockScorecard({
        improvementSuggestions: [],
        letterGrade: 'A+',
        overallScore: 98
      });

      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      expect(screen.getByText('Perfect performance!')).toBeInTheDocument();
      expect(screen.getByText('You\'ve mastered this negotiation scenario.')).toBeInTheDocument();
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });

    test('numbers improvement suggestions correctly', () => {
      const scorecard = createMockScorecard({
        improvementSuggestions: [
          'First suggestion',
          'Second suggestion'
        ]
      });

      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('First suggestion')).toBeInTheDocument();
      expect(screen.getByText('Second suggestion')).toBeInTheDocument();
    });
  });

  describe('Benchmark Details', () => {
    test('toggles benchmark details when clicked', () => {
      const scorecard = createMockScorecard();
      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      const toggleButton = screen.getByRole('button', { name: /Persona Benchmark Details/ });
      expect(toggleButton).toBeInTheDocument();

      // Initially collapsed
      expect(screen.queryByText('Expected Performance')).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(toggleButton);
      expect(screen.getByText('Expected Performance')).toBeInTheDocument();
      expect(screen.getByText('Effective Arguments')).toBeInTheDocument();
      expect(screen.getByText('Emotional Profile')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Expected Performance')).not.toBeInTheDocument();
    });

    test('displays benchmark information correctly', () => {
      const scorecard = createMockScorecard({
        benchmarkData: {
          expectedPriceAchievement: 80,
          expectedRounds: 5,
          expectedSuccessRate: 90,
          difficultyMultiplier: 1.3,
          strongestArguments: ['price_challenge', 'fairness_appeal'],
          emotionalProfile: {
            startingEmotion: 'enthusiastic',
            volatility: 0.4,
            concessionTriggers: ['satisfied', 'pressured']
          },
          expectedStrategyDiversity: 3
        }
      });

      render(<Scorecard scorecard={scorecard} persona="esg_fund_manager" />);

      // Expand details
      fireEvent.click(screen.getByRole('button', { name: /Persona Benchmark Details/ }));

      expect(screen.getByText('80%')).toBeInTheDocument(); // Price achievement
      expect(screen.getByText('5')).toBeInTheDocument(); // Expected rounds
      expect(screen.getByText('90%')).toBeInTheDocument(); // Success rate
      expect(screen.getByText('Hard')).toBeInTheDocument(); // Difficulty level (1.3 multiplier)

      expect(screen.getByText('price challenge')).toBeInTheDocument();
      expect(screen.getByText('fairness appeal')).toBeInTheDocument();

      expect(screen.getByText('enthusiastic')).toBeInTheDocument(); // Starting emotion
      expect(screen.getByText('Moderate')).toBeInTheDocument(); // Volatility (0.4)
    });

    test('shows easy difficulty level', () => {
      const scorecard = createMockScorecard({
        benchmarkData: {
          expectedPriceAchievement: 75,
          expectedRounds: 4,
          expectedStrategyDiversity: 3,
          expectedSuccessRate: 85,
          difficultyMultiplier: 0.8,
          strongestArguments: ['authority_constraint', 'information_request'],
          emotionalProfile: {
            startingEmotion: 'neutral',
            volatility: 0.3,
            concessionTriggers: ['pressured', 'frustrated']
          }
        }
      });

      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);
      fireEvent.click(screen.getByRole('button', { name: /Persona Benchmark Details/ }));

      // Look for "Easy" in the specific context of difficulty level
      const difficultyRow = screen.getByText('Difficulty Level:').closest('div');
      expect(difficultyRow).toHaveTextContent('Easy');
    });

    test('shows hard difficulty level', () => {
      const scorecard = createMockScorecard({
        benchmarkData: {
          expectedPriceAchievement: 75,
          expectedRounds: 4,
          expectedStrategyDiversity: 3,
          expectedSuccessRate: 85,
          difficultyMultiplier: 1.3,
          strongestArguments: ['authority_constraint', 'information_request'],
          emotionalProfile: {
            startingEmotion: 'neutral',
            volatility: 0.3,
            concessionTriggers: ['pressured', 'frustrated']
          }
        }
      });

      render(<Scorecard scorecard={scorecard} persona="trading_desk" />);
      fireEvent.click(screen.getByRole('button', { name: /Persona Benchmark Details/ }));

      // Look for "Hard" in the specific context of difficulty level
      const difficultyRow = screen.getByText('Difficulty Level:').closest('div');
      expect(difficultyRow).toHaveTextContent('Hard');
    });

    test('shows moderate difficulty level', () => {
      const scorecard = createMockScorecard({
        benchmarkData: {
          expectedPriceAchievement: 75,
          expectedRounds: 4,
          expectedStrategyDiversity: 3,
          expectedSuccessRate: 85,
          difficultyMultiplier: 1.0,
          strongestArguments: ['authority_constraint', 'information_request'],
          emotionalProfile: {
            startingEmotion: 'neutral',
            volatility: 0.3,
            concessionTriggers: ['pressured', 'frustrated']
          }
        }
      });

      render(<Scorecard scorecard={scorecard} persona="sustainability_director" />);
      fireEvent.click(screen.getByRole('button', { name: /Persona Benchmark Details/ }));

      // Look for "Moderate" in the specific context of difficulty level
      const difficultyRow = screen.getByText('Difficulty Level:').closest('div');
      expect(difficultyRow).toHaveTextContent('Moderate');
    });
  });

  describe('Share Functionality', () => {
    test('handles share button click and copies to clipboard', async () => {
      const scorecard = createMockScorecard();
      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      const shareButton = screen.getByRole('button', { name: /Share Results/ });
      fireEvent.click(shareButton);

      // Should show copying state
      expect(screen.getByText('Copying...')).toBeInTheDocument();

      // Wait for clipboard operation and state update
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      // Verify clipboard.writeText was called
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('WREI Negotiation Results')
      );
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Compliance Officer')
      );
    });

    test('handles clipboard API failure gracefully', async () => {
      // Mock clipboard API failure
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error('Clipboard not available'));

      // Mock document.execCommand for fallback - just make it available and return true
      const originalExecCommand = document.execCommand;
      document.execCommand = jest.fn().mockReturnValue(true);

      const scorecard = createMockScorecard();
      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      const shareButton = screen.getByRole('button', { name: /Share Results/ });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      // Restore original
      document.execCommand = originalExecCommand;
    });

    test('resets share status after timeout', async () => {
      jest.useFakeTimers();

      // Mock clipboard failure and execCommand fallback
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error('Clipboard not available'));
      const originalExecCommand = document.execCommand;
      document.execCommand = jest.fn().mockReturnValue(true);

      const scorecard = createMockScorecard();
      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      const shareButton = screen.getByRole('button', { name: /Share Results/ });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      // Fast-forward time
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText('Share Results')).toBeInTheDocument();
      });

      // Cleanup
      document.execCommand = originalExecCommand;
      jest.useRealTimers();
    });
  });

  describe('Persona Name Formatting', () => {
    test('formats different persona names correctly', () => {
      const personas: Array<{ persona: string; expected: string }> = [
        { persona: 'compliance_officer', expected: 'Compliance Officer' },
        { persona: 'esg_fund_manager', expected: 'Esg Fund Manager' },
        { persona: 'trading_desk', expected: 'Trading Desk' },
        { persona: 'government_procurement', expected: 'Government Procurement' },
        { persona: 'freeplay', expected: 'Freeplay' }
      ];

      personas.forEach(({ persona, expected }) => {
        const scorecard = createMockScorecard();
        const { rerender } = render(<Scorecard scorecard={scorecard} persona={persona as any} />);

        expect(screen.getByText(expected)).toBeInTheDocument();

        rerender(<div />); // Clear for next iteration
      });
    });
  });

  describe('Radar Chart Integration', () => {
    test('renders radar chart component', () => {
      const scorecard = createMockScorecard();
      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      expect(screen.getByText('Performance Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Your Performance')).toBeInTheDocument();
      expect(screen.getByText('Expected Level')).toBeInTheDocument();
    });
  });

  describe('Call to Action', () => {
    test('displays call to action section', () => {
      const scorecard = createMockScorecard();
      render(<Scorecard scorecard={scorecard} persona="compliance_officer" />);

      expect(screen.getByText('Ready for Another Challenge?')).toBeInTheDocument();
      expect(screen.getByText('Try negotiating with different personas to master various trading scenarios.')).toBeInTheDocument();
      expect(screen.getByText('🚀 Start New Negotiation')).toBeInTheDocument();
    });
  });
});