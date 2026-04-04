// =============================================================================
// WREI Platform — White-Label Configuration
//
// Defines branding overrides for ESC broker white-label deployments (WP4 §3).
// Each broker gets a configuration object that overrides WREI default branding
// in the BloombergShell, top bar, navigation, and command bar footer.
// =============================================================================

export interface WhiteLabelConfig {
  /** Broker business name displayed in top bar */
  businessName: string
  /** Short code displayed in the terminal identifier badge (2-3 chars) */
  terminalCode: string
  /** URL to broker logo (SVG or PNG, max 120×32px) */
  logoUrl: string | null
  /** Primary brand colour — top bar background, active nav highlight */
  primaryColour: string
  /** Accent colour — badges, buttons, status indicators */
  accentColour: string
  /** Text colour on primary background */
  primaryTextColour: string
  /** Contact email shown in command bar footer */
  contactEmail: string
  /** Contact phone number shown in command bar footer */
  contactPhone: string | null
  /** Footer compliance text override */
  footerText: string
  /** Whether to show "Powered by WREI" attribution */
  showAttribution: boolean
}

/** Default WREI branding — used when no white-label config is active */
export const DEFAULT_BRANDING: WhiteLabelConfig = {
  businessName: 'WREI PLATFORM',
  terminalCode: 'WR',
  logoUrl: null,
  primaryColour: '#1A1A1B',
  accentColour: '#0EA5E9',
  primaryTextColour: '#FFFFFF',
  contactEmail: 'platform@wrei.com.au',
  contactPhone: null,
  footerText: '© 2026 WREI Platform | Institutional-grade carbon credit tokenisation',
  showAttribution: false,
}

// ---------------------------------------------------------------------------
// Sample Broker Configurations
// ---------------------------------------------------------------------------

/** Demand Manager — NSW ESC broker white-label example */
export const DEMAND_MANAGER_BRANDING: WhiteLabelConfig = {
  businessName: 'DEMAND MANAGER',
  terminalCode: 'DM',
  logoUrl: null, // Placeholder — broker provides logo at onboarding
  primaryColour: '#1B3A5C',
  accentColour: '#2ECC71',
  primaryTextColour: '#FFFFFF',
  contactEmail: 'trading@demandmanager.com.au',
  contactPhone: null,
  footerText: '© 2026 Demand Manager Pty Ltd | ESC Trading Platform',
  showAttribution: true,
}

/** Northmore Gordon — Sydney ESC/VEEC/LGC/STC/ACCU broker */
export const NORTHMORE_GORDON_BRANDING: WhiteLabelConfig = {
  businessName: 'NORTHMORE GORDON',
  terminalCode: 'NG',
  logoUrl: null, // Placeholder — broker provides logo at onboarding
  primaryColour: '#2D6A4F',
  accentColour: '#333333',
  primaryTextColour: '#FFFFFF',
  contactEmail: 'info@northmoregordon.com',
  contactPhone: '1300 854 561',
  footerText: '© 2026 Northmore Gordon | Certificate Trading Platform',
  showAttribution: true,
}

/** Registry of available white-label configs keyed by broker slug */
export const WHITE_LABEL_REGISTRY: Record<string, WhiteLabelConfig> = {
  'demand-manager': DEMAND_MANAGER_BRANDING,
  'dm': DEMAND_MANAGER_BRANDING,
  'northmore-gordon': NORTHMORE_GORDON_BRANDING,
  'nmg': NORTHMORE_GORDON_BRANDING,
}

/**
 * Resolve the active white-label config.
 * Checks NEXT_PUBLIC_WHITE_LABEL_BROKER env var, falls back to default WREI branding.
 * Supports short slugs (e.g. 'nmg') and full slugs (e.g. 'northmore-gordon').
 */
export function getWhiteLabelConfig(): WhiteLabelConfig {
  if (typeof window !== 'undefined') {
    const broker = process.env.NEXT_PUBLIC_WHITE_LABEL_BROKER
    if (broker && WHITE_LABEL_REGISTRY[broker]) {
      return WHITE_LABEL_REGISTRY[broker]
    }
  }
  return DEFAULT_BRANDING
}
