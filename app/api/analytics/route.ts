/**
 * WREI Analytics API Endpoints
 *
 * Exposes Milestone 1.3 financial calculation engine as service API.
 * Part of Milestone 2.2: External API Integration
 */

import { NextRequest } from 'next/server';
import {
  validateApiKey,
  checkRateLimit,
  apiResponse,
  apiError,
  parseJsonBody,
  validateRequiredFields,
  validateInvestmentAmount,
  validateTimeHorizon,
  validateDiscountRate,
  validateTokenType,
  validateNumericRange,
  logApiRequest,
  logApiError
} from '@/lib/api-helpers';

// Import financial calculation engines
import {
  calculateIRR,
  calculateNPV,
  calculateCarbonCreditMetrics,
  calculateAssetCoMetrics,
  calculateDualPortfolioMetrics,
  calculateRiskProfile
} from '@/lib/financial-calculations';

import {
  calculateProfessionalMetrics,
  runMonteCarloAnalysis,
  generateScenarioAnalysis,
  generatePortfolioOptimization,
  calculateRiskAdjustedReturns
} from '@/lib/professional-analytics';

import type { WREITokenType } from '@/lib/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let action = 'unknown';
  let requestId = '';

  try {
    // Extract action from request body
    const body = await parseJsonBody(request);
    action = body.action || 'unknown';
    requestId = `ana_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Validate API key
    const authResult = validateApiKey(request);
    if (!authResult.valid) {
      logApiError('/api/analytics', action, requestId, authResult.error);
      return apiError(authResult.error || 'Authentication failed', 401);
    }

    // Check rate limiting
    const apiKey = request.headers.get('X-WREI-API-Key') || 'anonymous';
    if (!checkRateLimit(apiKey, 100, 60000)) {
      logApiError('/api/analytics', action, requestId, 'Rate limit exceeded');
      return apiError('Rate limit exceeded. Maximum 100 requests per minute.', 429);
    }

    // Route to appropriate handler based on action
    let result;
    let source = 'WREI_ANALYTICS_ENGINE';

    switch (action) {
      case 'irr':
        result = await handleIRRCalculation(body);
        source = 'WREI_IRR_CALCULATOR';
        break;

      case 'npv':
        result = await handleNPVCalculation(body);
        source = 'WREI_NPV_CALCULATOR';
        break;

      case 'carbon_metrics':
        result = await handleCarbonMetrics(body);
        source = 'WREI_CARBON_ANALYTICS';
        break;

      case 'asset_co_metrics':
        result = await handleAssetCoMetrics(body);
        source = 'WREI_ASSET_CO_ANALYTICS';
        break;

      case 'dual_portfolio':
        result = await handleDualPortfolio(body);
        source = 'WREI_DUAL_PORTFOLIO_ANALYTICS';
        break;

      case 'risk_profile':
        result = await handleRiskProfile(body);
        source = 'WREI_RISK_PROFILER';
        break;

      case 'scenario_analysis':
        result = await handleScenarioAnalysis(body);
        source = 'WREI_SCENARIO_ANALYTICS';
        break;

      case 'portfolio_optimization':
        result = await handlePortfolioOptimization(body);
        source = 'WREI_PORTFOLIO_OPTIMIZER';
        break;

      case 'monte_carlo':
        result = await handleMonteCarlo(body);
        source = 'WREI_MONTE_CARLO_ENGINE';
        break;

      case 'professional_metrics':
        result = await handleProfessionalMetrics(body);
        source = 'WREI_PROFESSIONAL_ANALYTICS';
        break;

      default:
        logApiError('/api/analytics', action, requestId, 'Invalid action');
        return apiError(
          `Invalid action: ${action}. Valid actions: irr, npv, carbon_metrics, asset_co_metrics, dual_portfolio, risk_profile, scenario_analysis, portfolio_optimization, monte_carlo, professional_metrics`,
          400
        );
    }

    const processingTime = Date.now() - startTime;
    logApiRequest('POST', '/api/analytics', action, requestId, true, processingTime);

    return apiResponse(result, {
      source,
      requestId
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logApiError('/api/analytics', action, requestId, error);
    logApiRequest('POST', '/api/analytics', action, requestId, false, processingTime);

    return apiError(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}

// =============================================================================
// ACTION HANDLERS
// =============================================================================

/**
 * Handle irr calculation
 */
async function handleIRRCalculation(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['cashFlows']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate cash flows structure
  if (!Array.isArray(body.cashFlows)) {
    throw new Error('cashFlows must be an array');
  }

  if (body.cashFlows.length < 2) {
    throw new Error('cashFlows must contain at least 2 cash flow entries');
  }

  // Convert simple cash flows to CashFlow format and validate
  const cashFlows = [];
  const baseDate = new Date('2024-01-01');

  for (let i = 0; i < body.cashFlows.length; i++) {
    const cf = body.cashFlows[i];
    if (typeof cf.amount !== 'number') {
      throw new Error(`cashFlows[${i}].amount must be a number`);
    }
    if (typeof cf.year !== 'number' || cf.year < 0) {
      throw new Error(`cashFlows[${i}].year must be a non-negative number`);
    }

    // Convert to CashFlow format
    const flowDate = new Date(baseDate);
    flowDate.setFullYear(flowDate.getFullYear() + cf.year);

    cashFlows.push({
      date: flowDate.toISOString(),
      amount: cf.amount,
      type: cf.year === 0 ? 'initial_investment' : 'quarterly_distribution',
      description: cf.year === 0 ? 'Initial investment' : `Year ${cf.year} cash flow`,
      taxable: cf.year > 0
    });
  }

  const irr = calculateIRR(cashFlows);

  return {
    irr,
    irrPercentage: (irr * 100).toFixed(2),
    cashFlowsCount: body.cashFlows.length,
    totalInvestment: body.cashFlows.find((cf: any) => cf.year === 0)?.amount || null,
    totalReturns: body.cashFlows
      .filter((cf: any) => cf.year > 0)
      .reduce((sum: number, cf: any) => sum + cf.amount, 0),
    annualizationPeriod: Math.max(...body.cashFlows.map((cf: any) => cf.year))
  };
}

/**
 * Handle npv calculation
 */
async function handleNPVCalculation(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['cashFlows', 'discountRate']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate discount rate
  const discountError = validateDiscountRate(body.discountRate);
  if (discountError) {
    throw new Error(discountError);
  }

  // Validate cash flows (same as IRR)
  if (!Array.isArray(body.cashFlows) || body.cashFlows.length < 2) {
    throw new Error('cashFlows must be an array with at least 2 entries');
  }

  // Convert simple cash flows to CashFlow format (same as IRR)
  const cashFlows = [];
  const baseDate = new Date('2024-01-01');

  for (let i = 0; i < body.cashFlows.length; i++) {
    const cf = body.cashFlows[i];
    if (typeof cf.amount !== 'number') {
      throw new Error(`cashFlows[${i}].amount must be a number`);
    }
    if (typeof cf.year !== 'number' || cf.year < 0) {
      throw new Error(`cashFlows[${i}].year must be a non-negative number`);
    }

    // Convert to CashFlow format
    const flowDate = new Date(baseDate);
    flowDate.setFullYear(flowDate.getFullYear() + cf.year);

    cashFlows.push({
      date: flowDate.toISOString(),
      amount: cf.amount,
      type: cf.year === 0 ? 'initial_investment' : 'quarterly_distribution',
      description: cf.year === 0 ? 'Initial investment' : `Year ${cf.year} cash flow`,
      taxable: cf.year > 0
    });
  }

  const npv = calculateNPV(cashFlows, body.discountRate);

  return {
    npv,
    discountRate: body.discountRate,
    discountRatePercentage: (body.discountRate * 100).toFixed(2),
    cashFlowsCount: body.cashFlows.length,
    presentValueBreakdown: body.cashFlows.map((cf: any, index: number) => ({
      year: cf.year,
      originalAmount: cf.amount,
      presentValue: cf.amount / Math.pow(1 + body.discountRate, cf.year),
      discountFactor: 1 / Math.pow(1 + body.discountRate, cf.year)
    }))
  };
}

/**
 * Handle carbon credit metrics calculation
 */
async function handleCarbonMetrics(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['investmentAmount', 'carbonCredits', 'yieldMechanism', 'timeHorizon']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate parameters
  const amountError = validateInvestmentAmount(body.investmentAmount);
  if (amountError) throw new Error(amountError);

  const horizonError = validateTimeHorizon(body.timeHorizon);
  if (horizonError) throw new Error(horizonError);

  if (typeof body.carbonCredits !== 'number' || body.carbonCredits <= 0) {
    throw new Error('carbonCredits must be a positive number');
  }

  if (!['revenue_share', 'nav_accruing'].includes(body.yieldMechanism)) {
    throw new Error('yieldMechanism must be either "revenue_share" or "nav_accruing"');
  }

  const metrics = calculateCarbonCreditMetrics({
    investmentAmount: body.investmentAmount,
    carbonCredits: body.carbonCredits,
    yieldMechanism: body.yieldMechanism,
    timeHorizon: body.timeHorizon,
    riskProfile: body.riskProfile || 'moderate',
    investorType: body.investorType || 'institutional'
  });

  return {
    metrics,
    inputParameters: {
      investmentAmount: body.investmentAmount,
      carbonCredits: body.carbonCredits,
      yieldMechanism: body.yieldMechanism,
      timeHorizon: body.timeHorizon,
      pricePerCredit: body.investmentAmount / body.carbonCredits
    },
    calculationTimestamp: new Date().toISOString()
  };
}

/**
 * Handle Asset Co metrics calculation
 */
async function handleAssetCoMetrics(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['investmentAmount', 'assetType', 'region', 'timeHorizon']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate parameters
  const amountError = validateInvestmentAmount(body.investmentAmount);
  if (amountError) throw new Error(amountError);

  const horizonError = validateTimeHorizon(body.timeHorizon);
  if (horizonError) throw new Error(horizonError);

  const validAssetTypes = ['deep_power', 'surface_vessel', 'mixed_fleet'];
  if (!validAssetTypes.includes(body.assetType)) {
    throw new Error(`assetType must be one of: ${validAssetTypes.join(', ')}`);
  }

  const validRegions = ['australia', 'asia_pacific', 'europe', 'north_america'];
  if (!validRegions.includes(body.region)) {
    throw new Error(`region must be one of: ${validRegions.join(', ')}`);
  }

  const metrics = calculateAssetCoMetrics({
    investmentAmount: body.investmentAmount,
    assetType: body.assetType,
    region: body.region,
    timeHorizon: body.timeHorizon,
    operationalParameters: body.operationalParameters || {},
    financialParameters: body.financialParameters || {}
  });

  return {
    metrics,
    inputParameters: {
      investmentAmount: body.investmentAmount,
      assetType: body.assetType,
      region: body.region,
      timeHorizon: body.timeHorizon
    },
    calculationTimestamp: new Date().toISOString()
  };
}

/**
 * Handle dual portfolio metrics calculation
 */
async function handleDualPortfolio(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['totalInvestment', 'carbonAllocation', 'assetCoAllocation']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate parameters
  const amountError = validateInvestmentAmount(body.totalInvestment);
  if (amountError) throw new Error(amountError);

  // Validate allocations
  if (typeof body.carbonAllocation !== 'number' || body.carbonAllocation < 0 || body.carbonAllocation > 1) {
    throw new Error('carbonAllocation must be a number between 0 and 1');
  }

  if (typeof body.assetCoAllocation !== 'number' || body.assetCoAllocation < 0 || body.assetCoAllocation > 1) {
    throw new Error('assetCoAllocation must be a number between 0 and 1');
  }

  if (Math.abs(body.carbonAllocation + body.assetCoAllocation - 1) > 0.001) {
    throw new Error('carbonAllocation + assetCoAllocation must equal 1.0');
  }

  const metrics = calculateDualPortfolioMetrics({
    totalInvestment: body.totalInvestment,
    carbonAllocation: body.carbonAllocation,
    assetCoAllocation: body.assetCoAllocation,
    timeHorizon: body.timeHorizon || 10,
    riskTolerance: body.riskTolerance || 'moderate'
  });

  return {
    metrics,
    allocationBreakdown: {
      carbonCredit: {
        allocation: body.carbonAllocation,
        amount: body.totalInvestment * body.carbonAllocation
      },
      assetCo: {
        allocation: body.assetCoAllocation,
        amount: body.totalInvestment * body.assetCoAllocation
      }
    },
    calculationTimestamp: new Date().toISOString()
  };
}

/**
 * Handle risk profile calculation
 */
async function handleRiskProfile(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['tokenType']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate token type
  if (!validateTokenType(body.tokenType)) {
    throw new Error('tokenType must be one of: carbon_credit, asset_co, dual_token, infrastructure_reit');
  }

  const riskProfile = calculateRiskProfile(body.tokenType);

  // Calculate derived risk category from multiple risk factors
  const riskFactors = [riskProfile.liquidityRisk, riskProfile.operationalRisk, riskProfile.regulatoryRisk];
  const highRiskCount = riskFactors.filter(risk => risk === 'high').length;
  const mediumRiskCount = riskFactors.filter(risk => risk === 'medium').length;

  let riskCategory: string;
  let riskScore: number;
  if (highRiskCount >= 2 || riskProfile.volatility > 0.3) {
    riskCategory = 'high';
    riskScore = 75 + Math.round(riskProfile.volatility * 100);
  } else if (highRiskCount >= 1 || mediumRiskCount >= 2 || riskProfile.volatility > 0.15) {
    riskCategory = 'medium';
    riskScore = 40 + Math.round(riskProfile.volatility * 100);
  } else {
    riskCategory = 'low';
    riskScore = Math.round(riskProfile.volatility * 100);
  }

  // Generate key risk factors based on token type and risk levels
  const keyRiskFactors: string[] = [];
  if (riskProfile.liquidityRisk === 'high') keyRiskFactors.push('Limited liquidity in secondary markets');
  if (riskProfile.operationalRisk === 'high') keyRiskFactors.push('Operational complexity and infrastructure dependencies');
  if (riskProfile.regulatoryRisk === 'high') keyRiskFactors.push('Regulatory uncertainty and compliance requirements');
  if (riskProfile.volatility > 0.2) keyRiskFactors.push(`High price volatility (${(riskProfile.volatility * 100).toFixed(0)}% annual)`);
  if (riskProfile.maxDrawdown > 0.15) keyRiskFactors.push(`Potential for significant drawdowns (up to ${(riskProfile.maxDrawdown * 100).toFixed(0)}%)`);

  // Generate mitigation strategies
  const mitigationStrategies: string[] = [];
  if (riskProfile.liquidityRisk !== 'low') mitigationStrategies.push('Diversify across multiple token series for improved liquidity');
  if (riskProfile.correlationToMarket < 0.5) mitigationStrategies.push('Leverage low market correlation for portfolio diversification');
  if (riskProfile.sharpeRatio > 1.0) mitigationStrategies.push('Strong risk-adjusted returns support long-term holding strategy');
  mitigationStrategies.push('Regular monitoring and risk assessment protocols');

  return {
    tokenType: body.tokenType,
    riskProfile,
    riskCategory,
    riskScore,
    keyRiskFactors,
    mitigationStrategies,
    calculationTimestamp: new Date().toISOString()
  };
}

/**
 * Handle scenario analysis
 */
async function handleScenarioAnalysis(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['investmentAmount', 'tokenType', 'investorType']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate parameters
  const amountError = validateInvestmentAmount(body.investmentAmount);
  if (amountError) throw new Error(amountError);

  if (!validateTokenType(body.tokenType)) {
    throw new Error('tokenType must be one of: carbon_credit, asset_co, dual_token, infrastructure_reit');
  }

  const validInvestorTypes = ['retail', 'wholesale', 'professional', 'sophisticated'];
  if (!validInvestorTypes.includes(body.investorType)) {
    throw new Error(`investorType must be one of: ${validInvestorTypes.join(', ')}`);
  }

  const analysis = generateScenarioAnalysis({
    investmentAmount: body.investmentAmount,
    tokenType: body.tokenType,
    investorType: body.investorType,
    timeHorizon: body.timeHorizon || 10,
    scenarios: body.scenarios || ['base', 'bull', 'bear', 'stress']
  });

  return {
    scenarioAnalysis: analysis,
    inputParameters: {
      investmentAmount: body.investmentAmount,
      tokenType: body.tokenType,
      investorType: body.investorType,
      timeHorizon: body.timeHorizon || 10
    },
    calculationTimestamp: new Date().toISOString()
  };
}

/**
 * Handle portfolio optimization
 */
async function handlePortfolioOptimization(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['totalInvestment', 'riskTolerance']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate parameters
  const amountError = validateInvestmentAmount(body.totalInvestment);
  if (amountError) throw new Error(amountError);

  const validRiskTolerances = ['conservative', 'moderate', 'aggressive'];
  if (!validRiskTolerances.includes(body.riskTolerance)) {
    throw new Error(`riskTolerance must be one of: ${validRiskTolerances.join(', ')}`);
  }

  // Create a current allocation baseline (equal weights as starting point)
  const currentAllocation = {
    carbon_credit: 0.33,
    asset_co: 0.33,
    dual_token: 0.34,
    infrastructure_reit: 0.0
  };

  const optimization = generatePortfolioOptimization(
    currentAllocation,
    body.riskTolerance,
    body.timeHorizon || 10
  );

  return {
    portfolioOptimization: optimization,
    inputParameters: {
      totalInvestment: body.totalInvestment,
      riskTolerance: body.riskTolerance,
      timeHorizon: body.timeHorizon || 10
    },
    calculationTimestamp: new Date().toISOString()
  };
}

/**
 * Handle Monte Carlo simulation
 */
async function handleMonteCarlo(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['investmentAmount', 'tokenType', 'simulations', 'timeHorizon']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate parameters
  const amountError = validateInvestmentAmount(body.investmentAmount);
  if (amountError) throw new Error(amountError);

  const horizonError = validateTimeHorizon(body.timeHorizon);
  if (horizonError) throw new Error(horizonError);

  if (!validateTokenType(body.tokenType)) {
    throw new Error('tokenType must be one of: carbon_credit, asset_co, dual_token, infrastructure_reit');
  }

  const simulationsError = validateNumericRange(body.simulations, 100, 10000, 'simulations');
  if (simulationsError) throw new Error(simulationsError);

  const results = runMonteCarloAnalysis({
    investmentAmount: body.investmentAmount,
    tokenType: body.tokenType,
    simulations: body.simulations,
    timeHorizon: body.timeHorizon,
    volatilityAssumptions: body.volatilityAssumptions || {},
    correlationMatrix: body.correlationMatrix || null
  });

  return {
    monteCarloResults: results,
    simulationParameters: {
      investmentAmount: body.investmentAmount,
      tokenType: body.tokenType,
      simulations: body.simulations,
      timeHorizon: body.timeHorizon
    },
    calculationTimestamp: new Date().toISOString()
  };
}

/**
 * Handle professional metrics calculation
 */
async function handleProfessionalMetrics(body: any) {
  // Validate required fields
  const missing = validateRequiredFields(body, ['investmentAmount', 'tokenType', 'investorClassification']);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Validate parameters
  const amountError = validateInvestmentAmount(body.investmentAmount);
  if (amountError) throw new Error(amountError);

  if (!validateTokenType(body.tokenType)) {
    throw new Error('tokenType must be one of: carbon_credit, asset_co, dual_token, infrastructure_reit');
  }

  const validClassifications = ['retail', 'wholesale', 'professional', 'sophisticated'];
  if (!validClassifications.includes(body.investorClassification)) {
    throw new Error(`investorClassification must be one of: ${validClassifications.join(', ')}`);
  }

  const metrics = calculateProfessionalMetrics({
    investmentAmount: body.investmentAmount,
    tokenType: body.tokenType,
    investorClassification: body.investorClassification,
    timeHorizon: body.timeHorizon || 10,
    customParameters: body.customParameters || {}
  });

  return {
    professionalMetrics: metrics,
    inputParameters: {
      investmentAmount: body.investmentAmount,
      tokenType: body.tokenType,
      investorClassification: body.investorClassification,
      timeHorizon: body.timeHorizon || 10
    },
    calculationTimestamp: new Date().toISOString()
  };
}