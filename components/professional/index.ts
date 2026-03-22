/**
 * WREI Professional UI Components
 * Bloomberg Terminal-inspired institutional interface components
 * Version: 6.3.0
 */

export { BloombergLayout } from './BloombergLayout';
export { AccessibilityWrapper, announceToScreenReader, validateColorContrast } from './AccessibilityWrapper';
export {
  ProfessionalDataGrid,
  samplePortfolioData,
  samplePortfolioColumns
} from './ProfessionalDataGrid';

// Export types
export type { default as DataGridColumn } from './ProfessionalDataGrid';
export type { default as DataGridRow } from './ProfessionalDataGrid';

// Re-export design tokens for easy access
export { professionalTokens, useDesignTokens } from '../../design-system/tokens/professional-tokens';
export type { ProfessionalTokens } from '../../design-system/tokens/professional-tokens';