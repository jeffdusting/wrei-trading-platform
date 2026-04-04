/**
 * Competitive Analysis - Test Suite
 *
 * Tests for competitive positioning logic, market analysis, and strategic recommendations.
 * Covers competitor profiles, analysis functions, and strategic insights.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement D1: Competitive Analysis Tests
 */

import {
  analyzeCompetitivePosition,
  generateStrategicRecommendations,
  calculateMarketOpportunity,
  benchmarkPerformance,
  WREI_PROFILE,
  COMPETITOR_PROFILES,
  type CompetitorProfile,
  type PositioningDimension
} from '@/lib/competitive-analysis';

describe('Competitive Analysis', () => {
  describe('Data Integrity', () => {
    test('WREI profile has complete data structure', () => {
      expect(WREI_PROFILE).toHaveProperty('id');
      expect(WREI_PROFILE).toHaveProperty('name');
      expect(WREI_PROFILE).toHaveProperty('category');
      expect(WREI_PROFILE).toHaveProperty('positioning');
      expect(WREI_PROFILE).toHaveProperty('marketMetrics');

      // Check positioning scores are within valid range
      Object.values(WREI_PROFILE.positioning).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });

      // Check market metrics are positive numbers
      expect(WREI_PROFILE.marketMetrics.dailyVolume).toBeGreaterThan(0);
      expect(WREI_PROFILE.marketMetrics.totalAssets).toBeGreaterThan(0);
      expect(WREI_PROFILE.marketMetrics.activeUsers).toBeGreaterThan(0);
    });

    test('all competitor profiles have required fields', () => {
      expect(COMPETITOR_PROFILES.length).toBeGreaterThan(0);

      COMPETITOR_PROFILES.forEach(competitor => {
        expect(competitor).toHaveProperty('id');
        expect(competitor).toHaveProperty('name');
        expect(competitor).toHaveProperty('category');
        expect(competitor).toHaveProperty('positioning');
        expect(competitor).toHaveProperty('marketMetrics');
        expect(competitor).toHaveProperty('strengths');
        expect(competitor).toHaveProperty('weaknesses');

        // Validate positioning dimensions
        Object.keys(competitor.positioning).forEach(dimension => {
          expect(['price', 'verification_quality', 'liquidity', 'transaction_speed',
                   'regulatory_compliance', 'market_coverage', 'technology_innovation',
                   'institutional_focus']).toContain(dimension);
        });

        // Check scores are valid
        Object.values(competitor.positioning).forEach(score => {
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        });
      });
    });

    test('market share percentages are reasonable', () => {
      const totalMarketShare = COMPETITOR_PROFILES.reduce(
        (sum, competitor) => sum + competitor.marketShare,
        WREI_PROFILE.marketShare
      );

      // Total market share should be reasonable (not exceed 100% by much due to overlaps)
      expect(totalMarketShare).toBeLessThan(150);
      expect(totalMarketShare).toBeGreaterThan(50);

      // Individual market shares should be reasonable
      [...COMPETITOR_PROFILES, WREI_PROFILE].forEach(competitor => {
        expect(competitor.marketShare).toBeGreaterThan(0);
        expect(competitor.marketShare).toBeLessThan(60); // No single player dominates completely
      });
    });
  });

  describe('analyzeCompetitivePosition', () => {
    test('analyzes positioning dimension correctly', () => {
      const analysis = analyzeCompetitivePosition('verification_quality', true);

      expect(analysis).toHaveProperty('dimension');
      expect(analysis.dimension).toBe('verification_quality');
      expect(analysis).toHaveProperty('competitors');
      expect(analysis).toHaveProperty('wreiBenchmark');

      // Should include WREI and all competitors
      expect(analysis.competitors.length).toBe(COMPETITOR_PROFILES.length + 1);

      // Competitors should be sorted by score (descending)
      for (let i = 0; i < analysis.competitors.length - 1; i++) {
        expect(analysis.competitors[i].score).toBeGreaterThanOrEqual(
          analysis.competitors[i + 1].score
        );
      }

      // Ranks should be sequential
      analysis.competitors.forEach((competitor, index) => {
        expect(competitor.rank).toBe(index + 1);
      });
    });

    test('excludes WREI when includeWREI is false', () => {
      const analysis = analyzeCompetitivePosition('price', false);

      expect(analysis.competitors.length).toBe(COMPETITOR_PROFILES.length);
      expect(analysis.competitors.every(c => c.profile.id !== 'wrei')).toBe(true);
    });

    test('calculates WREI benchmark metrics correctly', () => {
      const analysis = analyzeCompetitivePosition('technology_innovation', true);

      expect(analysis.wreiBenchmark).toHaveProperty('score');
      expect(analysis.wreiBenchmark).toHaveProperty('rank');
      expect(analysis.wreiBenchmark).toHaveProperty('strengthVsAverage');
      expect(analysis.wreiBenchmark).toHaveProperty('topCompetitorGap');

      // WREI should have high technology innovation score
      expect(analysis.wreiBenchmark.score).toBeGreaterThanOrEqual(80);

      // Strength vs average should be calculated correctly
      const competitorScores = analysis.competitors
        .filter(c => c.profile.id !== 'wrei')
        .map(c => c.score);
      const avgCompetitorScore = competitorScores.reduce((a, b) => a + b, 0) / competitorScores.length;
      const expectedStrengthVsAvg = (analysis.wreiBenchmark.score - avgCompetitorScore) / avgCompetitorScore * 100;

      expect(analysis.wreiBenchmark.strengthVsAverage).toBeCloseTo(expectedStrengthVsAvg, 1);
    });

    test('handles all positioning dimensions', () => {
      const dimensions: PositioningDimension[] = [
        'price', 'verification_quality', 'liquidity', 'transaction_speed',
        'regulatory_compliance', 'market_coverage', 'technology_innovation', 'institutional_focus'
      ];

      dimensions.forEach(dimension => {
        const analysis = analyzeCompetitivePosition(dimension, true);
        expect(analysis.dimension).toBe(dimension);
        expect(analysis.competitors.length).toBeGreaterThan(0);
        expect(analysis.wreiBenchmark.score).toBeGreaterThan(0);
      });
    });
  });

  describe('generateStrategicRecommendations', () => {
    test('generates recommendations for retail segment', () => {
      const recommendations = generateStrategicRecommendations('retail');

      expect(recommendations).toHaveProperty('keyOpportunities');
      expect(recommendations).toHaveProperty('competitiveThreats');
      expect(recommendations).toHaveProperty('strategicMoves');
      expect(recommendations).toHaveProperty('positioningAdvice');

      // Each category should have multiple items
      expect(recommendations.keyOpportunities.length).toBeGreaterThan(0);
      expect(recommendations.competitiveThreats.length).toBeGreaterThan(0);
      expect(recommendations.strategicMoves.length).toBeGreaterThan(0);
      expect(recommendations.positioningAdvice.length).toBeGreaterThan(0);

      // Retail recommendations should mention relevant concepts
      const allRecommendations = [
        ...recommendations.keyOpportunities,
        ...recommendations.strategicMoves,
        ...recommendations.positioningAdvice
      ].join(' ').toLowerCase();

      expect(allRecommendations).toMatch(/retail|education|simple|barrier/);
    });

    test('generates recommendations for wholesale segment', () => {
      const recommendations = generateStrategicRecommendations('wholesale');

      expect(recommendations.keyOpportunities.length).toBeGreaterThan(0);
      expect(recommendations.competitiveThreats.length).toBeGreaterThan(0);
      expect(recommendations.strategicMoves.length).toBeGreaterThan(0);
      expect(recommendations.positioningAdvice.length).toBeGreaterThan(0);

      // Wholesale recommendations should be different from retail
      const wholesaleText = recommendations.keyOpportunities.join(' ').toLowerCase();
      expect(wholesaleText).toMatch(/compliance|settlement|api|volume|institutional/);
    });

    test('generates recommendations for sophisticated segment', () => {
      const recommendations = generateStrategicRecommendations('sophisticated');

      expect(recommendations.keyOpportunities.length).toBeGreaterThan(0);

      // Sophisticated recommendations should focus on advanced features
      const sophisticatedText = recommendations.strategicMoves.join(' ').toLowerCase();
      expect(sophisticatedText).toMatch(/algorithm|analytics|premium|intelligence/);
    });

    test('generates recommendations for professional segment', () => {
      const recommendations = generateStrategicRecommendations('professional');

      expect(recommendations.keyOpportunities.length).toBeGreaterThan(0);

      // Professional recommendations should focus on infrastructure and partnerships
      const professionalText = [
        ...recommendations.keyOpportunities,
        ...recommendations.strategicMoves
      ].join(' ').toLowerCase();

      expect(professionalText).toMatch(/infrastructure|api|partnership|enterprise/);
    });

    test('defaults to wholesale for unknown segments', () => {
      // @ts-ignore - testing unknown segment
      const recommendations = generateStrategicRecommendations('unknown_segment');
      const wholesaleRecommendations = generateStrategicRecommendations('wholesale');

      expect(recommendations).toEqual(wholesaleRecommendations);
    });
  });

  describe('calculateMarketOpportunity', () => {
    test('calculates market opportunity metrics', () => {
      const opportunity = calculateMarketOpportunity();

      expect(opportunity).toHaveProperty('totalMarketSize');
      expect(opportunity).toHaveProperty('addressableMarket');
      expect(opportunity).toHaveProperty('competitorGap');
      expect(opportunity).toHaveProperty('growthPotential');

      // All values should be positive
      expect(opportunity.totalMarketSize).toBeGreaterThan(0);
      expect(opportunity.addressableMarket).toBeGreaterThan(0);
      expect(opportunity.competitorGap).toBeGreaterThan(0);

      // Addressable market should be smaller than total market
      expect(opportunity.addressableMarket).toBeLessThanOrEqual(opportunity.totalMarketSize);

      // Growth potential should have multiple dimensions
      expect(opportunity.growthPotential.length).toBeGreaterThan(0);
      opportunity.growthPotential.forEach(growth => {
        expect(growth).toHaveProperty('dimension');
        expect(growth).toHaveProperty('marketShare');
        expect(growth).toHaveProperty('opportunitySize');
        expect(growth.marketShare).toBeGreaterThanOrEqual(0);
        expect(growth.opportunitySize).toBeGreaterThanOrEqual(0);
      });
    });

    test('market size calculations are consistent', () => {
      const opportunity = calculateMarketOpportunity();

      // Calculate expected total market size from competitor data
      const expectedTotalMarketSize = COMPETITOR_PROFILES.reduce(
        (sum, comp) => sum + comp.marketMetrics.totalAssets,
        0
      );

      expect(opportunity.totalMarketSize).toBe(expectedTotalMarketSize);

      // Growth potential opportunity sizes should sum to something reasonable
      const totalGrowthOpportunity = opportunity.growthPotential.reduce(
        (sum, g) => sum + g.opportunitySize,
        0
      );

      expect(totalGrowthOpportunity).toBeCloseTo(opportunity.competitorGap, -1);
    });
  });

  describe('benchmarkPerformance', () => {
    test('benchmarks volume performance', () => {
      const benchmark = benchmarkPerformance('volume');

      expect(benchmark).toHaveProperty('wreiBenchmark');
      expect(benchmark).toHaveProperty('competitorAverage');
      expect(benchmark).toHaveProperty('topPerformer');
      expect(benchmark).toHaveProperty('percentileRank');
      expect(benchmark).toHaveProperty('improvementTarget');

      // WREI volume should match profile data
      expect(benchmark.wreiBenchmark).toBe(WREI_PROFILE.marketMetrics.dailyVolume);

      // Percentile rank should be between 0 and 100
      expect(benchmark.percentileRank).toBeGreaterThanOrEqual(0);
      expect(benchmark.percentileRank).toBeLessThanOrEqual(100);

      // Improvement target should be higher than current
      expect(benchmark.improvementTarget).toBeGreaterThanOrEqual(benchmark.wreiBenchmark);

      // Top performer should have a name and positive value
      expect(benchmark.topPerformer.name).toBeTruthy();
      expect(benchmark.topPerformer.value).toBeGreaterThan(0);
    });

    test('benchmarks transaction size performance', () => {
      const benchmark = benchmarkPerformance('transaction_size');

      expect(benchmark.wreiBenchmark).toBe(WREI_PROFILE.marketMetrics.averageTransactionSize);
      expect(benchmark.competitorAverage).toBeGreaterThan(0);
      expect(benchmark.topPerformer.value).toBeGreaterThan(0);
    });

    test('benchmarks user growth performance', () => {
      const benchmark = benchmarkPerformance('user_growth');

      expect(benchmark.wreiBenchmark).toBe(WREI_PROFILE.marketMetrics.activeUsers);
      expect(benchmark.competitorAverage).toBeGreaterThan(0);
    });

    test('benchmarks institutional penetration performance', () => {
      const benchmark = benchmarkPerformance('institutional_penetration');

      // Should calculate percentage correctly
      const expectedWreiPenetration =
        WREI_PROFILE.marketMetrics.institutionalClients /
        WREI_PROFILE.marketMetrics.activeUsers * 100;

      expect(benchmark.wreiBenchmark).toBeCloseTo(expectedWreiPenetration, 2);
      expect(benchmark.competitorAverage).toBeGreaterThan(0);
      expect(benchmark.competitorAverage).toBeLessThan(100);
    });

    test('calculates percentile rank correctly', () => {
      const benchmark = benchmarkPerformance('volume');

      // Verify percentile calculation by checking against actual competitor values
      const allValues = [
        ...COMPETITOR_PROFILES.map(p => p.marketMetrics.dailyVolume),
        WREI_PROFILE.marketMetrics.dailyVolume
      ].sort((a, b) => a - b);

      const wreiRank = allValues.indexOf(WREI_PROFILE.marketMetrics.dailyVolume);
      const expectedPercentile = (wreiRank / (allValues.length - 1)) * 100;

      expect(benchmark.percentileRank).toBeCloseTo(expectedPercentile, 1);
    });

    test('improvement target is reasonable', () => {
      const benchmarks = [
        benchmarkPerformance('volume'),
        benchmarkPerformance('transaction_size'),
        benchmarkPerformance('user_growth'),
        benchmarkPerformance('institutional_penetration')
      ];

      benchmarks.forEach(benchmark => {
        // Improvement target should be at least current performance
        expect(benchmark.improvementTarget).toBeGreaterThanOrEqual(benchmark.wreiBenchmark);

        // But not unreasonably high (less than 10x current performance for emerging players)
        expect(benchmark.improvementTarget).toBeLessThan(benchmark.wreiBenchmark * 10);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles empty competitor list gracefully', () => {
      // This tests the robustness of our calculations
      const originalProfiles = [...COMPETITOR_PROFILES];

      // Clear competitors temporarily
      COMPETITOR_PROFILES.length = 0;

      try {
        const analysis = analyzeCompetitivePosition('price', false);
        expect(analysis.competitors.length).toBe(0);
      } finally {
        // Restore competitors
        COMPETITOR_PROFILES.push(...originalProfiles);
      }
    });

    test('handles invalid positioning dimensions', () => {
      // @ts-ignore - testing invalid dimension
      const analysis = analyzeCompetitivePosition('invalid_dimension', true);

      // Should still return a valid structure
      expect(analysis).toHaveProperty('dimension');
      expect(analysis).toHaveProperty('competitors');
      expect(analysis).toHaveProperty('wreiBenchmark');
    });

    test('competitor profiles maintain data integrity', () => {
      COMPETITOR_PROFILES.forEach(profile => {
        // Each profile should have all required positioning dimensions
        const requiredDimensions: PositioningDimension[] = [
          'price', 'verification_quality', 'liquidity', 'transaction_speed',
          'regulatory_compliance', 'market_coverage', 'technology_innovation', 'institutional_focus'
        ];

        requiredDimensions.forEach(dimension => {
          expect(profile.positioning).toHaveProperty(dimension);
          expect(typeof profile.positioning[dimension]).toBe('number');
        });

        // Market metrics should be complete
        expect(profile.marketMetrics).toHaveProperty('dailyVolume');
        expect(profile.marketMetrics).toHaveProperty('totalAssets');
        expect(profile.marketMetrics).toHaveProperty('activeUsers');
        expect(profile.marketMetrics).toHaveProperty('institutionalClients');
        expect(profile.marketMetrics).toHaveProperty('averageTransactionSize');

        // Strengths and weaknesses should be non-empty arrays
        expect(Array.isArray(profile.strengths)).toBe(true);
        expect(profile.strengths.length).toBeGreaterThan(0);
        expect(Array.isArray(profile.weaknesses)).toBe(true);
        expect(profile.weaknesses.length).toBeGreaterThan(0);
      });
    });

    test('market opportunity calculations are mathematically sound', () => {
      const opportunity = calculateMarketOpportunity();

      // Total addressable market + competitor gap should not exceed total market unreasonably
      const combinedOpportunity = opportunity.addressableMarket + opportunity.competitorGap;
      expect(combinedOpportunity).toBeLessThan(opportunity.totalMarketSize * 2);

      // Growth potential market shares should be realistic
      opportunity.growthPotential.forEach(growth => {
        expect(growth.marketShare).toBeLessThan(1); // Less than 100%
        expect(growth.opportunitySize).toBeLessThan(opportunity.totalMarketSize);
      });
    });
  });
});