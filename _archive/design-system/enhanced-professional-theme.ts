/**
 * Enhanced Professional Theme System
 *
 * Advanced Bloomberg Terminal-inspired design system for institutional
 * investor scenarios with sophisticated data visualization and professional
 * interface components.
 */

export interface EnhancedProfessionalTheme {
  // Typography enhancements
  typography: {
    fontFamily: {
      primary: string;
      mono: string;
      display: string;
    };
    fontWeights: {
      light: number;
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
      heavy: number;
    };
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
      loose: number;
    };
    letterSpacing: {
      tighter: string;
      tight: string;
      normal: string;
      wide: string;
      wider: string;
    };
  };

  // Enhanced color system
  colors: {
    // Core brand colors
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };

    // Professional terminal colors
    terminal: {
      background: string;
      backgroundSecondary: string;
      backgroundElevated: string;
      surface: string;
      surfaceHover: string;
      border: string;
      borderFocus: string;
      text: {
        primary: string;
        secondary: string;
        tertiary: string;
        disabled: string;
        inverse: string;
      };
    };

    // Financial data colors
    financial: {
      bullish: string;
      bearish: string;
      neutral: string;
      volume: string;
      bid: string;
      ask: string;
      spread: string;
    };

    // Status and alert colors
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
      pending: string;
    };

    // ESG and sustainability colors
    esg: {
      environmental: string;
      social: string;
      governance: string;
      impact: string;
      sustainable: string;
    };

    // Risk level colors
    risk: {
      veryLow: string;
      low: string;
      moderate: string;
      high: string;
      veryHigh: string;
    };

    // Institutional persona colors
    personas: {
      infrastructureFund: string;
      esgFund: string;
      defiFund: string;
      familyOffice: string;
      sovereignWealth: string;
      pensionFund: string;
    };
  };

  // Advanced spacing system
  spacing: {
    px: string;
    0: string;
    0.5: string;
    1: string;
    1.5: string;
    2: string;
    2.5: string;
    3: string;
    3.5: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
    14: string;
    16: string;
    20: string;
    24: string;
    28: string;
    32: string;
    36: string;
    40: string;
    44: string;
    48: string;
    52: string;
    56: string;
    60: string;
    64: string;
    72: string;
    80: string;
    96: string;
  };

  // Enhanced border radius
  borderRadius: {
    none: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };

  // Shadow system for depth
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
    focus: string;
  };

  // Animation and transitions
  transitions: {
    fast: string;
    normal: string;
    slow: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };

  // Professional chart colors
  charts: {
    primary: string[];
    secondary: string[];
    categorical: string[];
    sequential: string[];
    diverging: string[];
  };

  // Data visualization
  dataViz: {
    grid: string;
    axis: string;
    tick: string;
    label: string;
    tooltip: {
      background: string;
      border: string;
      text: string;
    };
  };

  // Interactive states
  interactive: {
    default: string;
    hover: string;
    active: string;
    focus: string;
    disabled: string;
  };

  // Professional breakpoints
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    terminal: string; // 1920px+ for Bloomberg Terminal style
    ultrawide: string; // 2560px+ for trading workstations
  };
}

