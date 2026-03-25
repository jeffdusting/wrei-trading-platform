/**
 * WREI Trading Platform - Demo Data Provider
 *
 * Context provider for injecting demo data into existing components
 * Seamlessly replaces real data with demo scenarios when active
 */

'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useDemoMode } from '@/lib/demo-mode/demo-state-manager';
import { DEMO_DATA_SETS } from '@/lib/demo-mode/demo-data-sets';

interface DemoDataContextType {
  isDemoActive: boolean;
  getDemoData: (key: string, fallback?: any) => any;
  getInvestorProfile: () => any;
  getMarketData: () => any;
  getNegotiationHistory: () => any[];
  getPortfolioData: () => any;
  getComplianceData: () => any;
  getAnalyticsData: () => any;
}

const DemoDataContext = createContext<DemoDataContextType>({
  isDemoActive: false,
  getDemoData: (key: string, fallback?: any) => fallback,
  getInvestorProfile: () => null,
  getMarketData: () => null,
  getNegotiationHistory: () => [],
  getPortfolioData: () => null,
  getComplianceData: () => null,
  getAnalyticsData: () => null
});

interface DemoDataProviderProps {
  children: React.ReactNode;
}

export function DemoDataProvider({ children }: DemoDataProviderProps) {
  const { isActive, prePopulatedData, setPrePopulatedData, currentTour } = useDemoMode();

  // Load appropriate demo data set based on current tour
  useEffect(() => {
    if (!isActive || prePopulatedData) return;

    let dataSetKey = 'infrastructure_discovery'; // default

    switch (currentTour) {
      case 'investor-deep-dive':
        dataSetKey = 'infrastructure_discovery';
        break;
      case 'technical-integration':
        dataSetKey = 'trading_desk_execution';
        break;
      case 'compliance-walkthrough':
        dataSetKey = 'compliance_walkthrough';
        break;
      case 'carbon-negotiation':
        dataSetKey = 'trading_desk_execution';
        break;
      case 'portfolio-analytics':
        dataSetKey = 'esg_impact_assessment';
        break;
      case 'executive-overview':
      default:
        dataSetKey = 'infrastructure_discovery';
        break;
    }

    const demoDataSet = DEMO_DATA_SETS[dataSetKey];
    if (demoDataSet) {
      setPrePopulatedData(demoDataSet);
    }
  }, [isActive, currentTour, prePopulatedData, setPrePopulatedData]);

  const getDemoData = (key: string, fallback?: any): any => {
    if (!isActive || !prePopulatedData) {
      return fallback;
    }

    // Navigate nested keys using dot notation
    const keys = key.split('.');
    let value = prePopulatedData as any;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback;
      }
    }

    return value ?? fallback;
  };

  const contextValue: DemoDataContextType = {
    isDemoActive: isActive,
    getDemoData,

    getInvestorProfile: () => {
      return isActive && prePopulatedData ? prePopulatedData.investorProfile : null;
    },

    getMarketData: () => {
      return isActive && prePopulatedData ? prePopulatedData.marketData : null;
    },

    getNegotiationHistory: () => {
      return isActive && prePopulatedData ? prePopulatedData.negotiationHistory : [];
    },

    getPortfolioData: () => {
      return isActive && prePopulatedData ? prePopulatedData.portfolioData : null;
    },

    getComplianceData: () => {
      return isActive && prePopulatedData ? prePopulatedData.complianceData : null;
    },

    getAnalyticsData: () => {
      return isActive && prePopulatedData ? prePopulatedData.analyticsData : null;
    }
  };

  return (
    <DemoDataContext.Provider value={contextValue}>
      {children}
    </DemoDataContext.Provider>
  );
}

// Hook for components to access demo data
export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }
  return context;
}

// Higher-order component to wrap existing components with demo data
export function withDemoData<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  dataMapping?: Record<string, string>
) {
  const DemoEnhancedComponent = (props: P) => {
    const { isDemoActive, getDemoData } = useDemoData();

    if (!isDemoActive || !dataMapping) {
      return <WrappedComponent {...props} />;
    }

    // Apply demo data mappings
    const enhancedProps = { ...props };
    Object.entries(dataMapping).forEach(([propKey, dataKey]) => {
      const demoValue = getDemoData(dataKey);
      if (demoValue !== undefined) {
        enhancedProps[propKey as keyof P] = demoValue;
      }
    });

    return <WrappedComponent {...enhancedProps} />;
  };

  DemoEnhancedComponent.displayName = `withDemoData(${WrappedComponent.displayName || WrappedComponent.name})`;
  return DemoEnhancedComponent;
}

