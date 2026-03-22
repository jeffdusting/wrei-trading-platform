/**
 * WREI Professional Design System Tokens
 * Bloomberg Terminal-inspired institutional interface design
 * Version: 6.3.0
 */

export const professionalTokens = {
  colors: {
    // Primary institutional color scheme
    surface: {
      primary: '#0A0A0B',        // Bloomberg terminal black
      secondary: '#1A1A1B',      // Slightly lighter terminal background
      tertiary: '#2A2A2B',       // Panel backgrounds
      elevated: '#3A3A3B',       // Modal/dropdown backgrounds
      white: '#FFFFFF',          // Clean white for light mode
      lightGrey: '#F8F9FA',      // Light mode background
    },
    text: {
      primary: '#FFFFFF',        // Primary text on dark
      secondary: '#B0B0B0',      // Secondary text on dark
      tertiary: '#808080',       // Muted text
      inverse: '#1E293B',        // Dark text on light backgrounds
      inverseSecondary: '#64748B' // Secondary dark text
    },
    accent: {
      primary: '#FF6B1A',        // Bloomberg signature orange
      success: '#00C896',        // Success/profit green
      warning: '#FFB800',        // Warning amber
      danger: '#FF4757',         // Error/loss red
      info: '#0EA5E9',           // Information blue (WREI brand)
      neutral: '#6B7280'         // Neutral gray
    },
    market: {
      bullish: '#10B981',        // Green for positive movements
      bearish: '#EF4444',        // Red for negative movements
      neutral: '#64748B',        // Gray for neutral/unchanged
      volume: '#8B5CF6'          // Purple for volume indicators
    },
    status: {
      online: '#10B981',         // System online
      offline: '#EF4444',        // System offline
      warning: '#F59E0B',        // System warning
      maintenance: '#8B5CF6'     // System maintenance
    }
  },
  typography: {
    families: {
      // Bloomberg Terminal uses monospace for data consistency
      financial: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
      interface: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      brand: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    },
    sizes: {
      xs: '11px',    // Small labels, timestamps
      sm: '12px',    // Bloomberg standard data size
      md: '14px',    // Interface text
      lg: '16px',    // Headings, important text
      xl: '18px',    // Section headers
      '2xl': '24px', // Page titles
      '3xl': '32px'  // Hero text
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8
    }
  },
  spacing: {
    px: '1px',
    0: '0px',
    1: '4px',   // Tight spacing
    2: '8px',   // Component spacing
    3: '12px',
    4: '16px',  // Panel spacing
    5: '20px',
    6: '24px',  // Section spacing
    8: '32px',  // Large gaps
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px'
  },
  borderRadius: {
    none: '0px',
    sm: '2px',    // Subtle rounding
    md: '4px',    // Standard rounding
    lg: '8px',    // Panel rounding
    xl: '12px',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    terminal: '0 0 20px rgba(255, 107, 26, 0.1)' // Bloomberg orange glow
  },
  breakpoints: {
    sm: '640px',   // Small devices
    md: '768px',   // Tablets
    lg: '1024px',  // Laptops
    xl: '1280px',  // Desktop
    '2xl': '1536px', // Large desktop
    '3xl': '1920px', // Trading desk displays
    '4xl': '2560px'  // Ultra-wide displays
  }
} as const;

export type ProfessionalTokens = typeof professionalTokens;

// Utility function to get design tokens
export const useDesignTokens = (theme: 'institutional' | 'retail' = 'institutional') => {
  return {
    ...professionalTokens,
    // Theme-specific overrides
    colors: {
      ...professionalTokens.colors,
      surface: {
        ...professionalTokens.colors.surface,
        primary: theme === 'institutional'
          ? professionalTokens.colors.surface.primary
          : professionalTokens.colors.surface.white,
        secondary: theme === 'institutional'
          ? professionalTokens.colors.surface.secondary
          : professionalTokens.colors.surface.lightGrey
      },
      text: {
        ...professionalTokens.colors.text,
        primary: theme === 'institutional'
          ? professionalTokens.colors.text.primary
          : professionalTokens.colors.text.inverse,
        secondary: theme === 'institutional'
          ? professionalTokens.colors.text.secondary
          : professionalTokens.colors.text.inverseSecondary
      }
    }
  };
};