export const enhancedProfessionalTheme: EnhancedProfessionalTheme = {
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Liberation Mono", monospace',
      display: '"Avenir Next", "Helvetica Neue", Arial, sans-serif'
    },
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      heavy: 800
    },
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem'  // 36px
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em'
    }
  },

  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },

    terminal: {
      background: '#0f1419',
      backgroundSecondary: '#1a1f2e',
      backgroundElevated: '#232937',
      surface: '#2d3748',
      surfaceHover: '#374151',
      border: '#4a5568',
      borderFocus: '#0ea5e9',
      text: {
        primary: '#ffffff',
        secondary: '#e2e8f0',
        tertiary: '#a0aec0',
        disabled: '#718096',
        inverse: '#1a202c'
      }
    },

    financial: {
      bullish: '#10b981',  // Green for gains
      bearish: '#ef4444',  // Red for losses
      neutral: '#6b7280',  // Gray for neutral
      volume: '#8b5cf6',   // Purple for volume
      bid: '#3b82f6',      // Blue for bid
      ask: '#f59e0b',      // Amber for ask
      spread: '#ec4899'    // Pink for spread
    },

    status: {
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7',
      pending: '#7c3aed'
    },

    esg: {
      environmental: '#059669',
      social: '#0284c7',
      governance: '#7c3aed',
      impact: '#ea580c',
      sustainable: '#16a34a'
    },

    risk: {
      veryLow: '#10b981',
      low: '#84cc16',
      moderate: '#f59e0b',
      high: '#f97316',
      veryHigh: '#ef4444'
    },

    personas: {
      infrastructureFund: '#0ea5e9',
      esgFund: '#059669',
      defiFund: '#8b5cf6',
      familyOffice: '#d97706',
      sovereignWealth: '#dc2626',
      pensionFund: '#7c3aed'
    }
  },

  spacing: {
    px: '1px',
    0: '0px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem'
  },

  borderRadius: {
    none: '0px',
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    focus: '0 0 0 3px rgba(14, 165, 233, 0.1)'
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  charts: {
    primary: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    secondary: ['#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#f472b6'],
    categorical: [
      '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
      '#06b6d4', '#84cc16', '#f97316', '#e11d48', '#7c3aed', '#db2777'
    ],
    sequential: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
    diverging: ['#dc2626', '#f87171', '#fca5a5', '#fecaca', '#fef2f2', '#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8', '#0ea5e9']
  },

  dataViz: {
    grid: '#374151',
    axis: '#6b7280',
    tick: '#9ca3af',
    label: '#d1d5db',
    tooltip: {
      background: '#1f2937',
      border: '#4b5563',
      text: '#ffffff'
    }
  },

  interactive: {
    default: '#f8fafc',
    hover: '#e2e8f0',
    active: '#cbd5e1',
    focus: '#0ea5e9',
    disabled: '#9ca3af'
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    terminal: '1920px',
    ultrawide: '2560px'
  }
};

/**
 * Enhanced Theme Utilities
 */
export class EnhancedThemeUtils {
  static getPersonaColor(persona: string, theme: EnhancedProfessionalTheme): string {
    const personaColorMap: { [key: string]: string } = {
      'infrastructure-fund': theme.colors.personas.infrastructureFund,
      'esg-fund': theme.colors.personas.esgFund,
      'defi-fund': theme.colors.personas.defiFund,
      'family-office': theme.colors.personas.familyOffice,
      'sovereign-wealth': theme.colors.personas.sovereignWealth,
      'pension-fund': theme.colors.personas.pensionFund
    };
    return personaColorMap[persona] || theme.colors.primary[500];
  }

  static getRiskColor(riskLevel: number, theme: EnhancedProfessionalTheme): string {
    if (riskLevel <= 2) return theme.colors.risk.veryLow;
    if (riskLevel <= 4) return theme.colors.risk.low;
    if (riskLevel <= 6) return theme.colors.risk.moderate;
    if (riskLevel <= 8) return theme.colors.risk.high;
    return theme.colors.risk.veryHigh;
  }

  static getComplexityColor(complexity: string, theme: EnhancedProfessionalTheme): string {
    switch (complexity.toLowerCase()) {
      case 'basic': return theme.colors.status.success;
      case 'intermediate': return theme.colors.status.info;
      case 'advanced': return theme.colors.status.warning;
      case 'expert': return theme.colors.status.error;
      default: return theme.colors.primary[500];
    }
  }

  static getFinancialTrendColor(value: number, previousValue: number, theme: EnhancedProfessionalTheme): string {
    if (value > previousValue) return theme.colors.financial.bullish;
    if (value < previousValue) return theme.colors.financial.bearish;
    return theme.colors.financial.neutral;
  }

  static createGradient(color1: string, color2: string, direction: string = 'to right'): string {
    return `linear-gradient(${direction}, ${color1}, ${color2})`;
  }

