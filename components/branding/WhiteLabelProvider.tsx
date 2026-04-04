'use client'

// =============================================================================
// WREI Platform — White-Label Provider
//
// Context provider that applies CSS variable overrides from the active
// white-label configuration (WP4 §3). Wraps the application tree and injects
// custom properties that BloombergShell and other components consume.
// =============================================================================

import { createContext, useContext, FC, ReactNode, useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  WhiteLabelConfig,
  DEFAULT_BRANDING,
  WHITE_LABEL_REGISTRY,
} from '@/lib/config/white-label'

interface WhiteLabelContextValue {
  config: WhiteLabelConfig
  isWhiteLabelled: boolean
  /** Switch broker at runtime (for demo/preview purposes) */
  setBroker: (slug: string | null) => void
  activeBrokerSlug: string | null
}

const WhiteLabelContext = createContext<WhiteLabelContextValue>({
  config: DEFAULT_BRANDING,
  isWhiteLabelled: false,
  setBroker: () => {},
  activeBrokerSlug: null,
})

export const useWhiteLabel = () => useContext(WhiteLabelContext)

interface WhiteLabelProviderProps {
  children: ReactNode
  /** Initial broker slug — overrides env var */
  initialBroker?: string | null
}

export const WhiteLabelProvider: FC<WhiteLabelProviderProps> = ({
  children,
  initialBroker = null,
}) => {
  const searchParams = useSearchParams()
  const envBroker = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_WHITE_LABEL_BROKER ?? null
    : null

  const [brokerSlug, setBrokerSlug] = useState<string | null>(initialBroker ?? envBroker)

  // Sync broker from ?broker= URL parameter (enables live demo switching)
  useEffect(() => {
    const urlBroker = searchParams.get('broker')
    if (urlBroker !== null) {
      // ?broker= (empty) resets to default WREI branding
      setBrokerSlug(urlBroker || null)
    }
  }, [searchParams])

  const config = useMemo(() => {
    if (brokerSlug && WHITE_LABEL_REGISTRY[brokerSlug]) {
      return WHITE_LABEL_REGISTRY[brokerSlug]
    }
    return DEFAULT_BRANDING
  }, [brokerSlug])

  const isWhiteLabelled = brokerSlug !== null && WHITE_LABEL_REGISTRY[brokerSlug!] !== undefined

  const setBroker = (slug: string | null) => {
    setBrokerSlug(slug)
  }

  // CSS custom property overrides injected at the root level
  const cssVars = useMemo(() => ({
    '--wl-primary': config.primaryColour,
    '--wl-accent': config.accentColour,
    '--wl-primary-text': config.primaryTextColour,
  } as React.CSSProperties), [config])

  return (
    <WhiteLabelContext.Provider
      value={{ config, isWhiteLabelled, setBroker, activeBrokerSlug: brokerSlug }}
    >
      <div style={cssVars}>
        {children}
      </div>
    </WhiteLabelContext.Provider>
  )
}

export default WhiteLabelProvider
