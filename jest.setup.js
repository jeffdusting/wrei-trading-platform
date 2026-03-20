/**
 * Jest Setup - WREI Tokenization Project Test Suite
 *
 * Global test setup and configuration for all test files
 */

// Extend Jest matchers for better testing
expect.extend({
  toBeValidAUM(received) {
    const pass = typeof received === 'number' && received >= 1_000_000_000; // A$1B+
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid institutional AUM`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid institutional AUM (>A$1B)`,
        pass: false,
      };
    }
  },

  toHaveValidWREIYield(received) {
    const pass = typeof received === 'number' && received >= 0.08 && received <= 0.30;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid WREI yield range`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be between 8% and 30% (WREI yield range)`,
        pass: false,
      };
    }
  },

  toContainInstitutionalTerms(received) {
    const institutionalTerms = [
      'AUM', 'IRR', 'NAV', 'yield', 'cash-on-cash', 'cross-collateral',
      'LTV', 'fiduciary', 'infrastructure', 'Asset Co', 'ESG'
    ];

    const foundTerms = institutionalTerms.filter(term =>
      received.toLowerCase().includes(term.toLowerCase())
    );

    const pass = foundTerms.length >= 3; // At least 3 institutional terms

    if (pass) {
      return {
        message: () => `expected text not to contain institutional terms, but found: ${foundTerms.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected text to contain at least 3 institutional terms, but found only: ${foundTerms.join(', ')}`,
        pass: false,
      };
    }
  }
});

// Global test constants
global.WREI_CONSTANTS = {
  CARBON_BASE_PRICE: 100,
  CARBON_EFFECTIVE_PRICE: 150,
  ASSET_CO_YIELD: 0.283,
  EQUITY_CAPITALIZATION: 131_000_000,
  TOTAL_CAPEX: 473_000_000,
  FLEET_VESSELS: 88,
  FLEET_DEEP_POWER: 22,
  TOKENIZED_RWA_MARKET: 19_000_000_000,
  PROJECTED_CARBON_MARKET_2030: 155_000_000_000,
};

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.ANTHROPIC_API_KEY = 'test-api-key-placeholder';

// Global test utilities
global.testUtils = {
  formatCurrency: (amount) => {
    if (amount >= 1_000_000_000) {
      return `A$${(amount / 1_000_000_000).toFixed(1)}B`;
    } else if (amount >= 1_000_000) {
      return `A$${(amount / 1_000_000).toFixed(1)}M`;
    } else if (amount >= 1_000) {
      return `A$${(amount / 1_000).toFixed(1)}K`;
    } else {
      return `A$${amount}`;
    }
  },

  calculateYield: (annualReturn, investment) => {
    return annualReturn / investment;
  },

  isInstitutionalScale: (amount) => {
    return amount >= 10_000_000; // A$10M+
  }
};

// Suppress console warnings during tests (except for errors)
const originalConsole = { ...console };
global.console = {
  ...console,
  warn: jest.fn(),
  log: jest.fn(),
  error: originalConsole.error, // Keep errors visible
};