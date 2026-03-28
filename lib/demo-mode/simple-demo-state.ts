/**
 * Simple Demo State Manager - Phase 1
 * Minimal replacement for complex demo-state-manager.ts
 * Provides basic toggle functionality with 3 data sets
 */

import { create } from 'zustand';

export type SimpleDemoDataSet = 'institutional' | 'retail' | 'compliance';

export interface SimpleDemoState {
  isActive: boolean;
  selectedDataSet: SimpleDemoDataSet | null;
  demoData: any | null;
}

export interface SimpleDemoActions {
  activateDemo: (dataSet: SimpleDemoDataSet) => void;
  deactivateDemo: () => void;
  getDemoData: () => any | null;
}

export type SimpleDemoStore = SimpleDemoState & SimpleDemoActions;

export const useSimpleDemoStore = create<SimpleDemoStore>((set, get) => ({
  // State
  isActive: false,
  selectedDataSet: null,
  demoData: null,

  // Actions
  activateDemo: (dataSet: SimpleDemoDataSet) => {
    const { getDemoDataForSet } = require('./demo-data-simple');
    const data = getDemoDataForSet(dataSet);

    set({
      isActive: true,
      selectedDataSet: dataSet,
      demoData: data
    });
  },

  deactivateDemo: () => {
    set({
      isActive: false,
      selectedDataSet: null,
      demoData: null
    });
  },

  getDemoData: () => {
    return get().demoData;
  },
}));

// Helper to check if demo mode is active (for compatibility)
export const isSimpleDemoActive = () => {
  return useSimpleDemoStore.getState().isActive;
};

// Helper to get current demo data (for compatibility)
export const getSimpleDemoData = () => {
  return useSimpleDemoStore.getState().demoData;
};