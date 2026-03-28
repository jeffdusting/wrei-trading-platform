/**
 * WREI Trading Platform - Simple Demo State Manager Tests
 *
 * Unit tests for simplified demo system functionality
 * Testing basic demo state management and data set selection
 *
 * Date: March 28, 2026 (Updated for Phase 5)
 */

import { useSimpleDemoStore } from '../lib/demo-mode/simple-demo-state';

describe('Simple Demo State Manager', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useSimpleDemoStore.getState();
    store.deactivateDemo();
  });

  describe('Demo State Management', () => {
    test('should initialize with inactive state', () => {
      const state = useSimpleDemoStore.getState();

      expect(state.isActive).toBe(false);
      expect(state.selectedDataSet).toBeNull();
      expect(state.demoData).toBeNull();
    });

    test('should activate demo with institutional data set', () => {
      const store = useSimpleDemoStore.getState();

      store.activateDemo('institutional');
      const state = useSimpleDemoStore.getState();

      expect(state.isActive).toBe(true);
      expect(state.selectedDataSet).toBe('institutional');
      expect(state.demoData).toBeDefined();
    });

    test('should activate demo with retail data set', () => {
      const store = useSimpleDemoStore.getState();

      store.activateDemo('retail');
      const state = useSimpleDemoStore.getState();

      expect(state.isActive).toBe(true);
      expect(state.selectedDataSet).toBe('retail');
      expect(state.demoData).toBeDefined();
    });

    test('should activate demo with compliance data set', () => {
      const store = useSimpleDemoStore.getState();

      store.activateDemo('compliance');
      const state = useSimpleDemoStore.getState();

      expect(state.isActive).toBe(true);
      expect(state.selectedDataSet).toBe('compliance');
      expect(state.demoData).toBeDefined();
    });

    test('should deactivate demo and clear state', () => {
      const store = useSimpleDemoStore.getState();

      // First activate
      store.activateDemo('institutional');
      expect(useSimpleDemoStore.getState().isActive).toBe(true);

      // Then deactivate
      store.deactivateDemo();
      const state = useSimpleDemoStore.getState();

      expect(state.isActive).toBe(false);
      expect(state.selectedDataSet).toBeNull();
      expect(state.demoData).toBeNull();
    });

    test('should provide demo data when active', () => {
      const store = useSimpleDemoStore.getState();

      store.activateDemo('institutional');
      const demoData = store.getDemoData();

      expect(demoData).toBeDefined();
      expect(demoData.persona).toBeDefined();
      expect(demoData.marketData).toBeDefined();
    });

    test('should return null demo data when inactive', () => {
      const store = useSimpleDemoStore.getState();
      const demoData = store.getDemoData();

      expect(demoData).toBeNull();
    });
  });
});