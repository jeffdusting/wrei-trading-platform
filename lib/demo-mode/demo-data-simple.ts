/**
 * Simple Demo Data - Phase 1
 * Essential dummy data for 3 trading scenarios
 * No tour context, just basic simulation data
 */

import type { BuyerProfile, NegotiationState, Message } from '../types';

export interface DemoDataSet {
  persona: any;
  marketData: any;
  negotiationHistory: NegotiationState[];
  portfolioMetrics: any;
}

// Institutional ESG Fund Manager Scenario
const institutionalDataSet: DemoDataSet = {
  persona: {
    id: 'esg_fund_manager',
    name: 'James Hartley',
    title: 'Portfolio Manager',
    organisation: 'Meridian Sustainable Infrastructure Fund',
    warmth: 8,
    dominance: 6,
    patience: 7
  },
  marketData: {
    basePrice: 150,
    floor: 120,
    vcmSpot: 6.34,
    forwardRemoval: 180,
    dmrvPremium: 1.78
  },
  negotiationHistory: [{
    round: 1,
    phase: 'opening' as const,
    creditType: 'carbon' as const,
    anchorPrice: 150,
    currentOfferPrice: 150,
    priceFloor: 120,
    maxConcessionPerRound: 0.05,
    maxTotalConcession: 0.20,
    totalConcessionGiven: 0,
    roundsSinceLastConcession: 0,
    minimumRoundsBeforeConcession: 3,
    messages: [],
    buyerProfile: {} as BuyerProfile,
    argumentHistory: [],
    emotionalState: 'neutral' as const,
    negotiationComplete: false,
    outcome: null,
    marketContext: {
      marketType: 'secondary' as const,
      liquidityConditions: 'high' as const,
      competitivePressure: 6,
      regulatoryEnvironment: 'favorable' as const
    }
  }],
  portfolioMetrics: {
    targetAllocation: 100_000_000, // A$100M
    expectedYield: 0.283,
    riskProfile: 'moderate',
    liquidityNeeds: 'quarterly'
  }
};

// Retail Sustainability Director Scenario
const retailDataSet: DemoDataSet = {
  persona: {
    id: 'sustainability_director',
    name: 'Priya Sharma',
    title: 'Director of Sustainability',
    organisation: 'GreenBuild Construction',
    warmth: 8,
    dominance: 4,
    patience: 6
  },
  marketData: {
    basePrice: 130,
    floor: 120,
    vcmSpot: 6.34,
    forwardRemoval: 180,
    dmrvPremium: 1.78
  },
  negotiationHistory: [{
    round: 1,
    phase: 'opening' as const,
    creditType: 'carbon' as const,
    anchorPrice: 130,
    currentOfferPrice: 130,
    priceFloor: 120,
    maxConcessionPerRound: 0.05,
    maxTotalConcession: 0.20,
    totalConcessionGiven: 0,
    roundsSinceLastConcession: 0,
    minimumRoundsBeforeConcession: 3,
    messages: [],
    buyerProfile: {} as BuyerProfile,
    argumentHistory: [],
    emotionalState: 'neutral' as const,
    negotiationComplete: false,
    outcome: null,
    marketContext: {
      marketType: 'secondary' as const,
      liquidityConditions: 'high' as const,
      competitivePressure: 6,
      regulatoryEnvironment: 'favorable' as const
    }
  }],
  portfolioMetrics: {
    targetAllocation: 675_000, // A$675k for 5,000 tCO2e
    expectedYield: 0.12,
    riskProfile: 'conservative',
    liquidityNeeds: 'annual'
  }
};

// Government Compliance Officer Scenario
const complianceDataSet: DemoDataSet = {
  persona: {
    id: 'government_procurement',
    name: 'David Thompson',
    title: 'Senior Procurement Officer',
    organisation: 'Department of Climate Change',
    warmth: 6,
    dominance: 5,
    patience: 9
  },
  marketData: {
    basePrice: 130,
    floor: 130, // Fixed budget
    vcmSpot: 6.34,
    forwardRemoval: 180,
    dmrvPremium: 1.78
  },
  negotiationHistory: [{
    round: 1,
    phase: 'opening' as const,
    creditType: 'carbon' as const,
    anchorPrice: 130,
    currentOfferPrice: 130,
    priceFloor: 130,
    maxConcessionPerRound: 0,
    maxTotalConcession: 0,
    totalConcessionGiven: 0,
    roundsSinceLastConcession: 0,
    minimumRoundsBeforeConcession: 3,
    messages: [],
    buyerProfile: {} as BuyerProfile,
    argumentHistory: [],
    emotionalState: 'neutral' as const,
    negotiationComplete: false,
    outcome: null,
    marketContext: {
      marketType: 'secondary' as const,
      liquidityConditions: 'high' as const,
      competitivePressure: 6,
      regulatoryEnvironment: 'favorable' as const
    }
  }],
  portfolioMetrics: {
    targetAllocation: 3_250_000, // A$3.25M for 25,000 tCO2e
    expectedYield: 0,
    riskProfile: 'conservative',
    liquidityNeeds: 'annual'
  }
};

// Data set registry
const DATA_SETS = {
  institutional: institutionalDataSet,
  retail: retailDataSet,
  compliance: complianceDataSet
};

// Export function to get demo data for a specific set
export function getDemoDataForSet(dataSet: 'institutional' | 'retail' | 'compliance'): DemoDataSet {
  return DATA_SETS[dataSet];
}

// Export all data sets for reference
export { institutionalDataSet, retailDataSet, complianceDataSet };