  static addOpacity(color: string, opacity: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  static createBoxShadow(theme: EnhancedProfessionalTheme, size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
    return theme.shadows[size];
  }

  static createHoverTransition(theme: EnhancedProfessionalTheme): string {
    return `all ${theme.transitions.fast}`;
  }
}

/**
 * Professional Component Styles
 */
export const professionalComponentStyles = {
  card: {
    base: (theme: EnhancedProfessionalTheme) => ({
      backgroundColor: theme.colors.terminal.surface,
      border: `1px solid ${theme.colors.terminal.border}`,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      transition: theme.transitions.normal,
      '&:hover': {
        backgroundColor: theme.colors.terminal.surfaceHover,
        borderColor: theme.colors.terminal.borderFocus,
        boxShadow: theme.shadows.lg
      }
    }),
    elevated: (theme: EnhancedProfessionalTheme) => ({
      backgroundColor: theme.colors.terminal.backgroundElevated,
      border: `1px solid ${theme.colors.terminal.border}`,
      borderRadius: theme.borderRadius.xl,
      boxShadow: theme.shadows.xl
    })
  },

  button: {
    primary: (theme: EnhancedProfessionalTheme) => ({
      backgroundColor: theme.colors.primary[600],
      color: theme.colors.terminal.text.inverse,
      border: 'none',
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      fontWeight: theme.typography.fontWeights.semibold,
      fontSize: theme.typography.fontSizes.sm,
      transition: theme.transitions.fast,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme.colors.primary[700],
        boxShadow: theme.shadows.focus
      },
      '&:active': {
        backgroundColor: theme.colors.primary[800]
      },
      '&:disabled': {
        backgroundColor: theme.colors.terminal.text.disabled,
        cursor: 'not-allowed'
      }
    }),
    secondary: (theme: EnhancedProfessionalTheme) => ({
      backgroundColor: 'transparent',
      color: theme.colors.terminal.text.primary,
      border: `1px solid ${theme.colors.terminal.border}`,
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      fontWeight: theme.typography.fontWeights.medium,
      fontSize: theme.typography.fontSizes.sm,
      transition: theme.transitions.fast,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme.colors.terminal.surface,
        borderColor: theme.colors.terminal.borderFocus
      }
    })
  },

  input: {
    base: (theme: EnhancedProfessionalTheme) => ({
      backgroundColor: theme.colors.terminal.background,
      border: `1px solid ${theme.colors.terminal.border}`,
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      color: theme.colors.terminal.text.primary,
      fontSize: theme.typography.fontSizes.sm,
      fontFamily: theme.typography.fontFamily.primary,
      transition: theme.transitions.fast,
      '&:focus': {
        outline: 'none',
        borderColor: theme.colors.terminal.borderFocus,
        boxShadow: theme.shadows.focus
      },
      '&::placeholder': {
        color: theme.colors.terminal.text.tertiary
      }
    })
  },

  dataGrid: {
    container: (theme: EnhancedProfessionalTheme) => ({
      backgroundColor: theme.colors.terminal.background,
      border: `1px solid ${theme.colors.terminal.border}`,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden'
    }),
    header: (theme: EnhancedProfessionalTheme) => ({
      backgroundColor: theme.colors.terminal.backgroundSecondary,
      borderBottom: `1px solid ${theme.colors.terminal.border}`,
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      color: theme.colors.terminal.text.secondary,
      fontSize: theme.typography.fontSizes.xs,
      fontWeight: theme.typography.fontWeights.semibold,
      letterSpacing: theme.typography.letterSpacing.wide,
      textTransform: 'uppercase' as const
    }),
    cell: (theme: EnhancedProfessionalTheme) => ({
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      borderBottom: `1px solid ${theme.colors.terminal.border}`,
      color: theme.colors.terminal.text.primary,
      fontSize: theme.typography.fontSizes.sm,
      '&:hover': {
        backgroundColor: theme.colors.terminal.surface
      }
    })
  }
};