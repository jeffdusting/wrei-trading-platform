/**
 * Simple Demo State Manager - Phase 1
 * Minimal replacement for complex demo-state-manager.ts
 * Provides basic toggle functionality with 3 data sets
 */

/**
 * Re-export canonical types and store from simple-demo-state.ts.
 * This file provides backward-compatible useDemoMode() for components
 * that still reference the old demo-state-manager API.
 */

export {
  useSimpleDemoStore,
  isSimpleDemoActive,
  getSimpleDemoData,
} from './simple-demo-state';

export type {
  SimpleDemoDataSet,
  SimpleDemoState,
  SimpleDemoActions,
  SimpleDemoStore,
} from './simple-demo-state';

import { useSimpleDemoStore } from './simple-demo-state';

// Compatibility export for components that haven't been updated yet
export const useDemoMode = () => {
  const store = useSimpleDemoStore();
  return {
    isActive: store.isActive,
    selectedDataSet: store.selectedDataSet,
    demoData: store.demoData,
    activateDemo: store.activateDemo,
    deactivateDemo: store.deactivateDemo,
    getDemoData: store.getDemoData,
    // Stub functions for removed functionality
    currentTour: null as string | null,
    presentationMode: null as string | null,
    tourStep: 0,
    prePopulatedData: null as any,
    showTourOverlay: false,
    loadESCMarketContext: () => {},
    configureNorthmoreGordonBranding: () => {},
    trackInteraction: (_interaction?: any) => {},
    startTour: (_tourId?: string) => {},
    endTour: () => {},
    nextStep: () => {},
    skipStep: () => {},
    getESCDemoData: () => ({}),
    getNorthmoreGordonContext: () => ({})
  };
};

// Type exports for compatibility
export type DemoTourType = string;
export const DEMO_TOURS: Record<string, { steps: { id: string }[] }> = {};
export interface DemoDataSet {
  investorProfile: Record<string, unknown>;
  marketData: Record<string, unknown>;
  negotiationHistory: Record<string, unknown>[];
  portfolioData: Record<string, unknown>;
  complianceData: Record<string, unknown>;
  analyticsData: Record<string, unknown>;
}