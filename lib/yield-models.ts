/**
 * WREI Yield Models - Revenue Share & NAV-Accruing Models
 *
 * Implements the dual revenue model system for WREI tokenization:
 * - Model A: Revenue Share (quarterly distributions)
 * - Model B: NAV-Accruing (token value appreciation)
 *
 * Based on WREI Tokenization Practical Paper specifications
 */

import type { WREITokenType } from './types';

// =============================================================================
// YIELD MODEL INTERFACES
// =============================================================================

export interface YieldModel {
  type: 'revenue_share' | 'nav_accruing';
  tokenType: WREITokenType;
  description: string;
  distributionFrequency: 'quarterly' | 'annual' | 'continuous';
  yieldMechanism: YieldMechanism;
}

export interface YieldMechanism {
  carbonCredits?: CarbonYieldMechanism;
  assetCo?: AssetCoYieldMechanism;
  dualPortfolio?: DualPortfolioYieldMechanism;
}

export interface CarbonYieldMechanism {
  baseRevenue: number; // A$ annual
  expansionRevenue: number; // A$ annual
  revenueShareRate: number; // % of gross revenue
  priceAppreciation: number; // % annual appreciation
  distributionSchedule: DistributionSchedule[];
}

export interface AssetCoYieldMechanism {
  equityYield: number; // 28.3% target
  leaseIncome: number; // A$ annual
  netCashFlow: number; // A$ annual
  cashOnCashMultiple: number; // 3.0x target
  distributionSchedule: DistributionSchedule[];
}

export interface DualPortfolioYieldMechanism {
  carbonWeight: number; // Portfolio allocation %
  assetCoWeight: number; // Portfolio allocation %
  crossCollateralBenefit: number; // Additional yield %
  rebalancingFrequency: 'monthly' | 'quarterly' | 'annual';
}

export interface DistributionSchedule {
  date: string; // ISO date string
  amount: number; // A$ per token
  type: 'interest' | 'dividend' | 'capital_gain' | 'lease_income';
  taxTreatment: 'income' | 'capital_gains' | 'dividend_imputation';
}

// =============================================================================
// YIELD MODEL IMPLEMENTATIONS
// =============================================================================

export const WREI_YIELD_MODELS: Record<string, YieldModel> = {
  // Carbon Credits - Revenue Share Model
  carbon_revenue_share: {
    type: 'revenue_share',
    tokenType: 'carbon_credits',
    description: 'Quarterly revenue distributions from carbon credit sales',
    distributionFrequency: 'quarterly',
    yieldMechanism: {
      carbonCredits: {
        baseRevenue: 33_400_000, // A$33.4M annual (base case)
        expansionRevenue: 141_000_000, // A$141M annual (expansion)
        revenueShareRate: 0.75, // 75% of gross revenue to token holders
        priceAppreciation: 0.08, // 8% annual carbon price appreciation
        distributionSchedule: [] // Populated by generateDistributionSchedule()
      }
    }
  },

  // Carbon Credits - NAV-Accruing Model
  carbon_nav_accruing: {
    type: 'nav_accruing',
    tokenType: 'carbon_credits',
    description: 'Token value appreciation from retained carbon revenues',
    distributionFrequency: 'continuous',
    yieldMechanism: {
      carbonCredits: {
        baseRevenue: 33_400_000,
        expansionRevenue: 141_000_000,
        revenueShareRate: 0.25, // 25% distributed, 75% retained for NAV growth
        priceAppreciation: 0.12, // 12% annual NAV appreciation
        distributionSchedule: []
      }
    }
  },

  // Asset Co - Revenue Share Model
  asset_co_revenue_share: {
    type: 'revenue_share',
    tokenType: 'asset_co',
    description: 'Quarterly lease income distributions from ferry operations',
    distributionFrequency: 'quarterly',
    yieldMechanism: {
      assetCo: {
        equityYield: 0.283, // 28.3% target return
        leaseIncome: 61_100_000, // A$61.1M annual
        netCashFlow: 37_100_000, // A$37.1M annual to equity
        cashOnCashMultiple: 3.0, // 3.0x cash-on-cash return
        distributionSchedule: []
      }
    }
  },

  // Asset Co - NAV-Accruing Model
  asset_co_nav_accruing: {
    type: 'nav_accruing',
    tokenType: 'asset_co',
    description: 'Token value appreciation from retained lease income',
    distributionFrequency: 'annual',
    yieldMechanism: {
      assetCo: {
        equityYield: 0.283,
        leaseIncome: 61_100_000,
        netCashFlow: 37_100_000,
        cashOnCashMultiple: 3.0,
        distributionSchedule: []
      }
    }
  },

  // Dual Portfolio - Hybrid Model
  dual_portfolio_hybrid: {
    type: 'revenue_share',
    tokenType: 'dual_portfolio',
    description: 'Blended yield from carbon credits and asset co tokens',
    distributionFrequency: 'quarterly',
    yieldMechanism: {
      dualPortfolio: {
        carbonWeight: 0.4, // 40% carbon credits
        assetCoWeight: 0.6, // 60% asset co
        crossCollateralBenefit: 0.02, // 2% additional yield from cross-collateral
        rebalancingFrequency: 'quarterly'
      }
    }
  }
};

// =============================================================================
// YIELD CALCULATION FUNCTIONS
// =============================================================================

/**
 * Calculate expected annual yield for a given yield model
 */
