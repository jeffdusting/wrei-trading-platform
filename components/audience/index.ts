/**
 * WREI Trading Platform - Audience Components Index
 *
 * Step 1.2: Multi-Audience Interface System - Component Exports
 * Central export point for all audience-specific components
 *
 * Date: March 25, 2026
 */

// Main Router Component
export { default as MultiAudienceRouter } from './MultiAudienceRouter';

// Audience Selection
export { default as AudienceSelector } from './AudienceSelector';
export type { AudienceType } from './AudienceSelector';

// Audience-Specific Interfaces
export { default as ExecutiveDashboard } from './ExecutiveDashboard';
export { default as TechnicalInterface } from './TechnicalInterface';
export { default as CompliancePanel } from './CompliancePanel';

// Re-export audience types for external use
export type {
  AudienceType as DemoAudienceType
} from './AudienceSelector';