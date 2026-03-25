/**
 * Competitive Positioning Component - Test Suite
 *
 * Tests for the competitive positioning visualization component.
 * Covers UI rendering, interactions, view modes, and data display.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement D1: Competitive Positioning Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompetitivePositioning from '@/components/market/CompetitivePositioning';
import * as competitiveAnalysis from '@/lib/competitive-analysis';

// Mock the competitive analysis module
// Note: Mock data must be defined inside the jest.mock factory to avoid
// temporal dead zone issues with ts-jest hoisting.
jest.mock('@/lib/competitive-analysis', () => ({
  ...jest.requireActual('@/lib/competitive-analysis'),
  analyzeCompetitivePosition: jest.fn(),
  generateStrategicRecommendations: jest.fn(),
  calculateMarketOpportunity: jest.fn(),
  benchmarkPerformance: jest.fn(),
  COMPETITOR_PROFILES: [
    {
      id: 'competitor1',
      name: 'Traditional Exchange',
      category: 'traditional_exchange',
      description: 'Established market exchange',
      marketShare: 45.2,
      positioning: {
        price: 85,
        verification_quality: 60,
        liquidity: 95,
        transaction_speed: 30,
        regulatory_compliance: 70,
        market_coverage: 90,
        technology_innovation: 25,
        institutional_focus: 60,
      },
      strengths: ['High liquidity', 'Market presence'],
      weaknesses: ['Slow settlement', 'Limited tech'],
      keyFeatures: ['High volume', 'Established standards'],
      marketMetrics: {
        dailyVolume: 285.4,
        totalAssets: 12500.0,
        activeUsers: 8500,
        institutionalClients: 950,
        averageTransactionSize: 45000,
      }
    }
  ],
  WREI_PROFILE: {
    id: 'wrei',
    name: 'WREI (Water Roads)',
    category: 'blockchain_native',
    description: 'AI-powered negotiation platform',
    marketShare: 2.5,
    positioning: {
      price: 75,
      verification_quality: 95,
      liquidity: 60,
      transaction_speed: 90,
      regulatory_compliance: 95,
      market_coverage: 70,
      technology_innovation: 95,
      institutional_focus: 90,
    },
    strengths: ['AI-driven negotiation', 'dMRV verification'],
    weaknesses: ['Emerging market presence'],
    keyFeatures: ['AI negotiation', 'T+0 settlement'],
    marketMetrics: {
      dailyVolume: 15.2,
      totalAssets: 450.7,
      activeUsers: 1250,
      institutionalClients: 180,
      averageTransactionSize: 125000,
    }
  },
}));

// Re-import mocked values for use in test assertions
const mockCompetitorProfiles = (competitiveAnalysis as any).COMPETITOR_PROFILES;
const mockWreiProfile = (competitiveAnalysis as any).WREI_PROFILE;

describe('CompetitivePositioning Component', () => {

  const mockDimensionAnalysis = {
    dimension: 'verification_quality',
    competitors: [
      {
        profile: mockWreiProfile,
        score: 95,
        rank: 1,
        marketShare: 2.5
      },
      {
        profile: mockCompetitorProfiles[0],
        score: 60,
        rank: 2,
        marketShare: 45.2
      }
    ],
    wreiBenchmark: {
      score: 95,
      rank: 1,
      strengthVsAverage: 58.3,
      topCompetitorGap: 0
    }
  };

  const mockStrategicRecommendations = {
    keyOpportunities: [
      'Leverage AI negotiation advantage',
      'Expand verification coverage',
      'Build institutional partnerships'
    ],
    competitiveThreats: [
      'Traditional exchanges dominate volume',
      'Regulatory uncertainty',
      'Competition for talent'
    ],
    strategicMoves: [
      'Enhance API capabilities',
      'Build exchange partnerships',
      'Develop premium tiers'
    ],
    positioningAdvice: [
      'Emphasize technology leadership',
      'Focus on quality premium',
      'Target innovation-forward clients'
    ]
  };

  const mockMarketOpportunity = {
    totalMarketSize: 15000,
    addressableMarket: 3250,
    competitorGap: 850,
    growthPotential: [
      {
        dimension: 'verification_quality',
        marketShare: 0.15,
        opportunitySize: 400
      },
      {
        dimension: 'technology_innovation',
        marketShare: 0.12,
        opportunitySize: 350
      }
    ]
  };

  const mockBenchmarkPerformance = {
    wreiBenchmark: 15.2,
    competitorAverage: 125.8,
    topPerformer: { name: 'Traditional Exchange', value: 285.4 },
    percentileRank: 25,
    improvementTarget: 45.0
  };

  beforeEach(() => {
    // Setup mocks
    (competitiveAnalysis.analyzeCompetitivePosition as jest.Mock).mockReturnValue(mockDimensionAnalysis);
    (competitiveAnalysis.generateStrategicRecommendations as jest.Mock).mockReturnValue(mockStrategicRecommendations);
    (competitiveAnalysis.calculateMarketOpportunity as jest.Mock).mockReturnValue(mockMarketOpportunity);
    (competitiveAnalysis.benchmarkPerformance as jest.Mock).mockReturnValue(mockBenchmarkPerformance);
  });

  describe('Component Rendering', () => {
    test('renders component with default props', () => {
      render(<CompetitivePositioning />);

      expect(screen.getByText('Competitive Positioning')).toBeInTheDocument();
      expect(screen.getByText('Strategic market analysis and competitive intelligence')).toBeInTheDocument();
    });

    test('renders view toggle buttons', () => {
      render(<CompetitivePositioning />);

      expect(screen.getByText('Matrix')).toBeInTheDocument();
      expect(screen.getByText('Analysis')).toBeInTheDocument();
      expect(screen.getByText('Strategy')).toBeInTheDocument();
      expect(screen.getByText('Metrics')).toBeInTheDocument();
    });

    test('renders matrix view by default', () => {
      render(<CompetitivePositioning />);

      expect(screen.getByText('Competitive Positioning Matrix')).toBeInTheDocument();
      expect(screen.getByText('Competitor')).toBeInTheDocument();
    });

    test('displays competitor information in matrix view', () => {
      render(<CompetitivePositioning />);

      expect(screen.getByText('WREI (Water Roads)')).toBeInTheDocument();
      expect(screen.getByText('Traditional Exchange')).toBeInTheDocument();
    });
  });

  describe('View Mode Switching', () => {
    test('switches to dimension analysis view', async () => {
      render(<CompetitivePositioning />);

      fireEvent.click(screen.getByText('Analysis'));

      await waitFor(() => {
        expect(screen.getByText('Detailed Dimension Analysis')).toBeInTheDocument();
      });
    });

    test('switches to recommendations view', async () => {
      render(<CompetitivePositioning />);

      fireEvent.click(screen.getByText('Strategy'));

      await waitFor(() => {
        expect(screen.getByText(/Strategic Recommendations for/)).toBeInTheDocument();
        expect(screen.getByText('Key Opportunities')).toBeInTheDocument();
      });
    });

    test('switches to benchmarks view', async () => {
      render(<CompetitivePositioning />);

      fireEvent.click(screen.getByText('Metrics'));

      await waitFor(() => {
        expect(screen.getByText('Performance Benchmarks')).toBeInTheDocument();
      });
    });

    test('active view button has correct styling', () => {
      render(<CompetitivePositioning />);

      const matrixButton = screen.getByText('Matrix');
      expect(matrixButton).toHaveClass('bg-white');

      const analysisButton = screen.getByText('Analysis');
      expect(analysisButton).not.toHaveClass('bg-white');

      fireEvent.click(analysisButton);

      expect(analysisButton).toHaveClass('bg-white');
      expect(matrixButton).not.toHaveClass('bg-white');
    });
  });

  describe('Matrix View', () => {
    test('renders competitor positioning scores', () => {
      render(<CompetitivePositioning />);

      // Should show positioning scores for competitors
      expect(screen.getAllByText('95').length).toBeGreaterThanOrEqual(1); // WREI verification quality
      expect(screen.getAllByText('60').length).toBeGreaterThanOrEqual(1); // Competitor verification quality
    });

    test('displays market share information', () => {
      render(<CompetitivePositioning />);

      expect(screen.getByText('2.5% share')).toBeInTheDocument();
      expect(screen.getByText('45.2% share')).toBeInTheDocument();
    });

    test('shows dimension headers correctly', () => {
      render(<CompetitivePositioning />);

      // Check for some dimension headers (may be abbreviated)
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Verification')).toBeInTheDocument();
    });

    test('applies correct styling for WREI vs competitors', () => {
      render(<CompetitivePositioning />);

      const wreiRow = screen.getByText('WREI (Water Roads)').closest('.grid');
      const competitorRow = screen.getByText('Traditional Exchange').closest('.grid');

      expect(wreiRow).toHaveClass('bg-sky-50');
      expect(competitorRow).not.toHaveClass('bg-sky-50');
    });
  });

  describe('Dimension Analysis View', () => {
    beforeEach(() => {
      render(<CompetitivePositioning />);
      fireEvent.click(screen.getByText('Analysis'));
    });

    test('renders dimension selector buttons', async () => {
      await waitFor(() => {
        expect(screen.getByText('Price Competitiveness')).toBeInTheDocument();
        expect(screen.getByText('Verification Quality')).toBeInTheDocument();
        expect(screen.getByText('Market Liquidity')).toBeInTheDocument();
      });
    });

    test('switches dimension analysis correctly', async () => {
      await waitFor(() => {
        const priceButton = screen.getByText('Price Competitiveness');
        fireEvent.click(priceButton);
      });

      expect(competitiveAnalysis.analyzeCompetitivePosition).toHaveBeenCalledWith('price', true);
    });

    test('displays market ranking information', async () => {
      await waitFor(() => {
        expect(screen.getByText('Market Ranking')).toBeInTheDocument();
        expect(screen.getByText('WREI Performance')).toBeInTheDocument();
      });
    });

    test('shows WREI performance metrics', async () => {
      await waitFor(() => {
        expect(screen.getAllByText('95').length).toBeGreaterThanOrEqual(1); // Current score
        expect(screen.getByText(/Rank #1/)).toBeInTheDocument();
        expect(screen.getByText('+58.3%')).toBeInTheDocument(); // vs average
      });
    });
  });

  describe('Strategic Recommendations View', () => {
    beforeEach(() => {
      render(<CompetitivePositioning />);
      fireEvent.click(screen.getByText('Strategy'));
    });

    test('displays strategic recommendation categories', async () => {
      await waitFor(() => {
        expect(screen.getByText('Key Opportunities')).toBeInTheDocument();
        expect(screen.getByText('Competitive Threats')).toBeInTheDocument();
        expect(screen.getByText('Strategic Moves')).toBeInTheDocument();
        expect(screen.getByText('Positioning Advice')).toBeInTheDocument();
      });
    });

    test('shows recommendation items', async () => {
      await waitFor(() => {
        expect(screen.getByText('Leverage AI negotiation advantage')).toBeInTheDocument();
        expect(screen.getByText('Traditional exchanges dominate volume')).toBeInTheDocument();
        expect(screen.getByText('Enhance API capabilities')).toBeInTheDocument();
        expect(screen.getByText('Emphasize technology leadership')).toBeInTheDocument();
      });
    });

    test('displays market opportunity metrics', async () => {
      await waitFor(() => {
        expect(screen.getByText('Market Opportunity Analysis')).toBeInTheDocument();
        expect(screen.getByText('$15,000M')).toBeInTheDocument(); // Total market
        expect(screen.getByText('$3,250M')).toBeInTheDocument(); // Addressable
        expect(screen.getByText('$850M')).toBeInTheDocument(); // Opportunity gap
      });
    });

    test('updates recommendations based on target segment', () => {
      render(<CompetitivePositioning targetSegment="sophisticated" />);
      const strategyButtons = screen.getAllByText(/Strategy/);
      fireEvent.click(strategyButtons[strategyButtons.length - 1]);

      expect(competitiveAnalysis.generateStrategicRecommendations).toHaveBeenCalledWith('sophisticated');
    });
  });

  describe('Performance Benchmarks View', () => {
    beforeEach(() => {
      render(<CompetitivePositioning />);
      fireEvent.click(screen.getByText('Metrics'));
    });

    test('displays benchmark categories', async () => {
      await waitFor(() => {
        expect(screen.getByText('Performance Benchmarks')).toBeInTheDocument();
        expect(screen.getByText('Daily Volume')).toBeInTheDocument();
        expect(screen.getByText('Avg Transaction')).toBeInTheDocument();
      });
    });

    test('shows benchmark metrics correctly', async () => {
      await waitFor(() => {
        expect(screen.getAllByText('15.2').length).toBeGreaterThanOrEqual(1); // WREI current
        expect(screen.getAllByText('125.8').length).toBeGreaterThanOrEqual(1); // Market average
        expect(screen.getAllByText('Traditional Exchange').length).toBeGreaterThanOrEqual(1); // Top performer
        expect(screen.getAllByText('285.4').length).toBeGreaterThanOrEqual(1); // Top performer value
      });
    });

    test('displays percentile information', async () => {
      await waitFor(() => {
        expect(screen.getAllByText('Percentile: 25th').length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Competitor Interaction', () => {
    test('opens competitor detail modal when competitor is clicked', async () => {
      render(<CompetitivePositioning />);

      const competitorRow = screen.getByText('Traditional Exchange').closest('.grid');
      fireEvent.click(competitorRow!);

      await waitFor(() => {
        expect(screen.getByText('Established market exchange')).toBeInTheDocument();
        expect(screen.getByText('Strengths')).toBeInTheDocument();
        expect(screen.getByText('Weaknesses')).toBeInTheDocument();
      });
    });

    test('displays competitor strengths and weaknesses in modal', async () => {
      render(<CompetitivePositioning />);

      const competitorRow = screen.getByText('Traditional Exchange').closest('.grid');
      fireEvent.click(competitorRow!);

      await waitFor(() => {
        expect(screen.getByText('High liquidity')).toBeInTheDocument();
        expect(screen.getByText('Slow settlement')).toBeInTheDocument();
      });
    });

    test('closes competitor modal when close button is clicked', async () => {
      render(<CompetitivePositioning />);

      const competitorRow = screen.getByText('Traditional Exchange').closest('.grid');
      fireEvent.click(competitorRow!);

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: '' });
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('Established market exchange')).not.toBeInTheDocument();
      });
    });

    test('calls onCompetitorSelect callback when provided', async () => {
      const mockCallback = jest.fn();
      render(<CompetitivePositioning onCompetitorSelect={mockCallback} />);

      const competitorRow = screen.getByText('Traditional Exchange').closest('.grid');
      fireEvent.click(competitorRow!);

      expect(mockCallback).toHaveBeenCalledWith(mockCompetitorProfiles[0]);
    });
  });

  describe('Props and Configuration', () => {
    test('accepts targetSegment prop and passes it to strategic analysis', () => {
      render(<CompetitivePositioning targetSegment="professional" />);

      expect(competitiveAnalysis.generateStrategicRecommendations).toHaveBeenCalledWith('professional');
    });

    test('handles showDetailedView prop', () => {
      render(<CompetitivePositioning showDetailedView={true} />);

      // Should still render normally - this prop is for future detailed view features
      expect(screen.getByText('Competitive Positioning')).toBeInTheDocument();
    });

    test('defaults to wholesale segment when targetSegment not provided', () => {
      render(<CompetitivePositioning />);

      expect(competitiveAnalysis.generateStrategicRecommendations).toHaveBeenCalledWith('wholesale');
    });
  });

  describe('Data Integration', () => {
    test('calls competitive analysis functions with correct parameters', () => {
      render(<CompetitivePositioning />);

      expect(competitiveAnalysis.analyzeCompetitivePosition).toHaveBeenCalledWith('verification_quality', true);
      expect(competitiveAnalysis.calculateMarketOpportunity).toHaveBeenCalled();
      expect(competitiveAnalysis.benchmarkPerformance).toHaveBeenCalledWith('volume');
    });

    test('updates analysis when dimension changes', async () => {
      render(<CompetitivePositioning />);
      fireEvent.click(screen.getByText('Analysis'));

      await waitFor(() => {
        const priceButton = screen.getByText('Price Competitiveness');
        fireEvent.click(priceButton);
      });

      expect(competitiveAnalysis.analyzeCompetitivePosition).toHaveBeenCalledWith('price', true);
    });

    test('handles empty competitor data gracefully', () => {
      // Temporarily mock empty response
      (competitiveAnalysis.analyzeCompetitivePosition as jest.Mock).mockReturnValue({
        dimension: 'verification_quality',
        competitors: [],
        wreiBenchmark: { score: 0, rank: 0, strengthVsAverage: 0, topCompetitorGap: 0 }
      });

      render(<CompetitivePositioning />);

      expect(screen.getByText('Competitive Positioning')).toBeInTheDocument();
      // Should not crash with empty data
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(<CompetitivePositioning />);

      const mainHeading = screen.getByRole('heading', { level: 2, name: 'Competitive Positioning' });
      expect(mainHeading).toBeInTheDocument();
    });

    test('view toggle buttons are accessible', () => {
      render(<CompetitivePositioning />);

      const matrixButton = screen.getByRole('button', { name: /Matrix/i });
      const analysisButton = screen.getByRole('button', { name: /Analysis/i });

      expect(matrixButton).toBeInTheDocument();
      expect(analysisButton).toBeInTheDocument();

      // Should be keyboard accessible
      matrixButton.focus();
      expect(document.activeElement).toBe(matrixButton);
    });

    test('competitor detail modal has proper close button', async () => {
      render(<CompetitivePositioning />);

      const competitorRow = screen.getByText('Traditional Exchange').closest('.grid');
      fireEvent.click(competitorRow!);

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: '' });
        expect(closeButton).toBeInTheDocument();
      });
    });

    test('dimension selector buttons have proper labels', async () => {
      render(<CompetitivePositioning />);
      fireEvent.click(screen.getByText('Analysis'));

      await waitFor(() => {
        const dimensionButton = screen.getByRole('button', { name: 'Price Competitiveness' });
        expect(dimensionButton).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('renders grid layouts properly', () => {
      render(<CompetitivePositioning />);

      // Matrix should have proper grid classes
      const matrixContainer = screen.getByText('Competitor').closest('.grid');
      expect(matrixContainer).toHaveClass('grid-cols-9');
    });

    test('handles different screen sizes', () => {
      render(<CompetitivePositioning />);

      // Should have responsive classes
      const container = screen.getByText(/Strategic market analysis/).closest('div');
      expect(container?.closest('.flex')).toHaveClass('sm:flex-row');
    });
  });
});