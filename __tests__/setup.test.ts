/**
 * WREI Tokenization Project - Test Suite Setup
 *
 * Comprehensive regression testing for Phases 1-3.1:
 * - Phase 1: Dual Token Architecture
 * - Phase 2: Financial Modeling
 * - Phase 3.1: Institutional Personas
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('WREI Testing Framework Setup', () => {
  it('should have test environment properly configured', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  it('should be able to import core modules', () => {
    // This test ensures our module structure is intact
    expect(() => require('../lib/types')).not.toThrow();
    expect(() => require('../lib/personas')).not.toThrow();
    expect(() => require('../lib/negotiation-config')).not.toThrow();
  });
});