export function calculateAnnualYield(
  yieldModel: YieldModel,
  investmentAmount: number,
  tokenSupply: number
): number {
  switch (yieldModel.tokenType) {
    case 'carbon_credits':
      return calculateCarbonYield(yieldModel, investmentAmount, tokenSupply);

    case 'asset_co':
      return calculateAssetCoYield(yieldModel, investmentAmount, tokenSupply);

    case 'dual_portfolio':
      return calculateDualPortfolioYield(yieldModel, investmentAmount, tokenSupply);

    default:
      return 0;
  }
}

/**
 * Calculate carbon credit yield based on revenue model
 */
function calculateCarbonYield(
  yieldModel: YieldModel,
  investmentAmount: number,
  tokenSupply: number
): number {
  const mechanism = yieldModel.yieldMechanism.carbonCredits;
  if (!mechanism) return 0;

  const annualRevenue = mechanism.baseRevenue; // Conservative base case
  const sharePerToken = (annualRevenue * mechanism.revenueShareRate) / tokenSupply;
  const tokensOwned = investmentAmount / (468_000_000 / tokenSupply); // Based on base case valuation

  if (yieldModel.type === 'revenue_share') {
    return sharePerToken * tokensOwned;
  } else {
    // NAV-accruing model includes price appreciation
    const navGrowth = investmentAmount * mechanism.priceAppreciation;
    const distributedYield = sharePerToken * tokensOwned;
    return navGrowth + distributedYield;
  }
}

/**
 * Calculate asset co yield based on lease income model
 */
function calculateAssetCoYield(
  yieldModel: YieldModel,
  investmentAmount: number,
  tokenSupply: number
): number {
  const mechanism = yieldModel.yieldMechanism.assetCo;
  if (!mechanism) return 0;

  const equityAmount = 131_000_000; // A$131M total equity
  const ownershipPercentage = investmentAmount / equityAmount;

  if (yieldModel.type === 'revenue_share') {
    // Quarterly distributions from net cash flow
    return mechanism.netCashFlow * ownershipPercentage;
  } else {
    // NAV-accruing model based on equity yield
    return investmentAmount * mechanism.equityYield;
  }
}

/**
 * Calculate dual portfolio blended yield
 */
function calculateDualPortfolioYield(
  yieldModel: YieldModel,
  investmentAmount: number,
  tokenSupply: number
): number {
  const mechanism = yieldModel.yieldMechanism.dualPortfolio;
  if (!mechanism) return 0;

  // Split investment across carbon and asset co
  const carbonInvestment = investmentAmount * mechanism.carbonWeight;
  const assetCoInvestment = investmentAmount * mechanism.assetCoWeight;

  // Calculate individual yields
  const carbonYield = calculateCarbonYield(
    WREI_YIELD_MODELS.carbon_revenue_share,
    carbonInvestment,
    tokenSupply * mechanism.carbonWeight
  );

  const assetCoYield = calculateAssetCoYield(
    WREI_YIELD_MODELS.asset_co_revenue_share,
    assetCoInvestment,
    tokenSupply * mechanism.assetCoWeight
  );

  // Add cross-collateral benefit
  const baseYield = carbonYield + assetCoYield;
  const crossCollateralBonus = investmentAmount * mechanism.crossCollateralBenefit;

  return baseYield + crossCollateralBonus;
}

// =============================================================================
// DISTRIBUTION SCHEDULE GENERATION
// =============================================================================

/**
 * Generate quarterly distribution schedule for a given year
 */
export function generateDistributionSchedule(
  yieldModel: YieldModel,
  year: number,
  tokensOwned: number
): DistributionSchedule[] {
  const schedule: DistributionSchedule[] = [];

  if (yieldModel.distributionFrequency === 'quarterly') {
    const quarterlyAmount = calculateAnnualYield(yieldModel, tokensOwned * 100, 1000000) / 4;

    for (let quarter = 1; quarter <= 4; quarter++) {
      const month = quarter * 3; // March, June, September, December
      const date = new Date(year, month - 1, 15).toISOString();

      schedule.push({
        date,
        amount: quarterlyAmount,
        type: yieldModel.tokenType === 'asset_co' ? 'lease_income' : 'dividend',
        taxTreatment: yieldModel.tokenType === 'asset_co' ? 'income' : 'dividend_imputation'
      });
    }
  }

  return schedule;
}

/**
 * Get yield model recommendation based on investor profile
 */
export function getYieldModelRecommendation(
  tokenType: WREITokenType,
  investorProfile: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    yieldRequirement: number;
    taxOptimisation: boolean;
    liquidityNeeds: 'high' | 'medium' | 'low';
  }
): YieldModel {
  if (tokenType === 'carbon_credits') {
    if (investorProfile.riskTolerance === 'conservative' || investorProfile.liquidityNeeds === 'high') {
      return WREI_YIELD_MODELS.carbon_revenue_share;
    } else {
      return WREI_YIELD_MODELS.carbon_nav_accruing;
    }
  } else if (tokenType === 'asset_co') {
    if (investorProfile.taxOptimisation && investorProfile.liquidityNeeds === 'low') {
      return WREI_YIELD_MODELS.asset_co_nav_accruing;
    } else {
      return WREI_YIELD_MODELS.asset_co_revenue_share;
    }
  } else {
    return WREI_YIELD_MODELS.dual_portfolio_hybrid;
  }
}

// =============================================================================
// YIELD MODEL METADATA
// =============================================================================

export const YIELD_MODEL_METADATA = {
  totalModels: Object.keys(WREI_YIELD_MODELS).length,
  supportedTokenTypes: ['carbon_credits', 'asset_co', 'dual_portfolio'] as WREITokenType[],
  distributionFrequencies: ['quarterly', 'annual', 'continuous'],
  yieldTypes: ['revenue_share', 'nav_accruing'],
  lastUpdated: '2026-03-20',
  version: '1.0.0'
};