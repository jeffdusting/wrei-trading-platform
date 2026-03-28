'use client'

/**
 * Simple Demo Provider - Phase 3
 * Minimal React context wrapper for simplified demo functionality
 * Replaces the 322-line complex DemoDataProvider with 60-line simple version
 */

import { createContext, useContext, ReactNode } from 'react';
import { useSimpleDemoStore, SimpleDemoDataSet } from '@/lib/demo-mode/simple-demo-state';

// React Context interface
interface SimpleDemoContextType {
  isActive: boolean;
  demoData: any | null;
  selectedDataSet: SimpleDemoDataSet | null;
  activateDemo: (dataSet: SimpleDemoDataSet) => void;
  deactivateDemo: () => void;
}

// Create React context
const SimpleDemoContext = createContext<SimpleDemoContextType | undefined>(undefined);

// Provider component
export function SimpleDemoProvider({ children }: { children: ReactNode }) {
  const {
    isActive,
    demoData,
    selectedDataSet,
    activateDemo,
    deactivateDemo,
  } = useSimpleDemoStore();

  const contextValue: SimpleDemoContextType = {
    isActive,
    demoData,
    selectedDataSet,
    activateDemo,
    deactivateDemo,
  };

  return (
    <SimpleDemoContext.Provider value={contextValue}>
      {children}
    </SimpleDemoContext.Provider>
  );
}

// Custom hook to use the simple demo context
export function useSimpleDemoMode() {
  const context = useContext(SimpleDemoContext);

  if (context === undefined) {
    throw new Error('useSimpleDemoMode must be used within a SimpleDemoProvider');
  }

  return context;
}

// Helper hook for compatibility with existing components
export function useSimpleDemoData() {
  const { demoData } = useSimpleDemoMode();
  return demoData;
}

// Helper hook to check if demo is active (for conditional rendering)
export function useIsSimpleDemoActive() {
  const { isActive } = useSimpleDemoMode();
  return isActive;
}