// Utility hooks for specific demo data types
export function useDemoInvestorProfile() {
  const { getInvestorProfile } = useDemoData();
  return getInvestorProfile();
}

export function useDemoMarketData() {
  const { getMarketData } = useDemoData();
  return getMarketData();
}

export function useDemoNegotiationHistory() {
  const { getNegotiationHistory } = useDemoData();
  return getNegotiationHistory();
}

export function useDemoPortfolioData() {
  const { getPortfolioData } = useDemoData();
  return getPortfolioData();
}

export function useDemoComplianceData() {
  const { getComplianceData } = useDemoData();
  return getComplianceData();
}

export function useDemoAnalyticsData() {
  const { getAnalyticsData } = useDemoData();
  return getAnalyticsData();
}

// Demo-aware component wrapper for conditional rendering
interface DemoConditionalProps {
  children: React.ReactNode;
  showInDemo?: boolean;
  hideInDemo?: boolean;
  replaceInDemo?: React.ReactNode;
}

export function DemoConditional({
  children,
  showInDemo = true,
  hideInDemo = false,
  replaceInDemo
}: DemoConditionalProps) {
  const { isDemoActive } = useDemoData();

  if (isDemoActive) {
    if (hideInDemo) return null;
    if (replaceInDemo) return <>{replaceInDemo}</>;
    if (!showInDemo) return null;
  }

  return <>{children}</>;
}

// Demo highlight component for tour integration
interface DemoHighlightProps {
  children: React.ReactNode;
  demoId: string;
  className?: string;
}

export function DemoHighlight({ children, demoId, className = '' }: DemoHighlightProps) {
  const { isDemoActive } = useDemoData();

  return (
    <div
      className={`${isDemoActive ? 'demo-highlight-target' : ''} ${className}`}
      data-demo={demoId}
    >
      {children}
    </div>
  );
}

// Demo metrics component for showing current demo data
export function DemoMetricsDisplay() {
  const {
    isDemoActive,
    getInvestorProfile,
    getMarketData,
    getNegotiationHistory,
    getPortfolioData
  } = useDemoData();

  if (!isDemoActive) return null;

  const investorProfile = getInvestorProfile();
  const marketData = getMarketData();
  const negotiationHistory = getNegotiationHistory();
  const portfolioData = getPortfolioData();

  return (
    <div className="fixed bottom-16 left-4 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm z-30 max-h-64 overflow-y-auto">
      <div className="font-medium text-gray-900 mb-3">Demo Data Overview</div>

      {investorProfile && (
        <div className="mb-3">
          <div className="font-medium text-gray-700">Investor Profile</div>
          <div className="text-gray-600">
            {investorProfile.name} • {investorProfile.organisation}
          </div>
          <div className="text-gray-600">
            AUM: A${(investorProfile.aum / 1_000_000_000).toFixed(1)}B
          </div>
        </div>
      )}

      {marketData && (
        <div className="mb-3">
          <div className="font-medium text-gray-700">Market Data</div>
          <div className="text-gray-600">
            WREI Anchor: A${marketData.wreiPricingIndex?.anchorPrice}/tonne
          </div>
          <div className="text-gray-600">
            VCM Spot: A${marketData.wreiPricingIndex?.vcmSpotReference}/tonne
          </div>
        </div>
      )}

      {negotiationHistory.length > 0 && (
        <div className="mb-3">
          <div className="font-medium text-gray-700">Negotiation History</div>
          <div className="text-gray-600">
            {negotiationHistory.length} completed sessions
          </div>
          <div className="text-gray-600">
            Avg satisfaction: {(
              negotiationHistory.reduce((sum, n) => sum + n.satisfactionScore, 0) /
              negotiationHistory.length
            ).toFixed(1)}/5.0
          </div>
        </div>
      )}

      {portfolioData && (
        <div>
          <div className="font-medium text-gray-700">Portfolio Data</div>
          <div className="text-gray-600">
            Total AUM: A${(portfolioData.totalAUM / 1_000_000_000).toFixed(1)}B
          </div>
          {portfolioData.performanceMetrics && (
            <div className="text-gray-600">
              Annual Return: {(portfolioData.performanceMetrics.annualReturn * 100).toFixed(1)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DemoDataProvider;