/**
 * WREI Institutional Dashboard - Professional Investment Interface
 *
 * Sophisticated dashboard design for institutional investors providing:
 * - Dual token portfolio views with yield mechanism selection
 * - Cross-collateralization tracking interface
 * - Real-time market intelligence display
 * - Risk assessment integration with visual indicators
 * - Professional analytics with institutional benchmarks
 * - Responsive design for institutional use cases
 *
 * Phase 6.1: Professional UI/UX Enhancement
 * Integration with Phases 1-5 foundation
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  calculateCarbonCreditMetrics,
  calculateAssetCoMetrics,
  calculateDualPortfolioMetrics,
  formatFinancialMetrics,
  WREI_FINANCIAL_CONSTANTS
} from '@/lib/financial-calculations';
import { WREI_YIELD_MODELS, calculateAnnualYield } from '@/lib/yield-models';
import { WREI_TOKEN_CONFIG } from '@/lib/negotiation-config';
import { generateRiskReport, calculateRiskMetrics } from '@/lib/risk-profiles';
import { marketIntelligenceSystem } from '@/lib/market-intelligence';
import type {
  WREITokenType,
  FinancialMetrics,
  InvestmentScenario,
  RiskProfile
} from '@/lib/types';

// =============================================================================
// DASHBOARD INTERFACES
// =============================================================================

interface InstitutionalPortfolioView {
  carbonCredits: TokenHolding;
  assetCoTokens: TokenHolding;
  dualPortfolio: TokenHolding;
  totalPortfolioValue: number;
  totalYieldGenerated: number;
  diversificationBenefits: number;
}

interface TokenHolding {
  tokenType: WREITokenType;
  quantity: number;
  currentValue: number;
  bookValue: number;
  unrealizedGains: number;
  yieldGenerated: number;
  yieldMechanism: 'revenue_share' | 'nav_accruing';
  lastUpdated: string;
}

interface CollateralPosition {
  assetValue: number;
  borrowedAmount: number;
  ltvRatio: number;
  borrowingCapacity: number;
  riskAdjustedValue: number;
  marginCallLevel: number;
  liquidationLevel: number;
}

interface DashboardProps {
  investorProfile: {
    type: 'infrastructure_fund' | 'esg_impact' | 'defi_farmer' | 'family_office' | 'sovereign_wealth' | 'pension_fund';
    aum: number;
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    yieldRequirement: number;
  };
  portfolioSize: number;
  timeHorizon: number; // years
  onConfigurationChange?: (config: any) => void;
}

interface DashboardTab {
  id: string;
  label: string;
  icon: string;
  content: React.ComponentType<any>;
}

// =============================================================================
// MOCK DATA GENERATORS (Production: Real-time institutional feeds)
// =============================================================================

function generateInstitutionalPortfolio(
  portfolioSize: number,
  allocation: { carbon: number; assetCo: number; dual: number }
): InstitutionalPortfolioView {
  const carbonValue = portfolioSize * allocation.carbon;
  const assetCoValue = portfolioSize * allocation.assetCo;
  const dualValue = portfolioSize * allocation.dual;

  // Calculate yield based on WREI specifications
  const carbonYield = carbonValue * 0.08; // 8% for revenue share
  const assetCoYield = assetCoValue * 0.283; // 28.3% Asset Co yield
  const dualYield = dualValue * 0.185; // 18.5% dual portfolio yield

  return {
    carbonCredits: {
      tokenType: 'carbon_credits',
      quantity: carbonValue / 150, // A$150 per credit
      currentValue: carbonValue,
      bookValue: carbonValue * 0.95, // 5% appreciation
      unrealizedGains: carbonValue * 0.05,
      yieldGenerated: carbonYield,
      yieldMechanism: 'revenue_share',
      lastUpdated: new Date().toISOString()
    },
    assetCoTokens: {
      tokenType: 'asset_co',
      quantity: assetCoValue / 1000, // A$1,000 per token unit
      currentValue: assetCoValue,
      bookValue: assetCoValue * 0.98, // 2% appreciation
      unrealizedGains: assetCoValue * 0.02,
      yieldGenerated: assetCoYield,
      yieldMechanism: 'revenue_share',
      lastUpdated: new Date().toISOString()
    },
    dualPortfolio: {
      tokenType: 'dual_portfolio',
      quantity: dualValue / 500, // A$500 per dual token unit
      currentValue: dualValue,
      bookValue: dualValue * 0.97, // 3% appreciation
      unrealizedGains: dualValue * 0.03,
      yieldGenerated: dualYield,
      yieldMechanism: 'revenue_share',
      lastUpdated: new Date().toISOString()
    },
    totalPortfolioValue: carbonValue + assetCoValue + dualValue,
    totalYieldGenerated: carbonYield + assetCoYield + dualYield,
    diversificationBenefits: portfolioSize * 0.025 // 2.5% diversification premium
  };
}

function generateCollateralPosition(portfolioValue: number): CollateralPosition {
  const ltvRatio = 0.75; // 75% LTV for mixed portfolio
  const borrowedAmount = portfolioValue * ltvRatio * 0.6; // 60% utilization
  const riskAdjustedValue = portfolioValue * 0.85; // 15% haircut

  return {
    assetValue: portfolioValue,
    borrowedAmount,
    ltvRatio,
    borrowingCapacity: portfolioValue * ltvRatio,
    riskAdjustedValue,
    marginCallLevel: portfolioValue * 0.8, // 80% margin call
    liquidationLevel: portfolioValue * 0.7  // 70% liquidation
  };
}

// =============================================================================
// DASHBOARD OVERVIEW COMPONENT
// =============================================================================

const DashboardOverview: React.FC<{
  portfolio: InstitutionalPortfolioView;
  marketData: any;
  competitiveData: any;
  riskProfile: any;
}> = ({ portfolio, marketData, competitiveData, riskProfile }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Portfolio Summary Cards */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Portfolio Overview</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Live Data</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                A${(portfolio.totalPortfolioValue / 1_000_000).toFixed(1)}M
              </div>
              <div className="text-sm text-blue-700">Total Value</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {((portfolio.totalYieldGenerated / portfolio.totalPortfolioValue) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-green-700">Current Yield</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                +{(portfolio.diversificationBenefits / portfolio.totalPortfolioValue * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700">Diversification</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {riskProfile.volatility.toFixed(1)}%
              </div>
              <div className="text-sm text-amber-700">Portfolio Risk</div>
            </div>
          </div>

          {/* Token Holdings */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Token Holdings</h4>

            {/* Carbon Credits */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CC</span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Carbon Credits</div>
                  <div className="text-sm text-gray-600">
                    {portfolio.carbonCredits.quantity.toLocaleString()} credits @ A$150/tonne
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  A${(portfolio.carbonCredits.currentValue / 1_000_000).toFixed(2)}M
                </div>
                <div className="text-sm text-green-600">
                  +{((portfolio.carbonCredits.unrealizedGains / portfolio.carbonCredits.bookValue) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Asset Co Tokens */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AC</span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Asset Co Tokens</div>
                  <div className="text-sm text-gray-600">
                    {portfolio.assetCoTokens.quantity.toLocaleString()} units @ 28.3% yield
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  A${(portfolio.assetCoTokens.currentValue / 1_000_000).toFixed(2)}M
                </div>
                <div className="text-sm text-green-600">
                  +{((portfolio.assetCoTokens.unrealizedGains / portfolio.assetCoTokens.bookValue) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Dual Portfolio */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DP</span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Dual Portfolio</div>
                  <div className="text-sm text-gray-600">
                    {portfolio.dualPortfolio.quantity.toLocaleString()} units @ 18.5% blended yield
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  A${(portfolio.dualPortfolio.currentValue / 1_000_000).toFixed(2)}M
                </div>
                <div className="text-sm text-green-600">
                  +{((portfolio.dualPortfolio.unrealizedGains / portfolio.dualPortfolio.bookValue) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Intelligence & Risk Panel */}
      <div className="space-y-6">
        {/* Market Intelligence */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Market Intelligence</h3>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 font-medium mb-1">RWA Market</div>
              <div className="text-2xl font-bold text-blue-600">A${marketData.tokenizedRWAMarket.totalValue / 1_000_000_000}B</div>
              <div className="text-sm text-blue-600">
                +{((marketData.tokenizedRWAMarket.growthRate - 1) * 100).toFixed(0)}% growth (15 months)
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700 font-medium mb-1">Carbon Market 2030</div>
              <div className="text-2xl font-bold text-green-600">A${marketData.carbonMarket.projected2030 / 1_000_000_000}B</div>
              <div className="text-sm text-green-600">26% CAGR projection</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-700 font-medium mb-1">WREI Premium</div>
              <div className="text-2xl font-bold text-purple-600">+23%</div>
              <div className="text-sm text-purple-600">vs USYC/BUIDL benchmarks</div>
            </div>
          </div>

          {/* Competitive Positioning */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-800 mb-3">Competitive Advantages</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Native Digital Credits</span>
                <span className="text-green-600 font-medium">✓ T+0 Settlement</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Asset-Backed Yield</span>
                <span className="text-green-600 font-medium">✓ Real Economics</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cross-Collateral</span>
                <span className="text-green-600 font-medium">✓ 90% LTV</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Regulatory Clarity</span>
                <span className="text-green-600 font-medium">✓ Australian AFSL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Risk Assessment</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Portfolio Volatility</span>
                <span className="text-sm font-medium">{riskProfile.volatility.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(riskProfile.volatility * 2, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Sharpe Ratio</span>
                <span className="text-sm font-medium">{riskProfile.sharpeRatio.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min(riskProfile.sharpeRatio * 50, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Regulatory Risk</span>
                <span className="text-sm font-medium text-green-600">Low</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-1/4"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Liquidity Risk</span>
                <span className="text-sm font-medium text-amber-600">Medium</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full w-1/2"></div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong className="text-gray-800">Risk Grade:</strong> {riskProfile.riskGrade}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Composite score based on volatility, regulatory, liquidity, and operational factors
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// YIELD MECHANISM SELECTOR COMPONENT
// =============================================================================

const YieldMechanismSelector: React.FC<{
  currentMechanism: 'revenue_share' | 'nav_accruing';
  onMechanismChange: (mechanism: 'revenue_share' | 'nav_accruing') => void;
  tokenType: WREITokenType;
}> = ({ currentMechanism, onMechanismChange, tokenType }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Yield Mechanism Selection</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue Share */}
        <div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            currentMechanism === 'revenue_share'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onMechanismChange('revenue_share')}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">RS</span>
            </div>
            <div>
              <div className="font-medium text-gray-800">Revenue Share</div>
              <div className="text-sm text-gray-600">Quarterly distributions</div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Carbon Credits:</span>
              <span className="font-medium">8.0% annual</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Asset Co:</span>
              <span className="font-medium">28.3% annual</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dual Portfolio:</span>
              <span className="font-medium">18.5% blended</span>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
              <strong>Tax:</strong> Income treatment, franking credits eligible
            </div>
          </div>
        </div>

        {/* NAV-Accruing */}
        <div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            currentMechanism === 'nav_accruing'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onMechanismChange('nav_accruing')}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">NA</span>
            </div>
            <div>
              <div className="font-medium text-gray-800">NAV-Accruing</div>
              <div className="text-sm text-gray-600">Token value appreciation</div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Carbon Credits:</span>
              <span className="font-medium">12.0% appreciation</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Asset Co:</span>
              <span className="font-medium">28.3% (retained)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dual Portfolio:</span>
              <span className="font-medium">18.5% compounded</span>
            </div>
            <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
              <strong>Tax:</strong> CGT treatment, 50% discount after 12 months
            </div>
          </div>
        </div>
      </div>

      {/* Mechanism Comparison */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">5-Year Projection (A$1M Investment)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-600 mb-2">Revenue Share</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Annual Cash Flow:</span>
                <span className="font-medium">A$185K</span>
              </div>
              <div className="flex justify-between">
                <span>5-Year Total:</span>
                <span className="font-medium">A$925K</span>
              </div>
              <div className="flex justify-between">
                <span>After Tax (30%):</span>
                <span className="font-medium">A$647K</span>
              </div>
            </div>
          </div>
          <div>
            <div className="font-medium text-green-600 mb-2">NAV-Accruing</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Token Appreciation:</span>
                <span className="font-medium">A$2.38M</span>
              </div>
              <div className="flex justify-between">
                <span>Capital Gains:</span>
                <span className="font-medium">A$1.38M</span>
              </div>
              <div className="flex justify-between">
                <span>After CGT (15%):</span>
                <span className="font-medium">A$1.17M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// CROSS-COLLATERALIZATION TRACKING COMPONENT
// =============================================================================

const CrossCollateralizationTracker: React.FC<{
  collateralPosition: CollateralPosition;
  portfolio: InstitutionalPortfolioView;
}> = ({ collateralPosition, portfolio }) => {
  const utilizationPercentage = (collateralPosition.borrowedAmount / collateralPosition.borrowingCapacity) * 100;
  const marginCallDistance = ((collateralPosition.marginCallLevel - collateralPosition.assetValue) / collateralPosition.assetValue) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">Cross-Collateralization Position</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            utilizationPercentage < 60 ? 'bg-green-500' : utilizationPercentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {utilizationPercentage < 60 ? 'Safe' : utilizationPercentage < 80 ? 'Moderate' : 'High Risk'}
          </span>
        </div>
      </div>

      {/* Collateral Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-blue-600">
            A${(collateralPosition.assetValue / 1_000_000).toFixed(1)}M
          </div>
          <div className="text-sm text-blue-700">Collateral Value</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-purple-600">
            {(collateralPosition.ltvRatio * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-purple-700">Max LTV</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-amber-600">
            A${(collateralPosition.borrowedAmount / 1_000_000).toFixed(1)}M
          </div>
          <div className="text-sm text-amber-700">Borrowed</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-green-600">
            A${((collateralPosition.borrowingCapacity - collateralPosition.borrowedAmount) / 1_000_000).toFixed(1)}M
          </div>
          <div className="text-sm text-green-700">Available</div>
        </div>
      </div>

      {/* Utilization Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Borrowing Utilization</span>
          <span className="text-sm font-medium">{utilizationPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              utilizationPercentage < 60 ? 'bg-green-500' : utilizationPercentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Safe (0-60%)</span>
          <span>Moderate (60-80%)</span>
          <span>High Risk (80%+)</span>
        </div>
      </div>

      {/* Token-Specific Collateral Breakdown */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-800 mb-3">Collateral Breakdown by Token Type</h4>

        <div className="space-y-3">
          {/* Carbon Credits Collateral */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">CC</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">Carbon Credits</div>
                <div className="text-xs text-gray-600">LTV: 75% | Haircut: 10%</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">
                A${(portfolio.carbonCredits.currentValue / 1_000_000).toFixed(2)}M
              </div>
              <div className="text-xs text-gray-600">
                Borrowing: A${(portfolio.carbonCredits.currentValue * 0.75 / 1_000_000).toFixed(2)}M
              </div>
            </div>
          </div>

          {/* Asset Co Collateral */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">AC</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">Asset Co Tokens</div>
                <div className="text-xs text-gray-600">LTV: 80% | Haircut: 5%</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">
                A${(portfolio.assetCoTokens.currentValue / 1_000_000).toFixed(2)}M
              </div>
              <div className="text-xs text-gray-600">
                Borrowing: A${(portfolio.assetCoTokens.currentValue * 0.8 / 1_000_000).toFixed(2)}M
              </div>
            </div>
          </div>

          {/* Dual Portfolio Collateral */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">DP</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">Dual Portfolio</div>
                <div className="text-xs text-gray-600">LTV: 90% | Haircut: 3%</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">
                A${(portfolio.dualPortfolio.currentValue / 1_000_000).toFixed(2)}M
              </div>
              <div className="text-xs text-gray-600">
                Borrowing: A${(portfolio.dualPortfolio.currentValue * 0.9 / 1_000_000).toFixed(2)}M
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Monitoring */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Risk Monitoring</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Margin Call Level:</span>
              <span className="font-medium text-amber-600">
                A${(collateralPosition.marginCallLevel / 1_000_000).toFixed(2)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Liquidation Level:</span>
              <span className="font-medium text-red-600">
                A${(collateralPosition.liquidationLevel / 1_000_000).toFixed(2)}M
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Distance to Margin Call:</span>
              <span className={`font-medium ${marginCallDistance < -10 ? 'text-red-600' : 'text-green-600'}`}>
                {marginCallDistance > 0 ? '+' : ''}{marginCallDistance.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Health Factor:</span>
              <span className={`font-medium ${collateralPosition.assetValue / collateralPosition.borrowedAmount > 1.5 ? 'text-green-600' : 'text-amber-600'}`}>
                {(collateralPosition.assetValue / collateralPosition.borrowedAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN INSTITUTIONAL DASHBOARD COMPONENT
// =============================================================================

const InstitutionalDashboard: React.FC<DashboardProps> = ({
  investorProfile,
  portfolioSize,
  timeHorizon,
  onConfigurationChange
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [yieldMechanism, setYieldMechanism] = useState<'revenue_share' | 'nav_accruing'>('revenue_share');
  const [portfolioAllocation, setPortfolioAllocation] = useState({
    carbon: 0.4,    // 40% Carbon Credits
    assetCo: 0.4,   // 40% Asset Co
    dual: 0.2       // 20% Dual Portfolio
  });

  // Data generation
  const portfolio = useMemo(() =>
    generateInstitutionalPortfolio(portfolioSize, portfolioAllocation),
    [portfolioSize, portfolioAllocation]
  );

  const collateralPosition = useMemo(() =>
    generateCollateralPosition(portfolio.totalPortfolioValue),
    [portfolio.totalPortfolioValue]
  );

  // Generate market intelligence data based on Phase 5 specifications
  const marketData = useMemo(() => ({
    tokenizedRWAMarket: {
      totalValue: 19_000_000_000, // A$19B
      growthRate: 1.4,            // 140% in 15 months
      treasuryTokens: 9_000_000_000 // A$9B treasury dominance
    },
    carbonMarket: {
      current2024: 2_000_000_000,    // A$2B current
      projected2030: 155_000_000_000, // A$155B projected
      cagr: 0.26                      // 26% CAGR
    },
    competitors: {
      usyc: { aum: 500_000_000, yieldMechanism: 'treasury_yield' },
      buidl: { aum: 800_000_000, yieldMechanism: 'institutional_grade' },
      toucan: { focus: 'carbon_only', limitation: 'limited_verification' },
      carbonmark: { focus: 'marketplace', limitation: 'no_yield_mechanism' }
    }
  }), []);

  // Generate competitive positioning data
  const competitiveData = useMemo(() => ({
    wreiAdvantages: {
      yieldPremium: 0.23,              // +23% vs USYC/BUIDL
      settlementAdvantage: 'T+0',      // vs T+7-30 for traditional
      verificationStandards: 3,         // Triple standard compliance
      crossCollateralMax: 0.9         // 90% LTV capability
    },
    benchmarkComparisons: {
      infrastructureREITs: { averageYield: 0.08, limitation: 'illiquid' },
      carbonETFs: { averageYield: 0.045, limitation: 'no_underlying_yield' },
      defiProtocols: { averageYield: 0.15, limitation: 'smart_contract_risk' }
    }
  }), []);

  // Generate risk profile based on Phase 3 specifications
  const riskProfile = useMemo(() => ({
    volatility: 15.0, // 15% blended volatility for dual portfolio
    sharpeRatio: 1.2, // 1.2 Sharpe ratio
    riskGrade: 'BBB+' as const, // BBB+ risk grade
    correlation: {
      carbon: 0.3,
      traditional: 0.1,
      crypto: 0.4
    }
  }), []);

  // Tab configuration
  const tabs: DashboardTab[] = [
    {
      id: 'overview',
      label: 'Portfolio Overview',
      icon: '📊',
      content: () => (
        <DashboardOverview
          portfolio={portfolio}
          marketData={marketData}
          competitiveData={competitiveData}
          riskProfile={riskProfile}
        />
      )
    },
    {
      id: 'yield',
      label: 'Yield Mechanisms',
      icon: '💰',
      content: () => (
        <YieldMechanismSelector
          currentMechanism={yieldMechanism}
          onMechanismChange={setYieldMechanism}
          tokenType="dual_portfolio"
        />
      )
    },
    {
      id: 'collateral',
      label: 'Cross-Collateral',
      icon: '🔗',
      content: () => (
        <CrossCollateralizationTracker
          collateralPosition={collateralPosition}
          portfolio={portfolio}
        />
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                WREI Institutional Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Professional investment interface for {investorProfile.type.replace('_', ' ')} •
                AUM: A${(investorProfile.aum / 1_000_000_000).toFixed(1)}B •
                Portfolio: A${(portfolioSize / 1_000_000).toFixed(1)}M
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg px-4 py-2 shadow">
                <div className="text-sm text-gray-600">Total Return</div>
                <div className="text-xl font-bold text-green-600">
                  +{((portfolio.totalYieldGenerated +
                    (portfolio.carbonCredits.unrealizedGains + portfolio.assetCoTokens.unrealizedGains + portfolio.dualPortfolio.unrealizedGains)) /
                    portfolio.totalPortfolioValue * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow">
                <div className="text-sm text-gray-600">Benchmark</div>
                <div className="text-xl font-bold text-blue-600">+23%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={activeTab === tab.id ? 'block' : 'hidden'}
            >
              <tab.content />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            WREI Institutional Dashboard • Real-time data • Last updated: {new Date().toLocaleString('en-AU')}
          </p>
          <p className="mt-1">
            Powered by WREI Tokenization Platform • Australian AFSL Compliant • Professional Investor Use Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalDashboard;