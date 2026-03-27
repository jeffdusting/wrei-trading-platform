/**
 * WREI Trading Platform - Tour Step Route Mapping
 *
 * Maps each tour step ID to the page route that should be displayed.
 * This enables automatic page navigation as users progress through tours.
 */

import type { DemoTourType } from './demo-state-manager';

/**
 * For each tour type, maps step IDs to the route the app should navigate to.
 */
export const TOUR_STEP_ROUTES: Record<DemoTourType, Record<string, string>> = {
  'executive-overview': {
    'landing-value-prop': '/',
    'market-context': '/',
    'ai-negotiation-preview': '/negotiate',
    'compliance-overview': '/compliance',
    'settlement-infrastructure': '/performance',
    'investment-case': '/',
  },

  'investor-deep-dive': {
    'institutional-onboarding': '/institutional/portal',
    'portfolio-configuration': '/institutional/portal',
    'full-negotiation': '/negotiate',
    'advanced-analytics': '/performance',
    'compliance-reporting': '/compliance',
    'integration-options': '/developer',
  },

  'technical-integration': {
    'api-explorer': '/developer',
    'blockchain-provenance': '/negotiate',
    'real-time-data': '/performance',
    'performance-monitoring': '/performance',
    'sdk-documentation': '/developer',
    'scalability-demo': '/performance',
  },

  'compliance-walkthrough': {
    'regulatory-mapping': '/compliance',
    'afsl-compliance': '/compliance',
    'kyc-aml-workflow': '/institutional/portal',
    'esg-reporting': '/compliance',
    'audit-trails': '/compliance',
    'risk-assessment': '/compliance',
  },

  'carbon-negotiation': {
    'market-context-setup': '/',
    'persona-selection': '/negotiate',
    'live-negotiation': '/negotiate',
    'pricing-analysis': '/negotiate',
    'settlement-demo': '/negotiate',
  },

  'portfolio-analytics': {
    'portfolio-overview': '/performance',
    'monte-carlo-modeling': '/performance',
    'esg-impact-measurement': '/performance',
    'competitive-analysis': '/performance',
    'risk-attribution': '/performance',
    'export-reporting': '/performance',
  },

  'nsw-esc-executive': {
    'value-proposition': '/',
    'market-overview': '/',
    'investment-case-esc': '/',
  },

  'nsw-esc-technical': {
    'technical-specifications': '/developer',
    'api-integration': '/developer',
    'cer-compliance-integration': '/compliance',
  },

  'nsw-esc-compliance': {
    'compliance-framework': '/compliance',
    'regulatory-requirements': '/compliance',
    'audit-reporting': '/compliance',
  },

  'northmore-gordon-overview': {
    'firm-introduction': '/',
    'service-offering': '/',
    'client-benefits': '/',
  },
};

export default TOUR_STEP_ROUTES;
