/**
 * WREI Advanced Analytics Dashboard - Institutional Investment Analytics
 *
 * Comprehensive analytics interface for institutional investors showcasing:
 * - Fleet performance metrics (88 vessels + 22 Deep Power units)
 * - Lease income tracking and projections
 * - Carbon generation rates from vessel telemetry
 * - Cross-collateralization position tracking
 * - Real-time financial performance metrics
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  calculateCarbonCreditMetrics,
  calculateAssetCoMetrics,
  calculateDualPortfolioMetrics,
  formatFinancialMetrics,
  WREI_FINANCIAL_CONSTANTS
} from '@/lib/financial-calculations';
import { WREI_YIELD_MODELS, calculateAnnualYield } from '@/lib/yield-models';
import { WREI_TOKEN_CONFIG } from '@/lib/negotiation-config';
import type {
  WREITokenType,
  FinancialMetrics,
  InvestmentScenario,
  RiskProfile
} from '@/lib/types';

// =============================================================================
// ANALYTICS INTERFACES
// =============================================================================

interface FleetMetrics {
  totalVessels: number;
  operationalVessels: number;
  deepPowerUnits: number;
  totalCapex: number;
  utilization: number;
  averagePassengersPerTrip: number;
  dailyTrips: number;
  monthlyLeaseIncome: number;
}

interface CarbonMetrics {
  dailyCarbonGeneration: number;
  monthlyCreditsGenerated: number;
  cumulativeCredits: number;
  vesselEfficiencyContribution: number;
  modalShiftContribution: number;
  constructionAvoidanceContribution: number;
  averageEmissionIntensity: number;
}

interface CrossCollateralPosition {
  carbonCreditHoldings: number;
  assetCoHoldings: number;
  totalPortfolioValue: number;
  collateralUtilization: number;
  borrowingCapacity: number;
  leverageRatio: number;
  riskAdjustedValue: number;
}

interface AnalyticsProps {
  tokenType: WREITokenType;
  investmentAmount: number;
  timeHorizon: number; // years
  onMetricsChange?: (metrics: FinancialMetrics) => void;
}

// =============================================================================
// MOCK DATA GENERATORS (Production: Real-time API feeds)
// =============================================================================

function generateFleetMetrics(currentDate: Date = new Date()): FleetMetrics {
  // Simulate ramp-up phase (2027-2030) vs steady state (2031-2037)
  const currentYear = currentDate.getFullYear();
  const isRampUp = currentYear <= 2030;
  const operationalRatio = isRampUp ? 0.6 : 1.0; // 60% during ramp-up, 100% at steady state

  return {
    totalVessels: WREI_TOKEN_CONFIG.ASSET_CO.FLEET.VESSEL_COUNT,
    operationalVessels: Math.floor(WREI_TOKEN_CONFIG.ASSET_CO.FLEET.VESSEL_COUNT * operationalRatio),
    deepPowerUnits: WREI_TOKEN_CONFIG.ASSET_CO.FLEET.DEEP_POWER_UNITS,
    totalCapex: WREI_TOKEN_CONFIG.ASSET_CO.TOTAL_CAPEX,
    utilization: isRampUp ? 0.75 : 0.85, // 75% ramp-up, 85% steady state
    averagePassengersPerTrip: isRampUp ? 28 : 35,
    dailyTrips: isRampUp ? 120 : 180,
    monthlyLeaseIncome: isRampUp
      ? WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.ANNUAL_LEASE_INCOME * 0.7 / 12
      : WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.ANNUAL_LEASE_INCOME / 12
  };
}

function generateCarbonMetrics(fleetMetrics: FleetMetrics): CarbonMetrics {
  // Based on WREI document specifications for emission generation
  const dailyPassengers = fleetMetrics.dailyTrips * fleetMetrics.averagePassengersPerTrip;
  const avgTripDistance = 12; // km average

  // Vessel efficiency calculation (electric vs diesel baseline)
  const electricConsumption = WREI_TOKEN_CONFIG.CARBON_CREDITS.EMISSION_SOURCES.VESSEL_EFFICIENCY.ELECTRIC_CONSUMPTION;
  const dieselBaseline = WREI_TOKEN_CONFIG.CARBON_CREDITS.EMISSION_SOURCES.VESSEL_EFFICIENCY.DIESEL_BASELINE;
  const efficiencyGain = dieselBaseline - electricConsumption; // 3.19 kWh/pax-km saved

  // Daily carbon generation calculation
  const dailyCarbonFromEfficiency = (dailyPassengers * avgTripDistance * efficiencyGain * 0.5) / 1000; // Convert to tonnes CO2e
  const dailyCarbonFromModal = dailyCarbonFromEfficiency * 0.4; // 40% modal shift benefit
  const dailyCarbonFromConstruction = dailyCarbonFromEfficiency * 0.05; // 5% construction avoidance

  const totalDailyCarbon = dailyCarbonFromEfficiency + dailyCarbonFromModal + dailyCarbonFromConstruction;

  return {
    dailyCarbonGeneration: totalDailyCarbon,
    monthlyCreditsGenerated: totalDailyCarbon * 30,
    cumulativeCredits: totalDailyCarbon * 365 * 3, // Simulated 3 years of operations
    vesselEfficiencyContribution: WREI_TOKEN_CONFIG.CARBON_CREDITS.EMISSION_SOURCES.VESSEL_EFFICIENCY.CONTRIBUTION_PCT,
    modalShiftContribution: WREI_TOKEN_CONFIG.CARBON_CREDITS.EMISSION_SOURCES.MODAL_SHIFT.CONTRIBUTION_PCT,
    constructionAvoidanceContribution: WREI_TOKEN_CONFIG.CARBON_CREDITS.EMISSION_SOURCES.CONSTRUCTION_AVOIDANCE.CONTRIBUTION_PCT,
    averageEmissionIntensity: electricConsumption // kWh/passenger-km
  };
}

function generateCrossCollateralPosition(
  tokenType: WREITokenType,
  investmentAmount: number
): CrossCollateralPosition {
  let carbonHoldings = 0;
  let assetCoHoldings = 0;

  switch (tokenType) {
    case 'carbon_credits':
      carbonHoldings = investmentAmount;
      break;
    case 'asset_co':
      assetCoHoldings = investmentAmount;
      break;
    case 'dual_portfolio':
      carbonHoldings = investmentAmount * 0.4; // 40% allocation
      assetCoHoldings = investmentAmount * 0.6; // 60% allocation
      break;
  }

  const totalValue = carbonHoldings + assetCoHoldings;
  const collateralValue = assetCoHoldings * 0.8; // Asset Co tokens have 80% loan-to-value
  const currentUtilization = 0.25; // 25% current utilization

  return {
    carbonCreditHoldings: carbonHoldings,
    assetCoHoldings: assetCoHoldings,
    totalPortfolioValue: totalValue,
    collateralUtilization: currentUtilization,
    borrowingCapacity: collateralValue,
    leverageRatio: currentUtilization > 0 ? totalValue / (totalValue * (1 - currentUtilization)) : 1.0,
    riskAdjustedValue: totalValue * 0.85 // 15% risk haircut
  };
}

// =============================================================================
// ANALYTICS DASHBOARD COMPONENT
// =============================================================================

export default function AdvancedAnalytics({
  tokenType,
  investmentAmount,
  timeHorizon,
  onMetricsChange
}: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'carbon' | 'collateral' | 'financial'>('overview');
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds

  // Generate analytics data
  const fleetMetrics = useMemo(() => generateFleetMetrics(), []);
  const carbonMetrics = useMemo(() => generateCarbonMetrics(fleetMetrics), [fleetMetrics]);
  const collateralPosition = useMemo(
    () => generateCrossCollateralPosition(tokenType, investmentAmount),
    [tokenType, investmentAmount]
  );

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const scenario: InvestmentScenario = {
      initialInvestment: investmentAmount,
      holdingPeriod: timeHorizon,
      exitMultiple: tokenType === 'asset_co' ? 3.0 : 2.0,
      discountRate: 0.08,
      taxRate: 0.30,
      inflationRate: 0.025
    };

    switch (tokenType) {
      case 'carbon_credits':
        return calculateCarbonCreditMetrics(scenario, WREI_YIELD_MODELS.carbon_revenue_share);
      case 'asset_co':
        return calculateAssetCoMetrics(scenario, WREI_YIELD_MODELS.asset_co_revenue_share);
      case 'dual_portfolio':
        return calculateDualPortfolioMetrics(scenario);
      default:
        return calculateCarbonCreditMetrics(scenario, WREI_YIELD_MODELS.carbon_revenue_share);
    }
  }, [tokenType, investmentAmount, timeHorizon]);

  // Notify parent of metrics changes
  React.useEffect(() => {
    onMetricsChange?.(financialMetrics);
  }, [financialMetrics, onMetricsChange]);

  const formattedMetrics = formatFinancialMetrics(financialMetrics);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="bloomberg-large-metric text-gray-900">
              WREI Advanced Analytics
            </h2>
            <p className="bloomberg-small-text text-gray-600 mt-1">
              Real-time performance metrics for {tokenType.replace('_', ' ')} investment
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="bloomberg-small-text text-gray-600">Investment Value</div>
              <div className="bloomberg-metric-value text-[#1B2A4A]">
                A${(investmentAmount / 1000000).toFixed(2)}M
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'fleet', name: 'Fleet Performance', icon: '🚢' },
            { id: 'carbon', name: 'Carbon Generation', icon: '🌱' },
            { id: 'collateral', name: 'Cross-Collateral', icon: '🔗' },
            { id: 'financial', name: 'Financial Metrics', icon: '💰' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 bloomberg-small-text font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#0EA5E9] text-[#0EA5E9]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Key Performance Indicators */}
            <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0EA5E9] rounded-lg p-4 text-white">
              <div className="bloomberg-small-text opacity-90">Expected IRR</div>
              <div className="bloomberg-large-metric">{formattedMetrics.irr}</div>
              <div className="bloomberg-section-label opacity-75 mt-1">Annualised return</div>
            </div>

            <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-lg p-4 text-white">
              <div className="bloomberg-small-text opacity-90">Cash-on-Cash</div>
              <div className="bloomberg-large-metric">{formattedMetrics.cashOnCash}</div>
              <div className="bloomberg-section-label opacity-75 mt-1">Return multiple</div>
            </div>

            <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-lg p-4 text-white">
              <div className="bloomberg-small-text opacity-90">Payback Period</div>
              <div className="bloomberg-large-metric">{formattedMetrics.paybackPeriod}</div>
              <div className="bloomberg-section-label opacity-75 mt-1">Investment recovery</div>
            </div>

            <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-lg p-4 text-white">
              <div className="bloomberg-small-text opacity-90">Total Return</div>
              <div className="bloomberg-large-metric">{formattedMetrics.totalReturn}</div>
              <div className="bloomberg-section-label opacity-75 mt-1">Lifetime gain</div>
            </div>

            {/* Portfolio Composition */}
            <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
              <h3 className="bloomberg-card-title text-gray-900 mb-4">Portfolio Composition</h3>
              <div className="space-y-3">
                {tokenType === 'dual_portfolio' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="bloomberg-small-text text-gray-600">Carbon Credits (40%)</span>
                      <span className="font-medium">A${(collateralPosition.carbonCreditHoldings / 1000000).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="bloomberg-small-text text-gray-600">Asset Co Tokens (60%)</span>
                      <span className="font-medium">A${(collateralPosition.assetCoHoldings / 1000000).toFixed(2)}M</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="bloomberg-small-text text-gray-600">
                      {tokenType === 'carbon_credits' ? 'Carbon Credits (100%)' : 'Asset Co Tokens (100%)'}
                    </span>
                    <span className="font-medium">A${(investmentAmount / 1000000).toFixed(2)}M</span>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
              <h3 className="bloomberg-card-title text-gray-900 mb-4">Risk Profile</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="bloomberg-small-text text-gray-600">Volatility</span>
                  <span className="font-medium">
                    {tokenType === 'carbon_credits' ? '25%' :
                     tokenType === 'asset_co' ? '12%' : '15%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="bloomberg-small-text text-gray-600">Sharpe Ratio</span>
                  <span className="font-medium">
                    {tokenType === 'carbon_credits' ? '0.8' :
                     tokenType === 'asset_co' ? '1.2' : '1.0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="bloomberg-small-text text-gray-600">Market Correlation</span>
                  <span className="font-medium">0.2 - 0.3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <FleetPerformanceTab fleetMetrics={fleetMetrics} />
        )}

        {activeTab === 'carbon' && (
          <CarbonGenerationTab carbonMetrics={carbonMetrics} />
        )}

        {activeTab === 'collateral' && (
          <CrossCollateralTab collateralPosition={collateralPosition} />
        )}

        {activeTab === 'financial' && (
          <FinancialMetricsTab
            metrics={financialMetrics}
            formattedMetrics={formattedMetrics}
            tokenType={tokenType}
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-3 bloomberg-section-label text-gray-500 flex justify-between items-center">
        <div>
          Last updated: {new Date().toLocaleTimeString()} |
          Auto-refresh: {refreshInterval}s |
          Data source: WREI Real-time Analytics Engine
        </div>
        <div className="text-[#0EA5E9]">
          ⚡ Live Data Feed Active
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TAB COMPONENTS
// =============================================================================

function FleetPerformanceTab({ fleetMetrics }: { fleetMetrics: FleetMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fleet Status */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="bloomberg-card-title text-gray-900">Fleet Status</h3>
            <div className="bloomberg-large-metric">🚢</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="bloomberg-small-text text-gray-600">Total Vessels</span>
              <span className="font-medium">{fleetMetrics.totalVessels}</span>
            </div>
            <div className="flex justify-between">
              <span className="bloomberg-small-text text-gray-600">Operational</span>
              <span className="font-medium text-green-600">{fleetMetrics.operationalVessels}</span>
            </div>
            <div className="flex justify-between">
              <span className="bloomberg-small-text text-gray-600">Deep Power Units</span>
              <span className="font-medium">{fleetMetrics.deepPowerUnits}</span>
            </div>
            <div className="flex justify-between">
              <span className="bloomberg-small-text text-gray-600">Fleet Utilization</span>
              <span className="font-medium">{(fleetMetrics.utilization * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="bloomberg-card-title text-gray-900">Operations</h3>
            <div className="bloomberg-large-metric">📊</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="bloomberg-small-text text-gray-600">Daily Trips</span>
              <span className="font-medium">{fleetMetrics.dailyTrips.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="bloomberg-small-text text-gray-600">Avg Passengers/Trip</span>
              <span className="font-medium">{fleetMetrics.averagePassengersPerTrip}</span>
            </div>
            <div className="flex justify-between">
              <span className="bloomberg-small-text text-gray-600">Daily Passengers</span>
              <span className="font-medium">
                {(fleetMetrics.dailyTrips * fleetMetrics.averagePassengersPerTrip).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Performance */}
        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="bloomberg-card-title text-gray-900">Lease Income</h3>
            <div className="bloomberg-large-metric">💰</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="bloomberg-small-text text-gray-600">Monthly Income</span>
              <span className="font-medium">
                A${(fleetMetrics.monthlyLeaseIncome / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span className="bloomberg-small-text text-gray-600">Annual Projection</span>
              <span className="font-medium">
                A${(fleetMetrics.monthlyLeaseIncome * 12 / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span className="bloomberg-small-text text-gray-600">Total Capex</span>
              <span className="font-medium">
                A${(fleetMetrics.totalCapex / 1000000).toFixed(0)}M
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="bloomberg-card-title text-gray-900 mb-4">Fleet Deployment Timeline</h3>
        <div className="relative">
          <div className="flex justify-between items-center bloomberg-small-text text-gray-600 mb-2">
            <span>2027</span>
            <span>2028</span>
            <span>2029</span>
            <span>2030</span>
            <span>2031-2037 (Steady State)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-gradient-to-r from-[#F59E0B] via-[#10B981] to-[#0EA5E9] h-3 rounded-full"
                 style={{ width: '100%' }}>
            </div>
          </div>
          <div className="flex justify-between items-center bloomberg-section-label text-gray-500 mt-2">
            <span>Ramp-up Phase</span>
            <span>Full Operations</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CarbonGenerationTab({ carbonMetrics }: { carbonMetrics: CarbonMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Generation Rates */}
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="bloomberg-card-title text-gray-900">Daily Generation</h3>
            <div className="bloomberg-large-metric">🌱</div>
          </div>
          <div className="bloomberg-large-metric text-green-600">
            {carbonMetrics.dailyCarbonGeneration.toFixed(1)} tCO₂e
          </div>
          <div className="bloomberg-small-text text-gray-600 mt-1">Per day</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="bloomberg-card-title text-gray-900">Monthly Credits</h3>
            <div className="bloomberg-large-metric">📈</div>
          </div>
          <div className="bloomberg-large-metric text-blue-600">
            {Math.round(carbonMetrics.monthlyCreditsGenerated).toLocaleString()}
          </div>
          <div className="bloomberg-small-text text-gray-600 mt-1">Credits generated</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="bloomberg-card-title text-gray-900">Cumulative</h3>
            <div className="bloomberg-large-metric">🏆</div>
          </div>
          <div className="bloomberg-large-metric text-purple-600">
            {(carbonMetrics.cumulativeCredits / 1000000).toFixed(2)}M
          </div>
          <div className="bloomberg-small-text text-gray-600 mt-1">Total credits</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="bloomberg-card-title text-gray-900">Efficiency</h3>
            <div className="bloomberg-large-metric">⚡</div>
          </div>
          <div className="bloomberg-large-metric text-orange-600">
            {carbonMetrics.averageEmissionIntensity}
          </div>
          <div className="bloomberg-small-text text-gray-600 mt-1">kWh/pax-km</div>
        </div>
      </div>

      {/* Generation Sources Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="bloomberg-card-title text-gray-900 mb-4">Emission Generation Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bloomberg-page-heading mb-2">🚢</div>
            <div className="bloomberg-card-title text-gray-900">Vessel Efficiency</div>
            <div className="bloomberg-large-metric text-[#0EA5E9] mb-2">
              {carbonMetrics.vesselEfficiencyContribution}%
            </div>
            <div className="bloomberg-small-text text-gray-600">
              Electric vs diesel baseline
              <br />
              96% efficiency improvement
            </div>
          </div>

          <div className="text-center">
            <div className="bloomberg-page-heading mb-2">🚗➡️🚢</div>
            <div className="bloomberg-card-title text-gray-900">Modal Shift</div>
            <div className="bloomberg-large-metric text-[#10B981] mb-2">
              {carbonMetrics.modalShiftContribution}%
            </div>
            <div className="bloomberg-small-text text-gray-600">
              40% passenger modal shift
              <br />
              From private vehicles
            </div>
          </div>

          <div className="text-center">
            <div className="bloomberg-page-heading mb-2">🏗️❌</div>
            <div className="bloomberg-card-title text-gray-900">Construction Avoided</div>
            <div className="bloomberg-large-metric text-[#F59E0B] mb-2">
              {carbonMetrics.constructionAvoidanceContribution}%
            </div>
            <div className="bloomberg-small-text text-gray-600">
              Infrastructure not built
              <br />
              30-year amortization
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrossCollateralTab({ collateralPosition }: { collateralPosition: CrossCollateralPosition }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Position Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="bloomberg-card-title text-gray-900 mb-4">Collateral Position</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="bloomberg-small-text text-gray-600">Carbon Credit Holdings</span>
              <span className="font-medium">
                A${(collateralPosition.carbonCreditHoldings / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="bloomberg-small-text text-gray-600">Asset Co Holdings</span>
              <span className="font-medium">
                A${(collateralPosition.assetCoHoldings / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="bloomberg-small-text text-gray-600">Total Portfolio Value</span>
              <span className=" bloomberg-card-title">
                A${(collateralPosition.totalPortfolioValue / 1000000).toFixed(2)}M
              </span>
            </div>
          </div>
        </div>

        {/* Borrowing Capacity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="bloomberg-card-title text-gray-900 mb-4">Borrowing Power</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">Borrowing Capacity</span>
              <span className="font-medium text-green-600">
                A${(collateralPosition.borrowingCapacity / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">Current Utilization</span>
              <span className="font-medium">
                {(collateralPosition.collateralUtilization * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#10B981] to-[#059669] h-3 rounded-full transition-all duration-300"
                style={{ width: `${collateralPosition.collateralUtilization * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">Available to Borrow</span>
              <span className="font-medium text-blue-600">
                A${((collateralPosition.borrowingCapacity * (1 - collateralPosition.collateralUtilization)) / 1000000).toFixed(2)}M
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Collateral Strategies */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="bloomberg-card-title text-gray-900 mb-4">Cross-Collateral Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="bloomberg-large-metric mb-2">🔄</div>
            <div className=" text-gray-900 mb-2">Yield Optimization</div>
            <div className="bloomberg-small-text text-gray-600">
              Use Asset Co yield as collateral to borrow stablecoins,
              deploy into Carbon Credits for additional exposure
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="bloomberg-large-metric mb-2">⚖️</div>
            <div className=" text-gray-900 mb-2">Risk Balancing</div>
            <div className="bloomberg-small-text text-gray-600">
              Balance carbon price volatility with
              stable infrastructure yield through dynamic allocation
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="bloomberg-large-metric mb-2">🏦</div>
            <div className=" text-gray-900 mb-2">DeFi Integration</div>
            <div className="bloomberg-small-text text-gray-600">
              Access institutional DeFi protocols using
              WREI tokens as yield-bearing collateral
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialMetricsTab({
  metrics,
  formattedMetrics,
  tokenType
}: {
  metrics: FinancialMetrics;
  formattedMetrics: Record<string, string>;
  tokenType: WREITokenType;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Core Return Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="bloomberg-card-title text-gray-900 mb-4">Return Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">IRR (Internal Rate of Return)</span>
              <span className=" text-[#0EA5E9]">{formattedMetrics.irr}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">Total Return</span>
              <span className=" text-[#10B981]">{formattedMetrics.totalReturn}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">CAGR</span>
              <span className=" text-[#8B5CF6]">{formattedMetrics.compoundAnnualGrowthRate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">Risk-Adjusted Return</span>
              <span className=" text-[#F59E0B]">{formattedMetrics.riskAdjustedReturn}</span>
            </div>
          </div>
        </div>

        {/* Cash Flow Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="bloomberg-card-title text-gray-900 mb-4">Cash Flow Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">Cash-on-Cash Multiple</span>
              <span className=" text-[#0EA5E9]">{formattedMetrics.cashOnCash}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">Yield on Cost</span>
              <span className=" text-[#10B981]">{formattedMetrics.yieldOnCost}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">Payback Period</span>
              <span className=" text-[#F59E0B]">{formattedMetrics.paybackPeriod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">Net Present Value</span>
              <span className=" text-[#8B5CF6]">{formattedMetrics.npv}</span>
            </div>
          </div>
        </div>

        {/* Benchmark Comparisons */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="bloomberg-card-title text-gray-900 mb-4">Market Benchmarks</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">vs USYC (Treasury)</span>
              <span className=" text-green-600">+{
                tokenType === 'asset_co' ? '23.3%' :
                tokenType === 'carbon_credits' ? '3-7%' : '15-17%'
              }</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">vs Infrastructure REITs</span>
              <span className=" text-green-600">+{
                tokenType === 'asset_co' ? '16-20%' :
                tokenType === 'carbon_credits' ? '0-4%' : '8-14%'
              }</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">vs Carbon ETFs</span>
              <span className=" text-green-600">+{
                tokenType === 'asset_co' ? '26.3%' :
                tokenType === 'carbon_credits' ? '6-10%' : '16-20%'
              }</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="bloomberg-small-text text-gray-600">Market Correlation</span>
              <span className="font-medium text-blue-600">0.2-0.3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Projection Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="bloomberg-card-title text-gray-900 mb-4">Investment Performance Projection</h3>
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📈</div>
          <div className="bloomberg-card-title text-gray-900 mb-2">
            Performance Chart Visualization
          </div>
          <div className="bloomberg-small-text text-gray-600">
            Real-time performance tracking and projection charts will be displayed here.
            <br />
            Integration with charting library (Chart.js/D3) for production deployment.
          </div>
        </div>
      </div>
    </div>
  );
}